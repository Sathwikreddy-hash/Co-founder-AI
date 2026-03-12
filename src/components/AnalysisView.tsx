import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Startup, Analysis } from '../types';
import { analyzeStartup } from '../services/gemini';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Rocket, 
  TrendingUp, 
  Users, 
  Shield, 
  Map, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  Info,
  FileText,
  Layout,
  Target,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisViewProps {
  startupId: string;
  onOpenChat: () => void;
  onOpenPartner: () => void;
}

export default function AnalysisView({ startupId, onOpenChat, onOpenPartner }: AnalysisViewProps) {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchStartup = async () => {
      const docRef = doc(db, 'startups', startupId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStartup({ id: docSnap.id, ...docSnap.data() } as Startup);
      }
    };
    fetchStartup();

    const analysisRef = doc(db, 'analyses', startupId);
    const unsubscribe = onSnapshot(analysisRef, (docSnap) => {
      if (docSnap.exists()) {
        setAnalysis({ id: docSnap.id, ...docSnap.data() } as Analysis);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [startupId]);

  const handleAnalyze = async () => {
    if (!startup || !auth.currentUser) return;
    setAnalyzing(true);
    try {
      const result = await analyzeStartup(startup);
      const analysisRef = doc(db, 'analyses', startupId);
      await setDoc(analysisRef, {
        ...result,
        startupId,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      // Update startup status
      const startupRef = doc(db, 'startups', startupId);
      await setDoc(startupRef, { status: 'validation' }, { merge: true });
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('analysis-report');
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${startup?.name}-Analysis.pdf`);
  };

  if (loading) return <div className="p-12 text-center">Loading analysis...</div>;

  if (!analysis && !analyzing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-8">
        <div className="bg-emerald-500/10 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto">
          <Sparkles className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tight">Ready for Analysis</h2>
        <p className="text-slate-400 text-xl max-w-xl mx-auto">
          Our AI engine is ready to analyze your startup idea across market demand, competition, and execution strategy.
        </p>
        <button 
          onClick={handleAnalyze}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-12 py-4 rounded-2xl font-black text-xl shadow-2xl shadow-emerald-500/20 transition-all transform hover:scale-105"
        >
          GENERATE FULL REPORT
        </button>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-12">
        <div className="relative w-32 h-32 mx-auto">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Rocket className="w-12 h-12 text-emerald-500" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tight">Analyzing Startup Ecosystem</h2>
          <div className="flex flex-col items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>Scanning Market Trends...</motion.span>
            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>Checking Reddit Discussions...</motion.span>
            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>Analyzing Competitor Pricing...</motion.span>
          </div>
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: 'Demand', A: analysis?.validation.demandScore, fullMark: 100 },
    { subject: 'Growth', A: analysis?.validation.growthPotential, fullMark: 100 },
    { subject: 'Urgency', A: analysis?.validation.urgencyScore, fullMark: 100 },
    { subject: 'Viability', A: analysis?.validation.viabilityScore, fullMark: 100 },
  ];

  const scoreData = analysis?.startupScore ? [
    { name: 'Market Demand', value: analysis.startupScore.marketDemand, color: '#10b981' },
    { name: 'Competition', value: analysis.startupScore.competitionIntensity, color: '#3b82f6' },
    { name: 'Urgency', value: analysis.startupScore.problemUrgency, color: '#a855f7' },
    { name: 'Growth', value: analysis.startupScore.growthPotential, color: '#f59e0b' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12" id="analysis-report">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Co-founder Analysis Complete
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase">{startup?.name}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">{startup?.idea}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-slate-900 border border-white/10 hover:bg-slate-800 px-6 py-3 rounded-2xl font-bold transition-all"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button 
            onClick={onOpenPartner}
            className="flex items-center gap-2 bg-slate-900 border border-white/10 hover:bg-slate-800 px-6 py-3 rounded-2xl font-bold transition-all"
          >
            <Zap className="w-4 h-4 text-emerald-500" />
            Partner Dashboard
          </button>
          <button 
            onClick={onOpenChat}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 group relative"
          >
            <MessageSquare className="w-4 h-4" />
            Talk to Co-founder
            <div className="absolute -top-2 -right-2 bg-emerald-400 text-slate-950 text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              AGENT MODE
            </div>
          </button>
        </div>
      </div>

      {/* Startup Score Section */}
      {analysis?.startupScore && (
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          <div className="lg:col-span-1 bg-slate-900/50 border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center text-center">
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-white/5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * analysis.startupScore.total) / 100}
                  className="text-emerald-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black">{analysis.startupScore.total}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Startup Score</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium">Overall potential based on market signals</p>
          </div>

          <div className="lg:col-span-3 bg-slate-900/50 border border-white/5 rounded-[40px] p-8">
            <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-emerald-500" />
              Score Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {scoreData.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{item.name}</span>
                    <span className="text-sm font-black" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Next 3 Actions Section */}
      {analysis?.nextActions && (
        <section className="space-y-6">
          <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Rocket className="w-6 h-6 text-emerald-500" />
            Your Next 3 Founder Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analysis.nextActions.map((action, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-slate-900/50 border border-white/5 p-8 rounded-[32px] relative group"
              >
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                    action.impact === 'high' ? 'bg-emerald-500/10 text-emerald-500' :
                    action.impact === 'medium' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    {action.impact} impact
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-all">
                  <span className="text-xl font-black group-hover:text-slate-950">{i + 1}</span>
                </div>
                <h4 className="text-xl font-black mb-3">{action.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Co-founder Strategic Advice */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/20 rounded-[40px] p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-32 h-32 text-emerald-500" />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-2 text-emerald-400">
            <Zap className="w-6 h-6" />
            Strategic Advice for Solo Founders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analysis?.coFounderAdvice?.map((advice, i) => (
              <div key={i} className="bg-slate-950/50 p-6 rounded-3xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                <div className="text-emerald-500 font-black mb-2">#0{i + 1}</div>
                <p className="text-slate-300 font-medium leading-relaxed">{advice}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Validation Radar */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-[40px] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Market Validation Engine
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">
              <Info className="w-3 h-3" />
              Data-driven estimation
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <Radar
                    name="Startup"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-4xl font-black text-emerald-500 mb-1">{analysis?.validation.viabilityScore}%</div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">Overall Viability Score</div>
                <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                  {analysis?.validation.insights}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Competition</div>
                  <div className="text-lg font-black text-blue-400">{analysis?.validation.competitionLevel}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Urgency</div>
                  <div className="text-lg font-black text-purple-400">{analysis?.validation.urgencyScore}/100</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-[40px] p-8 text-slate-950 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">The Verdict</h3>
            <p className="font-medium text-lg leading-snug">
              {analysis?.report.summary}
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-black/10">
            <div className="flex items-center gap-3">
              <div className="bg-black/10 p-2 rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest opacity-60">Core UVP</div>
                <div className="font-bold">{analysis?.report.uvp}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Competitor Intelligence
            </h3>
            <div className="space-y-4">
              {analysis?.competitors.map((comp, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold">{comp.name}</h4>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{comp.pricing}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{comp.offer}</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-black text-emerald-500 uppercase mb-1">Strengths</div>
                      <div className="text-slate-300">{comp.strengths}</div>
                    </div>
                    <div>
                      <div className="font-black text-red-500 uppercase mb-1">Gaps</div>
                      <div className="text-slate-300">{comp.gaps}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
              <Layout className="w-5 h-5 text-purple-400" />
              MVP Builder
            </h3>
            <div className="space-y-6">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Core Features</div>
                <div className="flex flex-wrap gap-2">
                  {analysis?.mvp.features.map((f, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">{f}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Suggested Tech Stack</div>
                <div className="flex flex-wrap gap-2">
                  {analysis?.mvp.techStack.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-bold">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">User Flow</div>
                <p className="text-sm text-slate-400 leading-relaxed">{analysis?.mvp.userFlow}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
              <Map className="w-5 h-5 text-orange-400" />
              90-Day Execution Roadmap
            </h3>
            <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
              {analysis?.roadmap.map((item, i) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-xs font-black text-orange-500 z-10">
                    {i + 1}
                  </div>
                  <h4 className="text-lg font-bold mb-3">{item.period}</h4>
                  <ul className="space-y-2">
                    {item.goals.map((goal, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Business Strategy
            </h3>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Business Model</div>
                <p className="text-sm text-slate-300">{analysis?.report.businessModel}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Pricing Strategy</div>
                <p className="text-sm text-slate-300">{analysis?.report.pricingStrategy}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Go-To-Market</div>
                <p className="text-sm text-slate-300">{analysis?.report.gtmPlan}</p>
              </div>
            </div>
          </section>

          {analysis?.fundingStrategy && (
            <section className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Funding Strategy
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Target Stage</div>
                    <div className="text-lg font-bold text-emerald-400">{analysis.fundingStrategy.stage}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Target Amount</div>
                    <div className="text-lg font-bold text-blue-400">{analysis.fundingStrategy.targetAmount}</div>
                  </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Investor Profile</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.fundingStrategy.investorTypes.map((type, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">{type}</span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Pitch Focus</div>
                  <ul className="space-y-1">
                    {analysis.fundingStrategy.pitchFocus.map((focus, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        {focus}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Potential Investors</div>
                  <p className="text-sm text-slate-300">{analysis.fundingStrategy.potentialInvestors.join(', ')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">Co-founder Advice</div>
                  <p className="text-sm text-slate-300 italic">"{analysis.fundingStrategy.advice}"</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Warning Footer */}
      <div className="p-6 rounded-3xl bg-yellow-500/5 border border-yellow-500/20 flex items-center gap-4">
        <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" />
        <p className="text-sm text-yellow-500/80 font-medium">
          Note: This validation is a data-driven estimation based on current market signals. It is not a guarantee of success. We strongly encourage founders to validate their assumptions with real user interviews and prototypes.
        </p>
      </div>
    </div>
  );
}
