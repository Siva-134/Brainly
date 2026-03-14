import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { Plus, Brain, Search, Menu, Sparkles, Sun, Moon, Globe, Youtube, Github, Folder, Trash2, User, Lock, Grid, Users, Video, FileText, Mic, Image as ImageIcon, LogOut, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { CreateContentModal } from '../components/CreateContentModal';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { BrainChat } from '../components/BrainChat';
import { Button } from '../components/Button';
import { ShareModal } from '../components/ShareModal';
import { WebSearch } from '../components/WebSearch';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { ContentPreviewModal } from '../components/ContentPreviewModal';

// Dashboard component
function Dashboard() {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const isProjectView = !!projectId;
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareData, setShareData] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [searchSource, setSearchSource] = useState('brain'); // 'brain', 'youtube', 'google', 'github'
    const [modalInitialLink, setModalInitialLink] = useState('');
    const [editingContent, setEditingContent] = useState(null);
    const [projects, setProjects] = useState([]);
    const [userData, setUserData] = useState({ name: '', email: '' });
    const [showProfile, setShowProfile] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState({ open: false, link: '', title: '', type: '' });
    const { theme, toggleTheme } = useTheme();

    // Resume State
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeJobDesc, setResumeJobDesc] = useState('');
    const [resumeTestLoading, setResumeTestLoading] = useState(false);
    const [resumeFeedback, setResumeFeedback] = useState(null);
    const [atsResult, setAtsResult] = useState(null);
    const [resumeMode, setResumeMode] = useState(null); // 'test' | 'ats'

    // Assessment State
    const [assessmentData, setAssessmentData] = useState(null);
    const [assessmentLoading, setAssessmentLoading] = useState(false);
    const [assessmentMode, setAssessmentMode] = useState(null); // 'content', 'topic', 'project'
    const [assessmentTopic, setAssessmentTopic] = useState("");
    const [assessmentProject, setAssessmentProject] = useState("");
    const [assessmentCount, setAssessmentCount] = useState(5);
    const [assessmentDifficulty, setAssessmentDifficulty] = useState("medium");
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [score, setScore] = useState(null);
    const [answers, setAnswers] = useState({});

    const fetchUserProjects = async () => {
        try {
            const response = await api.get('/my-projects');
            if (response.data && response.data.data) {
                setProjects(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    useEffect(() => {
        if (activeTab === 'projects') {
            fetchUserProjects();
        }
    }, [activeTab]);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/me');
                if (res.data) setUserData(res.data);
            } catch (e) {
                console.error("Error fetching user data:", e);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            localStorage.removeItem('token');
            navigate('/auth');
        } catch (error) {
            navigate('/auth');
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await api.delete(`/delete-project/${projectId}`);
                fetchUserProjects();
            } catch (error) {
                console.error("Error deleting project:", error);
                alert("Failed to delete project");
            }
        }
    };

    const fetchContents = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const params = projectId ? { projectId } : {};
            const response = await api.get('/my-contents', { params });
            if (response.data && Array.isArray(response.data.data)) {
                setContents(response.data.data);
                if (response.data.currentUserId) {
                    setCurrentUserId(response.data.currentUserId);
                }
            }
        } catch (error) {
            console.error("Error fetching contents:", error);
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            setActiveTab("all");
        }
        fetchContents();
    }, [projectId]);

    const filteredContents = contents.filter(content => {
        // Filter by Tab
        let tabMatch = true;
        if (activeTab !== 'all') {
            if (['video', 'audio', 'article', 'image'].includes(activeTab)) {
                tabMatch = content.type === activeTab;
            } else if (activeTab === 'youtube') {
                tabMatch = (content.link && (content.link.includes('youtube.com') || content.link.includes('youtu.be'))) || (content.platform && content.platform.toLowerCase() === 'youtube');
            } else if (activeTab === 'twitter') {
                tabMatch = content.link && (content.link.includes('twitter.com') || content.link.includes('x.com'));
            } else if (activeTab === 'facebook') {
                tabMatch = content.link && content.link.includes('facebook.com');
            } else if (activeTab === 'github') {
                tabMatch = content.type === 'git_repo' || (content.link && content.link.includes('github.com'));
            } else if (activeTab === 'favorites') {
                tabMatch = content.isFavorite === true;
            } else if (activeTab === 'shared') {
                // Show content shared WITH me OR content I shared with OTHERS
                const isSharedWithMe = (content.userId?._id || content.userId) !== currentUserId;
                const isSharedByMe = (content.userId?._id || content.userId) === currentUserId && content.sharedWith && content.sharedWith.length > 0;
                tabMatch = isSharedWithMe || isSharedByMe;
            }
        }

        // Filter by Search
        let searchMatch = true;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            searchMatch =
                content.title.toLowerCase().includes(query) ||
                (content.tags && content.tags.some(tag => tag.title && tag.title.toLowerCase().includes(query)));
        }

        return tabMatch && searchMatch;
    });

    const categoryTabs = [
        { id: 'all', label: 'All', icon: <Grid className="w-4 h-4" />, colorClass: 'from-blue-500 to-indigo-500 shadow-blue-500/30 text-white border-transparent' },
        { id: 'projects', label: 'Projects', icon: <Folder className="w-4 h-4" />, colorClass: 'from-emerald-500 to-teal-500 shadow-emerald-500/30 text-white border-transparent' },
        { id: 'shared', label: 'Shared', icon: <Users className="w-4 h-4" />, colorClass: 'from-purple-500 to-fuchsia-500 shadow-purple-500/30 text-white border-transparent' },
        { id: 'video', label: 'Videos', icon: <Video className="w-4 h-4" />, colorClass: 'from-pink-500 to-rose-500 shadow-pink-500/30 text-white border-transparent' },
        { id: 'article', label: 'Articles', icon: <FileText className="w-4 h-4" />, colorClass: 'from-orange-500 to-amber-500 shadow-orange-500/30 text-white border-transparent' },
        { id: 'image', label: 'Images', icon: <ImageIcon className="w-4 h-4" />, colorClass: 'from-sky-500 to-blue-500 shadow-sky-500/30 text-white border-transparent' },
        { id: 'audio', label: 'Audio', icon: <Mic className="w-4 h-4" />, colorClass: 'from-violet-500 to-purple-500 shadow-violet-500/30 text-white border-transparent' },
        { id: 'youtube', label: 'YouTube', icon: <Youtube className="w-4 h-4" />, colorClass: 'from-red-500 to-rose-600 shadow-red-500/30 text-white border-transparent' },
        { id: 'github', label: 'GitHub', icon: <Github className="w-4 h-4" />, colorClass: 'from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 shadow-slate-500/30 text-white border-transparent' },
    ];

    // Assessment Handlers
    const handleResumeTest = async () => {
        if (!resumeFile) return alert('Please upload a resume');
        setResumeTestLoading(true);
        setAssessmentData(null);
        setResumeFeedback(null);
        setScore(null);
        setAnswers({});
        setCurrentQuestionIdx(0);

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            const res = await api.post('/resume/test', formData);
            if (res.data) {
                setAssessmentData(res.data.questions);
                setResumeFeedback(res.data.feedback);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to generate resume test');
        } finally {
            setResumeTestLoading(false);
        }
    };

    const handleAtsScore = async () => {
        if (!resumeFile) return alert('Please upload a resume');
        if (!resumeJobDesc) return alert('Please enter job description');
        setResumeTestLoading(true);
        setAtsResult(null);
        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            formData.append('jobDescription', resumeJobDesc);
            const res = await api.post('/resume/ats', formData);
            if (res.data) {
                setAtsResult(res.data);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to get ATS score');
        } finally {
            setResumeTestLoading(false);
        }
    };

    const generateAssessment = async () => {
        if (assessmentMode === 'topic' && !assessmentTopic.trim()) {
            alert("Please enter a topic.");
            return;
        }
        if (assessmentMode === 'project' && !assessmentProject) {
            alert("Please select a project.");
            return;
        }

        setAssessmentLoading(true);
        setAssessmentData(null);
        setScore(null);
        setAnswers({});
        setCurrentQuestionIdx(0);
        try {
            const res = await api.post('/generate-assessment', {
                mode: assessmentMode,
                topic: assessmentTopic,
                projectId: assessmentProject,
                questionCount: assessmentCount,
                difficulty: assessmentDifficulty
            });
            if (res.data && res.data.questions) {
                setAssessmentData(res.data.questions);
            }
        } catch (e) {
            console.error("Failed to make assessment", e);
            alert("Error generating assessment.");
        } finally {
            setAssessmentLoading(false);
        }
    };

    const handleAnswerSelect = (optIndex) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIdx]: optIndex }));
    };

    const nextQuestion = () => {
        if (currentQuestionIdx < assessmentData.length - 1) {
            setCurrentQuestionIdx(curr => curr + 1);
        } else {
            // Calculate Score
            let total = 0;
            assessmentData.forEach((q, idx) => {
                if (answers[idx] === q.correctIndex) total += 1;
            });
            setScore(total);
        }
    };

    return (
        <div className="flex min-h-screen relative font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Premium, interactive gradient background */}
            <div
                className="fixed inset-0 z-[-1] w-full h-full pointer-events-none transition-all duration-500 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900"
            >
                {/* Glowing Orbs for dynamic feel */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-purple-400/30 dark:bg-purple-600/20 blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-cyan-400/30 dark:bg-cyan-600/20 blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>
            </div>

            {/* Left Sidebar for New Features */}
            {!isProjectView && (
                <aside className="w-64 hidden md:flex flex-col flex-shrink-0 border-r border-gray-200/50 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl h-screen sticky top-0 pt-28 pb-8 px-4 gap-2 z-[50]">
                    <div className="mb-6 px-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        <h2 className="font-bold text-lg tracking-tight">New Features</h2>
                    </div>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${activeTab === 'favorites' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 shadow-sm ring-1 ring-yellow-500/50' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Grid className="w-5 h-5" /> Favorites
                    </button>
                    <button
                        onClick={() => setActiveTab('assessments')}
                        className={`flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${activeTab === 'assessments' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm ring-1 ring-purple-500/50' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Brain className="w-5 h-5" /> Mock Assessment
                    </button>

                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${activeTab === 'analytics' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/50' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Grid className="w-5 h-5" /> Analytics
                    </button>

                    <div className="mt-auto px-2 opacity-50 text-xs text-gray-500 font-medium">
                        Access your recent tools here
                    </div>
                </aside>
            )}

            {/* Main Layout Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Sticky Modern Header - Glassmorphism */}
                <header
                    className="fixed top-0 inset-x-0 w-full flex items-center justify-between px-6 py-4 border-b border-gray-200/50 dark:border-white/5 z-[60] transition-all duration-300 bg-white/70 dark:bg-[#0b0c10]/70 backdrop-blur-2xl"
                >
                    {/* Left: Brand & Profile */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowProfile(!showProfile)}
                                className="bg-gray-100 dark:bg-white/10 p-2 rounded-xl text-gray-700 dark:text-white backdrop-blur-md hover:bg-gray-200 dark:hover:bg-white/20 transition-colors shadow-sm ring-1 ring-gray-200/50 dark:ring-white/10"
                            >
                                <User className="w-6 h-6" />
                            </button>

                            {showProfile && (
                                <div className="absolute top-14 left-0 w-64 bg-white dark:bg-[#15161d] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-4 animate-in fade-in zoom-in-95 duration-200 z-[99999]">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2.5 rounded-full text-indigo-600 dark:text-indigo-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{userData.name || 'User'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userData.email || 'No email'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10 flex flex-col gap-1">
                                        <button
                                            onClick={() => {
                                                setIsChangePasswordModalOpen(true);
                                                setShowProfile(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <Lock className="w-4 h-4" />
                                            Change Password
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            <div className="bg-indigo-600 p-2 rounded-xl text-white backdrop-blur-md shadow-lg shadow-indigo-500/20">
                                <Brain className="w-6 h-6" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">SecondBrain</h1>
                        </div>
                    </div>

                    {/* Center: Search */}
                    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 relative">
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder={searchSource === 'brain' ? "Search your knowledge..." : `Search ${searchSource.charAt(0).toUpperCase() + searchSource.slice(1)}...`}
                                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-none ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50/50 dark:bg-black/30 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-white/30 focus:bg-white dark:focus:bg-black/50 focus:outline-none transition-all shadow-inner dark:shadow-none font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Search Source Tabs */}
                        <div className="flex items-center gap-1 mt-2 bg-gray-100/50 dark:bg-black/20 p-1 rounded-xl backdrop-blur-md">
                            <button
                                onClick={() => setSearchSource('brain')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all
                                ${searchSource === 'brain'
                                        ? 'bg-white dark:bg-white/20 text-indigo-600 dark:text-white shadow-sm ring-1 ring-gray-200/50 dark:ring-0'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'}`}
                            >
                                <Brain className="w-3.5 h-3.5" />
                                Brain
                            </button>
                            <button
                                onClick={() => setSearchSource('youtube')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all
                                ${searchSource === 'youtube'
                                        ? 'bg-white dark:bg-red-500/20 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-0'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'}`}
                            >
                                <Youtube className="w-3.5 h-3.5" />
                                YouTube
                            </button>
                            <button
                                onClick={() => setSearchSource('google')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all
                                ${searchSource === 'google'
                                        ? 'bg-white dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-0'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'}`}
                            >
                                <Globe className="w-3.5 h-3.5" />
                                Google
                            </button>
                            <button
                                onClick={() => setSearchSource('github')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all
                                ${searchSource === 'github'
                                        ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/50 dark:ring-0'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'}`}
                            >
                                <Github className="w-3.5 h-3.5" />
                                Github
                            </button>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors bg-white/50 dark:bg-black/20 ring-1 ring-gray-200 dark:ring-white/10"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            startIcon={<Plus className="w-5 h-5" />}
                            size="md"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 px-5 font-semibold hidden sm:flex"
                        >
                            Add Content
                        </Button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-28 pb-8 flex flex-col">
                    {/* Modern Pill Navigation for Categories */}
                    {searchSource === 'brain' && !isProjectView && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide no-scrollbar -mx-2 px-2">
                            {categoryTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    // if active, we apply a bg-gradient-to-r and combine it with colorClass. If not, fallback to light mode border styles.
                                    className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border
                                    ${activeTab === tab.id
                                            ? `bg-gradient-to-br ${tab.colorClass} shadow-lg scale-105`
                                            : 'bg-white/60 border-gray-200/50 text-gray-700 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 dark:bg-black/40 dark:border-white/5 dark:text-gray-300 dark:hover:bg-black/60 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400 backdrop-blur-md shadow-sm'}`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {isProjectView && (
                        <div className="mb-8 flex items-center">
                            <button
                                onClick={() => {
                                    // Make sure it goes back to exactly where projects live
                                    navigate('/dashboard');
                                    setActiveTab('projects');
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all font-medium"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to Projects
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-6 w-full flex-1 mb-20">
                        {searchSource === 'brain' ? (
                            activeTab === 'analytics' ? (
                                <div className="w-full animation-fade-in fade-in zoom-in-95 mt-4">
                                    <h2 className="text-2xl font-bold mb-6">Knowledge Analytics</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white/80 dark:bg-[#15161d]/80 p-6 rounded-2xl shadow ring-1 ring-gray-100 dark:ring-white/5">
                                            <p className="text-gray-500 font-semibold mb-1">Total Notes</p>
                                            <h3 className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{contents.length}</h3>
                                        </div>
                                        <div className="bg-white/80 dark:bg-[#15161d]/80 p-6 rounded-2xl shadow ring-1 ring-gray-100 dark:ring-white/5">
                                            <p className="text-gray-500 font-semibold mb-1">Total Projects</p>
                                            <h3 className="text-4xl font-black text-blue-600 dark:text-blue-400">{projects.length}</h3>
                                        </div>
                                        <div className="bg-white/80 dark:bg-[#15161d]/80 p-6 rounded-2xl shadow ring-1 ring-gray-100 dark:ring-white/5">
                                            <p className="text-gray-500 font-semibold mb-1">Total Favorites</p>
                                            <h3 className="text-4xl font-black text-yellow-500">{contents.filter(c => c.isFavorite).length}</h3>
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'assessments' ? (
                                <div className="w-full flex flex-col items-center justify-center animation-fade-in fade-in mt-10">
                                    <h2 className="text-3xl font-bold mb-4">Mock Assessment</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg text-center">
                                        Test your knowledge! Generate a quiz based on your saved content or specify a specific topic.
                                    </p>

                                    {!assessmentMode && !assessmentData && !assessmentLoading && (
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button
                                                onClick={() => setAssessmentMode('content')}
                                                size="lg"
                                                className="px-6 shadow-xl bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex-1"
                                            >
                                                <Brain className="w-5 h-5 mr-2" /> Content Test
                                            </Button>
                                            <Button
                                                onClick={() => setAssessmentMode('topic')}
                                                size="lg"
                                                className="px-6 shadow-xl bg-purple-600 hover:bg-purple-500 text-white rounded-full flex-1"
                                            >
                                                <Search className="w-5 h-5 mr-2" /> Topic Test
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setAssessmentMode('project');
                                                    if (projects.length === 0) fetchUserProjects();
                                                }}
                                                size="lg"
                                                className="px-6 shadow-xl bg-blue-600 hover:bg-blue-500 text-white rounded-full flex-1"
                                            >
                                                <Folder className="w-5 h-5 mr-2" /> Project Test
                                            </Button>
                                        </div>
                                    )}

                                    {assessmentMode === 'content' && !assessmentData && !assessmentLoading && (
                                        <div className="flex flex-col items-center gap-4 w-full max-w-md">
                                            <p className="text-sm font-medium text-gray-500 text-center">We'll scan your saved brain content to build a test.</p>

                                            <div className="w-full">
                                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Number of Questions</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    value={assessmentCount}
                                                    onChange={(e) => setAssessmentCount(Number(e.target.value))}
                                                    className="w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            <Button onClick={generateAssessment} size="lg" className="px-8 shadow-xl bg-indigo-600 hover:bg-indigo-500 text-white rounded-full w-full">
                                                <Brain className="w-5 h-5 mr-2" /> Start Quiz
                                            </Button>
                                            <button onClick={() => setAssessmentMode(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                                        </div>
                                    )}

                                    {assessmentMode === 'topic' && !assessmentData && !assessmentLoading && (
                                        <div className="flex flex-col items-center gap-4 w-full max-w-md">
                                            <div className="w-full">
                                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Topic</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter a specific topic (e.g. AWS S3, React Hooks)"
                                                    value={assessmentTopic}
                                                    onChange={(e) => setAssessmentTopic(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            <div className="w-full">
                                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Number of Questions</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    value={assessmentCount}
                                                    onChange={(e) => setAssessmentCount(Number(e.target.value))}
                                                    className="w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            <div className="w-full">
                                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Difficulty</label>
                                                <select
                                                    value={assessmentDifficulty}
                                                    onChange={(e) => setAssessmentDifficulty(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white outline-none cursor-pointer"
                                                >
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>

                                            <Button onClick={generateAssessment} size="lg" className="px-8 shadow-xl bg-purple-600 hover:bg-purple-500 text-white rounded-full w-full">
                                                <Brain className="w-5 h-5 mr-2" /> Start Quiz
                                            </Button>
                                            <button onClick={() => { setAssessmentMode(null); setAssessmentTopic(""); setAssessmentDifficulty("medium"); }} className="text-xs text-gray-400 hover:underline">Cancel</button>
                                        </div>
                                    )}

                                    {assessmentMode === 'project' && !assessmentData && !assessmentLoading && (
                                        <div className="flex flex-col items-center gap-4 w-full max-w-md">
                                            <div className="w-full">
                                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Select Project</label>
                                                {projects.length > 0 ? (
                                                    <select
                                                        value={assessmentProject}
                                                        onChange={(e) => setAssessmentProject(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white outline-none cursor-pointer"
                                                    >
                                                        <option value="" disabled>Select a Project</option>
                                                        {projects.map((proj) => (
                                                            <option key={proj._id} value={proj._id}>
                                                                {proj.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <p className="text-sm font-medium text-gray-500">You don't have any projects yet.</p>
                                                )}
                                            </div>

                                            <div className="w-full">
                                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Number of Questions</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    value={assessmentCount}
                                                    onChange={(e) => setAssessmentCount(Number(e.target.value))}
                                                    className="w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            <Button
                                                onClick={generateAssessment}
                                                size="lg"
                                                disabled={projects.length === 0}
                                                className="px-8 shadow-xl bg-blue-600 hover:bg-blue-500 text-white rounded-full w-full"
                                            >
                                                <Brain className="w-5 h-5 mr-2" /> Start Quiz
                                            </Button>
                                            <button onClick={() => { setAssessmentMode(null); setAssessmentProject(""); }} className="text-xs text-gray-400 hover:underline">Cancel</button>
                                        </div>
                                    )}

                                    {assessmentLoading && (
                                        <div className="flex items-center justify-center mt-10">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                                            <span className="ml-4 font-semibold text-purple-600">Reading your brain and writing questions...</span>
                                        </div>
                                    )}

                                    {assessmentData && score === null && (
                                        <div className="w-full max-w-2xl mt-6">
                                            <div className="flex justify-start mb-4">
                                                <button
                                                    onClick={() => { setAssessmentData(null); setAnswers({}); setCurrentQuestionIdx(0); }}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all font-medium"
                                                >
                                                    <ArrowLeft className="w-5 h-5" /> Quit Assessment
                                                </button>
                                            </div>
                                            <div className="bg-white dark:bg-[#15161d] p-8 rounded-3xl shadow-xl ring-1 ring-gray-200 dark:ring-white/10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className="text-sm font-bold text-gray-500 uppercase">Question {currentQuestionIdx + 1} of {assessmentData.length}</span>
                                                </div>
                                                <h3 className="text-2xl font-semibold mb-8">{assessmentData[currentQuestionIdx].question}</h3>

                                                <div className="flex flex-col gap-3">
                                                    {assessmentData[currentQuestionIdx].options.map((opt, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => handleAnswerSelect(i)}
                                                            className={`w-full text-left p-4 rounded-xl transition-all duration-200 font-medium border-2
                                                        ${answers[currentQuestionIdx] === i
                                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300'
                                                                    : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-200'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="mt-8 flex justify-end">
                                                    <Button
                                                        onClick={nextQuestion}
                                                        disabled={answers[currentQuestionIdx] === undefined}
                                                        className="bg-gray-900 text-white dark:bg-white dark:text-black rounded-xl w-32"
                                                    >
                                                        {currentQuestionIdx === assessmentData.length - 1 ? 'Finish' : 'Next'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {score !== null && (
                                        <div className="flex flex-col items-center mt-6">
                                            <div className="w-32 h-32 rounded-full border-8 border-purple-500 flex items-center justify-center mb-6">
                                                <span className="text-4xl font-black text-purple-600 dark:text-purple-400">{score}/{assessmentData.length}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                                            <p className="text-gray-500 mb-8 max-w-md text-center">Review your answers below to verify your knowledge.</p>

                                            <div className="w-full max-w-3xl flex flex-col gap-6">
                                                {assessmentData.map((q, idx) => {
                                                    const isCorrect = answers[idx] === q.correctIndex;
                                                    return (
                                                        <div key={idx} className={`p-6 rounded-2xl border-l-4 shadow-sm ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-500/10' : 'border-red-500 bg-red-50 dark:bg-red-500/10'}`}>
                                                            <h4 className="font-semibold text-lg mb-2">{q.question}</h4>
                                                            <p className="text-sm font-medium mb-1">Your Answer: <span className={isCorrect ? 'text-green-600' : 'text-red-500'}>{q.options[answers[idx]]}</span></p>
                                                            {!isCorrect && <p className="text-sm font-medium text-green-600 mb-3">Correct Answer: {q.options[q.correctIndex]}</p>}
                                                            <div className="mt-4 p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                                                                <p className="text-sm italic"><span className="font-bold">Explanation:</span> {q.explanation}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-8 flex gap-4 justify-center">
                                                <Button onClick={() => { setScore(null); setAssessmentData(null); setAssessmentMode(null); setAssessmentTopic(""); setAssessmentProject(""); }} variant="secondary">Back</Button>
                                                <Button onClick={generateAssessment} className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-8 shadow-xl">Next Test</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'resume' ? (
                                <div className="w-full flex flex-col items-center justify-center animation-fade-in fade-in mt-10">
                                    <h2 className="text-3xl font-bold mb-4">Resume Analyzer</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg text-center">
                                        Upload your resume to generate a mock test or calculate your ATS score against a job description.
                                    </p>

                                    {!resumeMode && !resumeTestLoading && !atsResult && !assessmentData && (
                                        <div className="flex flex-col items-center gap-6 w-full max-w-md">
                                            <div className="w-full">
                                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Upload Resume (PDF/TXT/DOCX)</label>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.txt,.docx"
                                                    onChange={(e) => setResumeFile(e.target.files[0])}
                                                    className="w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex w-full gap-4">
                                                <Button onClick={() => setResumeMode('test')} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white shadow-xl rounded-xl">Mock Test</Button>
                                                <Button onClick={() => setResumeMode('ats')} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl rounded-xl">ATS Score</Button>
                                            </div>
                                        </div>
                                    )}

                                    {resumeMode === 'test' && !resumeTestLoading && !assessmentData && (
                                        <div className="flex flex-col items-center gap-4 w-full max-w-md">
                                            <p className="text-center text-gray-500 text-sm">We'll scan your resume to prepare a test evaluating your technical skills.</p>
                                            <div className="flex w-full gap-4 mt-2">
                                                <Button onClick={() => setResumeMode(null)} variant="secondary" className="flex-1">Back</Button>
                                                <Button onClick={handleResumeTest} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl">Start Test</Button>
                                            </div>
                                        </div>
                                    )}

                                    {resumeMode === 'ats' && !resumeTestLoading && !atsResult && (
                                        <div className="flex flex-col items-center gap-4 w-full max-w-lg">
                                            <div className="w-full">
                                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Job Description</label>
                                                <textarea
                                                    rows="6"
                                                    placeholder="Paste the target job description here..."
                                                    value={resumeJobDesc}
                                                    onChange={(e) => setResumeJobDesc(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex w-full gap-4 mt-2">
                                                <Button onClick={() => setResumeMode(null)} variant="secondary" className="flex-1">Back</Button>
                                                <Button onClick={handleAtsScore} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">Calculate Score</Button>
                                            </div>
                                        </div>
                                    )}

                                    {resumeTestLoading && (
                                        <div className="flex items-center justify-center mt-10">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                                            <span className="ml-4 font-semibold text-indigo-600">Analyzing your resume...</span>
                                        </div>
                                    )}

                                    {/* ATS Results View */}
                                    {atsResult && !resumeTestLoading && (
                                        <div className="w-full max-w-2xl mt-6 flex flex-col">
                                            <div className="flex justify-start mb-4">
                                                <button
                                                    onClick={() => { setAtsResult(null); setResumeMode(null); }}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all font-medium"
                                                >
                                                    <ArrowLeft className="w-5 h-5" /> Start Over
                                                </button>
                                            </div>
                                            <div className="bg-white dark:bg-[#15161d] p-8 rounded-3xl shadow-xl ring-1 ring-gray-200 dark:ring-white/10 flex flex-col items-center">
                                                <div className="w-32 h-32 rounded-full border-8 border-indigo-500 flex items-center justify-center mb-6">
                                                    <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{atsResult.score}%</span>
                                                </div>
                                                <h3 className="text-2xl font-bold mb-6">ATS Compatibility Score</h3>

                                                <div className="w-full text-left bg-gray-50 dark:bg-black/20 p-6 rounded-2xl mb-6">
                                                    <h4 className="font-semibold text-lg mb-2">Feedback</h4>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{atsResult.feedback}</p>
                                                </div>

                                                <div className="w-full text-left bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-2xl">
                                                    <h4 className="font-semibold text-lg mb-4 text-indigo-700 dark:text-indigo-300">Areas for Improvement</h4>
                                                    <ul className="list-disc pl-5 space-y-2">
                                                        {atsResult.improvements?.map((imp, i) => (
                                                            <li key={i} className="text-gray-600 dark:text-gray-300 text-sm">{imp}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resume Test View */}
                                    {assessmentData && score === null && (
                                        <div className="w-full max-w-2xl mt-6">
                                            <div className="flex justify-start mb-4">
                                                <button
                                                    onClick={() => { setAssessmentData(null); setAnswers({}); setCurrentQuestionIdx(0); setResumeMode(null); }}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all font-medium"
                                                >
                                                    <ArrowLeft className="w-5 h-5" /> Quit Assessment
                                                </button>
                                            </div>
                                            <div className="bg-white dark:bg-[#15161d] p-8 rounded-3xl shadow-xl ring-1 ring-gray-200 dark:ring-white/10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className="text-sm font-bold text-gray-500 uppercase">Question {currentQuestionIdx + 1} of {assessmentData.length}</span>
                                                </div>
                                                <h3 className="text-2xl font-semibold mb-8">{assessmentData[currentQuestionIdx].question}</h3>

                                                <div className="flex flex-col gap-3">
                                                    {assessmentData[currentQuestionIdx].options.map((opt, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => handleAnswerSelect(i)}
                                                            className={`w-full text-left p-4 rounded-xl transition-all duration-200 font-medium border-2
                                                                ${answers[currentQuestionIdx] === i
                                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300'
                                                                    : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-200'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="mt-8 flex justify-end">
                                                    <Button
                                                        onClick={nextQuestion}
                                                        disabled={answers[currentQuestionIdx] === undefined}
                                                        className="bg-gray-900 text-white dark:bg-white dark:text-black rounded-xl w-32"
                                                    >
                                                        {currentQuestionIdx === assessmentData.length - 1 ? 'Finish' : 'Next'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Score and Resume Feedback View */}
                                    {score !== null && resumeFeedback && (
                                        <div className="flex flex-col items-center mt-6 w-full max-w-3xl">
                                            <div className="w-32 h-32 rounded-full border-8 border-purple-500 flex items-center justify-center mb-6">
                                                <span className="text-4xl font-black text-purple-600 dark:text-purple-400">{score}/{assessmentData.length}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-8">Test Complete!</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
                                                <div className="bg-green-50 dark:bg-green-500/10 p-6 rounded-2xl border border-green-200 dark:border-green-500/20">
                                                    <h4 className="font-semibold text-lg mb-2 text-green-700 dark:text-green-400">Your Strengths</h4>
                                                    <p className="text-sm text-green-800 dark:text-green-300">{resumeFeedback.strongAreas}</p>
                                                </div>
                                                <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-2xl border border-red-200 dark:border-red-500/20">
                                                    <h4 className="font-semibold text-lg mb-2 text-red-700 dark:text-red-400">Areas to Improve</h4>
                                                    <p className="text-sm text-red-800 dark:text-red-300">{resumeFeedback.weakAreas}</p>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-2xl border border-blue-200 dark:border-blue-500/20 md:col-span-2">
                                                    <h4 className="font-semibold text-lg mb-2 text-blue-700 dark:text-blue-400">Actionable Suggestions</h4>
                                                    <p className="text-sm text-blue-800 dark:text-blue-300">{resumeFeedback.suggestions}</p>
                                                </div>
                                            </div>

                                            <p className="text-gray-500 mb-4 font-semibold text-left w-full">Question Review</p>
                                            <div className="w-full flex flex-col gap-6">
                                                {assessmentData.map((q, idx) => {
                                                    const isCorrect = answers[idx] === q.correctIndex;
                                                    return (
                                                        <div key={idx} className={`p-6 rounded-2xl border-l-4 shadow-sm ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-500/10' : 'border-red-500 bg-red-50 dark:bg-red-500/10'}`}>
                                                            <h4 className="font-semibold text-lg mb-2">{q.question}</h4>
                                                            <p className="text-sm font-medium mb-1">Your Answer: <span className={isCorrect ? 'text-green-600' : 'text-red-500'}>{q.options[answers[idx]]}</span></p>
                                                            {!isCorrect && <p className="text-sm font-medium text-green-600 mb-3">Correct Answer: {q.options[q.correctIndex]}</p>}
                                                            <div className="mt-4 p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                                                                <p className="text-sm italic"><span className="font-bold">Explanation:</span> {q.explanation}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-8">
                                                <Button onClick={() => { setScore(null); setAssessmentData(null); setResumeMode(null); setResumeFeedback(null); setAnswers({}); }} variant="secondary">Back to Resume Menu</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'projects' ? (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Your Projects</h2>
                                        <Button
                                            onClick={() => setIsProjectModalOpen(true)}
                                            startIcon={<Plus className="w-4 h-4" />}
                                            size="sm"
                                            variant="secondary"
                                            className="bg-white dark:bg-white/10 shadow-sm"
                                        >
                                            New Project
                                        </Button>
                                    </div>
                                    {projects.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {projects.map((project) => (
                                                <div
                                                    key={project._id}
                                                    onClick={() => navigate(`/project/${project._id}`)}
                                                    className="bg-white/80 dark:bg-[#15161d]/80 backdrop-blur-md p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 group cursor-pointer hover:-translate-y-1"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="p-3.5 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-600 dark:text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                            <Folder className="w-6 h-6" />
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {new Date(project.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{project.name}</h3>
                                                    <div className="flex items-center justify-between mt-auto pt-2">
                                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-500">Collection</p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteProject(project._id);
                                                            }}
                                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete Project"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-full mb-6">
                                                <Folder className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No projects yet</h3>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-sm">Create a project to organize your saved resources.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-32">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                                        </div>
                                    ) : filteredContents.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                            {filteredContents.map((content) =>
                                                <Card
                                                    key={content._id}
                                                    content={content} // Pass the whole object if possible, but keep existing props fallback
                                                    title={content.title}
                                                    type={content.type}
                                                    link={content.link}
                                                    tags={content.tags}
                                                    thumbnail={content.thumbnail}
                                                    contentId={content._id}
                                                    onShare={(data) => {
                                                        setShareData(data);
                                                        setShareModalOpen(true);
                                                    }}
                                                    onDelete={() => {
                                                        const ownerId = content.userId?._id || content.userId;
                                                        if (String(ownerId) === String(currentUserId)) {
                                                            // Optimistic Delete
                                                            setContents(prev => prev.filter(c => String(c._id) !== String(content._id)));

                                                            (async () => {
                                                                try {
                                                                    await api.delete(`/remove-content/${content._id}`);
                                                                    fetchContents(true);
                                                                } catch (e) {
                                                                    console.error(e);
                                                                    alert("Failed to delete content");
                                                                    fetchContents(true);
                                                                }
                                                            })();
                                                        }
                                                    }}
                                                    onEdit={() => {
                                                        const ownerId = content.userId?._id || content.userId;
                                                        if (String(ownerId) === String(currentUserId)) {
                                                            setEditingContent(content);
                                                            setIsModalOpen(true);
                                                        }
                                                    }}
                                                    onPreview={() => setPreviewData({
                                                        open: true,
                                                        link: content.link,
                                                        title: content.title,
                                                        type: content.type
                                                    })}
                                                    platform={content.platform}
                                                    isFavorite={content.isFavorite} // NEW ADDITION
                                                    onFavoriteToggle={async () => {
                                                        try {
                                                            const res = await api.put(`/toggle-favorite/${content._id}`);
                                                            if (res.status === 200) {
                                                                setContents(prev => prev.map(c => c._id === content._id ? { ...c, isFavorite: !c.isFavorite } : c));
                                                            }
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="bg-white dark:bg-black/20 ring-1 ring-gray-100 dark:ring-white/5 shadow-xl p-8 rounded-[2rem] mb-6">
                                                <Brain className="w-20 h-20 text-indigo-200 dark:text-indigo-900/50" />
                                            </div>
                                            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">No content found</h3>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">It looks empty here. Let's add some knowledge to your second brain!</p>
                                            <Button
                                                onClick={() => setIsModalOpen(true)}
                                                startIcon={<Plus className="w-5 h-5" />}
                                                variant="secondary"
                                                className="bg-white dark:bg-white/10"
                                            >
                                                Add your first link
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )
                        ) : (
                            <div className="w-full flex-1 min-h-[70vh] flex flex-col">
                                <WebSearch
                                    query={searchQuery}
                                    type={searchSource}
                                    onAddContent={(link) => {
                                        setModalInitialLink(link);
                                        setIsModalOpen(true);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </main>

                {/* Floating Action Button for Ask AI */}
                {
                    !isChatOpen && (
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="fixed bottom-6 right-6 z-[90] p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 transition-all flex items-center justify-center group border ring-4 ring-white/50 dark:ring-white/10"
                        >
                            <Sparkles className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        </button>
                    )
                }

                {/* Modals & Overlays */}
                <CreateProjectModal
                    open={isProjectModalOpen}
                    onClose={() => setIsProjectModalOpen(false)}
                    onProjectAdded={fetchUserProjects}
                />

                <CreateContentModal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setModalInitialLink('');
                        setEditingContent(null);
                    }}
                    onContentAdded={(newContent) => {
                        if (newContent) {
                            setContents(prev => {
                                const prevArray = Array.isArray(prev) ? prev : [];
                                if (prevArray.some(c => c._id === newContent._id)) {
                                    return prevArray.map(c => c._id === newContent._id ? newContent : c);
                                }
                                return [newContent, ...prevArray];
                            });
                        } else {
                            fetchContents();
                        }
                    }}
                    initialLink={modalInitialLink}
                    isEditing={!!editingContent}
                    initialData={editingContent}
                    projectId={projectId}
                />

                <ContentPreviewModal
                    isOpen={previewData.open}
                    onClose={() => setPreviewData({ ...previewData, open: false })}
                    link={previewData.link}
                    title={previewData.title}
                    type={previewData.type}
                />

                <ShareModal
                    isOpen={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                    title={shareData?.title}
                    link={shareData?.link}
                    contentId={shareData?.contentId}
                />

                <BrainChat
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                />

                <ChangePasswordModal
                    open={isChangePasswordModalOpen}
                    onClose={() => setIsChangePasswordModalOpen(false)}
                />
            </div >
        </div >
    );
}

export default Dashboard;
