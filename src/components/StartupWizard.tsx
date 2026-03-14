import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Target,
  Globe,
  Users,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface StartupWizardProps {
  onComplete: (id: string) => void;
  onCancel: () => void;
}

export default function StartupWizard({ onComplete, onCancel }: StartupWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    idea: '',
    problem: '',
    targetUsers: '',
    market: '',
    competitors: ''
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onCancel();
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'startups'), {
        ...formData,
        userId: auth.currentUser.uid,
        status: 'idea',
        createdAt: new Date().toISOString()
      });
      onComplete(docRef.id);
    } catch (error) {
      console.error("Failed to create startup", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Step 1: The Name</label>
              <h2 className="text-3xl font-black">What's your startup called?</h2>
              <p className="text-slate-400">Don't worry, you can change this later.</p>
            </div>
            <input 
              autoFocus
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. AI Cofounder Pro"
              className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-6 text-xl font-bold focus:outline-none focus:border-emerald-500 transition-all shadow-2xl"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Step 2: The Idea</label>
              <h2 className="text-3xl font-black">Describe your idea in one line.</h2>
              <p className="text-slate-400">Keep it simple and clear.</p>
            </div>
            <textarea 
              autoFocus
              value={formData.idea}
              onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
              placeholder="e.g. A virtual startup co-founder that helps entrepreneurs turn ideas into validated business plans."
              className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-6 text-xl font-bold focus:outline-none focus:border-emerald-500 transition-all min-h-[150px] resize-none"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Step 3: The Problem</label>
              <h2 className="text-3xl font-black">What problem are you solving?</h2>
              <p className="text-slate-400">Why does the world need this?</p>
            </div>
            <textarea 
              autoFocus
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              placeholder="e.g. Most founders fail because they don't validate their ideas properly or lack a clear roadmap."
              className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-6 text-xl font-bold focus:outline-none focus:border-emerald-500 transition-all min-h-[150px] resize-none"
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Step 4: Target Users</label>
              <h2 className="text-3xl font-black">Who are your target users?</h2>
              <p className="text-slate-400">Be as specific as possible.</p>
            </div>
            <input 
              autoFocus
              type="text"
              value={formData.targetUsers}
              onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
              placeholder="e.g. First-time entrepreneurs, solo founders, and product managers."
              className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-6 text-xl font-bold focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Step 5: Market</label>
              <h2 className="text-3xl font-black">Which country or market?</h2>
              <p className="text-slate-400">Where will you launch first?</p>
            </div>
            <input 
              autoFocus
              type="text"
              value={formData.market}
              onChange={(e) => setFormData({ ...formData, market: e.target.value })}
              placeholder="e.g. Global SaaS market, focusing on US and Europe."
              className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-6 text-xl font-bold focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Step 6: Competitors</label>
              <h2 className="text-3xl font-black">Any known competitors?</h2>
              <p className="text-slate-400">Who else is doing this?</p>
            </div>
            <input 
              autoFocus
              type="text"
              value={formData.competitors}
              onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
              placeholder="e.g. Strategyzer, Lean Stack, manual business plan templates."
              className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-6 text-xl font-bold focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.name.length > 2;
      case 2: return formData.idea.length > 10;
      case 3: return formData.problem.length > 10;
      case 4: return formData.targetUsers.length > 3;
      case 5: return formData.market.length > 2;
      case 6: return formData.competitors.length > 0;
      default: return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <Rocket className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-bold text-slate-400">Startup Idea Wizard</span>
          </div>
          <span className="text-sm font-bold text-slate-500">{step} / {totalSteps}</span>
        </div>
        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            className="h-full bg-emerald-500"
          />
        </div>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900/50 border border-white/5 rounded-[40px] p-12 shadow-2xl"
          >
            {renderStep()}

            <div className="flex items-center justify-between mt-12">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 font-bold transition-colors text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              <button
                onClick={handleNext}
                disabled={!isStepValid() || loading}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg transition-all ${
                  !isStepValid() || loading 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Analyzing...
                  </div>
                ) : (
                  <>
                    {step === totalSteps ? 'GENERATE ANALYSIS' : 'NEXT STEP'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-4">
        {[
          { icon: <Target className="w-4 h-4" />, label: "Market Fit" },
          { icon: <Globe className="w-4 h-4" />, label: "Global Data" },
          { icon: <Users className="w-4 h-4" />, label: "User Insights" }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
