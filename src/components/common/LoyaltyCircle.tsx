import React from 'react';
import { Gift, Check, Clock, Sparkles } from 'lucide-react';

interface LoyaltyCircleProps {
  approvedSteps: number; // 0 - 10
  pendingSteps?: number;
  rewardAvailable: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  cycleNumber?: number;
  qualifyingItemName?: string;
  businessName?: string;
}

export const LoyaltyCircle: React.FC<LoyaltyCircleProps> = ({
  approvedSteps,
  pendingSteps = 0,
  rewardAvailable,
  size = 'md',
  showLabels = true,
  cycleNumber = 1,
  qualifyingItemName = 'Visit',
  businessName
}) => {
  const totalSlots = 10;
  
  // Dimensions based on size
  const config = {
    sm: { radius: 52, stroke: 7, centerSize: 'w-14 h-14', text: 'text-xs', icon: 16, box: 'w-32 h-32' },
    md: { radius: 76, stroke: 9, centerSize: 'w-24 h-24', text: 'text-sm', icon: 22, box: 'w-48 h-48' },
    lg: { radius: 98, stroke: 11, centerSize: 'w-32 h-32', text: 'text-base', icon: 28, box: 'w-64 h-64' }
  }[size];

  const center = config.radius + config.stroke + 10;
  const viewBoxSize = center * 2;

  // Generate 10 circular nodes around circumference
  const nodes = Array.from({ length: totalSlots }).map((_, index) => {
    const stepNumber = index + 1;
    // Angle starting from top (-90 deg), clockwise
    const angle = (index / totalSlots) * 2 * Math.PI - Math.PI / 2;
    const x = center + config.radius * Math.cos(angle);
    const y = center + config.radius * Math.sin(angle);

    const isApproved = stepNumber <= approvedSteps;
    const isPending = !isApproved && stepNumber <= approvedSteps + pendingSteps;

    return {
      stepNumber,
      x,
      y,
      isApproved,
      isPending
    };
  });

  return (
    <div className="flex flex-col items-center select-none">
      <div className={`relative flex items-center justify-center ${config.box}`}>
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full transform transition-transform duration-500"
        >
          {/* Subtle background guide ring */}
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke="rgba(226, 232, 240, 0.7)"
            strokeWidth={config.stroke * 0.4}
            strokeDasharray="2 3"
          />

          {/* Connecting filled arc for approved steps */}
          {approvedSteps > 0 && (
            <circle
              cx={center}
              cy={center}
              r={config.radius}
              fill="none"
              stroke="#d97706" // Warm Amber-600
              strokeWidth={config.stroke * 0.5}
              strokeDasharray={`${(approvedSteps / 10) * (2 * Math.PI * config.radius)} ${2 * Math.PI * config.radius}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              transform={`rotate(-90 ${center} ${center})`}
            />
          )}

          {/* Pending arc */}
          {pendingSteps > 0 && (
            <circle
              cx={center}
              cy={center}
              r={config.radius}
              fill="none"
              stroke="#f59e0b" // Amber-500
              strokeWidth={config.stroke * 0.5}
              strokeDasharray={`${(pendingSteps / 10) * (2 * Math.PI * config.radius)} ${2 * Math.PI * config.radius}`}
              strokeDashoffset={`-${(approvedSteps / 10) * (2 * Math.PI * config.radius)}`}
              strokeLinecap="round"
              strokeOpacity="0.6"
              className="transition-all duration-700 ease-out"
              transform={`rotate(-90 ${center} ${center})`}
            />
          )}

          {/* Individual step nodes (1 to 10) */}
          {nodes.map(node => {
            const nodeRadius = size === 'sm' ? 8 : size === 'md' ? 11 : 14;
            return (
              <g key={node.stepNumber} className="transition-all duration-300">
                {/* Outer shadow / pulse if active */}
                {node.isApproved && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius + 2}
                    fill="rgba(217, 119, 6, 0.15)"
                  />
                )}
                {node.isPending && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius + 2}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={
                    node.isApproved
                      ? '#d97706' // Deep Warm Amber
                      : node.isPending
                      ? '#fef3c7' // Light amber pending
                      : '#ffffff'
                  }
                  stroke={
                    node.isApproved
                      ? '#b45309'
                      : node.isPending
                      ? '#f59e0b'
                      : '#cbd5e1'
                  }
                  strokeWidth={node.isApproved ? 2 : 1.5}
                  className="transition-colors duration-300"
                />

                {/* Node inner symbol: checkmark if approved, clock if pending, or number */}
                {node.isApproved ? (
                  <text
                    x={node.x}
                    y={node.y + (size === 'sm' ? 3 : 4)}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={size === 'sm' ? '9' : size === 'md' ? '11' : '13'}
                    fontWeight="bold"
                  >
                    ✓
                  </text>
                ) : node.isPending ? (
                  <text
                    x={node.x}
                    y={node.y + (size === 'sm' ? 3 : 4)}
                    textAnchor="middle"
                    fill="#d97706"
                    fontSize={size === 'sm' ? '8' : size === 'md' ? '10' : '12'}
                    fontWeight="bold"
                  >
                    •
                  </text>
                ) : (
                  <text
                    x={node.x}
                    y={node.y + (size === 'sm' ? 3.5 : 4.5)}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={size === 'sm' ? '8' : size === 'md' ? '10' : '12'}
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {node.stepNumber}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Central Core: The 11th "ON US" Reward Hub */}
        <div
          className={`absolute rounded-full flex flex-col items-center justify-center p-2 text-center transition-all duration-500 shadow-sm border ${
            config.centerSize
          } ${
            rewardAvailable
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 border-amber-400 text-white ring-4 ring-amber-300/40 shadow-amber-500/20'
              : approvedSteps === 10
              ? 'bg-amber-600 text-white border-amber-700'
              : 'bg-white border-slate-200/90 text-slate-800'
          }`}
        >
          {rewardAvailable ? (
            <div className="flex flex-col items-center">
              <Sparkles className="w-5 h-5 text-amber-100 animate-bounce" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-100 mt-0.5">
                11th ON US
              </span>
              <span className="text-xs font-bold leading-tight">Unlocked!</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                Cycle {cycleNumber}
              </span>
              <div className="flex items-baseline gap-0.5 my-0.5">
                <span className="font-extrabold text-lg text-slate-900 leading-none">
                  {approvedSteps}
                </span>
                <span className="text-xs text-slate-400 font-medium leading-none">
                  /10
                </span>
              </div>
              <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tight">
                11th On Us
              </span>
            </div>
          )}
        </div>
      </div>

      {showLabels && (
        <div className="mt-3 text-center max-w-[280px]">
          {rewardAvailable ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs">
              <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Circle Complete — Next {qualifyingItemName} is On Us!</span>
            </div>
          ) : approvedSteps === 10 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>10 of 10 Completed — 11th Reward Ready!</span>
            </div>
          ) : approvedSteps === 9 ? (
            <p className="text-xs font-bold text-amber-800 bg-amber-50/60 px-2.5 py-1 rounded-full border border-amber-200">
              1 more {qualifyingItemName} until your 11th is on {businessName || 'us'}!
            </p>
          ) : pendingSteps > 0 ? (
            <div className="text-xs text-amber-800 bg-amber-50/60 px-2.5 py-1 rounded-full border border-amber-200 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>{approvedSteps}</strong> approved • <strong>{pendingSteps}</strong> pending approval
              </span>
            </div>
          ) : approvedSteps === 0 ? (
            <p className="text-xs text-slate-500 font-medium">
              Circle #{cycleNumber} started • Complete 10 to earn your 11th on us
            </p>
          ) : (
            <p className="text-xs text-slate-600 font-medium">
              <strong className="text-slate-900 font-bold">{approvedSteps} of 10</strong> visits completed • {10 - approvedSteps} to go
            </p>
          )}
        </div>
      )}
    </div>
  );
};
