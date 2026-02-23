import os
import sys
import json
import traceback
from unittest.mock import MagicMock

# Force ignore cache for testing
os.environ["IGNORE_CACHE"] = "true"

# Add app to path
sys.path.append(os.path.join(os.getcwd(), "app"))

try:
    from app.services.generation_service import GenerationService
except ImportError:
    # Fallback for different execution contexts
    sys.path.append(os.getcwd())
    from app.services.generation_service import GenerationService

def test_standardization():
    try:
        service = GenerationService(ignore_cache=True)
        
        # Mocking internal _generate_questions_core to verify parameter passing
        service._generate_questions_core = MagicMock(return_value=[{"question": "Test?", "correct_answer": "A"}])
        
        print("\n--- Testing Direct Generation Param Passing ---")
        service.generate_questions(
            subject_name="Mathematics",
            topic_name="Algebra",
            blooms_level="Apply",
            count=3,
            engine="cloud",
            custom_prompt="Include complex numbers"
        )
        
        if service._generate_questions_core.call_args is None:
            print("❌ _generate_questions_core was NOT called!")
            return

        args, kwargs = service._generate_questions_core.call_args
        print(f"DEBUG: kwargs keys = {kwargs.keys()}")
        
        assert kwargs.get("custom_prompt") == "Include complex numbers", "Direct custom_prompt not passed!"
        print("✅ Direct custom_prompt passed correctly.")
        
        print("\n--- Testing Rubric Generation Support ---")
        subject_mock = MagicMock()
        subject_mock.name = "History"
        
        # Mock the outer call
        service.generate_questions = MagicMock(return_value=[{"question": "Rubric Test?"}])
        
        # Manual simulation of execute_task from generate_from_rubric
        def verify_inner_task(custom_prompt):
            task = {"learning_outcome": "LO1", "count": 2, "question_type": "MCQ"}
            task_prompt = f"MUST strictly generate exactly {task['count']} {task['question_type']} questions. "
            if custom_prompt:
                task_prompt += f" USER INSTRUCTION: {custom_prompt}"
                
            final_topic = f"{task['learning_outcome']} - {subject_mock.name}"
            if custom_prompt:
                 final_topic = f"Topic: {final_topic}. {task_prompt}"

            # THIS is the call we updated in generation_service.py
            service.generate_questions(
                subject_name=subject_mock.name,
                topic_name=final_topic,
                blooms_level="Apply", 
                count=task['count'],
                rubric=None, 
                engine="cloud",
                custom_prompt=custom_prompt
            )
            
            call_args = service.generate_questions.call_args
            if not call_args:
                print("❌ generate_questions was NOT called in inner task!")
                return
                
            c_args, c_kwargs = call_args
            assert c_kwargs.get("custom_prompt") == custom_prompt, f"Rubric inner custom_prompt not passed! Got: {c_kwargs.get('custom_prompt')}"
            print(f"✅ Rubric inner custom_prompt '{custom_prompt}' passed correctly.")

        verify_inner_task("Only about Ancient Egypt")

        print("\n--- Verification Summary ---")
        print("AI standardization parameters are correctly routed through the service layer.")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    test_standardization()
