import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import CreateEventForm from '../components/CreateEventForm';
import EventFeed from '../components/EventFeed';
import OrganizerAnalytics from '../components/OrganizerAnalytics';

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
                    
                    <div className="space-y-8"> {/* Added space-y-8 to space out the sections */}
                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 shadow-sm">
                            <h2 className="text-2xl font-bold text-purple-800 mb-2">Host a New Event</h2>
                            <CreateEventForm />
                        </div>

                        <OrganizerAnalytics />
                    </div>

                ) : (
                    
                    /* ATTENDEE VIEW */
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <h2 className="text-2xl font-bold text-blue-800 mb-2">Attendee Dashboard</h2>
                        <p className="text-blue-600">Discover and book tickets for the best upcoming events.</p>

                        <EventFeed />
                    </div>
                    
                )}

            </div>
        </div>
    );
};

export default Dashboard;