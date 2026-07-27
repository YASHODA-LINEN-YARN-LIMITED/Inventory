/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { 
  LayoutDashboard, Package, MapPin, Users, ShoppingCart, 
  ScanLine, Menu, X, Bell, LogOut, Sun, Moon, Database, Settings, ArrowRightLeft,
  CheckSquare, FileText, Video
} from 'lucide-react';
import { cn } from './lib/utils';
import { GlobalSearch } from './components/GlobalSearch';
import { TutorialModal } from './components/TutorialModal';
// Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Masters from './pages/Masters';
import Procurement from './pages/Procurement';
import MaterialIssue from './pages/MaterialIssue';
import Approvals from './pages/Approvals';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import GateRegister from './pages/GateRegister';
import Login from './pages/Login';

function Layout({ children }: { children: React.ReactNode }) {
  const { initApp, isSyncing, user, login, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Masters', path: '/masters', icon: Database },
    { name: 'Gate Entry', path: '/gate', icon: MapPin },
    { name: 'Procurement', path: '/procurement', icon: ShoppingCart },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Material Issue', path: '/issue', icon: ArrowRightLeft },
    { name: 'Approvals', path: '/approvals', icon: CheckSquare },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col text-gray-900 dark:text-gray-100 transition-colors">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center shrink-0 mr-4">
              <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                <Database className="w-8 h-8 shrink-0" />
                <span className="hidden md:block whitespace-nowrap">Yashoda</span>
                <span className="md:hidden whitespace-nowrap">ERP</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 items-center space-x-1 overflow-x-auto px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              ))}
            </nav>
            
            <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-gray-200 dark:border-zinc-800 shrink-0 gap-2">
              <button 
                onClick={() => setIsTutorialOpen(true)}
                className="bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                title="Watch App Video Tutorial & Operating Guide"
              >
                <Video className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span>Video Tutorial</span>
              </button>

              {isSyncing && <span className="text-xs text-gray-500 animate-pulse mr-2">Syncing...</span>}
              {user ? (
                <button onClick={logout} className="p-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Logout
                </button>
              ) : (
                <button onClick={login} className="p-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors">
                  Login
                </button>
              )}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden shrink-0 gap-1">
              <button 
                onClick={() => setIsTutorialOpen(true)}
                className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
              >
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tutorial</span>
              </button>
              <div className="flex items-center">
                 {isSyncing && <span className="text-xs text-gray-500 animate-pulse mr-2">Syncing...</span>}
                 <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    title="Toggle Theme"
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 shrink-0" /> : <Menu className="w-6 h-6 shrink-0" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-lg absolute w-full">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => { setMobileMenuOpen(false); setIsTutorialOpen(true); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
              >
                <Video className="w-5 h-5 text-indigo-600 shrink-0" />
                🎥 Watch App Video Tutorial & Guide
              </button>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 md:px-6 py-4">
        {children}
      </main>

      {/* Floating Tutorial Action Launcher Button */}
      <button
        onClick={() => setIsTutorialOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs transition-transform hover:scale-105 active:scale-95 group border border-white/20"
        title="App Video Tutorial & Operating Manual"
      >
        <Video className="w-5 h-5 shrink-0 animate-bounce" />
        <span className="hidden sm:inline">Watch App Tutorial</span>
      </button>

      {/* Tutorial Modal */}
      <TutorialModal 
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}

function AppRoutes() {
  const { user } = useApp();
  return (
    <Routes>
      {user ? (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/masters" element={<Masters />} />
          <Route path="/gate" element={<GateRegister />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/issue" element={<MaterialIssue />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}

