
import ollama
import json
import re

class OllamaService:
    def __init__(self, model="phi3:mini"):
        self.model = model

    def generate_questions(self, prompt, count=5, complexity="Balanced", subject="General"):
        """
        Generates questions using the local Ollama instance with strict JSON formatting.
        """
        
        # 1. Define Complexity Logic
        complexity_instructions = {
            "Simple": "Use simple language. Focus on recall and understanding (Bloom's Level 1-2). Avoid complex scenarios.",
            "Balanced": "Mix of theory and application. (Bloom's Level 3-4).",
            "Advanced": "Focus on analysis and evaluation (Bloom's Level 5-6). Use complex, scenario-based questions."
        }
        
        level_instruction = complexity_instructions.get(complexity, complexity_instructions["Balanced"])

        # 2. Construct System Prompt
        system_prompt = f"""
        You are an expert exam setter for {subject}. 
        Your task is to generate {count} questions in strict JSON format.
        
        STRICT SCHEMA:
           {{
             "id": <number>,
             "type": "MCQ" or "ESSAY",
             "question": "<text>",
             "options": ["A", "B", "C", "D"], (MCQ only)
             "correctAnswer": <0-3>, (MCQ only)
             "explanation": "<logic>",
             "subject": "{subject}",
             "courseOutcomes": {{ "co1": <1-3>, "co2": <1-3>, "co3": <1-3>, "co4": <1-3>, "co5": <1-3> }}
           }}
        
        CO MAPPING (1-3): co1:Analyze, co2:Knowledge, co3:Apply, co4:Evaluate, co5:Create.
        
        COMPLEXITY: {level_instruction}
        """

        # 3. Call Ollama
        try:
            response = ollama.chat(model=self.model, messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': f"Generate {count} questions about: {prompt}"}
            ])

            content = response['message']['content']
            
            # 4. robust JSON Extraction
            # Find the first '[' and last ']'
            start_index = content.find('[')
            end_index = content.rfind(']')
            
            if start_index != -1 and end_index != -1:
                json_str = content[start_index:end_index+1]
                questions = json.loads(json_str)
                
                # Post-processing to ensure IDs are unique and numbered correctly
                for i, q in enumerate(questions):
                    q['id'] = i + 1
                    
                return questions
            else:
                raise ValueError("No JSON array found in response")

        except Exception as e:
            print(f"Ollama Generation Error: {e}")
            # Fallback mock data if generation fails
            return [
                {
                    "id": 1,
                    "type": "MCQ",
                    "question": f"Error generating questions: {str(e)}. Which of the following is true?",
                    "options": ["Ollama is offline", "Model not found", "Invalid JSON", "Network Error"],
                    "correctAnswer": 0,
                    "explanation": "This is a fallback question generated because an error occurred.",
                    "subject": "Error Handling",
                    "courseOutcomes": {"co1": 1, "co2": 1, "co3": 1, "co4": 1, "co5": 1}
                }
            ]
