import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Zap, Shield, TrendingUp, Users, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
          >
            <Zap className="w-4 h-4" />
            <span>The #1 AI Startup Validator</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase"
          >
            Turn Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Startup Idea</span> Into a Real Business
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto font-medium"
          >
            Stop guessing. Use data-driven AI to validate your market, analyze competitors, and build a roadmap to launch in 90 days.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={onStart}
              className="group relative bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10">START YOUR STARTUP</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
            <button className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-white transition-colors">
              Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <BarChart3 className="w-8 h-8 text-emerald-400" />,
              title: "Market Validation",
              desc: "Real-time analysis of search trends, Reddit discussions, and industry reports to score your idea's viability."
            },
            {
              icon: <Shield className="w-8 h-8 text-blue-400" />,
              title: "Competitor Intel",
              desc: "Automatically detect competitors, analyze their pricing, strengths, and find the gaps in the market."
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-purple-400" />,
              title: "90-Day Roadmap",
              desc: "Get a week-by-week execution plan from MVP development to your first 100 customers."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/20 transition-all group"
            >
              <div className="mb-6 p-3 rounded-2xl bg-slate-800 w-fit group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-slate-900/30 py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-12">Trusted by 10,000+ Founders Worldwide</h2>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale">
            {/* Mock Logos */}
            <div className="text-2xl font-black italic">TECHCRUNCH</div>
            <div className="text-2xl font-black italic">PRODUCTHUNT</div>
            <div className="text-2xl font-black italic">WIRED</div>
            <div className="text-2xl font-black italic">FORBES</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Simple Pricing</h2>
          <p className="text-slate-400">Everything you need to validate and launch.</p>
        </div>

        <div className="p-12 rounded-[40px] bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <div className="bg-emerald-500 text-slate-950 px-4 py-1 rounded-full text-xs font-black uppercase">Most Popular</div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <div className="text-6xl font-black mb-2">$0 <span className="text-xl text-slate-500 font-medium">/ forever</span></div>
                <p className="text-slate-400">Start validating your idea today for free.</p>
              </div>
              <ul className="space-y-4">
                {['Unlimited Startup Ideas', 'AI Market Validation', 'Competitor Analysis', 'MVP Feature List', '90-Day Roadmap', 'AI Mentor Access'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-sm text-emerald-400 font-bold uppercase tracking-wider mb-2">Free Beta Access</p>
                <p className="text-slate-300 text-sm">We're currently in open beta. All premium features are free for a limited time.</p>
              </div>
              <button 
                onClick={onStart}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-2xl font-black text-lg transition-all"
              >
                GET STARTED NOW
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
