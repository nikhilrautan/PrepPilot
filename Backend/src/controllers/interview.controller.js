
const pdfParse = require("pdf-parse");
const {
    generateInterviewReport,
    generateResumePdf
} = require("../services/ai.service");

const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Generate an interview report using resume,
 * self-description, and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required."
            });
        }

        if (!req.file && (!selfDescription || !selfDescription.trim())) {
            return res.status(400).json({
                message: "Please upload a resume or provide a self description."
            });
        }

        let resumeText = "";

        if (req.file) {
            const parsed = await new pdfParse.PDFParse(
                Uint8Array.from(req.file.buffer)
            ).getText();

            resumeText = parsed.text;
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Generate report error:", error);

        return res.status(500).json({
            message: "Failed to generate interview report."
        });
    }
}

/**
 * @description Get an interview report by ID
 * belonging to the logged-in user.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        if (!interviewReportModel.db.base.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({
                message: "Invalid interview report ID."
            });
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        }).select("-__v");
        // ...rest unchanged

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Get interview report error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview report."
        });
    }
}

/**
 * @description Get all interview reports
 * belonging to the logged-in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select(
                "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
            );

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error("Get all interview reports error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview reports."
        });
    }
}

/**
 * @description Generate a resume PDF for the logged-in user
 * using an existing interview report.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        if (!interviewReportModel.db.base.Types.ObjectId.isValid(interviewReportId)) {
            return res.status(400).json({
                message: "Invalid interview report ID."
            });
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        return res.send(pdfBuffer);
    } catch (error) {
        console.error("Generate resume PDF error:", error);

        return res.status(500).json({
            message: "Failed to generate resume PDF."
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};
