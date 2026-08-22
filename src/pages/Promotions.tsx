import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Ticket, Users, Wallet, Download, Trash2, Edit3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';
import { PromoModal } from '@/components/modals/PromoModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { Promotion } from '@/types';
import { exportToCsv } from '@/lib/exportCsv';
import { useToast } from '@/context/ToastContext';

export default function Promotions() {
  const { promotions, deletePromotion, togglePromotionStatus } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoToEdit, setPromoToEdit] = useState<Promotion | null>(null);
  const [promoToDelete, setPromoToDelete] = useState<Promotion | null>(null);

  const filteredPromos = useMemo(() => {
    return promotions.filter(
      (p) =>
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [promotions, searchQuery]);

  const activeCount = promotions.filter((p) => p.status === 'Active').length;
  const totalUses = promotions.reduce((s, p) => s + p.usedCount, 0);

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_promotions_coupons',
      filteredPromos.map((p) => ({
        PromoCode: p.code,
        Title: p.title,
        Type: p.type,
        DiscountValue: p.discountValue,
        MinOrderINR: p.minOrder,
        TimesUsed: p.usedCount,
        MaxUsageLimit: p.maxUses,
        ValidityTerm: p.validity,
        Status: p.status,
      }))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Campaigns & Coupon Codes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Launch promo discounts, free delivery triggers, referral bonuses, and customer acquisition campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV ({filteredPromos.length})
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setPromoToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Promo Code
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Campaigns</p>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{activeCount} Coupons</h3>
          </div>
          <Ticket className="w-8 h-8 text-blue-600 p-1.5 bg-blue-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customer Redemptions</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {totalUses.toLocaleString()} times
            </h3>
          </div>
          <Users className="w-8 h-8 text-emerald-600 p-1.5 bg-emerald-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated GMV Generated</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">
              ₹{(totalUses * 280).toLocaleString()}
            </h3>
          </div>
          <Wallet className="w-8 h-8 text-indigo-600 p-1.5 bg-indigo-50 rounded-xl" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by promo code or campaign title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-white"
            />
          </div>
          <span className="text-xs font-bold text-slate-500">
            {filteredPromos.length} promotions available
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Promo Code</th>
                <th className="px-5 py-3 whitespace-nowrap">Offer Campaign Title</th>
                <th className="px-5 py-3 whitespace-nowrap">Discount Value</th>
                <th className="px-5 py-3 whitespace-nowrap">Min Order</th>
                <th className="px-5 py-3 whitespace-nowrap">Redemptions</th>
                <th className="px-5 py-3 whitespace-nowrap">Validity Schedule</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">Status</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPromos.map((promo) => (
                <tr key={promo.code} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-mono font-extrabold px-2.5 py-1 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200">
                      {promo.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{promo.title}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-700">
                    {promo.type === 'Percentage' && `${promo.discountValue}% Off`}
                    {promo.type === 'Flat' && `₹${promo.discountValue} Flat Off`}
                    {promo.type === 'Free Delivery' && 'Free Rider Delivery'}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900">
                    ₹{promo.minOrder}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                    <span className="font-bold text-slate-900">{promo.usedCount.toLocaleString()}</span> / {promo.maxUses}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                    {promo.validity}
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {promo.status === 'Active' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    )}
                    {promo.status === 'Expired' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        Expired
                      </span>
                    )}
                    {promo.status === 'Scheduled' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Scheduled
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-semibold px-2.5"
                        onClick={() => {
                          setPromoToEdit(promo);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 text-[10px] font-bold px-2 ${
                          promo.status === 'Active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        onClick={() => togglePromotionStatus(promo.code)}
                      >
                        {promo.status === 'Active' ? 'End Now' : 'Reactivate'}
                      </Button>
                      <button
                        onClick={() => setPromoToDelete(promo)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Code"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPromos.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No promo campaigns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promo Modal */}
      <PromoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPromoToEdit(null);
        }}
        promoToEdit={promoToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!promoToDelete}
        onClose={() => setPromoToDelete(null)}
        onConfirm={() => {
          if (promoToDelete) {
            deletePromotion(promoToDelete.code);
            setPromoToDelete(null);
          }
        }}
        title={`Delete Coupon Code "${promoToDelete?.code || ''}"?`}
        description={`Are you sure you want to permanently delete the promo code "${promoToDelete?.code || ''}" (${promoToDelete?.title || ''})? It will no longer be redeemable at customer checkout.`}
        confirmText="Yes, Delete Code"
      />
    </div>
  );
}
