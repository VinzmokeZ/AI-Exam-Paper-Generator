import os
from openai import OpenAI
import json
import time
import re
import requests
from .rag_service import get_rag_service

class GenerationService:
    def __init__(self, ignore_cache=False):
        self.ignore_cache = ignore_cache or os.getenv("IGNORE_CACHE") == "true"
        # Default local config
        self.local_client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
        self.local_model = "phi3:mini"
        
        # Cloud config with Multi-Provider Support
        openai_key = os.getenv("OPENAI_API_KEY", "").strip().replace('"', '').replace("'", "")
        gemini_key = os.getenv("GOOGLE_API_KEY", "").strip().replace('"', '').replace("'", "")
        model_env = os.getenv("OPENAI_MODEL", "").lower().strip()
        base_url_env = os.getenv("OPENAI_BASE_URL", "").lower().strip()
        
        is_gemini_model = "gemini" in model_env or "google" in model_env
        is_openrouter = "openrouter.ai" in base_url_env or openai_key.startswith("sk-or-")
        any_key = gemini_key or openai_key 

        if is_gemini_model and any_key and not is_openrouter:
            self.provider = "gemini"
            self.cloud_client = OpenAI(api_key=any_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
            self.cloud_model = os.getenv("OPENAI_MODEL", "gemini-1.5-flash")
            print(f"[GEN] Provider: DIRECT GEMINI")
        elif openai_key:
            self.provider = "openai"
            base_url = base_url_env or ("https://openrouter.ai/api/v1" if openai_key.startswith("sk-or-") else "https://api.openai.com/v1")
            self.cloud_client = OpenAI(api_key=openai_key, base_url=base_url)
            self.cloud_model = os.getenv("OPENAI_MODEL", "gpt-4o")
            print(f"[GEN] Provider: {model_env}")
        else:
            self.provider = "none"
            self.cloud_client = OpenAI(api_key="missing_key")
            self.cloud_model = "gpt-4o"
        
        self.cache_dir = "backend_cache"
        os.makedirs(self.cache_dir, exist_ok=True)

    def _get_cache_key(self, subject, topic, level, rubric=None, salt=None):
        import hashlib
        key_str = f"{subject}_{topic}_{level}".lower().replace(" ", "")
        if rubric: key_str += str(rubric)
        if salt: key_str += str(salt)
        return hashlib.md5(key_str.encode()).hexdigest()

    def _generate_questions_core(self, context_text, subject_name, topic_name, blooms_level, count, rubric, engine, custom_prompt=None):
        # Request a small buffer to compensate for occasional AI undercounting
        # e.g. if user wants 15, we ask for 17 and trim. Helps hit the count reliably.
        buffered_count = count + 2 if count > 3 and not rubric else count
        result = self._perform_generation_attempt(context_text, subject_name, topic_name, blooms_level, buffered_count, rubric, engine, custom_prompt)
        return result[:count] if result and len(result) > count else result

    def _perform_generation_attempt(self, context_text, subject_name, topic_name, blooms_level, count, rubric, engine, custom_prompt, current_max_tokens=2000, max_retries=4):
        if rubric and isinstance(rubric, dict):
            parts = []
            if rubric.get('mcqCount'): parts.append(f"{rubric['mcqCount']} MCQ")
            if rubric.get('shortCount'): parts.append(f"{rubric['shortCount']} Short")
            if rubric.get('essayCount'): parts.append(f"{rubric['essayCount']} Essay")
            if rubric.get('caseStudyCount'): parts.append(f"{rubric['caseStudyCount']} Case Study")
            counts_str = ", ".join(parts) if parts else "a Balanced set of"
            structure_prompt = f"STRICTLY generate EXACTLY {counts_str} questions as specified. DO NOT truncate the output and follow the requested distribution."
        else:
            structure_prompt = f"STRICTLY Generate exactly {count} high-quality exam questions. Ensure the JSON array contains exactly {count} objects."

        user_instruction_block = f'\n            USER INSTRUCTION: "{custom_prompt}"\n' if custom_prompt else ""
        
        prompt = f"""Subject: {subject_name} | Topic: {topic_name} | Bloom's: {blooms_level}
Task: {structure_prompt}
{user_instruction_block}
CONTEXT: {context_text}

RULES:
- Return ONLY a valid JSON array. No markdown, no text.
- For MCQ: Each must have EXACTLY 4 options as full text sentences. `correct_answer` must be EXACTLY one letter: "A", "B", "C", or "D".
- For Short/Essay/Case Study: `correct_answer` MUST NOT point to an option. It MUST contain the actual full grading guide or key points expected from the student.
- Each question must have UNIQUE courseOutcomes (co1-co5, scale 0-5). Do NOT repeat the same values.
- co1=Factual, co2=Conceptual, co3=Applied, co4=Evaluative, co5=Creative

FORMAT: [{{"question_text":"What is X?","type":"MCQ","options":["First option text","Second option text","Third option text","Fourth option text"],"correct_answer":"B","explanation":"B is correct because...","bloom_level":"{blooms_level}","marks":5,"courseOutcomes":{{"co1":3,"co2":1,"co3":2,"co4":0,"co5":0}}}}, ...]
"""

        # Sequential fallback chain for Gemini Direct API
        # Both models confirmed available on this free key (15 req/min, 1500/day)
        FALLBACK_CHAIN = [
            "gemini-2.0-flash-lite",    # Attempt 1 - primary (fastest)
            "gemini-2.5-flash-lite",    # Attempt 2 - experimental (user requested priority)
            "gemini-2.0-flash",         # Attempt 3 - stable alternative
            "gemini-2.0-pro-exp-02-05", # Attempt 4 - ultimate fallback (highest capability)
        ]

        for attempt in range(max_retries):
            try:
                # Pick model from chain by attempt index
                is_local = str(engine).lower() == "local"
                if not is_local:
                    self.cloud_model = FALLBACK_CHAIN[min(attempt, len(FALLBACK_CHAIN)-1)]
                client = self.local_client if is_local else self.cloud_client
                model = self.local_model if is_local else self.cloud_model
                print(f"[GEN] Attempt {attempt+1}/{max_retries} (Model: {model[:30]}) for {topic_name[:20]}...")

                if self.provider == "gemini" and engine != "local":
                    # Native Gemini REST API (v1 supports gemini-1.5 and gemini-2.0)
                    api_key = self.cloud_client.api_key
                    url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={api_key}"
                    res = requests.post(url, json={
                        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 8192}
                    }, timeout=45.0)
                    if res.status_code != 200: raise ValueError(f"Gemini Error: {res.text}")
                    content = res.json()['candidates'][0]['content']['parts'][0]['text']
                else:
                    # OpenAI / OpenRouter
                    response = client.chat.completions.create(
                        model=model,
                        messages=[{"role": "user", "content": f"Return ONLY JSON array. No conversational text.\n\nPROMPT: {prompt}"}],
                        temperature=0.4,
                        max_tokens=8192,
                        timeout=45.0
                    )
                    content = response.choices[0].message.content

                if not content: raise ValueError("Empty response")
                
                # Pre-clean: Remove whitespace and handle common truncation
                content = content.strip()
                if not content.endswith(']'):
                    # Likely truncated, try to close it
                    last_brace = content.rfind('}')
                    if last_brace != -1:
                        content = content[:last_brace+1] + ']'
                
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                clean_content = json_match.group(0) if json_match else content
                
                try:
                    data = json.loads(clean_content)
                    return data if isinstance(data, list) else data.get("questions", [])
                except json.JSONDecodeError:
                    print(f"[GEN] JSON Recovery (Attempt {attempt+1}): Stripping and regex extracting...")
                    matches = re.findall(r'\{[^{}]*"question_text"[^{}]*\}', clean_content, re.DOTALL)
                    if matches:
                        results = []
                        for m in matches:
                            try: results.append(json.loads(m))
                            except: pass
                        if results: return results
                    raise

            except Exception as e:
                error_msg = str(e)
                print(f"[GEN] Error on attempt {attempt+1} ({model[:30]}): {error_msg[:80]}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                raise e
        return []

    def generate_questions(self, subject_name, topic_name, blooms_level, count=5, subject_id=None, rubric=None, engine="local", custom_prompt=None, fresh=False, kb_id=None):
        cache_file = os.path.join(self.cache_dir, f"{self._get_cache_key(subject_name, topic_name, blooms_level, rubric, salt=time.time() if fresh else None)}.json")
        if os.path.exists(cache_file) and not self.ignore_cache:
            with open(cache_file, "r") as f: return json.load(f)

        context_text = f"Topic: {topic_name}"
        if kb_id:
            try:
                from ..database import SessionLocal
                db = SessionLocal()
                # Request more chunks if count is high
                n_res = max(5, count // 2) if count > 10 else 5
                context_list = get_rag_service().get_context_from_kb(kb_id, topic_name, db, n_results=n_res)
                if context_list: context_text = "\n\n".join(context_list)
                db.close()
                print(f"[GEN] Using KB ID: {kb_id}")
            except Exception as e: print(f"[RAG] KB Error: {e}")
        
        result = self._generate_questions_core(context_text, subject_name, topic_name, blooms_level, count, rubric, engine, custom_prompt=custom_prompt)
        with open(cache_file, "w") as f: json.dump(result, f)
        return result

    def generate_questions_from_text(self, context_text, subject_name, topic_name, count=5, complexity="Balanced", engine="local", custom_prompt=None, fresh=False, kb_id=None):
        return self._generate_questions_core(context_text, subject_name, topic_name, complexity, count, None, engine, custom_prompt)

    def generate_from_rubric(self, rubric_id, db, engine="local", context_text=None, custom_prompt=None, fresh=False):
        from ..models import Rubric, KnowledgeBase, RubricQuestionDistribution
        rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
        if not rubric:
            raise ValueError(f"Rubric with ID {rubric_id} not found")
            
        kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == rubric.kb_id).first()
        subject_name = kb.title if kb else "General"
        
        # Prepare distributions for the AI
        q_dists = db.query(RubricQuestionDistribution).filter(RubricQuestionDistribution.rubric_id == rubric_id).all()
        print(f"[SERVICE] Entering generate_from_rubric: RubricID={rubric_id}, Engine={engine}, KB_ID={rubric.kb_id}")
        rubric_dict = {
            "mcqCount": next((q.count for q in q_dists if q.question_type == 'MCQ'), 0),
            "shortCount": next((q.count for q in q_dists if q.question_type == 'Short'), 0),
            "essayCount": next((q.count for q in q_dists if q.question_type == 'Essay'), 0),
            "caseStudyCount": next((q.count for q in q_dists if q.question_type == 'Case Study'), 0)
        }
        
        # Calculate total count
        total_count = sum(rubric_dict.values()) or 10
        
        # Use custom instructions if provided in rubric
        effective_prompt = custom_prompt or ""
        if rubric.ai_instructions:
            effective_prompt = f"{rubric.ai_instructions}\n\n{effective_prompt}".strip()

        print(f"[GEN] Generating from Rubric '{rubric.name}' (KB: {subject_name}, ID: {rubric.kb_id})")
        
        return {
            "success": True, 
            "questions": self.generate_questions(
                subject_name, 
                "Exam Content", 
                "Apply", 
                count=total_count, 
                rubric=rubric_dict, 
                engine=engine, 
                custom_prompt=effective_prompt, 
                fresh=fresh,
                kb_id=rubric.kb_id
            )
        }

generation_service = GenerationService()
