import { X, ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';

export const ContentPreviewModal = ({ isOpen, onClose, link, title, type }) => {
    const [isLoading, setIsLoading] = useState(true);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full h-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-md" title={title}>
                            {title || 'Preview'}
                        </h3>
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-md transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Open in New Tab
                        </a>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50 dark:bg-black relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50 dark:bg-black/50">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    )}
                    <iframe
                        src={link}
                        title={title}
                        className="w-full h-full border-0"
                        onLoad={() => setIsLoading(false)}
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};
