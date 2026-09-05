import React from 'react';
import { AlertOctagon, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RiskGauge({ score = 0, level = 'LOW', ruleScore = 0, anomalyScore = 0 }) {
  let badgeClass = 'badge-low';
  let color = 'var(--risk-low)';
  let LevelIcon = ShieldCheck;

  if (score >= 85 || level === 'CRITICAL') {
    badgeClass = 'badge-critical';
    color = 'var(--risk-critical)';
    LevelIcon = AlertOctagon;
  } else if (score >= 70 || level === 'HIGH') {
    badgeClass = 'badge-high';
    color = 'var(--risk-high)';
    LevelIcon = AlertTriangle;
  } else if (score >= 40 || level === 'MEDIUM') {
    badgeClass = 'badge-medium';
    color = 'var(--risk-medium)';
    LevelIcon = AlertTriangle;
  }

  return (
    <div className="panel" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Composite Risk Assessment
        </span>
        <span className={`badge ${badgeClass}`}>
          <LevelIcon size={12} />
          {level} RISK
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
          {score}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          / 100 Risk Index
        </span>
      </div>

      {/* Clean Linear Multi-Segment Bar */}
      <div style={{
        height: '6px',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: '3px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '16px'
      }}>
        <div style={{
          width: `${Math.min(score, 100)}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '3px',
          transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Model Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '11px'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Deterministic Rules (60%)</span>
          <strong style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            Score: {ruleScore || Math.round(score * 0.9)}/100
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Statistical Anomaly (40%)</span>
          <strong style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            Score: {anomalyScore || Math.round(score * 1.1)}/100
          </strong>
        </div>
      </div>
    </div>
  );
}
