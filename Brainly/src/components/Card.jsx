import { useState, useEffect } from 'react';
import { Share2, Trash2, Youtube, Twitter, FileText, Video, Mic, Image as ImageIcon, ExternalLink, Play, X, Check, Github, Pencil, Star } from "lucide-react";
import { motion } from 'framer-motion';

// Card component for displaying content
export const Card = ({ title, type, link, tags, onDelete, thumbnail, contentId, onShare, onEdit, onPreview, platform, isFavorite, onFavoriteToggle }) => {
    const [imageError, setImageError] = useState(false);
    const [showEmbed, setShowEmbed] = useState(false);

    const getYouTubeThumbnail = (url, quality = 'maxresdefault') => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11)
            ? `https://img.youtube.com/vi/${match[2]}/${quality}.jpg`
            : null;
    };

    const getGoogleFavicon = (url) => {
        if (!url) return null;
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be') || u.hostname.includes('bing.com')) return null;
            return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=128`;
        } catch (e) {
            return null;
        }
    };

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Initialize thumbnail states
    const [currentThumbnail, setCurrentThumbnail] = useState(thumbnail || getYouTubeThumbnail(link, 'maxresdefault'));
    const [isFavicon, setIsFavicon] = useState(false);

    // Update thumbnail if link changes from parent
    useEffect(() => {
        setImageError(false);
        setIsFavicon(false);
        setCurrentThumbnail(thumbnail || getYouTubeThumbnail(link, 'maxresdefault') || getGoogleFavicon(link));

        if (!thumbnail && !getYouTubeThumbnail(link)) {
            setIsFavicon(true);
        }
    }, [link, thumbnail]);

    const handleImageError = () => {
        if (currentThumbnail && currentThumbnail.includes('maxresdefault')) {
            // If HD Youtube fails, try HQ Youtube
            setCurrentThumbnail(getYouTubeThumbnail(link, 'hqdefault'));
        } else if (!isFavicon) {
            // If main thumbnail fails, fallback to Favicon
            setIsFavicon(true);
            const fav = getGoogleFavicon(link);
            if (fav) {
                setCurrentThumbnail(fav);
            } else {
                setImageError(true);
            }
        } else {
            // If Favicon also fails, show placeholder icon
            setImageError(true);
        }
    };

    const displayThumbnail = currentThumbnail;

    const getIcon = () => {
        if (type === "git_repo" || (link && link.includes("github.com")) || (platform && platform.toLowerCase() === 'github')) return <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />;
        if (type === "youtube" || (link && link.includes("youtube.com")) || (platform && platform.toLowerCase() === 'youtube')) return <Youtube className="w-5 h-5 text-red-500" />;
        if ((type === "twitter" || (link && (link.includes("twitter.com") || link.includes("x.com")))) || (platform && (platform.toLowerCase() === 'twitter' || platform.toLowerCase() === 'x'))) return <Twitter className="w-5 h-5 text-blue-400" />;

        switch (type) {
            case "video": return <Video className="w-5 h-5 text-indigo-400" />;
            case "audio": return <Mic className="w-5 h-5 text-emerald-400" />;
            case "image": return <ImageIcon className="w-5 h-5 text-pink-400" />;
            case "article":
            default: return <FileText className="w-5 h-5 text-gray-400" />;
        }
    };

    const getLabel = () => {
        if (platform) return platform;
        if (type === "git_repo" || (link && link.includes("github.com"))) return "GitHub";
        if (type === "youtube" || (link && link.includes("youtube.com"))) return "YouTube";
        if ((type === "twitter" || (link && (link.includes("twitter.com") || link.includes("x.com")))) && !link.includes("youtube")) return "Twitter";

        return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Content";
    };

    const isYouTube = link && (link.includes("youtube.com") || link.includes("youtu.be"));
    const youTubeId = isYouTube ? getYouTubeId(link) : null;

    const handlePlay = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isYouTube && youTubeId) {
            setShowEmbed(true);
        } else if (onPreview) {
            onPreview(); // Open in external Modal
        } else {
            window.open(link, '_blank');
        }
    };

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onShare) {
            onShare({ title, link, contentId });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-[#1a1b2e] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md flex flex-col h-full relative group"
        >

            {/* Thumbnail / Embed Area */}
            <div className="h-36 bg-gray-900 flex items-center justify-center relative overflow-hidden">
                {showEmbed ? (
                    <div className="w-full h-full bg-black relative animate-in fade-in zoom-in-95 duration-300">
                        <div className="absolute top-2 right-2 z-30 flex items-center gap-2">
                            {!isYouTube && (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-medium rounded-full backdrop-blur-md flex items-center gap-1.5 transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Open Site</span>
                                </a>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowEmbed(false);
                                }}
                                className="p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-md"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {isYouTube && youTubeId ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1`}
                                title={title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0"
                            ></iframe>
                        ) : (
                            <iframe
                                src={link}
                                title={title}
                                className="w-full h-full bg-white"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            />
                        )}
                    </div>
                ) : (
                    <>
                        {/* Main Icon Centered if no thumbnail, or actual thumbnail */}
                        {!imageError && displayThumbnail ? (
                            <div className="w-full h-full relative group/image cursor-pointer transform-gpu" onClick={handlePlay}>
                                <img
                                    src={displayThumbnail}
                                    alt={title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105 bg-gray-900 border-none"
                                    onError={handleImageError}
                                    referrerPolicy="no-referrer"
                                />
                                {isYouTube && (
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg ring-1 ring-white/50">
                                            <Play className="w-6 h-6 text-gray-900 ml-1 fill-gray-900" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-[#111218] cursor-pointer group/icon" onClick={handlePlay}>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 relative z-10 transition-transform group-hover/icon:scale-110">
                                    {getIcon()}
                                </div>
                            </div>
                        )}

                        {/* Top Right Type Badge */}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 z-10 border border-white/10 shadow-lg">
                            {getIcon()}
                            <span className="text-white text-xs font-bold tracking-wide">{getLabel()}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Content Body */}
            <div className="p-3 flex-1 flex flex-col bg-white dark:bg-[#0f1016]">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[16px] leading-snug line-clamp-2" title={title}>
                        <a href={link} onClick={handlePlay} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                            {title}
                        </a>
                    </h3>
                </div>

                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2.5 py-1 rounded-full bg-[#1e293b] text-blue-400 text-[11px] font-bold tracking-wide border border-blue-500/20 shadow-sm"
                            >
                                #{tag.title || tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Spacer to push actions to bottom */}
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/50">
                    <button
                        onClick={handlePlay}
                        className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors group/link"
                    >
                        <ExternalLink className="w-3.5 h-3.5 group-hover/link:scale-110 transition-transform" />
                        Open Link
                    </button>

                    <div className="flex items-center gap-1">
                        {onFavoriteToggle && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onFavoriteToggle();
                                }}
                                className={`p-2 rounded-lg transition-colors ${isFavorite ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10' : 'text-gray-400 dark:text-gray-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 hover:text-yellow-500'} `}
                                title={isFavorite ? "Unfavorite" : "Favorite"}
                            >
                                <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            className={`p-2 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300`}
                            title="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
