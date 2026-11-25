import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';

export default function BookThumbnail({
  book,
  className = "w-full h-full",
  fallbackClassName = "text-[0.75vw] font-medium text-gray-400 select-none"
}) {
  const [svgHtml, setSvgHtml] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  // Check if book has a template cover picture configured
  const cp = book?.coverPicture || book?.Customized_Settings?.FlipbookInfo?.coverPicture || book?.Customized_Settings?.coverPicture;
  const isTemplateCover = cp && cp.type === 'template' && cp.bgColor;

  useEffect(() => {
    let isMounted = true;
    setFailed(false);
    setSvgHtml(null);
    setImgSrc(null);

    // 1. Direct static thumbnail image or upload URL
    if (book?.thumbnail && typeof book.thumbnail === 'string' && book.thumbnail.trim()) {
      setImgSrc(book.thumbnail);
      return;
    }
    if (cp?.url && typeof cp.url === 'string' && cp.url.trim()) {
      setImgSrc(cp.url);
      return;
    }

    // 2. Fetch the target page SVG from backend storage
    const userId = book?.userID || book?.userId;
    const bookTitle = book?.title || book?.flipbookName || book?.name;
    const v_id = book?.book_v_id || book?.v_id || book?.id;

    if (!userId || !bookTitle) {
      setFailed(true);
      return;
    }

    // Determine target page number (if cover template specifies selectedPages, use first one)
    let targetPageNum = 1;
    if (Array.isArray(cp?.selectedPages) && cp.selectedPages.length > 0 && cp.selectedPages[0]) {
      targetPageNum = Number(cp.selectedPages[0]) || 1;
    }

    const encodePath = (s) => encodeURIComponent(s);
    const candidateUrls = [
      `/storage/${userId}/books/default/${encodePath(bookTitle)}/pages/Page%20${targetPageNum}.svg`,
      `/storage/${userId}/books/default/${encodePath(bookTitle)}/pages/${targetPageNum}.svg`,
      `/storage/${userId}/books/default/${encodePath(bookTitle)}/pages/Page%201.svg`,
      `/storage/${userId}/books/default/${encodePath(bookTitle)}/pages/1.svg`,
      `/storage/${userId}/books/default/${encodePath(bookTitle)}/Page%201.svg`,
      `/storage/${userId}/books/My_Flipbooks/${encodePath(bookTitle)}/pages/Page%201.svg`,
      v_id ? `/api/flipbook/preview/${v_id}?page=${targetPageNum}` : null
    ].filter(Boolean);

    const tryFetch = async () => {
      for (const url of candidateUrls) {
        if (!isMounted) return;
        try {
          const res = await axios.get(url, { timeout: 4000 });
          if (res.data) {
            if (typeof res.data === 'string' && res.data.includes('<svg')) {
              let cleanSvg = res.data;
              if (cleanSvg.includes('preserveAspectRatio')) {
                cleanSvg = cleanSvg.replace(/preserveAspectRatio=["'][^"']*["']/i, 'preserveAspectRatio="xMidYMid meet"');
              } else {
                cleanSvg = cleanSvg.replace(/<svg\b/i, '<svg preserveAspectRatio="xMidYMid meet" ');
              }
              if (isMounted) {
                setSvgHtml(cleanSvg);
                return;
              }
            } else if (res.data.html && typeof res.data.html === 'string' && res.data.html.includes('<svg')) {
              if (isMounted) {
                setSvgHtml(res.data.html);
                return;
              }
            }
          }
        } catch (_) {
          // Continue to next candidate
        }
      }
      if (isMounted) {
        setFailed(true);
      }
    };

    tryFetch();

    return () => {
      isMounted = false;
    };
  }, [book?.id, book?.v_id, book?.title, book?.flipbookName, book?.userID, cp?.type, cp?.bgColor]);

  // If a direct static image URL is available
  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={book?.title || 'Book'}
        className={`${className} object-cover`}
        onError={() => setFailed(true)}
      />
    );
  }

  // If this book has a configured cover template (like Dual Layer Spread or Landscape Staggered Trio)
  if (isTemplateCover) {
    const bgStyle = cp.bgColor && (cp.bgColor.includes('gradient') || cp.bgColor.startsWith('linear-') || cp.bgColor.startsWith('radial-'))
      ? { backgroundImage: cp.bgColor }
      : { backgroundColor: cp.bgColor || '#F8FAFC' };

    return (
      <div
        className={`${className} relative overflow-hidden flex items-center justify-center p-[0.35vw]`}
        style={bgStyle}
      >
        {/* Render page mockup inside the template cover */}
        <div className="relative w-full h-full flex items-center justify-center">
          {svgHtml ? (
            <div className="relative w-full h-full flex items-center justify-end pr-[0.3vw]">
              {/* Back page card shadow effect */}
              <div className="absolute right-[0.9vw] w-[50%] h-[78%] bg-white/70 rounded-[0.2vw] shadow-md transform -rotate-6" />
              {/* Front main page vector */}
              <div
                className="relative z-10 w-[55%] h-[84%] bg-white rounded-[0.2vw] shadow-xl overflow-hidden flex items-center justify-center border border-black/5 [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500/70">
              <BookOpen size="1vw" strokeWidth={1.5} />
            </div>
          )}

          {/* Cover Titles overlay */}
          <div className="absolute left-[0.4vw] bottom-[0.3vw] z-20 max-w-[42%] text-left pointer-events-none">
            {cp.text1 && (
              <h5
                className="leading-tight font-bold truncate text-[0.45vw]"
                style={{
                  color: cp.text1Color || '#000000',
                  fontFamily: cp.text1FontFamily || 'inherit'
                }}
              >
                {cp.text1}
              </h5>
            )}
            {cp.text2 && (
              <p
                className="leading-tight truncate text-[0.38vw] mt-[0.05vw]"
                style={{
                  color: cp.text2Color || '#000000',
                  fontFamily: cp.text2FontFamily || 'inherit'
                }}
              >
                {cp.text2}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard Flipbook page vector without template wrapper
  if (svgHtml) {
    return (
      <div
        className={`${className} flex items-center justify-center overflow-hidden bg-white [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full`}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
    );
  }

  // Fallback icon
  return (
    <div className="flex flex-col items-center justify-center gap-[0.2vw] text-gray-400 select-none">
      <BookOpen size="1.2vw" strokeWidth={1.5} className="text-gray-300" />
      <span className={fallbackClassName}>
        {book?.bookType?.toUpperCase() || 'Book'}
      </span>
    </div>
  );
}
