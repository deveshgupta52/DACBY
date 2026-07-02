
import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('create'); // Start on 'create' page as requested in Step 5

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 z-10">
        <div>
          {/* Logo Brand */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800 space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              D
            </div>
            <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              DACBY
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ml-auto"></div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-inner'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-inner'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Create Order</span>
            </button>
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-slate-300 border border-slate-700">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">Administrator</p>
              <p className="text-[10px] text-slate-500 truncate">admin@dacby.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 min-w-0 relative">
        {activeTab === 'create' ? <CreateOrder /> : <Dashboard />}
      </main>
    </div>
  );
}

export default App;
