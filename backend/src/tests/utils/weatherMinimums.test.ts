import { TrainingLevel } from '../../types';
import {
  getWeatherMinimums,
  meetsWeatherMinimums,
  getWeatherMinimumsDescription,
} from '../../utils/weatherMinimums';
import { WeatherConditions } from '../../types';

describe('Weather Minimums', () => {
  describe('getWeatherMinimums', () => {
    it('should return correct minimums for STUDENT_PILOT', () => {
      const minimums = getWeatherMinimums(TrainingLevel.STUDENT_PILOT);
      
      expect(minimums.visibility).toBe(5);
      expect(minimums.ceiling).toBeUndefined();
      expect(minimums.maxWindSpeed).toBe(10);
      expect(minimums.allowPrecipitation).toBe(false);
      expect(minimums.allowThunderstorms).toBe(false);
      expect(minimums.allowIcing).toBe(false);
      expect(minimums.allowIMC).toBe(false);
    });

    it('should return correct minimums for PRIVATE_PILOT', () => {
      const minimums = getWeatherMinimums(TrainingLevel.PRIVATE_PILOT);
      
      expect(minimums.visibility).toBe(3);
      expect(minimums.ceiling).toBe(1000);
      expect(minimums.maxWindSpeed).toBe(20);
      expect(minimums.allowPrecipitation).toBe(true);
      expect(minimums.allowThunderstorms).toBe(false);
      expect(minimums.allowIcing).toBe(false);
      expect(minimums.allowIMC).toBe(false);
    });

    it('should return correct minimums for INSTRUMENT_RATED', () => {
      const minimums = getWeatherMinimums(TrainingLevel.INSTRUMENT_RATED);
      
      expect(minimums.visibility).toBe(0);
      expect(minimums.ceiling).toBe(0);
      expect(minimums.maxWindSpeed).toBe(30);
      expect(minimums.allowPrecipitation).toBe(true);
      expect(minimums.allowThunderstorms).toBe(false);
      expect(minimums.allowIcing).toBe(false);
      expect(minimums.allowIMC).toBe(true);
    });
  });

  describe('meetsWeatherMinimums', () => {
    // Student pilots require clear skies (no ceiling or ceiling >= 10000)
    const goodConditions: WeatherConditions = {
      visibility: 10,
      ceiling: undefined, // Clear skies for student pilot
      windSpeed: 5,
      temperature: 70,
      humidity: 50,
      precipitation: false,
      thunderstorms: false,
      icing: false,
    };

    it('should pass for student pilot with good conditions', () => {
      const result = meetsWeatherMinimums(goodConditions, TrainingLevel.STUDENT_PILOT);
      expect(result.meets).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail for student pilot with low visibility', () => {
      const conditions = { ...goodConditions, visibility: 3 };
      const result = meetsWeatherMinimums(conditions, TrainingLevel.STUDENT_PILOT);
      expect(result.meets).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0]).toContain('Visibility');
    });

    it('should fail for student pilot with high wind', () => {
      const conditions = { ...goodConditions, windSpeed: 15 };
      const result = meetsWeatherMinimums(conditions, TrainingLevel.STUDENT_PILOT);
      expect(result.meets).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      // Check that wind speed violation is in the violations array
      expect(result.violations.some(v => v.includes('Wind speed'))).toBe(true);
    });

    it('should fail for student pilot with precipitation', () => {
      const conditions = { ...goodConditions, precipitation: true };
      const result = meetsWeatherMinimums(conditions, TrainingLevel.STUDENT_PILOT);
      expect(result.meets).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      // Check that precipitation violation is in the violations array
      expect(result.violations.some(v => v.includes('Precipitation'))).toBe(true);
    });

    it('should fail for student pilot with low ceiling', () => {
      const conditions = { ...goodConditions, ceiling: 500 };
      const result = meetsWeatherMinimums(conditions, TrainingLevel.STUDENT_PILOT);
      expect(result.meets).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0]).toContain('Clear skies');
    });

    it('should pass for private pilot with acceptable conditions', () => {
      const conditions = {
        ...goodConditions,
        visibility: 5,
        ceiling: 1500,
        windSpeed: 15,
        precipitation: true,
      };
      const result = meetsWeatherMinimums(conditions, TrainingLevel.PRIVATE_PILOT);
      expect(result.meets).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should pass for instrument rated with IMC conditions', () => {
      const conditions = {
        visibility: 1,
        ceiling: 200,
        windSpeed: 25,
        temperature: 60,
        humidity: 80,
        precipitation: true,
        thunderstorms: false,
        icing: false,
      };
      const result = meetsWeatherMinimums(conditions, TrainingLevel.INSTRUMENT_RATED);
      expect(result.meets).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail for all levels with thunderstorms', () => {
      const conditions = { ...goodConditions, thunderstorms: true };
      
      const studentResult = meetsWeatherMinimums(conditions, TrainingLevel.STUDENT_PILOT);
      const privateResult = meetsWeatherMinimums(conditions, TrainingLevel.PRIVATE_PILOT);
      const instrumentResult = meetsWeatherMinimums(conditions, TrainingLevel.INSTRUMENT_RATED);
      
      expect(studentResult.meets).toBe(false);
      expect(privateResult.meets).toBe(false);
      expect(instrumentResult.meets).toBe(false);
    });

    it('should fail for all levels with icing', () => {
      const conditions = { ...goodConditions, icing: true };
      
      const studentResult = meetsWeatherMinimums(conditions, TrainingLevel.STUDENT_PILOT);
      const privateResult = meetsWeatherMinimums(conditions, TrainingLevel.PRIVATE_PILOT);
      const instrumentResult = meetsWeatherMinimums(conditions, TrainingLevel.INSTRUMENT_RATED);
      
      expect(studentResult.meets).toBe(false);
      expect(privateResult.meets).toBe(false);
      expect(instrumentResult.meets).toBe(false);
    });
  });

  describe('getWeatherMinimumsDescription', () => {
    it('should return description for student pilot', () => {
      const description = getWeatherMinimumsDescription(TrainingLevel.STUDENT_PILOT);
      expect(description).toContain('Visibility: 5 mi minimum');
      expect(description).toContain('Clear skies required');
      expect(description).toContain('Wind: 10 kt maximum');
    });

    it('should return description for private pilot', () => {
      const description = getWeatherMinimumsDescription(TrainingLevel.PRIVATE_PILOT);
      expect(description).toContain('Visibility: 3 mi minimum');
      expect(description).toContain('Ceiling: 1000 ft minimum');
      expect(description).toContain('Wind: 20 kt maximum');
    });

    it('should return description for instrument rated', () => {
      const description = getWeatherMinimumsDescription(TrainingLevel.INSTRUMENT_RATED);
      expect(description).toContain('IMC conditions acceptable');
    });
  });
});

