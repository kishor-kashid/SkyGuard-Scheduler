import { useState, useEffect } from 'react';
import { getDemoScenarios, DemoScenario } from '../services/weather.service';

export function useWeather() {
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await getDemoScenarios();
      setScenarios(data.scenarios);
      setDemoModeEnabled(data.demoModeEnabled);
    } catch (error) {
      console.error('Failed to load weather scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    scenarios,
    demoModeEnabled,
    loading,
    refetch: loadScenarios,
  };
}

