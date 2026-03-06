"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  StarHalf,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchProductReviews,
  fetchUserReview,
  submitReview,
  updateReview,
  deleteReview,
  clearReviews,
  clearSubmitSuccess,
  clearError,
  Review
} from "@/lib/redux/features/reviews/reviewsSlice";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const dispatch = useAppDispatch();
  const { reviews, userReview, stats, loading, submitting, error, submitSuccess } = useAppSelector(
    (state) => state.reviews
  );
  
  const [showAll, setShowAll] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [formError, setFormError] = useState("");

  const isValidObjectId = (id: string) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  useEffect(() => {
    if (productId && isValidObjectId(productId)) {
      dispatch(fetchProductReviews(productId));
      dispatch(fetchUserReview(productId));
    }

    return () => {
      dispatch(clearReviews());
    };
  }, [dispatch, productId]);

  useEffect(() => {
    if (userReview && isEditing) {
      setReviewRating(userReview.rating);
      setReviewComment(userReview.comment);
    }
  }, [userReview, isEditing]);

  useEffect(() => {
    if (submitSuccess) {
      setShowReviewForm(false);
      setIsEditing(false);
      setReviewRating(5);
      setReviewComment("");
      setFormError("");
      dispatch(clearSubmitSuccess());
    }
  }, [submitSuccess, dispatch]);

  useEffect(() => {
    if (error) {
      setFormError(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  const renderStars = (rating: number, size: number = 14) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={size} className="fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={size} className="fill-yellow-400 text-yellow-400" />);
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={size} className="text-gray-300" />);
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!isValidObjectId(productId)) {
      setFormError("Invalid product ID");
      return;
    }

    if (reviewComment.length < 10) {
      setFormError("Review must be at least 10 characters long");
      return;
    }

    if (isEditing && userReview) {
      await dispatch(updateReview({
        reviewId: userReview._id,
        rating: reviewRating,
        comment: reviewComment,
      }));
    } else {
      await dispatch(submitReview({
        productId,
        rating: reviewRating,
        comment: reviewComment,
      }));
    }
  };

  const handleDeleteReview = async () => {
    if (userReview) {
      await dispatch(deleteReview(userReview._id));
      setShowDeleteModal(false);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const openEditForm = () => {
    setIsEditing(true);
    setShowReviewForm(true);
  };

  const closeForm = () => {
    setShowReviewForm(false);
    setIsEditing(false);
    setReviewRating(5);
    setReviewComment("");
    setFormError("");
    setHoverRating(0);
  };

  if (!productId || !isValidObjectId(productId)) {
    return null;
  }

  // if (loading && reviews.length === 0) {
  //   return (
  //     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
  //       <div className="flex justify-center items-center">
  //         <Loader2 size={32} className="text-[#5D5FEF] animate-spin" />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {renderStars(stats.averageRating, 16)}
            </div>
            <span className="text-sm text-gray-600">
              {stats.averageRating.toFixed(1)} out of 5 ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {/* Rating Distribution */}
        {stats.totalReviews > 0 && (
          <div className="flex items-center gap-4 text-xs">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-1">
                <span className="font-medium text-gray-700">{star}</span>
                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                <span className="text-gray-500">
                  {Math.round((stats.ratingDistribution[star as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User's Review Section */}
      {userReview && !showReviewForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Your Review</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={openEditForm}
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-blue-600"
                title="Edit your review"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={openDeleteModal}
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-red-600"
                title="Delete your review"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {renderStars(userReview.rating)}
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(userReview.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 text-sm">{userReview.comment}</p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {displayedReviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
              >
                <div className="flex gap-3">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {reviews.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-4 py-2 text-[#5D5FEF] font-medium text-sm hover:bg-[#5D5FEF]/5 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Show All {reviews.length} Reviews <ChevronDown size={16} />
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      {/* Write Review Button */}
      {!userReview && !showReviewForm && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={() => setShowReviewForm(true)}
            className="w-full sm:w-auto px-6 py-3 bg-[#5D5FEF] text-white rounded-xl font-medium hover:bg-[#4B4DC9] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Write a Review
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle size={32} className="text-red-500" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete Review
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete your review? 
                </p> 

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={closeForm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Form Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Your Review" : "Write a Review"}
                </h3>
                <button
                  onClick={closeForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Review Form */}
              <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={`transition-colors ${
                            star <= (hoverRating || reviewRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {reviewRating} out of 5
                    </span>
                  </div>
                </div>

                {/* Comment Field */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    id="comment"
                    rows={5}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20 outline-none transition-all resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters
                  </p>
                </div>

                {/* Error Message */}
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {formError}
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-[#5D5FEF] text-white rounded-xl font-medium hover:bg-[#4B4DC9] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        {isEditing ? "Update Review" : "Submit Review"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}