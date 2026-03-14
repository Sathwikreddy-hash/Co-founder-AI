import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ChatMessage, Startup, AgentAction } from '../types';
import { getMentorResponse } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  ArrowLeft,
  Rocket,
  MessageSquare,
  Zap,
  Check,
  X,
  Mail,
  ListTodo,
  Search as SearchIcon,
  ShieldCheck
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMentorProps {
  startupId: string;
  onBack: () => void;
}

export default function ChatMentor({ startupId, onBack }: ChatMentorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [pendingActions, setPendingActions] = useState<AgentAction[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStartup = async () => {
      const docRef = doc(db, 'startups', startupId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStartup({ id: docSnap.id, ...docSnap.data() } as Startup);
      }
    };
    fetchStartup();

    const q = query(
      collection(db, 'chats'),
      where('startupId', '==', startupId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(list);
    });

    const actionsQ = query(
      collection(db, 'agent_actions'),
      where('startupId', '==', startupId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeActions = onSnapshot(actionsQ, (snapshot) => {
      const list: AgentAction[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as AgentAction);
      });
      setPendingActions(list);
    });

    return () => {
      unsubscribe();
      unsubscribeActions();
    };
  }, [startupId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingActions]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !auth.currentUser || !startup) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      // Add user message to Firestore
      await addDoc(collection(db, 'chats'), {
        userId: auth.currentUser.uid,
        startupId,
        role: 'user',
        content: userMessage,
        createdAt: new Date().toISOString()
      });

      // Get AI response
      const result = await getMentorResponse(
        startup, 
        [...messages, { role: 'user', content: userMessage } as ChatMessage],
        isAgentMode
      );

      // Add AI message to Firestore
      await addDoc(collection(db, 'chats'), {
        userId: auth.currentUser.uid,
        startupId,
        role: 'assistant',
        content: result.text,
        createdAt: new Date().toISOString()
      });

      // Handle function calls
      if (result.functionCalls) {
        for (const fc of result.functionCalls) {
          await addDoc(collection(db, 'agent_actions'), {
            userId: auth.currentUser.uid,
            startupId,
            type: fc.name.replace('request_', ''),
            status: 'pending',
            details: fc.args,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionId: string, status: 'approved' | 'denied') => {
    try {
      if (!auth.currentUser) return;
      
      const actionRef = doc(db, 'agent_actions', actionId);
      const actionSnap = await getDoc(actionRef);
      const actionData = actionSnap.data() as AgentAction;

      // Update the action status
      await updateDoc(actionRef, {
        status: status === 'approved' ? 'completed' : 'denied',
        result: status === 'approved' ? 'Action executed successfully.' : 'Action denied by user.',
        updatedAt: new Date().toISOString()
      });

      // Add a system message to the chat
      await addDoc(collection(db, 'chats'), {
        userId: auth.currentUser.uid,
        startupId,
        role: 'assistant',
        content: `*System: Agent action "${actionData.type.replace('_', ' ')}" was ${status}.*`,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Action failed", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-160px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-500 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-emerald-500 p-2 rounded-xl">
            <Bot className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">AI Startup Mentor</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Advising: {startup?.name}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsAgentMode(!isAgentMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
            isAgentMode 
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Zap className={`w-4 h-4 ${isAgentMode ? 'fill-current' : ''}`} />
          {isAgentMode ? 'Agent Mode Active' : 'Enable Agent Mode'}
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold">Start a conversation</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Ask your AI co-founder about strategy, marketing, funding, or anything else on your mind.</p>
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {[
                "Should I pivot or persevere?", 
                "How do I handle burnout as a solo founder?", 
                "What's the most high-leverage task I should do today?",
                "Help me decide on my pricing tiers.",
                "How do I find my first 10 customers?"
              ].map((q, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(q)}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-full text-slate-400 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              {msg.role === 'assistant' ? <Bot className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
            </div>
            <div className={`max-w-[80%] p-6 rounded-3xl ${msg.role === 'assistant' ? 'bg-slate-900 border border-white/5 text-slate-200' : 'bg-emerald-500 text-slate-950 font-medium'}`}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Pending Agent Actions */}
        <AnimatePresence>
          {pendingActions.map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] p-6 md:ml-14 max-w-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500 p-2 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-emerald-400">Permission Required</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase">Agent wants to: {action.type.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="bg-slate-950/50 rounded-2xl p-4 mb-6 border border-white/5">
                {action.type === 'send_email' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="w-3 h-3" /> To: {action.details.to}
                    </div>
                    <div className="text-sm font-bold text-slate-200">{action.details.subject}</div>
                    <div className="text-xs text-slate-400 line-clamp-2 italic">"{action.details.body}"</div>
                  </div>
                )}
                {action.type === 'create_task' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ListTodo className="w-3 h-3" /> New Task
                    </div>
                    <div className="text-sm font-bold text-slate-200">{action.details.title}</div>
                    <div className="text-xs text-slate-400">{action.details.description}</div>
                  </div>
                )}
                {action.type === 'market_research' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <SearchIcon className="w-3 h-3" /> Deep Research
                    </div>
                    <div className="text-sm font-bold text-slate-200">Topic: {action.details.topic}</div>
                    <div className="text-xs text-slate-400">Depth: {action.details.depth}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(action.id, 'approved')}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button 
                  onClick={() => handleAction(action.id, 'denied')}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <X className="w-4 h-4" /> Deny
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-5 h-5" />
              </motion.div>
            </div>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl">
              <div className="flex gap-1">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-emerald-500 rounded-full" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-emerald-500 rounded-full" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-6 relative">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isAgentMode ? "Give your agent a task..." : "Ask your AI mentor anything..."}
          className={`w-full bg-slate-900 border-2 rounded-2xl py-4 pl-6 pr-16 text-lg focus:outline-none transition-all ${
            isAgentMode ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-white/5 focus:border-emerald-500'
          }`}
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
