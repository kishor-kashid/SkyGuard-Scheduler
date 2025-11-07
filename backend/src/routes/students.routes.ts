import { Router } from 'express';
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../controllers/students.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/students
 * @desc    Create a new student
 * @access  Private (admin only)
 */
router.post('/', requireAdmin, createStudent);

/**
 * @route   GET /api/students
 * @desc    Get all students
 * @access  Private (admin, instructor)
 */
router.get('/', authenticateToken, getStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Get a single student by ID
 * @access  Private (admin, instructor, student - own profile)
 */
router.get('/:id', authenticateToken, getStudentById);

/**
 * @route   PUT /api/students/:id
 * @desc    Update a student
 * @access  Private (admin, student - own profile)
 */
router.put('/:id', authenticateToken, updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student
 * @access  Private (admin only)
 */
router.delete('/:id', requireAdmin, deleteStudent);

export default router;

