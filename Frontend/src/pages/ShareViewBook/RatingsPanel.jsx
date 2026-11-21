import React from 'react';
import { Icon } from '@iconify/react';
import { X } from 'lucide-react';
import { getAvatarBg } from './shareViewUtils';

/**
 * Sliding "Ratings & Reviews" panel on the share page.
 */
const RatingsPanel = ({
    isRatingsOpen,
    setIsRatingsOpen,
    reviewsList,
    currentUserEmail,
    editingRatingId,
    hoverRating,
    setHoverRating,
    ratingForm,
    setRatingForm,
    ratingFormError,
    setRatingFormError,
    isSubmittingRating,
    isDeletingRating,
    handleRatingSubmit,
    handleStartEdit,
    handleCancelEdit,
    handleDeleteRating,
    renderStars,
    navigate,
    location,
}) => (
    <>
    {/* Ratings & Reviews Sliding Panel */}
    <div className={`fixed inset-0 z-[1490] ${isRatingsOpen ? '' : 'pointer-events-none'}`}>
        {/* Optional overlay background */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isRatingsOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setIsRatingsOpen(false)}></div>

        <div className={`absolute top-0 right-0 h-full w-[22vw] bg-white/95 backdrop-blur-md z-[1491] transform transition-transform duration-500 ease-in-out flex flex-col pointer-events-auto shadow-2xl ${isRatingsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-[1vw] px-[1.2vw] mt-[0.5vw] border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-[0.5vw]">
                    <h2 className="text-[1.1vw] font-semibold text-gray-900 whitespace-nowrap">
                        Ratings & Reviews ({reviewsList.length})
                    </h2>
                </div>
                <button onClick={() => setIsRatingsOpen(false)} className="p-[0.3vw] border border-red-500 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                    <X className="w-[0.9vw] h-[0.9vw]" />
                </button>
            </div>

            {!currentUserEmail ? (
                <div className="p-[1.2vw] pb-[0.6vw] shrink-0">
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-[1.2vw] flex flex-col items-center text-center gap-[0.5vw] shadow-sm">
                        <div className="w-[2.4vw] h-[2.4vw] rounded-full bg-indigo-50 flex items-center justify-center text-[#4A3AFF] border border-indigo-100">
                            <Icon icon="lucide:lock" className="w-[1.2vw] h-[1.2vw]" />
                        </div>
                        <div className="flex flex-col gap-[0.2vw]">
                            <span className="text-[0.95vw] font-semibold text-gray-900">Sign in to Rate & Review</span>
                            <p className="text-[0.75vw] text-gray-500 leading-relaxed max-w-[17vw]">
                                Please log in with your account to rate this book and write a review.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate(`/?redirect=${encodeURIComponent(location.pathname + location.search)}`)}
                            className="w-full py-[0.65vw] bg-black text-white text-[0.85vw] font-medium rounded-xl hover:bg-gray-900 transition-colors cursor-pointer flex items-center justify-center gap-[0.4vw] shadow-sm mt-[0.2vw]"
                        >
                            <Icon icon="lucide:log-in" className="w-[0.9vw] h-[0.9vw]" /> Log in to Review
                        </button>
                    </div>
                </div>
            ) : (editingRatingId || !reviewsList.some(r => r.userEmail && r.userEmail.toLowerCase() === currentUserEmail.toLowerCase())) ? (
                <div className="p-[1.2vw] flex flex-col gap-[0.8vw] mt-[-0.3vw] shrink-0">
                    <div className="bg-white border border-gray-200 rounded-xl p-[1vw] flex flex-col gap-[0.8vw] shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[0.9vw] font-bold text-gray-900">
                                {editingRatingId ? 'Edit your review' : 'Rate this book'}
                            </span>
                            {editingRatingId && (
                                <span className="text-[0.7vw] bg-amber-50 text-amber-700 px-[0.4vw] py-[0.1vw] rounded font-medium border border-amber-200">
                                    Editing
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-[0.3vw]">
                            <label className="text-[0.85vw] font-semibold text-gray-800">Your Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                placeholder="Enter your name" 
                                value={ratingForm.name} 
                                onChange={(e) => {
                                    setRatingForm({ ...ratingForm, name: e.target.value });
                                    if (e.target.value) setRatingFormError({ show: false });
                                }} 
                                className={`w-full border ${ratingFormError.show && !ratingForm.name ? 'border-red-500' : 'border-gray-200'} rounded-xl px-[0.8vw] py-[0.6vw] text-[0.85vw] focus:outline-none focus:border-[#4A3AFF] transition-colors`} 
                            />
                        </div>
                        <div className="flex flex-col gap-[0.3vw]">
                            <div className="flex items-center justify-between">
                                <label className="text-[0.85vw] font-semibold text-gray-800">Your rating <span className="text-red-500">*</span></label>
                                {(hoverRating > 0 || ratingForm.rating > 0) && (
                                    <span className="text-[0.8vw] font-bold text-[#2F296D]">{hoverRating || ratingForm.rating} / 5</span>
                                )}
                            </div>
                            <div className={`flex items-center justify-between pl-[1vw] pr-[1vw] py-[0.4vw] ${ratingFormError.show && !ratingForm.rating ? 'ring-1 ring-red-500 rounded-xl' : ''}`}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <svg 
                                        key={i} 
                                        onMouseEnter={() => setHoverRating(i)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => {
                                            setRatingForm({ ...ratingForm, rating: i });
                                            setRatingFormError({ show: false });
                                        }} 
                                        className="w-[2.2vw] h-[2.2vw] overflow-visible cursor-pointer drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)] hover:scale-115 active:scale-95 transition-all" 
                                        fill={i <= (hoverRating || ratingForm.rating) ? "url(#star-gradient)" : "white"} 
                                        stroke="url(#star-gradient)" 
                                        strokeWidth="1" 
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 1L12.7 6.5L19 7.4L14.5 11.8L15.6 18.1L10 15.2L4.4 18.1L5.5 11.8L1 7.4L7.3 6.5Z"></path>
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-[0.3vw]">
                            <label className="text-[0.85vw] font-semibold text-gray-800">Your Review</label>
                            <textarea 
                                placeholder="Share your thoughts about this flipbook..." 
                                rows={3} 
                                value={ratingForm.review} 
                                onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })} 
                                className="w-full border border-gray-200 rounded-xl px-[0.8vw] py-[0.6vw] text-[0.85vw] focus:outline-none focus:border-[#4A3AFF] resize-none transition-colors"
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex items-center gap-[0.5vw]">
                        {editingRatingId && (
                            <button 
                                onClick={handleCancelEdit} 
                                className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-[0.7vw] text-[0.85vw] font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            onClick={handleRatingSubmit} 
                            disabled={isSubmittingRating}
                            className="flex-1 bg-black text-white rounded-xl py-[0.7vw] text-[0.9vw] font-medium hover:bg-gray-900 transition-colors cursor-pointer flex items-center justify-center gap-[0.4vw] disabled:opacity-60 shadow-md"
                        >
                            {isSubmittingRating ? (
                                <div className="animate-spin rounded-full h-[0.9vw] w-[0.9vw] border-2 border-white border-t-transparent" />
                            ) : (
                                <span>{editingRatingId ? 'Update Review' : 'Submit Rating'}</span>
                            )}
                        </button>
                    </div>
                </div>
            ) : null}

            {(!currentUserEmail || editingRatingId || !reviewsList.some(r => r.userEmail && r.userEmail.toLowerCase() === currentUserEmail.toLowerCase())) && (
                <div className="h-[0.3vw] bg-gray-50 shrink-0 border-y border-gray-100"></div>
            )}

            <div className="p-[1.2vw] pb-[0.3vw] shrink-0 flex items-center justify-between">
                <h3 className="text-[1vw] font-semibold text-gray-900 whitespace-nowrap">Recent Reviews</h3>
                <span className="text-[0.75vw] text-gray-400 font-normal">{reviewsList.length} total</span>
            </div>

            <div className="flex-1 overflow-y-auto p-[1.2vw] pt-[0.3vw] flex flex-col gap-[0.8vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {reviewsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-[3vw] text-center gap-[0.5vw]">
                        <Icon icon="iconamoon:star-light" className="w-[2.5vw] h-[2.5vw] text-gray-300" />
                        <p className="text-[0.85vw] text-gray-500 font-medium">No reviews yet.</p>
                        <p className="text-[0.7vw] text-gray-400">Be the first to rate and review this book!</p>
                    </div>
                ) : (
                    [...reviewsList].sort((a, b) => {
                        const aIsMine = Boolean(currentUserEmail && a.userEmail && a.userEmail.toLowerCase() === currentUserEmail.toLowerCase());
                        const bIsMine = Boolean(currentUserEmail && b.userEmail && b.userEmail.toLowerCase() === currentUserEmail.toLowerCase());
                        if (aIsMine && !bIsMine) return -1;
                        if (!aIsMine && bIsMine) return 1;
                        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                    }).map((review, index) => {
                        const rId = review._id || index;
                        const rVal = review.ratingValue || review.rating || 5;
                        const rName = review.name || 'Anonymous Reader';
                        const rText = review.review || '';
                        const isAuthor = currentUserEmail && review.userEmail && currentUserEmail.toLowerCase() === review.userEmail.toLowerCase();
                        const isEditingThis = editingRatingId && String(editingRatingId) === String(review._id);

                        return (
                            <div key={rId} className={`border ${isEditingThis ? 'border-[#4A3AFF] bg-indigo-50/20' : 'border-gray-100 bg-white'} rounded-xl p-[1.2vw] flex flex-col gap-[0.8vw] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-[0.8vw]">
                                        {review.profileImgUrl ? (
                                            <img 
                                                src={review.profileImgUrl} 
                                                alt={rName} 
                                                className="w-[2.2vw] h-[2.2vw] rounded-full object-cover border border-gray-100 shrink-0 shadow-sm" 
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    if (e.currentTarget.nextElementSibling) {
                                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                                    }
                                                }}
                                            />
                                        ) : null}
                                        <div 
                                            className="w-[2.2vw] h-[2.2vw] rounded-full flex items-center justify-center text-white font-bold text-[0.95vw] shadow-sm shrink-0 uppercase select-none"
                                            style={{ 
                                                backgroundColor: getAvatarBg(rName),
                                                display: review.profileImgUrl ? 'none' : 'flex'
                                            }}
                                        >
                                            {(rName.trim()[0] || 'U').toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-[0.4vw]">
                                                <span className="text-[0.95vw] font-semibold text-gray-900 tracking-tight leading-tight">{rName}</span>
                                                {isAuthor && (
                                                    <span className="text-[0.6vw] bg-indigo-50 text-[#4A3AFF] px-[0.35vw] py-[0.05vw] rounded-full font-semibold border border-indigo-100">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            {review.createdAt && (
                                                <span className="text-[0.65vw] text-gray-400 leading-tight">
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, {new Date(review.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {review._id && (isAuthor || !review.userEmail) && (
                                        <div className="flex items-center gap-[0.2vw]">
                                            <button 
                                                onClick={() => handleStartEdit(review)} 
                                                className="text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer p-[0.2vw] rounded hover:bg-indigo-50"
                                                title="Edit review"
                                            >
                                                <Icon icon="lucide:edit-3" className="w-[0.9vw] h-[0.9vw]" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteRating(review._id)} 
                                                disabled={isDeletingRating === review._id}
                                                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-[0.2vw] rounded hover:bg-red-50"
                                                title="Remove review"
                                            >
                                                {isDeletingRating === review._id ? (
                                                    <div className="animate-spin rounded-full h-[0.8vw] w-[0.8vw] border border-red-500 border-t-transparent" />
                                                ) : (
                                                    <Icon icon="lucide:trash-2" className="w-[0.9vw] h-[0.9vw]" />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {rText && (
                                    <p className="text-[0.85vw] text-gray-600 leading-relaxed break-words">
                                        {rText}
                                    </p>
                                )}
                                
                                <div className="w-full h-[1px] bg-gray-100 my-[0.1vw]"></div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-[0.8vw] font-medium text-gray-600">Rating : {rVal} / 5</span>
                                    <div className="flex items-center gap-[0.2vw]">
                                        {renderStars(rVal, 'w-[1vw] h-[1vw]')}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    </div>
    </>
);

export default RatingsPanel;
