import os
import sys
from dotenv import load_dotenv

# Add backend to path so we can import app
sys.path.append(os.path.join(os.getcwd(), "backend"))

load_dotenv(dotenv_path="backend/.env")

def test_generation_service():
    try:
        from app.services.generation_service import GenerationService
        
        print("Initializing GenerationService...")
        gen_service = GenerationService()
        
        print(f"Provider: {gen_service.provider}")
        print(f"Model: {gen_service.cloud_model}")
        
        if gen_service.provider == "none":
            print("❌ Error: GenerationService didn't find the API key. Check .env formatting.")
            return

        print("Testing generation (this might take a few seconds)...")
        questions = gen_service.generate_questions(
            subject_name="General Knowledge",
            topic_name="The Solar System",
            blooms_level="Remember",
            count=1,
            engine="cloud"
        )
        
        if questions and len(questions) > 0:
            print("✅ Success! App-level generation is working.")
            print("Sample Question:", questions[0].get('question', questions[0].get('question_text')))
        else:
            print("❌ Failed: Generation returned no questions.")
            
    except Exception as e:
        print(f"❌ Error during generation service test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_generation_service()
