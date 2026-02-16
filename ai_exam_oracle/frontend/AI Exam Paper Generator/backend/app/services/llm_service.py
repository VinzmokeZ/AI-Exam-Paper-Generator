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

# Try to import ollama
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("[WARNING] Ollama not installed. Question generation will use fallback mode.")

def initialize_ollama() -> bool:
    """
    Check if Ollama is available and running
    """
    if not OLLAMA_AVAILABLE:
        return False
    
    try:
        # Try to list models
        models = ollama.list()
        available_models = [m.get('name', m.get('model')) for m in models.get('models', [])]
        
        if OLLAMA_MODEL not in available_models and f"{OLLAMA_MODEL}:latest" not in available_models:
            print(f"[INFO] Model {OLLAMA_MODEL} not found. Attempting to pull...")
            ollama.pull(OLLAMA_MODEL)
        
        print(f"[SUCCESS] Ollama initialized with model: {OLLAMA_MODEL}")
        return True
    except Exception as e:
        print(f"[WARNING] Ollama initialization failed: {e}")
        return False

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
    Parse JSON output from LLM, handling various formats
    """
    questions = []
    
    try:
        # Try to find JSON in the output
        json_match = re.search(r'\{[\s\S]*"questions"[\s\S]*\}', output_text)
        if json_match:
            data = json.loads(json_match.group())
            questions = data.get('questions', [])
        else:
            # Try to parse entire output as JSON
            data = json.loads(output_text)
            questions = data.get('questions', [])
        
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
        
        return validated_questions
        
    except json.JSONDecodeError as e:
        print(f"[ERROR] Failed to parse JSON: {e}")
        print(f"Output was: {output_text[:500]}...")
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
