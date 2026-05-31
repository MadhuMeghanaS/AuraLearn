import express from 'express';
import {
    generateInfographic,
    getAllInfographics,
    getInfographicByDocument,
    getInfographicById,
    deleteInfographic
} from '../controllers/infographicController.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.post('/generate', generateInfographic);
router.get('/', getAllInfographics);
router.get('/document/:documentId', getInfographicByDocument);
router.get('/:id', getInfographicById);
router.delete('/:id', deleteInfographic);

export default router;
