import React, { useState, useEffect } from 'react';
import { FiStar, FiThumbsUp, FiFlag, FiChevronDown, FiChevronUp, FiUser, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../contexts/AuthContext';

const StarRating = ({ rating, size = 16, interactive = false, onChange }) => {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onChange?.(star)}
                    onMouseEnter={() => interactive && setHovered(star)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                >
                    <FiStar
                        size={size}
                        className={`${star <= (hovered || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
};

const ReviewCard = ({ review, onReport }) => {
    const [showResponse, setShowResponse] = useState(false);
    const createdDate = new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {review.reviewer?.firstName?.[0] || <FiUser size={18} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                                {review.reviewer?.firstName} {review.reviewer?.lastName?.[0]}.
                            </span>
                            {review.verifiedStay && (
                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    <FiCheckCircle size={12} />
                                    Verified Stay
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiCalendar size={12} />
                            {createdDate}
                        </div>
                    </div>
                </div>
                <StarRating rating={review.rating} />
            </div>

            {/* Review Text */}
            <p className="text-gray-700 leading-relaxed mb-4">{review.reviewText}</p>

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                    {review.photos.map((photo, index) => (
                        <img
                            key={index}
                            src={photo}
                            alt={`Review photo ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                    ))}
                </div>
            )}

            {/* Landlord Response */}
            {review.response?.text && (
                <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-orange-400">
                    <button
                        onClick={() => setShowResponse(!showResponse)}
                        className="flex items-center justify-between w-full text-left"
                    >
                        <span className="text-sm font-bold text-gray-700">Response from Landlord</span>
                        {showResponse ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {showResponse && (
                        <p className="mt-3 text-sm text-gray-600">{review.response.text}</p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm">
                        <FiThumbsUp size={14} />
                        <span>Helpful ({review.helpful || 0})</span>
                    </button>
                </div>
                <button
                    onClick={() => onReport?.(review._id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                    <FiFlag size={14} />
                    Report
                </button>
            </div>
        </div>
    );
};

const WriteReviewForm = ({ listingId, onSubmit, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }
        if (!reviewText.trim()) {
            setError('Please write a review');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await reviewService.createReview({
                listingId,
                rating,
                reviewText: reviewText.trim(),
            });
            onSubmit?.();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Rating */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Your Rating *</label>
                <StarRating rating={rating} size={32} interactive onChange={setRating} />
            </div>

            {/* Review Text */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Review *</label>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this listing..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{reviewText.length}/1000 characters</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

const ListingReviews = ({ listingId, averageRating = 0, totalReviews = 0 }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWriteForm, setShowWriteForm] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchReviews();
    }, [listingId, page]);

    const fetchReviews = async () => {
        try {
            const data = await reviewService.getListingReviews(listingId, page);
            setReviews(data.reviews || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReport = async (reviewId) => {
        if (!window.confirm('Are you sure you want to report this review?')) return;
        try {
            await reviewService.reportReview(reviewId);
            alert('Review reported successfully');
        } catch (error) {
            console.error('Error reporting review:', error);
        }
    };

    const handleReviewSubmit = () => {
        setShowWriteForm(false);
        setPage(1);
        fetchReviews();
    };

    // Check if user already reviewed
    const hasUserReviewed = reviews.some(r => r.reviewer?._id === user?._id);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        Reviews
                        <span className="flex items-center gap-1 text-lg">
                            <FiStar className="fill-yellow-400 text-yellow-400" />
                            {averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm font-normal text-gray-500">
                            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                    </h2>
                </div>
                {user && !hasUserReviewed && !showWriteForm && (
                    <button
                        onClick={() => setShowWriteForm(true)}
                        className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Write Review Form */}
            {showWriteForm && (
                <WriteReviewForm
                    listingId={listingId}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setShowWriteForm(false)}
                />
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl">
                    <FiStar className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 font-medium">No reviews yet</p>
                    <p className="text-gray-400 text-sm">Be the first to share your experience!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard key={review._id} review={review} onReport={handleReport} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-full font-bold transition-all ${page === p
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ListingReviews;
