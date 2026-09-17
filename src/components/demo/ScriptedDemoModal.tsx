import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Gift,
  ShieldAlert,
  Play,
  RotateCcw,
  X,
  Layers,
  Store,
  Smartphone,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

interface ScriptedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptedDemoModal: React.FC<ScriptedDemoModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    jumpToDemoStep,
    currentDemoStep,
    resetDemoData,
    switchRole
  } = useApp();

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: '1. Business Workspace (Owner Grace N.)',
      roleTarget: 'business_owner',
      description: 'Observe Bella Salon Command Centre. Review active programmes, customer retention, and commercial consumption status (~$1/unit).',
      icon: Store,
      badge: 'Owner Experience'
    },
    {
      step: 2,
      title: '2. Frontline Counter Terminal (Staff Diane K.)',
      roleTarget: 'frontline_staff',
      description: 'Staff counter ready for rapid customer service. Notice customer Amina N. currently sitting at 8 of 10 approved steps.',
      icon: Smartphone,
      badge: 'Staff Counter'
    },
    {
      step: 3,
      title: '3. Diane records Amina’s 9th Haircut',
      roleTarget: 'frontline_staff',
      description: 'Staff enters 1 qualifying purchase. Immediate feedback: 9 of 10! Exactly 1 visit away from the 11th on Bella Salon.',
      icon: CheckCircle2,
      badge: 'Live Event'
    },
    {
      step: 4,
      title: '4. Participant Mobile View (Customer Amina N.)',
      roleTarget: 'participant',
      description: 'Switch to Amina’s phone. Live synchronization shows her Loyalty Circle now at 9/10 with high anticipation!',
      icon: Smartphone,
      badge: 'Participant'
    },
    {
      step: 5,
      title: '5. Staff Records the 10th Qualifying Haircut!',
      roleTarget: 'frontline_staff',
      description: 'Diane records the 10th visit. Instantly triggers "Circle Completed! 11th ON US Unlocked!" Generates unique redemption code.',
      icon: Gift,
      badge: 'Key Milestone'
    },
    {
      step: 6,
      title: '6. Amina Sees Celebratory "Your Next One is On Us"',
      roleTarget: 'participant',
      description: 'Customer wallet unlocks celebratory gold card: "Your next Premium Haircut is on Bella Salon!" Ready to redeem in-store.',
      icon: Sparkles,
      badge: 'Emotional Payoff'
    },
    {
      step: 7,
      title: '7. Frontline Staff Redeems Reward & Cycle 2 Starts',
      roleTarget: 'frontline_staff',
      description: 'Staff taps "Redeem 11th Reward". Amina receives her free service. System archives Cycle #1 and automatically starts Cycle #2 at 0/10.',
      icon: RotateCcw,
      badge: 'Lifecycle Continuity'
    },
    {
      step: 8,
      title: '8. Owner Reviews Commercial Usage Position',
      roleTarget: 'business_owner',
      description: 'Grace inspects Commercial Ledger. Completed 10+1 circle is billed at ~$1 USD. Remaining trial and grace period clearly displayed.',
      icon: Store,
      badge: 'Consumption Accounting'
    },
    {
      step: 9,
      title: '9. Exception Journey: Approval Centre (Manager Patrick M.)',
      roleTarget: 'business_manager',
      description: 'Jean-Luc entered 3 units in one visit (exceeds threshold of 2). Held safely in Approval Centre until manager reviews.',
      icon: Clock,
      badge: 'Exception Handling'
    },
    {
      step: 10,
      title: '10. Platform Operator Console (Marcus T.)',
      roleTarget: 'platform_operator',
      description: 'Switch to 11thONUS Console. Platform metrics reflect live completed circles, audit history, and trust investigations.',
      icon: ShieldCheck,
      badge: 'Operator Command'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              11
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                11thONUS Experience Reference Walkthrough
              </h2>
              <p className="text-xs text-slate-500">
                Test cross-functional live synchronization across Owner, Staff, Customer, and Operator.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scripted Step Selector */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100">
          {demoSteps.map(item => {
            const Icon = item.icon;
            const isCurrent = currentDemoStep === item.step;
            return (
              <div
                key={item.step}
                onClick={() => {
                  jumpToDemoStep(item.step);
                  onClose();
                }}
                className={`p-3 rounded-xl transition cursor-pointer flex items-start justify-between gap-3 ${
                  isCurrent
                    ? 'bg-amber-50 border border-amber-300'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isCurrent
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shrink-0 flex items-center gap-1 shadow-2xs">
                  <Play className="w-3 h-3 text-amber-600 fill-amber-600" />
                  <span>Run Step</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              resetDemoData();
              onClose();
            }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Default Benchmark (Amina at 8/10)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
          >
            Close & Explore Freely
          </button>
        </div>
      </div>
    </div>
  );
};
