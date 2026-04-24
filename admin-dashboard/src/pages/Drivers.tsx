import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Driver {
  _id: string;
  user: { name: string; email: string; phone: string };
  vehicle: { type: string; registrationNumber: string };
  isApproved: boolean;
  isActive: boolean;
  isOnline: boolean;
  averageRating: number;
  totalRides: number;
  createdAt: string;
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

   const fetchDrivers = async () => {
     try {
       const response = await adminAPI.getDrivers();
       setDrivers(response.data.data);
     } catch (error) {
       console.error('Failed to load drivers:', error);
       toast.error('Failed to load drivers');
     } finally {
       setLoading(false);
     }
   };

   const handleApprove = async (driverId: string, isApproved: boolean) => {
     try {
       await adminAPI.approveDriver(driverId, isApproved);
       setDrivers(drivers.map(d =>
         d._id === driverId ? { ...d, isApproved } : d
       ));
       toast.success(`Driver ${isApproved ? 'approved' : 'rejected'} successfully`);
     } catch (error) {
       console.error('Failed to approve driver:', error);
       toast.error('Failed to update driver approval');
     }
   };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Drivers</p>
          <p className="text-2xl font-bold">{drivers.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Active Now</p>
          <p className="text-2xl font-bold text-green-600">
            {drivers.filter(d => d.isOnline).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">
            {drivers.filter(d => !d.isApproved).length}
          </p>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {driver.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {driver.user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {driver.vehicle.type}
                    </div>
                    <div className="text-sm text-gray-500">
                      {driver.vehicle.registrationNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.averageRating.toFixed(1)} ★ ({driver.totalRides})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${
                        driver.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {driver.isOnline ? 'Online' : 'Offline'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${
                        driver.isApproved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {driver.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {!driver.isApproved && (
                      <button
                        onClick={() => handleApprove(driver._id, true)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 mr-2"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No drivers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}