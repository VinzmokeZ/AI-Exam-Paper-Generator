"""
Local LLM service using Ollama for structured question generation
"""
import os
import json
import re
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:mini")

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("[WARNING] Ollama not installed. Question generation will use fallback mode.")

import threading
_is_pulling = False
_pull_error = None

def initialize_ollama() -> bool:
    """
    Check if Ollama is available and running.
    If model is missing, pull it in a background thread to avoid blocking startup.
    """
    global _is_pulling, _pull_error
    
    if not OLLAMA_AVAILABLE:
        return False
    
    try:
        # Try to list models
        models = ollama.list()
        available_models = [m.get('name', m.get('model')) for m in models.get('models', [])]
        
        if OLLAMA_MODEL not in available_models and f"{OLLAMA_MODEL}:latest" not in available_models:
            if not _is_pulling:
                print(f"[INFO] Model {OLLAMA_MODEL} not found. Starting background pull...")
                _is_pulling = True
                
                def do_pull():
                    global _is_pulling, _pull_error
                    try:
                        ollama.pull(OLLAMA_MODEL)
                        print(f"[SUCCESS] Model {OLLAMA_MODEL} pulled successfully.")
                        _is_pulling = False
                    except Exception as e:
                        _pull_error = str(e)
                        _is_pulling = False
                        print(f"[ERROR] Failed to pull model {OLLAMA_MODEL}: {e}")
                
                pull_thread = threading.Thread(target=do_pull)
                pull_thread.daemon = True
                pull_thread.start()
            return True # Returning true because initialization logic started
        
        print(f"[SUCCESS] Ollama initialized with model: {OLLAMA_MODEL}")
        return True
    except Exception as e:
        print(f"[WARNING] Ollama initialization failed: {e}")
        return False

def get_ollama_status() -> dict:
    """Return detailed status of Ollama and model pulling"""
    global _is_pulling, _pull_error
    
    status = test_llm_connection()
    if _is_pulling:
        status['message'] = f"⏳ Pulling model {OLLAMA_MODEL}... Please wait."
        status['model_available'] = False
        status['is_pulling'] = True
    elif _pull_error:
        status['message'] = f"❌ Model pull failed: {_pull_error}"
        status['model_available'] = False
        status['is_pulling'] = False
        
    return status

def get_cloud_status() -> dict:
    """Check if Cloud API keys are configured"""
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GOOGLE_API_KEY") # Assuming this is used
    
    available = output = False
    provider = "none"
    
    if openai_key and len(openai_key) > 10:
        available = True
        provider = "openai"
        if "sk-" in openai_key: # Simple validation
            output = True
    elif gemini_key and len(gemini_key) > 5:
        available = True
        provider = "gemini"
        output = True
        
    return {
        "cloud_available": available,
        "provider": provider
    }

def generate_questions(
    prompt: str,
    count: int,
    question_type: str,
    learning_outcome: str | None = None
) -> List[Dict]:
    """
    Generate questions using local LLM
    
    Args:
        prompt: The generation prompt with context
        count: Number of questions to generate
        question_type: MCQ, Short, or Essay
        learning_outcome: Optional LO to assign (LO1-LO5)
    
    Returns:
        List of question dictionaries
    """
    if not OLLAMA_AVAILABLE:
        return generate_fallback_questions(count, question_type, learning_outcome)
    
    try:
        # Add specific instructions for this batch
        full_prompt = f"""{prompt}

Now generate exactly {count} {question_type} question(s)"""
        
        if learning_outcome:
            full_prompt += f" for {learning_outcome}"
        
        full_prompt += """.
Return ONLY valid JSON in the format specified above. No additional text."""
        
        # Call Ollama
        response = ollama.generate(
            model=OLLAMA_MODEL,
            prompt=full_prompt,
            options={
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 2000
            }
        )
        
        # Extract JSON from response
        output_text = response.get('response', '')
        questions = parse_json_output(output_text, question_type, learning_outcome)
        
        # Ensure we have the requested count
        if len(questions) < count:
            print(f"[WARNING] LLM generated {len(questions)} questions, expected {count}. Filling with fallback.")
            questions.extend(
                generate_fallback_questions(count - len(questions), question_type, learning_outcome)
            )
        
        return questions[:count]
        
    except Exception as e:
        print(f"[ERROR] LLM generation failed: {e}")
        return generate_fallback_questions(count, question_type, learning_outcome)

def parse_json_output(output_text: str, question_type: str, learning_outcome: str | None) -> List[Dict]:
    """
    Parse JSON output from LLM, handling various formats including markdown blocks
    """
    questions = []
    
    try:
        content = output_text.strip()
        
        # 1. Strip Markdown Code Blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            # Fallback for unspecified code blocks
            content = content.split("```")[1].split("```")[0].strip()
            
        # 2. Try to find JSON object/array
        # Matches either { "questions": [...] } or [...]
        json_match = re.search(r'(\{[\s\S]*"questions"[\s\S]*\}|\[[\s\S]*\])', content)
        
        if json_match:
            try:
                data = json.loads(json_match.group(0))
                if isinstance(data, list):
                    questions = data
                elif isinstance(data, dict):
                    questions = data.get('questions', [])
            except json.JSONDecodeError:
                # If regex match failed to parse, try cleaning it up
                pass
        
        # 3. Fallback: If still no questions, try cleaning common trailing comma errors
        if not questions:
            # Remove trailing commas
            content = re.sub(r',\s*([\]}])', r'\1', content)
            try:
                data = json.loads(content)
                if isinstance(data, list):
                    questions = data
                elif isinstance(data, dict):
                    questions = data.get('questions', [])
            except json.JSONDecodeError:
                pass

        # 4. Last Resort: Regex Extraction of individual question objects
        if not questions:
            print("[LLM] Standard JSON parse failed. Attempting regex extraction of objects...")
            # Look for objects containing "question_text"
            # This regex looks for { ... "question_text": ... } 
            # It's a bit simple and might fail on nested braces, but solves many broken JSON cases
            obj_matches = re.findall(r'\{[^{}]*"question_text"[^{}]*\}', output_text, re.DOTALL)
            for match in obj_matches:
                try:
                    q_data = json.loads(match)
                    questions.append(q_data)
                except:
                    pass
        
        # Validate and fix each question
        validated_questions = []
        for q in questions:
            # Ensure required fields
            if 'question_text' not in q or not q['question_text']:
                continue
            
            # Set defaults
            validated_q = {
                'question_text': q.get('question_text', ''),
                'type': q.get('type', question_type),
                'options': q.get('options', []) if question_type == 'MCQ' else None,
                'correct_answer': q.get('correct_answer', ''),
                'explanation': q.get('explanation', ''),
                'learning_outcome': q.get('learning_outcome', learning_outcome or 'LO1'),
                'bloom_level': q.get('bloom_level', 'Apply'),
                'marks': q.get('marks', 1)
            }
            
            # Ensure MCQ has options
            if question_type == 'MCQ' and not validated_q['options']:
                validated_q['options'] = [
                    f"A) Option 1",
                    f"B) Option 2",
                    f"C) Option 3",
                    f"D) Option 4"
                ]
                validated_q['correct_answer'] = "A) Option 1"
            
            validated_questions.append(validated_q)
        
        if not validated_questions and output_text:
             print(f"[ERROR] Failed to parse any questions. Raw output start: {output_text[:200]}...")

        return validated_questions
        
    except Exception as e:
        print(f"[ERROR] Critical error in parse_json_output: {e}")
        return []

def generate_fallback_questions(count: int, question_type: str, learning_outcome: str | None = None) -> List[Dict]:
    """
    Generate simple fallback questions when LLM is unavailable
    """
    questions = []
    lo = learning_outcome or "LO1"
    
    for i in range(count):
        if question_type == "MCQ":
            question = {
                'question_text': f"Sample MCQ question {i+1}. What is the correct concept?",
                'type': 'MCQ',
                'options': [
                    "A) First option",
                    "B) Second option (correct)",
                    "C) Third option",
                    "D) Fourth option"
                ],
                'correct_answer': "B) Second option (correct)",
                'explanation': "This is a placeholder question generated because LLM is unavailable.",
                'learning_outcome': lo,
                'bloom_level': 'Remember',
                'marks': 1
            }
        elif question_type == "Short":
            question = {
                'question_text': f"Sample short answer question {i+1}. Explain the key concept.",
                'type': 'Short',
                'options': None,
                'correct_answer': "Key points to cover: 1) Point one, 2) Point two, 3) Point three",
                'explanation': "This is a placeholder question. Students should explain the concept in 3-5 sentences.",
                'learning_outcome': lo,
                'bloom_level': 'Understand',
                'marks': 4
            }
        elif question_type == "Case Study":
            question = {
                'question_text': f"Sample case study {i+1}. Read the following scenario and answer the questions.",
                'type': 'Case Study',
                'options': None,
                'correct_answer': "Comprehensive scenario analysis covering key metrics and critical success factors.",
                'explanation': "This is a placeholder case study. Students should analyze the scenario and provide recommendations based on class theories.",
                'learning_outcome': lo,
                'bloom_level': 'Evaluate',
                'marks': 15
            }
        else:  # Essay
            question = {
                'question_text': f"Sample essay question {i+1}. Discuss the topic in detail.",
                'type': 'Essay',
                'options': None,
                'correct_answer': "Comprehensive answer covering main themes, analysis, and conclusions",
                'explanation': "This is a placeholder question. Students should write 300-500 words discussing the topic with supporting evidence.",
                'learning_outcome': lo,
                'bloom_level': 'Analyze',
                'marks': 10
            }
        
        questions.append(question)
    
    return questions

def test_llm_connection() -> dict:
    """
    Test LLM connection and return status
    """
    status = {
        'ollama_installed': OLLAMA_AVAILABLE,
        'ollama_running': False,
        'model_available': False,
        'message': ''
    }
    
    if not OLLAMA_AVAILABLE:
        status['message'] = "Ollama Python package not installed. Run: pip install ollama"
        return status
    
    try:
        models = ollama.list()
        status['ollama_running'] = True
        
        available_models = [m.get('name', m.get('model')) for m in models.get('models', [])]
        if OLLAMA_MODEL in available_models or f"{OLLAMA_MODEL}:latest" in available_models:
            status['model_available'] = True
            status['message'] = f"✓ Ollama is ready with model: {OLLAMA_MODEL}"
        else:
            status['message'] = f"Model {OLLAMA_MODEL} not found. Run: ollama pull {OLLAMA_MODEL}"
    
    except Exception as e:
        status['message'] = f"Ollama not running. Error: {e}. Start Ollama service."
    
    return status
