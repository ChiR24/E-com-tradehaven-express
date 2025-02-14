import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DNSAnomaly } from '@/types/dns';

interface AlertConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AlertConfig) => void;
  currentConfig?: AlertConfig;
}

interface AlertConfig {
  notifyOnCritical: boolean;
  notifyOnHigh: boolean;
  notifyOnMedium: boolean;
  notificationMethods: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
  thresholds: {
    responseTime: number;
    failureRate: number;
    anomalyCount: number;
  };
}

export function AlertConfigDialog({
  isOpen,
  onClose,
  onSave,
  currentConfig,
}: AlertConfigDialogProps) {
  const [config, setConfig] = useState<AlertConfig>(
    currentConfig || {
      notifyOnCritical: true,
      notifyOnHigh: true,
      notifyOnMedium: false,
      notificationMethods: {
        email: true,
        slack: false,
        webhook: false,
      },
      thresholds: {
        responseTime: 500,
        failureRate: 10,
        anomalyCount: 5,
      },
    }
  );

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isOpen ? 'visible' : 'invisible'
      }`}
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative w-full max-w-lg">
        <CardHeader>
          <CardTitle>Alert Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Severity Levels */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Notify on Severity Levels
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.notifyOnCritical}
                  onChange={(e) =>
                    setConfig({ ...config, notifyOnCritical: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                />
                <Badge variant="error">Critical</Badge>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.notifyOnHigh}
                  onChange={(e) =>
                    setConfig({ ...config, notifyOnHigh: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                />
                <Badge variant="warning">High</Badge>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.notifyOnMedium}
                  onChange={(e) =>
                    setConfig({ ...config, notifyOnMedium: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                />
                <Badge variant="info">Medium</Badge>
              </label>
            </div>
          </div>

          {/* Notification Methods */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Notification Methods
            </div>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(config.notificationMethods).map(([method, enabled]) => (
                <label
                  key={method}
                  className="flex items-center gap-2 rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        notificationMethods: {
                          ...config.notificationMethods,
                          [method]: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  />
                  <span className="capitalize">{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Thresholds */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Thresholds</div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">
                  Response Time (ms)
                </label>
                <input
                  type="number"
                  value={config.thresholds.responseTime}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      thresholds: {
                        ...config.thresholds,
                        responseTime: parseInt(e.target.value),
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Failure Rate (%)
                </label>
                <input
                  type="number"
                  value={config.thresholds.failureRate}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      thresholds: {
                        ...config.thresholds,
                        failureRate: parseInt(e.target.value),
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Anomaly Count (per hour)
                </label>
                <input
                  type="number"
                  value={config.thresholds.anomalyCount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      thresholds: {
                        ...config.thresholds,
                        anomalyCount: parseInt(e.target.value),
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Save Configuration
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 