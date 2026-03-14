import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, doc, getDoc } from 'firebase/firestore';
import { Startup, DailyBriefing, MarketIntelligence, WeeklyReport } from '../types';
import { generateDailyBriefing, generateMarketIntelligence, generateWeeklyReport } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  RefreshCw,
  Search,
  BarChart3,
  FileText,
  ChevronRight,
  Sparkles,
  Globe,
  Users,
  DollarSign,
  Cpu,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';

interface PartnerDashboardProps {
  startupId: string;
  onBack: () => void;
}

export default function PartnerDashboard({ startupId, onBack }: PartnerDashboardProps) {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [intelligence, setIntelligence] = useState<MarketIntelligence | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchStartup = async () => {
      const docRef = doc(db, 'startups', startupId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStartup({ id: docSnap.id, ...docSnap.data() } as Startup);
      }
    };
    fetchStartup();

    // Listen for latest briefing
    const briefingQ = query(
      collection(db, 'briefings'),
      where('startupId', '==', startupId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const unsubscribeBriefing = onSnapshot(briefingQ, (snapshot) => {
      if (!snapshot.empty) {
        setBriefing({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as DailyBriefing);
      }
    });

    // Listen for latest intelligence
    const intelligenceQ = query(
      collection(db, 'intelligence'),
      where('startupId', '==', startupId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const unsubscribeIntelligence = onSnapshot(intelligenceQ, (snapshot) => {
      if (!snapshot.empty) {
        setIntelligence({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as MarketIntelligence);
      }
    });

    // Listen for latest weekly report
    const weeklyQ = query(
      collection(db, 'weekly_reports'),
      where('startupId', '==', startupId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const unsubscribeWeekly = onSnapshot(weeklyQ, (snapshot) => {
      if (!snapshot.empty) {
        setWeeklyReport({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as WeeklyReport);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeBriefing();
      unsubscribeIntelligence();
      unsubscribeWeekly();
    };
  }, [startupId]);

  const handleRefresh = async () => {
    if (!startup || !auth.currentUser) return;
    setRefreshing(true);
    try {
      const [newBriefing, newIntelligence] = await Promise.all([
        generateDailyBriefing(startup),
        generateMarketIntelligence(startup)
      ]);

      await Promise.all([
        addDoc(collection(db, 'briefings'), {
          ...newBriefing,
          startupId,
          userId: auth.currentUser.uid,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }),
        addDoc(collection(db, 'intelligence'), {
          ...newIntelligence,
          startupId,
          userId: auth.currentUser.uid,
          createdAt: new Date().toISOString()
        })
      ]);
    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerateWeekly = async () => {
    if (!startup || !auth.currentUser) return;
    setRefreshing(true);
    try {
      const report = await generateWeeklyReport(startup, "Initial week of analysis and strategy alignment.");
      await addDoc(collection(db, 'weekly_reports'), {
        ...report,
        startupId,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Weekly report failed", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading partner dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </button>
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <Zap className="w-8 h-8 text-emerald-500" />
            Co-founder Dashboard
          </h1>
          <p className="text-slate-500 mt-2">Continuous market intelligence and daily briefings for {startup?.name}</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'SYNCING DATA...' : 'REFRESH INTELLIGENCE'}
        </button>
      </div>

      {!briefing && !refreshing && (
        <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-12 text-center space-y-6">
          <div className="bg-emerald-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight">Initialize Your AI Partner</h3>
          <p className="text-slate-400 max-w-md mx-auto">Start your daily briefing and market intelligence stream to transform this analysis into a living partnership.</p>
          <button 
            onClick={handleRefresh}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3 rounded-xl font-black transition-all"
          >
            START PARTNERSHIP
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Briefing */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-500" />
                Daily Startup Brief
              </h3>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                {briefing?.date || 'Today'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Market Updates
                  </h4>
                  <ul className="space-y-3">
                    {briefing?.marketUpdates.map((item, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Competitor Activity
                  </h4>
                  <ul className="space-y-3">
                    {briefing?.competitorActivity.map((item, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl">
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Opportunities
                  </h4>
                  <ul className="space-y-3">
                    {briefing?.opportunities.map((item, i) => (
                      <li key={i} className="text-sm text-slate-200 flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl">
                  <h4 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Risks
                  </h4>
                  <ul className="space-y-3">
                    {briefing?.risks.map((item, i) => (
                      <li key={i} className="text-sm text-slate-200 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Recommended Founder Actions Today</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {briefing?.recommendedActions.map((action, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-300">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Weekly Report Section */}
          <section className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <FileText className="w-6 h-6 text-cyan-500" />
                Weekly Founder Report
              </h3>
              {weeklyReport ? (
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                  {weeklyReport.weekRange}
                </span>
              ) : (
                <button 
                  onClick={handleGenerateWeekly}
                  className="text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-all"
                >
                  GENERATE FIRST REPORT
                </button>
              )}
            </div>

            {weeklyReport && (
              <div className="space-y-8">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Progress Summary</h4>
                  <p className="text-slate-300 leading-relaxed">{weeklyReport.progress}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-4">Key Insights</h4>
                    <ul className="space-y-2">
                      {weeklyReport.keyInsights.map((item, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Strategy Adjustments</h4>
                    <ul className="space-y-2">
                      {weeklyReport.strategyAdjustments.map((item, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <RefreshCw className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-4">Next Week Priorities</h4>
                  <div className="flex flex-wrap gap-3">
                    {weeklyReport.nextWeekPriorities.map((item, i) => (
                      <span key={i} className="px-4 py-2 rounded-xl bg-slate-950 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Market Intelligence Sidebar */}
        <div className="space-y-8">
          <section className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8">
            <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-500" />
              Market Intelligence
            </h3>
            <div className="space-y-6">
              {intelligence?.signals.map((signal, i) => (
                <div key={i} className="space-y-3 relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-full before:bg-white/10">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      signal.type === 'growth' ? 'bg-emerald-500/10 text-emerald-500' :
                      signal.type === 'competitor' ? 'bg-blue-500/10 text-blue-500' :
                      signal.type === 'funding' ? 'bg-yellow-500/10 text-yellow-500' :
                      signal.type === 'tech' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-slate-500/10 text-slate-500'
                    }`}>
                      {signal.type}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      signal.impact === 'positive' ? 'text-emerald-500' :
                      signal.impact === 'negative' ? 'text-red-500' :
                      'text-slate-500'
                    }`}>
                      {signal.impact}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">{signal.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{signal.description}</p>
                </div>
              ))}
              {!intelligence && (
                <div className="text-center py-12 text-slate-600 text-sm italic">
                  No signals detected yet. Refresh intelligence to start scanning.
                </div>
              )}
            </div>
          </section>

          {/* Quick Stats / Health */}
          <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-[40px] p-8">
            <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Startup Health
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Market Sentiment</span>
                <span className="text-xs font-black text-emerald-500 uppercase">Bullish</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[75%] rounded-full" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Execution Velocity</span>
                <span className="text-xs font-black text-blue-500 uppercase">High</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[85%] rounded-full" />
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-xl">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-[10px] font-medium text-slate-400 leading-tight">
                  Your co-founder is currently analyzing 12 new market signals.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
