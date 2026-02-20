import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface ReportData {
    overview: {
        generated: number;
        approved: number;
        rejected: number;
        pending: number;
        approvalRate: number;
    };
    learningOutcomes: any[];
    blooms: any[];
    syllabus: any[];
}

export const generateReportPDF = async (data: ReportData) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        let yPos = margin;

        // --- TITLE ---
        doc.setFontSize(22);
        doc.setTextColor(13, 38, 38); // #0D2626
        doc.setFont('helvetica', 'bold');
        doc.text("AI EXAM ORACLE", pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(16);
        doc.setTextColor(100);
        doc.text("ANALYTICS & USAGE REPORT", pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPos);
        yPos += 10;

        // --- 1. OVERVIEW STATISTICS ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(139, 233, 253); // #8BE9FD
        doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
        doc.setTextColor(0);
        doc.text("1. OVERVIEW STATISTICS", margin + 2, yPos + 6);
        yPos += 12;

        const statsData = [
            ['Total Generated', data.overview.generated],
            ['Approved Questions', data.overview.approved],
            ['Rejected Questions', data.overview.rejected],
            ['Pending Review', data.overview.pending],
            ['Approval Rate', `${data.overview.approvalRate}%`]
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: statsData as any,
            theme: 'striped',
            headStyles: { fillColor: [80, 250, 123], textColor: 0, fontStyle: 'bold' }, // #50FA7B  
            styles: { fontSize: 11, cellPadding: 4 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 100 } }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // --- 2. BLOOM'S TAXONOMY ANALYSIS ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(197, 179, 230); // #C5B3E6
        doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
        doc.text("2. COGNITIVE LEVEL ANALYSIS (BLOOM'S)", margin + 2, yPos + 6);
        yPos += 12;

        const bloomsRows = data.blooms.map(b => [b.level, b.count, `${b.percentage}%`]);
        autoTable(doc, {
            startY: yPos,
            head: [['Cognitive Level', 'Count', 'Distribution']],
            body: bloomsRows,
            theme: 'grid',
            headStyles: { fillColor: [155, 134, 197] },
            styles: { fontSize: 10 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // --- 3. SYLLABUS COVERAGE ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(255, 184, 108); // #FFB86C
        doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
        doc.text("3. TOPIC COVERAGE", margin + 2, yPos + 6);
        yPos += 12;

        const topicRows = data.syllabus.map(t => [t.name, t.questions, `${t.percentage}%`]);
        autoTable(doc, {
            startY: yPos,
            head: [['Topic', 'Questions', 'Coverage']],
            body: topicRows,
            theme: 'grid',
            headStyles: { fillColor: [255, 160, 60] },
            styles: { fontSize: 10 }
        });

        // Save Logic (Native vs Web)
        const filename = `Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;

        if (Capacitor.isNativePlatform()) {
            const pdfBase64 = doc.output('datauristring').split(',')[1];
            try {
                const result = await Filesystem.writeFile({
                    path: filename,
                    data: pdfBase64,
                    directory: Directory.Documents,
                    recursive: true
                });
                toast.success("Report saved to Documents!");
                try {
                    await FileOpener.open({ filePath: result.uri, contentType: 'application/pdf' });
                } catch (e) { console.warn("Auto-open failed", e); }
            } catch (e) {
                // Fallback
                try {
                    await Filesystem.writeFile({
                        path: `Download/${filename}`,
                        data: pdfBase64,
                        directory: Directory.ExternalStorage,
                        recursive: true
                    });
                    toast.success("Saved to Download folder");
                } catch (e2) {
                    toast.error("Could not save report file");
                }
            }
        } else {
            doc.save(filename);
            toast.success("Report downloaded!");
        }

    } catch (error) {
        console.error("Report PDF Gen Error:", error);
        toast.error("Failed to generate analytics report");
    }
};
