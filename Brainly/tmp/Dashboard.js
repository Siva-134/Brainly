import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { Plus, Brain, Search, Menu, Sparkles, Sun, Moon, Globe, Youtube, Github, Folder, Trash2, User, Lock, Grid, Users, Video, FileText, Mic, Image as ImageIcon, LogOut, ArrowLeft } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Card } from "../components/Card";
import { CreateContentModal } from "../components/CreateContentModal";
import { CreateProjectModal } from "../components/CreateProjectModal";
import { BrainChat } from "../components/BrainChat";
import { Button } from "../components/Button";
import { ShareModal } from "../components/ShareModal";
import { WebSearch } from "../components/WebSearch";
import { ChangePasswordModal } from "../components/ChangePasswordModal";
import { ContentPreviewModal } from "../components/ContentPreviewModal";
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
  const [searchSource, setSearchSource] = useState("brain");
  const [modalInitialLink, setModalInitialLink] = useState("");
  const [editingContent, setEditingContent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [showProfile, setShowProfile] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ open: false, link: "", title: "", type: "" });
  const { theme, toggleTheme } = useTheme();
  const [assessmentData, setAssessmentData] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentMode, setAssessmentMode] = useState(null);
  const [assessmentTopic, setAssessmentTopic] = useState("");
  const [assessmentProject, setAssessmentProject] = useState("");
  const [assessmentCount, setAssessmentCount] = useState(5);
  const [assessmentDifficulty, setAssessmentDifficulty] = useState("medium");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(null);
  const [answers, setAnswers] = useState({});
  const fetchUserProjects = async () => {
    try {
      const response = await api.get("/my-projects");
      if (response.data && response.data.data) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  useEffect(() => {
    if (activeTab === "projects") {
      fetchUserProjects();
    }
  }, [activeTab]);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/me");
        if (res.data) setUserData(res.data);
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    };
    fetchUserData();
  }, []);
  const handleLogout = async () => {
    try {
      await api.post("/logout");
      localStorage.removeItem("token");
      navigate("/auth");
    } catch (error) {
      navigate("/auth");
    }
  };
  const handleDeleteProject = async (projectId2) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/delete-project/${projectId2}`);
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
      const response = await api.get("/my-contents", { params });
      if (response.data && Array.isArray(response.data.data)) {
        setContents(response.data.data);
        if (response.data.currentUserId) {
          setCurrentUserId(response.data.currentUserId);
        }
      }
    } catch (error) {
      console.error("Error fetching contents:", error);
      if (error.response && error.response.status === 401) {
        navigate("/");
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
  const filteredContents = contents.filter((content) => {
    let tabMatch = true;
    if (activeTab !== "all") {
      if (["video", "audio", "article", "image"].includes(activeTab)) {
        tabMatch = content.type === activeTab;
      } else if (activeTab === "youtube") {
        tabMatch = content.link && (content.link.includes("youtube.com") || content.link.includes("youtu.be")) || content.platform && content.platform.toLowerCase() === "youtube";
      } else if (activeTab === "twitter") {
        tabMatch = content.link && (content.link.includes("twitter.com") || content.link.includes("x.com"));
      } else if (activeTab === "facebook") {
        tabMatch = content.link && content.link.includes("facebook.com");
      } else if (activeTab === "github") {
        tabMatch = content.type === "git_repo" || content.link && content.link.includes("github.com");
      } else if (activeTab === "favorites") {
        tabMatch = content.isFavorite === true;
      } else if (activeTab === "shared") {
        const isSharedWithMe = (content.userId?._id || content.userId) !== currentUserId;
        const isSharedByMe = (content.userId?._id || content.userId) === currentUserId && content.sharedWith && content.sharedWith.length > 0;
        tabMatch = isSharedWithMe || isSharedByMe;
      }
    }
    let searchMatch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      searchMatch = content.title.toLowerCase().includes(query) || content.tags && content.tags.some((tag) => tag.title && tag.title.toLowerCase().includes(query));
    }
    return tabMatch && searchMatch;
  });
  const categoryTabs = [
    { id: "all", label: "All", icon: /* @__PURE__ */ jsx(Grid, { className: "w-4 h-4" }) },
    { id: "projects", label: "Projects", icon: /* @__PURE__ */ jsx(Folder, { className: "w-4 h-4" }) },
    { id: "shared", label: "Shared", icon: /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-purple-500" }) },
    { id: "video", label: "Videos", icon: /* @__PURE__ */ jsx(Video, { className: "w-4 h-4" }) },
    { id: "article", label: "Articles", icon: /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }) },
    { id: "image", label: "Images", icon: /* @__PURE__ */ jsx(ImageIcon, { className: "w-4 h-4" }) },
    { id: "audio", label: "Audio", icon: /* @__PURE__ */ jsx(Mic, { className: "w-4 h-4" }) },
    { id: "youtube", label: "YouTube", icon: /* @__PURE__ */ jsx(Youtube, { className: "w-4 h-4 text-red-500" }) },
    { id: "github", label: "GitHub", icon: /* @__PURE__ */ jsx(Github, { className: "w-4 h-4 text-gray-500 dark:text-gray-300" }) }
  ];
  const generateAssessment = async () => {
    if (assessmentMode === "topic" && !assessmentTopic.trim()) {
      alert("Please enter a topic.");
      return;
    }
    if (assessmentMode === "project" && !assessmentProject) {
      alert("Please select a project.");
      return;
    }
    setAssessmentLoading(true);
    setAssessmentData(null);
    setScore(null);
    setAnswers({});
    setCurrentQuestionIdx(0);
    try {
      const res = await api.post("/generate-assessment", {
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
    setAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optIndex }));
  };
  const nextQuestion = () => {
    if (currentQuestionIdx < assessmentData.length - 1) {
      setCurrentQuestionIdx((curr) => curr + 1);
    } else {
      let total = 0;
      assessmentData.forEach((q, idx) => {
        if (answers[idx] === q.correctIndex) total += 1;
      });
      setScore(total);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen relative font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-[-1] w-full h-full pointer-events-none transition-all duration-300\r\n                    bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-purple-50 \r\n                    dark:from-[#0b0c10] dark:via-[#111218] dark:to-[#1a1b2e]"
      }
    ),
    !isProjectView && /* @__PURE__ */ jsxs("aside", { className: "w-64 hidden md:flex flex-col flex-shrink-0 border-r border-gray-200/50 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl h-screen sticky top-0 py-8 px-4 gap-2 z-[50]", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 px-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-indigo-500" }),
        /* @__PURE__ */ jsx("h2", { className: "font-bold text-lg tracking-tight", children: "New Features" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("favorites"),
          className: `flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${activeTab === "favorites" ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 shadow-sm ring-1 ring-yellow-500/50" : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"}`,
          children: [
            /* @__PURE__ */ jsx(Grid, { className: "w-5 h-5" }),
            " Favorites"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("assessments"),
          className: `flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${activeTab === "assessments" ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm ring-1 ring-purple-500/50" : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"}`,
          children: [
            /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5" }),
            " Mock Assessment"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("analytics"),
          className: `flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${activeTab === "analytics" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/50" : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"}`,
          children: [
            /* @__PURE__ */ jsx(Grid, { className: "w-5 h-5" }),
            " Analytics"
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mt-auto px-2 opacity-50 text-xs text-gray-500 font-medium", children: "Access your recent tools here" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxs(
        "header",
        {
          className: "sticky top-0 w-full flex items-center justify-between px-6 py-4 border-b border-gray-200/50 dark:border-white/5 z-[60] transition-all duration-300 bg-white/70 dark:bg-[#0b0c10]/70 backdrop-blur-2xl",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowProfile(!showProfile),
                    className: "bg-gray-100 dark:bg-white/10 p-2 rounded-xl text-gray-700 dark:text-white backdrop-blur-md hover:bg-gray-200 dark:hover:bg-white/20 transition-colors shadow-sm ring-1 ring-gray-200/50 dark:ring-white/10",
                    children: /* @__PURE__ */ jsx(User, { className: "w-6 h-6" })
                  }
                ),
                showProfile && /* @__PURE__ */ jsxs("div", { className: "absolute top-14 left-0 w-64 bg-white dark:bg-[#15161d] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-4 animate-in fade-in zoom-in-95 duration-200 z-[99999]", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "bg-indigo-100 dark:bg-indigo-500/20 p-2.5 rounded-full text-indigo-600 dark:text-indigo-400", children: /* @__PURE__ */ jsx(User, { className: "w-5 h-5" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "overflow-hidden", children: [
                      /* @__PURE__ */ jsx("p", { className: "font-bold text-gray-900 dark:text-gray-100 truncate", children: userData.name || "User" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: userData.email || "No email" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-3 border-t border-gray-100 dark:border-white/10 flex flex-col gap-1", children: [
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => {
                          setIsChangePasswordModalOpen(true);
                          setShowProfile(false);
                        },
                        className: "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors",
                        children: [
                          /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4" }),
                          "Change Password"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: handleLogout,
                        className: "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors",
                        children: [
                          /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
                          "Log Out"
                        ]
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 p-2 rounded-xl text-white backdrop-blur-md shadow-lg shadow-indigo-500/20", children: /* @__PURE__ */ jsx(Brain, { className: "w-6 h-6" }) }),
                /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400", children: "SecondBrain" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 relative", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative w-full group", children: [
                /* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-white transition-colors" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    placeholder: searchSource === "brain" ? "Search your knowledge..." : `Search ${searchSource.charAt(0).toUpperCase() + searchSource.slice(1)}...`,
                    className: "w-full pl-11 pr-4 py-2.5 rounded-2xl border-none ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50/50 dark:bg-black/30 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-white/30 focus:bg-white dark:focus:bg-black/50 focus:outline-none transition-all shadow-inner dark:shadow-none font-medium",
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-2 bg-gray-100/50 dark:bg-black/20 p-1 rounded-xl backdrop-blur-md", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setSearchSource("brain"),
                    className: `px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all
                                ${searchSource === "brain" ? "bg-white dark:bg-white/20 text-indigo-600 dark:text-white shadow-sm ring-1 ring-gray-200/50 dark:ring-0" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5"}`,
                    children: [
                      /* @__PURE__ */ jsx(Brain, { className: "w-3.5 h-3.5" }),
                      "Brain"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setSearchSource("youtube"),
                    className: `px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all
                                ${searchSource === "youtube" ? "bg-white dark:bg-red-500/20 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-0" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5"}`,
                    children: [
                      /* @__PURE__ */ jsx(Youtube, { className: "w-3.5 h-3.5" }),
                      "YouTube"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setSearchSource("google"),
                    className: `px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all
                                ${searchSource === "google" ? "bg-white dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-0" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5"}`,
                    children: [
                      /* @__PURE__ */ jsx(Globe, { className: "w-3.5 h-3.5" }),
                      "Google"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setSearchSource("github"),
                    className: `px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all
                                ${searchSource === "github" ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/50 dark:ring-0" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5"}`,
                    children: [
                      /* @__PURE__ */ jsx(Github, { className: "w-3.5 h-3.5" }),
                      "Github"
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: toggleTheme,
                  className: "p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors bg-white/50 dark:bg-black/20 ring-1 ring-gray-200 dark:ring-white/10",
                  children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Moon, { className: "w-5 h-5" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: () => setIsModalOpen(true),
                  startIcon: /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5" }),
                  size: "md",
                  className: "bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 px-5 font-semibold hidden sm:flex",
                  children: "Add Content"
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col", children: [
        searchSource === "brain" && !isProjectView && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide no-scrollbar -mx-2 px-2", children: categoryTabs.map((tab) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveTab(tab.id),
            className: `flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border
                                    ${activeTab === tab.id ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-black shadow-md" : "bg-white/50 border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 dark:bg-black/20 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"}`,
            children: [
              tab.icon,
              tab.label
            ]
          },
          tab.id
        )) }),
        isProjectView && /* @__PURE__ */ jsx("div", { className: "mb-8 flex items-center", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              navigate("/dashboard");
              setActiveTab("projects");
            },
            className: "flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all font-medium",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }),
              "Back to Projects"
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-6 w-full flex-1 mb-20", children: searchSource === "brain" ? activeTab === "analytics" ? /* @__PURE__ */ jsxs("div", { className: "w-full animation-fade-in fade-in zoom-in-95 mt-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6", children: "Knowledge Analytics" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-[#15161d]/80 p-6 rounded-2xl shadow ring-1 ring-gray-100 dark:ring-white/5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 font-semibold mb-1", children: "Total Notes" }),
              /* @__PURE__ */ jsx("h3", { className: "text-4xl font-black text-indigo-600 dark:text-indigo-400", children: contents.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-[#15161d]/80 p-6 rounded-2xl shadow ring-1 ring-gray-100 dark:ring-white/5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 font-semibold mb-1", children: "Total Projects" }),
              /* @__PURE__ */ jsx("h3", { className: "text-4xl font-black text-blue-600 dark:text-blue-400", children: projects.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-[#15161d]/80 p-6 rounded-2xl shadow ring-1 ring-gray-100 dark:ring-white/5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 font-semibold mb-1", children: "Total Favorites" }),
              /* @__PURE__ */ jsx("h3", { className: "text-4xl font-black text-yellow-500", children: contents.filter((c) => c.isFavorite).length })
            ] })
          ] })
        ] }) : activeTab === "assessments" ? /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col items-center justify-center animation-fade-in fade-in mt-10", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold mb-4", children: "Mock Assessment" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-8 max-w-lg text-center", children: "Test your knowledge! Generate a quiz based on your saved content or specify a specific topic." }),
          !assessmentMode && !assessmentData && !assessmentLoading && /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => setAssessmentMode("content"),
                size: "lg",
                className: "px-6 shadow-xl bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex-1",
                children: [
                  /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 mr-2" }),
                  " Content Test"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => setAssessmentMode("topic"),
                size: "lg",
                className: "px-6 shadow-xl bg-purple-600 hover:bg-purple-500 text-white rounded-full flex-1",
                children: [
                  /* @__PURE__ */ jsx(Search, { className: "w-5 h-5 mr-2" }),
                  " Topic Test"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => {
                  setAssessmentMode("project");
                  if (projects.length === 0) fetchUserProjects();
                },
                size: "lg",
                className: "px-6 shadow-xl bg-blue-600 hover:bg-blue-500 text-white rounded-full flex-1",
                children: [
                  /* @__PURE__ */ jsx(Folder, { className: "w-5 h-5 mr-2" }),
                  " Project Test"
                ]
              }
            )
          ] }),
          assessmentMode === "content" && !assessmentData && !assessmentLoading && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 w-full max-w-md", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-500 text-center", children: "We'll scan your saved brain content to build a test." }),
            /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-500 mb-1.5 block", children: "Number of Questions" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "1",
                  max: "50",
                  value: assessmentCount,
                  onChange: (e) => setAssessmentCount(Number(e.target.value)),
                  className: "w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(Button, { onClick: generateAssessment, size: "lg", className: "px-8 shadow-xl bg-indigo-600 hover:bg-indigo-500 text-white rounded-full w-full", children: [
              /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 mr-2" }),
              " Start Quiz"
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => setAssessmentMode(null), className: "text-xs text-gray-400 hover:underline", children: "Cancel" })
          ] }),
          assessmentMode === "topic" && !assessmentData && !assessmentLoading && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 w-full max-w-md", children: [
            /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-500 mb-1.5 block", children: "Topic" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Enter a specific topic (e.g. AWS S3, React Hooks)",
                  value: assessmentTopic,
                  onChange: (e) => setAssessmentTopic(e.target.value),
                  className: "w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-500 mb-1.5 block", children: "Number of Questions" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "1",
                  max: "50",
                  value: assessmentCount,
                  onChange: (e) => setAssessmentCount(Number(e.target.value)),
                  className: "w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-500 mb-1.5 block", children: "Difficulty" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: assessmentDifficulty,
                  onChange: (e) => setAssessmentDifficulty(e.target.value),
                  className: "w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white outline-none cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "easy", children: "Easy" }),
                    /* @__PURE__ */ jsx("option", { value: "medium", children: "Medium" }),
                    /* @__PURE__ */ jsx("option", { value: "hard", children: "Hard" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(Button, { onClick: generateAssessment, size: "lg", className: "px-8 shadow-xl bg-purple-600 hover:bg-purple-500 text-white rounded-full w-full", children: [
              /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 mr-2" }),
              " Start Quiz"
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => {
              setAssessmentMode(null);
              setAssessmentTopic("");
              setAssessmentDifficulty("medium");
            }, className: "text-xs text-gray-400 hover:underline", children: "Cancel" })
          ] }),
          assessmentMode === "project" && !assessmentData && !assessmentLoading && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 w-full max-w-md", children: [
            /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-500 mb-1.5 block", children: "Select Project" }),
              projects.length > 0 ? /* @__PURE__ */ jsxs(
                "select",
                {
                  value: assessmentProject,
                  onChange: (e) => setAssessmentProject(e.target.value),
                  className: "w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white outline-none cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Select a Project" }),
                    projects.map((proj) => /* @__PURE__ */ jsx("option", { value: proj._id, children: proj.name }, proj._id))
                  ]
                }
              ) : /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-500", children: "You don't have any projects yet." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-500 mb-1.5 block", children: "Number of Questions" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "1",
                  max: "50",
                  value: assessmentCount,
                  onChange: (e) => setAssessmentCount(Number(e.target.value)),
                  className: "w-full px-4 py-3 rounded-xl border ring-1 ring-gray-200 dark:ring-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: generateAssessment,
                size: "lg",
                disabled: projects.length === 0,
                className: "px-8 shadow-xl bg-blue-600 hover:bg-blue-500 text-white rounded-full w-full",
                children: [
                  /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 mr-2" }),
                  " Start Quiz"
                ]
              }
            ),
            /* @__PURE__ */ jsx("button", { onClick: () => {
              setAssessmentMode(null);
              setAssessmentProject("");
            }, className: "text-xs text-gray-400 hover:underline", children: "Cancel" })
          ] }),
          assessmentLoading && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center mt-10", children: [
            /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" }),
            /* @__PURE__ */ jsx("span", { className: "ml-4 font-semibold text-purple-600", children: "Reading your brain and writing questions..." })
          ] }),
          assessmentData && score === null && /* @__PURE__ */ jsxs("div", { className: "w-full max-w-2xl mt-6", children: [
            /* @__PURE__ */ jsx("div", { className: "flex justify-start mb-4", children: /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setAssessmentData(null);
                  setAnswers({});
                  setCurrentQuestionIdx(0);
                },
                className: "flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all font-medium",
                children: [
                  /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }),
                  " Quit Assessment"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#15161d] p-8 rounded-3xl shadow-xl ring-1 ring-gray-200 dark:ring-white/10", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-gray-500 uppercase", children: [
                "Question ",
                currentQuestionIdx + 1,
                " of ",
                assessmentData.length
              ] }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-2xl font-semibold mb-8", children: assessmentData[currentQuestionIdx].question }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: assessmentData[currentQuestionIdx].options.map((opt, i) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleAnswerSelect(i),
                  className: `w-full text-left p-4 rounded-xl transition-all duration-200 font-medium border-2
                                                        ${answers[currentQuestionIdx] === i ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300" : "border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-200"}`,
                  children: opt
                },
                i
              )) }),
              /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-end", children: /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: nextQuestion,
                  disabled: answers[currentQuestionIdx] === void 0,
                  className: "bg-gray-900 text-white dark:bg-white dark:text-black rounded-xl w-32",
                  children: currentQuestionIdx === assessmentData.length - 1 ? "Finish" : "Next"
                }
              ) })
            ] })
          ] }),
          score !== null && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center mt-6", children: [
            /* @__PURE__ */ jsx("div", { className: "w-32 h-32 rounded-full border-8 border-purple-500 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsxs("span", { className: "text-4xl font-black text-purple-600 dark:text-purple-400", children: [
              score,
              "/",
              assessmentData.length
            ] }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold mb-2", children: "Quiz Complete!" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 mb-8 max-w-md text-center", children: "Review your answers below to verify your knowledge." }),
            /* @__PURE__ */ jsx("div", { className: "w-full max-w-3xl flex flex-col gap-6", children: assessmentData.map((q, idx) => {
              const isCorrect = answers[idx] === q.correctIndex;
              return /* @__PURE__ */ jsxs("div", { className: `p-6 rounded-2xl border-l-4 shadow-sm ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-red-500 bg-red-50 dark:bg-red-500/10"}`, children: [
                /* @__PURE__ */ jsx("h4", { className: "font-semibold text-lg mb-2", children: q.question }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium mb-1", children: [
                  "Your Answer: ",
                  /* @__PURE__ */ jsx("span", { className: isCorrect ? "text-green-600" : "text-red-500", children: q.options[answers[idx]] })
                ] }),
                !isCorrect && /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-green-600 mb-3", children: [
                  "Correct Answer: ",
                  q.options[q.correctIndex]
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 bg-white/50 dark:bg-black/20 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm italic", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Explanation:" }),
                  " ",
                  q.explanation
                ] }) })
              ] }, idx);
            }) }),
            /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx(Button, { onClick: () => {
              setScore(null);
              setAssessmentData(null);
              setAssessmentMode(null);
              setAssessmentTopic("");
              setAssessmentProject("");
            }, variant: "secondary", children: "Take another quiz" }) })
          ] })
        ] }) : activeTab === "projects" ? /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold tracking-tight text-gray-900 dark:text-white", children: "Your Projects" }),
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => setIsProjectModalOpen(true),
                startIcon: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                size: "sm",
                variant: "secondary",
                className: "bg-white dark:bg-white/10 shadow-sm",
                children: "New Project"
              }
            )
          ] }),
          projects.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: projects.map((project) => /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: () => navigate(`/project/${project._id}`),
              className: "bg-white/80 dark:bg-[#15161d]/80 backdrop-blur-md p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 group cursor-pointer hover:-translate-y-1",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "p-3.5 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-600 dark:text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300", children: /* @__PURE__ */ jsx(Folder, { className: "w-6 h-6" }) }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400 font-medium", children: new Date(project.createdAt).toLocaleDateString() })
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1", children: project.name }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-auto pt-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-500 dark:text-gray-500", children: "Collection" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        handleDeleteProject(project._id);
                      },
                      className: "p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100",
                      title: "Delete Project",
                      children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ]
            },
            project._id
          )) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-gray-50 dark:bg-white/5 p-8 rounded-full mb-6", children: /* @__PURE__ */ jsx(Folder, { className: "w-16 h-16 text-gray-300 dark:text-gray-600" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-gray-900 dark:text-white mb-2", children: "No projects yet" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 max-w-sm", children: "Create a project to organize your saved resources." })
          ] })
        ] }) : /* @__PURE__ */ jsx(Fragment, { children: loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-32", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400" }) }) : filteredContents.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20", children: filteredContents.map(
          (content) => /* @__PURE__ */ jsx(
            Card,
            {
              content,
              title: content.title,
              type: content.type,
              link: content.link,
              tags: content.tags,
              thumbnail: content.thumbnail,
              contentId: content._id,
              onShare: (data) => {
                setShareData(data);
                setShareModalOpen(true);
              },
              onDelete: () => {
                const ownerId = content.userId?._id || content.userId;
                if (String(ownerId) === String(currentUserId)) {
                  setContents((prev) => prev.filter((c) => String(c._id) !== String(content._id)));
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
              },
              onEdit: () => {
                const ownerId = content.userId?._id || content.userId;
                if (String(ownerId) === String(currentUserId)) {
                  setEditingContent(content);
                  setIsModalOpen(true);
                }
              },
              onPreview: () => setPreviewData({
                open: true,
                link: content.link,
                title: content.title,
                type: content.type
              }),
              platform: content.platform,
              isFavorite: content.isFavorite,
              onFavoriteToggle: async () => {
                try {
                  const res = await api.put(`/toggle-favorite/${content._id}`);
                  if (res.status === 200) {
                    setContents((prev) => prev.map((c) => c._id === content._id ? { ...c, isFavorite: !c.isFavorite } : c));
                  }
                } catch (e) {
                  console.error(e);
                }
              }
            },
            content._id
          )
        ) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-black/20 ring-1 ring-gray-100 dark:ring-white/5 shadow-xl p-8 rounded-[2rem] mb-6", children: /* @__PURE__ */ jsx(Brain, { className: "w-20 h-20 text-indigo-200 dark:text-indigo-900/50" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2", children: "No content found" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 max-w-sm mb-6", children: "It looks empty here. Let's add some knowledge to your second brain!" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: () => setIsModalOpen(true),
              startIcon: /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5" }),
              variant: "secondary",
              className: "bg-white dark:bg-white/10",
              children: "Add your first link"
            }
          )
        ] }) }) : /* @__PURE__ */ jsx("div", { className: "w-full flex-1 min-h-[70vh] flex flex-col", children: /* @__PURE__ */ jsx(
          WebSearch,
          {
            query: searchQuery,
            type: searchSource,
            onAddContent: (link) => {
              setModalInitialLink(link);
              setIsModalOpen(true);
            }
          }
        ) }) })
      ] }),
      !isChatOpen && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsChatOpen(true),
          className: "fixed bottom-6 right-6 z-[90] p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 transition-all flex items-center justify-center group border ring-4 ring-white/50 dark:ring-white/10",
          children: /* @__PURE__ */ jsx(Sparkles, { className: "w-7 h-7 group-hover:scale-110 transition-transform" })
        }
      ),
      /* @__PURE__ */ jsx(
        CreateProjectModal,
        {
          open: isProjectModalOpen,
          onClose: () => setIsProjectModalOpen(false),
          onProjectAdded: fetchUserProjects
        }
      ),
      /* @__PURE__ */ jsx(
        CreateContentModal,
        {
          open: isModalOpen,
          onClose: () => {
            setIsModalOpen(false);
            setModalInitialLink("");
            setEditingContent(null);
          },
          onContentAdded: (newContent) => {
            if (newContent) {
              setContents((prev) => {
                const prevArray = Array.isArray(prev) ? prev : [];
                if (prevArray.some((c) => c._id === newContent._id)) {
                  return prevArray.map((c) => c._id === newContent._id ? newContent : c);
                }
                return [newContent, ...prevArray];
              });
            } else {
              fetchContents();
            }
          },
          initialLink: modalInitialLink,
          isEditing: !!editingContent,
          initialData: editingContent,
          projectId
        }
      ),
      /* @__PURE__ */ jsx(
        ContentPreviewModal,
        {
          isOpen: previewData.open,
          onClose: () => setPreviewData({ ...previewData, open: false }),
          link: previewData.link,
          title: previewData.title,
          type: previewData.type
        }
      ),
      /* @__PURE__ */ jsx(
        ShareModal,
        {
          isOpen: shareModalOpen,
          onClose: () => setShareModalOpen(false),
          title: shareData?.title,
          link: shareData?.link,
          contentId: shareData?.contentId
        }
      ),
      /* @__PURE__ */ jsx(
        BrainChat,
        {
          isOpen: isChatOpen,
          onClose: () => setIsChatOpen(false)
        }
      ),
      /* @__PURE__ */ jsx(
        ChangePasswordModal,
        {
          open: isChangePasswordModalOpen,
          onClose: () => setIsChangePasswordModalOpen(false)
        }
      )
    ] })
  ] });
}
export default Dashboard;
