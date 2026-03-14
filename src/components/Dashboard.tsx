import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Startup } from '../types';
import { motion } from 'motion/react';
import { 
  Rocket, 
  Plus, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Circle,
  TrendingUp,
  Search,
  MoreVertical,
  Zap
} from 'lucide-react';

interface DashboardProps {
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

export default function Dashboard({ onSelect, onCreateNew }: DashboardProps) {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'startups'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Startup[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Startup);
      });
      setStartups(list);
      setLoading(false);
    }, (error) => {
      console.error("Dashboard snapshot error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getStatusProgress = (status: Startup['status']) => {
    const stages = ['idea', 'validation', 'market', 'mvp', 'launch'];
    return ((stages.indexOf(status) + 1) / stages.length) * 100;
  };

  const handleCreateNew = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCreateNew();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-48 bg-slate-900 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-900 rounded-3xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Founder Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your startup projects and track validation progress.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search startups..." 
              className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Co-founder Standup Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 p-8 rounded-[40px] bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/5 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Rocket className="w-32 h-32 text-emerald-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-emerald-500 p-4 rounded-3xl shadow-xl shadow-emerald-500/20">
            <Zap className="w-8 h-8 text-slate-950" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Co-founder Daily Standup</h3>
            <p className="text-slate-400 font-medium max-w-2xl">
              "Focus is your only superpower as a solo founder. Today, ignore the noise and focus on one thing: <span className="text-emerald-400">Talking to 3 potential users.</span> Everything else is secondary."
            </p>
          </div>
          <button className="bg-white text-slate-950 px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">
            GET DAILY FOCUS
          </button>
        </div>
      </motion.div>

      {startups.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 bg-slate-900/30 rounded-[40px] border border-dashed border-white/10"
        >
          <div className="bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Startups Yet</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Ready to build the next big thing? Start by adding your first startup idea.</p>
          <button 
            onClick={handleCreateNew}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3 rounded-2xl font-black transition-all relative z-20"
          >
            CREATE NEW STARTUP
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup, i) => (
            <motion.div
              key={startup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(startup.id)}
              className="group bg-slate-900/50 border border-white/5 rounded-[32px] p-8 hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5 text-slate-500 hover:text-white" />
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest mb-2">
                  <TrendingUp className="w-3 h-3" />
                  {startup.status} phase
                </div>
                <h3 className="text-2xl font-bold group-hover:text-emerald-400 transition-colors">{startup.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mt-2">{startup.idea}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Progress</span>
                    <span>{Math.round(getStatusProgress(startup.status))}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${getStatusProgress(startup.status)}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Clock className="w-3 h-3" />
                    {new Date(startup.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                    View Analysis
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
