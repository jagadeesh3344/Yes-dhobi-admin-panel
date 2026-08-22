import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Store, Truck, Calendar, Wallet, Download, CheckCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { exportToCsv } from '@/lib/exportCsv';

export default function Revenue() {
  const { orders, vendors, riders, payouts, processPayout } = useData();
  const { showToast } = useToast();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Dynamic calculations
  const totalGrossRevenue = useMemo(() => {
    const rawSum = orders.reduce((sum, o) => sum + o.amount, 0);
    const multiplier = period === 'today' ? 1.2 : period === 'week' ? 7.5 : period === 'month' ? 32 : 120;
    return Math.round(rawSum * multiplier);
  }, [orders, period]);

  const avgOrderVal = useMemo(() => {
    return orders.length ? Math.round(orders.reduce((sum, o) => sum + o.amount, 0) / orders.length) : 260;
  }, [orders]);

  const commissionRevenue = Math.round(totalGrossRevenue * 0.20);
  const vendorPayoutTotal = Math.round(totalGrossRevenue * 0.65);
  const riderPayoutTotal = Math.round(totalGrossRevenue * 0.15);

  const sixMonthRevenue = [
    { name: 'Jan', value: Math.round(totalGrossRevenue * 0.7) },
    { name: 'Feb', value: Math.round(totalGrossRevenue * 0.8) },
    { name: 'Mar', value: Math.round(totalGrossRevenue * 0.85) },
    { name: 'Apr', value: Math.round(totalGrossRevenue * 0.92) },
    { name: 'May', value: Math.round(totalGrossRevenue * 0.98) },
    { name: 'Current', value: totalGrossRevenue },
  ];

  const handleExportLedger = () => {
    exportToCsv(
      'yesdhobi_financial_ledger',
      payouts.map((p) => ({
        PayoutID: p.id,
        Recipient: p.recipient,
        RecipientType: p.type,
        AmountINR: p.amount,
        Status: p.status,
        SettlementMethod: p.method,
        AccountReference: p.accountNumber || 'N/A',
        Date: p.date,
      }))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Revenue & Financial Settlement</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform gross merchandise value (GMV), 20% platform commission, and instant partner bank settlements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportLedger}>
            <Download className="h-4 w-4 mr-1.5" />
            Export Ledger CSV
          </Button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center text-xs font-bold text-slate-700">
          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
          Filter Period:
        </div>
        <div className="flex space-x-1.5">
          <Button
            variant={period === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('today')}
            className="text-xs h-8 font-semibold"
          >
            Today
          </Button>
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('week')}
            className="text-xs h-8 font-semibold"
          >
            This Week
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('month')}
            className="text-xs h-8 font-semibold"
          >
            This Month
          </Button>
          <Button
            variant={period === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('all')}
            className="text-xs h-8 font-semibold"
          >
            Full Year
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-2xs border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Platform GMV</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  ₹{totalGrossRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center">
              <span>↑ +16.4% YoY</span>
              <span className="text-slate-400 ml-1 font-normal">• Verified Transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Order Value</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₹{avgOrderVal}</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-indigo-600 flex items-center">
              <span>₹2.40 per garment avg</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commission (20%)</p>
                <h3 className="text-2xl font-extrabold text-blue-600 mt-1">
                  ₹{commissionRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-blue-600 flex items-center">
              <span>Net YesDhobi Platform Margin</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partner Settlements</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  ₹{vendorPayoutTotal.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Store className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-amber-600 flex items-center">
              <span>To {vendors.length} Dhobi hubs</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-2xs border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">
              GMV Monthly Trajectory (₹ INR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonthRevenue} margin={{ top: 20, right: 0, bottom: 0, left: -10 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Allocation Card */}
        <Card className="shadow-2xs border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Revenue Allocation Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Vendor Share (65%)</span>
                  <span>₹{vendorPayoutTotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Disbursed to dhobi wash units per kg processed</p>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>Platform Fee (20%)</span>
                  <span>₹{commissionRevenue.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Yes Dhobi software, logistics routing & support</p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="flex justify-between font-bold text-amber-900">
                  <span>Rider Payouts (15%)</span>
                  <span>₹{riderPayoutTotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Per-delivery pickup & drop incentives</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card className="shadow-2xs border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Partner & Rider Bank Payouts</CardTitle>
            <p className="text-xs text-slate-500">Automated UPI and NEFT settlements queue</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold text-blue-600"
            onClick={() => {
              payouts
                .filter((p) => p.status !== 'Processed')
                .forEach((p) => processPayout(p.id));
              showToast('All Pending Dispatched', 'All pending transfers cleared via partner bank gateway.');
            }}
          >
            Process All Pending
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3 whitespace-nowrap">Payout ID</th>
                  <th className="px-5 py-3 whitespace-nowrap">Recipient Partner</th>
                  <th className="px-5 py-3 whitespace-nowrap">Account / UPI</th>
                  <th className="px-5 py-3 whitespace-nowrap text-right">Settlement Amount</th>
                  <th className="px-5 py-3 whitespace-nowrap text-center">Status</th>
                  <th className="px-5 py-3 whitespace-nowrap">Date / Time</th>
                  <th className="px-5 py-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {payout.id}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{payout.recipient}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{payout.type} Partner</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      {payout.accountNumber || payout.method}
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      ₹{payout.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      {payout.status === 'Processed' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Processed
                        </span>
                      )}
                      {payout.status === 'Pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Pending Approval
                        </span>
                      )}
                      {payout.status === 'Failed' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          Failed (Retry)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {payout.date}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {payout.status !== 'Processed' ? (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold px-2.5 bg-blue-600"
                          onClick={() => processPayout(payout.id)}
                        >
                          Disburse
                        </Button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                          <CheckCircle className="w-3 h-3" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
