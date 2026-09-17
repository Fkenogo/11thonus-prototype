/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/common/TopBar';
import { BusinessWorkspace } from './components/business/BusinessWorkspace';
import { StaffCounterExperience } from './components/business/StaffCounterExperience';
import { ParticipantExperience } from './components/participant/ParticipantExperience';
import { OperatorConsole } from './components/operator/OperatorConsole';
import { ScriptedDemoModal } from './components/demo/ScriptedDemoModal';
import { X, CheckCircle2, AlertTriangle, Sparkles, Info } from 'lucide-react';

function AppContent() {
  const {
    activeRole,
    deviceView,
    toasts,
    dismissToast
  } = useApp();

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const isMobileRole = activeRole === 'participant' || activeRole === 'frontline_staff' || activeRole === 'business_owner' || activeRole === 'business_manager';
  const shouldWrapInPhone = isMobileRole && deviceView === 'mobile_frame';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex flex-col">
      {/* Top Application Bar & Role Switcher */}
      <TopBar onOpenDemoGuide={() => setIsDemoModalOpen(true)} />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 transition-all">
        {shouldWrapInPhone ? (
          /* Realistic Mobile Phone Frame Container */
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-[420px] bg-slate-900 p-3 rounded-[40px] shadow-2xl border-4 border-slate-800">
              {/* Phone Speaker & Notch */}
              <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-950/80 mr-2" />
                <div className="w-8 h-1 bg-slate-700 rounded-full" />
              </div>

              {/* Phone Display Screen */}
              <div className="bg-[#f8f9fa] rounded-[32px] overflow-y-auto max-h-[740px] p-2.5 sm:p-3 shadow-inner">
                {activeRole === 'participant' && (
                  <ParticipantExperience />
                )}
                {activeRole === 'frontline_staff' && (
                  <StaffCounterExperience />
                )}
                {(activeRole === 'business_owner' || activeRole === 'business_manager') && (
                  <BusinessWorkspace />
                )}
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
            </div>

            <p className="text-xs text-slate-500 mt-3 font-medium">
              Simulating mobile-first touch interface • Switch to responsive desktop in top bar
            </p>
          </div>
        ) : (
          /* Normal Responsive View */
          <div>
            {(activeRole === 'business_owner' || activeRole === 'business_manager') && (
              <BusinessWorkspace />
            )}

            {activeRole === 'frontline_staff' && (
              <StaffCounterExperience />
            )}

            {activeRole === 'participant' && (
              <ParticipantExperience />
            )}

            {activeRole === 'platform_operator' && (
              <OperatorConsole />
            )}
          </div>
        )}
      </main>

      {/* Interactive Scripted Demo Tour Modal */}
      <ScriptedDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-xs flex items-start justify-between gap-3 transition-all transform translate-y-0 ${
              toast.type === 'celebrate'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400'
                : toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                : toast.type === 'warning'
                ? 'bg-amber-50 text-amber-950 border-amber-300'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'celebrate' ? (
                <Sparkles className="w-4 h-4 text-amber-200 shrink-0 mt-0.5" />
              ) : toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{toast.title}</div>
                <div className={`mt-0.5 ${toast.type === 'celebrate' ? 'text-amber-100' : 'text-slate-600'}`}>
                  {toast.description}
                </div>
              </div>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
