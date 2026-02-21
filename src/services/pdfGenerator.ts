import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface Question {
    question_text: string;
    type: string;
    marks: number;
    options?: string[];
    correct_answer?: string;
    explanation?: string;
}

interface ExamPaperData {
    subject_name: string;
    topic_name: string;
    questions: Question[];
    total_marks: number;
    duration?: number;
    generated_date?: string;
}

export const generateExamPDF = async (data: ExamPaperData) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        let yPos = margin;

        // --- HEADER SECTION ---
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text("AI EXAM ORACLE", pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`${data.subject_name.toUpperCase()} - EXAM PAPER`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 7;

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Topic: ${data.topic_name}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setTextColor(0);
        const dateStr = data.generated_date ? new Date(data.generated_date).toLocaleDateString() : new Date().toLocaleDateString();

        doc.text(`Date: ${dateStr}`, margin, yPos);
        doc.text(`Duration: ${data.duration || 60} mins`, margin + 50, yPos);

        const marksText = `Total Marks: ${data.total_marks}`;
        const marksWidth = doc.getTextWidth(marksText);
        doc.text(marksText, pageWidth - margin - marksWidth, yPos);

        yPos += 5;
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // --- QUESTIONS SECTION (Grouped by Type) ---
        const mcqs = data.questions.filter(q => {
            const type = (q.type || (q as any).question_type || '').toUpperCase();
            return type === 'MCQ';
        });
        const descriptive = data.questions.filter(q => {
            const type = (q.type || (q as any).question_type || '').toUpperCase();
            return type !== 'MCQ';
        });

        const renderQuestion = (q: any, globalIndex: number) => {
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
            }

            const qText = q.question_text || q.question || 'No question text';
            const qType = (q.type || q.question_type || 'MCQ').toUpperCase();
            const qMarks = q.marks || (q as any).total_marks || 2;

            doc.setFont('helvetica', 'bold');
            const qTitle = `${globalIndex}. [${qMarks} Marks]`;
            doc.text(qTitle, margin, yPos);

            doc.setFont('helvetica', 'normal');
            const textWidth = pageWidth - (margin * 2) - 10;
            const splitText = doc.splitTextToSize(qText, textWidth);
            doc.text(splitText, margin + 5, yPos + 6);

            const textHeight = splitText.length * 5;
            yPos += 6 + textHeight + 4;

            // Option Parsing
            let parsedOptions: string[] = [];
            const rawOptions = q.options || (q as any).choices;
            if (Array.isArray(rawOptions)) {
                parsedOptions = rawOptions;
            } else if (typeof rawOptions === 'string') {
                try {
                    const parsed = JSON.parse(rawOptions);
                    if (Array.isArray(parsed)) parsedOptions = parsed;
                } catch (e) {
                    parsedOptions = rawOptions.split(',').map((s: string) => s.trim());
                }
            }

            if (qType === 'MCQ' && parsedOptions.length > 0) {
                parsedOptions.forEach((opt, optIndex) => {
                    if (yPos > pageHeight - 20) {
                        doc.addPage();
                        yPos = margin;
                    }
                    const optLabel = String.fromCharCode(65 + optIndex);
                    doc.text(`${optLabel}) ${opt}`, margin + 10, yPos);
                    yPos += 6;
                });
                yPos += 4;
            } else if (qType !== 'MCQ') {
                const isEssay = qType === 'ESSAY' || qMarks > 4;
                const spaceHeight = isEssay ? 40 : 20;
                if (yPos + spaceHeight > pageHeight - margin) {
                    doc.addPage();
                    yPos = margin;
                }

                doc.setDrawColor(230);
                for (let l = 0; l < (isEssay ? 5 : 3); l++) {
                    doc.line(margin + 5, yPos + (l * 8), pageWidth - margin, yPos + (l * 8));
                }
                yPos += spaceHeight;
            }
            yPos += 6;
        };

        let questionCounter = 1;

        if (mcqs.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("PART A: MULTIPLE CHOICE QUESTIONS", margin, yPos);
            yPos += 8;
            doc.setFontSize(11);
            mcqs.forEach(q => renderQuestion(q, questionCounter++));
        }

        if (descriptive.length > 0) {
            if (yPos > pageHeight - 50) { doc.addPage(); yPos = margin; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("PART B: DESCRIPTIVE QUESTIONS", margin, yPos);
            yPos += 8;
            doc.setFontSize(11);
            descriptive.forEach(q => renderQuestion(q, questionCounter++));
        }

        // --- ANSWER KEY ---
        doc.addPage();
        yPos = margin;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("ANSWER KEY & GRADING GUIDE", pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Smart Answer Key Formatting
        const answerKeyBody = data.questions.map((q, i) => {
            let answerDisplay = q.correct_answer || 'Check instructor guide';

            const qType = (q.type || (q as any).question_type || '').toUpperCase();

            // Resolve MCQ answer to "A) Text" format if possible
            if (qType === 'MCQ') {
                // Re-parse options locally if needed (same logic as above)
                let parsedOptions: string[] = [];
                const rawOptions = q.options || (q as any).choices;
                if (Array.isArray(rawOptions)) {
                    parsedOptions = rawOptions;
                } else if (typeof rawOptions === 'string') {
                    try {
                        const parsed = JSON.parse(rawOptions);
                        if (Array.isArray(parsed)) parsedOptions = parsed;
                    } catch (e) {
                        parsedOptions = (rawOptions as string).split(',').map((s: string) => s.trim());
                    }
                }

                if (parsedOptions.length > 0) {
                    // Case 1: correct_answer is an index (0, 1, 2, 3 or "0", "1"...)
                    if (!isNaN(Number(q.correct_answer)) && Number(q.correct_answer) < parsedOptions.length) {
                        const idx = Number(q.correct_answer);
                        const letter = String.fromCharCode(65 + idx);
                        answerDisplay = `${letter}) ${parsedOptions[idx]}`;
                    }
                    // Case 2: correct_answer is the text itself
                    else if (parsedOptions.includes(q.correct_answer || '')) {
                        const idx = parsedOptions.indexOf(q.correct_answer || '');
                        const letter = String.fromCharCode(65 + idx);
                        answerDisplay = `${letter}) ${q.correct_answer}`;
                    }
                }
            }

            return [
                `Q${i + 1}`,
                q.type,
                answerDisplay,
                q.marks.toString()
            ];
        });

        autoTable(doc, {
            startY: yPos,
            head: [['Q', 'Type', 'Correct Answer / Key Points', 'Marks']],
            body: answerKeyBody,
            theme: 'grid',
            headStyles: { fillColor: [13, 38, 38] },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 20 },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 20 }
            }
        });

        const filename = `${data.subject_name.replace(/\s+/g, '_')}_${data.topic_name.replace(/\s+/g, '_')}_Exam.pdf`;

        if (Capacitor.isNativePlatform()) {
            // --- ANDROID/IOS NATIVE SAVE ---
            const pdfBase64 = doc.output('datauristring').split(',')[1];

            try {
                const result = await Filesystem.writeFile({
                    path: filename,
                    data: pdfBase64,
                    directory: Directory.Documents,
                    recursive: true
                });

                toast.success("File saved to Documents folder!");

                // Try to open it immediately
                try {
                    await FileOpener.open({
                        filePath: result.uri,
                        contentType: 'application/pdf'
                    });
                } catch (openError) {
                    console.warn("Could not auto-open file:", openError);
                    toast.info("Check your Documents folder");
                }

            } catch (e) {
                console.error("Native write failed", e);
                // Fallback to Documents/Download if Documents fails (Android specific quirk sometimes)
                try {
                    const result = await Filesystem.writeFile({
                        path: `Download/${filename}`,
                        data: pdfBase64,
                        directory: Directory.ExternalStorage,
                        recursive: true
                    });
                    toast.success("Saved to Internal Storage/Download");
                } catch (e2) {
                    toast.error("Could not save file to device storage");
                }
            }

        } else {
            // --- WEB/BROWSER SAVE ---
            doc.save(filename);
            toast.success("Exam PDF downloaded!");
        }

    } catch (err) {
        console.error("PDF Gen Error:", err);
        toast.error("Failed to generate PDF");
    }
};
