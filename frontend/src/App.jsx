import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import MetricsHeader from './components/MetricsHeader';
import TransactionList from './components/TransactionList';
import RiskGauge from './components/RiskGauge';
import RiskFactors from './components/RiskFactors';
import AgentFindings from './components/AgentFindings';
import RecommendationPanel from './components/RecommendationPanel';
import AuditLogModal from './components/AuditLogModal';
import { 
  fetchTransactions, 
  fetchTransactionStats, 
  fetchTransactionDetail, 
  investigateTransaction, 
  submitDecision 
} from './services/api';
import { 
  CreditCard, 
  User, 
  Building2, 
  Smartphone, 
  MapPin, 
  Globe, 
  Clock, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  const [userEmail, setUserEmail] = useState('');
  const [showLanding, setShowLanding] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [txDetail, setTxDetail] = useState(null);
  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [investigating, setInvestigating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Load stats & transactions
  const loadData = async (filter = activeFilter) => {
    try {
      setStatsLoading(true);
      const [statsData, txData] = await Promise.all([
        fetchTransactionStats().catch(() => null),
        fetchTransactions(filter, 100)
      ]);
      setStats(statsData);
      setTransactions(txData);
      
      if (txData.length > 0 && !selectedTxId) {
        setSelectedTxId(txData[0].id);
      }
    } catch (err) {
      console.error("Initial data load error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeFilter);
  }, [activeFilter]);

  // Fetch transaction details when selectedTxId changes
  useEffect(() => {
    if (!selectedTxId) return;
    setLoading(true);
    fetchTransactionDetail(selectedTxId)
      .then(data => {
        setTxDetail(data);
        if (data.investigation) {
          setInvestigation(data.investigation);
        } else {
          setInvestigation(null);
        }
      })
      .catch(err => console.error("Detail fetch error:", err))
      .finally(() => setLoading(false));
  }, [selectedTxId]);

  const handleRunAgent = async () => {
    if (!selectedTxId) return;
    setInvestigating(true);
    try {
      const result = await investigateTransaction(selectedTxId);
      setInvestigation(result);
      // Refresh detail
      const updatedDetail = await fetchTransactionDetail(selectedTxId);
      setTxDetail(updatedDetail);
    } catch (err) {
      console.error("Agent error:", err);
      alert("Error running investigation agent.");
    } finally {
      setInvestigating(false);
    }
  };

  const handleAnalystAction = async (action, rationale) => {
    if (!selectedTxId) return;
    setSubmitting(true);
    try {
      await submitDecision(selectedTxId, action, rationale);
      // Refresh detail, transactions list, and stats
      const [updatedDetail, updatedList, updatedStats] = await Promise.all([
        fetchTransactionDetail(selectedTxId),
        fetchTransactions(activeFilter, 100),
        fetchTransactionStats().catch(() => null)
      ]);
      setTxDetail(updatedDetail);
      setTransactions(updatedList);
      if (updatedStats) setStats(updatedStats);
    } catch (err) {
      console.error("Decision submit error:", err);
      alert("Error saving decision to audit log.");
    } finally {
      setSubmitting(false);
    }
  };

  // Show login page if not authenticated
  if (!userEmail) {
    return <LoginPage onLogin={(email) => { setUserEmail(email); setShowLanding(true); }} />;
  }

  // Show landing page after login
  if (showLanding) {
    return <LandingPage onEnterDashboard={() => setShowLanding(false)} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', paddingBottom: '32px' }}>
      <Navbar 
        onOpenAuditLog={() => setIsAuditModalOpen(true)}
        transactionCount={stats?.total_transactions || transactions.length}
      />

      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Real KPI Metrics Ribbon (Replaced tacky HeroBanner) */}
        <MetricsHeader 
          stats={stats}
          loading={statsLoading}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Transaction Queue & Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <TransactionList 
              transactions={transactions}
              selectedTxId={selectedTxId}
              onSelectTx={(id) => setSelectedTxId(id)}
              activeFilter={activeFilter}
              onFilterChange={(f) => setActiveFilter(f)}
            />

            {/* Transaction Metadata Card */}
            {txDetail && (
              <div className="panel" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Entity Metadata & Attributes
                  </span>
                  <span className="badge badge-neutral font-mono">
                    {txDetail.tx_code}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  
                  {/* Amount */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={13} />
                      Amount
                    </span>
                    <strong style={{ color: '#93c5fd', fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>
                      ₹{txDetail.amount ? txDetail.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </strong>
                  </div>

                  {/* Sender */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} />
                      Origin Account
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {txDetail.user?.id || txDetail.user_id}
                    </span>
                  </div>

                  {/* Destination */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={13} />
                      Destination
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {txDetail.merchant?.id || txDetail.merchant_id}
                    </span>
                  </div>

                  {/* Device Profile */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={13} />
                      Hardware Trust
                    </span>
                    <span className={txDetail.is_new_device ? 'badge badge-critical' : 'badge badge-low'}>
                      {txDetail.is_new_device ? 'Unverified / New' : 'Recognized'}
                    </span>
                  </div>

                  {/* Location */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} />
                      Location
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {txDetail.location || 'Unknown'}
                    </span>
                  </div>

                  {/* IP Address */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Globe size={13} />
                      IP Routing
                    </span>
                    <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      {txDetail.ip_address || '127.0.0.1'}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} />
                      Timestamp
                    </span>
                    <span className="font-mono" style={{ color: 'var(--text-disabled)', fontSize: '11px' }}>
                      {txDetail.timestamp ? new Date(txDetail.timestamp).toLocaleString() : '—'}
                    </span>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Forensic Analysis Workstation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {loading ? (
              <div className="panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Loading transaction evaluation...
              </div>
            ) : txDetail ? (
              <>
                {/* Top Row: Risk Gauge (Left) + Risk Factors (Right) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px' }}>
                  <RiskGauge 
                    score={txDetail.risk_score || 0}
                    level={txDetail.risk_level || 'LOW'}
                  />
                  <RiskFactors 
                    factors={txDetail.risk_factors || []}
                  />
                </div>

                {/* AI Agent Findings Panel */}
                <AgentFindings 
                  investigation={investigation}
                  onRunAgent={handleRunAgent}
                  isLoading={investigating}
                />

                {/* Recommendation & Action Panel */}
                <RecommendationPanel 
                  recommendation={investigation ? investigation.recommendation : (txDetail.risk_score >= 70 ? 'ESCALATE' : txDetail.risk_score >= 40 ? 'HOLD' : 'APPROVE')}
                  currentStatus={txDetail.status}
                  onAction={handleAnalystAction}
                  isSubmitting={submitting}
                />
              </>
            ) : null}

          </div>

        </div>

      </main>

      {/* Audit Log Modal */}
      <AuditLogModal 
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
}
