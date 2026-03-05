import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Login = () => {
    const navigate = useNavigate();

    // Form and UI State
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axiosInstance.post('/users/login', formData);
            
            const userData = response.data.data.user;
            localStorage.setItem('user', JSON.stringify(userData));

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-green-500">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Welcome Back</h2>
                <p className="text-gray-500 text-center mb-6">Log in to EventEase</p>

                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center text-sm font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">Email</label>
                        <input 
                            type="email" name="email" required value={formData.email} onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">Password</label>
                        <input 
                            type="password" name="password" required value={formData.password} onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button onClick={() => navigate('/')} className="text-green-600 font-bold hover:underline">
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;