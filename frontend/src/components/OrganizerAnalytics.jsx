import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const OrganizerAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetch the secure analytics data
                const response = await axiosInstance.get('/events/analytics');
                setAnalytics(response.data.data);
            } catch (err) {
                setError('Failed to load analytics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="text-center text-purple-500 font-bold my-8 animate-pulse">Loading your sales data...</div>;
    if (error) return <div className="text-center text-red-500 font-bold my-8">{error}</div>;
    if (analytics.length === 0) return <div className="text-center text-gray-500 my-8">You haven't hosted any events yet. Publish one above!</div>;

    return (
        <div className="mt-8 space-y-8">
            <h3 className="text-2xl font-extrabold text-gray-800 border-b pb-2">Your Event Analytics</h3>
            
            {analytics.map((event) => (
                <div key={event.event_id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    
                    {/* Event Header & High-Level Stats */}
                    <div className="bg-purple-50 p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <h4 className="text-xl font-bold text-purple-900">{event.title}</h4>
                            <span className="text-sm font-semibold text-purple-700 bg-purple-200 px-3 py-1 rounded-full mt-2 md:mt-0">
                                ₹{event.price} per ticket
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 text-center">
                                <p className="text-sm text-gray-500 font-semibold mb-1">Total Revenue</p>
                                <p className="text-2xl font-black text-green-600">₹{event.total_revenue}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 text-center">
                                <p className="text-sm text-gray-500 font-semibold mb-1">Tickets Sold</p>
                                <p className="text-2xl font-black text-blue-600">{event.tickets_sold}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 text-center">
                                <p className="text-sm text-gray-500 font-semibold mb-1">Seats Left</p>
                                <p className="text-2xl font-black text-orange-500">{event.available_seats}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 text-center">
                                <p className="text-sm text-gray-500 font-semibold mb-1">Total Capacity</p>
                                <p className="text-2xl font-black text-gray-700">{event.total_seats}</p>
                            </div>
                        </div>
                    </div>

                    {/* Attendee Table */}
                    <div className="p-6">
                        <h5 className="text-lg font-bold text-gray-800 mb-4">Recent Bookings</h5>
                        
                        {event.recent_bookings.length === 0 ? (
                            <p className="text-gray-500 italic">No tickets sold yet. Keep promoting your event!</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                            <th className="p-3 font-semibold">Attendee Name</th>
                                            <th className="p-3 font-semibold">Email</th>
                                            <th className="p-3 font-semibold">Tickets</th>
                                            <th className="p-3 font-semibold">Booking Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-100">
                                        {event.recent_bookings.map((booking, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-3 font-medium text-gray-800">{booking.attendee_name}</td>
                                                <td className="p-3 text-gray-600">{booking.attendee_email}</td>
                                                <td className="p-3 text-center font-bold text-gray-700">
                                                    <span className="bg-gray-200 px-2 py-1 rounded-md">{booking.ticket_quantity}</span>
                                                </td>
                                                <td className="p-3 text-gray-500">
                                                    {new Date(booking.booked_at).toLocaleDateString('en-IN', {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            ))}
        </div>
    );
};

export default OrganizerAnalytics;