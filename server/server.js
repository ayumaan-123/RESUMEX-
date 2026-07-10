import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import Groq from 'groq-sdk';
import PDFDocument from 'pdfkit';
import { PDFDocument as PDFLibDocument, rgb, StandardFonts } from 'pdf-lib';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const jsonStructureBlueprint = {
  atsScore: 85,
  resumeSummary: "String summary",
  resumeStrengthLevel: "Competitive",
  roleReadinessScore: 88,
  jobMatchPercentage: 82,
  keywordMatchPercentage: 75,
  strengths: ["Strength 1", "Strength 2"],
  weaknesses: ["Weakness 1"],
  missingKeywords: ["Docker", "Kubernetes"],
  matchedKeywords: ["React", "Node.js", "Express"],
  formattingIssues: ["No major formatting issues detected."],
  grammarSuggestions: ["Excellent grammar with active verbs."],
  skillsToLearn: ["GraphQL", "Next.js"],
  recommendedProjects: ["Build an enterprise microservices app with Docker"],
  certificationsToAdd: ["AWS Certified Developer"],
  interviewReadiness: "High",
  topInterviewQuestions: ["Explain React reconciliation.", "How do you optimize Express middleware?"],
  aiRecruiterFeedback: "The candidate demonstrates strong foundations in full-stack architecture.",
  careerAdvice: "Focus more on cloud architecture trends.",
  resumeRewriteSuggestions: [
    { original: "Made a website", improved: "Developed a responsive e-commerce application using React and Bootstrap, improving engagement by 25%." }
  ],
  improvementPriorityList: ["Add cloud-native infrastructure keywords", "Quantify metrics in project section"],
  finalVerdict: "Highly Recommended for Next Stage Interview.",
  sectionsCheck: {
    contact: "Present",
    education: "Present",
    skills: "Present",
    experience: "Needs Improvement",
    projects: "Present",
    certifications: "Missing",
    achievements: "Present",
    languages: "Present"
  },
  simulator: { currentScore: 72, estimatedScore: 89, actionsRequired: ["Add React", "Add Docker", "Quantify Achievements"] }
};

const SECTION_WEIGHTS = { contact: 10, education: 10, skills: 20, experience: 25, projects: 15, certifications: 10, achievements: 5, languages: 5 };

let lastUploadedPdfBuffer = null;

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF resume file.' });
    }

    lastUploadedPdfBuffer = req.file.buffer;

    const { jobRole, jobDescription } = req.body;
    const parsedPdf = await pdfParse(req.file.buffer);
    const resumeText = parsedPdf.text;

    if (!resumeText.trim()) {
      return res.status(400).json({ error: "Could not extract readable text from the uploaded PDF." });
    }

    const systemInstruction = `You are an expert AI Applicant Tracking System (ATS) and an elite corporate recruiter.
Analyze the provided Resume Text thoroughly against the designated Target Job Role: "${jobRole}". 
Additional Context provided in Job Description: "${jobDescription || 'N/A'}".

You must return your entire analysis strictly as a single structural JSON object conforming to this exact blueprint layout structure:
${JSON.stringify(jsonStructureBlueprint)}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Resume Content:\n\n${resumeText}` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    let rawText = chatCompletion.choices[0].message.content;
    const parsedResult = JSON.parse(rawText);

    if (parsedResult.sectionsCheck) {
      const detailedSections = {};
      Object.keys(SECTION_WEIGHTS).forEach((key) => {
        const status = parsedResult.sectionsCheck[key] || "Missing";
        const maxPoints = SECTION_WEIGHTS[key];
        let score = 0;

        if (status === "Present") { score = maxPoints; }
        else if (status === "Needs Improvement") { score = maxPoints * 0.5; }
        else { score = 0; }

        detailedSections[key] = { status, score, maxPoints };
      });
      parsedResult.sectionsCheck = detailedSections;
    }

    return res.status(200).json(parsedResult);

  } catch (error) {
    console.error("System Core Runtime Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Analytical Engine Error.' });
  }
});

app.post('/api/generate-audit', (req, res) => {
  try {
    const { analysisData } = req.body;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=RESUMEX_Visual_Audit.pdf');
    doc.pipe(res);

    doc.font('Helvetica-Bold').fillColor('#ef4444').fontSize(22).text('RESUMEX VISUAL STRATEGY AUDIT', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fillColor('#4b5563').fontSize(11).text('Compare this baseline grid checklist against your draft file to trace tracking gaps.', { align: 'center' });
    doc.moveDown(2);

    if (analysisData && analysisData.sectionsCheck) {
      Object.entries(analysisData.sectionsCheck).forEach(([section, data]) => {
        const status = data?.status || data;
        let currentY = doc.y;

        if (status === 'Missing') {
          doc.rect(50, currentY, 510, 52).fill('#fee2e2');
          doc.font('Helvetica-Bold').fillColor('#991b1b').fontSize(11).text(`[❌ CRITICAL STRUCTURAL HOLE]`, 65, currentY + 12);
          doc.font('Helvetica').fillColor('#7f1d1d').fontSize(10).text(`-> Action Required: Create an independent header label for "${section.toUpperCase()}" on your layout page.`, 65, currentY + 28);
          doc.y = currentY + 68; 
        } else if (status === 'Needs Improvement') {
          doc.rect(50, currentY, 510, 52).fill('#fef9c3');
          doc.font('Helvetica-Bold').fillColor('#854d0e').fontSize(11).text(`[⚠ CONTENT DENSITY ALERT]`, 65, currentY + 12);
          doc.font('Helvetica').fillColor('#713f12').fontSize(10).text(`-> Action Required: Enforce keyword alignment inside your "${section.toUpperCase()}" workflow strings.`, 65, currentY + 28);
          doc.y = currentY + 68; 
        }
      });
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to compile strategic audit blueprint." });
  }
});

app.post('/api/generate-optimized', async (req, res) => {
  try {
    const { analysisData } = req.body;

    if (!lastUploadedPdfBuffer) {
      return res.status(400).json({ error: "No active PDF file context found. Please upload a resume first." });
    }

    const pdfDoc = await PDFLibDocument.load(lastUploadedPdfBuffer);
    const newPage = pdfDoc.addPage([595.28, 841.89]); 
    const { width, height } = newPage.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 🌟 DEEP CRITICAL TEXT WRAPPER WITH COMPACT HEIGHT CALCULATIONS
    const calculateTextLines = (text, maxWidth, font, fontSize) => {
      const words = text.split(' ');
      let lines = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (textWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    // --- BLUE CORPORATE BANNER ---
    newPage.drawRectangle({ x: 0, y: height - 80, width: width, height: 80, color: rgb(0.08, 0.18, 0.45) });
    newPage.drawText("RESUMEX OPTIMIZATION MATRIX", { x: 40, y: height - 42, size: 16, font: fontBold, color: rgb(1, 1, 1) });
    newPage.drawText("Surgically copy-paste these specific improvements into your master layout editor.", { x: 40, y: height - 58, size: 9.5, font: fontRegular, color: rgb(0.9, 0.9, 0.9) });

    let currentCursorY = height - 125;

    // --- SECTION 1: DYNAMIC PROFILE REWRITE ---
    newPage.drawText("1. OPTIMIZED PROFILE SUMMARY UPGRADE", { x: 40, y: currentCursorY, size: 11, font: fontBold, color: rgb(0.08, 0.18, 0.45) });
    newPage.drawLine({ start: { x: 40, y: currentCursorY - 6 }, end: { x: width - 40, y: currentCursorY - 6 }, color: rgb(0.85, 0.88, 0.94), thickness: 1 });
    
    const summaryText = analysisData?.resumeRewriteSuggestions?.[0]?.improved || "Highly qualified Computer Engineering undergraduate student optimizing processing metrics and technical automation framework layouts.";
    const wrappedSummaryLines = calculateTextLines(`"${summaryText}"`, width - 104, fontRegular, 9.5);
    const box1Height = 40 + (wrappedSummaryLines.length * 14);

    newPage.drawRectangle({ x: 40, y: currentCursorY - 18 - box1Height, width: width - 80, height: box1Height, color: rgb(0.96, 0.99, 0.97), borderColor: rgb(0.12, 0.52, 0.24), borderWidth: 1 });
    newPage.drawText("Action: Replace your profile intro text block with this data-dense alternative:", { x: 52, y: currentCursorY - 32, size: 9, font: fontRegular, color: rgb(0.3, 0.4, 0.3) });
    
    let lineY = currentCursorY - 50;
    wrappedSummaryLines.forEach(line => {
      newPage.drawText(line, { x: 52, y: lineY, size: 9.5, font: fontRegular, color: rgb(0.05, 0.3, 0.1) });
      lineY -= 14;
    });

    // --- SECTION 2: DYNAMIC CORE SKILLS ---
    currentCursorY = currentCursorY - 35 - box1Height;
    newPage.drawText("2. COMPLIANCE KEYWORD SKILLS TARGETS", { x: 40, y: currentCursorY, size: 11, font: fontBold, color: rgb(0.08, 0.18, 0.45) });
    newPage.drawLine({ start: { x: 40, y: currentCursorY - 6 }, end: { x: width - 40, y: currentCursorY - 6 }, color: rgb(0.85, 0.88, 0.94), thickness: 1 });

    const targetSkills = (analysisData?.skillsToLearn && analysisData.skillsToLearn.length > 0)
      ? analysisData.skillsToLearn.join('   |   ')
      : "Containerization (Docker)   |   Orchestration (Kubernetes)   |   Cloud Engineering Architecture (AWS / Azure / GCP)";
    const wrappedSkillLines = calculateTextLines(targetSkills, width - 104, fontBold, 9.5);
    const box2Height = 40 + (wrappedSkillLines.length * 14);

    newPage.drawRectangle({ x: 40, y: currentCursorY - 18 - box2Height, width: width - 80, height: box2Height, color: rgb(0.95, 0.98, 1.0), borderColor: rgb(0.02, 0.42, 0.72), borderWidth: 1 });
    newPage.drawText("Action: Type these missing industry toolsets directly inside your Skills Block:", { x: 52, y: currentCursorY - 32, size: 9, font: fontRegular, color: rgb(0.2, 0.3, 0.5) });

    let skillLineY = currentCursorY - 50;
    wrappedSkillLines.forEach(line => {
      newPage.drawText(line, { x: 52, y: skillLineY, size: 9.5, font: fontBold, color: rgb(0.0, 0.22, 0.52) });
      skillLineY -= 14;
    });

    // --- SECTION 3: PROJECT RE-FRAME ---
    currentCursorY = currentCursorY - 35 - box2Height;
    newPage.drawText("3. METRICS-DRIVEN PROJECT DESCRIPTIONS", { x: 40, y: currentCursorY, size: 11, font: fontBold, color: rgb(0.08, 0.18, 0.45) });
    newPage.drawLine({ start: { x: 40, y: currentCursorY - 6 }, end: { x: width - 40, y: currentCursorY - 6 }, color: rgb(0.85, 0.88, 0.94), thickness: 1 });
    
    newPage.drawRectangle({ x: 40, y: currentCursorY - 85, width: width - 80, height: 65, color: rgb(0.99, 0.96, 1.0), borderColor: rgb(0.52, 0.12, 0.62), borderWidth: 1 });
    newPage.drawText("Action: Upgrade your project bullet points to highlight execution density benchmarks:", { x: 52, y: currentCursorY - 32, size: 9, font: fontRegular, color: rgb(0.4, 0.2, 0.5) });
    newPage.drawText("• Engineered responsive gesture routing schemas, optimizing script execution load speeds.", { x: 52, y: currentCursorY - 52, size: 9.5, font: fontRegular, color: rgb(0.3, 0.05, 0.4) });
    newPage.drawText("• Maintained configuration metric log sheets to benchmark structural rendering latencies.", { x: 52, y: currentCursorY - 68, size: 9.5, font: fontRegular, color: rgb(0.3, 0.05, 0.4) });

    const modifiedPdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=RESUMEX_Optimization_Blueprint.pdf');
    res.send(Buffer.from(modifiedPdfBytes));

  } catch (err) {
    console.error("Critical Exception in PDF Layer compilation Engine:", err);
    res.status(500).json({ error: "Failed to compile custom wrapped matrix copy." });
  }
});

app.listen(port, () => {
  console.log(`RESUMEX Backend Server initializing successfully on port ${port}`);
});