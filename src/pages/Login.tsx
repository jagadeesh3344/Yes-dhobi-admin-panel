import React from 'react';
import { WashingMachine, EyeOff, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left side banner */}
      <div className="w-1/2 bg-[#1B5083] p-12 flex flex-col justify-between text-white hidden lg:flex">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg text-blue-600">
            <WashingMachine className="h-6 w-6" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight">Yes Dhobi</h1>
        </div>
        
        <div className="max-w-md">
          <div className="bg-white/10 rounded-2xl overflow-hidden mb-8 aspect-[4/3] flex items-center justify-center relative">
             <div className="absolute inset-0 bg-[#72A59F]" />
             <div className="relative z-10 w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
               {/* Decorative element representing laundry basket */}
               <div className="w-24 h-24 border-4 border-white border-dashed rounded-full border-t-transparent animate-[spin_10s_linear_infinite]" />
               <WashingMachine className="absolute text-white h-12 w-12" />
             </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Platform Back-Office</h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Manage partner laundry shops, track riders live, clear verifications, and monitor daily processed orders across India.
          </p>
        </div>
        
        <div className="text-sm text-blue-200">
          &copy; 2026 Yes Dhobi Technologies. All rights reserved.
        </div>
      </div>
      
      {/* Right side login form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In to Admin</h2>
            <p className="text-gray-500">Enter your corporate credentials to access the back-office dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Work Email Address</label>
              <Input type="email" placeholder="admin@yesdhobi.com" defaultValue="admin@yesdhobi.com" className="h-11" required />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900">Password</label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Forgot Password?</a>
              </div>
              <div className="relative">
                <Input type="password" placeholder="••••••••••••••••" defaultValue="password123" className="h-11 pr-10" required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeOff className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" defaultChecked />
              <label htmlFor="remember" className="text-sm text-gray-600">Keep me signed in on this device</label>
            </div>
            
            <Button type="submit" className="w-full h-11 text-base bg-[#3B5BFF] hover:bg-blue-700">
              Access Dashboard
            </Button>
          </form>
          
          <div className="mt-24 p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start space-x-3 text-amber-800">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
            <p className="text-sm font-medium leading-snug">
              This workspace is monitored. Unauthorized login attempts are logged and flagged with security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
