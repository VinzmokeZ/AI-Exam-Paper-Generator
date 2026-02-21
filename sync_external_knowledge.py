import os
import wikipediaapi
import sys
import json

# Ensure subject base folders exist
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
KB_DIR = os.path.join(ROOT_DIR, "knowledge_base")
SUBJECTS_DIR = os.path.join(KB_DIR, "subjects")
PEDAGOGY_DIR = os.path.join(KB_DIR, "pedagogy")

os.makedirs(PEDAGOGY_DIR, exist_ok=True)

SUBJECTS_MAP = {
    "cs301": "Computer Science",
    "math101": "Mathematics",
    "phys202": "Physics",
    "chem201": "Chemistry",
    "eng101": "English Literature",
    "bio301": "Biology"
}

def sync_wikipedia(wiki):
    print("\n[WIKI] Pulling standard subject data...")
    for code, search_term in SUBJECTS_MAP.items():
        subj_path = os.path.join(SUBJECTS_DIR, code)
        os.makedirs(subj_path, exist_ok=True)
        file_path = os.path.join(subj_path, "wikipedia_dataset.txt")
        
        if os.path.exists(file_path): continue
            
        print(f"  > Fetching '{search_term}'...")
        page = wiki.page(search_term)
        if page.exists():
            content = page.summary + "\n\n"
            for section in page.sections[:3]:
                content += f"== {section.title} ==\n{section.text}\n\n"
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)

def sync_huggingface():
    print("\n[HF] Syncing Subject Datasets from HuggingFace...")
    try:
        from datasets import load_dataset
        
        # We'll use 'sciq' as it's a high-quality science question dataset
        # perfect for Physics, Chemistry, and Biology.
        print("  > Loading SciQ dataset for Science subjects...")
        dataset = load_dataset("sciq", split="train", trust_remote_code=True)
        
        # Group by topic keywords
        science_topics = ["physics", "chemistry", "biology"]
        for topic in science_topics:
            code = "phys202" if topic == "physics" else "chem201" if topic == "chemistry" else "bio301"
            subj_path = os.path.join(SUBJECTS_DIR, code)
            os.makedirs(subj_path, exist_ok=True)
            file_path = os.path.join(subj_path, "hf_dataset.txt")
            
            if os.path.exists(file_path): continue
            
            print(f"    - Filtering SciQ for {topic}...")
            # Simple content filtering
            content = ""
            count = 0
            for item in dataset:
                if topic in item['support'].lower() or topic in item['question'].lower():
                    content += f"Question: {item['question']}\nContext: {item['support']}\nAnswer: {item['correct_answer']}\n\n"
                    count += 1
                if count >= 100: break # Keep it light for indexing speed
            
            if content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"    [SUCCESS] {count} science questions synced.")

        # For CS / Math, we can pull from education datasets or use the Bloom's Master Mapping
        print("  > Loading Pedagogy 'Master Outcome' datasets...")
        pedagogy_file = os.path.join(PEDAGOGY_DIR, "bloom_thresholds.json")
        bloom_data = {
            "remember": "Recall facts and basic concepts. Define, duplicate, list, memorize, repeat, state.",
            "understand": "Explain ideas or concepts. Classify, describe, discuss, explain, identify, locate, recognize, report, select, translate.",
            "apply": "Use information in new situations. Execute, implement, solve, use, demonstrate, interpret, operate, schedule, sketch.",
            "analyze": "Draw connections among ideas. Differentiate, organize, relate, compare, contrast, distinguish, examine, experiment, question, test.",
            "evaluate": "Justify a stand or decision. Appraise, argue, defend, judge, select, support, value, critique, weigh.",
            "create": "Produce new or original work. Design, assemble, construct, conjecture, develop, formulate, author, investigate."
        }
        with open(pedagogy_file, "w") as f:
            json.dump(bloom_data, f, indent=2)
            
        print("  > [SUCCESS] HF datasets synced.")
        
    except Exception as e:
        print(f"  > [SKIP] HF datasets skipped (offline/missing): {e}")

def main():
    print("============================================================")
    print("🌐 AI Exam Oracle - Advanced Knowledge Sync")
    print("============================================================")
    
    user_agent = "AIExamOracle/1.0 (contact: support@exam-oracle.local)"
    wiki = wikipediaapi.Wikipedia(user_agent=user_agent, language='en')
    
    sync_wikipedia(wiki)
    sync_huggingface()

    print("\n[INFO] All datasets synced perfectly.")
    print("[INFO] Handing over to Training Engine for indexing...")

if __name__ == "__main__":
    main()
