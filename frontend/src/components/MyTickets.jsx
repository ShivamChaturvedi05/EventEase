import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axiosInstance.get('/bookings/my-tickets');
                setTickets(response.data.data);
            } catch (err) {
                setError('Failed to load your tickets. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) return <div className="text-center text-blue-500 font-bold my-8 animate-pulse">Finding your tickets...</div>;
    if (error) return <div className="text-center text-red-500 font-bold my-8">{error}</div>;
    
    // If they haven't bought anything, we just return nothing (or a friendly prompt)
    if (tickets.length === 0) return (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 text-center text-blue-700 mt-8">
            <p>You haven't booked any tickets yet. Browse the events above to grab one!</p>
        </div>
    );

    return (
        <div className="mt-12 border-t pt-8 border-gray-200">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6">🎟️ My Wallet (Purchased Tickets)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tickets.map((ticket) => (
                    <div key={ticket.booking_id} className="flex flex-row bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        
                        {/* Ticket Stub Design (Left Side) */}
                        <div className="bg-blue-600 text-white p-4 flex flex-col justify-center items-center w-24 border-r-2 border-dashed border-gray-300">
                            <span className="text-xs uppercase font-bold tracking-widest opacity-80 mb-1">Admit</span>
                            <span className="text-3xl font-black">{ticket.ticket_quantity}</span>
                        </div>

                        {/* Ticket Details (Right Side) */}
                        <div className="p-5 flex-1">
                            <h4 className="text-lg font-bold text-gray-800 line-clamp-1">{ticket.event_title}</h4>
                            
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                                <p>📍 {ticket.venue}</p>
                                <p>📅 {new Date(ticket.event_date).toLocaleDateString('en-IN', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                                })}</p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs font-semibold text-gray-400">
                                    Booked: {new Date(ticket.booked_at).toLocaleDateString()}
                                </span>
                                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                    Paid: ₹{ticket.total_amount}
                                </span>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyTickets;