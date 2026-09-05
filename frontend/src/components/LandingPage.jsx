import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Brain, 
  TrendingUp, 
  Lock, 
  ArrowRight,
  Eye,
  Target,
  Sparkles,
  Database,
  Activity,
  AlertTriangle,
  BarChart3,
  FileSearch
} from 'lucide-react';

export default function LandingPage({ onEnterDashboard }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  // Dark brown accent palette
  const BROWN      = '#C49A5A';   // warm gold-brown for highlights
  const BROWN_DIM  = '#8B6340';   // darker brown
  const BROWN_DEEP = '#5A3820';   // deepest brown

  const features = [
    { icon: Brain,      title: "AI Investigation Agent",   description: "Autonomous AI agent analyzes transactions using advanced tool calling and RAG-powered policy enforcement", color: BROWN },
    { icon: Zap,        title: "Real-Time Detection",      description: "5 rule-based fraud signals combined with statistical anomaly detection for instant risk scoring",           color: BROWN_DIM },
    { icon: FileSearch, title: "RAG Policy Grounding",     description: "Retrieval-Augmented Generation ensures all decisions cite exact compliance policies",                       color: BROWN },
    { icon: Target,     title: "99.8% Accuracy",           description: "Composite risk scoring algorithm with weighted rules achieves industry-leading precision",                  color: BROWN_DIM },
    { icon: Activity,   title: "Live Monitoring",          description: "Real-time KPI dashboards with transaction velocity tracking and fraud rate analytics",                      color: BROWN },
    { icon: Lock,       title: "Immutable Audit Trail",    description: "Every analyst decision recorded with timestamps and rationale for complete compliance",                     color: BROWN_DIM }
  ];

  const stats = [
    { value: "10M+",     label: "Transactions Analyzed",  icon: Database },
    { value: "< 50ms",   label: "Average Detection Time", icon: Zap },
    { value: "99.8%",    label: "Detection Accuracy",     icon: Target },
    { value: "₹500Cr+",  label: "Fraud Prevented",        icon: Shield }
  ];

  const useCases = [
    { icon: TrendingUp,    title: "High-Value Transaction Screening", description: "Automatically flag and investigate transactions exceeding 5x user average with policy-backed reasoning" },
    { icon: AlertTriangle, title: "Velocity Attack Prevention",       description: "Detect rapid-fire transaction bursts and new device anomalies in real-time" },
    { icon: Eye,           title: "Merchant Risk Assessment",         description: "Identify suspicious merchant patterns and geographic location discrepancies instantly" }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #080604 0%, #110d09 50%, #0a0704 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Background Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(139, 99, 64, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 99, 64, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite'
      }} />

      {/* Glowing Orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(139, 99, 64, 0.18) 0%, transparent 70%)',
        filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(90, 56, 32, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', animation: 'float 10s ease-in-out infinite reverse'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px',
              background: `linear-gradient(135deg, ${BROWN_DIM}, ${BROWN_DEEP})`,
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 30px rgba(139,99,64,0.35)`
            }}>
              <Shield size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>
                RiskForge
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: '0.08em' }}>
                AI-POWERED FRAUD DETECTION
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {['Features', 'How It Works', 'Use Cases'].map((label, i) => (
              <a key={i} href={`#${label.toLowerCase().replace(/ /g, '-')}`}
                style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.section 
          initial="initial" animate="animate" variants={staggerChildren}
          style={{ textAlign: 'center', padding: '120px 0 80px', maxWidth: '900px', margin: '0 auto' }}
        >
          <motion.div variants={fadeIn} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 20px',
            background: `rgba(139,99,64,0.15)`,
            border: `1px solid rgba(139,99,64,0.35)`,
            borderRadius: '100px', marginBottom: '32px',
            fontSize: '13px', fontWeight: '600', color: BROWN
          }}>
            <Sparkles size={16} />
            Built for Razorpay AI Buildathon 2026
          </motion.div>

          <motion.h1 variants={fadeIn} className="hero-title">
            Stop Fraud Before
            <br />
            <span className="hero-title-accent">It Costs You Millions</span>
          </motion.h1>

          <motion.p variants={fadeIn} style={{
            fontSize: '20px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7',
            maxWidth: '700px', margin: '0 auto 48px'
          }}>
            AI-powered fraud detection system combining rule-based analysis, anomaly detection, 
            and RAG-enhanced investigation agents for real-time transaction monitoring.
          </motion.p>

          <motion.div variants={fadeIn} style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEnterDashboard} style={{
              padding: '16px 40px', fontSize: '16px', fontWeight: '700', color: 'white',
              background: `linear-gradient(135deg, ${BROWN_DIM}, ${BROWN_DEEP})`,
              border: 'none', borderRadius: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: `0 4px 20px rgba(139,99,64,0.4)`, transition: 'all 0.3s ease'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px rgba(139,99,64,0.6)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = `0 4px 20px rgba(139,99,64,0.4)`; }}
            >
              Launch Dashboard <ArrowRight size={20} />
            </button>

            <button style={{
              padding: '16px 40px', fontSize: '16px', fontWeight: '700', color: 'white',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s ease'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              View Documentation <FileSearch size={20} />
            </button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div variants={fadeIn} style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px',
            marginTop: '80px', padding: '40px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px', backdropFilter: 'blur(10px)'
          }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <stat.icon size={24} color={BROWN} style={{ marginBottom: '12px', marginLeft: 'auto', marginRight: 'auto' }} />
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <section id="features" style={{ padding: '80px 0' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-block', padding: '8px 16px',
              background: `rgba(139,99,64,0.15)`, border: `1px solid rgba(139,99,64,0.3)`,
              borderRadius: '100px', fontSize: '12px', fontWeight: '700', color: BROWN,
              marginBottom: '16px', letterSpacing: '0.05em'
            }}>PLATFORM FEATURES</div>
            <h2 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Enterprise-Grade Fraud Prevention
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
              Combining AI, rules, and policy enforcement for comprehensive protection
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {features.map((feature, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                onMouseEnter={() => setHoveredFeature(idx)} onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  padding: '32px',
                  background: hoveredFeature === idx ? 'rgba(139,99,64,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${hoveredFeature === idx ? 'rgba(139,99,64,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '16px', transition: 'all 0.3s ease', cursor: 'pointer',
                  transform: hoveredFeature === idx ? 'translateY(-4px)' : 'translateY(0)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{
                  width: '56px', height: '56px',
                  background: `rgba(139,99,64,0.15)`, border: `1px solid rgba(139,99,64,0.3)`,
                  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
                }}>
                  <feature.icon size={28} color={feature.color} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" style={{ padding: '80px 0' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-block', padding: '8px 16px',
              background: `rgba(139,99,64,0.15)`, border: `1px solid rgba(139,99,64,0.3)`,
              borderRadius: '100px', fontSize: '12px', fontWeight: '700', color: BROWN,
              marginBottom: '16px', letterSpacing: '0.05em'
            }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Three-Layer Detection Architecture
            </h2>
          </motion.div>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', justifyContent: 'center' }}>
            {[
              { num: '01', title: 'Rule Engine',       desc: '5 fraud rules analyze patterns',    icon: BarChart3, color: BROWN },
              { num: '02', title: 'Anomaly Detection', desc: 'Statistical deviation scoring',      icon: Activity,  color: BROWN_DIM },
              { num: '03', title: 'AI Investigation',  desc: 'RAG-powered agent synthesis',        icon: Brain,     color: BROWN_DEEP }
            ].map((step, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.2, duration: 0.6 }}
                style={{
                  flex: 1, padding: '40px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '16px', textAlign: 'center', position: 'relative', backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{
                  position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)',
                  fontSize: '14px', fontWeight: '900', color: step.color,
                  background: '#0a0704', padding: '4px 16px', borderRadius: '100px',
                  border: `2px solid ${step.color}`
                }}>{step.num}</div>
                <step.icon size={40} color={step.color} style={{ marginBottom: '20px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" style={{ padding: '80px 0' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Real-World Applications
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {useCases.map((useCase, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.6 }}
                style={{
                  padding: '32px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(10px)'
                }}
              >
                <useCase.icon size={32} color={BROWN} style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>{useCase.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ padding: '80px 0 120px', textAlign: 'center' }}
        >
          <div style={{
            maxWidth: '700px', margin: '0 auto', padding: '64px',
            background: `linear-gradient(135deg, rgba(139,99,64,0.12), rgba(90,56,32,0.08))`,
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ fontSize: '40px', fontWeight: '900', color: 'white', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Ready to Stop Fraud?
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
              Join the future of AI-powered transaction monitoring
            </p>
            <button onClick={onEnterDashboard} style={{
              padding: '18px 48px', fontSize: '18px', fontWeight: '700', color: 'white',
              background: `linear-gradient(135deg, ${BROWN_DIM}, ${BROWN_DEEP})`,
              border: 'none', borderRadius: '12px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              boxShadow: `0 8px 30px rgba(139,99,64,0.4)`, transition: 'all 0.3s ease'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(139,99,64,0.6)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = `0 8px 30px rgba(139,99,64,0.4)`; }}
            >
              Get Started Now <ArrowRight size={22} />
            </button>
          </div>
        </motion.section>

      </div>

      <style>{`
        @keyframes gridMove {
          0%   { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-20px); }
        }
        .hero-title {
          font-size: 72px;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 0%, #C49A5A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        .hero-title-accent {
          display: inline-block;
          background: linear-gradient(135deg, #C49A5A 0%, #8B6340 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 40px; }
        }
      `}</style>
    </div>
  );
}
