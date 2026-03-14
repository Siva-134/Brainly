import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, AlertCircle, Globe, Search, Github } from 'lucide-react';

export const WebSearch = ({ query, type, onAddContent }) => {
    const [loading, setLoading] = useState(true);
    const [iframeUrl, setIframeUrl] = useState('');

    useEffect(() => {
        if (type === 'youtube') {
            setLoading(true);
            // Invidious instances (yewtu.be, etc.) are being blocked or are down on your network.
            // Switching to Bing Video. It sources videos from YouTube but is hosted by Microsoft,
            // making it extremely reliable and embeddable (it won't "refuse to connect").
            const baseUrl = 'https://www.bing.com/videos';
            setIframeUrl(query ? `${baseUrl}/search?q=${encodeURIComponent(query)}` : `${baseUrl}/trending`);
        } else if (type === 'google' || type === 'github') {
            // Google strictly blocks iframes (X-Frame-Options: SAMEORIGIN).
            // It is impossible to embed "Real Google" without a proxy that breaks most features.
            // We use Bing here because it allows embedding and provides a very similar "Real Search Engine" interface.
            const baseUrl = 'https://www.bing.com';
            if (query) {
                setLoading(true);
                const searchQ = type === 'github' ? `site:github.com ${query}` : query;
                setIframeUrl(`${baseUrl}/search?q=${encodeURIComponent(searchQ)}`);
            } else {
                // Bing homepage is also often blocked or bad UX in iframe, so show placeholder
                setIframeUrl('');
                setLoading(false);
            }
        }
    }, [query, type]);

    const handleLoad = () => {
        setLoading(false);
    };

    // Removed early return to allow showing Homepage/Feed when query is empty

    const [quickLink, setQuickLink] = useState('');

    const handleQuickAdd = () => {
        if (onAddContent && quickLink) {
            onAddContent(quickLink);
            setQuickLink('');
        }
    };

    const getIcon = () => {
        if (type === 'google') return <Globe className="w-8 h-8 text-blue-500" />;
        if (type === 'github') return <Github className="w-8 h-8 text-gray-800 dark:text-gray-200" />;
        return <Search className="w-8 h-8 text-gray-400" />;
    };

    const getTitle = () => {
        if (type === 'google') return 'Search Google';
        if (type === 'github') return 'Search Github';
        return 'Start Searching';
    };

    const getDescription = () => {
        if (type === 'google') return "Enter your query in the search bar above to browse Google results.";
        if (type === 'github') return "Search for repositories, code, and issues across Github.";
        return "Enter a search term to begin.";
    };

    return (
        <div className="w-full h-full flex flex-col relative bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            {/* Quick Add Bar */}
            <div className="bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex gap-2 items-center">
                <input
                    type="text"
                    value={quickLink}
                    onChange={(e) => setQuickLink(e.target.value)}
                    placeholder="Paste video/page link here to add..."
                    className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    onClick={handleQuickAdd}
                    disabled={!quickLink}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Add to Brain
                </button>
            </div>

            {loading && iframeUrl && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm top-12">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            )}

            {iframeUrl ? (
                <iframe
                    src={iframeUrl}
                    title={`${type} search result`}
                    className="w-full flex-1 border-none"
                    onLoad={handleLoad}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-full mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        {getIcon()}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {getTitle()}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm">
                        {getDescription()}
                    </p>
                </div>
            )}
        </div>
    );
};
