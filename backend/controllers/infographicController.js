import Infographic from '../models/Infographic.js';
import Document from '../models/Document.js';
import { generateInfographic as generateInfographicAI } from '../utils/geminiService.js';

/**
 * GET /api/infographics/:id
 * Get a single infographic by its ID.
 */
export const getInfographicById = async (req, res) => {
    try {
        const infographic = await Infographic.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('documentId', 'title');
        if (!infographic) {
            return res.status(404).json({ success: false, error: 'Infographic not found' });
        }
        res.status(200).json({ success: true, data: infographic });
    } catch (error) {
        console.error('Error fetching infographic by id:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch infographic' });
    }
};

/**
 * POST /api/infographics/generate
 * Generate AI infographic for a document and persist it.
 */
export const generateInfographic = async (req, res) => {
    try {
        const { documentId } = req.body;
        if (!documentId) {
            return res.status(400).json({ success: false, error: 'documentId is required' });
        }

        // Fetch document
        const document = await Document.findOne({ _id: documentId, userId: req.user._id });
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        if (!document.extractedText) {
            return res.status(400).json({ success: false, error: 'Document has no extracted text to analyze' });
        }

        // Call Gemini AI to generate structured infographic
        const infographicData = await generateInfographicAI(document.extractedText);

        // Persist to DB
        const infographic = await Infographic.create({
            userId: req.user._id,
            documentId: document._id,
            title: infographicData.title,
            subtitle: infographicData.subtitle,
            summary: infographicData.summary,
            metrics: infographicData.metrics || [],
            concepts: infographicData.concepts || [],
            timeline: infographicData.timeline || [],
            takeaway: infographicData.takeaway
        });

        res.status(201).json({ success: true, data: infographic });
    } catch (error) {
        console.error('Error generating infographic:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to generate infographic' });
    }
};

/**
 * GET /api/infographics
 * Get all infographics for the authenticated user.
 */
export const getAllInfographics = async (req, res) => {
    try {
        const infographics = await Infographic.find({ userId: req.user._id })
            .populate('documentId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: infographics });
    } catch (error) {
        console.error('Error fetching infographics:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch infographics' });
    }
};

/**
 * GET /api/infographics/document/:documentId
 * Get existing infographic for a specific document.
 */
export const getInfographicByDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const infographic = await Infographic.findOne({ documentId, userId: req.user._id })
            .sort({ createdAt: -1 });

        if (!infographic) {
            return res.status(404).json({ success: false, error: 'No infographic found for this document' });
        }

        res.status(200).json({ success: true, data: infographic });
    } catch (error) {
        console.error('Error fetching infographic by document:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch infographic' });
    }
};

/**
 * DELETE /api/infographics/:id
 * Delete an infographic.
 */
export const deleteInfographic = async (req, res) => {
    try {
        const infographic = await Infographic.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!infographic) {
            return res.status(404).json({ success: false, error: 'Infographic not found' });
        }
        res.status(200).json({ success: true, message: 'Infographic deleted successfully' });
    } catch (error) {
        console.error('Error deleting infographic:', error);
        res.status(500).json({ success: false, error: 'Failed to delete infographic' });
    }
};
