import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import FlipbookPreview from '../../components/PageEditor/modals/FlipbookPreview';
import PreloaderOverlay from '../../components/CustomizedEditor/components/PreloaderOverlay';
import { createDefaultPreloaderSettings } from '../../components/CustomizedEditor/utils/defaultSettings';
import { LAYOUT_DEFAULT_COLORS } from '../../components/CustomizedEditor/utils/layoutColors';
import { Icon } from '@iconify/react';
import { Ghost, ArrowLeft, Home, BookOpen, Clock, X, Heart } from 'lucide-react';
import { resolveUploadsPath, rewriteHtmlUploadsToSupabase } from '../../utils/assets/assetUtils';
import { useToast } from '../../components/CustomToast';
import { useAuth } from '../../context/AuthContext';

import WhiteAttachedCurve from './WhiteAttachedCurve';
import BookInfoModal from './BookInfoModal';
import RatingsPanel from './RatingsPanel';
import { AVATAR_COLORS, getAvatarBg, checkInviteAutoExpired } from './shareViewUtils';

const ShareViewBook = () => {
    const { shareId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [bookData, setBookData] = useState(null);
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [, setRetryAttempt] = useState(0);

    const [accessMode, setAccessMode] = useState(null); // null | 'password' | 'login'
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [, setTempSettings] = useState(null);

    // Current Logged-in User via Auth Context
    const { user } = useAuth();
    const currentUserEmail = (user?.emailId || user?.email || '').toLowerCase();
    const currentUserName = user?.name || user?.fullName || user?.username || '';
    const currentUserAvatar = user?.picture || user?.profileImgUrl || '';

    // Sidebar Modals & Panels State
    const [isBookInfoOpen, setIsBookInfoOpen] = useState(false);
    const [isRatingsOpen, setIsRatingsOpen] = useState(false);
    const [editingRatingId, setEditingRatingId] = useState(null);
    const [ratingForm, setRatingForm] = useState({ name: '', rating: 0, review: '' });
    const [ratingFormError, setRatingFormError] = useState({ show: false });
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewsList, setReviewsList] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [isDeletingRating, setIsDeletingRating] = useState(null);

    // View Count State
    const [viewsCount, setViewsCount] = useState(0);

    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        if (!bookData) return;
        const favList = Array.isArray(bookData.isFavorite) ? bookData.isFavorite : [];
        if (currentUserEmail && favList.some(u => String(u).trim().toLowerCase() === currentUserEmail.trim().toLowerCase())) {
            setIsFavorited(true);
        }
    }, [currentUserEmail, bookData]);

    const isBookOwner = Boolean(
        currentUserEmail && bookData && (
            (bookData.userEmail && bookData.userEmail.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()) ||
            (bookData.emailId && bookData.emailId.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()) ||
            (bookData.userObjectID && authUser?._id && String(bookData.userObjectID) === String(authUser._id))
        )
    );

    const handleFavoriteToggle = async () => {
        if (!currentUserEmail) {
            toast.error("Please log in to add books to your favorites.");
            return;
        }
        if (isBookOwner) {
            toast.error("You cannot favorite your own book.");
            return;
        }
        const next = !isFavorited;
        setIsFavorited(next);
        try {
            const backendUrl = getBackendUrl();
            const res = await axios.post(`${backendUrl}/api/flipbook/favorite`, {
                emailId: currentUserEmail,
                v_id: bookData?.v_id || shareId,
                isFavorite: next
            }, { withCredentials: true });
            if (res.data?.success) {
                toast.success(next ? "Added to your Favorites!" : "Removed from your Favorites.");
            } else {
                setIsFavorited(!next);
                toast.error(res.data?.message || "Failed to update favorites.");
            }
        } catch (err) {
            setIsFavorited(!next);
            toast.error(err.response?.data?.message || "Failed to update favorites.");
        }
    };

    // Auto-populate user name from localStorage
    useEffect(() => {
        if (currentUserName) {
            setRatingForm(prev => ({ ...prev, name: prev.name || currentUserName }));
        }
    }, [currentUserName]);

    const handleRatingSubmit = async () => {
        if (!currentUserEmail) {
            navigate(`/?redirect=${encodeURIComponent(location.pathname + location.search)}`);
            return;
        }
        if (!ratingForm.name.trim() || !ratingForm.rating) {
            setRatingFormError({ show: true });
            return;
        }
        setIsSubmittingRating(true);
        try {
            const backendUrl = getBackendUrl();
            const res = await axios.post(`${backendUrl}/api/flipbook/public/rate/${shareId}`, {
                ratingId: editingRatingId,
                name: ratingForm.name.trim(),
                ratingValue: ratingForm.rating,
                review: ratingForm.review.trim(),
                userEmail: currentUserEmail,
                profileImgUrl: currentUserAvatar
            });
            if (res.data?.success) {
                setReviewsList(res.data.bookRating || []);
                setAverageRating(res.data.averageRating || 0);
                setTotalRatings(res.data.totalRatings || 0);
                setEditingRatingId(null);
                setRatingForm({ name: currentUserName || '', rating: 0, review: '' });
                setRatingFormError({ show: false });
            }
        } catch (err) {
            console.error("Error submitting rating:", err);
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handleStartEdit = (review) => {
        setEditingRatingId(review._id);
        setRatingForm({
            name: review.name || currentUserName || '',
            rating: review.ratingValue || review.rating || 5,
            review: review.review || ''
        });
        setHoverRating(0);
        setRatingFormError({ show: false });
    };

    const handleCancelEdit = () => {
        setEditingRatingId(null);
        setRatingForm({ name: currentUserName || '', rating: 0, review: '' });
        setHoverRating(0);
        setRatingFormError({ show: false });
    };

    const handleDeleteRating = async (ratingId) => {
        if (!ratingId) return;
        setIsDeletingRating(ratingId);
        try {
            const backendUrl = getBackendUrl();
            const res = await axios.delete(`${backendUrl}/api/flipbook/public/rate/${shareId}/${ratingId}`);
            if (res.data?.success) {
                setReviewsList(res.data.bookRating || []);
                setAverageRating(res.data.averageRating || 0);
                setTotalRatings(res.data.totalRatings || 0);
                if (editingRatingId === ratingId) {
                    handleCancelEdit();
                }
            }
        } catch (err) {
            console.error("Error deleting rating:", err);
        } finally {
            setIsDeletingRating(null);
        }
    };

    // Live auto-expire timer check while watching book
    useEffect(() => {
        if (!bookData || error) return;

        const vis = bookData.Customized_Settings?.Visibility || bookData.share || {};
        const accessMode = (vis.access || 'public').toLowerCase();

        const email = (user?.emailId || user?.email || '').toLowerCase();
        const isOwner = email && (
            email === (bookData.userEmail || '').toLowerCase() ||
            (user?.userID && user.userID === bookData.userID) ||
            (user?.userId && String(user.userId) === String(bookData.userId))
        );

        if (accessMode.includes('invite') && !isOwner) {
            const autoExpire = vis.inviteOnly?.autoExpire;
            if (autoExpire && autoExpire.enabled) {
                if (checkInviteAutoExpired(autoExpire, bookData.updatedAt || bookData.createdAt)) {
                    setError("Time Expired! The access time granted for this flipbook has expired.");
                    return;
                }

                const interval = setInterval(() => {
                    if (checkInviteAutoExpired(autoExpire, bookData.updatedAt || bookData.createdAt)) {
                        setError("Time Expired! The access time granted for this flipbook has expired.");
                        clearInterval(interval);
                    }
                }, 2000);

                return () => clearInterval(interval);
            }
        }
    }, [bookData, error]);

    const getBackendUrl = () => {
        if (import.meta.env.VITE_BACKEND_URL) {
            return import.meta.env.VITE_BACKEND_URL;
        }
        const origin = window.location.origin;
        if (origin.includes('devtunnels.ms')) {
            return origin.replace('-5173', '-8000');
        }
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            const portMatch = origin.match(/:(\d+)/);
            if (portMatch) {
                return origin.replace(portMatch[0], ':8000');
            }
        }
        return '';
    };

    // Auto-record page view count once per flipbook load for unique viewers
    const hasRecordedViewRef = useRef(false);
    useEffect(() => {
        if (bookData && shareId && !hasRecordedViewRef.current) {
            hasRecordedViewRef.current = true;
            const backendUrl = getBackendUrl();
            let viewerId = '';
            try {
                viewerId = localStorage.getItem('flipbook_viewer_id') || '';
                if (!viewerId) {
                    viewerId = 'v_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
                    localStorage.setItem('flipbook_viewer_id', viewerId);
                }
            } catch {}

            axios.post(`${backendUrl}/api/flipbook/public/view/${shareId}`, {
                userEmail: currentUserEmail || '',
                viewerId: viewerId
            })
                .then(res => {
                    if (res.data?.viewsCount !== undefined) {
                        setViewsCount(res.data.viewsCount);
                    }
                })
                .catch(() => {});
        }
    }, [bookData, shareId, currentUserEmail]);

    // Helper to render dynamic star ratings
    const renderStars = (ratingVal, starClass = "w-[1.2vw] h-[1.2vw]") => {
        const stars = [];
        const rounded = Math.round((ratingVal || 0) * 2) / 2;
        for (let i = 1; i <= 5; i++) {
            if (i <= rounded) {
                stars.push(
                    <svg key={i} className={`${starClass} overflow-visible drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]`} fill="url(#star-gradient)" stroke="url(#star-gradient)" strokeWidth="1" strokeLinejoin="round" viewBox="0 0 20 20">
                        <path d="M10 1L12.7 6.5L19 7.4L14.5 11.8L15.6 18.1L10 15.2L4.4 18.1L5.5 11.8L1 7.4L7.3 6.5Z"></path>
                    </svg>
                );
            } else if (i - 0.5 === rounded) {
                stars.push(
                    <svg key={i} className={`${starClass} overflow-visible drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]`} fill="url(#half-star)" stroke="url(#star-gradient)" strokeWidth="1" strokeLinejoin="round" viewBox="0 0 20 20">
                        <path d="M10 1L12.7 6.5L19 7.4L14.5 11.8L15.6 18.1L10 15.2L4.4 18.1L5.5 11.8L1 7.4L7.3 6.5Z"></path>
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} className={`${starClass} overflow-visible drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]`} fill="white" stroke="url(#star-gradient)" strokeWidth="1" strokeLinejoin="round" viewBox="0 0 20 20">
                        <path d="M10 1L12.7 6.5L19 7.4L14.5 11.8L15.6 18.1L10 15.2L4.4 18.1L5.5 11.8L1 7.4L7.3 6.5Z"></path>
                    </svg>
                );
            }
        }
        return stars;
    };

    const formatDisplayDate = (dateVal) => {
        if (!dateVal) return 'Jun 2026';
        try {
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return 'Jun 2026';
            return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch {
            return 'Jun 2026';
        }
    };

    // Prepare settings fallback & branding/appearance extraction
    const brandingObj = React.useMemo(() => {
        return bookData?.Customized_Settings?.Branding || {};
    }, [bookData]);

    const appearanceObj = React.useMemo(() => {
        const rawApp = bookData?.Customized_Settings?.BookAppearance || bookData?.Customized_Settings?.Appearance || bookData?.settings?.BookAppearance || bookData?.settings?.appearance || {};
        
        let validSpeed = rawApp.flipSpeed || 'Fast';
        if (validSpeed === 'medium') {
           validSpeed = 'Fast';
        } else if (validSpeed === 'Slow' && !rawApp.speedChanged) {
           validSpeed = 'Fast';
        }

        return {
            texture: 'Plain White',
            hardCover: false,
            flipStyle: 'Classic Flip',
            corner: 'Sharp',
            dropShadow: { active: true, color: '#4f4f4fff', opacity: 50, xAxis: 0, yAxis: 0, blur: 0, spread: 0 },
            ...rawApp,
            flipSpeed: validSpeed
        };
    }, [bookData]);

    const backgroundObj = React.useMemo(() => {
        return bookData?.Customized_Settings?.Background || {};
    }, [bookData]);

    const menuBarObj = React.useMemo(() => {
        return bookData?.Customized_Settings?.MenuBar || {};
    }, [bookData]);

    const otherSetupObj = React.useMemo(() => {
        return bookData?.Customized_Settings?.otherSetup || bookData?.Customized_Settings?.othersetup || bookData?.settings?.otherSetup || bookData?.settings?.othersetup || {};
    }, [bookData]);

    const layoutsObj = React.useMemo(() => {
        return bookData?.Customized_Settings?.Layouts || {};
    }, [bookData]);

    const leadFormObj = React.useMemo(() => {
        return bookData?.Customized_Settings?.leadForm || bookData?.Customized_Settings?.leadform || bookData?.settings?.leadForm || bookData?.settings?.leadform || {};
    }, [bookData]);

    const settings = React.useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        const queryLayout = searchParams.get('layout');
        const activeLayout = queryLayout && !isNaN(Number(queryLayout)) ? Number(queryLayout) : (layoutsObj.layoutStyle !== undefined ? layoutsObj.layoutStyle : 1);
        return {
            ...(bookData?.meta || {}),
            FlipbookInfo: bookData?.Customized_Settings?.FlipbookInfo || {},
            Branding: brandingObj,
            Background: backgroundObj,
            MenuBar: menuBarObj,
            Layouts: {
                ...layoutsObj,
                layoutStyle: activeLayout
            },
            BookAppearance: appearanceObj,
            otherSetup: otherSetupObj,
            leadForm: leadFormObj
        };
    }, [bookData, brandingObj, backgroundObj, appearanceObj, menuBarObj, otherSetupObj, layoutsObj, leadFormObj, location.search]);

    const layoutColorVars = React.useMemo(() => {
        if (!bookData) return '';
        const activeIdx = Number(settings?.Layouts?.layoutStyle) || 1;
        const defaults = LAYOUT_DEFAULT_COLORS[activeIdx] || [];
        const layoutColorsObj = settings?.Layouts?.layoutColors;
        const saved = Array.isArray(layoutColorsObj?.[activeIdx]) ? layoutColorsObj[activeIdx] : [];
        const toolbarP = layoutColorsObj?.toolbarColor?.primary;
        const toolbarS = layoutColorsObj?.toolbarColor?.secondary;
        const popupP = layoutColorsObj?.popupColor?.primary;
        const popupS = layoutColorsObj?.popupColor?.secondary;

        const mergedColors = defaults.map((c) => {
            const savedItem = saved.find(s => s && s.id === c.id);
            let hexVal = c.hex;
            if (savedItem && savedItem.hex) {
                hexVal = savedItem.hex;
            } else if (toolbarP && ['toolbar-bg', 'bottom-toolbar-bg', 'page-number-bg'].includes(c.id)) {
                hexVal = toolbarP;
            } else if (toolbarS && ['toolbar-text-main', 'toolbar-icon', 'reset-text', 'page-number-text'].includes(c.id)) {
                hexVal = toolbarS;
            } else if (popupP && ['toc-bg', 'dropdown-bg', 'thumbnail-outer-v2', 'thumbnail-inner-v2', 'toc-overlay'].includes(c.id)) {
                hexVal = popupP;
            } else if (popupS && ['toc-text', 'dropdown-text', 'dropdown-icon', 'toc-icon'].includes(c.id)) {
                hexVal = popupS;
            }

            return {
                ...c,
                ...(savedItem ? savedItem : {}),
                hex: hexVal
            };
        });

        return mergedColors.map((c, i) => {
            const hex = c.hex || '#ffffff';
            const op = (c.opacity ?? 100) / 100;
            const r = parseInt(hex.slice(1, 3), 16) || 0;
            const g = parseInt(hex.slice(3, 5), 16) || 0;
            const b = parseInt(hex.slice(5, 7), 16) || 0;

            const varName = c.id || `layout-color-${i}`;
            return `--${varName}: ${hex}; --${varName}-opacity: ${op}; --${varName}-rgb: ${r},${g},${b};`;
        }).join(' ');
    }, [bookData, settings?.Layouts]);

    const varsObject = React.useMemo(() => {
        if (!layoutColorVars) return {};
        const obj = {};
        layoutColorVars.split(';').forEach(v => {
            if (!v.trim()) return;
            const parts = v.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                obj[key] = value;
            }
        });
        return obj;
    }, [layoutColorVars]);

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 3;
        let cancelled = false;

        const fetchBook = async (passVal = '') => {
            try {
                const backendUrl = getBackendUrl();
                console.log(`Fetching public flipbook: ${shareId} (Attempt ${retryCount + 1}/${maxRetries + 1})`);

                const params = {};
                if (user?.userID) params.userID = user.userID;
                if (user?.userId || user?._id || user?.id) params.userId = user.userId || user._id || user.id;
                if (passVal) {
                    params.password = passVal;
                    params.accessKey = passVal;
                }

                const res = await axios.get(`${backendUrl}/api/flipbook/public/get/${shareId}`, {
                    params,
                    withCredentials: true,
                    timeout: 15000 // 15s timeout for slow connections
                });

                if (cancelled) return;

                let processedData = res.data;

                // Normalize settings keys and fix relative image URLs for the public view
                if (processedData?.settings) {
                    if (processedData.settings.otherSetup && !processedData.settings.othersetup) {
                        processedData.settings.othersetup = processedData.settings.otherSetup;
                    }

                    // Fix gallery image URLs if they are relative
                    if (processedData.settings.othersetup?.gallery?.images) {
                        processedData.settings.othersetup.gallery.images = processedData.settings.othersetup.gallery.images.map(imgUrl => {
                            if (typeof imgUrl === 'string' && imgUrl.startsWith('/uploads/')) {
                                return resolveUploadsPath(imgUrl);
                            }
                            return imgUrl;
                        });
                    }
                }

                // Extract and set tempSettings immediately so the custom preloader works while image preloading happens
                const extractedSettings = {
                    ...(processedData?.meta || {}),
                    ...(processedData?.Customized_Settings || {}),
                    ...(processedData?.settings || {}),
                    preloader: processedData?.Customized_Settings?.Branding?.preloaderSettings || processedData?.settings?.Branding?.preloaderSettings || processedData?.settings?.preloader || processedData?.settings?.preloaderSettings || processedData?.meta?.preloaderSettings
                };
                setTempSettings(extractedSettings);

                if (!processedData || !processedData.pages || processedData.pages.length === 0) {
                    throw new Error("Invalid or empty flipbook data received");
                }

                const bUrl = processedData.meta?.baseUrl
                    ? resolveUploadsPath(processedData.meta.baseUrl)
                    : '';

                if (processedData.pages) {
                    processedData.pages = processedData.pages.filter(p => String(p.hide) !== '1' && p.isHidden !== true && String(p.isHidden) !== 'true').map(p => {
                        let html = p.html || p.content || '';

                        if (bUrl) {
                            if (html.includes('../assets/')) html = html.split('../assets/').join(`${bUrl}assets/`);
                            if (html.includes('./assets/')) html = html.split('./assets/').join(`${bUrl}assets/`);
                            if (html.includes('nullassets/')) html = html.split('nullassets/').join(`${bUrl}assets/`);
                            html = html.replace(/(src|href|xlink:href)=(['"])(?:\.\.\/|\.\/)?assets\//gi, `$1=$2${bUrl}assets/`);
                        }

                        // Rewrite all /uploads/ to Supabase CDN URLs if configured
                        html = rewriteHtmlUploadsToSupabase(html);

                        return { ...p, html };
                    });
                    // Images load naturally as pages are viewed — no preloading block needed
                }

                // Sync URL path to match actual access mode (e.g. /share=public/ vs /share=private/)
                const rawAccMode = String(processedData?.Visibility?.access || processedData?.share?.access || 'public').toLowerCase();
                let targetPrefix = 'share=public';
                if (rawAccMode.includes('private')) targetPrefix = 'share=private';
                else if (rawAccMode.includes('password')) targetPrefix = 'share=password';
                else if (rawAccMode.includes('invite')) targetPrefix = 'share=invite';

                const expectedPath = `/${targetPrefix}/${shareId}`;
                if (location.pathname !== expectedPath) {
                    navigate(`${expectedPath}${location.search}`, { replace: true });
                }

                // Only update state if the component is still mounted
                setBookData(processedData);
                setReviewsList(processedData.bookRating || []);
                const bRatings = processedData.bookRating || [];
                const bTotal = processedData.totalRatings !== undefined ? processedData.totalRatings : bRatings.length;
                const bAvg = processedData.averageRating !== undefined ? processedData.averageRating : (bTotal > 0 ? Number((bRatings.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / bTotal).toFixed(1)) : 0);
                setAverageRating(bAvg);
                setTotalRatings(bTotal);
                if (processedData.viewsCount !== undefined) setViewsCount(processedData.viewsCount);
                setError(null);
                setAccessMode(null);
                setLoading(false);

                // Dynamically update document title and OpenGraph / Twitter meta tags in client head
                try {
                    const bTitle = processedData.flipbookName || processedData.meta?.flipbookName || 'Flipbook';
                    document.title = `${bTitle} | FlipiBook`;

                    const setMetaTag = (attr, key, content) => {
                        if (!content) return;
                        let tag = document.querySelector(`meta[${attr}="${key}"]`);
                        if (!tag) {
                            tag = document.createElement('meta');
                            tag.setAttribute(attr, key);
                            document.head.appendChild(tag);
                        }
                        tag.setAttribute('content', content);
                    };

                    const bDesc = processedData.FlipbookInfo?.quotes ||
                        processedData.meta?.quotes ||
                        processedData.FlipbookInfo?.about ||
                        processedData.meta?.about ||
                        'View and interact with this flipbook online on FlipiBook.';

                    let coverImgUrl = processedData.coverPicture?.url ||
                        processedData.Customized_Settings?.coverPicture?.url ||
                        processedData.thumbnail ||
                        '';

                    if (!coverImgUrl) {
                        const effectiveBackend = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');
                        coverImgUrl = `${effectiveBackend}/api/customized-editor/preview-image/${shareId}`;
                    }

                    setMetaTag('property', 'og:title', bTitle);
                    setMetaTag('property', 'og:description', bDesc);
                    setMetaTag('property', 'og:image', coverImgUrl);
                    setMetaTag('property', 'og:url', window.location.href);
                    setMetaTag('name', 'twitter:title', bTitle);
                    setMetaTag('name', 'twitter:description', bDesc);
                    setMetaTag('name', 'twitter:image', coverImgUrl);
                } catch (metaErr) {
                    console.warn('[ShareViewBook] Failed to update meta tags:', metaErr);
                }
            } catch (err) {
                if (cancelled) return;
                console.error(`Error fetching public flipbook (attempt ${retryCount + 1}):`, err);

                const status = err.response?.status;
                const errData = err.response?.data || {};

                // Auto-sync URL path if visibility mode changed on backend
                const errAccMode = String(errData.accessMode || (errData.isPrivate ? 'private' : errData.isPasswordProtected ? 'password' : errData.isInviteOnly ? 'invite' : '')).toLowerCase();
                if (errAccMode) {
                    let targetPrefix = 'share=public';
                    if (errAccMode.includes('private')) targetPrefix = 'share=private';
                    else if (errAccMode.includes('password')) targetPrefix = 'share=password';
                    else if (errAccMode.includes('invite')) targetPrefix = 'share=invite';

                    const expectedPath = `/${targetPrefix}/${shareId}`;
                    if (location.pathname !== expectedPath) {
                        navigate(`${expectedPath}${location.search}`, { replace: true });
                    }
                }

                // Retry on network errors or 5xx server errors â€” keep loading=true
                const isRetryable = !err.response || status >= 500;
                if (retryCount < maxRetries && isRetryable) {
                    retryCount++;
                    setRetryAttempt(retryCount); // Show retry progress in UI
                    const delay = Math.pow(2, retryCount - 1) * 1000;
                    console.log(`Retrying in ${delay}ms...`);
                    setTimeout(() => fetchBook(passVal), delay);
                    return; // â¬…ï¸ Keep loading=true while retry is pending
                }

                // Populate preview book data if returned by backend for background blur effect
                if (errData.pages || errData.bookName) {
                    setBookData({
                        flipbookName: errData.bookName || 'Protected Flipbook',
                        pages: (errData.pages || []).filter(p => String(p.hide) !== '1' && p.isHidden !== true && String(p.isHidden) !== 'true'),
                        meta: errData.meta || {},
                        Customized_Settings: errData.Customized_Settings || {}
                    });
                }

                // Handle access control statuses
                if (status === 401 || errData.isPasswordProtected) {
                    setAccessMode('password');
                    setError(null);
                    setLoading(false);
                    return;
                }

                if (status === 403) {
                    if (errData.isPrivate) {
                        setError(errData.message || "This flipbook is private. Only the author can view this book.");
                        setLoading(false);
                        return;
                    }
                    if (errData.isInviteOnly) {
                        if (errData.isExpired) {
                            setError(errData.message || "Time Expired! The access time granted for this flipbook has expired.");
                            setLoading(false);
                            return;
                        }
                        if (!currentUserEmail) {
                            setAccessMode('login');
                            setError(null);
                            setLoading(false);
                            return;
                        } else {
                            setError(errData.message || "This flipbook has invite-only access. Your email is not authorized to access this book.");
                            setLoading(false);
                            return;
                        }
                    }
                    if (errData.isUnpublished) {
                        setError(errData.message || "This Flipbook not Yet Published");
                        setLoading(false);
                        return;
                    }
                    setError(errData.message || "This flipbook is private.");
                } else if (status === 404) {
                    setError("Flipbook not found.");
                } else {
                    setError(errData.message || "Flipbook not found or private.");
                }
                setLoading(false); // âœ… Stop loading only after all retries fail
            }
        };

        if (shareId) fetchBook();

        return () => { cancelled = true; }; // Cleanup to prevent state updates after unmount
    }, [shareId, currentUserEmail]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!passwordInput.trim()) {
            setPasswordError("Please enter access key.");
            return;
        }
        setPasswordError('');
        setIsSubmittingPassword(true);
        try {
            const backendUrl = getBackendUrl();
            const params = {
                accessKey: passwordInput.trim(),
                password: passwordInput.trim()
            };
            if (user?.userID) params.userID = user.userID;
            if (user?.userId || user?._id || user?.id) params.userId = user.userId || user._id || user.id;

            const res = await axios.get(`${backendUrl}/api/flipbook/public/get/${shareId}`, {
                params,
                withCredentials: true
            });

            let processedData = res.data;
            if (processedData?.settings) {
                if (processedData.settings.otherSetup && !processedData.settings.othersetup) {
                    processedData.settings.othersetup = processedData.settings.otherSetup;
                }
            }
            if (processedData.pages) {
                const bUrl = processedData.meta?.baseUrl ? resolveUploadsPath(processedData.meta.baseUrl) : '';
                processedData.pages = processedData.pages.filter(p => String(p.hide) !== '1' && p.isHidden !== true && String(p.isHidden) !== 'true').map(p => {
                    let html = p.html || p.content || '';
                    if (bUrl) {
                        if (html.includes('../assets/')) html = html.split('../assets/').join(`${bUrl}assets/`);
                        if (html.includes('./assets/')) html = html.split('./assets/').join(`${bUrl}assets/`);
                        if (html.includes('nullassets/')) html = html.split('nullassets/').join(`${bUrl}assets/`);
                        html = html.replace(/(src|href|xlink:href)=(['"])(?:\.\.\/|\.\/)?assets\//gi, `$1=$2${bUrl}assets/`);
                    }
                    html = rewriteHtmlUploadsToSupabase(html);
                    return { ...p, html };
                });
            }

            setBookData(processedData);
            setReviewsList(processedData.bookRating || []);
            const bRatings = processedData.bookRating || [];
            const bTotal = processedData.totalRatings !== undefined ? processedData.totalRatings : bRatings.length;
            const bAvg = processedData.averageRating !== undefined ? processedData.averageRating : (bTotal > 0 ? Number((bRatings.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / bTotal).toFixed(1)) : 0);
            setAverageRating(bAvg);
            setTotalRatings(bTotal);
            if (processedData.viewsCount !== undefined) setViewsCount(processedData.viewsCount);
            setAccessMode(null);
            setError(null);
        } catch (err) {
            setPasswordError(err.response?.data?.message || "Invalid Access Key.");
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    // Analytics tracking for viewer sessions
    useEffect(() => {
        if (!bookData || !bookData.v_id || accessMode !== null) return;

        const backendUrl = getBackendUrl();
        const v_id = bookData.v_id;
        const totalPages = bookData.pages?.length || 1;
        const flipbookName = bookData.meta?.flipbookName || bookData.flipbookName || 'Untitled Flipbook';

        const storageKey = `flipi_sess_${v_id}`;
        let sessionId = sessionStorage.getItem(storageKey);
        if (!sessionId) {
            sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            sessionStorage.setItem(storageKey, sessionId);
        }
        sessionStorage.setItem('flipi_current_sess', sessionId);

        const sessionStartTime = Date.now();
        let currentDuration = 0;

        // 1. Session start
        const sendSessionStart = (publicIp = '') => {
            axios.post(`${backendUrl}/api/analytics/session-start`, {
                sessionId,
                v_id,
                shareId: shareId || bookData?.Customized_Settings?.Visibility?.shareId || bookData?.Visibility?.shareId || '',
                flipbookName,
                userEmail: bookData.userEmail || '',
                totalPages,
                clientIp: publicIp,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
                referrer: typeof document !== 'undefined' ? document.referrer : ''
            }).catch(err => {
                console.warn('[Analytics session-start warning]:', err?.message);
            });
        };

        // If running locally, fetch real outward-facing VPN/network IP so VPN location is detected accurately
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            fetch('https://api.ipify.org?format=json')
                .then(r => r.json())
                .then(data => sendSessionStart(data?.ip || ''))
                .catch(() => sendSessionStart(''));
        } else {
            sendSessionStart('');
        }

        // 2. Periodic heartbeat
        const intervalId = setInterval(() => {
            currentDuration = Math.round((Date.now() - sessionStartTime) / 1000);
            axios.post(`${backendUrl}/api/analytics/heartbeat`, {
                sessionId,
                durationSeconds: currentDuration,
                currentPage: 1
            }).catch(() => {});
        }, 20000);

        // 3. Unload / Session end
        const handleUnload = () => {
            const finalDuration = Math.round((Date.now() - sessionStartTime) / 1000);
            const endPayload = JSON.stringify({
                sessionId,
                durationSeconds: finalDuration,
                currentPage: 1
            });
            if (navigator.sendBeacon) {
                const blob = new Blob([endPayload], { type: 'application/json' });
                navigator.sendBeacon(`${backendUrl}/api/analytics/session-end`, blob);
            } else {
                axios.post(`${backendUrl}/api/analytics/session-end`, JSON.parse(endPayload)).catch(() => {});
            }
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('beforeunload', handleUnload);
            handleUnload();
        };
    }, [bookData?.v_id, accessMode, shareId]);

    const isMobileDevice = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (loading) return (
        <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, backgroundColor: '#22252A' }}>
            <PreloaderOverlay
                isLoading={true}
                preloaderSettings={tempSettings?.preloader || createDefaultPreloaderSettings()}
            />
        </div>
    );

    if (accessMode === 'password') return (
        <div onContextMenu={(e) => e.preventDefault()} className="relative w-screen h-screen overflow-hidden select-none bg-slate-950">
            {/* Background Flipbook with Blur */}
            {bookData && bookData.pages && bookData.pages.length > 0 ? (
                <div className="absolute inset-0 filter blur-[10px] opacity-40 scale-105 pointer-events-none overflow-hidden select-none" style={varsObject}>
                    <style>{`:root { ${layoutColorVars} }`}</style>
                    <FlipbookPreview
                        pages={bookData.pages}
                        pageName={bookData.meta?.flipbookName || bookData.flipbookName || 'Protected Flipbook'}
                        settings={{ ...(bookData.meta || {}), ...settings, userEmail: bookData.userEmail || bookData.meta?.userEmail }}
                        isMobile={isMobileDevice}
                        onClose={null}
                        baseUrl={bookData.meta?.baseUrl ? `${getBackendUrl()}${bookData.meta.baseUrl}` : null}
                        isPublishedPreview={true}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-80"></div>
            )}

            {/* Dark Overlay & Protected Flipbook Modal */}
            <div className="fixed inset-0 z-[99999] w-full min-h-screen flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-slate-900 font-sans p-[1vw] select-none animate-in fade-in duration-200">
                <div className="bg-white rounded-[1.2vw] p-[1.4vw] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] w-[25vw] min-w-[320px] max-w-[420px] border border-white/20 animate-in zoom-in-95 duration-200">
                    {/* Lock Badge */}
                    <div className="w-[3.2vw] h-[3.2vw] min-w-[44px] min-h-[44px] rounded-[0.8vw] bg-[#EEEDFF] border border-[#5551FF]/15 flex items-center justify-center mx-auto mb-[1vw]">
                        <Icon icon="lucide:lock" className="w-[1.6vw] h-[1.6vw] min-w-[22px] min-h-[22px] text-[#5551FF]" />
                    </div>

                    {/* Title & Subtitle */}
                    <div className="text-center space-y-[0.2vw] mb-[1.2vw]">
                        <h1 className="text-[1.2vw] min-text-[18px] font-extrabold text-slate-900 tracking-tight">Protected Flipbook</h1>
                        <p className="text-[0.72vw] text-slate-500 font-normal leading-relaxed max-w-[90%] mx-auto">
                            Enter the access key to view this flipbook.
                        </p>
                    </div>

                    {/* Password / Key Form */}
                    <form onSubmit={handlePasswordSubmit} className="space-y-[0.8vw]">
                        <div className="space-y-[0.35vw]">
                            <label className="text-[0.78vw] font-semibold text-gray-900 block text-left">Access Key</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwordInput}
                                    onChange={(e) => {
                                        setPasswordInput(e.target.value);
                                        if (passwordError) setPasswordError('');
                                    }}
                                    placeholder="Enter Access Key..."
                                    className="w-full bg-white border border-gray-300 rounded-[0.5vw] px-[0.8vw] py-[0.55vw] text-[0.78vw] font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5551FF] focus:ring-2 focus:ring-[#5551FF]/10 transition-all pr-[2.2vw] shadow-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-[0.7vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    <Icon icon={showPassword ? "lucide:eye" : "lucide:eye-off"} className="w-[1vw] h-[1vw] min-w-[14px] min-h-[14px]" />
                                </button>
                            </div>
                            {passwordError && (
                                <p className="text-[0.7vw] text-red-500 font-medium pt-[0.1vw]">{passwordError}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmittingPassword}
                            className="w-full bg-black hover:bg-gray-900 active:scale-[0.99] text-white py-[0.55vw] rounded-[0.5vw] text-[0.78vw] font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-[0.4vw] mt-[0.6vw]"
                        >
                            {isSubmittingPassword ? (
                                <div className="animate-spin rounded-full h-[0.9vw] w-[0.9vw] min-h-[14px] min-w-[14px] border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <Icon icon="lucide:key-round" className="w-[0.9vw] h-[0.9vw] min-w-[14px] min-h-[14px]" />
                                    <span>Unlock Flipbook</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    if (accessMode === 'login') return (
        <div onContextMenu={(e) => e.preventDefault()} className="relative w-screen h-screen overflow-hidden select-none bg-slate-950">
            {/* Background Flipbook with Blur */}
            {bookData && bookData.pages && bookData.pages.length > 0 ? (
                <div className="absolute inset-0 filter blur-[10px] opacity-40 scale-105 pointer-events-none overflow-hidden select-none" style={varsObject}>
                    <style>{`:root { ${layoutColorVars} }`}</style>
                    <FlipbookPreview
                        pages={bookData.pages}
                        pageName={bookData.meta?.flipbookName || bookData.flipbookName || 'Invited Access Only'}
                        settings={{ ...(bookData.meta || {}), ...settings, userEmail: bookData.userEmail || bookData.meta?.userEmail }}
                        isMobile={isMobileDevice}
                        onClose={null}
                        baseUrl={bookData.meta?.baseUrl ? `${getBackendUrl()}${bookData.meta.baseUrl}` : null}
                        isPublishedPreview={true}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-80"></div>
            )}

            {/* Dark Overlay & Invited Access Card */}
            <div className="fixed inset-0 z-[99999] w-full min-h-screen flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-slate-900 font-sans p-[1vw] select-none animate-in fade-in duration-200">
                <div className="bg-white rounded-[1.2vw] p-[1.4vw] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] w-[25vw] min-w-[320px] max-w-[420px] border border-white/20 animate-in zoom-in-95 duration-200 text-center">
                    {/* Badge */}
                    <div className="w-[3.2vw] h-[3.2vw] min-w-[44px] min-h-[44px] rounded-[0.8vw] bg-[#EEEDFF] border border-[#5551FF]/15 flex items-center justify-center mx-auto mb-[1vw]">
                        <Icon icon="lucide:user-check" className="w-[1.6vw] h-[1.6vw] min-w-[22px] min-h-[22px] text-[#5551FF]" />
                    </div>

                    {/* Title & Description */}
                    <h1 className="text-[1.2vw] min-text-[18px] font-extrabold text-slate-900 tracking-tight">Invited Access Only</h1>
                    <p className="text-[0.72vw] text-slate-500 font-normal mt-[0.3vw] leading-relaxed max-w-[90%] mx-auto">
                        This flipbook is restricted to invited readers. Please log in with your invited email address to view this book.
                    </p>

                    {/* Buttons */}
                    <div className="mt-[1.2vw] space-y-[0.6vw]">
                        <button
                            onClick={() => navigate(`/?redirect=${encodeURIComponent(location.pathname + location.search)}`)}
                            className="w-full bg-black hover:bg-gray-900 active:scale-[0.99] text-white py-[0.55vw] rounded-[0.5vw] text-[0.78vw] font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-[0.4vw]"
                        >
                            <Icon icon="lucide:log-in" className="w-[0.9vw] h-[0.9vw] min-w-[14px] min-h-[14px]" />
                            <span>Log In to Access</span>
                        </button>

                        <button
                            onClick={() => navigate(`/signup?redirect=${encodeURIComponent(location.pathname + location.search)}`)}
                            className="w-full bg-white border border-gray-300 text-slate-800 hover:bg-gray-50 active:scale-[0.99] py-[0.55vw] rounded-[0.5vw] text-[0.78vw] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-[0.4vw]"
                        >
                            <Icon icon="lucide:user-plus" className="w-[0.9vw] h-[0.9vw] min-w-[14px] min-h-[14px]" />
                            <span>Sign Up to Access</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error || !bookData) return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-slate-950 font-sans selection:bg-slate-900 selection:text-white relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            <div className="relative z-10 w-full max-w-[40vw] px-[2vw] text-center">
                <div className="inline-flex items-center justify-center p-[0.75vw] mb-[2.5vw] rounded-[1vw] bg-slate-50 border border-slate-100 shadow-sm">
                    {error && error.toLowerCase().includes('time expired') ? (
                        <Clock className="w-[2.5vw] h-[2.5vw] text-red-500" strokeWidth={1.5} />
                    ) : error && (error === "This flipbook is private." || error.toLowerCase().includes('private')) ? (
                        <Icon icon="lucide:lock" className="w-[2.5vw] h-[2.5vw] text-slate-800" />
                    ) : error && error.toLowerCase().includes('published') ? (
                        <Icon icon="lucide:eye-off" className="w-[2.5vw] h-[2.5vw] text-slate-800" />
                    ) : (
                        <Ghost className="w-[2.5vw] h-[2.5vw] text-slate-900" strokeWidth={1.5} />
                    )}
                </div>

                <div className="space-y-[1.5vw]">
                    <div className="space-y-[0.5vw]">
                        <p className="text-[0.875vw] font-bold tracking-[0.2em] uppercase text-slate-400">
                            {error && error.toLowerCase().includes('time expired')
                                ? "Access Expired"
                                : error && (error === "This flipbook is private." || error.toLowerCase().includes('private'))
                                    ? "Access Denied"
                                    : error && error.toLowerCase().includes('published')
                                        ? "Unpublished"
                                        : "Error 404"}
                        </p>
                        <h1 className="text-[3.5vw] font-extrabold tracking-tight text-slate-900 leading-tight">
                            {error && error.toLowerCase().includes('time expired')
                                ? "Access Expired"
                                : error && (error === "This flipbook is private." || error.toLowerCase().includes('private'))
                                    ? "This Flipbook is Private"
                                    : error && error.toLowerCase().includes('published')
                                        ? "This Flipbook is Not Yet Published"
                                        : error || "Flipbook Not Found"}
                        </h1>
                    </div>

                    <p className="text-[1.125vw] text-slate-500 leading-relaxed max-w-[30vw] mx-auto">
                        {error && error.toLowerCase().includes('time expired')
                            ? "The access time granted for this flipbook has expired. Please ask the owner to grant you a new invitation."
                            : error && (error === "This flipbook is private." || error.toLowerCase().includes('private'))
                                ? "This flipbook has been set to private by its owner and is not accessible to public readers."
                                : error && error.toLowerCase().includes('published')
                                    ? "This flipbook has not been published by its creator yet. Please check back later."
                                    : "Sorry, we couldn't find the flipbook you're looking for. It might have been deleted or the link is invalid."}
                    </p>
                </div>

                <div className="mt-[3vw] flex flex-col sm:flex-row items-center justify-center gap-[1vw]">
                    {/* Try Again â€” only for non-permanent errors (network/server issues) */}
                    {error && !error.toLowerCase().includes('private') && !error.toLowerCase().includes('expired') && !error.toLowerCase().includes('published') && !error.toLowerCase().includes('not found') && (
                        <button
                            onClick={() => window.location.reload()}
                            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-[0.5vw] px-[2vw] py-[1vw] bg-[#4A3AFF] text-white font-semibold rounded-full hover:bg-[#3a2aef] transition-all duration-300 shadow-xl shadow-indigo-200 active:scale-95 overflow-hidden text-[1vw]"
                        >
                            <span>Try Again</span>
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/home')}
                        className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-[0.5vw] px-[2vw] py-[1vw] bg-slate-950 text-white font-semibold rounded-full hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95 overflow-hidden text-[1vw]"
                    >
                        <Home className="w-[1.25vw] h-[1.25vw]" />
                        <span>Back to Home</span>
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-[0.5vw] px-[2vw] py-[1vw] bg-white text-slate-600 font-semibold rounded-full border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 active:scale-95 text-[1vw]"
                    >
                        <ArrowLeft className="w-[1.25vw] h-[1.25vw] transition-transform group-hover:-translate-x-[0.25vw]" />
                        <span>Go back</span>
                    </button>
                </div>

                <div className="mt-[6vw] pt-[3vw] border-t border-slate-100">
                    <div className="flex flex-col items-center gap-[1vw]">
                        <div className="flex items-center gap-[0.5vw] text-slate-400">
                            <span className="text-[0.75vw] font-semibold uppercase tracking-widest text-slate-300">Navigation Error</span>
                        </div>
                        <p className="text-[0.75vw] text-slate-400">
                            Â© 2026 Fisto IDC. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!bookData.pages || bookData.pages.length === 0) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-slate-950 font-sans selection:bg-slate-900 selection:text-white relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

                <div className="relative z-10 w-full max-w-[40vw] px-[2vw] text-center">
                    <div className="inline-flex items-center justify-center p-[0.75vw] mb-[2.5vw] rounded-[1vw] bg-amber-50 border border-amber-100 shadow-sm">
                        <BookOpen className="w-[2.5vw] h-[2.5vw] text-amber-600" strokeWidth={1.5} />
                    </div>

                    <div className="space-y-[1.5vw]">
                        <div className="space-y-[0.5vw]">
                            <p className="text-[0.875vw] font-bold tracking-[0.2em] uppercase text-amber-500">
                                Empty Book
                            </p>
                            <h1 className="text-[3.5vw] font-extrabold tracking-tight text-slate-900 leading-tight">
                                No pages found.
                            </h1>
                        </div>

                        <p className="text-[1.125vw] text-slate-500 leading-relaxed max-w-[30vw] mx-auto">
                            This flipbook doesn't have any pages yet. Please check back later.
                        </p>
                    </div>

                    <div className="mt-[3vw] flex justify-center">
                        <button
                            onClick={() => navigate('/home')}
                            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-[0.5vw] px-[2vw] py-[1vw] bg-slate-950 text-white font-semibold rounded-full hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95 overflow-hidden text-[1vw]"
                        >
                            <Home className="w-[1.25vw] h-[1.25vw]" />
                            <span>Back to Home</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onContextMenu={(e) => e.preventDefault()}
            className="relative h-screen w-screen overflow-hidden bg-white flex flex-col"
            style={varsObject}
        >
            <style>{`:root { ${layoutColorVars} }`}</style>
            <svg width="0" height="0" className="absolute">
                <defs>
                    <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFCA44" />
                        <stop offset="50%" stopColor="#FFE091" />
                        <stop offset="100%" stopColor="#FFCA44" />
                    </linearGradient>
                    <linearGradient id="half-star" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFCA44" />
                        <stop offset="25%" stopColor="#FFE091" />
                        <stop offset="50%" stopColor="#FFCA44" />
                        <stop offset="50%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                </defs>
            </svg>
            <FlipbookPreview
                pages={bookData.pages}
                pageName={bookData.meta?.flipbookName || 'Untitled Flipbook'}
                settings={{ ...(bookData.meta || {}), ...(bookData.Customized_Settings || {}), ...(bookData.settings || {}), ...settings, userEmail: bookData.userEmail || bookData.meta?.userEmail, shareId: shareId || bookData?.Customized_Settings?.Visibility?.shareId || bookData?.Visibility?.shareId }}
                isMobile={isMobileDevice}
                onClose={null}
                baseUrl={bookData.meta?.baseUrl ? `${getBackendUrl()}${bookData.meta.baseUrl}` : null}
                v_id={bookData?.v_id}
                shareId={shareId || bookData?.Customized_Settings?.Visibility?.shareId || bookData?.Visibility?.shareId}
                isPublishedPreview={true}
                isLoadingParent={false}
                currentBook={bookData}
            />

            {/* Vertical white strip on the right edge the sidebar is attached to */}
            <div
                className="fixed top-0 w-[0.25vw] h-full bg-white z-[1499] pointer-events-none transition-[right] duration-500 ease-in-out"
                style={{ right: isRatingsOpen ? '22vw' : '0' }}
            />

            {/* Right Sidebar (fixed, attached to the right edge) */}
            <div
                className="fixed top-1/2 -translate-y-1/2 bg-white py-[0.5vw] px-[0.5vw] flex flex-col items-center justify-between z-[1500] rounded-l-[0.8vw] shadow-[-6px_0_24px_rgba(0,0,0,0.12)] transition-[right] duration-500 ease-in-out"
                style={{ right: isRatingsOpen ? '22vw' : '0', width: '4vw' }}
            >
                <WhiteAttachedCurve position="top" />
                <WhiteAttachedCurve position="bottom" />

                <div className="flex flex-col gap-[0.2vw] mt-[0.2vw] mb-[0.2vw] w-full items-center">
                    <button onClick={() => { setIsRatingsOpen(false); setIsBookInfoOpen(true); }} className="flex flex-col items-center gap-[0.2vw] hover:bg-slate-50 py-[0.2vw] px-[0.4vw] rounded-xl group transition-all cursor-pointer w-full">
                        <Icon icon="weui:info-outlined" className="w-[1.2vw] h-[1.2vw] text-[#2F296D]" />
                        <span className="text-[0.7vw] font-medium text-[#2F296D] text-center leading-tight">Book<br />Info</span>
                    </button>
                    <div className="w-[60%] h-[1px] bg-gray-100 pointer-events-none"></div>
                    <button onClick={() => setIsRatingsOpen(true)} className="flex flex-col items-center gap-[0.2vw] hover:bg-slate-50 py-[0.2vw] px-[0.4vw] rounded-xl group transition-all cursor-pointer w-full">
                        <div className="relative">
                            <Icon icon="iconamoon:star-light" className="w-[1.2vw] h-[1.2vw] text-yellow-500" />
                            {totalRatings > 0 && (
                                <div className="absolute top-0 right-[-0.2vw] bg-[#34A853] rounded-full w-[0.8vw] h-[0.8vw] flex items-center justify-center border border-white">
                                    <Icon icon="lucide:check" className="w-[0.3vw] h-[0.3vw] text-white" strokeWidth={4} />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-center mt-[0.1vw] gap-[0.1vw]">
                            <span className="text-[0.8vw] text-[#2F296D] font-medium leading-none">{averageRating > 0 ? `${averageRating}/5` : '0/5'}</span>
                            <span className="text-[0.7vw] text-[#2F296D] font-medium leading-tight">ratings</span>
                        </div>
                    </button>
                    {!isBookOwner && (
                        <>
                            <div className="w-[60%] h-[1px] bg-gray-100 pointer-events-none"></div>
                            <button onClick={handleFavoriteToggle} className="flex flex-col items-center gap-[0.2vw] hover:bg-red-50 py-[0.2vw] px-[0.4vw] rounded-xl group transition-all cursor-pointer w-full text-red-500">
                                <Heart className={`w-[1.2vw] h-[1.2vw] transition-transform group-hover:scale-110 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-[#2F296D] hover:text-red-500'}`} />
                                <span className="text-[0.7vw] font-medium text-[#2F296D] text-center leading-tight">
                                    {isFavorited ? 'Favorited' : 'Favorite'}
                                </span>
                            </button>
                        </>
                    )}
                    <div className="w-[60%] h-[1px] bg-gray-100 pointer-events-none"></div>
                    <button onClick={() => window.history.back()} className="flex flex-col items-center gap-[0.2vw] hover:bg-red-50 py-[0.2vw] px-[0.4vw] rounded-xl group transition-all cursor-pointer mt-[0.2vw] w-full text-red-600">
                        <Icon icon="lucide:log-out" className="w-[1vw] h-[1vw] transition-transform group-hover:scale-110" />
                        <span className="text-[0.7vw] font-medium text-center leading-tight">Exit</span>
                    </button>
                </div>
            </div>

            <BookInfoModal
                isBookInfoOpen={isBookInfoOpen}
                setIsBookInfoOpen={setIsBookInfoOpen}
                bookData={bookData}
                viewsCount={viewsCount}
                averageRating={averageRating}
                totalRatings={totalRatings}
                renderStars={renderStars}
                formatDisplayDate={formatDisplayDate}
            />

            <RatingsPanel
                isRatingsOpen={isRatingsOpen}
                setIsRatingsOpen={setIsRatingsOpen}
                reviewsList={reviewsList}
                currentUserEmail={currentUserEmail}
                editingRatingId={editingRatingId}
                hoverRating={hoverRating}
                setHoverRating={setHoverRating}
                ratingForm={ratingForm}
                setRatingForm={setRatingForm}
                ratingFormError={ratingFormError}
                setRatingFormError={setRatingFormError}
                isSubmittingRating={isSubmittingRating}
                isDeletingRating={isDeletingRating}
                handleRatingSubmit={handleRatingSubmit}
                handleStartEdit={handleStartEdit}
                handleCancelEdit={handleCancelEdit}
                handleDeleteRating={handleDeleteRating}
                renderStars={renderStars}
                navigate={navigate}
                location={location}
            />
        </div>
    );
};

export default ShareViewBook;
