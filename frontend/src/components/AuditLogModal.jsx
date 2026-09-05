import React, { useEffect, useState } from 'react';
import { fetchDecisions } from '../services/api';
import { FileText, X, CheckCircle, AlertTriangle, ShieldAlert, PauseCircle } from 'lucide-react';

export default function AuditLogModal({ isOpen, onClose }) {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchDecisions()
        .then(data => setDecisions(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getActionBadge = (action) => {
    switch (action) {
      case 'APPROVE':
        return <span className="badge badge-low">APPROVE</span>;
      case 'HOLD':
        return <span className="badge badge-medium">HOLD</span>;
      case 'ESCALATE':
        return <span className="badge badge-critical">ESCALATE</span>;
      case 'REQUEST_VERIFICATION':
        return <span className="badge badge-info">VERIFY 2FA</span>;
      default:
        return <span className="badge badge-neutral">{action}</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div className="panel" style={{ maxWidth: '840px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={16} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Immutable Decision Audit Trail
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Cryptographic log of analyst reviews and automated system determinations
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              Loading audit logs...
            </div>
          ) : decisions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No decisions recorded yet. Take an action on any transaction in the queue to generate audit entries.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {decisions.map((d) => (
                <div key={d.id} className="card-item" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getActionBadge(d.action)}
                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {d.tx_code}
                      </span>
                      <span style={{ fontSize: '12px', color: '#93c5fd', fontVariantNumeric: 'tabular-nums' }}>
                        (₹{d.amount ? d.amount.toLocaleString() : '0'})
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(d.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
                    {d.rationale}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-disabled)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Signer: {d.decision_by}</span>
                    <span className="font-mono">Ref: {d.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
