import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const promoSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters'),
  type: z.enum(['percentage', 'fixed', 'referral']),
  discount: z.number().min(0),
  usageLimit: z.number().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  vehicleTypes: z.array(z.string()).optional(),
});

type PromoForm = z.infer<typeof promoSchema>;

interface PromoCode {
  _id: string;
  code: string;
  type: string;
  discount: number;
  isActive: boolean;
  usedCount: number;
  usageLimit: number | null;
  validFrom: string;
  validUntil: string;
}

export default function PromoCodes() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromoForm>({
    resolver: zodResolver(promoSchema),
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPromoCodes();
      setPromos(response.data.data);
    } catch (error) {
      console.error('Failed to load promo codes:', error);
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const createPromo = async (data: PromoForm) => {
    try {
      await adminAPI.createPromoCode(data);
      toast.success('Promo code created');
      setShowModal(false);
      reset();
      fetchPromos();
    } catch (error) {
      toast.error('Failed to create promo code');
    }
  };

  const togglePromo = async (id: string, isActive: boolean) => {
    try {
      await adminAPI.togglePromoCode(id, !isActive);
      setPromos(promos.map(p =>
        p._id === id ? { ...p, isActive: !isActive } : p
      ));
      toast.success(`Promo code ${isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      console.error('Failed to toggle promo:', error);
      toast.error('Failed to update promo code');
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Promo Code
        </button>
      </div>

      {/* Promo Codes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validity
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
              {promos.map((promo) => (
                <tr key={promo._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-900">
                    {promo.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {promo.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {promo.type === 'percentage' ? `${promo.discount}%` : `₹${promo.discount}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {promo.usedCount} / {promo.usageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(promo.validFrom).toLocaleDateString()} -{' '}
                    {new Date(promo.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                      promo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => togglePromo(promo._id, promo.isActive)}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${
                        promo.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {promo.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No promo codes yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Promo Code</h3>
            <form onSubmit={handleSubmit(createPromo)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  {...register('code')}
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  {...register('type')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount</label>
                <input
                  {...register('discount', { valueAsNumber: true })}
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valid From</label>
                <input
                  {...register('validFrom')}
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                <input
                  {...register('validUntil')}
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}