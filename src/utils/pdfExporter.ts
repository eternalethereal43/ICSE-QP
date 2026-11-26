import { jsPDF } from 'jspdf';
import { formatDuration } from '../data/icseCurriculum';
import type { GeneratedPaper } from '../types/icse';
import { buildPdfFilename } from './paperLogic';

/**
 * Normalizes scientific/mathematical Unicode symbols so standard PDF Helvetica/Times
 * fonts render crisp, legible text with zero garbled glyphs.
 */
function sanitizeForPdf(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2212/g, '-')
    .replace(/\u00D7/g, ' x ')
    .replace(/\u00F7/g, ' / ')
    .replace(/\u21D2/g, ' => ')
    .replace(/\u2192/g, ' -> ')
    .replace(/\u21CC/g, ' <=> ')
    .replace(/\u03A9/g, ' Ohm')
    .replace(/\u03C0/g, 'pi')
    .replace(/\u03B8/g, 'theta')
    .replace(/\u03C1/g, 'rho')
    .replace(/\u03C4/g, 'tau')
    .replace(/\u03A3/g, 'Sum ')
    .replace(/\u03BC/g, 'u')
    .replace(/\u03B1/g, 'alpha')
    .replace(/\u03B2/g, 'beta')
    .replace(/\u03B3/g, 'gamma')
    .replace(/\u2264/g, '<=')
    .replace(/\u2265/g, '>=')
    .replace(/\u2260/g, '!=')
    .replace(/\u00B2/g, '^2')
    .replace(/\u00B3/g, '^3')
    .replace(/\u2032/g, "'")
    .replace(/\u2080/g, '0')
    .replace(/\u2081/g, '1')
    .replace(/\u2082/g, '2')
    .replace(/\u2083/g, '3')
    .replace(/\u2084/g, '4')
    .replace(/\u2085/g, '5')
    .replace(/\u2086/g, '6')
    .replace(/\u209A/g, 'p')
    .replace(/\u00B7/g, '.')
    .replace(/\u2022/g, '-')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function addPageFooters(doc: jsPDF, paper: GeneratedPaper, label: string) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(16, pageHeight - 14, pageWidth - 16, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${paper.paperCode}  |  ICSE Class X ${label}  |  Scholaris ICSE`,
      16,
      pageHeight - 9,
    );

    const rightText = i < totalPages ? `Page ${i} of ${totalPages}  (Turn Over)` : `Page ${i} of ${totalPages}`;
    doc.text(rightText, pageWidth - 16, pageHeight - 9, { align: 'right' });
  }
}

function drawMasthead(doc: jsPDF, paper: GeneratedPaper, isAnswerKey: boolean): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // Formal double rule border top
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.7);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineWidth(0.25);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
  y += 7;

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('ICSE CLASS X EXAMINATION PRACTICE PAPER', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(14);
  doc.text(sanitizeForPdf(paper.paperSubtitle), pageWidth / 2, y, { align: 'center' });
  y += 5.5;

  if (isAnswerKey) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(159, 18, 57);
    doc.text('DETAILED ANSWER SHEET & CISCE MARKING SCHEME', pageWidth / 2, y, { align: 'center' });
    doc.setTextColor(15, 23, 42);
    y += 5.5;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const scopeSummary =
    paper.scope === 'full'
      ? 'Full Syllabus'
      : `Chapters: ${paper.chapterTitles.slice(0, 3).join(', ')}${paper.chapterTitles.length > 3 ? ` (+${paper.chapterTitles.length - 3} more)` : ''}`;
  const scopeLines = doc.splitTextToSize(sanitizeForPdf(scopeSummary), contentWidth);
  doc.text(scopeLines, pageWidth / 2, y, { align: 'center' });
  y += scopeLines.length * 4 + 2;

  // Marks & Time bar
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Maximum Marks: ${paper.totalMarks}`, margin, y);
  doc.text(`Difficulty: ${paper.difficulty}`, pageWidth / 2, y, { align: 'center' });
  doc.text(`Time Allowed: ${formatDuration(paper.durationMinutes)}`, pageWidth - margin, y, { align: 'right' });
  y += 3.5;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  return y;
}

export function exportQuestionPaperPdf(paper: GeneratedPaper): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const maxTextWidth = pageWidth - margin * 2 - 14;
  const bottomLimit = pageHeight - 20;

  let y = drawMasthead(doc, paper, false);

  const ensureSpace = (needed: number) => {
    if (y + needed > bottomLimit) {
      doc.addPage();
      y = 18;
    }
  };

  // General Instructions
  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  for (const line of paper.generalInstructions) {
    const wrapped = doc.splitTextToSize(sanitizeForPdf(line), pageWidth - margin * 2);
    ensureSpace(wrapped.length * 4.3 + 1.5);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 4.3 + 1;
  }

  y += 3;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // Sections
  for (const section of paper.sections) {
    ensureSpace(18);
    doc.setFont('times', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${sanitizeForPdf(section.title)} (${section.marks} Marks)`, pageWidth / 2, y, {
      align: 'center',
    });
    y += 5;

    doc.setFont('times', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(sanitizeForPdf(section.attemptInstruction), pageWidth / 2, y, { align: 'center' });
    y += 7;

    for (const q of section.questions) {
      ensureSpace(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(sanitizeForPdf(q.questionNumber), margin, y);
      doc.text(`[${q.marks}]`, pageWidth - margin, y, { align: 'right' });
      y += 4.8;

      if (q.stem) {
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        const stemLines = doc.splitTextToSize(sanitizeForPdf(q.stem), maxTextWidth);
        ensureSpace(stemLines.length * 4.6 + 2);
        doc.text(stemLines, margin, y);
        y += stemLines.length * 4.6 + 2;
      }

      if (q.extractText) {
        doc.setFont('times', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        const extractLines = doc.splitTextToSize(sanitizeForPdf(q.extractText), maxTextWidth - 8);
        const boxHeight = extractLines.length * 4.5 + 4;
        ensureSpace(boxHeight + 4);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin + 3, y - 3.5, maxTextWidth - 2, boxHeight, 'FD');
        doc.text(extractLines, margin + 6, y + 0.5);
        y += boxHeight + 2.5;
        doc.setTextColor(15, 23, 42);
      }

      for (const sp of q.subParts) {
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        const fullPrompt = `${sp.label}  ${sp.prompt}`;
        const promptLines = doc.splitTextToSize(sanitizeForPdf(fullPrompt), maxTextWidth - 4);
        const optionHeight = sp.options ? sp.options.length * 4.4 + 2 : 0;
        ensureSpace(promptLines.length * 4.6 + optionHeight + 3);

        doc.text(promptLines, margin + 4, y);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`[${sp.marks}]`, pageWidth - margin, y, { align: 'right' });
        y += promptLines.length * 4.6 + 1.5;

        if (sp.options && sp.options.length > 0) {
          doc.setFont('times', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
          for (const opt of sp.options) {
            const optLines = doc.splitTextToSize(sanitizeForPdf(opt), maxTextWidth - 12);
            ensureSpace(optLines.length * 4.3 + 1);
            doc.text(optLines, margin + 10, y);
            y += optLines.length * 4.3 + 0.8;
          }
          doc.setTextColor(15, 23, 42);
          y += 1.5;
        }
      }

      y += 4;
    }

    y += 3;
  }

  addPageFooters(doc, paper, 'Question Paper');
  const filename = buildPdfFilename(paper, 'question');
  doc.save(filename);
  return filename;
}

export function exportAnswerSheetPdf(paper: GeneratedPaper): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 20;

  let y = drawMasthead(doc, paper, true);

  const ensureSpace = (needed: number) => {
    if (y + needed > bottomLimit) {
      doc.addPage();
      y = 18;
    }
  };

  for (const section of paper.sections) {
    ensureSpace(14);
    doc.setFont('times', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(30, 58, 95);
    doc.text(`${sanitizeForPdf(section.title)} — MARKING SCHEME`, margin, y);
    y += 2;
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.35);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    for (const q of section.questions) {
      ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${sanitizeForPdf(q.questionNumber)}  (${sanitizeForPdf(q.chapterTag)})`, margin, y);
      doc.text(`[${q.marks} Marks]`, pageWidth - margin, y, { align: 'right' });
      y += 5.5;

      for (const sp of q.subParts) {
        const answerText = sanitizeForPdf(sp.modelAnswer);
        const answerLines = doc.splitTextToSize(`${sp.label}  ${answerText}`, contentWidth - 16);
        ensureSpace(answerLines.length * 4.5 + 10);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(answerLines[0] || sp.label, margin + 3, y);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`[${sp.marks}]`, pageWidth - margin, y, { align: 'right' });
        y += 4.5;

        if (answerLines.length > 1) {
          doc.setFont('times', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
          for (let i = 1; i < answerLines.length; i += 1) {
            ensureSpace(5);
            doc.text(answerLines[i], margin + 6, y);
            y += 4.4;
          }
        }

        if (sp.markingSteps.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          for (const step of sp.markingSteps) {
            const stepLines = doc.splitTextToSize(`- ${sanitizeForPdf(step)}`, contentWidth - 14);
            ensureSpace(stepLines.length * 4 + 1);
            doc.text(stepLines, margin + 8, y);
            y += stepLines.length * 4 + 0.6;
          }
        }

        if (sp.examinerTip) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(159, 18, 57);
          const tipLines = doc.splitTextToSize(`Examiner Note: ${sanitizeForPdf(sp.examinerTip)}`, contentWidth - 14);
          ensureSpace(tipLines.length * 4 + 1.5);
          doc.text(tipLines, margin + 8, y);
          y += tipLines.length * 4 + 1;
        }

        y += 2.5;
      }

      y += 3;
    }

    y += 4;
  }

  addPageFooters(doc, paper, 'Detailed Answer Sheet');
  const filename = buildPdfFilename(paper, 'answer');
  doc.save(filename);
  return filename;
}
