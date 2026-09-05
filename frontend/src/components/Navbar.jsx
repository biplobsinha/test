import React from 'react';
import { Shield, FileText, Database } from 'lucide-react';

export default function Navbar({ onOpenAuditLog, transactionCount = 0 }) {
  return (
    <header style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1440px',
        margin: '0 auto'
      }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#1d4ed8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Shield size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '15px',
                fontWeight: '700',
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)'
              }}>
                RiskForge
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}>
                FRAUD OPS CONSOLE
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Automated Forensic Analysis & Real-Time Decisioning
            </p>
          </div>
        </div>

        {/* System Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <Database size={13} color="#10b981" />
            <span>PaySim Dataset</span>
            <span className="status-dot status-dot-green"></span>
          </div>

          <button 
            onClick={onOpenAuditLog}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <FileText size={14} />
            <span>Audit Trail</span>
          </button>
        </div>

      </div>
    </header>
  );
}
