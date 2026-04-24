import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  TruckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface DashboardData {
  users: { total: number; active: number };
  drivers: { total: number; approved: number; pending: number; online: number };
  rides: { today: number; completed: number; completionRate: number };
  earnings: { total: number; driverEarnings: number; commission: number };
  recentRides: any[];
  activeSOS: number;
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboard(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load dashboard data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Failed to load dashboard data</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Riders',
      value: dashboard.users.total,
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Drivers',
      value: `${dashboard.drivers.online} / ${dashboard.drivers.total}`,
      icon: TruckIcon,
      color: 'bg-green-500',
    },
    {
      name: "Today's Rides",
      value: dashboard.rides.today,
      icon: ChartBarIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total Earnings',
      value: formatCurrency(dashboard.earnings.total),
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rides */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Rides</h2>
            <ArrowsRightLeftIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {dashboard.recentRides.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent rides</p>
            ) : (
              dashboard.recentRides.map((ride) => (
                <div
                  key={ride._id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{ride.rideId}</p>
                    <p className="text-sm text-gray-500">
                      {ride.rider?.name} - {ride.vehicleType}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(ride.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ride.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : ride.status === 'ongoing'
                        ? 'bg-blue-100 text-blue-800'
                        : ride.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {ride.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Driver Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Driver Summary</h2>
              <UserGroupIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.drivers.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Active Now</p>
                <p className="text-2xl font-bold text-green-600">{dashboard.drivers.online}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{dashboard.drivers.approved}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{dashboard.drivers.pending}</p>
              </div>
            </div>
          </div>

          {/* Ride Completion */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ride Overview</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-bold text-green-600">{dashboard.rides.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${dashboard.rides.completionRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed Today</span>
                <span className="font-bold">{dashboard.rides.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Rides</span>
                <span className="font-bold">{dashboard.rides.today}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SOS Alert Banner */}
      {dashboard.activeSOS > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {dashboard.activeSOS} active SOS alert{dashboard.activeSOS > 1 ? 's' : ''} right now!
              </p>
              <p className="mt-1 text-sm text-red-700">
                Please check the SOS Alerts page immediately.
              </p>
            </div>
            <div className="ml-auto">
              <a
                href="/sos"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                View Alerts
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}