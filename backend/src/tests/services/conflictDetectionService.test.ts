import { evaluateWeatherAgainstMinimums } from '../../services/conflictDetectionService';
import { TrainingLevel, WeatherConditions } from '../../types';

describe('Conflict Detection Service', () => {
  describe('evaluateWeatherAgainstMinimums', () => {
    // Student pilots need clear skies - no ceiling or ceiling >= 10000
    const goodConditionsForStudent: WeatherConditions = {
      visibility: 10,
      ceiling: undefined, // Clear skies
      windSpeed: 5,
      temperature: 70,
      humidity: 50,
      precipitation: false,
      thunderstorms: false,
      icing: false,
    };

    it('should evaluate weather correctly for student pilot', () => {
      const result = evaluateWeatherAgainstMinimums(
        goodConditionsForStudent,
        TrainingLevel.STUDENT_PILOT
      );
      
      expect(result.meets).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect violations for student pilot', () => {
      const badConditions: WeatherConditions = {
        visibility: 3, // Below minimum of 5
        ceiling: 500, // Below clear skies requirement
        windSpeed: 15, // Above maximum of 10
        temperature: 70,
        humidity: 50,
        precipitation: true, // Not allowed
        thunderstorms: false,
        icing: false,
      };
      
      const result = evaluateWeatherAgainstMinimums(
        badConditions,
        TrainingLevel.STUDENT_PILOT
      );
      
      expect(result.meets).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should evaluate weather correctly for private pilot', () => {
      const conditions: WeatherConditions = {
        visibility: 5,
        ceiling: 1500,
        windSpeed: 15,
        temperature: 70,
        humidity: 50,
        precipitation: true, // Allowed for private pilot
        thunderstorms: false,
        icing: false,
      };
      
      const result = evaluateWeatherAgainstMinimums(
        conditions,
        TrainingLevel.PRIVATE_PILOT
      );
      
      expect(result.meets).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should evaluate weather correctly for instrument rated', () => {
      const imcConditions: WeatherConditions = {
        visibility: 1, // Very low visibility
        ceiling: 200, // Very low ceiling
        windSpeed: 25,
        temperature: 60,
        humidity: 80,
        precipitation: true,
        thunderstorms: false,
        icing: false,
      };
      
      const result = evaluateWeatherAgainstMinimums(
        imcConditions,
        TrainingLevel.INSTRUMENT_RATED
      );
      
      expect(result.meets).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail for thunderstorms regardless of training level', () => {
      const conditions: WeatherConditions = {
        ...goodConditionsForStudent,
        thunderstorms: true,
      };
      
      const studentResult = evaluateWeatherAgainstMinimums(
        conditions,
        TrainingLevel.STUDENT_PILOT
      );
      const privateResult = evaluateWeatherAgainstMinimums(
        conditions,
        TrainingLevel.PRIVATE_PILOT
      );
      const instrumentResult = evaluateWeatherAgainstMinimums(
        conditions,
        TrainingLevel.INSTRUMENT_RATED
      );
      
      expect(studentResult.meets).toBe(false);
      expect(privateResult.meets).toBe(false);
      expect(instrumentResult.meets).toBe(false);
    });

    it('should fail for icing regardless of training level', () => {
      const conditions: WeatherConditions = {
        ...goodConditionsForStudent,
        icing: true,
      };
      
      const studentResult = evaluateWeatherAgainstMinimums(
        conditions,
        TrainingLevel.STUDENT_PILOT
      );
      const privateResult = evaluateWeatherAgainstMinimums(
        conditions,
        TrainingLevel.PRIVATE_PILOT
      );
      const instrumentResult = evaluateWeatherAgainstMinimums(
        conditions,
        TrainingLevel.INSTRUMENT_RATED
      );
      
      expect(studentResult.meets).toBe(false);
      expect(privateResult.meets).toBe(false);
      expect(instrumentResult.meets).toBe(false);
    });
  });
});

