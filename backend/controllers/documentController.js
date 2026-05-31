import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

// @desc Upload PDF document
// @route POST/ api/documents/upload
// @access Private

export const uploadDocument = async (req, res, next) => {
    try{
      console.log('Upload Request Body:', req.body);
      console.log('Upload Request File:', req.file);

      if(!req.file) {
        return res.status(400).json({
            success: false,
            error: 'Please upload a PDF file',
            statusCode: 400
        });
      }

      const { title} = req.body;

      if (!title) {
        // Delete uploaded file if no title provided
        await fs.unlink(req.file.path);
        return res.status(400).json({
            success:false,
            error: 'Please provide a document title',
            statusCode: 400
        });
      }

      // Construct the URL for the uploaded file
      const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
      const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

      //Create document record
      const document = await Document.create({
        userId: req.user._id,
        title,
        fileName: req.file.originalname,
        filePath: fileUrl, 
        fileSize: req.file.size,
        status: 'processing'
      });

      //Process PDF in background ( in production , use a queue like Bull)
      processPDF(document._id, req.file.path).catch(err => {
        console.error('PDF processing error:', err);
      });

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploaded successfully. Processing in progress..'
      });
    } catch (error) {
        // Clean up file on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});

        }
        next(error);
    }
};


// Helper function to process PDF
const processPDF = async (documentId, filePath) => {
    try {
        const { text} = await extractTextFromPDF(filePath);

        // Create chunks
        const chunks = chunkText(text, 500, 50);

        // Update document
        await Document.findByIdAndUpdate(documentId,{
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`);
    }catch(error){
        console.error(`Error processing document ${documentId}:`,error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
};

//@desc Get  all user documents
// @route GET /api/documents
// @access Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.find({ userId: req.user._id })
            .sort({ uploadDate: -1 })
            .select('-extractedText -chunks')
            .lean();

        // Manual counts for each document
        const documentsWithCounts = await Promise.all(documents.map(async (doc) => {
            const flashcardCount = await Flashcard.countDocuments({ documentId: doc._id });
            const quizCount = await Quiz.countDocuments({ documentId: doc._id });
            return {
                ...doc,
                flashcardCount,
                quizCount
            };
        }));

        res.status(200).json({
            success: true,
            count: documentsWithCounts.length,
            data: documentsWithCounts
        });
    } catch (error) {
        next(error);
    }
};

//@desc Get  single document with chunks
// @route GET /api/documents/:id
// @access Private
export const getDocument = async (req, res, next) => {
    try{
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode:404
            });
        }

        //Get counts of associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId:req.user._id});
        const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id});

        //update last accesses
        document.lastAccessed = Date.now();
        await document.save();

        // Combine document data with counts
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });

    } catch (error) {
        next(error);
    }
};

//@desc delete documents
// @route DELETE /api/documents/:id
// @access Private
export const deleteDocument = async (req, res, next) => {
    try{
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }
        // Delete file from filesystem
        await fs.unlink(document.filePath).catch(() => {});

        //Delete document
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        // Clean up file on error
        next(error);
    }
};
