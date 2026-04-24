import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { adminAPI } from '../services/api';

export default function Analytics() {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ total: 0, count: 0, commission: 0 });
  const [loading, setLoading] = useState(true);

  const fetchReport = async (p: string) => {
    try {
      setLoading(true);
      const response = await adminAPI.getEarningsReport({ groupBy: p });
      setData(response.data.data);
      setTotals(response.data.totals);
    } catch (error) {
      console.error('Failed to fetch earnings report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data on mount
  useEffect(() => {
    fetchReport(period);
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            fetchReport(e.target.value);
          }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(totals.total)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Rides</p>
          <p className="text-3xl font-bold text-gray-900">{totals.count}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Commission</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(totals.commission)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Earnings Over Time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis tickFormatter={(value) => `₹${value}`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3B82F6"
                name="Total Revenue"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="commission"
                stroke="#10B981"
                name="Commission"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}