import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, Search, AlertTriangle, 
  PhoneCall, Link as LinkIcon, Shield, Activity, 
  Smartphone, FileText, Video, Bell, Download, 
  ChevronLeft, CheckCircle2, XCircle
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const API_URL = 'http://localhost:8001';

function CircularProgress({ value, color }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-32 h-32">
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="64" cy="64" r={radius} stroke={color} strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{value}%</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Risk</span>
      </div>
    </div>
  );
}

function App() {
  const [appState, setAppState] = useState('splash');
  const [userName, setUserName] = useState('');
  const [activeScanner, setActiveScanner] = useState(null);
  
  // Dynamic Forms
  const [formData, setFormData] = useState({
    text: '', url: '', upiAmount: '', upiId: '', appName: '', permissions: '', mediaUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [panicData, setPanicData] = useState(null);

  // Dynamic Dashboard Stats
  const [scanHistory, setScanHistory] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([
    { type: 'success', text: 'System initialized & secured', time: new Date().toLocaleTimeString() }
  ]);

  const dashboardRef = useRef(null);
  const analyzeRef = useRef(null);
  const reportsRef = useRef(null);

  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => setAppState('login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getRiskColor = (score) => {
    if (score > 75) return '#ef4444'; // Red
    if (score > 30) return '#f59e0b'; // Amber/Yellow
    return '#10b981'; // Professional Green
  };

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let responseData;
      let finalRiskScore = 0;
      let scamType = "";
      let isHighRisk = false;

      // Make Real API Calls Based on Module
      if (activeScanner === 'text') {
        const res = await axios.post(`${API_URL}/predict-text-fraud`, { message_text: formData.text });
        responseData = res.data;
        
        // Ensure explainability array exists
        if (!responseData.why_flagged) {
          responseData.why_flagged = responseData.risk_score > 75 
            ? ["Authority impersonation", "Urgency language", "Payment pressure"]
            : ["Suspicious patterns found"];
        }
        finalRiskScore = responseData.risk_score;
        scamType = responseData.scam_type;

      } else if (activeScanner === 'url') {
        const res = await axios.post(`${API_URL}/check-url`, { url: formData.url });
        responseData = res.data;
        finalRiskScore = responseData.is_phishing ? 95 : 10;
        scamType = responseData.threat_type;

      } else if (activeScanner === 'upi') {
        const res = await axios.post(`${API_URL}/predict-upi-risk`, { 
          text: formData.text, amount: parseFloat(formData.upiAmount) || 0, upi_id: formData.upiId 
        });
        responseData = res.data;
        finalRiskScore = responseData.risk_score;
        scamType = responseData.fraud_pattern;

      } else if (activeScanner === 'loan') {
        const permsArray = formData.permissions.split(',').map(p => p.trim());
        const res = await axios.post(`${API_URL}/scan-loan-app`, { 
          app_name: formData.appName, permissions: permsArray 
        });
        responseData = res.data;
        finalRiskScore = responseData.risk_level === 'HIGH' ? 90 : (responseData.risk_level === 'MEDIUM' ? 60 : 10);
        scamType = `Risky App: ${responseData.risk_level}`;

      } else if (activeScanner === 'media') {
        const res = await axios.post(`${API_URL}/check-media-claim`, { 
          text: formData.text, source_url: formData.mediaUrl 
        });
        responseData = res.data;
        finalRiskScore = responseData.risk_score;
        scamType = responseData.type;
      }

      isHighRisk = finalRiskScore > 75;

      setResult({ type: activeScanner, data: responseData, riskScore: finalRiskScore });

      // Update Dashboard Analytics
      const newScan = { module: activeScanner, score: finalRiskScore, time: new Date().toLocaleTimeString(), scamType };
      setScanHistory([newScan, ...scanHistory]);

      if (isHighRisk) {
        setRecentAlerts([{ type: 'danger', text: `High Risk Blocked: ${scamType}`, time: new Date().toLocaleTimeString() }, ...recentAlerts]);
        
        // Auto-Trigger Panic Mode if extreme risk
        setTimeout(() => triggerPanic(scamType), 2500);
      } else {
        setRecentAlerts([{ type: 'success', text: `Safe Scan: ${activeScanner}`, time: new Date().toLocaleTimeString() }, ...recentAlerts]);
      }

    } catch (error) {
      console.error('API Error, using fallback:', error);
      alert("Backend API is not running correctly. Please check server logs.");
    } finally {
      setLoading(false);
    }
  };

  const triggerPanic = async (scamType = "General") => {
    try {
      const res = await axios.get(`${API_URL}/panic-help`, { params: { scam_type: scamType } });
      setPanicData(res.data);
    } catch (error) {
      setPanicData({
        steps: ["1. Do not pay", "2. Disconnect", "3. Block sender", "4. Report to 1930"],
        helpline: "1930",
        contact_alert_template: "URGENT: I am facing a cyber scam. Do not trust messages from my number."
      });
    }
    setAppState('panic');
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(2, 6, 23); // Slate 950
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("ScamSense Protection Report", 20, 25);
    
    // User Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`User: ${userName || "Anonymous"}`, 20, 50);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 60);

    // Stats
    const highRiskCount = scanHistory.filter(s => s.score > 75).length;
    doc.text(`Total Scans: ${scanHistory.length}`, 20, 80);
    doc.text(`Threats Blocked: ${highRiskCount}`, 20, 90);

    // Scan History Table
    doc.setFontSize(16);
    doc.text("Recent Activity:", 20, 110);
    
    doc.setFontSize(12);
    let yPos = 120;
    scanHistory.slice(0, 10).forEach((scan, i) => {
      doc.text(`${scan.time} | Module: ${scan.module} | Score: ${scan.score} | Type: ${scan.scamType}`, 20, yPos);
      yPos += 10;
    });

    doc.save("ScamSense_Security_Report.pdf");
    setRecentAlerts([{ type: 'success', text: 'PDF Report Generated', time: new Date().toLocaleTimeString() }, ...recentAlerts]);
  };

  const scrollTo = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1️⃣ SPLASH SCREEN
  if (appState === 'splash') {
    return (
      <div className="h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
          <motion.div animate={{ boxShadow: ["0px 0px 0px 0px rgba(37, 99, 235, 0)", "0px 0px 40px 20px rgba(37, 99, 235, 0.1)", "0px 0px 0px 0px rgba(37, 99, 235, 0)"] }} transition={{ duration: 2, repeat: Infinity }} className="rounded-full p-4 mb-6 bg-blue-50">
            <Shield className="w-24 h-24 text-[#2563eb]" />
          </motion.div>
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight mb-4">ScamSense</h1>
          <p className="text-slate-500 text-lg">Protecting India from Digital Fraud</p>
        </motion.div>
      </div>
    );
  }

  // 2️⃣ LOGIN SCREEN
  if (appState === 'login') {
    return (
      <div className="h-screen w-full bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#2563eb]/5 rounded-full blur-[120px]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md z-10">
          <div className="flex justify-center mb-8"><Shield className="w-16 h-16 text-[#2563eb]" /></div>
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">Security Portal</h2>
          <p className="text-slate-500 text-center mb-8 text-sm uppercase tracking-widest font-semibold">Identify Yourself</p>
          <form onSubmit={(e) => { e.preventDefault(); if(userName.trim()) setAppState('dashboard'); }}>
            <input type="text" placeholder="Full Name" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 mb-6 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" />
            <button type="submit" disabled={!userName.trim()} className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 shadow-lg shadow-blue-200 transition-all">Authorize Access</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 7️⃣ PANIC MODE
  if (appState === 'panic') {
    return (
      <div className="min-h-screen w-full bg-[#ef4444] flex flex-col p-4 md:p-8">
        <header className="mb-12"><button onClick={() => setAppState('dashboard')} className="text-white hover:bg-white/20 p-2 rounded-lg flex items-center font-bold transition-colors"><ChevronLeft /> Exit Safe Mode</button></header>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl w-full mx-auto bg-white rounded-3xl p-8 shadow-2xl text-center">
          <AlertTriangle className="w-20 h-20 text-[#ef4444] mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold text-slate-900 mb-8 uppercase tracking-tight">Active Threat Protection</h1>
          <div className="space-y-4 mb-10 text-left">
            {(panicData?.steps || []).map((step, idx) => (
              <div key={idx} className="bg-red-50 border border-red-100 p-5 rounded-xl flex items-center gap-4">
                <div className="bg-[#ef4444] text-white w-8 h-8 rounded-full flex justify-center items-center font-bold shrink-0 shadow-md">{idx + 1}</div>
                <p className="text-xl text-slate-900 font-medium">{step.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <a href={`tel:${panicData?.helpline || '1930'}`} className="flex-1 bg-[#ef4444] hover:bg-red-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 text-lg shadow-lg shadow-red-200 transition-all"><PhoneCall /> Urgent Call: {panicData?.helpline || '1930'}</a>
            <button onClick={() => navigator.clipboard.writeText(panicData?.contact_alert_template)} className="flex-1 bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold transition-all">Copy Alert Template</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3️⃣ MAIN DASHBOARD
  if (appState === 'dashboard') {
    const threatsBlocked = scanHistory.filter(s => s.score > 75).length;
    const avgRisk = scanHistory.length > 0 ? scanHistory.reduce((a, b) => a + b.score, 0) / scanHistory.length : 0;
    const dashboardRiskColor = getRiskColor(avgRisk);

    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-x-hidden" ref={dashboardRef}>
        <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">ScamSense</span>
              <div className="hidden md:flex ml-10 space-x-8">
                <button onClick={() => scrollTo(dashboardRef)} className="text-blue-600 font-bold">Dashboard</button>
                <button onClick={() => scrollTo(analyzeRef)} className="text-slate-500 hover:text-blue-600 font-medium transition-colors">Protective Modules</button>
                <button onClick={() => scrollTo(reportsRef)} className="text-slate-500 hover:text-blue-600 font-medium transition-colors">Security Reports</button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => triggerPanic()} className="bg-red-50 text-[#ef4444] border border-red-200 px-5 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-red-100 transition-all shadow-sm"><AlertTriangle className="w-4 h-4" /> EMERGENCY</button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Dynamic Hero Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 border border-slate-200 flex justify-between items-center relative overflow-hidden shadow-xl shadow-slate-200/50">
              <div className="z-10">
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Protection Active</p>
                <h2 className="text-4xl font-bold mb-2 text-slate-900">Welcome, {userName || "Agent"}</h2>
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-3"><ShieldCheck className="text-blue-600" /><span className="font-semibold text-slate-700">{threatsBlocked} Threats Identified & Blocked</span></div>
                  <div className="flex items-center gap-3"><Activity style={{color: dashboardRiskColor}} /><span className="font-semibold text-slate-700">Average Risk Index: <span style={{color: dashboardRiskColor}}>{Math.round(avgRisk)}%</span></span></div>
                </div>
              </div>
              <div className="z-10 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner"><CircularProgress value={Math.round(avgRisk)} color={dashboardRiskColor} /></div>
            </motion.div>

            {/* Modules Grid */}
            <div ref={analyzeRef}>
              <h3 className="text-2xl font-bold mb-6">Protection Modules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'text', title: 'Transcript Analyzer', desc: 'Scan suspicious messages/SMS.', icon: FileText, color: '#2563eb' },
                  { id: 'url', title: 'URL Guard', desc: 'Verify links for phishing.', icon: LinkIcon, color: '#f59e0b' },
                  { id: 'upi', title: 'UPI Shield', desc: 'Check collect requests.', icon: Activity, color: '#7c3aed' },
                  { id: 'loan', title: 'App Inspector', desc: 'Analyze risky permissions.', icon: Smartphone, color: '#db2777' },
                  { id: 'media', title: 'Truth Scanner', desc: 'Detect deepfake claims.', icon: Video, color: '#ea580c' },
                  { id: 'panic', title: 'Emergency Hub', desc: 'Immediate relief actions.', icon: AlertTriangle, color: '#dc2626' },
                ].map((module) => (
                  <motion.button key={module.id} whileHover={{ y: -5 }} onClick={() => { if(module.id==='panic') triggerPanic(); else { setActiveScanner(module.id); setAppState('scanner'); } }} className="bg-white p-6 rounded-2xl border border-slate-200 text-left relative overflow-hidden shadow-md hover:shadow-xl transition-all group">
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-5 blur-2xl rounded-full transition-opacity group-hover:opacity-20" style={{ backgroundColor: module.color }} />
                    <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm group-hover:bg-white transition-colors">
                      <module.icon style={{ color: module.color }} className="w-6 h-6 relative z-10" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 relative z-10">{module.title}</h4>
                    <p className="text-slate-500 text-sm relative z-10">{module.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6" ref={reportsRef}>
            <button onClick={generatePDFReport} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"><Download className="w-5 h-5" /> Generate Security Report</button>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 h-[600px] flex flex-col shadow-lg shadow-slate-200/50">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Security Feed</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {recentAlerts.map((alert, i) => (
                  <div key={i} className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex gap-3 hover:bg-slate-100/50 transition-colors">
                    {alert.type === 'danger' && <XCircle className="w-5 h-5 text-red-500" />}
                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    <div><p className="text-sm font-semibold text-slate-800 leading-tight">{alert.text}</p><p className="text-slate-400 text-[10px] uppercase font-bold mt-1 tracking-wider">{alert.time}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // SCANNER SCREENS
  if (appState === 'scanner') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 md:p-8">
        <header className="max-w-4xl mx-auto mb-8">
          <button onClick={() => { setAppState('dashboard'); setResult(null); }} className="text-slate-500 hover:text-blue-600 flex items-center gap-2 font-semibold mb-8 transition-colors"><ChevronLeft /> Back to Security Hub</button>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 capitalize">{activeScanner} Analysis</h1>
              <p className="text-slate-500">Scan digital artifacts for potential threats.</p>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto">
          {!result ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
              <form onSubmit={handleScan} className="flex flex-col gap-6">
                
                {/* Dynamic Inputs Based on Module */}
                {(activeScanner === 'text' || activeScanner === 'upi' || activeScanner === 'media') && (
                  <textarea name="text" value={formData.text} onChange={handleInputChange} placeholder="Paste suspicious text, SMS, or transcript here..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all resize-none h-40 font-medium" required />
                )}

                {activeScanner === 'url' && (
                  <input type="url" name="url" value={formData.url} onChange={handleInputChange} placeholder="Enter full URL (https://...)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all font-medium" required />
                )}

                {activeScanner === 'upi' && (
                  <div className="flex flex-col md:flex-row gap-4">
                    <input type="number" name="upiAmount" value={formData.upiAmount} onChange={handleInputChange} placeholder="Amount Requested (e.g. 5000)" className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 focus:outline-none focus:border-blue-600 transition-all font-medium" required />
                    <input type="text" name="upiId" value={formData.upiId} onChange={handleInputChange} placeholder="Sender VPA/UPI ID (Optional)" className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 focus:outline-none focus:border-blue-600 transition-all font-medium" />
                  </div>
                )}

                {activeScanner === 'loan' && (
                  <div className="space-y-4">
                    <input type="text" name="appName" value={formData.appName} onChange={handleInputChange} placeholder="Application Name" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 focus:outline-none focus:border-blue-600 transition-all font-medium" required />
                    <input type="text" name="permissions" value={formData.permissions} onChange={handleInputChange} placeholder="Requested Permissions (e.g. SMS, Contacts, Photos)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 focus:outline-none focus:border-blue-600 transition-all font-medium" required />
                  </div>
                )}

                {activeScanner === 'media' && (
                  <input type="url" name="mediaUrl" value={formData.mediaUrl} onChange={handleInputChange} placeholder="Original Source URL (Optional)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 focus:outline-none focus:border-blue-600 transition-all font-medium" />
                )}

                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl flex justify-center items-center gap-3 shadow-lg shadow-blue-100 transition-all active:scale-95">
                  {loading ? <div className="flex items-center gap-3"><Activity className="animate-spin" /> Verifying with AI Intelligence...</div> : <div className="flex items-center gap-3"><ShieldCheck /> Initiate Threat Verification</div>}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-10 border border-slate-200 flex flex-col md:flex-row gap-12 shadow-2xl shadow-slate-200/50">
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border mb-8 ${result.riskScore > 75 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  {result.riskScore > 75 ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />} {result.riskScore > 75 ? 'Critical Threat Detected' : 'Safety Verification Passed'}
                </div>
                
                <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">{result.data.scam_type || result.data.threat_type || result.data.type || result.data.fraud_pattern || `Risk: ${result.data.risk_level}`}</h2>
                
                <p className="text-2xl text-slate-600 mb-10 font-medium leading-relaxed">{result.data.action || result.data.recommended_action || (result.data.is_phishing ? "Dangerous link detected. Access denied." : "The content appears to be safe for interaction.")}</p>

                {/* AI Explainability Array mapping */}
                {(result.data.why_flagged || result.data.reasons || result.data.abusive_permissions) && (
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-10 shadow-inner">
                    <h4 className="text-xs text-blue-600 font-black uppercase tracking-[0.2em] mb-6">Security Breakdown</h4>
                    <ul className="space-y-4">
                      {(result.data.why_flagged || result.data.reasons || result.data.abusive_permissions).map((reason, i) => (
                        <li key={i} className="flex items-start gap-4 text-xl font-bold text-slate-800">
                          <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${result.riskScore > 75 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.riskScore > 75 && (
                  <button onClick={() => triggerPanic(result.data.scam_type)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-10 rounded-2xl flex items-center gap-3 text-xl shadow-xl shadow-red-100 transition-all active:scale-95"><AlertTriangle className="w-6 h-6" /> Deploy Emergency Countermeasures</button>
                )}
              </div>
              <div className="flex justify-center items-start pt-4">
                <div className="p-6 bg-slate-50 rounded-[40px] border border-slate-100 shadow-inner">
                  <CircularProgress value={result.riskScore} color={getRiskColor(result.riskScore)} />
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    );
  }

  return null;
}

export default App;
