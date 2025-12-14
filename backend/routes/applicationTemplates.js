import express from 'express';
import { body } from 'express-validator';
import {
    createTemplate,
    getMyTemplates,
    getTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
} from '../controllers/applicationTemplateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const templateValidation = [
    body('name').optional().isString().isLength({ max: 100 }),
    body('preferredLeaseTerm')
        .optional()
        .isIn(['month-to-month', '6-months', '1-year', 'academic-year']),
    body('creditScoreRange')
        .optional()
        .isIn(['excellent', 'good', 'fair', 'poor', 'not_provided']),
];

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getMyTemplates)
    .post(templateValidation, createTemplate);

router.route('/:id')
    .get(getTemplate)
    .put(templateValidation, updateTemplate)
    .delete(deleteTemplate);

router.patch('/:id/default', setDefaultTemplate);

export default router;
