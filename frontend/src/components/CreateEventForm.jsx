import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const CreateEventForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        venue: '',
        price: '',
        total_seats: ''
    });

    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });

        try {
            // We don't need to send organizer_id because our backend reads it from the HTTP-only cookie!
            const response = await axiosInstance.post('/events/create', formData);
            
            setStatus({ loading: false, error: '', success: 'Event published successfully! 🎉' });
            
            // Clear the form
            setFormData({ title: '', description: '', event_date: '', venue: '', price: '', total_seats: '' });
        } catch (err) {
            setStatus({ 
                loading: false, 
                error: err.response?.data?.message || 'Failed to create event', 
                success: '' 
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Publish a New Event</h3>

            {status.error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{status.error}</div>}
            {status.success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{status.success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Event Title</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        placeholder="e.g., Spring Hackathon 2026" />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Description</label>
                    <textarea name="description" required value={formData.description} onChange={handleChange} rows="3"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        placeholder="What is this event about?" />
                </div>

                {/* Date & Time */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Date & Time</label>
                    <input type="datetime-local" name="event_date" required value={formData.event_date} onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none" />
                </div>

                {/* Venue */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Venue</label>
                    <input type="text" name="venue" required value={formData.venue} onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        placeholder="e.g., Main Auditorium" />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Ticket Price (₹)</label>
                    <input type="number" name="price" min="0" required value={formData.price} onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        placeholder="0 for free" />
                </div>

                {/* Total Seats */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Total Capacity</label>
                    <input type="number" name="total_seats" min="1" required value={formData.total_seats} onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        placeholder="e.g., 500" />
                </div>
            </div>

            <button type="submit" disabled={status.loading}
                className="w-full mt-6 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300">
                {status.loading ? 'Publishing...' : 'Publish Event'}
            </button>
        </form>
    );
};

export default CreateEventForm;