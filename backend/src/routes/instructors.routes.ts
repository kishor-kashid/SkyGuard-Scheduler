import { Router } from 'express';
import {
  createInstructor,
  getInstructors,
  getInstructorById,
} from '../controllers/instructors.controller';
import { authenticateToken, requireAdmin, requireInstructorOrAdmin } from '../middleware/auth';

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
 * @access  Private (instructors and admins - needed for flight creation)
 */
router.get('/', requireInstructorOrAdmin, getInstructors);

/**
 * @route   GET /api/instructors/:id
 * @desc    Get a single instructor by ID
 * @access  Private (admin only)
 */
router.get('/:id', requireAdmin, getInstructorById);

export default router;

