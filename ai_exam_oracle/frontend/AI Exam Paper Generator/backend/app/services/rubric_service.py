"""
Rubric service - Business logic for rubric operations
"""
from sqlalchemy.orm import Session
from ..models import Rubric, RubricQuestionDistribution, RubricLODistribution

def validate_rubric(rubric_data: dict) -> str | None:
    """
    Validate rubric data
    Returns error message if validation fails, None otherwise
    """
    # Validate LO distribution totals 100%
    lo_distributions = rubric_data.get("lo_distributions", [])
    total_lo_percentage = sum(lo["percentage"] for lo in lo_distributions)
    
    if total_lo_percentage != 100:
        return f"Learning Outcome distribution must total 100%, currently: {total_lo_percentage}%"
    
    # Validate question distributions have at least one question
    question_distributions = rubric_data.get("question_distributions", [])
    total_questions = sum(qd["count"] for qd in question_distributions)
    
    if total_questions == 0:
        return "Rubric must have at least one question"
    
    # Validate LO codes
    valid_los = {"LO1", "LO2", "LO3", "LO4", "LO5"}
    for lo in lo_distributions:
        if lo["learning_outcome"] not in valid_los:
            return f"Invalid learning outcome: {lo['learning_outcome']}. Must be one of {valid_los}"
    
    # Validate question types
    valid_types = {"MCQ", "Short", "Essay"}
    for qd in question_distributions:
        if qd["question_type"] not in valid_types:
            return f"Invalid question type: {qd['question_type']}. Must be one of {valid_types}"
    
    return None

def build_generation_prompt(rubric: Rubric, subject_name: str, topic_names: list[str], db: Session) -> str:
    """
    Build structured LLM prompt from rubric constraints
    """
    # Get question distributions
    question_dists = db.query(RubricQuestionDistribution).filter(
        RubricQuestionDistribution.rubric_id == rubric.id
    ).all()
    
    # Get LO distributions
    lo_dists = db.query(RubricLODistribution).filter(
        RubricLODistribution.rubric_id == rubric.id
    ).all()
    
    # Build prompt
    prompt = f"""You are an expert question generator for academic exams.

**Exam Details:**
- Subject: {subject_name}
- Topics: {', '.join(topic_names)}
- Exam Type: {rubric.exam_type}
- Duration: {rubric.duration_minutes} minutes
- Total Marks: {rubric.total_marks}

**Question Distribution:**
"""
    
    for qd in question_dists:
        if qd.count > 0:
            prompt += f"- {qd.question_type}: {qd.count} questions, {qd.marks_each} marks each\n"
    
    prompt += "\n**Learning Outcome Distribution:**\n"
    for lo in lo_dists:
        if lo.percentage > 0:
            prompt += f"- {lo.learning_outcome}: {lo.percentage}% of questions\n"
    
    if rubric.ai_instructions:
        prompt += f"\n**Additional Instructions:**\n{rubric.ai_instructions}\n"
    
    prompt += """
**Output Format:**
Generate questions in the following JSON format:
{
  "questions": [
    {
      "question_text": "Your question here",
      "type": "MCQ",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct_answer": "B) option2",
      "explanation": "Why this is correct",
      "learning_outcome": "LO1",
      "bloom_level": "Apply",
      "marks": 1
    }
  ]
}

**Important Rules:**
1. Distribute questions across learning outcomes according to the percentages
2. For MCQ: Provide 4 options (A-D) with one correct answer
3. For Short: Provide question text and expected key points in explanation
4. For Essay: Provide broad question and evaluation criteria in explanation
5. Bloom levels: Remember, Understand, Apply, Analyze, Evaluate, Create
6. Match question difficulty to exam type ({rubric.exam_type})
7. Ensure questions cover all specified topics proportionally

Generate exactly the requested number of questions for each type.
"""
    
    return prompt

def duplicate_rubric_logic(original: Rubric, db: Session) -> Rubric:
    """
    Duplicate a rubric with all distributions
    """
    # Create new rubric
    new_rubric = Rubric(
        name=f"{original.name} (Copy)",
        subject_id=original.subject_id,
        exam_type=original.exam_type,
        duration_minutes=original.duration_minutes,
        total_marks=original.total_marks,
        ai_instructions=original.ai_instructions
    )
    db.add(new_rubric)
    db.flush()
    
    # Duplicate question distributions
    question_dists = db.query(RubricQuestionDistribution).filter(
        RubricQuestionDistribution.rubric_id == original.id
    ).all()
    
    for qd in question_dists:
        new_qd = RubricQuestionDistribution(
            rubric_id=new_rubric.id,
            question_type=qd.question_type,
            count=qd.count,
            marks_each=qd.marks_each
        )
        db.add(new_qd)
    
    # Duplicate LO distributions
    lo_dists = db.query(RubricLODistribution).filter(
        RubricLODistribution.rubric_id == original.id
    ).all()
    
    for lo in lo_dists:
        new_lo = RubricLODistribution(
            rubric_id=new_rubric.id,
            learning_outcome=lo.learning_outcome,
            percentage=lo.percentage
        )
        db.add(new_lo)
    
    db.commit()
    db.refresh(new_rubric)
    
    return new_rubric

def calculate_lo_question_distribution(rubric_id: int, db: Session) -> dict[str, int]:
    """
    Calculate how many questions should be assigned to each LO based on percentages
    Returns dict like {"LO1": 5, "LO2": 10, ...}
    """
    # Get total question count
    question_dists = db.query(RubricQuestionDistribution).filter(
        RubricQuestionDistribution.rubric_id == rubric_id
    ).all()
    
    total_questions = sum(qd.count for qd in question_dists)
    
    # Get LO distributions
    lo_dists = db.query(RubricLODistribution).filter(
        RubricLODistribution.rubric_id == rubric_id
    ).all()
    
    # Calculate questions per LO
    lo_question_counts = {}
    remaining = total_questions
    
    # Sort by percentage descending to handle rounding
    sorted_los = sorted(lo_dists, key=lambda x: x.percentage, reverse=True)
    
    for i, lo in enumerate(sorted_los):
        if i == len(sorted_los) - 1:
            # Last LO gets remaining questions to ensure total matches
            lo_question_counts[lo.learning_outcome] = remaining
        else:
            count = round(total_questions * (lo.percentage / 100))
            lo_question_counts[lo.learning_outcome] = count
            remaining -= count
    
    return lo_question_counts
