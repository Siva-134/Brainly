import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Loader2, Save } from 'lucide-react';
import { Button } from './Button';
import api from '../api';

// Local Input component just for modal/dark theme if needed, or reuse but pass className
// I will just use standard input styles here to match dark mode cleanly
const DarkInput = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300 ml-1">{label}</label>
        <input
            className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            {...props}
        />
    </div>
);

export const CreateContentModal = ({ open, onClose, onContentAdded, initialLink, isEditing, initialData, projectId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        link: '',
        type: 'video', // default
        platform: '',
        tags: '',
        description: ''
    });

    useEffect(() => {
        if (open) {
            if (isEditing && initialData) {
                // Formatting tags from array of objects/strings to comma-separated string
                const formattedTags = initialData.tags
                    ? initialData.tags.map(t => typeof t === 'object' ? t.title : t).join(', ')
                    : '';

                setFormData({
                    title: initialData.title || '',
                    link: initialData.link || '',
                    type: initialData.type || 'video',
                    platform: initialData.platform || '',
                    tags: formattedTags,
                    description: initialData.description || ''
                });
            } else if (initialLink) {
                const isGithub = initialLink.includes('github.com');
                setFormData(prev => ({
                    ...prev,
                    link: initialLink,
                    type: isGithub ? 'git_repo' : ((initialLink.includes('youtube') || initialLink.includes('youtu.be')) ? 'video' : 'article'),
                    platform: isGithub ? 'GitHub' : ''
                }));
            } else {
                setFormData({
                    title: '',
                    link: '',
                    type: 'video',
                    platform: '',
                    tags: '',
                    description: ''
                });
            }
        }
    }, [open, initialLink, isEditing, initialData]);


    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Process tags from comma separated string
            const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

            const payload = {
                title: formData.title,
                link: formData.link,
                type: formData.type,
                platform: formData.platform,
                tags: tagsArray,
                description: formData.description,
                projectId // Include projectId if available
            };

            let response;
            if (isEditing && initialData?._id) {
                response = await api.put(`/update-content/${initialData._id}`, payload);
            } else {
                response = await api.post('/add-content', payload);
            }

            if (response.status === 201 || response.status === 200) {
                // Pass the created/updated content back to parent
                onContentAdded(response.data.data);
                onClose();
                // Reset form
                setFormData({
                    title: '',
                    link: '',
                    type: 'video',
                    platform: '',
                    tags: '',
                    description: ''
                });
            }
        } catch (error) {
            console.error("Error adding/updating content:", error);
            if (error.response && error.response.status === 401) {
                alert("Session expired. Please login again.");
                navigate('/');
            } else {
                alert(`Failed to ${isEditing ? 'update' : 'add'} content. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
                    <h2 className="text-xl font-semibold text-gray-100">{isEditing ? 'Edit Content' : 'Add New Content'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <DarkInput
                        label="Title"
                        placeholder="e.g. How to Build a Second Brain"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <DarkInput
                        label="Link"
                        placeholder="https://..."
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-300 ml-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                            >
                                <option value="video">Video</option>
                                <option value="article">Article</option>
                                <option value="audio">Audio</option>
                                <option value="image">Image</option>
                                <option value="git_repo">Git Repo</option>
                            </select>
                        </div>

                        <DarkInput
                            label="Platform (Optional)"
                            placeholder="e.g. YouTube, Medium"
                            value={formData.platform}
                            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        />
                    </div>

                    <DarkInput
                        label="Tags"
                        placeholder="tech, productivity (comma sorted)"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-300 ml-1">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                            placeholder="Add some notes about this content..."
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={loading}
                            startIcon={isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                            {isEditing ? 'Save Changes' : 'Add Content'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
