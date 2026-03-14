import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Loader2, FileText, Sparkles, ExternalLink } from 'lucide-react';
import api from '../api';
import ReactMarkdown from 'react-markdown';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

export const BrainChat = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            content: "Hi! I'm your SecondBrain AI. I can analyze your saved notes or answer general questions like ChatGPT."
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const question = input.trim();
        setInput('');

        const currentMessages = [...messages];
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setLoading(true);

        try {
            const response = await api.post('/ask-brain', {
                question,
                history: currentMessages.map(m => ({ role: m.role, content: m.content }))
            });

            const data = response.data;

            setMessages(prev => [...prev, {
                role: 'ai',
                content: data.answer,
                sources: data.suggestedContent
            }]);

        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage = error.response?.data?.error || error.message || "Sorry, I had trouble thinking about that. Please try again later.";
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `Error: ${errorMessage}. Please check your API key or try again.`
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[85vh] bg-white dark:bg-[#0b0c10] border border-gray-200 dark:border-gray-800 shadow-2xl z-[100] flex flex-col transition-colors duration-300 rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white/95 dark:bg-[#0b0c10]/95 backdrop-blur-md z-10 transition-colors duration-300">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl transition-colors">
                                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">Ask Brain</h3>
                                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">AI Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
                        {messages.map((msg, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                key={index}
                            >
                                <div className={`
                            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                            ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}
                        `}>
                                    {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>

                                <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                p-4 rounded-2xl text-sm leading-relaxed
                                ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-none shadow-md shadow-indigo-500/20'
                                            : 'bg-white dark:bg-[#15161d] text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-800/60 shadow-sm'}
                            `}>
                                        {msg.role === 'ai' ? (
                                            <div className="markdown-content space-y-2">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                        a: ({ node, ...props }) => <a className="text-indigo-500 dark:text-indigo-400 font-semibold hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors" {...props} />,
                                                        code: ({ node, inline, ...props }) =>
                                                            inline
                                                                ? <code className="bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded-md text-xs font-mono text-indigo-600 dark:text-indigo-300 border border-gray-200 dark:border-gray-700/50" {...props} />
                                                                : <code className="block bg-gray-50 dark:bg-gray-900/80 p-3 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-mono text-indigo-600 dark:text-indigo-300 overflow-x-auto my-2 shadow-inner" {...props} />
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>

                                    {/* Sources Section */}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="ml-1 mt-1 space-y-2 w-full">
                                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5" />
                                                Sources Used
                                            </p>
                                            <div className="space-y-2">
                                                {msg.sources.map((source, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={source.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-800 border border-gray-200 hover:border-indigo-300 dark:border-gray-800 dark:hover:border-indigo-500/30 rounded-xl transition-all shadow-sm hover:shadow-md group"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {source.title}
                                                            </h4>
                                                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 flex-shrink-0 transition-colors" />
                                                        </div>
                                                        {source.type && (
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize mt-1.5 inline-block font-medium bg-gray-200/50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                                {source.type} • {Math.round((source.relevanceScore || 0) * 100)}% match
                                                            </span>
                                                        )}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400 flex items-center justify-center">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="bg-white dark:bg-[#15161d] rounded-2xl rounded-tl-none p-4 flex items-center gap-3 border border-gray-200 dark:border-gray-800/60 shadow-sm">
                                    <Loader2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-spin" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">Brain is thinking...</span>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-[#0b0c10] border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
                        <form onSubmit={handleSend} className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your knowledge base..."
                                className="w-full pl-4 pr-12 py-3.5 bg-gray-50 dark:bg-[#15161d] border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium group-hover:border-gray-300 dark:group-hover:border-gray-700"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow-sm hover:shadow-md hover:shadow-indigo-500/30 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
