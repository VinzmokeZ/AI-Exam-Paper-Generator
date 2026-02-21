
const mockData = {
    subject_name: "Computer Science",
    topic_name: "Data Structures",
    questions: [
        {
            question_text: "What is the time complexity of binary search?",
            type: "MCQ",
            marks: 2,
            options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
            correct_answer: "1", // Sometimes it's index "1" (B)
            explanation: "Binary search divides the search interval in half."
        },
        {
            question_text: "Which data structure is FIFO?",
            type: "MCQ",
            marks: 2,
            options: ["Stack", "Queue", "Tree", "Graph"],
            correct_answer: "Queue", // Sometimes it's the text itself
            explanation: "Queue is First In First Out."
        }
    ],
    total_marks: 4,
    duration: 30
};

console.log("--- ANSWER KEY SIMULATION ---");
mockData.questions.forEach((q, i) => {
    let answerDisplay = q.correct_answer || "Check instructor guide";

    // Logic to be added to pdfGenerator.ts
    if (q.type === 'MCQ' && q.options && q.options.length > 0) {
        // Check if correct_answer is an index (0-3 or '0'-'3')
        if (!isNaN(q.correct_answer) && parseInt(q.correct_answer) < q.options.length) {
            const idx = parseInt(q.correct_answer);
            const letter = String.fromCharCode(65 + idx);
            answerDisplay = `${letter}) ${q.options[idx]}`;
        }
        // Check if correct_answer is the text itself
        else if (q.options.includes(q.correct_answer)) {
            const idx = q.options.indexOf(q.correct_answer);
            const letter = String.fromCharCode(65 + idx);
            answerDisplay = `${letter}) ${q.correct_answer}`;
        }
    }

    console.log(`Q${i + 1}: ${answerDisplay}`);
});
