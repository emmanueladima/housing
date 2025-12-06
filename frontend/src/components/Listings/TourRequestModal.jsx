import { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Input from '../shared/Input';
import { FiCalendar, FiClock, FiMessageSquare } from 'react-icons/fi';
import { createThread } from '../../services/messageService';

const TourRequestModal = ({ isOpen, onClose, listing, landlordId }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create a message thread with the tour request details
            const tourMessage = `Hi, I'm interested in touring ${listing.title}.
      
Requested Date: ${date}
Requested Time: ${time}

Message: ${message}`;

            await createThread({
                type: 'listing',
                listingId: listing._id,
                participantIds: [landlordId],
                initialMessage: tourMessage
            });

            alert('Tour request sent successfully!');
            onClose();
        } catch (error) {
            console.error('Error sending tour request:', error);
            alert('Failed to send tour request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request a Tour">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-xl mb-4">
                    <h4 className="font-bold text-orange-900 mb-1">{listing.title}</h4>
                    <p className="text-sm text-orange-700">{listing.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Preferred Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        icon={FiCalendar}
                        required
                        min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                        label="Preferred Time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        icon={FiClock}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message (Optional)
                    </label>
                    <div className="relative">
                        <div className="absolute top-3 left-3 text-gray-400">
                            <FiMessageSquare size={18} />
                        </div>
                        <textarea
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all min-h-[100px]"
                            placeholder="Any specific questions or alternative times?"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Request'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TourRequestModal;
