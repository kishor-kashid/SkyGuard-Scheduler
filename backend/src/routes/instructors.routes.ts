import { Router } from 'express';
import {
  createInstructor,
  getInstructors,
  getInstructorById,
} from '../controllers/instructors.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/instructors
 * @desc    Create a new instructor
 * @access  Private (admin only)
 */
router.post('/', requireAdmin, createInstructor);

/**
 * @route   GET /api/instructors
 * @desc    Get all instructors
 * @access  Private (admin only)
 */
router.get('/', requireAdmin, getInstructors);

/**
 * @route   GET /api/instructors/:id
 * @desc    Get a single instructor by ID
 * @access  Private (admin only)
 */
router.get('/:id', requireAdmin, getInstructorById);

export default router;

