import os
from openai import OpenAI
import json
from .rag_service import get_rag_service
class GenerationService:
    def __init__(self):
        # Default local config
        self.local_client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
        self.local_model = "phi3:mini"
        
        # Cloud config with Multi-Provider Support (OpenAI / Gemini)
        openai_key = os.getenv("OPENAI_API_KEY")
        gemini_key = os.getenv("GOOGLE_API_KEY")
        
        if openai_key and len(openai_key) > 5:
            self.provider = "openai"
            self.cloud_client = OpenAI(
                api_key=openai_key,
                base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
            )
            self.cloud_model = os.getenv("OPENAI_MODEL", "gpt-4o")
        elif gemini_key and len(gemini_key) > 5:
            self.provider = "gemini"
            # Gemini OpenAI-Compatible Endpoint
            self.cloud_client = OpenAI(
                api_key=gemini_key,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
            )
            # Default to gemini-1.5-flash for maximum speed unless overridden
            self.cloud_model = os.getenv("OPENAI_MODEL", "gemini-1.5-flash")
        else:
            self.provider = "none"
            self.cloud_client = OpenAI(api_key="missing_key")
            self.cloud_model = "gpt-4o"
        
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
        
        # Get RAG Service (Lazy)
        rag_service = get_rag_service()
        context = rag_service.query_context(f"Questions about {topic_name}", subject_id=query_id)
        
    def _generate_questions_core(self, context_text, subject_name, topic_name, blooms_level, count, rubric, engine):
        """
        Shared core logic for generating questions from a given context text.
        """
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
        Role: Senior Academic Expert.
        Subject: {subject_name}
        Topic: {topic_name}
        Bloom's Level: {blooms_level}
        Constraints: {structure_prompt}
        
        OUTPUT FORMAT (JSON ARRAY ONLY):
        [
          {{
            "question": "Question text?",
            "question_type": "MCQ",
            "options": ["A. Choice 1", "B. Choice 2", "C. Choice 3", "D. Choice 4"],
            "correct_answer": "A",
            "explanation": "Logic for the answer.",
            "marks": 5,
            "bloom_level": "{blooms_level}",
            "courseOutcomes": {{ "co1": 1, "co2": 3, "co3": 2, "co4": 1, "co5": 1 }}
          }}
        ]
        
        CO MAPPING (1-3): co1:Analyze, co2:Knowledge, co3:Apply, co4:Evaluate, co5:Create.
        
        Context for generation:
        {context_text}
        """
        
        self.is_render = os.getenv("RENDER") == "true"
        
        # Select Client-Based on Engine with Auto-Fallback
        is_cloud = engine in ["cloud", "openai", "gemini"]
        
        # Override: If we are on Render, "local" engine must switch to cloud (no Ollama on Render)
        if self.is_render and not is_cloud:
            print("[GEN] Detected Render environment. Overriding 'local' engine to 'cloud'.")
            is_cloud = True

        client = self.cloud_client if is_cloud else self.local_client
        model = self.cloud_model if is_cloud else self.local_model
        provider_name = self.provider if is_cloud else "Local (Ollama)"
        
        # Final Guard: If we want cloud but keys are missing, we might fail
        if is_cloud and self.provider == "none":
            print("[GEN] ERROR: Cloud engine requested but no API keys found.")

        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Extra Guard: verify local client is actually alive if NOT in cloud mode
                if not is_cloud and attempt == 0:
                    try:
                        import requests
                        requests.get("http://localhost:11434/api/tags", timeout=2)
                    except:
                        print("[GEN] Ollama unreachable. Falling back to Cloud...")
                        is_cloud = True
                        client = self.cloud_client
                        model = self.cloud_model
                        provider_name = self.provider

                print(f"[GEN] Attempt {attempt + 1}/{max_retries} for {topic_name[:30]} using {provider_name} ({model})...")
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a JSON-only API. You must return RAW JSON. No markdown formatting."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1, 
                    max_tokens=4000, 
                    timeout=600.0,
                    response_format={"type": "json_object"} if attempt > 0 else None
                )
                content = response.choices[0].message.content
                if not content:
                    raise ValueError("Empty response from AI model")

                # Robust JSON Extraction
                import re
                content = content.strip()
                
                # Try to find JSON array
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    content = json_match.group(0)
                else:
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0].strip()
                    elif "```" in content:
                        content = content.split("```")[1].split("```")[0].strip()

                content = re.sub(r',\s*\]', ']', content)
                
                if content.startswith('[') and not content.endswith(']'):
                    content = re.sub(r',[^}]*$', '', content)
                    content += ']'

                try:
                    data = json.loads(content)
                    if isinstance(data, list) and len(data) > 0:
                        return data
                    elif isinstance(data, dict) and "questions" in data:
                        return data["questions"]
                except json.JSONDecodeError:
                    print("[GEN] Standard parse failed, attempting regex extraction...")
                    question_matches = re.findall(r'\{[^{}]*"question"[^{}]*\}', content, re.DOTALL)
                    if question_matches:
                        repaired_data = []
                        for qm in question_matches:
                            try:
                                repaired_data.append(json.loads(qm))
                            except:
                                pass
                        if repaired_data:
                            return repaired_data

                    if attempt == max_retries - 1:
                        raise 
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

    def generate_questions(self, subject_name, topic_name, blooms_level, count=5, subject_id=None, rubric=None, engine="local"):
        # Check Cache First for Speed
        cache_key = self._get_cache_key(subject_name, topic_name, blooms_level, rubric)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        if os.path.exists(cache_file):
            print(f"[CACHE] Hit for {topic_name}. Returning instantly.")
            with open(cache_file, "r") as f:
                return json.load(f)

        # Use subject_id for RAG context if provided, otherwise fallback to name
        query_id = subject_id if subject_id else subject_name.lower().replace(" ", "")
        
        # Optimize: Skip RAG for 'General' subject OR if Input is a long prompt (Ask AI Box)
        # Long inputs (>40 chars) are usually full questions/prompts, not simple topics.
        is_full_prompt = len(topic_name) > 40
        
        if subject_name.lower() == "general" or is_full_prompt:
            print(f"[GEN] Skipping RAG (Subject: {subject_name}, Prompt: {is_full_prompt}). Using input directly for speed.")
            context_text = f"User Prompt: {topic_name}" 
        else:
            # Get RAG Service (Lazy)
            try:
                rag_service = get_rag_service()
                context_list = rag_service.query_context(f"Questions about {topic_name}", subject_id=query_id)
                context_text = chr(10).join(context_list)
            except Exception as e:
                print(f"[RAG] Warning: RAG failed {e}. Proceeding with prompt only.")
                context_text = f"Topic: {topic_name}"
        
        
        # Generate using shared core logic
        result = self._generate_questions_core(context_text, subject_name, topic_name, blooms_level, count, rubric, engine)
        
        # Cache result
        with open(cache_file, "w") as f:
            json.dump(result, f)
            
        return result

    def generate_questions_from_text(self, context_text, subject_name, topic_name, count=5, complexity="Balanced", engine="local"):
        """
        Generate questions directly from provided text (file content), skipping RAG lookup.
        """
        return self._generate_questions_core(
            context_text=context_text,
            subject_name=subject_name,
            topic_name=topic_name,
            blooms_level=complexity,
            count=count,
            rubric=None,
            engine=engine
        )

    def generate_from_rubric(self, rubric_id, db, engine="local"):
        """
        Generate exam questions based on rubric constraints using PARALLEL EXECUTION
        Distributes questions across learning outcomes and question types
        Returns dict with generation progress and results
        """
        from ..models import Rubric, Subject, Topic, Question, RubricQuestionDistribution, RubricLODistribution
        from ..services.rubric_service import build_generation_prompt, calculate_lo_question_distribution
        # Import self to access methods if needed, but we use self.generate_questions logic
        import concurrent.futures
        
        # Get rubric
        rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
        if not rubric:
            raise ValueError(f"Rubric {rubric_id} not found")
        
        # Get subject and topics
        subject = db.query(Subject).filter(Subject.id == rubric.subject_id).first()
        topics = db.query(Topic).filter(Topic.subject_id == rubric.subject_id).limit(5).all()
        topic_names = [t.name for t in topics]
        
        # Get RAG context (Heavy operation, do once)
        from ..services.rag_service import get_rag_service
        rag_service = get_rag_service()
        context = rag_service.query_context(f"General concepts for {subject.name}", subject_id=subject.id)
        
        # Build base prompt
        base_prompt = build_generation_prompt(rubric, subject.name, topic_names, db, context=context)
        
        # Get distributions
        question_dists = db.query(RubricQuestionDistribution).filter(
            RubricQuestionDistribution.rubric_id == rubric_id
        ).all()
        
        lo_question_counts = calculate_lo_question_distribution(rubric_id, db)
        
        # Prepare Generation Tasks
        generation_tasks = []
        
        # Logic to split total LO counts into specific (Type, LO, Count) tasks
        # We need to distribute the 'lo_question_counts' (e.g. LO1: 5 total) across the available types (MCQ, Essay, etc.)
        
        # 1. Total questions needed per type
        type_counts = {qd.question_type: qd.count for qd in question_dists if qd.count > 0}
        
        # 2. Total questions needed per LO
        lo_counts = lo_question_counts.copy() # e.g. {'LO1': 5, 'LO2': 5}
        
        # 3. Distribute gracefully
        # Simple algorithm: Iterate through types, and grab needed counts from available LOs
        
        final_tasks = [] # List of (question_type, lo, count)
        
        active_los = list(lo_counts.keys())
        lo_idx = 0
        
        for q_type, q_count in type_counts.items():
            remaining_for_type = q_count
            
            while remaining_for_type > 0 and active_los:
                current_lo = active_los[lo_idx % len(active_los)]
                available_in_lo = lo_counts[current_lo]
                
                if available_in_lo > 0:
                    # Take up to remaining_for_type, but not more than available_in_lo
                    # Also try to batch reasonable chunks (e.g. don't do 1 if we can do 3)
                    take = min(available_in_lo, remaining_for_type)
                    
                    final_tasks.append({
                        "question_type": q_type,
                        "learning_outcome": current_lo,
                        "count": take,
                        "marks": next(q.marks_each for q in question_dists if q.question_type == q_type)
                    })
                    
                    lo_counts[current_lo] -= take
                    remaining_for_type -= take
                
                lo_idx += 1
                
                # Check if we exhausted all LOs (safety break)
                if sum(lo_counts.values()) == 0 and remaining_for_type > 0:
                    # Just dump remaining into first LO
                    final_tasks.append({
                        "question_type": q_type,
                        "learning_outcome": active_los[0],
                        "count": remaining_for_type,
                        "marks": next(q.marks_each for q in question_dists if q.question_type == q_type)
                    })
                    break
        
        print(f"[GEN] Prepared {len(final_tasks)} parallel tasks: {final_tasks}")

        # Execute Parallel Generation
        all_questions = []
        generation_log = {
            "rubric_id": rubric_id,
            "subject": subject.name,
            "total_questions": sum(type_counts.values()),
            "questions_generated": 0,
            "progress": []
        }

        # Helper function for the thread pool
        def execute_task(task):
            try:
                print(f"[THREAD] Starting {task['count']} {task['question_type']} for {task['learning_outcome']} using {engine}")
                return self.generate_questions(
                    subject_name=subject.name,
                    topic_name=f"{task['learning_outcome']} - {subject.name}", # Contextual topic
                    blooms_level="Apply", # Default, or derive from LO?
                    count=task['count'],
                    rubric=None, # Already applying rubric constraints via task
                    engine=engine
                ), task
            except Exception as e:
                print(f"[THREAD] Error: {e}")
                return [], task

        # Run with ThreadPool
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_task = {executor.submit(execute_task, task): task for task in final_tasks}
            
            for future in concurrent.futures.as_completed(future_to_task):
                generated_qs, task = future.result()
                
                # Process and Save results immediately to DB? 
                # Better to collect all, then save batch to avoid DB Locking issues (SQLite)
                
                for q in generated_qs:
                    import random
                    topic = random.choice(topics) if topics else None
                    
                    # Convert to DB Object (but don't add to session yet to avoid concurrency issues)
                    # We will add them all at once at the end
                    q_obj = {
                         "topic_id": topic.id if topic else None,
                         "rubric_id": rubric_id,
                         "question_text": q.get('question_text') or q.get('question', ''),
                         "question_type": task['question_type'],
                         "options": q.get('options'),
                         "correct_answer": q.get('correct_answer', ''),
                         "explanation": q.get('explanation', ''),
                         "marks": task['marks'],
                         "bloom_level": q.get('bloom_level', 'Apply'),
                         "course_outcome": q.get('course_outcome', 'CO1'),
                         "learning_outcome": task['learning_outcome'],
                         "status": 'draft'
                    }
                    all_questions.append(q_obj)
                    
                generation_log["questions_generated"] += len(generated_qs)
                print(f"[GEN] Finished batch. Total so far: {generation_log['questions_generated']}")

        # Save all to DB in one transaction (Safe for SQLite WAL)
        try:
            db_questions = []
            for q_data in all_questions:
                db_q = Question(**q_data)
                db.add(db_q)
                db_questions.append(db_q)
            
            db.commit()
            
            # Refresh to get IDs and create clean dicts
            clean_questions = []
            for i, q in enumerate(db_questions):
                db.refresh(q)
                clean_q = all_questions[i].copy()
                clean_q['id'] = q.id
                clean_questions.append(clean_q)
                
            return {
                "success": True,
                "questions_generated": len(db_questions),
                "questions": clean_questions,
                "log": generation_log
            }
            
        except Exception as e:
            print(f"[DB] Save Error: {e}")
            db.rollback()
            raise e

generation_service = GenerationService()
