import React from 'react';
import { AlertTriangle, DollarSign, Zap, Smartphone, Store, MapPin } from 'lucide-react';

export default function RiskFactors({ factors = [] }) {
  const factorMeta = {
    'Unusual amount': { weight: 25, desc: 'Much larger than user\'s typical transactions', icon: DollarSign },
    'High velocity': { weight: 20, desc: 'Many transactions in a short time window', icon: Zap },
    'New device': { weight: 20, desc: 'High-value transaction from unrecognized device', icon: Smartphone },
    'Merchant risk': { weight: 20, desc: 'New merchant account with large transaction', icon: Store },
    'Location anomaly': { weight: 15, desc: 'Transaction from unusual location', icon: MapPin },
  };

  return (
    <div className="panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Triggered Risk Signals ({factors.length})
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Rule Engine Evaluation
        </span>
      </div>

      {factors.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)' }}>
          No deterministic risk signals triggered for this transaction.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {factors.map((factor, idx) => {
            const meta = factorMeta[factor] || { weight: 15, desc: 'Suspicious heuristic violation', icon: AlertTriangle };
            const Icon = meta.icon;

            return (
              <div
                key={idx}
                className="card-item"
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f87171',
                    flexShrink: 0
                  }}>
                    <Icon size={14} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>
                      {factor}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {meta.desc}
                    </span>
                  </div>
                </div>

                <span className="badge badge-critical font-mono" style={{ flexShrink: 0 }}>
                  +{meta.weight}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
