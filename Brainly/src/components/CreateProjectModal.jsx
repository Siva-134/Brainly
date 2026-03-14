import { useState } from 'react';
import { X, Plus, Loader2, Save } from 'lucide-react';
import { Button } from './Button';
import api from '../api';

const DarkInput = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300 ml-1">{label}</label>
        <input
            className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            {...props}
        />
    </div>
);

export const CreateProjectModal = ({ open, onClose, onProjectAdded }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/add-project', { name });
            if (response.status === 201) {
                onProjectAdded();
                onClose();
                setName('');
            }
        } catch (error) {
            alert("Failed to create project");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
                    <h2 className="text-xl font-semibold text-gray-100">Create New Project</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <DarkInput
                        label="Project Name"
                        placeholder="e.g. My Awesome Project"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                    />

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
                            startIcon={<Plus className="w-4 h-4" />}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                            Create Project
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
