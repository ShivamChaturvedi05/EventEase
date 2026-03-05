import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; // Our custom Axios setup!

const Register = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const selectedRole = location.state?.role || 'attendee';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

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

            const response = await axiosInstance.post('/users/register', {
                ...formData,
                role: selectedRole
            });

            console.log("Registration Success:", response.data);

            navigate('/login');
        } catch (err) {

            setError(err.response?.data?.message || 'Something went wrong during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-blue-500">
                
                {/* Dynamic Title based on their role! */}
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
                    Join as {selectedRole === 'organizer' ? 'an Organizer' : 'an Attendee'}
                </h2>
                <p className="text-gray-500 text-center mb-6">Create your EventEase account</p>

                {/* Show error message if the backend rejects the request */}
                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center text-sm font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">Full Name</label>
                        <input 
                            type="text" name="name" required value={formData.name} onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">Email</label>
                        <input 
                            type="email" name="email" required value={formData.email} onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">Password</label>
                        <input 
                            type="password" name="password" required value={formData.password} onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">Phone Number</label>
                        <input 
                            type="text" name="phone" required value={formData.phone} onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="+91 9876543210"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                        {loading ? 'Registering...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600 text-sm">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:underline">
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;