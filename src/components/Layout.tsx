import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  Truck,
  ListOrdered,
  IndianRupee,
  Layers,
  TicketPercent,
  ShieldCheck,
  Headphones,
  Settings,
  Bell,
  Search,
  WashingMachine,
  Radio,
  Activity,
  Trash2,
  LogOut,
  ChevronDown,
  X,
  Menu,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { BroadcastModal } from '@/components/modals/BroadcastModal';

const sidebarLinks = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Vendors', path: '/vendors', icon: Store },
  { name: 'Riders', path: '/riders', icon: Truck, badgeKey: 'onlineRiders' },
  { name: 'Orders', path: '/orders', icon: ListOrdered, badgeKey: 'activeOrders' },
  { name: 'Revenue', path: '/revenue', icon: IndianRupee },
  { name: 'Services', path: '/services', icon: Layers },
  { name: 'Promotions', path: '/promotions', icon: TicketPercent },
  { name: 'Verifications', path: '/verifications', icon: ShieldCheck, badgeKey: 'pendingKYC' },
  { name: 'Support', path: '/support', icon: Headphones, badgeKey: 'openTickets' },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    orders,
    riders,
    verifications,
    tickets,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    isLiveSimulationActive,
    setIsLiveSimulationActive,
  } = useData();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (location.pathname === '/login') {
    return <Outlet />;
  }

  // Dynamic Badges count
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const onlineRidersCount = riders.filter((r) => r.status === 'Online' || r.status === 'On Delivery').length;
  const pendingKYCCount = verifications.filter((v) => v.status === 'Pending Review').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const badgeMap: Record<string, number> = {
    activeOrders: activeOrdersCount,
    onlineRiders: onlineRidersCount,
    pendingKYC: pendingKYCCount,
    openTickets: openTicketsCount,
  };

  // Search matches
  const matchedOrders = searchQuery.trim()
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectSearchResult = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setIsSearchOpen(false);
    setIsMobileSidebarOpen(false);
  };

  const renderSidebarNav = () => (
    <>
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-600/20">
            <WashingMachine className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900">Yes Dhobi</h1>
            <p className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider">ADMIN PANEL</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Live System Status Pill */}
      <div className="px-3 sm:px-4 pt-3 pb-1">
        <button
          onClick={() => setIsLiveSimulationActive((prev) => !prev)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isLiveSimulationActive
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveSimulationActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>{isLiveSimulationActive ? 'Real-Time Sync: ON' : 'Live Sync: PAUSED'}</span>
          </div>
          <Activity className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const badgeValue = link.badgeKey ? badgeMap[link.badgeKey] : 0;

          return (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{link.name}</span>
                  </div>

                  {badgeValue > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : link.badgeKey === 'openTickets' || link.badgeKey === 'pendingKYC'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {badgeValue}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => {
            setIsBroadcastOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-blue-600" />
          <span>Broadcast Alert</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-slate-50/70 font-sans text-slate-900">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 bg-white flex-col fixed inset-y-0 left-0 z-20 shadow-xs">
        {renderSidebarNav()}
      </aside>

      {/* Mobile Backdrop & Slide-out Drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarNav()}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full min-w-0">
        {/* Sticky Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
            {/* Hamburger Mobile Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search with Live Predictive Autocomplete */}
            <div className="relative w-full max-w-[200px] sm:max-w-xs md:max-w-sm lg:w-80" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders, partners, riders..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 text-xs bg-slate-100/80 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Predictive Search Popup */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto">
                  <div className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-2">Matching Records</div>
                  {matchedOrders.length > 0 ? (
                    <div className="space-y-1">
                      {matchedOrders.slice(0, 5).map((ord) => (
                        <button
                          key={ord.id}
                          onClick={() => handleSelectSearchResult('/orders')}
                          className="w-full text-left p-2 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-between text-xs group cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1.5">
                              <span>{ord.id}</span>
                              <span className="font-normal text-slate-500 truncate max-w-[120px] sm:max-w-none">• {ord.customerName}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">{ord.serviceName} • ₹{ord.amount}</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold shrink-0">
                            {ord.status}
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={() => handleSelectSearchResult('/orders')}
                        className="w-full text-center text-xs font-bold text-blue-600 pt-2 border-t border-slate-100 hover:underline cursor-pointer"
                      >
                        View all in Orders page →
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No immediate match found for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Quick Live Mode Toggle (Hidden on small mobile) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="truncate max-w-[130px] lg:max-w-none">Bangalore Central Hub</span>
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center border-2 border-white shadow-xs">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Live Operations Feed</span>
                      {unreadNotifsCount > 0 && (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-slate-500 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 transition-colors cursor-pointer ${
                            notif.read ? 'bg-white opacity-70' : 'bg-blue-50/40 hover:bg-blue-50/70'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-slate-900 text-xs">{notif.title}</h5>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No recent notifications.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative border-l border-slate-200 pl-2 sm:pl-3" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center space-x-2 sm:space-x-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                  alt="Admin User"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">Zoshua Colah</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Platform Owner</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xs:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs font-medium">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">Signed in as</p>
                    <p className="text-[11px] text-slate-500 truncate">admin@yesdhobi.com</p>
                  </div>
                  <NavLink
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>System Settings</span>
                  </NavLink>
                  <NavLink
                    to="/login"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Operator</span>
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page View Container with responsive bounds */}
        <div className="p-3 sm:p-5 md:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Global Broadcast Announcement Modal */}
      <BroadcastModal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} />
    </div>
  );
}

