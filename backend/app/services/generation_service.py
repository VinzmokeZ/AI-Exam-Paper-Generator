import os
from openai import OpenAI
import json
import time
from .rag_service import get_rag_service
class GenerationService:
    def __init__(self, ignore_cache=False):
        self.ignore_cache = ignore_cache or os.getenv("IGNORE_CACHE") == "true"
        # Default local config
        self.local_client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
        self.local_model = "phi3:mini"
        
        # Cloud config with Multi-Provider Support (Universal OpenRouter & Gemini Detection)
        openai_key = os.getenv("OPENAI_API_KEY", "").strip().replace('"', '').replace("'", "")
        gemini_key = os.getenv("GOOGLE_API_KEY", "").strip().replace('"', '').replace("'", "")
        model_env = os.getenv("OPENAI_MODEL", "").lower().strip()
        base_url_env = os.getenv("OPENAI_BASE_URL", "").lower().strip()
        
        # Determine Provider based on Model Name or Key Presence
        is_gemini_model = "gemini" in model_env or "google" in model_env
        is_openrouter = "openrouter.ai" in base_url_env or openai_key.startswith("sk-or-")
        
        # Preferred key logic
        any_key = gemini_key or openai_key 

        if is_gemini_model and any_key and not is_openrouter:
            # ONLY use direct Gemini routing if NOT using OpenRouter
            self.provider = "gemini"
            self.cloud_client = OpenAI(
                api_key=any_key,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
            )
            self.cloud_model = os.getenv("OPENAI_MODEL", "gemini-1.5-flash")
            print(f"[GEN] Provider initialized: DIRECT GEMINI using {any_key[:4]}...")
        elif openai_key and len(openai_key) > 5:
            # Standard OpenAI or OpenRouter routing
            self.provider = "openai"
            
            # Force OpenRouter URL if key is sk-or- and no URL provided
            base_url = base_url_env if base_url_env else None
            if not base_url and openai_key.startswith("sk-or-"):
                base_url = "https://openrouter.ai/api/v1"
            elif not base_url:
                base_url = "https://api.openai.com/v1"

            # OpenRouter specific headers (highly recommended to avoid 401/403)
            headers = {}
            if is_openrouter:
                headers["HTTP-Referer"] = "https://github.com/VinzmokeZ/AI-Exam-Paper-Generator"
                headers["X-Title"] = "AI Exam Oracle"

            self.cloud_client = OpenAI(
                api_key=openai_key,
                base_url=base_url,
                default_headers=headers
            )
            self.cloud_model = os.getenv("OPENAI_MODEL", "gpt-4o")
            type_label = "OPENROUTER" if is_openrouter else "OPENAI"
            print(f"[GEN] Provider initialized: {type_label} ({base_url}) using {openai_key[:4]}...")
        else:
            self.provider = "none"
            self.cloud_client = OpenAI(api_key="missing_key")
            self.cloud_model = "gpt-4o"
            print("[GEN] ⚠️ Provider initialized: NONE (Missing Keys)")
        
        self.cache_dir = "backend_cache"
        os.makedirs(self.cache_dir, exist_ok=True)

    def _get_cache_key(self, subject, topic, level, rubric=None, salt=None):
        import hashlib
        key_str = f"{subject}_{topic}_{level}".lower().replace(" ", "")
        if rubric:
            key_str += str(rubric)
        if salt:
            key_str += str(salt)
        return hashlib.md5(key_str.encode()).hexdigest()


    def _generate_questions_core(self, context_text, subject_name, topic_name, blooms_level, count, rubric, engine, custom_prompt=None):
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

        # Dual Prompting Hybrid Context
        user_instruction_block = ""
        if custom_prompt:
            user_instruction_block = f"""
            CRITICAL CUSTOM USER INSTRUCTION: 
            The user explicitly requested: "{custom_prompt}"
            You MUST follow this specific instruction when generating the questions while ONLY relying on the provided context below.
            """

        prompt = f"""
        Role: Senior Academic Expert.
        Subject: {subject_name}
        Topic: {topic_name}
        Bloom's Level: {blooms_level}
        Constraints: {structure_prompt}
        {user_instruction_block}
        
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
            "courseOutcomes": {{
              "co1": 3,
              "co2": 0,
              "co3": 5,
              "co4": 1,
              "co5": 0
            }}
          }}
        ]
        
        DYNAMIC CO MAPPING REQUIREMENT (STRICT 0-5 SCALE):
        You MUST generate a unique and mathematically derived `courseOutcomes` JSON object for EVERY question.
        Each question must have exactly five keys: `co1`, `co2`, `co3`, `co4`, and `co5`.
        Assign an integer level (0 to 5) for each CO based strictly on how much the question tests that specific outcome.
        - 0: Not relevant at all.
        - 1-2: Low relevance/indirectly related.
        - 3-4: Moderately relevant.
        - 5: Highly relevant/primary focus.
        CRITICAL: DO NOT use the same static mapping for all questions. Each question MUST reflect its own specific content and Bloom's level.
        
        VETTING REQUIREMENT:
        - MCQ questions MUST have exactly 4 options.
        - Only ONE option should be the `correct_answer`.
        - Provide a detailed `explanation` for why the answer is correct and why other options are distal.

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
                        if self.provider == "none": # If cloud fallback also has no keys
                            raise ValueError("[GEN] ERROR: Ollama unreachable and no cloud API keys found. Cannot generate questions.")

                print(f"[GEN] Attempt {attempt + 1}/{max_retries} for {topic_name[:30]} using {provider_name} ({model})...")
                if provider_name == "gemini":
                    # Native Gemini REST API Call (more reliable than the OpenAI shim)
                    api_key = self.cloud_client.api_key
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                    
                    native_payload = {
                        "contents": [
                            {"role": "user", "parts": [{"text": "You are a professional educational assessment engine. You always return valid JSON representing an array of questions. No conversational text."}]},
                            {"role": "user", "parts": [{"text": prompt}]}
                        ],
                        "generationConfig": {
                            "temperature": 0.2,
                            "maxOutputTokens": 4000,
                            "responseMimeType": "application/json"
                        }
                    }
                    
                    import requests
                    res = requests.post(url, json=native_payload, timeout=90.0)
                    
                    if res.status_code != 200:
                        error_msg = f"Native Gemini Error {res.status_code}: {res.text}"
                        print(f"[GEN] {error_msg}")
                        if res.status_code == 429:
                            time.sleep(5) # Backoff for rate limit
                        raise ValueError(error_msg)
                    
                    native_data = res.json()
                    content = native_data['candidates'][0]['content']['parts'][0]['text']
                else:
                    # Standard OpenAI / OpenRouter Call
                    response = client.chat.completions.create(
                        model=model,
                        messages=[
                            {"role": "system", "content": "You are a professional educational assessment engine. You always return valid JSON representing an array of questions or an object containing a 'questions' array. No conversational text."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.2, 
                        max_tokens=4000, 
                        timeout=90.0,
                        response_format={"type": "json_object"} if provider_name == "openai" and "gpt" in model else None
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
                
        # No fallback list allowed anymore. If we fail, we raise the error so the user knows.
        raise Exception(f"Failed to generate valid questions after {max_retries} attempts. The AI model may be overloaded or the context is too complex.")

    def generate_questions(self, subject_name, topic_name, blooms_level, count=5, subject_id=None, rubric=None, engine="local", custom_prompt=None, fresh=False, kb_id=None):
        # Check Cache First for Speed
        salt = str(time.time()) if fresh else None
        cache_key = self._get_cache_key(subject_name, topic_name, blooms_level, rubric, salt=salt)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        if os.path.exists(cache_file) and not self.ignore_cache:
            print(f"[CACHE] Hit for {topic_name}. Returning instantly.")
            with open(cache_file, "r") as f:
                return json.load(f)

        # Use subject_id for RAG context if provided, otherwise fallback to name
        query_id = subject_id if subject_id else subject_name.lower().replace(" ", "")
        
        # Cloud Dominance: Skip RAG for 'General' subject, long prompts, OR if using cloud engines
        is_full_prompt = len(topic_name) > 40
        is_cloud_engine = engine in ["cloud", "openai", "gemini"]
        
        # RAG / KnowledgeBase context integration
        if kb_id:
            try:
                from ..database import SessionLocal
                from .rag_service import get_rag_service
                db = SessionLocal()
                rag_service = get_rag_service()
                context_list = rag_service.get_context_from_kb(kb_id, topic_name, db)
                if context_list:
                    context_text = "\n\n".join(context_list)
                else:
                    context_text = f"Topic: {topic_name}"
                db.close()
                print(f"[GEN] Using KnowledgeBase ID: {kb_id} for context.")
            except Exception as e:
                print(f"[RAG] Error fetching KB context: {e}")
                context_text = f"Topic: {topic_name}"
        elif subject_name.lower() == "general" or is_full_prompt or is_cloud_engine:
            reason = "Subject: General" if subject_name.lower() == "general" else ("Prompt Length" if is_full_prompt else "Cloud Engine")
            print(f"[GEN] Strategy: Direct Cloud Generation (RAG Bypassed for Accuracy). Reason: {reason}.")
            context_text = f"User Prompt: {topic_name}" 
        else:
            # Get RAG Service (Lazy)
            try:
                rag_service = get_rag_service()
                context_list = rag_service.query_context(f"Questions about {topic_name}", subject_id=query_id)
                if context_list and isinstance(context_list, list):
                    context_text = chr(10).join(context_list)
                else:
                    context_text = f"Topic: {topic_name}"
            except Exception as e:
                print(f"[RAG] Warning: RAG failed {e}. Proceeding with prompt only.")
                context_text = f"Topic: {topic_name}"

        # Generate using shared core logic
        result = self._generate_questions_core(context_text, subject_name, topic_name, blooms_level, count, rubric, engine, custom_prompt=custom_prompt)
        
        # Cache result
        with open(cache_file, "w") as f:
            json.dump(result, f)
            
        return result

    def generate_questions_from_text(self, context_text, subject_name, topic_name, count=5, complexity="Balanced", engine="local", custom_prompt=None, fresh=False):
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
            engine=engine,
            custom_prompt=custom_prompt
        )

    def generate_from_rubric(self, rubric_id, db, engine="local", context_text=None, custom_prompt=None, fresh=False):
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
        # Cloud Dominance: Skip RAG for cloud engines to maximize speed and accuracy
        is_cloud_engine = engine in ["cloud", "openai", "gemini"]
        context = None
        
        if not is_cloud_engine:
            try:
                from ..services.rag_service import get_rag_service
                rag_service = get_rag_service()
                context = rag_service.query_context(f"General concepts for {subject.name}", subject_id=subject.id)
                print(f"[GEN] Prepared RAG context for {subject.name}.")
            except Exception as e:
                print(f"[RAG] Warning: Rubric RAG failed {e}. Proceeding without extra context.")
        else:
            print(f"[GEN] Strategy: Direct Cloud Generation (RAG Bypassed for Rubric).")
        
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
                
                # Enforce the question type + any custom user prompt
                task_prompt = f"MUST strictly generate exactly {task['count']} {task['question_type']} questions. "
                if custom_prompt:
                    task_prompt += f" USER INSTRUCTION: {custom_prompt}"

                if context_text:
                    # Using explicitly provided file context
                    return self.generate_questions_from_text(
                        context_text=context_text,
                        subject_name=subject.name,
                        topic_name=f"{task['learning_outcome']} - {subject.name}",
                        count=task['count'],
                        complexity="Balanced",
                        engine=engine,
                        custom_prompt=task_prompt,
                        fresh=fresh # Pass the fresh flag
                    ), task
                else:
                    # Using RAG or topic-based generation where prompt = topic_name internally
                    # To pass custom_prompt when there's no context_text, we pass the built prompt as topic_name
                    final_topic = f"{task['learning_outcome']} - {subject.name}"
                    if custom_prompt:
                         final_topic = f"Topic: {final_topic}. {task_prompt}"

                    return self.generate_questions(
                        subject_name=subject.name,
                        topic_name=final_topic,
                        blooms_level="Apply",
                        count=task['count'],
                        rubric=None,
                        engine=engine,
                        custom_prompt=custom_prompt,
                        fresh=fresh # Pass the fresh flag
                    ), task
            except Exception as e:
                print(f"[THREAD] Error: {e}")
                import traceback
                traceback.print_exc()
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
                         "marks": q.get('marks', 5),
                         "bloom_level": q.get('bloom_level', 'Application'),
                         "course_outcomes": q.get('courseOutcomes') or q.get('course_outcomes', {}),
                         "learning_outcome": task['learning_outcome'],
                         "status": 'draft'
                    }
                    all_questions.append(q_obj)
                    
                generation_log["questions_generated"] += len(generated_qs)
                print(f"[GEN] Finished batch. Total so far: {generation_log['questions_generated']}")

        # Final Guard: check if anything at all was generated
        if not all_questions:
             raise Exception("Failed to generate any questions after all task attempts. Please check your AI API keys and model settings.")

        return {
            "success": True,
            "questions_generated": len(all_questions),
            "questions": all_questions,
            "log": generation_log
        }

generation_service = GenerationService()
