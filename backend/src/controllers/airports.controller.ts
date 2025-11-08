import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

/**
 * Airport data - matches frontend COMMON_AIRPORTS
 */
const AIRPORTS = [
  // Major Airports
  { name: 'Austin-Bergstrom International (KAUS)', lat: 30.1945, lon: -97.6699, category: 'Major' },
  { name: 'San Antonio International (KSAT)', lat: 29.5337, lon: -98.4697, category: 'Major' },
  { name: 'Dallas Love Field (KDAL)', lat: 32.8471, lon: -96.8518, category: 'Major' },
  { name: 'Houston Hobby (KHOU)', lat: 29.6454, lon: -95.2789, category: 'Major' },
  { name: 'Dallas/Fort Worth International (KDFW)', lat: 32.8998, lon: -97.0403, category: 'Major' },
  { name: 'Houston Intercontinental (KIAH)', lat: 29.9844, lon: -95.3414, category: 'Major' },
  
  // Local Airports (near Austin)
  { name: 'Georgetown Municipal (KGTU)', lat: 30.6786, lon: -97.6794, category: 'Local' },
  { name: 'San Marcos Municipal (KHYI)', lat: 29.8928, lon: -97.8631, category: 'Local' },
  { name: 'New Braunfels Municipal (KBAZ)', lat: 29.7042, lon: -98.0417, category: 'Local' },
  { name: 'Temple Municipal (KTPL)', lat: 31.1525, lon: -97.4078, category: 'Local' },
  
  // Cross-Country Airports
  { name: 'Waco Regional (KACT)', lat: 31.6113, lon: -97.2303, category: 'Cross-Country' },
  { name: 'College Station Easterwood (KCLL)', lat: 30.5886, lon: -96.3639, category: 'Cross-Country' },
  { name: 'Corpus Christi International (KCRP)', lat: 27.7704, lon: -97.5012, category: 'Cross-Country' },
  { name: 'Midland International (KMAF)', lat: 31.9425, lon: -102.2019, category: 'Cross-Country' },
  { name: 'Lubbock Preston Smith (KLBB)', lat: 33.6636, lon: -101.8228, category: 'Cross-Country' },
  { name: 'El Paso International (KELP)', lat: 31.8072, lon: -106.3776, category: 'Cross-Country' },
];

/**
 * Get all airports
 * Available to all authenticated users
 */
export async function getAirports(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: AIRPORTS,
    });
  } catch (error) {
    next(error);
  }
}

