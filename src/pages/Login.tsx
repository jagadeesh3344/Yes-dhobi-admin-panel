import React, { useState } from 'react';
import { WashingMachine, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { api, ApiError } from '@/lib/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useData();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('admin@yesdhobi.com');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async () => {
    setError(null);
    try {
      await api.post('/auth/admin/forgot-password', { email: email.trim() });
      setForgotSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send reset code');
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left side: Clean White Login Form with Clear Logo (No Box) */}
      {/* Left side: Clean White Login Form with Clear Logo */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-10 bg-white">
        <div /> {/* Top spacer to keep layout beautifully centered */}

        {/* Center: Brand Logo & Sign in form grouped with clean spacing */}
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-4">
            <img
              src="/yesdhobi-official-logo.png"
              alt="yes dhobi"
              className="h-9 sm:h-10 w-auto object-contain select-none"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Sign In to Admin
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your corporate credentials to access the back-office dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900">Work Email Address</label>
              <Input
                type="email"
                placeholder="admin@yesdhobi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 text-xs sm:text-sm bg-slate-50/70 border-slate-200 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">Password</label>
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10 text-xs sm:text-sm bg-slate-50/70 border-slate-200 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {forgotSent && (
                <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                  A reset code was emailed to {email}. Use POST /auth/admin/reset-password to set a new password.
                </p>
              )}
              {error && (
                <p className="text-[11px] font-semibold text-red-600 mt-1" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 font-medium cursor-pointer">
                Keep me signed in on this device
              </label>
            </div>

            <Button
              disabled={submitting}
              type="submit"
              className="w-full h-11 text-sm font-bold bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Access Dashboard
            </Button>
          </form>
        </div>

        {/* Footer for Left Side */}
        <div className="w-full max-w-sm mx-auto text-xs text-slate-400 pb-2">
          &copy; 2026 Yes Dhobi Technologies. All rights reserved.
        </div>
      </div>

      {/* Right side: Royal Blue Platform Showcase */}
      <div className="w-1/2 bg-gradient-to-br from-[#1b4cb8] via-[#163a9e] to-[#0d2a70] p-12 lg:p-16 flex flex-col justify-between text-white hidden lg:flex relative overflow-hidden">
        {/* Subtle ambient lighting effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Spacer */}
        <div className="relative z-10 h-6" />

        {/* Center: Laundry Presentation Card & Platform Info */}
        <div className="max-w-md mx-auto w-full relative z-10 my-auto py-6">
          <div className="bg-white/10 rounded-2xl overflow-hidden mb-8 aspect-[16/10] flex items-center justify-center relative shadow-2xl border border-white/20">
            <img
              src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80"
              alt="Laundry Basket Platform"
              className="w-full h-full object-cover object-center brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>

          <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Platform Back-Office</h2>
          <p className="text-blue-100 text-sm leading-relaxed opacity-90 mb-6">
            Manage partner laundry shops, track riders live, clear verifications, and monitor daily processed orders across India.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
              <div className="text-base font-black text-white">4-Pass</div>
              <div className="text-[11px] text-blue-200">OTP Handover</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
              <div className="text-base font-black text-white">Real-Time</div>
              <div className="text-[11px] text-blue-200">Rider GPS</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
              <div className="text-base font-black text-white">24/7</div>
              <div className="text-[11px] text-blue-200">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Bottom copyright on right */}
        <div className="text-xs text-blue-200/80 font-medium relative z-10">
          Yes Dhobi Enterprise Cloud Platform &bull; v2.4.0
        </div>
      </div>
    </div>
  );
}
