import React, { useState } from 'react';
import { Check, ShieldAlert, PauseCircle, PhoneCall, ArrowRight, ShieldCheck, X } from 'lucide-react';

export default function RecommendationPanel({ recommendation, currentStatus, onAction, isSubmitting }) {
  const [rationale, setRationale] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);

  const handleActionClick = (action) => {
    setSelectedAction(action);
  };

  const handleConfirmSubmit = () => {
    if (!selectedAction) return;
    onAction(selectedAction, rationale || `Analyst action ${selectedAction} confirmed.`);
    setSelectedAction(null);
    setRationale('');
  };

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case 'APPROVE':
        return { badgeClass: 'badge-low', text: 'Approve Transaction', icon: Check };
      case 'REQUEST_VERIFICATION':
        return { badgeClass: 'badge-info', text: 'Request Multi-Factor Verification', icon: PhoneCall };
      case 'HOLD':
        return { badgeClass: 'badge-medium', text: 'Hold Settlement for Review', icon: PauseCircle };
      case 'ESCALATE':
        return { badgeClass: 'badge-critical', text: 'Escalate to Fraud Operations', icon: ShieldAlert };
      default:
        return { badgeClass: 'badge-neutral', text: rec || 'Hold for Review', icon: PauseCircle };
    }
  };

  const recMeta = getRecommendationBadge(recommendation);
  const RecIcon = recMeta.icon;

  return (
    <div className="panel" style={{ padding: '20px' }}>
      
      {/* AI Recommendation Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-app)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)'
          }}>
            <RecIcon size={16} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Engine Recommendation
            </span>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '1px' }}>
              {recMeta.text}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status:</span>
          <span className="badge badge-neutral font-mono">
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Analyst Decision Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Analyst Decision Actions
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Signed to audit trail
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
        <button 
          onClick={() => handleActionClick('APPROVE')} 
          disabled={isSubmitting}
          className="btn btn-success"
        >
          <Check size={13} />
          <span>Approve</span>
        </button>

        <button 
          onClick={() => handleActionClick('REQUEST_VERIFICATION')} 
          disabled={isSubmitting}
          className="btn btn-secondary"
        >
          <PhoneCall size={13} />
          <span>Verify 2FA</span>
        </button>

        <button 
          onClick={() => handleActionClick('HOLD')} 
          disabled={isSubmitting}
          className="btn btn-warning"
        >
          <PauseCircle size={13} />
          <span>Hold Payout</span>
        </button>

        <button 
          onClick={() => handleActionClick('ESCALATE')} 
          disabled={isSubmitting}
          className="btn btn-danger"
        >
          <ShieldAlert size={13} />
          <span>Escalate</span>
        </button>
      </div>

      {/* Decision Rationale Modal */}
      {selectedAction && (
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
          padding: '16px'
        }}>
          <div className="panel" style={{ maxWidth: '440px', width: '100%', padding: '20px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Confirm Decision: {selectedAction}
              </h3>
              <button 
                onClick={() => setSelectedAction(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Provide the reasoning for this operational action. This record will be cryptographically hashed into the immutable audit trail.
            </p>

            <textarea 
              rows={3}
              className="input-control"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="e.g. Account owner verified via phone confirmation. Releasing hold on settlement."
              style={{ width: '100%', resize: 'vertical', marginBottom: '16px', fontSize: '12px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => setSelectedAction(null)}
                className="btn btn-outline"
                style={{ fontSize: '12px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSubmit}
                className="btn btn-primary"
                style={{ fontSize: '12px' }}
              >
                Sign & Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
