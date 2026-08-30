import React, { useState } from 'react';
import { WashingMachine, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('admin@yesdhobi.com');
  const [password, setPassword] = useState('••••••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left side banner */}
      <div className="w-1/2 bg-gradient-to-br from-[#1b4cb8] via-[#163a9e] to-[#0d2a70] p-12 flex flex-col justify-between text-white hidden lg:flex">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-md shadow-black/10">
            <WashingMachine className="h-6 w-6" />
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight">Yes Dhobi</h1>
        </div>
        
        <div className="max-w-md">
          {/* Laundry Basket Presentation Card */}
          <div className="bg-white/10 rounded-2xl overflow-hidden mb-8 aspect-[16/10] flex items-center justify-center relative shadow-2xl border border-white/20">
            <img
              src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80"
              alt="Laundry Basket Platform"
              className="w-full h-full object-cover object-center brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
          </div>

          <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Platform Back-Office</h2>
          <p className="text-blue-100 text-sm leading-relaxed opacity-90">
            Manage partner laundry shops, track riders live, clear verifications, and monitor daily processed orders across India.
          </p>
        </div>
        
        <div className="text-xs text-blue-200/80 font-medium">
          &copy; 2026 Yes Dhobi Technologies. All rights reserved.
        </div>
      </div>
      
      {/* Right side login form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-10">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile brand header */}
          <div className="flex items-center space-x-2.5 mb-8 lg:hidden">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-600/20">
              <WashingMachine className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900">Yes Dhobi</h1>
              <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">ADMIN PANEL</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Sign In to Admin</h2>
            <p className="text-xs sm:text-sm text-slate-500">Enter your corporate credentials to access the back-office dashboard</p>
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
                  onClick={() => setForgotSent(true)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••••••"
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
                  Reset link sent to security administrator ({email}).
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
              type="submit"
              className="w-full h-11 text-sm font-bold bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Access Dashboard
            </Button>
          </form>
          
          <div className="mt-10 p-3.5 bg-amber-50/90 rounded-xl border border-amber-200/80 flex items-start space-x-3 text-amber-900">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="text-xs font-medium leading-snug">
              This workspace is monitored. Unauthorized login attempts are logged and flagged with security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
