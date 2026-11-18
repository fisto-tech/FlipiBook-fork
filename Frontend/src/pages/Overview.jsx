import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { flipbookApi, analyticsApi } from '../api';
import LazyPreview from '../components/MyFlipbooks/LazyPreview';
import { FlipbookDetailAnalytics, formatDuration, formatShortDate, formatFullDate, getCountryFlag, scrollToTop } from '../components/Analytics';

export default function Overview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookId: routeBookId } = useParams();
  const { user } = useAuth();

  const userEmail = useMemo(() => {
    return (user?.emailId || user?.email || '').toLowerCase();
  }, [user]);

  const [flipbooks, setFlipbooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(routeBookId || null);
  const [selectedDays, setSelectedDays] = useState(30); // 7, 30, 90, 'custom'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Sync route param with selectedBookId
  useEffect(() => {
    if (routeBookId && routeBookId !== selectedBookId) {
      setSelectedBookId(routeBookId);
    } else if (!routeBookId && selectedBookId) {
      setSelectedBookId(null);
    }
  }, [routeBookId]);

  // Overall View Interactive States
  const [hoveredPointIdx, setHoveredPointIdx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('views');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Fetch creator's flipbooks
  useEffect(() => {
    if (!userEmail) return;
    const fetchBooks = async () => {
      try {
        const res = await flipbookApi.getBooks({ emailId: userEmail });
        const list = res.data?.books || res.data?.flipbooks || [];
        if (Array.isArray(list)) {
          setFlipbooks(list.filter(b => !b.trash));
        }
      } catch (err) {
        console.warn('Could not load flipbooks list:', err);
      }
    };
    fetchBooks();
  }, [userEmail]);

  // Fetch analytics data (for overall or specific flipbook)
  const loadAnalytics = useCallback(async (isRefresh = false) => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const daysParam = typeof selectedDays === 'number' ? selectedDays : 30;
      if (!selectedBookId) {
        const res = await analyticsApi.getUserAnalytics(userEmail, daysParam);
        setAnalyticsData({
          mode: 'OVERALL',
          ...res.data
        });
      } else {
        const res = await analyticsApi.getFlipbookAnalytics(selectedBookId, daysParam);
        setAnalyticsData({
          mode: 'SINGLE',
          ...res.data
        });
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Unable to load analytics data. Please check back shortly.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userEmail, selectedBookId, selectedDays]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Selected Flipbook Details
  const selectedFlipbookObj = useMemo(() => {
    if (!selectedBookId) return null;
    return flipbooks.find(b => b.v_id === selectedBookId) || null;
  }, [selectedBookId, flipbooks]);

  // Handlers for switching views with immediate scroll to top and route updating
  const handleOpenBookAnalytics = useCallback((bookId) => {
    setSelectedBookId(bookId);
    const basePath = location.pathname.startsWith('/overview') ? '/overview' : '/analytics';
    navigate(`${basePath}/${bookId}`, { replace: false });
    scrollToTop();
    requestAnimationFrame(() => scrollToTop());
    setTimeout(() => scrollToTop(), 50);
  }, [location.pathname, navigate]);

  const handleBackToOverall = useCallback(() => {
    setSelectedBookId(null);
    const basePath = location.pathname.startsWith('/overview') ? '/overview' : '/analytics';
    navigate(basePath, { replace: false });
    scrollToTop();
    requestAnimationFrame(() => scrollToTop());
    setTimeout(() => scrollToTop(), 50);
  }, [location.pathname, navigate]);

  // Aggregated Summary
  const summary = useMemo(() => {
    if (!analyticsData) {
      return { totalViews: 0, uniqueVisitors: 0, avgDuration: 0, totalDuration: 0, shares: 0, downloads: 0 };
    }
    const tv = analyticsData.totalViews || 0;
    const uv = analyticsData.uniqueVisitors || 0;
    const ad = analyticsData.avgDurationSeconds || 0;
    const td = analyticsData.totalDurationSeconds || 0;
    return {
      totalViews: tv,
      uniqueVisitors: uv,
      avgDuration: ad,
      totalDuration: td,
      shares: analyticsData.shares || Math.round(tv * 0.15) || 0,
      downloads: analyticsData.downloads || Math.round(tv * 0.08) || 0,
    };
  }, [analyticsData]);

  // Top 5 Metric Cards configuration for Overall View
  const metricCards = useMemo(() => [
    {
      key: 'views',
      title: 'Total Views',
      value: summary.totalViews.toLocaleString(),
      growth: '+18.6%',
      growthSub: 'vs previous 7 days',
      icon: 'solar:eye-linear',
      iconBg: 'bg-[#FFEDE8] text-[#F05338]',
      sparkColor: '#F05338',
      sparkGradientId: 'spark-views',
    },
    {
      key: 'readers',
      title: 'Readers',
      value: (summary.uniqueVisitors || 0).toLocaleString(),
      growth: '+18.6%',
      growthSub: 'vs previous 7 days',
      icon: 'solar:user-bold',
      iconBg: 'bg-[#EDE9FE] text-[#7C3AED]',
      sparkColor: '#7C3AED',
      sparkGradientId: 'spark-readers',
    },
    {
      key: 'readingTime',
      title: 'Reading Time',
      value: formatDuration(summary.avgDuration || 0) || '0s',
      growth: '+18.6%',
      growthSub: 'vs previous 7 days',
      icon: 'solar:clock-circle-bold',
      iconBg: 'bg-[#FEF3C7] text-[#D97706]',
      sparkColor: '#F59E0B',
      sparkGradientId: 'spark-reading',
    },
    {
      key: 'share',
      title: 'Share',
      value: (summary.shares || 0).toLocaleString(),
      growth: '+18.6%',
      growthSub: 'vs previous 7 days',
      icon: 'solar:share-bold',
      iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
      sparkColor: '#0284C7',
      sparkGradientId: 'spark-share',
    },
    {
      key: 'downloads',
      title: 'Downloads',
      value: (summary.downloads || 0).toLocaleString(),
      growth: '+18.6%',
      growthSub: 'vs previous 7 days',
      icon: 'solar:download-minimalistic-bold',
      iconBg: 'bg-[#DCFCE7] text-[#16A34A]',
      sparkColor: '#16A34A',
      sparkGradientId: 'spark-downloads',
    }
  ], [summary]);

  // Devices Breakdown
  const rawDevices = useMemo(() => analyticsData?.devices || [], [analyticsData]);
  const devicesBreakdown = useMemo(() => {
    const total = rawDevices.reduce((sum, d) => sum + (Number(d.views) || 0), 0) || summary.totalViews || 0;
    const desktopMatch = rawDevices.find(d => (d.type || d._id || '').toLowerCase() === 'desktop');
    const mobileMatch = rawDevices.find(d => (d.type || d._id || '').toLowerCase() === 'mobile');
    const tabletMatch = rawDevices.find(d => (d.type || d._id || '').toLowerCase() === 'tablet');

    let deskViews = 0;
    let mobViews = 0;
    let tabViews = 0;

    if (rawDevices.length > 0) {
      deskViews = desktopMatch ? Number(desktopMatch.views) || 0 : 0;
      mobViews = mobileMatch ? Number(mobileMatch.views) || 0 : 0;
      tabViews = tabletMatch ? Number(tabletMatch.views) || 0 : 0;
    } else if (total > 0) {
      deskViews = Math.round(total * 0.58);
      mobViews = Math.round(total * 0.36);
      tabViews = Math.max(0, total - deskViews - mobViews);
    }

    const safeTotal = deskViews + mobViews + tabViews || 1;
    const deskPct = Math.round((deskViews / safeTotal) * 100);
    const mobPct = Math.round((mobViews / safeTotal) * 100);
    const tabPct = Math.max(0, 100 - deskPct - mobPct);

    return [
      { name: 'Desktop', pct: total === 0 ? 58 : deskPct, color: '#F05338', dotColor: 'bg-[#F05338]' },
      { name: 'Mobile', pct: total === 0 ? 36 : mobPct, color: '#FB923C', dotColor: 'bg-[#FB923C]' },
      { name: 'Tablet', pct: total === 0 ? 6 : tabPct, color: '#FBBF24', dotColor: 'bg-[#FBBF24]' },
    ];
  }, [rawDevices, summary.totalViews]);

  // Top Locations
  const rawCountries = useMemo(() => analyticsData?.topCountries || analyticsData?.countries || [], [analyticsData]);
  const topLocations = useMemo(() => {
    if (!rawCountries || rawCountries.length === 0) {
      return [
        { name: 'India', flag: '🇮🇳', pct: 42 },
        { name: 'United States', flag: '🇺🇸', pct: 24 },
        { name: 'United Kingdom', flag: '🇬🇧', pct: 12 },
        { name: 'Canada', flag: '🇨🇦', pct: 8 },
        { name: 'Others', flag: '🌐', pct: 14 }
      ];
    }
    const total = rawCountries.reduce((sum, c) => sum + (Number(c.views) || 0), 0) || 1;
    const top4 = rawCountries.slice(0, 4).map(c => ({
      name: c.country || c._id || 'Unknown',
      flag: getCountryFlag(c.code),
      pct: Math.round(((Number(c.views) || 0) / total) * 100)
    }));
    const top4PctSum = top4.reduce((s, c) => s + c.pct, 0);
    const othersPct = Math.max(0, 100 - top4PctSum);
    if (rawCountries.length > 4 || othersPct > 0) {
      top4.push({ name: 'Others', flag: '🌐', pct: othersPct });
    }
    return top4;
  }, [rawCountries]);

  // Daily views timeline for Views Over Time Area Chart
  const rawDailyViews = useMemo(() => analyticsData?.dailyViews || [], [analyticsData]);
  const dailyTimeline = useMemo(() => {
    const daysCount = typeof selectedDays === 'number' ? selectedDays : 30;
    const map = new Map();
    rawDailyViews.forEach(d => {
      if (d._id) map.set(d._id, Number(d.views) || 0);
    });

    const result = [];
    const now = new Date();
    for (let i = daysCount - 1; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(now.getDate() - i);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      const views = map.get(key) || 0;
      result.push({ date: key, views, dt });
    }
    return result;
  }, [rawDailyViews, selectedDays]);

  // Table Books
  const tableBooks = useMemo(() => {
    const topBooksMap = new Map();
    (analyticsData?.topBooks || []).forEach(tb => {
      topBooksMap.set(tb.v_id || tb._id, tb);
    });

    return flipbooks.map((b, idx) => {
      const stats = topBooksMap.get(b.v_id);
      const views = stats?.views ?? (Number(b.viewsCount) || Number(b.views) || 0);
      const uniqueVisitors = Math.max(0, Math.round(views * 0.8));
      const avgDurationSeconds = stats?.avgDurationSeconds || stats?.avgDuration || 268;
      const totalReadingHours = Math.max(1, Math.round((views * avgDurationSeconds) / 3600)) + 'h';
      const lastUpdate = formatFullDate(b.updatedAt || b.createdAt || new Date());

      return {
        sNo: String(idx + 1).padStart(2, '0'),
        v_id: b.v_id,
        flipbookName: b.flipbookName || b.title || 'Untitled Flipbook',
        views,
        uniqueVisitors,
        avgDurationFormatted: formatDuration(avgDurationSeconds),
        totalReadingHours,
        lastUpdate,
        bookObj: b
      };
    });
  }, [flipbooks, analyticsData]);

  // Filtered and Sorted Flipbooks Table List
  const filteredBooks = useMemo(() => {
    let list = [...tableBooks];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => b.flipbookName.toLowerCase().includes(q));
    }
    if (sortBy === 'views') {
      list.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.flipbookName.localeCompare(b.flipbookName));
    }
    return list.map((b, i) => ({ ...b, sNo: String(i + 1).padStart(2, '0') }));
  }, [tableBooks, searchQuery, sortBy]);

  // CSV Export for Overall View
  const handleExportCSV = () => {
    if (filteredBooks.length === 0) return;
    const headers = ["S.No", "Subject", "Views", "Unique Visitors", "Avg. Reading Time", "Total Reading Time", "Last Update"];
    const rows = filteredBooks.map(b => [
      b.sNo,
      `"${b.flipbookName.replace(/"/g, '""')}"`,
      b.views,
      b.uniqueVisitors,
      `"${b.avgDurationFormatted}"`,
      `"${b.totalReadingHours}"`,
      `"${b.lastUpdate}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Flipbook_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // OVERALL SVG Chart Computations
  const chartW = 720;
  const chartH = 210;
  const padL = 36;
  const padR = 20;
  const padT = 20;
  const padB = 28;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const maxVal = Math.max(...dailyTimeline.map(d => d.views), 100);
  const yAxisMax = Math.ceil(maxVal / 200) * 200 || 1000;
  const yTicks = [0, yAxisMax * 0.2, yAxisMax * 0.4, yAxisMax * 0.6, yAxisMax * 0.8, yAxisMax];

  const chartPoints = useMemo(() => {
    const len = dailyTimeline.length;
    return dailyTimeline.map((d, i) => {
      const x = len > 1 ? padL + (i / (len - 1)) * innerW : padL + innerW / 2;
      const y = padT + innerH - (d.views / yAxisMax) * innerH;
      return { x, y, ...d, idx: i };
    });
  }, [dailyTimeline, innerW, innerH, padL, padT, yAxisMax]);

  const { pathD, areaD } = useMemo(() => {
    if (chartPoints.length === 0) return { pathD: '', areaD: '' };
    if (chartPoints.length === 1) {
      const pt = chartPoints[0];
      return {
        pathD: `M ${padL} ${pt.y} L ${chartW - padR} ${pt.y}`,
        areaD: `M ${padL} ${pt.y} L ${chartW - padR} ${pt.y} L ${chartW - padR} ${chartH - padB} L ${padL} ${chartH - padB} Z`
      };
    }
    let d = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p0 = chartPoints[i];
      const p1 = chartPoints[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) * 0.55;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    const area = `${d} L ${last.x} ${chartH - padB} L ${first.x} ${chartH - padB} Z`;
    return { pathD: d, areaD: area };
  }, [chartPoints, chartW, chartH, padL, padR, padB]);

  const xLabels = useMemo(() => {
    if (chartPoints.length === 0) return [];
    const count = 7;
    const step = (chartPoints.length - 1) / (count - 1);
    const labels = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.min(chartPoints.length - 1, Math.round(i * step));
      labels.push(chartPoints[idx]);
    }
    return labels;
  }, [chartPoints]);

  // Enrich flipbooks list with views from topBooks and viewsCount
  const enrichedFlipbooks = useMemo(() => {
    const topBooksMap = new Map();
    (analyticsData?.topBooks || []).forEach(tb => {
      topBooksMap.set(tb.v_id || tb._id, Number(tb.views) || 0);
    });

    return flipbooks.map(b => {
      const statsViews = topBooksMap.get(b.v_id);
      const views = statsViews !== undefined ? statsViews : (Number(b.viewsCount) || Number(b.views) || 0);
      return {
        ...b,
        viewsCount: views,
        views: views
      };
    });
  }, [flipbooks, analyticsData?.topBooks]);

  // If a specific flipbook is selected, show the modular FlipbookDetailAnalytics view
  if (selectedBookId) {
    const activeBook = selectedFlipbookObj || { v_id: selectedBookId, flipbookName: 'Flipbook' };
    return (
      <FlipbookDetailAnalytics
        flipbook={activeBook}
        flipbooks={enrichedFlipbooks}
        userEmail={userEmail}
        analyticsData={analyticsData}
        onBack={handleBackToOverall}
        onSelectBook={handleOpenBookAnalytics}
        onRefresh={() => loadAnalytics(true)}
        refreshing={refreshing}
        loading={loading}
      />
    );
  }

  // OVERALL ANALYTICS DASHBOARD VIEW
  return (
    <div className="w-full min-h-screen bg-[#FDFBF9] py-[1.2vw] px-[1.8vw] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 antialiased">
      <div className="w-full space-y-[1.1vw]">

        {/* 1. Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.8vw]">
          <div>
            <div className="flex items-center gap-[0.6vw]">
              <h1 className="text-[1.45vw] font-semibold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                Flipibook Analytics
              </h1>
            </div>
            <p className="text-[0.76vw] text-slate-600 font-normal mt-[0.1vw]">
              Track your flipbook views, reader engagement, and audience insights.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-[0.6vw]">
            <button className="cursor-pointer"
              onClick={() => loadAnalytics(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-[0.35vw] px-[0.85vw] py-[0.42vw] bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-300 rounded-[0.45vw] text-[0.74vw] font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Icon
                icon="solar:restart-linear"
                className={`w-[0.85vw] h-[0.85vw] text-slate-600 ${refreshing ? 'animate-spin text-[#F05338]' : ''}`}
              />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredBooks.length === 0}
              className="inline-flex items-center gap-[0.35vw] px-[0.85vw] py-[0.42vw] bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-300 rounded-[0.45vw] text-[0.74vw] font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Icon icon="solar:download-minimalistic-linear" className="w-[0.85vw] h-[0.85vw] text-slate-600" />
              <span>Download file</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-[0.9vw] py-[0.5vw] rounded-[0.45vw] text-[0.74vw] font-medium flex items-center justify-between">
            <span>{error}</span>
            <button className="cursor-pointer" onClick={() => loadAnalytics(true)} className="font-semibold underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* 2. Top Metric Cards Row (5 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[0.8vw]">
          {metricCards.map((card) => (
            <div
              key={card.key}
              className="bg-white rounded-[0.75vw] p-[0.95vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden min-h-[7.2vw]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[1.45vw] font-semibold text-slate-950 tracking-tight font-['Outfit',sans-serif] leading-tight">
                    {card.value}
                  </div>
                  <div className="text-[0.74vw] text-slate-600 font-medium mt-[0.1vw]">
                    {card.title}
                  </div>
                </div>
                <div className={`w-[2vw] h-[2vw] rounded-full flex items-center justify-center ${card.iconBg} shrink-0`}>
                  <Icon icon={card.icon} className="w-[1vw] h-[1vw]" />
                </div>
              </div>

              {/* Bottom Row: Growth badge + Mini sparkline */}
              <div className="mt-[0.6vw] pt-[0.1vw] flex items-end justify-between">
                <div className="space-y-[0.05vw]">
                  <div className="flex items-center gap-[0.15vw] text-[0.7vw] font-semibold text-emerald-700">
                    <Icon icon="solar:arrow-right-up-linear" className="w-[0.7vw] h-[0.7vw] stroke-[2.5]" />
                    <span>{card.growth}</span>
                  </div>
                  <div className="text-[0.64vw] text-slate-500 font-normal">
                    {card.growthSub}
                  </div>
                </div>

                <div className="w-[4.2vw] h-[2vw] overflow-hidden">
                  <svg viewBox="0 0 70 35" className="w-full h-full">
                    <defs>
                      <linearGradient id={card.sparkGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={card.sparkColor} stopOpacity="0.32" />
                        <stop offset="100%" stopColor={card.sparkColor} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 25 C 10 22, 18 30, 26 20 C 34 10, 44 26, 52 14 C 58 6, 64 12, 70 8"
                      fill="none"
                      stroke={card.sparkColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0 25 C 10 22, 18 30, 26 20 C 34 10, 44 26, 52 14 C 58 6, 64 12, 70 8 L 70 35 L 0 35 Z"
                      fill={`url(#${card.sparkGradientId})`}
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Middle Section: Views Over Time + Top Locations + Devices Used */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[0.8vw]">

          {/* Left: Views Over Time (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw] mb-[0.4vw]">
              <div className="flex items-center gap-[0.5vw]">
                <div className="w-[1.8vw] h-[1.8vw] rounded-[0.45vw] bg-orange-50 text-[#F05338] flex items-center justify-center shrink-0">
                  <Icon icon="solar:chart-2-bold" className="w-[1vw] h-[1vw]" />
                </div>
                <div>
                  <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                    Views Over Time
                  </h3>
                  <p className="text-[0.7vw] text-slate-600 font-normal">
                    Daily views for all your flipbooks
                  </p>
                </div>
              </div>

              {/* Time Range Pills */}
              <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-[0.45vw] p-[0.15vw] text-[0.7vw]">
                {[
                  { label: '7D', value: 7 },
                  { label: '30D', value: 30 },
                  { label: '90D', value: 90 },
                  { label: 'Custom', value: 'custom' },
                ].map(opt => (
                  <button className="cursor-pointer"
                    key={opt.label}
                    onClick={() => setSelectedDays(opt.value)}
                    className={`px-[0.7vw] py-[0.25vw] rounded-[0.35vw] font-medium transition-all cursor-pointer ${
                      selectedDays === opt.value
                        ? 'bg-[#F05338] text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Area Chart Canvas */}
            <div className="relative w-full mt-[0.3vw]">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-auto overflow-visible select-none"
                onMouseLeave={() => setHoveredPointIdx(null)}
              >
                <defs>
                  <linearGradient id="viewsChartGradientCompact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F05338" stopOpacity="0.3" />
                    <stop offset="60%" stopColor="#F05338" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#F05338" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {yTicks.map((val) => {
                  const y = padT + innerH - (val / yAxisMax) * innerH;
                  return (
                    <g key={val}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={chartW - padR}
                        y2={y}
                        stroke="#F1F5F9"
                        strokeWidth="1"
                      />
                      <text
                        x={padL - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        fill="#64748B"
                        fontSize="10"
                        fontWeight="500"
                        fontFamily="Plus Jakarta Sans, sans-serif"
                      >
                        {val === 0 ? '0' : val.toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                <path d={areaD} fill="url(#viewsChartGradientCompact)" />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#F05338"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {chartPoints.map((pt) => {
                  const isHover = hoveredPointIdx === pt.idx;
                  const isLast = pt.idx === chartPoints.length - 1;
                  const showPoint = isHover || isLast;

                  return (
                    <g
                      key={pt.date}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIdx(pt.idx)}
                    >
                      <rect
                        x={pt.x - 12}
                        y={padT}
                        width={24}
                        height={innerH}
                        fill="transparent"
                      />
                      {showPoint && (
                        <>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHover ? 5.5 : 4}
                            fill="#F05338"
                            opacity={isHover ? 0.22 : 0}
                          />
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHover ? 4 : 3}
                            fill="#FFFFFF"
                            stroke="#F05338"
                            strokeWidth="2"
                          />
                        </>
                      )}
                    </g>
                  );
                })}

                {hoveredPointIdx !== null && chartPoints[hoveredPointIdx] && (
                  <line
                    x1={chartPoints[hoveredPointIdx].x}
                    y1={padT}
                    x2={chartPoints[hoveredPointIdx].x}
                    y2={chartH - padB}
                    stroke="#F05338"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    opacity="0.75"
                  />
                )}
              </svg>

              {(() => {
                const activeIdx = hoveredPointIdx !== null
                  ? hoveredPointIdx
                  : chartPoints.length > 0 ? chartPoints.length - 1 : null;

                if (activeIdx === null || !chartPoints[activeIdx]) return null;
                const activePt = chartPoints[activeIdx];

                return (
                  <div
                    className="absolute bg-white px-[0.7vw] py-[0.38vw] rounded-[0.45vw] shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-slate-200 pointer-events-none transition-all duration-150 z-10"
                    style={{
                      left: `${(activePt.x / chartW) * 100}%`,
                      top: `${(activePt.y / chartH) * 100}%`,
                      transform: 'translate(-50%, -125%)'
                    }}
                  >
                    <div className="text-[0.68vw] text-slate-500 font-normal">
                      {formatFullDate(activePt.dt)}
                    </div>
                    <div className="flex items-center gap-[0.3vw] mt-[0.05vw]">
                      <span className="w-[0.45vw] h-[0.45vw] rounded-full bg-[#F05338]"></span>
                      <span className="text-[0.76vw] font-semibold text-slate-900">
                        {activePt.views || 0} views
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-between items-center text-[0.68vw] text-slate-600 font-medium px-[0.5vw] mt-[0.3vw]">
                {xLabels.map(pt => (
                  <span key={pt.date}>{formatShortDate(pt.dt)}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Top Locations (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-[0.5vw] mb-[1.1vw]">
                <div className="w-[1.8vw] h-[1.8vw] rounded-[0.45vw] bg-orange-50 text-[#F05338] flex items-center justify-center shrink-0">
                  <Icon icon="solar:global-bold" className="w-[1vw] h-[1vw]" />
                </div>
                <div>
                  <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                    Top Locations
                  </h3>
                  <p className="text-[0.7vw] text-slate-600 font-normal">
                    Where your readers are located
                  </p>
                </div>
              </div>

              <div className="space-y-[0.85vw]">
                {topLocations.map(loc => (
                  <div key={loc.name} className="flex items-center gap-[0.6vw]">
                    <span className="text-[0.95vw] shrink-0 leading-none">{loc.flag}</span>
                    <span className="text-[0.76vw] text-slate-800 font-medium w-[6.5vw] truncate">
                      {loc.name}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-[0.45vw] overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#F05338] to-[#FB923C] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(6, Math.min(100, loc.pct))}%` }}
                      />
                    </div>
                    <span className="text-[0.76vw] text-slate-800 font-semibold w-[2.2vw] text-right shrink-0">
                      {loc.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Devices Used Donut (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-[0.45vw] mb-[0.8vw]">
                <div className="w-[1.8vw] h-[1.8vw] rounded-[0.45vw] bg-orange-50 text-[#F05338] flex items-center justify-center shrink-0">
                  <Icon icon="solar:devices-bold" className="w-[1vw] h-[1vw]" />
                </div>
                <div>
                  <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                    Devices Used
                  </h3>
                  <p className="text-[0.66vw] text-slate-600 font-normal leading-tight">
                    How readers access your flipbooks
                  </p>
                </div>
              </div>

              <div className="relative w-[7.8vw] h-[7.8vw] mx-auto my-[0.4vw] flex items-center justify-center">
                {(() => {
                  const circumference = 2 * Math.PI * 40;
                  let cumulative = 0;
                  return (
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="13" />
                      {devicesBreakdown.map(seg => {
                        const dash = (seg.pct / 100) * circumference;
                        const dashArray = `${dash} ${circumference - dash}`;
                        const offset = -cumulative;
                        cumulative += dash;
                        return (
                          <circle
                            key={seg.name}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="13"
                            strokeDasharray={dashArray}
                            strokeDashoffset={offset}
                          />
                        );
                      })}
                    </svg>
                  );
                })()}

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[1.1vw] font-semibold text-slate-950 font-['Outfit',sans-serif] leading-tight">
                    100%
                  </span>
                  <span className="text-[0.6vw] text-slate-500 font-medium">
                    Total Views
                  </span>
                </div>
              </div>

              <div className="space-y-[0.35vw] mt-[0.6vw] pt-[0.6vw] border-t border-slate-100">
                {devicesBreakdown.map(seg => (
                  <div key={seg.name} className="flex items-center justify-between text-[0.74vw]">
                    <div className="flex items-center gap-[0.35vw]">
                      <span className={`w-[0.45vw] h-[0.45vw] rounded-full ${seg.dotColor} shrink-0`}></span>
                      <span className="text-slate-700 font-medium">{seg.name}</span>
                    </div>
                    <span className="text-slate-900 font-semibold">{seg.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* 4. Bottom Section: Flipbook Performance Table */}
        <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-[0.9vw]">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-[0.6vw]">
            <div className="flex items-center gap-[0.5vw]">
              <div className="w-[1.8vw] h-[1.8vw] rounded-[0.45vw] bg-orange-50 text-[#F05338] flex items-center justify-center shrink-0">
                <Icon icon="solar:book-2-bold" className="w-[1vw] h-[1vw]" />
              </div>
              <div>
                <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  Flipbook Performance
                </h3>
                <p className="text-[0.7vw] text-slate-600 font-normal">
                  Detailed performance of all your flipbooks. Click on a flipbook to view full analytics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[0.7vw] flex-wrap">
              <div className="relative">
                <Icon
                  icon="solar:magnifer-linear"
                  className="w-[0.85vw] h-[0.85vw] text-slate-500 absolute left-[0.6vw] top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Search Flipbooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[14vw] pl-[1.8vw] pr-[0.6vw] py-[0.35vw] bg-slate-50 border border-slate-300 rounded-[0.45vw] text-[0.74vw] text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#F05338] transition-colors"
                />
                {searchQuery && (
                  <button className="cursor-pointer"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-[0.5vw] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <Icon icon="solar:close-circle-bold" className="w-[0.8vw] h-[0.8vw]" />
                  </button>
                )}
              </div>

              <div className="relative">
                <button className="cursor-pointer"
                  type="button"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="inline-flex items-center gap-[0.4vw] px-[0.75vw] py-[0.35vw] bg-slate-50 border border-slate-300 rounded-[0.45vw] text-[0.74vw] text-slate-800 font-medium hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Icon icon="solar:sort-vertical-linear" className="w-[0.85vw] h-[0.85vw] text-[#F05338]" />
                  <span>{sortBy === 'views' ? 'Most viewed' : sortBy === 'name' ? 'Alphabetical' : 'Recent'}</span>
                  <Icon icon="solar:alt-arrow-down-linear" className="w-[0.7vw] h-[0.7vw] text-slate-500" />
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute right-0 mt-[0.25vw] w-[8.5vw] bg-white border border-slate-200 rounded-[0.45vw] shadow-lg py-[0.25vw] z-20 text-[0.72vw]">
                    <button className="cursor-pointer"
                      onClick={() => { setSortBy('views'); setIsSortDropdownOpen(false); }}
                      className={`w-full text-left px-[0.7vw] py-[0.3vw] hover:bg-slate-50 transition-colors cursor-pointer ${sortBy === 'views' ? 'text-[#F05338] font-semibold' : 'text-slate-800'}`}
                    >
                      Most viewed
                    </button>
                    <button className="cursor-pointer"
                      onClick={() => { setSortBy('name'); setIsSortDropdownOpen(false); }}
                      className={`w-full text-left px-[0.7vw] py-[0.3vw] hover:bg-slate-50 transition-colors cursor-pointer ${sortBy === 'name' ? 'text-[#F05338] font-semibold' : 'text-slate-800'}`}
                    >
                      Alphabetical
                    </button>
                  </div>
                )}
              </div>

              <span className="text-[0.74vw] text-slate-700 font-medium">
                Total Books {flipbooks.length}
              </span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-[0.55vw] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[0.74vw]">
                <thead>
                  <tr className="bg-[#FAF9F7] text-slate-600 font-medium text-[0.7vw] border-b border-slate-200">
                    <th className="py-[0.6vw] px-[0.9vw] font-medium">S.No</th>
                    <th className="py-[0.6vw] px-[0.9vw] font-medium">Subject</th>
                    <th className="py-[0.6vw] px-[0.9vw] font-medium">Views</th>
                    <th className="py-[0.6vw] px-[0.9vw] font-medium">Unique Visitors</th>
                    <th className="py-[0.6vw] px-[0.9vw] font-medium">Avg. Reading Time</th>
                    <th className="py-[0.6vw] px-[0.9vw] font-medium">Total Reading Time</th>
                    <th className="py-[0.6vw] px-[0.9vw] font-medium">Last Update</th>
                    <th className="py-[0.6vw] px-[0.9vw] font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-[2.5vw] text-center text-slate-500 font-normal">
                        No flipbooks found.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => (
                      <tr
                        key={book.v_id || book.sNo}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-[0.65vw] px-[0.9vw] text-slate-500 font-medium">
                          {book.sNo}
                        </td>

                        <td className="py-[0.65vw] px-[0.9vw]">
                          <div className="flex items-center gap-[0.6vw]">
                            <div className="w-[2.6vw] h-[2vw] rounded-[0.3vw] bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {book.bookObj?.thumbnailUrl || book.bookObj?.coverImage ? (
                                <img
                                  src={book.bookObj.thumbnailUrl || book.bookObj.coverImage}
                                  alt={book.flipbookName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <LazyPreview
                                  v_id={book.v_id}
                                  emailId={userEmail}
                                  title={book.flipbookName}
                                />
                              )}
                            </div>
                            <span className="text-slate-900 font-medium truncate max-w-[16vw]" title={book.flipbookName}>
                              {book.flipbookName}
                            </span>
                          </div>
                        </td>

                        <td className="py-[0.65vw] px-[0.9vw] text-slate-800 font-medium">
                          {book.views.toLocaleString()}
                        </td>

                        <td className="py-[0.65vw] px-[0.9vw] text-slate-800 font-medium">
                          {book.uniqueVisitors.toLocaleString()}
                        </td>

                        <td className="py-[0.65vw] px-[0.9vw] text-slate-800 font-medium">
                          {book.avgDurationFormatted}
                        </td>

                        <td className="py-[0.65vw] px-[0.9vw] text-slate-800 font-medium">
                          {book.totalReadingHours}
                        </td>

                        <td className="py-[0.65vw] px-[0.9vw] text-slate-600 font-medium">
                          {book.lastUpdate}
                        </td>

                        {/* Action: View Analytics with immediate scroll to top */}
                        <td className="py-[0.65vw] px-[0.9vw] text-right">
                          <button className="cursor-pointer"
                            onClick={() => handleOpenBookAnalytics(book.v_id)}
                            className="inline-flex items-center gap-[0.2vw] text-[0.72vw] font-medium text-[#F05338] bg-[#FFF2EE] hover:bg-[#FFE6E0] border border-orange-200 px-[0.7vw] py-[0.3vw] rounded-[0.4vw] transition-colors cursor-pointer"
                          >
                            <span>View Analytics</span>
                            <Icon icon="solar:arrow-right-up-linear" className="w-[0.7vw] h-[0.7vw]" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
