import { useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

export default function Settings() {
  const [pricing, setPricing] = useState({
    baseFareBike: 20,
    baseFareAuto: 30,
    baseFareCab: 50,
    perKmBike: 8,
    perKmAuto: 12,
    perKmCab: 18,
    perMinuteBike: 1,
    perMinuteAuto: 1.5,
    perMinuteCab: 2,
    surgeMultiplier: 1.3,
    surgeThreshold: 30
  });

  const [commission, setCommission] = useState(15);

  const handlePricingSave = async () => {
    try {
      // Update pricing for each vehicle type
      await Promise.all([
        adminAPI.updatePricing({
          vehicleType: 'bike',
          baseFare: pricing.baseFareBike,
          perKmRate: pricing.perKmBike,
          perMinuteRate: pricing.perMinuteBike,
          surgeMultiplier: pricing.surgeMultiplier,
          surgeThreshold: pricing.surgeThreshold
        }),
        adminAPI.updatePricing({
          vehicleType: 'auto',
          baseFare: pricing.baseFareAuto,
          perKmRate: pricing.perKmAuto,
          perMinuteRate: pricing.perMinuteAuto,
          surgeMultiplier: pricing.surgeMultiplier,
          surgeThreshold: pricing.surgeThreshold
        }),
        adminAPI.updatePricing({
          vehicleType: 'cab',
          baseFare: pricing.baseFareCab,
          perKmRate: pricing.perKmCab,
          perMinuteRate: pricing.perMinuteCab,
          surgeMultiplier: pricing.surgeMultiplier,
          surgeThreshold: pricing.surgeThreshold
        })
      ]);
      toast.success('Pricing updated successfully');
    } catch (error) {
      console.error('Failed to update pricing:', error);
      toast.error('Failed to update pricing');
    }
  };

  const handleCommissionSave = async () => {
    try {
      await adminAPI.updateCommission(commission);
      toast.success('Commission updated successfully');
    } catch (error) {
      console.error('Failed to update commission:', error);
      toast.error('Failed to update commission');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Fare Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Fare Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bike Base Fare (₹)
            </label>
            <input
              type="number"
              value={pricing.baseFareBike}
              onChange={(e) => setPricing({ ...pricing, baseFareBike: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto Base Fare (₹)
            </label>
            <input
              type="number"
              value={pricing.baseFareAuto}
              onChange={(e) => setPricing({ ...pricing, baseFareAuto: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cab Base Fare (₹)
            </label>
            <input
              type="number"
              value={pricing.baseFareCab}
              onChange={(e) => setPricing({ ...pricing, baseFareCab: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bike Rate per Km (₹)
            </label>
            <input
              type="number"
              step="0.1"
              value={pricing.perKmBike}
              onChange={(e) => setPricing({ ...pricing, perKmBike: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto Rate per Km (₹)
            </label>
            <input
              type="number"
              step="0.1"
              value={pricing.perKmAuto}
              onChange={(e) => setPricing({ ...pricing, perKmAuto: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cab Rate per Km (₹)
            </label>
            <input
              type="number"
              step="0.1"
              value={pricing.perKmCab}
              onChange={(e) => setPricing({ ...pricing, perKmCab: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bike Rate per Minute (₹)
            </label>
            <input
              type="number"
              step="0.1"
              value={pricing.perMinuteBike}
              onChange={(e) => setPricing({ ...pricing, perMinuteBike: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto Rate per Minute (₹)
            </label>
            <input
              type="number"
              step="0.1"
              value={pricing.perMinuteAuto}
              onChange={(e) => setPricing({ ...pricing, perMinuteAuto: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cab Rate per Minute (₹)
            </label>
            <input
              type="number"
              step="0.1"
              value={pricing.perMinuteCab}
              onChange={(e) => setPricing({ ...pricing, perMinuteCab: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Surge Multiplier
            </label>
            <input
              type="number"
              step="0.05"
              value={pricing.surgeMultiplier}
              onChange={(e) => setPricing({ ...pricing, surgeMultiplier: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Surge Threshold (active rides)
            </label>
            <input
              type="number"
              value={pricing.surgeThreshold}
              onChange={(e) => setPricing({ ...pricing, surgeThreshold: Number(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
        <button
          onClick={handlePricingSave}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Fare Settings
        </button>
      </div>

      {/* Commission Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Commission Settings</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commission Rate: {commission}%
          </label>
          <input
            type="range"
            min="5"
            max="30"
            value={commission}
            onChange={(e) => setCommission(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>5%</span>
            <span>30%</span>
          </div>
        </div>
        <button
          onClick={handleCommissionSave}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Commission
        </button>
      </div>
    </div>
  );
}