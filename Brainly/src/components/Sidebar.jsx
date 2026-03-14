import { LayoutDashboard, Youtube, Twitter, Facebook, Grid, FileText, Video, Mic, Image as ImageIcon, LogOut, Users, Github, Folder, Plus, ArrowLeft, Star, BarChart2, BrainCircuit } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Added imports
import api from '../api';
import { useTheme } from '../contexts/ThemeContext';
import { CreateProjectModal } from './CreateProjectModal'; // Added import
import { motion } from 'framer-motion';

export const Sidebar = ({ activeTab, onTabChange, isProjectView }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/my-projects');
            if (response.data && response.data.data) {
                setProjects(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/logout'); // Remove config withCredentials
            localStorage.removeItem('token'); // Clear token
            navigate('/auth');
        } catch (error) {
            console.error("Logout failed:", error);
            // Even if api fails, redirect
            navigate('/auth');
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 text-blue-500" /> },
        { id: 'all', label: 'All Notes', icon: <Grid className="w-5 h-5 text-gray-500 dark:text-gray-400" /> },
        { id: 'favorites', label: 'Favorites', icon: <Star className="w-5 h-5 text-yellow-500" /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5 text-green-500" /> },
        { id: 'assessments', label: 'Mock Assessments', icon: <BrainCircuit className="w-5 h-5 text-indigo-500" /> },
        { id: 'shared', label: 'Shared Content', icon: <Users className="w-5 h-5 text-purple-500" /> },
        { id: 'youtube', label: 'Youtube', icon: <Youtube className="w-5 h-5 text-red-500" /> },
        { id: 'twitter', label: 'Twitter', icon: <Twitter className="w-5 h-5 text-blue-400" /> },
        { id: 'github', label: 'GitHub', icon: <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" /> },
    ];

    const typeItems = [
        { id: 'video', label: 'Videos', icon: <Video className="w-5 h-5" /> },
        { id: 'article', label: 'Articles', icon: <FileText className="w-5 h-5" /> },
        { id: 'audio', label: 'Audio', icon: <Mic className="w-5 h-5" /> },
        { id: 'image', label: 'Images', icon: <ImageIcon className="w-5 h-5" /> },
    ];

    return (
        <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full flex-shrink-0 transition-colors duration-300 relative z-50 shadow-xl"
        >

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <div className="p-4 flex flex-col gap-1">
                    <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">Sources</p>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                            ${activeTab === item.id
                                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-300 dark:ring-indigo-500/30'
                                    : 'text-gray-950 dark:text-gray-50 font-semibold hover:bg-white dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-white hover:shadow-md'}
                        `}
                        >
                            <span className={`transition-colors ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="px-4 flex flex-col gap-1">
                    <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">Types</p>
                    {typeItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                            ${activeTab === item.id
                                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-300 dark:ring-indigo-500/30'
                                    : 'text-gray-950 dark:text-gray-50 font-semibold hover:bg-white dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-white hover:shadow-md'}
                        `}
                        >
                            <span className={`transition-colors ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Projects Section - Only show if NOT in project view */}
                {!isProjectView && (
                    <div className="px-4 flex flex-col gap-1 mt-2 mb-4">
                        <div className="px-3 flex items-center justify-between mb-1 group">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Projects</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsProjectModalOpen(true);
                                }}
                                className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                title="Create Project"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={() => onTabChange('projects')}
                            className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                        ${activeTab === 'projects'
                                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-300 dark:ring-indigo-500/30'
                                    : 'text-gray-950 dark:text-gray-50 font-semibold hover:bg-white dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-white hover:shadow-md'}
                    `}
                        >
                            <span className={`transition-colors ${activeTab === 'projects' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                                <Folder className="w-5 h-5" />
                            </span>
                            <span className="font-medium text-sm">All Projects</span>
                        </button>
                    </div>
                )}
            </div>


            <div className="px-3">
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    {isProjectView ? (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium text-sm">Back</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    )}
                </div>
            </div>

            <CreateProjectModal
                open={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onProjectAdded={fetchProjects}
            />
        </motion.div>
    );
};
