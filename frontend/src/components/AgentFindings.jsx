import React, { useState } from 'react';
import { Search, FileText, CheckCircle2, ShieldAlert, Cpu, Sparkles, AlertCircle } from 'lucide-react';

export default function AgentFindings({ investigation, onRunAgent, isLoading }) {
  const [activeTab, setActiveTab] = useState('findings');

  if (!investigation) {
    return (
      <div className="panel" style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--accent-primary-subtle)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          margin: '0 auto 14px auto'
        }}>
          <Cpu size={20} />
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Automated Forensic Investigation
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
          Trigger the multi-agent investigation pipeline to query historical customer velocity, evaluate merchant risk records, retrieve relevant compliance & AML policies, and generate an evidence-backed recommendation.
        </p>
        <button 
          onClick={onRunAgent} 
          disabled={isLoading}
          className="btn btn-primary"
          style={{ padding: '8px 18px', fontSize: '13px' }}
        >
          {isLoading ? (
            <>
              <span className="status-dot status-dot-amber" style={{ animation: 'pulse 1s infinite' }}></span>
              <span>Running Database & Policy Forensic Engine...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Run Automated Forensic Agent</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const { findings = [], retrieved_policies = [], explanation = "" } = investigation;

  const formatExplanation = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} style={{ height: '6px' }} />;

      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        const headerText = trimmed.replace(/\*\*/g, '');
        return (
          <h5 key={idx} style={{ fontSize: '12px', fontWeight: '700', color: '#93c5fd', marginTop: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {headerText}
          </h5>
        );
      }

      if (trimmed.startsWith('- ')) {
        const bulletContent = trimmed.substring(2);
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px', paddingLeft: '4px' }}>
            <span style={{ color: 'var(--accent-primary)', fontSize: '12px', lineHeight: '1.5' }}>•</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {bulletContent.replace(/\*\*(.*?)\*\*/g, '$1')}
            </span>
          </div>
        );
      }

      return (
        <p key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '4px' }}>
          {line.replace(/\*\*(.*?)\*\*/g, '$1')}
        </p>
      );
    });
  };

  return (
    <div className="panel" style={{ padding: '20px' }}>
      
      {/* Header with Clean Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-primary-subtle)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <Cpu size={15} />
          </div>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Forensic Evidence & Policy Retrieval
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Grounded multi-source verification
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button 
            onClick={() => setActiveTab('findings')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'findings' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'findings' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            Evidence Items ({findings.length})
          </button>
          <button 
            onClick={() => setActiveTab('policies')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'policies' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'policies' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            Retrieved Policies ({retrieved_policies.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Findings */}
      {activeTab === 'findings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Evidence Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {findings.map((f, i) => (
              <div 
                key={i} 
                className="card-item"
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <span className="badge badge-info font-mono" style={{ marginTop: '1px', flexShrink: 0 }}>
                  EVD-{i + 1}
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>
                  {f}
                </p>
              </div>
            ))}
          </div>

          {/* Explanation Box */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginTop: '4px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '8px'
            }}>
              <FileText size={13} color="var(--accent-primary)" />
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Forensic Analysis Synthesis
              </span>
            </div>

            <div style={{ padding: '0 2px' }}>
              {formatExplanation(explanation)}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Policies */}
      {activeTab === 'policies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {retrieved_policies.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No specific policy documents retrieved for this incident profile.
            </div>
          ) : (
            retrieved_policies.map((p, i) => (
              <div 
                key={i} 
                className="card-item"
                style={{ padding: '14px 16px' }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} color="#60a5fa" />
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>
                        {p.title}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {p.filename}
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-info">
                    RAG CITATION
                  </span>
                </div>

                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  backgroundColor: 'var(--bg-app)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-sans)'
                }}>
                  {p.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
