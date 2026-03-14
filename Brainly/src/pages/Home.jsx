import React, { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Share2, Shield, Zap, ArrowRight, Github } from 'lucide-react';
import { Button } from '../components/Button';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

// Lazy loading the heavy 3D background to remove lag
const ThreeDBackground = lazy(() => import('../components/ThreeDBackground'));

// Simple Navbar Component
const Navbar = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed top-0 w-full z-50 border-b border-gray-200 dark:border-gray-800/60 bg-white/70 dark:bg-[#0b0c10]/70 backdrop-blur-xl transition-colors duration-300"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-all shadow-sm">
                            <Brain className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">SecondBrain</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-100 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg transition-all"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            )}
                        </button>
                        <Button
                            onClick={() => navigate('/auth')}
                            variant="secondary"
                            className="hidden sm:block text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all rounded-lg"
                        >
                            Log in
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate('/auth')}
                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 border-none rounded-lg font-semibold"
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ y: -5 }}
        className="p-8 rounded-3xl bg-white/60 dark:bg-gray-900/40 border border-gray-200/80 dark:border-gray-800/60 backdrop-blur-md hover:border-indigo-400/50 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-900/80 shadow-xl shadow-gray-200/20 dark:shadow-none transition-all duration-300 group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500">
            {icon}
        </div>
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
            {description}
        </p>
    </motion.div>
);

function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b0c10] font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-300">
            <Suspense fallback={null}>
                <ThreeDBackground />
            </Suspense>
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold mb-8 shadow-sm"
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                        </span>
                        New: AI-Powered Brain Chat
                    </motion.div>

                    <div className="perspective-1000">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.2 }}
                            className="text-6xl sm:text-8xl font-black tracking-tight mb-8 transform hover:-translate-y-1 transition-transform duration-500 cursor-default"
                        >
                            <span className="block text-gray-900 dark:text-gray-100 mb-2">
                                Organize your
                            </span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-sm pb-2">
                                digital life.
                            </span>
                        </motion.h1>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 font-medium mb-12 leading-relaxed"
                    >
                        SecondBrain is your personal knowledge base. Store links, videos, articles, and thoughts in one place. Access them anywhere, anytime without lag.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button
                            size="lg"
                            variant="primary"
                            onClick={() => navigate('/auth')}
                            className="w-full sm:w-auto px-10 py-5 text-xl font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white hover:scale-105 transition-all duration-300 border-none group"
                        >
                            Start for free
                            <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-5 rounded-2xl font-bold bg-white dark:bg-[#15161d] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
                        >
                            <Github className="w-5 h-5" />
                            Star on GitHub
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 relative z-10 bg-gray-50/50 dark:bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">Everything you need to remember</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                            Stop bookmarking and forgetting. SecondBrain helps you capture and retrieve information effortlessly.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-8 h-8" />}
                            title="Instant Capture"
                            description="Save content from anywhere with a single click. Links, tweets, videos, and articles effortlessly integrated into your brain."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Brain className="w-8 h-8" />}
                            title="Smart Organization"
                            description="Tag and categorize your content automatically. Find anything instantly with powerful AI-assisted search capabilities."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Share2 className="w-8 h-8" />}
                            title="Share with Friends"
                            description="Curate your collections and share them with the world. Collaborate on knowledge bases to build a shared brain."
                            delay={0.3}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-200 dark:border-gray-800 relative z-10 bg-white dark:bg-[#0b0c10] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 font-medium">
                    <p>© {new Date().getFullYear()} SecondBrain. All rights reserved. Fast. Innovative. Secure.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
