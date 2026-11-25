import React from 'react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import LazyPreview from '../../components/MyFlipbooks/LazyPreview';

/**
 * "Book Information" popup on the share page (styled like CreateFlipbookModal).
 */
const BookInfoModal = ({
    isBookInfoOpen,
    setIsBookInfoOpen,
    bookData,
    viewsCount,
    averageRating,
    totalRatings,
    renderStars,
    formatDisplayDate,
}) => {
    // Real book info only (saved by the creator in Flipbook Info) — no placeholder text
    const info = bookData?.FlipbookInfo || bookData?.meta || bookData?.Customized_Settings?.FlipbookInfo || {};
    const clean = (v) => (typeof v === 'string' ? v.trim() : v);
    const title = clean(bookData?.flipbookName) || clean(info.flipbookName) || 'Untitled Flipbook';
    const quote = clean(info.quotes);
    const about = clean(info.about) || clean(info.description);
    const tags = Array.isArray(info.tags) ? info.tags.filter(Boolean) : [];
    const cover = info.coverPicture || bookData?.Customized_Settings?.coverPicture || null;
    const firstPage = bookData?.pages?.[0];
    const publishedAt = bookData?.publishedAt || info.publishedAt || bookData?.createdAt;
    // Full published date, e.g. "23 November 2026"
    const formatFullDate = (val) => {
        const d = new Date(val);
        if (isNaN(d.getTime())) return formatDisplayDate(val);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    // Publisher shown as a name, never an email address
    const rawPublisher = clean(bookData?.publisher) || clean(info.publisher) || '';
    const publisher = rawPublisher.includes('@') ? rawPublisher.split('@')[0] : rawPublisher;
    const pageCount = bookData?.pages?.length || 0;
    const dash = <span className="text-gray-400">—</span>;

    return (
    <>
    {/* Book Information Modal (styled to match CreateFlipbookModal) */}
    <AnimatePresence>
    {isBookInfoOpen && (
        <motion.div
            key="book-info-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-[2vw]"
            onClick={() => setIsBookInfoOpen(false)}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-[1.25vw] p-[1.25vw] shadow-2xl flex flex-col w-full max-w-[36vw] max-h-[90vh] overflow-y-auto border border-gray-100/80 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {/* Header */}
                <div className="mb-[1vw]">
                    <div className="flex items-center justify-between mb-[0.25vw]">
                        <div className="flex items-center flex-1 mr-[0.75vw]">
                            <h2 className="text-[1.45vw] font-bold text-gray-900 tracking-tight pr-[0.75vw] whitespace-nowrap">Book Information</h2>
                            <div className="flex-1 h-[1px] bg-gray-200 mt-[0.1vw]"></div>
                        </div>
                        <button
                            onClick={() => setIsBookInfoOpen(false)}
                            className="text-[#ea543a] border border-[#ea543a] hover:bg-[#ea543a]/10 transition-colors p-[0.3vw] rounded-[0.4vw] cursor-pointer flex items-center justify-center"
                            aria-label="Close"
                        >
                            <X className="w-[1.1vw] h-[1.1vw]" />
                        </button>
                    </div>
                    <p className="text-[0.8vw] text-gray-500 font-normal">Detailed information about this book</p>
                </div>

                {/* Cover + title card */}
                <div className="border border-gray-200 rounded-[0.8vw] p-[1.2vw] mb-[1vw] bg-white flex gap-[1.2vw]">
                    {/* Cover thumbnail — same renderer as My Flipbooks (cover template / image, else page 1) */}
                    <div className="shrink-0 w-[12vw] aspect-[4/3] rounded-[0.6vw] overflow-hidden bg-gray-50 border border-gray-200/60 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                        <LazyPreview
                            v_id={bookData?.v_id}
                            emailId={bookData?.userEmail}
                            title={title}
                            imageUrl={cover?.type !== 'template' ? (cover?.url || bookData?.thumbnail || null) : null}
                            coverPicture={cover}
                            pages={bookData?.pages || []}
                            firstPageFileName={firstPage?.fileName || (firstPage?.name ? `${firstPage.name}.svg` : 'Page 1.svg')}
                            firstPageContent={firstPage?.html || firstPage?.content || null}
                        />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="text-[1.15vw] font-bold text-gray-900 tracking-tight leading-tight truncate" title={title}>{title}</h3>
                        {quote && (
                            <p className="text-[0.8vw] text-gray-500 italic leading-relaxed mt-[0.3vw]">“{quote}”</p>
                        )}
                        {about && (
                            <>
                                <h4 className="text-[0.82vw] font-bold text-gray-800 mt-[0.8vw] mb-[0.2vw]">About</h4>
                                <p className="text-[0.8vw] text-gray-500 leading-relaxed whitespace-pre-line">{about}</p>
                            </>
                        )}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-[0.3vw] mt-[0.7vw]">
                                {tags.map((t) => (
                                    <span key={t} className="text-[0.68vw] font-medium text-[#ea543a] bg-[#ea543a]/8 border border-[#ea543a]/20 rounded-full px-[0.55vw] py-[0.1vw]">#{t}</span>
                                ))}
                            </div>
                        )}
                        {!quote && !about && tags.length === 0 && (
                            <p className="text-[0.8vw] text-gray-400 mt-[0.3vw]">The creator hasn't added a description yet.</p>
                        )}
                    </div>
                </div>

                {/* Details card */}
                <div className="border border-gray-200 rounded-[0.8vw] p-[1.2vw] bg-white">
                    <div className="flex items-center justify-between bg-[#ea543a]/5 border border-[#ea543a]/15 rounded-[0.6vw] px-[0.9vw] py-[0.7vw] mb-[0.6vw]">
                        <div className="flex items-center gap-[0.5vw]">
                            <Icon icon="si:eye-line" className="w-[1.1vw] h-[1.1vw] text-[#ea543a]" />
                            <span className="text-[0.82vw] font-bold text-gray-800">Views</span>
                        </div>
                        <div className="flex items-baseline gap-[0.4vw]">
                            <span className="text-[1.15vw] font-bold text-gray-900 leading-none">{Number(viewsCount || 0).toLocaleString()}</span>
                            <span className="text-[0.72vw] text-gray-500">readers opened this book</span>
                        </div>
                    </div>

                    {[
                        { label: 'Category', value: clean(info.category) || dash },
                        { label: 'Language', value: clean(info.language) || dash },
                        { label: 'Pages', value: `${pageCount} ${pageCount === 1 ? 'Page' : 'Pages'}` },
                        {
                            label: 'Ratings', value: (
                                <div className="flex items-center gap-[0.4vw]">
                                    <div className="flex items-center gap-[0.15vw] [&_svg]:w-[1vw] [&_svg]:h-[1vw]">
                                        {renderStars(averageRating)}
                                    </div>
                                    <span className="text-[0.82vw] text-gray-500">{averageRating > 0 ? `${averageRating}/5` : '0/5'} {totalRatings > 0 ? `(${totalRatings})` : ''}</span>
                                </div>
                            )
                        },
                        { label: 'Published', value: publishedAt ? formatFullDate(publishedAt) : dash },
                        { label: 'Publisher', value: publisher ? <span className="text-gray-700">{publisher}</span> : dash }
                    ].map((item, index) => (
                        <div key={index} className="flex items-center py-[0.65vw] border-b border-gray-100 last:border-0">
                            <span className="w-[9vw] text-[0.82vw] font-bold text-gray-800">{item.label}</span>
                            <span className="flex-1 text-[0.82vw] font-medium text-gray-600">{item.value}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )}
    </AnimatePresence>
    </>
    );
};

export default BookInfoModal;
