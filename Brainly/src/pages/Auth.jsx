import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeDBackground from '../components/ThreeDBackground';
import { Brain, ArrowRight } from 'lucide-react';
import authBg from '../assets/auth-bg.png';
import api from '../api';

function Auth() {
    const navigate = useNavigate();
    const [view, setView] = useState('login'); // 'login', 'signup', 'forgot-password', 'reset-password'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        otp: '',
        newPassword: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Update view when isLogin changes for backward compatibility or direct toggle
    const handleToggle = (newView) => {
        setView(newView);
        setFormData({ name: '', email: '', password: '', otp: '', newPassword: '' });
        setMessage('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            if (view === 'login') {
                const response = await api.post('/login', {
                    email: formData.email,
                    password: formData.password
                });
                postAuth(response);
            }
            else if (view === 'signup') {
                // Validation
                if (!formData.email.endsWith('@gmail.com')) throw new Error('Email must be a valid @gmail.com address');
                if (formData.password.length < 6) throw new Error('Password must be at least 6 characters long');
                if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) throw new Error('Password must include a special character');

                const response = await api.post('/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                postAuth(response);
            }
            else if (view === 'forgot-password') {
                const response = await api.post('/forgot-password', { email: formData.email });
                setMessage(response.data.message);
                if (response.status === 200) {
                    setView('reset-password');
                }
            }
            else if (view === 'reset-password') {
                // Validation
                if (formData.newPassword.length < 6) throw new Error('Password must be at least 6 characters long');

                const response = await api.post('/reset-password', {
                    email: formData.email,
                    otp: formData.otp,
                    newPassword: formData.newPassword
                });
                setMessage(response.data.message);
                if (response.status === 200) {
                    setTimeout(() => setView('login'), 2000);
                }
            }

        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const postAuth = (response) => {
        setMessage(response.data.message);
        if (response.status === 200 || response.status === 201) {
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative font-sans">
            <ThreeDBackground backgroundImage={authBg} />

            <div className="relative z-10 w-full max-w-md p-8 mx-4">
                <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 space-y-8 animate-in fade-in zoom-in-95 ring-1 ring-white/5 group">
                    <div className="text-center space-y-2">
                        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 mb-2 group-hover:scale-110 transition-transform duration-500">
                            <Brain className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                            {view === 'login' && 'Welcome back'}
                            {view === 'signup' && 'Create account'}
                            {view === 'forgot-password' && 'Reset Password'}
                            {view === 'reset-password' && 'Enter OTP'}
                        </h1>
                        <p className="text-gray-400">
                            {view === 'login' && 'Enter your details to access your brain.'}
                            {view === 'signup' && 'Start organizing your digital life today.'}
                            {view === 'forgot-password' && 'Enter your email to receive an OTP.'}
                            {view === 'reset-password' && 'Check your email for the OTP.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {view === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        {(view === 'login' || view === 'signup' || view === 'forgot-password' || view === 'reset-password') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    // Lock email in reset-password view so they don't change it
                                    disabled={view === 'reset-password'}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-sm disabled:opacity-50"
                                    placeholder="john@example.com"
                                />
                            </div>
                        )}

                        {(view === 'login' || view === 'signup') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        {view === 'reset-password' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">OTP</label>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
                                        placeholder="123456"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </>
                        )}

                        {message && (
                            <div className={`p-3 rounded-lg text-sm text-center ${message.toLowerCase().includes('success') || message.includes('Log') || message.includes('OTP') || message.toLowerCase().includes('updated')
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {view === 'login' && 'Sign In'}
                                    {view === 'signup' && 'Create Account'}
                                    {view === 'forgot-password' && 'Send OTP'}
                                    {view === 'reset-password' && 'Reset Password'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center space-y-2">
                        {view === 'login' && (
                            <>
                                <button
                                    onClick={() => handleToggle('forgot-password')}
                                    className="text-gray-400 hover:text-indigo-400 text-sm transition-colors"
                                >
                                    Forgot Password?
                                </button>
                                <p className="text-gray-400 text-sm">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => handleToggle('signup')}
                                        className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            </>
                        )}
                        {view === 'signup' && (
                            <>
                                <button
                                    onClick={() => handleToggle('forgot-password')}
                                    className="text-gray-400 hover:text-indigo-400 text-sm transition-colors"
                                >
                                    Forgot Password?
                                </button>
                                <p className="text-gray-400 text-sm">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => handleToggle('login')}
                                        className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
                                    >
                                        Log in
                                    </button>
                                </p>
                            </>
                        )}
                        {(view === 'forgot-password' || view === 'reset-password') && (
                            <button
                                onClick={() => handleToggle('login')}
                                className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors text-sm"
                            >
                                Back to Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;
