import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';

export default function TransactionList({
  transactions = [],
  selectedTxId,
  onSelectTx,
  activeFilter,
  onFilterChange
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const codeMatch = tx.tx_code?.toLowerCase().includes(term);
      const userMatch = tx.user_name?.toLowerCase().includes(term);
      const merchantMatch = tx.merchant_name?.toLowerCase().includes(term);
      const idMatch = tx.id?.toLowerCase().includes(term);
      const amountMatch = tx.amount?.toString().includes(term);
      return codeMatch || userMatch || merchantMatch || idMatch || amountMatch;
    });
  }, [transactions, searchTerm]);

  const getRiskBadge = (score, level) => {
    let cls = 'badge-low';
    if (level === 'CRITICAL' || score >= 85) cls = 'badge-critical';
    else if (level === 'HIGH' || score >= 70) cls = 'badge-high';
    else if (level === 'MEDIUM' || score >= 40) cls = 'badge-medium';

    return <span className={`badge ${cls}`}>{score ?? 0}</span>;
  };

  const getStatusIcon = (status) => {
    if (status === 'FLAGGED' || status === 'HELD' || status === 'ESCALATED') {
      return <AlertTriangle size={12} color="#f97316" />;
    }
    return <ShieldCheck size={12} color="#10b981" />;
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>
      
      {/* Panel Header */}
      <div className="panel-header" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Investigation Queue
          </span>
          <span className="badge badge-neutral font-mono">
            {filteredTransactions.length}
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            className="input-control"
            placeholder="Search Tx, Account ID, Merchant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '30px', fontSize: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {['ALL', 'FLAGGED', 'APPROVED'].map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: activeFilter === filter ? 'var(--accent-primary)' : 'var(--border-subtle)',
                backgroundColor: activeFilter === filter ? 'var(--accent-primary-subtle)' : 'transparent',
                color: activeFilter === filter ? '#60a5fa' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No transactions match the criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredTransactions.map((tx) => {
              const isSelected = tx.id === selectedTxId || tx.tx_code === selectedTxId;
              const formattedAmount = tx.amount ? `₹${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0.00';

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTx(tx.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--border-focus)' : 'transparent',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getStatusIcon(tx.status)}
                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {tx.tx_code}
                      </span>
                    </div>
                    {getRiskBadge(tx.risk_score, tx.risk_level)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ fontWeight: '600', color: '#93c5fd', fontVariantNumeric: 'tabular-nums' }}>
                      {formattedAmount}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.user_name || tx.user_id}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'var(--text-disabled)' }}>
                    <span>{tx.location || 'Unknown'}</span>
                    <span>{tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
