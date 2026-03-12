import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  Rocket, 
  LayoutDashboard, 
  MessageSquare, 
  Plus, 
  LogOut, 
  Menu, 
  X,
  Zap,
  Shield,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import StartupWizard from './components/StartupWizard';
import AnalysisView from './components/AnalysisView';
import ChatMentor from './components/ChatMentor';
import PartnerDashboard from './components/PartnerDashboard';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'dashboard' | 'wizard' | 'analysis' | 'chat' | 'partner'>('landing');
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Sync user to Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
          });
        }
        if (view === 'landing') setView('dashboard');
      } else {
        setUser(null);
        setView('landing');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Rocket className="w-12 h-12 text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => setView(user ? 'dashboard' : 'landing')}
              >
                <div className="bg-emerald-500 p-1.5 rounded-lg">
                  <Rocket className="w-6 h-6 text-slate-950" />
                </div>
                <span className="text-xl font-bold tracking-tight">AI Cofounder <span className="text-emerald-500">Pro</span></span>
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-6">
                {user ? (
                  <>
                    <button 
                      onClick={() => setView('dashboard')}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${view === 'dashboard' ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button 
                      onClick={() => setView('wizard')}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4" />
                      New Startup
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                      <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                      <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="bg-white text-slate-950 px-6 py-2 rounded-full font-bold hover:bg-slate-200 transition-all"
                  >
                    Get Started
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-400 hover:text-white">
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden bg-slate-900 border-b border-white/5 p-4 space-y-4"
              >
                {user ? (
                  <>
                    <button onClick={() => { setView('dashboard'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-slate-400 hover:text-white">Dashboard</button>
                    <button onClick={() => { setView('wizard'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-emerald-500 font-bold">New Startup</button>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-400">Logout</button>
                  </>
                ) : (
                  <button onClick={handleLogin} className="w-full bg-white text-slate-950 py-3 rounded-xl font-bold">Get Started</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Main Content */}
        <main className="pt-24 pb-12">
          <AnimatePresence mode="wait">
            {view === 'landing' && <LandingPage onStart={handleLogin} key="landing" />}
            {view === 'dashboard' && <Dashboard onSelect={(id) => { setSelectedStartupId(id); setView('analysis'); }} key="dashboard" />}
            {view === 'wizard' && <StartupWizard onComplete={(id) => { setSelectedStartupId(id); setView('analysis'); }} key="wizard" />}
            {view === 'analysis' && selectedStartupId && <AnalysisView startupId={selectedStartupId} onOpenChat={() => setView('chat')} onOpenPartner={() => setView('partner')} key="analysis" />}
            {view === 'partner' && selectedStartupId && <PartnerDashboard startupId={selectedStartupId} key="partner" />}
            {view === 'chat' && selectedStartupId && <ChatMentor startupId={selectedStartupId} key="chat" />}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Rocket className="w-5 h-5 text-emerald-500" />
              <span className="font-bold">AI Cofounder Pro</span>
            </div>
            <p className="text-slate-500 text-sm">© 2026 AI Cofounder Pro. Built for the next generation of entrepreneurs.</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
