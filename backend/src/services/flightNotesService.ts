import prisma from '../config/database';
import { NoteType } from '@prisma/client';
import { AppError } from '../types';

/**
 * Create a flight note
 */
export async function createNote(
  flightId: number,
  authorId: number,
  noteType: NoteType,
  content: string
) {
  // Verify flight exists
  const flight = await prisma.flightBooking.findUnique({
    where: { id: flightId },
  });

  if (!flight) {
    throw new AppError('Flight not found', 404);
  }

  return prisma.flightNote.create({
    data: {
      flightId,
      authorId,
      noteType,
      content,
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Get all notes for a flight
 */
export async function getFlightNotes(flightId: number) {
  return prisma.flightNote.findMany({
    where: { flightId },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Update a flight note
 */
export async function updateNote(
  noteId: number,
  authorId: number,
  content: string
) {
  // Verify note exists and belongs to author
  const note = await prisma.flightNote.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  if (note.authorId !== authorId) {
    throw new AppError('You can only update your own notes', 403);
  }

  return prisma.flightNote.update({
    where: { id: noteId },
    data: { content },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Delete a flight note
 */
export async function deleteNote(noteId: number, authorId: number, userRole: string) {
  // Verify note exists
  const note = await prisma.flightNote.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  // Only author or admin can delete
  if (note.authorId !== authorId && userRole !== 'ADMIN') {
    throw new AppError('You can only delete your own notes', 403);
  }

  await prisma.flightNote.delete({
    where: { id: noteId },
  });
}

