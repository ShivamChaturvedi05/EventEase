import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleRoleSelection = (selectedRole) => {
        navigate('/register', { state: { role: selectedRole } });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
            
            {/* Header Section */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-blue-600 mb-4">EventEase</h1>
                <p className="text-xl text-gray-600">How would you like to use the platform today?</p>
            </div>

            {/* Cards Container */}
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
                
                {/* Attendee Card */}
                <button 
                    onClick={() => handleRoleSelection('attendee')}
                    className="flex-1 bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left border-t-4 border-blue-500"
                >
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">🎟️ Attendee</h2>
                    <p className="text-gray-600">
                        I want to discover upcoming hackathons, tech meetups, and concerts. Let me browse and book tickets!
                    </p>
                </button>

                {/* Organizer Card */}
                <button 
                    onClick={() => handleRoleSelection('organizer')}
                    className="flex-1 bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left border-t-4 border-purple-500"
                >
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">🎤 Organizer</h2>
                    <p className="text-gray-600">
                        I want to host events, manage seating capacity, and track ticket sales for my audience.
                    </p>
                </button>

            </div>
            
            {/* Login Redirect */}
            <div className="mt-12 text-gray-600">
                Already have an account?{' '}
                <button 
                    onClick={() => navigate('/login')}
                    className="text-blue-600 font-bold hover:underline"
                >
                    Log In Here
                </button>
            </div>

        </div>
    );
};

export default Home;