import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import CreateEventForm from '../components/CreateEventForm';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/users/logout');

            localStorage.removeItem('user');

            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (!user) return null;

    // ... (keep your existing imports, useEffect, and handleLogout exactly the same)

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg border-t-4 border-indigo-500">
                
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8 border-b pb-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-800">
                            Welcome, {user.name}! 👋
                        </h1>
                        <p className="text-lg text-gray-500 mt-2">
                            Logged in as: <span className="font-bold text-indigo-600 uppercase bg-indigo-100 px-3 py-1 rounded-full text-sm ml-2">{user.role}</span>
                        </p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors shadow-md"
                    >
                        Log Out
                    </button>
                </div>

                {/* --- CONDITIONAL RENDERING --- */}
                {user.role === 'organizer' ? (
                    
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                        <h2 className="text-2xl font-bold text-purple-800 mb-2">Organizer Dashboard</h2>
                        <p className="text-purple-600">Fill out the details below to host a new event.</p>
                        <CreateEventForm />
                    </div>

                ) : (
                    
                    /* ATTENDEE VIEW */
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <h2 className="text-2xl font-bold text-blue-800 mb-4">Attendee Dashboard</h2>
                        <p className="text-blue-600">Here we will fetch and display all upcoming events so you can book tickets!</p>
                        
                    </div>
                    
                )}

            </div>
        </div>
    );
};

export default Dashboard;