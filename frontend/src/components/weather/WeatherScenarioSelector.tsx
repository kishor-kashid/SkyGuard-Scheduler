import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getDemoScenarios, setDemoScenario, triggerWeatherCheck } from '../../services/weather.service';
import { DemoScenario } from '../../services/weather.service';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Cloud, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export function WeatherScenarioSelector() {
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const { user } = useAuthStore();

  // Only admins can use this feature
  const canUse = user?.role === 'ADMIN';

  useEffect(() => {
    if (canUse) {
      loadScenarios();
    }
  }, [canUse]);

  const loadScenarios = async () => {
    try {
      const data = await getDemoScenarios();
      setScenarios(data.scenarios);
      setDemoModeEnabled(data.demoModeEnabled);
    } catch (error: any) {
      toast.error('Failed to load demo scenarios');
    }
  };

  const handleScenarioChange = async (scenarioId: string) => {
    if (!scenarioId) {
      setSelectedScenarioId('');
      return;
    }

    setLoading(true);
    try {
      await setDemoScenario(scenarioId);
      setSelectedScenarioId(scenarioId);
      toast.success(`Demo scenario set to: ${scenarios.find(s => s.id === scenarioId)?.name}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to set demo scenario');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCheck = async () => {
    if (!demoModeEnabled) {
      toast.error('Please enable demo mode first');
      return;
    }

    setTriggering(true);
    try {
      await triggerWeatherCheck();
      toast.success('Weather check triggered for all upcoming flights');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to trigger weather check');
    } finally {
      setTriggering(false);
    }
  };

  if (!canUse) {
    return null;
  }

  return (
    <Card title="Demo Mode Controls" className="mb-6">
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Demo Mode:</strong> Use pre-built weather scenarios to test the system without real weather API calls.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Weather Scenario
          </label>
          <Select
            value={selectedScenarioId}
            onChange={(e) => handleScenarioChange(e.target.value)}
            disabled={loading}
            options={[
              { value: '', label: 'No scenario selected (use real weather)' },
              ...scenarios.map(s => ({
                value: s.id,
                label: `${s.name} - ${s.description}`,
              })),
            ]}
          />
        </div>

        {selectedScenarioId && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Selected Scenario:</p>
            <p className="text-xs text-gray-600">
              {scenarios.find(s => s.id === selectedScenarioId)?.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Affects: {scenarios.find(s => s.id === selectedScenarioId)?.affectsTrainingLevels.join(', ') || 'None'}
            </p>
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleTriggerCheck}
          isLoading={triggering}
          disabled={!demoModeEnabled || !selectedScenarioId}
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          Trigger Weather Check for All Flights
        </Button>

        {!demoModeEnabled && (
          <p className="text-xs text-yellow-600">
            ⚠️ Demo mode must be enabled to use scenarios. Use the toggle in the weather page.
          </p>
        )}
      </div>
    </Card>
  );
}

