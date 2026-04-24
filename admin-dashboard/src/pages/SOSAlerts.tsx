import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

interface SOSAlert {
  _id: string;
  user: { name: string; phone: string };
  driver?: { user: { name: string } };
  location: { coordinates: number[] };
  status: string;
  createdAt: string;
}

export default function SOSAlerts() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const response = await adminAPI.getSOSAlerts(filter);
      setAlerts(response.data.data);
    } catch (error) {
      toast.error('Failed to load SOS alerts');
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      await adminAPI.resolveSOSAlert(id);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const openInMaps = (coordinates: number[]) => {
    const [lng, lat] = coordinates;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">SOS Alerts</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'active' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">No SOS alerts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-xl font-bold">!</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      SOS Alert from {alert.user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{alert.user.phone}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => openInMaps(alert.location.coordinates)}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Location on Map →
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    alert.status === 'active'
                      ? 'bg-red-100 text-red-800'
                      : alert.status === 'acknowledged'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {alert.status}
                  </span>
                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => resolveAlert(alert._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}