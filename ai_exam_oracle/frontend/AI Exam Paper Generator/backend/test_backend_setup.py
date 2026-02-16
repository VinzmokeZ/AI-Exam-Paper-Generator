"""
Test script to verify AI Exam Oracle backend setup
Tests database connection, API endpoints, and LLM integration
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_database_connection():
    """Test database connectivity"""
    print("\n[TEST 1] Database Connection")
    print("=" * 50)
    try:
        from app.database import engine, USE_MYSQL, DB_NAME
        connection = engine.connect()
        db_type = "MySQL" if USE_MYSQL else "SQLite"
        print(f"✓ Connected to {db_type} database")
        if USE_MYSQL:
            print(f"✓ Database: {DB_NAME}")
        connection.close()
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def test_models():
    """Test database models"""
    print("\n[TEST 2] Database Models")
    print("=" * 50)
    try:
        from app.models import (
            Subject, Topic, Question, Rubric, 
            RubricQuestionDistribution, RubricLODistribution, 
            CourseOutcome, UserStats, Achievement
        )
        models = [
            "Subject", "Topic", "Question", "Rubric",
            "RubricQuestionDistribution", "RubricLODistribution",
            "CourseOutcome", "UserStats", "Achievement"
        ]
        for model in models:
            print(f"✓ {model} model loaded")
        return True
    except Exception as e:
        print(f"✗ Model loading failed: {e}")
        return False

def test_rubric_service():
    """Test rubric service validation"""
    print("\n[TEST 3] Rubric Service")
    print("=" * 50)
    try:
        from app.services.rubric_service import validate_rubric
        
        # Test valid rubric
        valid_rubric = {
            "lo_distributions": [
                {"learning_outcome": "LO1", "percentage": 20},
                {"learning_outcome": "LO2", "percentage": 30},
                {"learning_outcome": "LO3", "percentage": 25},
                {"learning_outcome": "LO4", "percentage": 15},
                {"learning_outcome": "LO5", "percentage": 10}
            ],
            "question_distributions": [
                {"question_type": "MCQ", "count": 20, "marks_each": 1},
                {"question_type": "Short", "count": 5, "marks_each": 4}
            ]
        }
        
        error = validate_rubric(valid_rubric)
        if error:
            print(f"✗ Valid rubric failed validation: {error}")
            return False
        print("✓ Valid rubric passed validation")
        
        # Test invalid rubric (doesn't total 100%)
        invalid_rubric = {
            "lo_distributions": [
                {"learning_outcome": "LO1", "percentage": 50},
                {"learning_outcome": "LO2", "percentage": 30}
            ],
            "question_distributions": [
                {"question_type": "MCQ", "count": 10, "marks_each": 1}
            ]
        }
        
        error = validate_rubric(invalid_rubric)
        if not error:
            print("✗ Invalid rubric passed validation (should fail)")
            return False
        print(f"✓ Invalid rubric correctly rejected: {error}")
        
        return True
    except Exception as e:
        print(f"✗ Rubric service test failed: {e}")
        return False

def test_llm_service():
    """Test LLM service"""
    print("\n[TEST 4] LLM Service")
    print("=" * 50)
    try:
        from app.services.llm_service import test_llm_connection, generate_questions
        
        status = test_llm_connection()
        print(f"Ollama Status: {status['message']}")
        
        if status['ollama_running'] and status['model_available']:
            print("✓ Ollama is ready")
        else:
            print("⚠ Ollama not available - will use fallback mode")
        
        # Test fallback generation
        questions = generate_questions(
            prompt="Test prompt",
            count=2,
            question_type="MCQ",
            learning_outcome="LO1"
        )
        
        if len(questions) == 2:
            print(f"✓ Generated {len(questions)} fallback questions")
            return True
        else:
            print(f"✗ Expected 2 questions, got {len(questions)}")
            return False
            
    except Exception as e:
        print(f"✗ LLM service test failed: {e}")
        return False

def test_api_imports():
    """Test API route imports"""
    print("\n[TEST 5] API Routes")
    print("=" * 50)
    try:
        from app.routes import (
            subjects, topics, generate, rubrics, course_outcomes
        )
        routes = ["subjects", "topics", "generate", "rubrics", "course_outcomes"]
        for route in routes:
            print(f"✓ {route} router loaded")
        return True
    except Exception as e:
        print(f"✗ API route import failed: {e}")
        return False

def main():
    print("\n" + "=" * 50)
    print("AI EXAM ORACLE - BACKEND VERIFICATION")
    print("=" * 50)
    
    tests = [
        test_database_connection,
        test_models,
        test_rubric_service,
        test_llm_service,
        test_api_imports
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"\n✗ Test crashed: {e}")
            import traceback
            traceback.print_exc()
            results.append(False)
    
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("\n✅ ALL TESTS PASSED - Backend is ready!")
    else:
        print(f"\n⚠ {total - passed} test(s) failed - Check errors above")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()
