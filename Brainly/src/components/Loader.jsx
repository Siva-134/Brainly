import React from 'react';
import { Brain } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0b0c10] transition-colors duration-300">
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 animate-pulse group-hover:opacity-60 transition-opacity"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl shadow-indigo-500/10 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
            <Brain className="w-14 h-14 text-indigo-500 dark:text-indigo-400 animate-bounce" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-[bounce_1s_infinite_0ms] shadow-lg shadow-indigo-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-[bounce_1s_infinite_200ms] shadow-lg shadow-purple-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-[bounce_1s_infinite_400ms] shadow-lg shadow-pink-500/50"></div>
          </div>
          <span className="text-gray-600 dark:text-gray-400 font-semibold tracking-wider text-sm uppercase">Loading SecondBrain</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
