import { useState, useEffect } from 'react';
import { X, Search, Users, Copy, Check, Send } from 'lucide-react';
import api from '../api';

export const ShareModal = ({ isOpen, onClose, title, link, contentId }) => {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('social'); // 'social' | 'internal'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sharingMap, setSharingMap] = useState({}); // { userId: 'pending' | 'success' | 'error' }

    // Clear state on open
    useEffect(() => {
        if (isOpen) {
            setActiveTab('social');
            setSearchQuery('');
            setSearchResults([]);
            setSharingMap({});
        }
    }, [isOpen]);

    // Handle User Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            try {
                const response = await api.get(`/search?q=${searchQuery}`);
                setSearchResults(response.data.users || []);
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleInternalShare = async (targetUserId) => {
        setSharingMap(prev => ({ ...prev, [targetUserId]: 'pending' }));
        try {
            await api.post('/share-content', {
                contentId,
                targetUserId
            });

            setSharingMap(prev => ({ ...prev, [targetUserId]: 'success' }));
        } catch (error) {
            console.error("Share error", error);
            setSharingMap(prev => ({ ...prev, [targetUserId]: 'error' }));
        }
    };

    const socialLinks = [
        {
            name: 'WhatsApp',
            icon: (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            ),
            color: 'bg-[#25D366]',
            url: `https://wa.me/?text=${encodeURIComponent(title + " " + link)}`
        },
        {
            name: 'Telegram',
            icon: (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
            ),
            color: 'bg-[#0088cc]',
            url: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(title)}`
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-[#1a1b2e] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share Content</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 m-4 mb-2 bg-gray-100 dark:bg-gray-900 rounded-xl">
                    <button
                        onClick={() => setActiveTab('social')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'social'
                            ? 'bg-white dark:bg-[#1a1b2e] text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Social
                    </button>
                    <button
                        onClick={() => setActiveTab('internal')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'internal'
                            ? 'bg-white dark:bg-[#1a1b2e] text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Second Brain User
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 pt-2">
                    {activeTab === 'social' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {socialLinks.map((app) => (
                                    <button
                                        key={app.name}
                                        onClick={() => {
                                            const width = 600;
                                            const height = 600;
                                            const left = (window.innerWidth - width) / 2;
                                            const top = (window.innerHeight - height) / 2;
                                            window.open(app.url, 'share', `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no`);
                                        }}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl text-white font-medium transition-transform active:scale-95 hover:opacity-90 ${app.color}`}
                                    >
                                        {app.icon}
                                        {app.name}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200 dark:bg-gray-800"></div>
                                <span className="relative z-10 block w-fit mx-auto px-2 bg-white dark:bg-[#1a1b2e] text-xs text-gray-400">OR COPY LINK</span>
                            </div>

                            <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                <span className="flex-1 text-sm text-gray-500 truncate px-2">{link}</span>
                                <button
                                    onClick={handleCopy}
                                    className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 h-64 flex flex-col">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search user by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-white"
                                    autoFocus
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 relative">
                                {searching ? (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((user) => (
                                        <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                                    {user.name.slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleInternalShare(user._id)}
                                                disabled={sharingMap[user._id] === 'success'}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sharingMap[user._id] === 'success'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 cursor-default'
                                                    : sharingMap[user._id] === 'pending'
                                                        ? 'bg-gray-100 text-gray-500 cursor-wait'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    }`}
                                            >
                                                {sharingMap[user._id] === 'success' ? 'Shared' : sharingMap[user._id] === 'pending' ? '...' : 'Share'}
                                            </button>
                                        </div>
                                    ))
                                ) : searchQuery.length > 1 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                                        <Users className="w-8 h-8 mb-2 opacity-50" />
                                        <span>No users found</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                                        <span>Type to search users...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// End of component
