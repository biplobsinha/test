import React from 'react';
import { Activity, ShieldAlert, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';

export default function MetricsHeader({ stats, loading }) {
  const formatCurrency = (val) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
  };

  const metricCards = [
    {
      label: 'Transactions Ingested',
      value: stats ? stats.total_transactions.toLocaleString() : '—',
      subtext: 'PaySim Live DB',
      icon: Activity,
      color: '#3b82f6'
    },
    {
      label: 'Flagged For Review',
      value: stats ? stats.flagged_count.toLocaleString() : '—',
      subtext: `${stats ? stats.fraud_rate_pct : 0}% queue rate`,
      icon: ShieldAlert,
      color: '#ef4444'
    },
    {
      label: 'Approved Transactions',
      value: stats ? stats.approved_count.toLocaleString() : '—',
      subtext: 'Low-risk throughput',
      icon: CheckCircle2,
      color: '#10b981'
    },
    {
      label: 'Total Volume Evaluated',
      value: stats ? formatCurrency(stats.total_amount) : '—',
      subtext: `Avg ${formatCurrency(stats?.average_amount)}/tx`,
      icon: DollarSign,
      color: '#8b5cf6'
    },
    {
      label: 'Mean Risk Score',
      value: stats ? `${stats.average_risk_score}/100` : '—',
      subtext: 'Composite risk index',
      icon: TrendingUp,
      color: '#f59e0b'
    }
  ];

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px'
      }}>
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="panel"
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  {card.label}
                </span>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2'
                }}>
                  {loading ? '...' : card.value}
                </div>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  display: 'block'
                }}>
                  {card.subtext}
                </span>
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: `${card.color}15`,
                border: `1px solid ${card.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                flexShrink: 0
              }}>
                <Icon size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
