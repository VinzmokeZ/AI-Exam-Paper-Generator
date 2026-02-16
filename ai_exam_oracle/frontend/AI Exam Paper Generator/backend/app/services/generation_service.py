import os
from openai import OpenAI
import json
from .rag_service import rag_service

class GenerationService:
    def __init__(self):
        # Default local config
        self.local_client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
        self.local_model = "phi3:mini"
        
        # Cloud config (Defaults to environment variables)
        self.cloud_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "missing_key"))
        self.cloud_model = os.getenv("OPENAI_MODEL", "gpt-4o")
        
        self.cache_dir = "backend_cache"
        os.makedirs(self.cache_dir, exist_ok=True)

    def _get_cache_key(self, subject, topic, level, rubric=None):
        import hashlib
        key_str = f"{subject}_{topic}_{level}".lower().replace(" ", "")
        if rubric:
            key_str += str(rubric)
        return hashlib.md5(key_str.encode()).hexdigest()

    def generate_questions(self, subject_name, topic_name, blooms_level, subject_id=None, count=5, rubric=None, engine="local"):
        # Check Cache First for Speed
        cache_key = self._get_cache_key(subject_name, topic_name, blooms_level, rubric)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        if os.path.exists(cache_file):
            print(f"[CACHE] Hit for {topic_name}. Returning instantly.")
            with open(cache_file, "r") as f:
                return json.load(f)

        # Use subject_id for RAG context if provided, otherwise fallback to name
        query_id = subject_id if subject_id else subject_name.lower().replace(" ", "")
        context = rag_service.query_context(f"Questions about {topic_name}", subject_id=query_id)
        
        # PROMPT CONSTRUCTION
        if rubric:
            structure_prompt = f"""
            STRICT STRUCTURE REQUIRED:
            - {rubric.get('mcqCount', 0)} Multiple Choice Questions (MCQ).
            - {rubric.get('shortCount', 0)} Short Answer Questions.
            - {rubric.get('essayCount', 0)} Essay Questions.
            """
        else:
            structure_prompt = f"Generate {count} high-quality exam questions."

        prompt = f"""
        Role: Expert Exam Creator.
        Task: {structure_prompt}
        Context: {chr(10).join(context)}
        
        Details:
        - Subject: {subject_name}
        - Topic: {topic_name}
        - Bloom's Level: {blooms_level}
        
        CRITICAL INSTRUCTIONS:
        1. Respond ONLY with a valid JSON array.
        2. DO NOT include any introductory or concluding text.
        3. Ensure the JSON is completely valid and closed properly.
        4. Use "phi3" compatible formatting (no markdown blocks around JSON if possible).
        
        JSON Structure Example:
        [
          {{
            "question": "Question text here?",
            "question_type": "MCQ", 
            "options": ["A. Opt1", "B. Opt2", "C. Opt3", "D. Opt4"],
            "correct_answer": "A.",
            "explanation": "Brief explanation.",
            "marks": 5,
            "bloom_level": "{blooms_level}",
            "course_outcome": "CO1"
          }}
        ]
        """
        
        # Select Client-Based on Engine
        client = self.cloud_client if engine == "cloud" else self.local_client
        model = self.cloud_model if engine == "cloud" else self.local_model
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"[GEN] Attempt {attempt + 1}/{max_retries} for {topic_name} using {engine} ({model})...")
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a JSON-only API. You must return RAW JSON. No markdown formatting."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1, 
                    max_tokens=4000, # Increased to prevent cutoff
                    timeout=600.0,   # Increased timeout
                    response_format={"type": "json_object"} if attempt > 0 else None # Try forcing JSON on retry
                )
                content = response.choices[0].message.content
                if not content:
                    raise ValueError("Empty response from AI model")

                # Robust JSON Extraction
                # Robust JSON Extraction
                import re
                content = content.strip()
                
                # Try to find JSON array
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    content = json_match.group(0)
                else:
                    # Look for markdown code blocks
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0].strip()
                    elif "```" in content:
                        content = content.split("```")[1].split("```")[0].strip()

                # Cleanup common JSON errors from LLMs
                content = re.sub(r',\s*\]', ']', content) # Remove trailing comma before closing bracket
                
                # Fix truncated JSON (simple heuristic)
                if content.startswith('[') and not content.endswith(']'):
                    # Remove incomplete object at the end
                    content = re.sub(r',[^}]*$', '', content)
                    content += ']'

                try:
                    data = json.loads(content)
                    if isinstance(data, list) and len(data) > 0:
                        # Success! Save to Cache
                        with open(cache_file, "w") as f:
                            json.dump(data, f)
                        return data
                    elif isinstance(data, dict) and "questions" in data:
                        data = data["questions"]
                        with open(cache_file, "w") as f:
                            json.dump(data, f)
                        return data
                except json.JSONDecodeError:
                    # Last resort: Regex extract individual objects
                    print("[GEN] Standard parse failed, attempting regex extraction...")
                    question_matches = re.findall(r'\{[^{}]*"question"[^{}]*\}', content, re.DOTALL)
                    if not question_matches:
                         # Try deeper recursion for nested braces? 
                         # Simple approach: split by }, {
                         pass
                    
                    if question_matches:
                        repaired_data = []
                        for qm in question_matches:
                            try:
                                repaired_data.append(json.loads(qm))
                            except:
                                pass
                        
                        if repaired_data:
                            print(f"[GEN] Recovered {len(repaired_data)} questions via regex")
                            return repaired_data

                    if attempt == max_retries - 1:
                        raise # Rethrow on last attempt
                    print(f"[GEN] JSON Parse failed, retrying...")
                    continue

            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                print(f"Generation error on attempt {attempt + 1}: {e}")
                if attempt == max_retries - 1:
                    with open("generation_errors.log", "a") as f:
                        f.write(f"\n[ERROR] {e}\n{error_trace}\n")
                
        # Fallback if all retries fail
        return [
            {
                "question": f"Sample question about {topic_name} at {blooms_level} level?",
                "options": ["Op1", "Op2", "Op3", "Op4"],
                "correct_answer": "Op1",
                "explanation": "This is a fallback placeholder due to generation timeout or error.",
                "marks": 5,
                "bloom_level": blooms_level,
                "course_outcome": "CO1"
            }
        ]

    def generate_from_rubric(self, rubric_id, db):
        """
        Generate exam questions based on rubric constraints
        Distributes questions across learning outcomes and question types
        Returns dict with generation progress and results
        """
        from ..models import Rubric, Subject, Topic, Question, RubricQuestionDistribution, RubricLODistribution
        from ..services.rubric_service import build_generation_prompt, calculate_lo_question_distribution
        from ..services.llm_service import generate_questions as llm_generate
        
        # Get rubric
        rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
        if not rubric:
            raise ValueError(f"Rubric {rubric_id} not found")
        
        # Get subject and topics
        subject = db.query(Subject).filter(Subject.id == rubric.subject_id).first()
        topics = db.query(Topic).filter(Topic.subject_id == rubric.subject_id).limit(5).all()
        topic_names = [t.name for t in topics]
        
        # Build base prompt
        base_prompt = build_generation_prompt(rubric, subject.name, topic_names, db)
        
        # Get question distributions
        question_dists = db.query(RubricQuestionDistribution).filter(
            RubricQuestionDistribution.rubric_id == rubric_id
        ).all()
        
        # Calculate LO distribution
        lo_question_counts = calculate_lo_question_distribution(rubric_id, db)
        
        # Track generated questions
        all_questions = []
        generation_log = {
            "rubric_id": rubric_id,
            "subject": subject.name,
            "topics": topic_names,
            "progress": [],
            "total_questions": sum(qd.count for qd in question_dists),
            "questions_generated": 0
        }
        
        # Generate questions for each type
        for qd in question_dists:
            if qd.count == 0:
                continue
            
            question_type = qd.question_type
            marks_each = qd.marks_each
            count = qd.count
            
            generation_log["progress"].append({
                "stage": f"Generating {count} {question_type} questions",
                "status": "in_progress"
            })
            
            # Distribute this question type across LOs proportionally
            lo_counts_for_type = {}
            remaining = count
            
            # Use a more robust distribution to avoid zero counts due to rounding
            # First, filter LOs that have some distribution
            active_los = [lo for lo, tc in lo_question_counts.items() if tc > 0]
            if not active_los and lo_question_counts:
                active_los = [list(lo_question_counts.keys())[0]] # Fallback to first

            if active_los:
                for lo in active_los[:-1]: # All but last
                    total_lo_count = lo_question_counts[lo]
                    proportion = total_lo_count / generation_log["total_questions"]
                    lo_count = round(count * proportion)
                    lo_counts_for_type[lo] = min(lo_count, remaining)
                    remaining -= lo_counts_for_type[lo]
                
                # Last active LO gets all remaining for this type
                lo_counts_for_type[active_los[-1]] = remaining
            
            # Generate questions for each LO
            
            # Generate questions for each LO
            for lo, lo_count in lo_counts_for_type.items():
                if lo_count == 0:
                    continue
                
                # Generate using LLM
                llm_questions = llm_generate(
                    prompt=base_prompt,
                    count=lo_count,
                    question_type=question_type,
                    learning_outcome=lo
                )
                
                # Save to database
                for q in llm_questions:
                    # Pick a random topic for this question
                    import random
                    topic = random.choice(topics) if topics else None
                    
                    db_question = Question(
                        topic_id=topic.id if topic else None,
                        rubric_id=rubric_id,
                        question_text=q.get('question_text') or q.get('question', ''),
                        question_type=question_type or q.get('type') or 'MCQ',
                        options=q.get('options'),
                        correct_answer=q.get('correct_answer', ''),
                        explanation=q.get('explanation', ''),
                        marks=marks_each,
                        bloom_level=q.get('bloom_level', 'Apply'),
                        course_outcome=q.get('course_outcome', 'CO1'),
                        learning_outcome=lo,
                        status='draft'
                    )
                    db.add(db_question)
                    all_questions.append(db_question)
                
                generation_log["questions_generated"] += lo_count
            
            generation_log["progress"][-1]["status"] = "completed"
            db.commit()
        
        generation_log["progress"].append({
            "stage": "Generation complete",
            "status": "completed"
        })
        
        return {
            "success": True,
            "questions_generated": generation_log["questions_generated"],
            "log": generation_log,
            "questions": all_questions
        }

generation_service = GenerationService()
