import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Globe,
  ChevronRight,
  Star,
  Calendar,
  MoreVertical,
  ChevronDown,
  BookOpen,
  Edit,
  Eye,
  Share2,
  CheckCircle2,
  Plus,
  BookOpenCheck,
  Send,
  Trash2
} from 'lucide-react';
import BookThumbnail from '../../../../components/BookThumbnail';

export default function FlipbooksTab({
  flipbooks = [],
  user,
  selectedBookId: externalSelectedBookId,
  setSelectedBookId: externalSetSelectedBookId
}) {
  // Navigation state: internal fallback or controlled from UserDetailPage
  const [internalSelectedBookId, setInternalSelectedBookId] = useState(null);
  const selectedBookId = externalSelectedBookId !== undefined ? externalSelectedBookId : internalSelectedBookId;
  const setSelectedBookId = externalSetSelectedBookId || setInternalSelectedBookId;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('Public');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [activityFilter, setActivityFilter] = useState('All Activity');

  // Sample default flipbooks matching Image 1
  const defaultBooks = [
    {
      id: 'FB-BK-001',
      title: 'Product Catalogue 2026',
      createdAt: '12 Oct 2026 · 10:45 AM',
      createdDate: '12 OCT 2026',
      lastUpdated: '27 OCT 2026',
      visibility: 'Public',
      status: 'Published',
      reportsCount: 0,
      rating: 4.0,
      category: 'Product Catalogue',
      language: 'English',
      totalPages: 12,
      description: 'User Management-la Reports count mattum show pannunga. Actual complaints ellame separate Reported Flipbooks module-la manage pannunga',
      stats: {
        totalViews: '1.24K',
        rating: 4.0,
        reviews: 264,
        uniqueReaders: '1000',
        avgReadingTime: '16 Mins',
        downloads: '800'
      },
      coverImage: null
    },
    {
      id: 'FB-BK-002',
      title: 'Product Catalogue 2026',
      createdAt: '12 Oct 2026 · 10:45 AM',
      createdDate: '12 OCT 2026',
      lastUpdated: '27 OCT 2026',
      visibility: 'Public',
      status: 'Published',
      reportsCount: 0,
      rating: 4.0,
      category: 'Product Catalogue',
      language: 'English',
      totalPages: 12,
      description: 'User Management-la Reports count mattum show pannunga. Actual complaints ellame separate Reported Flipbooks module-la manage pannunga',
      stats: {
        totalViews: '1.24K',
        rating: 4.0,
        reviews: 264,
        uniqueReaders: '1000',
        avgReadingTime: '16 Mins',
        downloads: '800'
      },
      coverImage: null
    },
    {
      id: 'FB-BK-003',
      title: 'Product Catalogue 2026',
      createdAt: '12 Oct 2026 · 10:45 AM',
      createdDate: '12 OCT 2026',
      lastUpdated: '27 OCT 2026',
      visibility: 'Public',
      status: 'Published',
      reportsCount: 1, // Red badge Reports : 1
      rating: 4.0,
      category: 'Product Catalogue',
      language: 'English',
      totalPages: 12,
      description: 'User Management-la Reports count mattum show pannunga. Actual complaints ellame separate Reported Flipbooks module-la manage pannunga',
      stats: {
        totalViews: '1.24K',
        rating: 4.0,
        reviews: 264,
        uniqueReaders: '1000',
        avgReadingTime: '16 Mins',
        downloads: '800'
      },
      coverImage: null
    },
    {
      id: 'FB-BK-004',
      title: 'Product Catalogue 2026',
      createdAt: '12 Oct 2026 · 10:45 AM',
      createdDate: '12 OCT 2026',
      lastUpdated: '27 OCT 2026',
      visibility: 'Public',
      status: 'Published',
      reportsCount: 0,
      rating: 4.0,
      category: 'Product Catalogue',
      language: 'English',
      totalPages: 12,
      description: 'User Management-la Reports count mattum show pannunga. Actual complaints ellame separate Reported Flipbooks module-la manage pannunga',
      stats: {
        totalViews: '1.24K',
        rating: 4.0,
        reviews: 264,
        uniqueReaders: '1000',
        avgReadingTime: '16 Mins',
        downloads: '800'
      },
      coverImage: null
    }
  ];

  // Merge backend flipbooks if provided, else use defaults
  const books = (flipbooks && flipbooks.length > 0)
    ? flipbooks.map((fb, idx) => {
        const bookTitle = fb.flipbookName || fb.title || fb.name || 'Product Catalogue 2026';
        const bookId = fb._id || fb.bookID || fb.book_v_id || fb.v_id || `FB-BK-00${idx + 1}`;
        const isPub = fb.isPublished !== undefined ? fb.isPublished : (fb.status ? fb.status.toLowerCase() === 'published' : true);
        const vis = fb.visibility ? (fb.visibility.charAt(0).toUpperCase() + fb.visibility.slice(1)) : 'Public';
        
        // Resolve cover image or first page thumbnail if available
        let coverImg = null;
        if (fb.coverPicture?.url) {
          coverImg = fb.coverPicture.url;
        } else if (fb.thumbnail) {
          coverImg = fb.thumbnail;
        }

        const dateFormatted = fb.createdAt
          ? new Date(fb.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date(fb.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          : '12 Oct 2026 · 10:45 AM';

        const createdDateOnly = fb.createdAt
          ? new Date(fb.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
          : '12 OCT 2026';

        const lastUpdatedDateOnly = fb.updatedAt
          ? new Date(fb.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
          : createdDateOnly;

        return {
          id: String(bookId),
          title: bookTitle,
          flipbookName: bookTitle,
          v_id: fb.book_v_id || fb.v_id || String(bookId),
          userID: fb.userID || user?.userID,
          bookType: fb.bookType || 'plain',
          createdAt: dateFormatted,
          createdDate: createdDateOnly,
          lastUpdated: lastUpdatedDateOnly,
          visibility: vis,
          status: isPub ? 'Published' : 'Draft',
          reportsCount: fb.reportsCount !== undefined ? fb.reportsCount : 0,
          rating: fb.averageRating || fb.rating || 4.0,
          category: fb.category || fb.bookType?.toUpperCase() || 'Product Catalogue',
          language: fb.language || 'English',
          totalPages: fb.pages?.length || fb.totalPages || 0,
          description: fb.description || `${bookTitle} created with ${fb.pages?.length || 0} pages.`,
          stats: {
            totalViews: fb.viewsCount !== undefined ? `${fb.viewsCount}` : (fb.views ? `${fb.views}` : '0'),
            rating: fb.averageRating || fb.rating || 4.0,
            reviews: fb.totalRatings || fb.reviewsCount || 0,
            uniqueReaders: fb.viewers?.length ? `${fb.viewers.length}` : (fb.uniqueReaders || '0'),
            avgReadingTime: fb.avgReadingTime || '16 Mins',
            downloads: fb.downloads || '0'
          },
          coverImage: coverImg,
          coverPicture: fb.coverPicture,
          thumbnail: fb.thumbnail
        };
      })
    : defaultBooks;

  const currentBook = books.find((b) => b.id === selectedBookId) || books[0];

  // Render Star rating helper
  const renderStars = (rating = 4) => {
    return (
      <div className="flex items-center gap-[0.2vw]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size="0.85vw"
            className={`${
              star <= Math.floor(rating)
                ? 'text-[#f59e0b] fill-[#f59e0b]'
                : star - rating <= 0.5
                ? 'text-[#f59e0b] fill-[#f59e0b]/50'
                : 'text-gray-200 fill-transparent'
            }`}
          />
        ))}
        <span className="text-[0.8vw] text-gray-500 font-semibold ml-[0.3vw]">4/5</span>
      </div>
    );
  };

  /* ------------------------------------------------------------- */
  /* DETAIL VIEW (Image 2)                                         */
  /* ------------------------------------------------------------- */
  if (selectedBookId) {
    return (
      <div className="space-y-[1.4vw] font-sans">
        {/* Flipbook Header Showcase Card */}
        <div className="bg-white rounded-[0.85vw] border border-gray-100/90 p-[1.4vw] shadow-xs flex items-center gap-[1.5vw]">
          <div className="w-[8.5vw] h-[5.8vw] rounded-[0.5vw] overflow-hidden shrink-0 shadow-xs border border-gray-200 bg-gray-50 flex items-center justify-center">
            <BookThumbnail
              book={currentBook}
              className="w-full h-full"
              fallbackClassName="text-[0.8vw] font-medium text-gray-400 select-none"
            />
          </div>

          <div className="space-y-[0.35vw]">
            <h2 className="text-[1vw] font-semibold text-gray-900 tracking-tight">
              {currentBook.title}
            </h2>
            <p className="text-[0.7vw] text-gray-400 font-semibold">
              {currentBook.id} · Created {currentBook.createdDate}
            </p>

            <div className="flex items-center gap-[0.45vw] pt-[0.1vw]">
              <span className="inline-flex items-center gap-[0.2vw] text-[0.7vw] font-semibold text-[#2563eb] bg-[#eff6ff] px-[0.55vw] py-[0.18vw] rounded-[0.3vw]">
                <Globe size="0.65vw" />
                {currentBook.visibility}
              </span>
              <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#16a34a] bg-[#f0fdf4] px-[0.55vw] py-[0.18vw] rounded-[0.3vw]">
                {currentBook.status}
              </span>
            </div>

            <div className="pt-[0.2vw]">
              {renderStars(currentBook.rating)}
            </div>
          </div>
        </div>

        {/* 01 Book Information Section */}
        <div className="space-y-[0.6vw]">
          <div className="flex items-center gap-[0.5vw]">
            <span className="w-[1.4vw] h-[1.4vw] rounded-full border border-[#f87171] text-[#ef4444] text-[0.8vw] font-semibold flex items-center justify-center">
              01
            </span>
            <h3 className="text-[1.1vw] font-semibold text-[#ef4444]">Book Information</h3>
          </div>

          <div className="bg-white rounded-[0.75vw] border border-gray-100 shadow-xs overflow-hidden">
            <table className="w-full text-left text-[0.8vw]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[0.7vw] font-semibold text-gray-900">
                  <th className="py-[0.7vw] px-[1.2vw] w-[26%]">Field</th>
                  <th className="py-[0.7vw] px-[1.2vw]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Book Name</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.title}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Book ID</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.id}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold align-top">Description</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600 leading-relaxed max-w-[45vw]">
                    {currentBook.description}
                  </td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Category</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.category}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Language</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.language}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Total Pages</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.totalPages} Pages</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Created Date</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.createdDate}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Last Updated</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.lastUpdated}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Reports</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.reportsCount}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Visibility</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.visibility}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Publishing Status</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-[#16a34a] font-semibold">{currentBook.status}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 02 Reports / Analytics Section */}
        <div className="space-y-[0.6vw]">
          <div className="flex items-center gap-[0.5vw]">
            <span className="w-[1.4vw] h-[1.4vw] rounded-full border border-[#f87171] text-[#ef4444] text-[0.8vw] font-semibold flex items-center justify-center">
              02
            </span>
            <h3 className="text-[1.1vw] font-semibold text-[#ef4444]">Reports / Analytics</h3>
          </div>

          <div className="bg-white rounded-[0.75vw] border border-gray-100 shadow-xs overflow-hidden">
            <table className="w-full text-left text-[0.8vw]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[0.7vw] font-semibold text-gray-900">
                  <th className="py-[0.7vw] px-[1.2vw] w-[26%]">Field</th>
                  <th className="py-[0.7vw] px-[1.2vw]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Total Views</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.stats.totalViews}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Ratings</td>
                  <td className="py-[0.65vw] px-[1.2vw]">
                    {renderStars(currentBook.stats.rating)}
                  </td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Reviews</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.stats.reviews}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Unique Readers</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.stats.uniqueReaders}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Average Reading Time</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.stats.avgReadingTime}</td>
                </tr>
                <tr>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-900 font-semibold">Downloads</td>
                  <td className="py-[0.65vw] px-[1.2vw] text-gray-600">{currentBook.stats.downloads}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 03 Activity History Section */}
        <div className="space-y-[0.8vw]">
          <div className="flex items-center gap-[0.5vw]">
            <span className="w-[1.4vw] h-[1.4vw] rounded-full border border-[#f87171] text-[#ef4444] text-[0.8vw] font-semibold flex items-center justify-center">
              03
            </span>
            <h3 className="text-[1.1vw] font-semibold text-[#ef4444]">Activity History</h3>
          </div>

          <div className="bg-white rounded-[0.75vw] border border-gray-100 shadow-xs p-[1.2vw] space-y-[1.2vw]">
            {/* Filter toolbar inside Activity History */}
            <div className="flex items-center justify-between pb-[0.6vw] border-b border-gray-100">
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className="inline-flex items-center gap-[0.45vw] text-[0.7vw] font-semibold text-gray-600 bg-white border border-gray-200/90 rounded-full px-[0.9vw] py-[0.38vw] shadow-xs hover:border-gray-300"
                >
                  <Filter size="0.75vw" className="text-[#ec5137]" />
                  <span>Filter by - {activityFilter}</span>
                  <ChevronDown size="0.7vw" className="text-gray-400 ml-[0.2vw]" />
                </button>
              </div>

              <button className="text-[#ef4444] hover:text-[#dc2626] p-[0.3vw] cursor-pointer">
                <Calendar size="0.95vw" />
              </button>
            </div>

            {/* Timeline Activities */}
            <div className="space-y-[1.2vw]">
              {/* Group 1: Today · 13 November 2026 */}
              <div className="space-y-[0.8vw]">
                <h4 className="text-[0.8vw] font-semibold text-gray-900">
                  Today · <span className="font-semibold text-gray-700">13 November 2026</span>
                </h4>

                <div className="relative pl-[1.8vw] space-y-[1vw] before:absolute before:left-[0.6vw] before:top-[0.6vw] before:bottom-[0.6vw] before:w-[1px] before:bg-gray-200">
                  {/* Flipbook Updated */}
                  <div className="relative flex items-center justify-between group">
                    <div className="absolute -left-[1.8vw] w-[1.2vw] h-[1.2vw] rounded-full bg-white border border-amber-400 flex items-center justify-center">
                      <div className="w-[0.55vw] h-[0.55vw] rounded-full bg-amber-400" />
                    </div>

                    <div className="flex items-center gap-[0.8vw]">
                      <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                        <Edit size="0.8vw" />
                      </div>
                      <div>
                        <h5 className="text-[0.8vw] font-semibold text-gray-900">Flipbook Updated</h5>
                        <p className="text-[0.7vw] text-gray-400">Updated book pages and product descriptions.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-[0.8vw]">
                      <span className="text-[0.7vw] text-gray-400">11:30 AM</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size="0.85vw" />
                      </button>
                    </div>
                  </div>

                  {/* Visibility Changed */}
                  <div className="relative flex items-center justify-between group">
                    <div className="absolute -left-[1.8vw] w-[1.2vw] h-[1.2vw] rounded-full bg-white border border-blue-500 flex items-center justify-center">
                      <div className="w-[0.55vw] h-[0.55vw] rounded-full bg-blue-500" />
                    </div>

                    <div className="flex items-center gap-[0.8vw]">
                      <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                        <Eye size="0.8vw" />
                      </div>
                      <div>
                        <h5 className="text-[0.8vw] font-semibold text-gray-900">Visibility Changed</h5>
                        <p className="text-[0.7vw] text-gray-400">Changed visibility from Private to Public.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-[0.8vw]">
                      <span className="text-[0.7vw] text-gray-400">09:15 AM</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size="0.85vw" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: 12 November 2026 */}
              <div className="space-y-[0.8vw] pt-[0.4vw]">
                <h4 className="text-[0.8vw] font-semibold text-gray-900">12 November 2026</h4>

                <div className="relative pl-[1.8vw] space-y-[1vw] before:absolute before:left-[0.6vw] before:top-[0.6vw] before:bottom-[0.6vw] before:w-[1px] before:bg-gray-200">
                  {/* Flipbook Shared */}
                  <div className="relative flex items-center justify-between group">
                    <div className="absolute -left-[1.8vw] w-[1.2vw] h-[1.2vw] rounded-full bg-white border border-indigo-500 flex items-center justify-center">
                      <div className="w-[0.55vw] h-[0.55vw] rounded-full bg-indigo-500" />
                    </div>

                    <div className="flex items-center gap-[0.8vw]">
                      <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                        <Share2 size="0.8vw" />
                      </div>
                      <div>
                        <h5 className="text-[0.8vw] font-semibold text-gray-900">Flipbook Shared</h5>
                        <p className="text-[0.7vw] text-gray-400">Shared flipbook using public link.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-[0.8vw]">
                      <span className="text-[0.7vw] text-gray-400">10:30 AM</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size="0.85vw" />
                      </button>
                    </div>
                  </div>

                  {/* Flipbook Published */}
                  <div className="relative flex items-center justify-between group">
                    <div className="absolute -left-[1.8vw] w-[1.2vw] h-[1.2vw] rounded-full bg-white border border-emerald-500 flex items-center justify-center">
                      <div className="w-[0.55vw] h-[0.55vw] rounded-full bg-emerald-500" />
                    </div>

                    <div className="flex items-center gap-[0.8vw]">
                      <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size="0.8vw" />
                      </div>
                      <div>
                        <h5 className="text-[0.8vw] font-semibold text-gray-900">Flipbook Published</h5>
                        <p className="text-[0.7vw] text-gray-400">Successfully published to explore.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-[0.8vw]">
                      <span className="text-[0.7vw] text-gray-400">09:15 AM</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size="0.85vw" />
                      </button>
                    </div>
                  </div>

                  {/* Flipbook Created */}
                  <div className="relative flex items-center justify-between group">
                    <div className="absolute -left-[1.8vw] w-[1.2vw] h-[1.2vw] rounded-full bg-white border border-red-500 flex items-center justify-center">
                      <div className="w-[0.55vw] h-[0.55vw] rounded-full bg-red-500" />
                    </div>

                    <div className="flex items-center gap-[0.8vw]">
                      <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#ef4444]">
                        <BookOpen size="0.8vw" />
                      </div>
                      <div>
                        <h5 className="text-[0.8vw] font-semibold text-gray-900">Flipbook Created</h5>
                        <p className="text-[0.7vw] text-gray-400">Created a new flipbook using a template.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-[0.8vw]">
                      <span className="text-[0.7vw] text-gray-400">08:00 AM</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size="0.85vw" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Load More Activities */}
              <div className="text-center pt-[0.4vw]">
                <button className="inline-flex items-center gap-[0.3vw] text-[0.7vw] font-semibold text-[#ef4444] hover:underline cursor-pointer">
                  <span>Load More Activities</span>
                  <ChevronDown size="0.75vw" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flipbook Actions Bottom Section */}
        <div className="space-y-[0.6vw] pt-[0.6vw]">
          <div>
            <h3 className="text-[1.1vw] font-semibold text-[#ef4444]">Flipbook Actions</h3>
            <p className="text-[0.7vw] text-gray-400">Manage and control this user's flipbook.</p>
          </div>

          <div className="flex items-center justify-between pt-[0.4vw]">
            <button
              onClick={() => {}}
              className="inline-flex items-center gap-[0.45vw] text-[0.8vw] font-semibold text-white bg-[#ef4444] hover:bg-[#dc2626] px-[1.2vw] py-[0.55vw] rounded-[0.4vw] shadow-xs transition cursor-pointer"
            >
              <Eye size="0.8vw" />
              <span>View Book</span>
            </button>

            <div className="flex items-center gap-[0.8vw]">
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-[0.45vw] text-[0.8vw] font-semibold text-gray-600 bg-white border border-gray-200/90 hover:bg-gray-50 px-[1.2vw] py-[0.55vw] rounded-[0.4vw] shadow-xs transition cursor-pointer"
              >
                <Send size="0.8vw" className="rotate-[-45deg] text-gray-500" />
                <span>Unpublish Flipbook</span>
              </button>

              <button
                onClick={() => {}}
                className="inline-flex items-center gap-[0.45vw] text-[0.8vw] font-semibold text-[#ef4444] bg-white border border-red-200 hover:bg-red-50/50 px-[1.2vw] py-[0.55vw] rounded-[0.4vw] shadow-xs transition cursor-pointer"
              >
                <Trash2 size="0.8vw" />
                <span>Delete Flipbook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* LIST VIEW (Image 1)                                           */
  /* ------------------------------------------------------------- */
  return (
    <div className="space-y-[1.2vw] font-sans">
      {/* Top Header Card */}
      <div className="bg-white rounded-[0.85vw] border border-gray-100/90 p-[1.2vw] shadow-xs space-y-[1vw]">
        {/* Title & Counters */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[1vw] font-semibold text-gray-900">Flipbooks</h2>
            <p className="text-[0.7vw] text-gray-400 mt-[0.1vw]">All flipbooks created by this user.</p>
          </div>

          <div className="flex items-center gap-[0.6vw]">
            <span className="inline-flex items-center text-[0.8vw] font-semibold text-[#16a34a] bg-[#dcfce7] px-[0.9vw] py-[0.35vw] rounded-[0.4vw]">
              Published : {books.filter(b => b.status === 'Published').length}
            </span>
            <span className="inline-flex items-center text-[0.8vw] font-semibold text-[#eab308] bg-[#fef9c3] px-[0.9vw] py-[0.35vw] rounded-[0.4vw]">
              Draft : {books.filter(b => b.status === 'Draft').length}
            </span>
            <span className="inline-flex items-center text-[0.8vw] font-semibold text-[#ef4444] bg-[#fee2e2] px-[0.9vw] py-[0.35vw] rounded-[0.4vw]">
              Total Books : {books.length}
            </span>
          </div>
        </div>

        {/* Search, Filter by, Sort by Controls */}
        <div className="flex items-center gap-[0.8vw] pt-[0.2vw]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-[20vw]">
            <Search
              size="0.85vw"
              className="absolute left-[0.8vw] top-1/2 -translate-y-1/2 text-[#ef4444]"
            />
            <input
              type="text"
              placeholder="Search by Book Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-[2.2vw] pr-[0.8vw] py-[0.48vw] rounded-full border border-gray-200/90 text-[0.8vw] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-300 shadow-xs"
            />
          </div>

          {/* Filter by - Public */}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-[0.45vw] text-[0.8vw] font-semibold text-gray-600 bg-white border border-gray-200/90 rounded-full px-[0.9vw] py-[0.48vw] shadow-xs hover:border-gray-300"
            >
              <Filter size="0.75vw" className="text-[#ef4444]" />
              <span>Filter by - Public</span>
              <ChevronDown size="0.7vw" className="text-gray-400 ml-[0.3vw]" />
            </button>
          </div>

          {/* Sort by - Newest First */}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-[0.45vw] text-[0.8vw] font-semibold text-gray-600 bg-white border border-gray-200/90 rounded-full px-[0.9vw] py-[0.48vw] shadow-xs hover:border-gray-300"
            >
              <ArrowUpDown size="0.75vw" className="text-[#ef4444]" />
              <span>Sort by - Newest First</span>
              <ChevronDown size="0.7vw" className="text-gray-400 ml-[0.3vw]" />
            </button>
          </div>
        </div>
      </div>

      {/* Flipbooks List Container */}
      <div className="space-y-[0.6vw]">
        {books
          .filter((book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.id.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((book) => (
            <div
              key={book.id}
              onClick={() => setSelectedBookId(book.id)}
              className="bg-white rounded-[0.75vw] border border-gray-100/90 p-[0.9vw] shadow-xs flex items-center justify-between hover:shadow-sm hover:border-gray-200 transition cursor-pointer group"
            >
              {/* Left Side: Thumbnail & Book Meta */}
              <div className="flex items-center gap-[1.2vw]">
                {/* Book Thumbnail */}
                <div className="w-[5.2vw] h-[3.8vw] rounded-[0.4vw] overflow-hidden shrink-0 shadow-xs border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <BookThumbnail
                    book={book}
                    className="w-full h-full"
                    fallbackClassName="text-[0.7vw] font-medium text-gray-400 select-none"
                  />
                </div>

                {/* Book Title & Badges */}
                <div className="space-y-[0.3vw]">
                  <h4 className="text-[0.9vw] font-semibold text-gray-900 leading-tight group-hover:text-[#ef4444] transition">
                    {book.title}
                  </h4>
                  <p className="text-[0.7vw] text-gray-400">
                    {book.id} · Created {book.createdAt}
                  </p>

                  <div className="flex items-center gap-[0.4vw] pt-[0.1vw]">
                    {/* Visibility Tag */}
                    <span className="inline-flex items-center gap-[0.2vw] text-[0.7vw] font-semibold text-[#2563eb] bg-[#eff6ff] px-[0.5vw] py-[0.15vw] rounded-[0.25vw]">
                      <Globe size="0.65vw" />
                      {book.visibility}
                    </span>

                    {/* Status Tag */}
                    <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#16a34a] bg-[#f0fdf4] px-[0.5vw] py-[0.15vw] rounded-[0.25vw]">
                      {book.status}
                    </span>

                    {/* Reports Tag */}
                    <span
                      className={`inline-flex items-center text-[0.7vw] font-semibold ${
                        book.reportsCount > 0 ? 'text-[#ef4444] font-semibold' : 'text-gray-400'
                      }`}
                    >
                      Reports : {book.reportsCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: View More */}
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#ef4444] transition p-[0.4vw]">
                <ChevronRight size="1.2vw" className="text-gray-400 group-hover:text-[#ef4444] transition" />
                <span className="text-[0.7vw] text-gray-400 group-hover:text-[#ef4444] transition mt-[0.1vw]">
                  View More
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
