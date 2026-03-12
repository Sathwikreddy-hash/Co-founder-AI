import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, doc, getDoc } from 'firebase/firestore';
import { ChatMessage, Startup } from '../types';
import { getMentorResponse } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  ArrowLeft,
  Rocket,
  MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMentorProps {
  startupId: string;
}

export default function ChatMentor({ startupId }: ChatMentorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [startup, setStartup] = useState<Startup | null>(null);
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

    return unsubscribe;
  }, [startupId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      const aiResponse = await getMentorResponse(startup, [...messages, { role: 'user', content: userMessage }]);

      // Add AI message to Firestore
      await addDoc(collection(db, 'chats'), {
        userId: auth.currentUser.uid,
        startupId,
        role: 'assistant',
        content: aiResponse,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-160px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <Bot className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">AI Startup Mentor</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Advising: {startup?.name}</p>
          </div>
        </div>
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
          placeholder="Ask your AI mentor anything..."
          className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl py-4 pl-6 pr-16 text-lg focus:outline-none focus:border-emerald-500 transition-all"
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
