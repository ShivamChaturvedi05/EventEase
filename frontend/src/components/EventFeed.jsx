import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';

const EventFeed = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State to track which event is currently being booked so we can show a spinner on that specific button
    const [bookingId, setBookingId] = useState(null); 
    const [bookingMessage, setBookingMessage] = useState('');
    const hasBooked = useRef(false);

    // Fetch events as soon as the component loads
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Hitting the unprotected /all route you built earlier!
                const response = await axiosInstance.get('/events/all');
                setEvents(response.data.data);
            } catch (err) {
                setError('Failed to load events. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment_status');
        const returnedEventId = urlParams.get('event_id');

        if (paymentStatus === 'success' && returnedEventId && !hasBooked.current) {
            hasBooked.current = true;
            const finalizeBooking = async () => {
                try {
                    await axiosInstance.post('/bookings/book', {
                        event_id: returnedEventId,
                        ticket_quantity: 1
                    });
                    
                    window.history.replaceState(null, '', window.location.pathname);
                    
                    window.location.reload(); 
                    
                } catch (error) {
                    console.error("Failed to finalize booking:", error);
                    alert("Payment succeeded, but database update failed. Contact support.");
                }
            };
            
            finalizeBooking();
        }
    }, []);

    const handleBookTicket = async (eventId) => {
        setBookingId(eventId);
        setBookingMessage('');

        try {
            const response = await axiosInstance.post('/bookings/create-checkout-session', {
                event_id: eventId,
                ticket_quantity: 1
            });

            const checkoutUrl = response.data.data.checkoutUrl;

            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                throw new Error("No checkout URL received");
            }

        } catch (err) {
            console.error("Payment initiation failed:", err);
            alert(err.response?.data?.message || 'Could not connect to payment gateway.');
            setBookingId(null);
        }
    };

    if (loading) return <div className="text-center text-blue-500 font-bold my-8 animate-pulse">Loading events...</div>;
    if (error) return <div className="text-center text-red-500 font-bold my-8">{error}</div>;
    if (events.length === 0) return <div className="text-center text-gray-500 my-8">No upcoming events found. Check back later!</div>;

    return (
        <div className="mt-6">
            {/* Show a temporary success message at the top when a ticket is booked */}
            {bookingMessage && (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 text-center font-bold shadow-sm transition-all">
                    {bookingMessage}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                        
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                                    ₹{event.price}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                            
                            <div className="text-sm text-gray-500 mb-2">
                                📅 {new Date(event.event_date).toLocaleDateString('en-IN', {
                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                                })}
                            </div>
                            
                            <div className="text-sm text-gray-500 mb-4">
                                📍 {event.venue}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-sm font-bold ${event.available_seats > 10 ? 'text-green-600' : 'text-red-500'}`}>
                                    {event.available_seats} seats left
                                </span>
                            </div>

                            <button 
                                onClick={() => handleBookTicket(event.id)}
                                disabled={bookingId === event.id || event.available_seats === 0}
                                className={`w-full font-bold py-2 rounded-lg transition-colors ${
                                    event.available_seats === 0 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {bookingId === event.id ? 'Booking...' : event.available_seats === 0 ? 'Sold Out' : 'Book 1 Ticket'}
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventFeed;