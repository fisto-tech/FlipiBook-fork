import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import LazyPreview from '../MyFlipbooks/LazyPreview';
import ShareModal from '../ShareModal';
import { formatDuration, formatShortDate, formatFullDate, scrollToTop, buildDynamicTimeline, getSampledXLabels } from './analyticsUtils';
import AnalyticsDatePicker from './AnalyticsDatePicker';
import LeadFormTab from './LeadFormTab';
import DevicesSourcesTab from './DevicesSourcesTab';
import LocationsTab from './LocationsTab';
import DownloadsTab from './DownloadsTab';

export default function FlipbookDetailAnalytics({
  flipbook,
  flipbooks = [],
  userEmail,
  analyticsData,
  onBack,
  onSelectBook,
  onRefresh,
  refreshing = false,
  loading = false,
}) {
  const [detailTab, setDetailTab] = useState('readers');
  const [detailDatePreset, setDetailDatePreset] = useState('7 Days');
  const [detailGroupBy, setDetailGroupBy] = useState('Week');
  const [customRange, setCustomRange] = useState({
    startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [detailSidebarSearch, setDetailSidebarSearch] = useState('');
  const [sidebarSortBy, setSidebarSortBy] = useState('views'); // 'views', 'name', 'newest', 'oldest'
  const [isSidebarSortOpen, setIsSidebarSortOpen] = useState(false);
  const [focusedSidebarSortIndex, setFocusedSidebarSortIndex] = useState(-1);
  const sidebarSortRef = useRef(null);
  const datePickerRef = useRef(null);

  const sidebarSortOptions = useMemo(() => [
    { label: 'Most viewed', value: 'views' },
    { label: 'Alphabetical', value: 'name' },
    { label: 'Date (Newest)', value: 'newest' },
    { label: 'Date (Oldest)', value: 'oldest' },
  ], []);

  // Close sidebar sort on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarSortRef.current && !sidebarSortRef.current.contains(e.target)) {
        setIsSidebarSortOpen(false);
      }
    };
    if (isSidebarSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarSortOpen]);

  const handleSidebarSortKeyDown = (e) => {
    if (!isSidebarSortOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsSidebarSortOpen(true);
        const idx = sidebarSortOptions.findIndex(opt => opt.value === sidebarSortBy);
        setFocusedSidebarSortIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSidebarSortIndex(prev => (prev + 1) % sidebarSortOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSidebarSortIndex(prev => (prev - 1 + sidebarSortOptions.length) % sidebarSortOptions.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedSidebarSortIndex >= 0 && focusedSidebarSortIndex < sidebarSortOptions.length) {
        setSidebarSortBy(sidebarSortOptions[focusedSidebarSortIndex].value);
        setIsSidebarSortOpen(false);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsSidebarSortOpen(false);
    }
  };

  const [detailTableSort, setDetailTableSort] = useState('Date (Newest)');
  const [isDetailSortOpen, setIsDetailSortOpen] = useState(false);
  const [focusedDetailSortIndex, setFocusedDetailSortIndex] = useState(-1);
  const detailSortDropdownRef = useRef(null);

  const detailSortOptions = useMemo(() => [
    { label: 'Date (Newest)', value: 'Date (Newest)' },
    { label: 'Date (Oldest)', value: 'Date (Oldest)' },
    { label: 'Most viewed', value: 'Most viewed' },
    { label: 'Most readers', value: 'Most readers' },
  ], []);

  // Close detail sort on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (detailSortDropdownRef.current && !detailSortDropdownRef.current.contains(e.target)) {
        setIsDetailSortOpen(false);
      }
    };
    if (isDetailSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDetailSortOpen]);

  const handleDetailSortKeyDown = (e) => {
    if (!isDetailSortOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsDetailSortOpen(true);
        const idx = detailSortOptions.findIndex(opt => opt.value === detailTableSort);
        setFocusedDetailSortIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedDetailSortIndex(prev => (prev + 1) % detailSortOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedDetailSortIndex(prev => (prev - 1 + detailSortOptions.length) % detailSortOptions.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedDetailSortIndex >= 0 && focusedDetailSortIndex < detailSortOptions.length) {
        setDetailTableSort(detailSortOptions[focusedDetailSortIndex].value);
        setIsDetailSortOpen(false);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsDetailSortOpen(false);
    }
  };

  const [detailCurrentPage, setDetailCurrentPage] = useState(1);
  const detailPageSize = 7;
  const [detailHoverIdx, setDetailHoverIdx] = useState(null);
  const [shareModalBook, setShareModalBook] = useState(null);

  // Always ensure we scroll to top on initial mount or when flipbook changes
  useEffect(() => {
    scrollToTop();
    const t = setTimeout(() => scrollToTop(), 50);
    return () => clearTimeout(t);
  }, [flipbook?.v_id]);

  const bookTitle = flipbook?.flipbookName || flipbook?.title || 'Industrial Pumps';
  const totalPages = flipbook?.totalPages || flipbook?.pagesCount || 12;
  const isPublic = !flipbook?.password && !flipbook?.isPrivate;
  const createdDateFormatted = formatFullDate(flipbook?.createdAt || new Date());
  const shareId = flipbook?.Customized_Settings?.Visibility?.shareId || flipbook?.shareId || flipbook?.v_id;

  // Filtered and sorted sidebar list
  const sidebarBooks = useMemo(() => {
    let list = [...flipbooks];
    if (detailSidebarSearch.trim()) {
      const q = detailSidebarSearch.toLowerCase();
      list = list.filter(b => (b.flipbookName || '').toLowerCase().includes(q));
    }

    if (sidebarSortBy === 'views') {
      list.sort((a, b) => {
        const vA = a.viewsCount !== undefined ? a.viewsCount : (a.views || 0);
        const vB = b.viewsCount !== undefined ? b.viewsCount : (b.views || 0);
        return vB - vA;
      });
    } else if (sidebarSortBy === 'name') {
      list.sort((a, b) => (a.flipbookName || '').localeCompare(b.flipbookName || ''));
    } else if (sidebarSortBy === 'newest') {
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    } else if (sidebarSortBy === 'oldest') {
      list.sort((a, b) => new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0));
    }

    return list;
  }, [flipbooks, detailSidebarSearch, sidebarSortBy]);

  // Aggregate stats
  const summary = useMemo(() => {
    const tv = analyticsData?.summary?.totalViews !== undefined
      ? Number(analyticsData.summary.totalViews)
      : (analyticsData?.totalViews !== undefined
        ? Number(analyticsData.totalViews)
        : (flipbook?.viewsCount !== undefined ? Number(flipbook.viewsCount) : Number(flipbook?.views) || 0));

    const uv = analyticsData?.summary?.uniqueViewers !== undefined
      ? Number(analyticsData.summary.uniqueViewers)
      : (analyticsData?.uniqueVisitors !== undefined
        ? Number(analyticsData.uniqueVisitors)
        : (tv > 0 ? Math.round(tv * 0.8) : 0));

    const ad = Number(analyticsData?.summary?.avgDurationSeconds || analyticsData?.avgDurationSeconds || 0);
    const td = Number(analyticsData?.summary?.totalDurationSeconds || analyticsData?.totalDurationSeconds || (tv * ad));

    // Device: pick the device with highest views, fallback to 'DESKTOP'
    const topDevObj = (analyticsData?.devices || [])[0];
    const topDev = (topDevObj?.type || topDevObj?._id || 'Desktop').toString();

    // Location: compare top country views vs top state views
    const topCountryObj = (analyticsData?.countries || [])[0];
    const topStateObj = (analyticsData?.states || [])[0];
    const countryViews = Number(topCountryObj?.views) || 0;
    const stateViews = Number(topStateObj?.views) || 0;

    let topLoc = '—';
    if (topCountryObj && countryViews >= stateViews) {
      topLoc = topCountryObj.country || topCountryObj._id || '—';
    } else if (topStateObj && stateViews > 0) {
      topLoc = topStateObj.state || topStateObj._id || '—';
    } else if (topCountryObj) {
      topLoc = topCountryObj.country || topCountryObj._id || '—';
    }

    if (topLoc === '—' || topLoc.toLowerCase().includes('local') || topLoc === 'Unknown') {
      topLoc = topCountryObj?.country || (analyticsData?.countries?.[0]?.country) || '—';
    }

    const formatCount = (count) => {
      const num = Number(count) || 0;
      if (num === 0) return '0';
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
      return `${num.toLocaleString()}`;
    };

    const dl = Number(
      analyticsData?.summary?.totalDownloads !== undefined
        ? analyticsData.summary.totalDownloads
        : (analyticsData?.summary?.downloads !== undefined
          ? analyticsData.summary.downloads
          : (analyticsData?.downloads !== undefined ? analyticsData.downloads : 0))
    );

    const ld = Number(
      analyticsData?.summary?.totalLeads !== undefined
        ? analyticsData.summary.totalLeads
        : (analyticsData?.summary?.leads !== undefined
          ? analyticsData.summary.leads
          : (analyticsData?.totalLeads !== undefined
            ? analyticsData.totalLeads
            : (analyticsData?.leads !== undefined ? analyticsData.leads : 0)))
    );

    return {
      totalViews: tv,
      uniqueVisitors: uv,
      avgDuration: ad,
      totalDuration: td,
      shares: Number(analyticsData?.summary?.totalShares ?? analyticsData?.shares ?? (tv > 0 ? Math.round(tv * 0.15) : 0)),
      downloads: dl,
      leads: ld,
      topDevice: topDev.toUpperCase(),
      topLocation: topLoc.toUpperCase(),
      formatCount
    };
  }, [analyticsData, flipbook]);

  const detailStatCards = [
    {
      label: 'Total Readers',
      value: summary.formatCount(summary.uniqueVisitors),
      sub: 'Total Readers',
      icon: 'cuida:user-outline',
      iconColor: 'text-[#0284C7]',
      iconBg: 'bg-[#E8F5FF]'
    },
    {
      label: 'Total Leads Received',
      value: summary.formatCount(summary.leads),
      sub: 'Total Leads Received',
      icon: 'boxicons:form',
      iconColor: 'text-[#EC5137]',
      iconBg: 'bg-[#FFF0EB]'
    },
    {
      label: 'Top Device',
      value: summary.topDevice || 'DESKTOP',
      sub: 'Top Device',
      icon: 'energy-icons:devices-20-bold',
      iconColor: 'text-[#7357C8]',
      iconBg: 'bg-[#F0EDFF]'
    },
    {
      label: 'Top Location',
      value: summary.topLocation || 'TAMIL NADU',
      sub: 'Top Location',
      icon: 'basil:map-location-outline',
      iconColor: 'text-[#16865C]',
      iconBg: 'bg-[#E6F7EF]'
    },
    {
      label: 'Total Downloads',
      value: summary.formatCount(summary.downloads),
      sub: 'Total Downloads',
      icon: 'bi:download',
      iconColor: 'text-[#B77908]',
      iconBg: 'bg-[#FFF4DF]'
    }
  ];

  // Dynamic timeline for chart and table based on selected date filter
  const rawDailyViews = analyticsData?.dailyViews || [];
  const detailTimeline = useMemo(() => {
    return buildDynamicTimeline(detailDatePreset, customRange, rawDailyViews, summary.avgDuration || 0);
  }, [detailDatePreset, customRange, rawDailyViews, summary.avgDuration]);

  const dateRangeLabel = detailTimeline.length >= 2
    ? `${formatShortDate(detailTimeline[0].dt)}, ${detailTimeline[0].dt.getFullYear()} - ${formatShortDate(detailTimeline[detailTimeline.length - 1].dt)}, ${detailTimeline[detailTimeline.length - 1].dt.getFullYear()}`
    : (detailTimeline.length === 1 ? `${formatFullDate(detailTimeline[0].dt)}` : '—');

  // Export CSV and Sorting
  const sortedDetailTimeline = useMemo(() => {
    const arr = [...detailTimeline];
    if (detailTableSort === 'Date (Newest)') {
      return arr.sort((a, b) => b.dt.getTime() - a.dt.getTime());
    }
    if (detailTableSort === 'Date (Oldest)') {
      return arr.sort((a, b) => a.dt.getTime() - b.dt.getTime());
    }
    if (detailTableSort === 'Most viewed') {
      return arr.sort((a, b) => b.views - a.views);
    }
    if (detailTableSort === 'Most readers') {
      return arr.sort((a, b) => b.readers - a.readers);
    }
    return arr;
  }, [detailTimeline, detailTableSort]);

  // Pagination for Readers Table
  const detailTotalPages = Math.max(1, Math.ceil(sortedDetailTimeline.length / detailPageSize));
  const paginatedDetailTimeline = useMemo(() => {
    const start = (detailCurrentPage - 1) * detailPageSize;
    return sortedDetailTimeline.slice(start, start + detailPageSize);
  }, [sortedDetailTimeline, detailCurrentPage, detailPageSize]);

  const handleExportDetailCSV = () => {
    if (sortedDetailTimeline.length === 0) return;
    const headers = ["Date", "Total Unique Readers", "Total Views", "Total Reading Time", "Avg Reading Time"];
    const rows = sortedDetailTimeline.map(d => [
      `"${d.formattedFull}"`,
      d.readers,
      d.views,
      `"${d.totalDuration}"`,
      `"${d.avgDuration}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Flipbook_Readers_${bookTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Layout
  const dChartW = 860;
  const dChartH = 220;
  const dPadL = 40;
  const dPadR = 10;
  const dPadT = 20;
  const dPadB = 32;
  const dInnerW = dChartW - dPadL - dPadR;
  const dInnerH = dChartH - dPadT - dPadB;

  const dMaxViews = Math.max(...detailTimeline.map(d => d.views), 0);
  const dYAxisMax = useMemo(() => {
    if (dMaxViews <= 0) return 10;
    if (dMaxViews <= 5) return 5;
    if (dMaxViews <= 10) return 10;
    if (dMaxViews <= 25) return 25;
    if (dMaxViews <= 50) return 50;
    if (dMaxViews <= 100) return 100;
    if (dMaxViews <= 250) return 250;
    if (dMaxViews <= 500) return 500;
    if (dMaxViews <= 1000) return 1000;
    const magnitude = Math.pow(10, Math.floor(Math.log10(dMaxViews)));
    return Math.ceil(dMaxViews / magnitude) * magnitude;
  }, [dMaxViews]);

  const dYTicks = useMemo(() => {
    return [0, dYAxisMax * 0.2, dYAxisMax * 0.4, dYAxisMax * 0.6, dYAxisMax * 0.8, dYAxisMax];
  }, [dYAxisMax]);

  const detailChartPoints = useMemo(() => {
    const len = detailTimeline.length;
    return detailTimeline.map((d, i) => {
      const x = len > 1 ? dPadL + (i / (len - 1)) * dInnerW : dPadL + dInnerW / 2;
      const y = dPadT + dInnerH - (d.views / dYAxisMax) * dInnerH;
      return { x, y, ...d, idx: i };
    });
  }, [detailTimeline, dInnerW, dInnerH, dPadL, dPadT, dYAxisMax]);

  const { dPathD, dAreaD } = useMemo(() => {
    if (detailChartPoints.length === 0) return { dPathD: '', dAreaD: '' };
    if (detailChartPoints.length === 1) {
      const pt = detailChartPoints[0];
      return {
        dPathD: `M ${dPadL} ${pt.y} L ${dChartW - dPadR} ${pt.y}`,
        dAreaD: `M ${dPadL} ${pt.y} L ${dChartW - dPadR} ${pt.y} L ${dChartW - dPadR} ${dChartH - dPadB} L ${dPadL} ${dChartH - dPadB} Z`
      };
    }
    // Straight line segments between data points
    let d = `M ${detailChartPoints[0].x} ${detailChartPoints[0].y}`;
    for (let i = 0; i < detailChartPoints.length - 1; i++) {
      const p1 = detailChartPoints[i + 1];
      d += ` L ${p1.x} ${p1.y}`;
    }
    const first = detailChartPoints[0];
    const last = detailChartPoints[detailChartPoints.length - 1];
    const area = `${d} L ${last.x} ${dChartH - dPadB} L ${first.x} ${dChartH - dPadB} Z`;
    return { dPathD: d, dAreaD: area };
  }, [detailChartPoints, dChartH, dPadL, dPadR, dPadB]);

  // Sampled X-axis labels (at most 7) like Overview
  const detailXLabels = useMemo(() => {
    return getSampledXLabels(detailChartPoints, 7);
  }, [detailChartPoints]);

  return (
    <div className="w-full h-full bg-[#F6F7F9] text-slate-800 antialiased flex overflow-hidden">

      {/* 1. LEFT SIDEBAR */}
      <div className="w-[19.5vw] min-w-[270px] max-w-[340px] bg-white border-r border-slate-200/90 flex flex-col shrink-0 h-full overflow-hidden">
        <div className="pt-[1.2vw] pb-[0.8vw] px-[1vw] shrink-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-[0.45vw] text-[0.9vw] font-medium text-[#EC5137] hover:text-[#d43f26] transition-colors cursor-pointer group"
          >
            <Icon icon="ic:round-arrow-back" className="w-[1.15vw] h-[1.15vw] text-[#EC5137] transition-transform group-hover:-translate-x-0.5" />
            <span className="tracking-tight">Go to Analytics Dashboard</span>
          </button>
        </div>

        <div className="px-[1vw] pb-[1vw] flex items-center gap-[0.5vw] shrink-0">
          <div className="relative flex-1 flex items-center">
            <Icon icon="lineicons:search-2" className="w-[0.95vw] h-[0.95vw] text-[#858585] absolute left-[0.7vw] top-1/2 -translate-y-[45%]" />
            <input
              type="text"
              placeholder="Search Flipibooks..."
              value={detailSidebarSearch}
              onChange={(e) => setDetailSidebarSearch(e.target.value)}
              className="w-full pl-[2.2vw] pr-[2vw] py-[0.45vw] bg-white border border-slate-300 rounded-[0.55vw] text-[0.78vw] text-slate-800 placeholder-[#858585] focus:outline-none focus:border-[#EC5137]"
            />
            {detailSidebarSearch && (
              <button
                type="button"
                onClick={() => setDetailSidebarSearch('')}
                className="absolute right-[0.6vw] text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center p-[0.2vw]"
                title="Clear search"
              >
                <Icon icon="solar:close-circle-bold" className="w-[0.9vw] h-[0.9vw]" />
              </button>
            )}
          </div>

          <div className="relative shrink-0" ref={sidebarSortRef}>
            <button
              title="Sort Flipbooks"
              type="button"
              onClick={() => setIsSidebarSortOpen(prev => !prev)}
              onKeyDown={handleSidebarSortKeyDown}
              aria-haspopup="listbox"
              aria-expanded={isSidebarSortOpen}
              className={`p-[0.48vw] rounded-[0.55vw] border border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                isSidebarSortOpen ? 'border-[#EC5137] ring-2 ring-[#EC5137]/20 text-[#EC5137]' : 'text-[#858585]'
              }`}
            >
              <Icon icon="iconoir:sort" className="w-[0.95vw] h-[0.95vw]" />
            </button>

            {isSidebarSortOpen && (
              <div
                role="listbox"
                onMouseLeave={() => setFocusedSidebarSortIndex(-1)}
                className="absolute right-0 mt-[0.35vw] w-[10.5vw] min-w-[155px] bg-white border border-slate-200 rounded-[0.55vw] shadow-lg py-[0.3vw] z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-[0.75vw] py-[0.25vw] text-[0.62vw] font-semibold tracking-wider uppercase text-slate-400">
                  Sort By
                </div>
                {sidebarSortOptions.map((opt, idx) => {
                  const isCurrent = sidebarSortBy === opt.value;
                  const isFocused = focusedSidebarSortIndex === idx;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isCurrent}
                      onClick={() => {
                        setSidebarSortBy(opt.value);
                        setIsSidebarSortOpen(false);
                        setFocusedSidebarSortIndex(-1);
                      }}
                      onMouseEnter={() => setFocusedSidebarSortIndex(idx)}
                      onMouseLeave={() => setFocusedSidebarSortIndex(-1)}
                      className={`w-full text-left px-[0.75vw] py-[0.38vw] text-[0.72vw] font-normal transition-colors flex items-center justify-between cursor-pointer ${
                        isFocused ? 'bg-orange-50/80 text-[#EC5137]' : isCurrent ? 'bg-orange-50/50 text-[#EC5137]' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isCurrent && (
                        <Icon icon="solar:check-read-linear" className="w-[0.8vw] h-[0.8vw] text-[#EC5137]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-[0.75vw] space-y-[0.6vw]">
          {sidebarBooks.map((b) => {
            const isSelected = b.v_id === flipbook?.v_id;
            // Always display the true stable views count for each book
            const viewsCount = b.viewsCount !== undefined ? b.viewsCount : (b.views || 0);
            const dateStr = formatFullDate(b.updatedAt || b.createdAt);

            return (
              <div
                key={b.v_id}
                onClick={() => onSelectBook(b.v_id)}
                className={`p-[0.65vw] rounded-[0.6vw] flex items-center gap-[0.75vw] cursor-pointer transition-all ${
                  isSelected ? 'bg-[#F4F4F4]' : 'bg-transparent hover:bg-slate-50'
                }`}
              >
                <div className="w-[3.6vw] h-[2.7vw] rounded-[0.4vw] bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  {b.thumbnailUrl || b.coverImage ? (
                    <img src={b.thumbnailUrl || b.coverImage} alt={b.flipbookName} className="w-full h-full object-cover" />
                  ) : (
                    <LazyPreview v_id={b.v_id} emailId={userEmail} title={b.flipbookName} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.82vw] font-medium text-slate-900 truncate tracking-tight">
                    {b.flipbookName || 'Untitled Flipbook'}
                  </div>
                  <div className="text-[0.68vw] text-gray-700 mt-[0.1vw] flex items-center gap-[0.6vw]">
                    <span>{viewsCount.toLocaleString()} Views</span>
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden h-full">
        <div className="p-[1.5vw] space-y-[1.1vw]">

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-[1vw]">
            <div className="flex items-stretch gap-[1.2vw]">
              <div className="w-[11vw] min-w-[130px] max-w-[180px] self-stretch rounded-[0.55vw] bg-slate-100 border border-slate-200 shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
                {flipbook?.thumbnailUrl || flipbook?.coverImage ? (
                  <img
                    src={flipbook?.thumbnailUrl || flipbook?.coverImage}
                    alt={bookTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LazyPreview v_id={flipbook?.v_id} emailId={userEmail} title={bookTitle} />
                )}
              </div>

              <div className="flex flex-col justify-between py-[0.1vw] space-y-[0.55vw]">
                <div>
                  <h2 className="text-[1.35vw] font-semibold text-slate-900 tracking-tight leading-tight">
                    {bookTitle}
                  </h2>
                  <div className="flex items-center gap-[0.5vw] text-[0.74vw] text-slate-600 font-medium mt-[0.35vw]">
                    {isPublic ? (
                      <span className="inline-flex items-center gap-[0.2vw] px-[0.5vw] py-[0.1vw] rounded-full bg-emerald-50 text-emerald-700 text-[0.68vw] font-medium border border-emerald-200/70">
                        <Icon icon="subway:world-1" className="w-[0.75vw] h-[0.75vw] text-[#34A853]" />
                        <span>Public</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-[0.2vw] px-[0.5vw] py-[0.1vw] rounded-full bg-amber-50 text-amber-700 text-[0.68vw] font-medium border border-amber-200/70">
                        <Icon icon="solar:lock-linear" className="w-[0.75vw] h-[0.75vw]" />
                        <span>Private</span>
                      </span>
                    )}
                    <span>Created on {createdDateFormatted}</span>
                    <span>•</span>
                    <span>{totalPages} Pages</span>
                  </div>
                </div>

                <p className="text-[0.72vw] text-slate-600 font-normal max-w-[40vw] leading-relaxed">
                  {flipbook?.description || 'Explore interactive publications, user dwell metrics, reader locations, and engagement journeys across all devices.'}
                </p>

                <div className="flex items-center gap-[0.75vw] pt-[0.2vw]">
                  <button
                    onClick={() => setShareModalBook(flipbook)}
                    className="inline-flex items-center gap-[0.45vw] px-[0.9vw] py-[0.4vw] bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-[0.45vw] text-[0.74vw] font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    <Icon icon="energy-icons:share-20-bold" className="w-[0.85vw] h-[0.85vw] text-[#000000]" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => window.open(`/share/${shareId}`, '_blank')}
                    className="inline-flex items-center gap-[0.55vw] px-[1vw] py-[0.4vw] bg-[#0F172A] hover:bg-slate-800 text-white rounded-[0.45vw] text-[0.74vw] font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    <span>View Flipbook</span>
                    <Icon icon="akar-icons:arrow-right" className="w-[0.8vw] h-[0.8vw] text-[#FFFFFF]" />
                  </button>
                </div>
              </div>
            </div>

          <div className="flex items-center gap-[0.5vw] self-start">
            <button
              onClick={onRefresh}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-[0.35vw] px-[0.8vw] py-[0.4vw] bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-300 rounded-[0.45vw] text-[0.74vw] font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Icon icon="solar:restart-linear" className={`w-[0.85vw] h-[0.85vw] text-slate-600 ${refreshing ? 'animate-spin text-[#F05338]' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportDetailCSV}
              className="inline-flex items-center gap-[0.35vw] px-[0.8vw] py-[0.4vw] bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-300 rounded-[0.45vw] text-[0.74vw] font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Icon icon="solar:download-minimalistic-linear" className="w-[0.85vw] h-[0.85vw] text-slate-600" />
              <span>Download file</span>
            </button>
          </div>
        </div>

        {/* 5 Flipbook Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[0.8vw]">
          {detailStatCards.map((st) => (
            <div
              key={st.label}
              className="bg-white rounded-[0.75vw] p-[0.9vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-[0.75vw] transition-all hover:shadow-sm"
            >
              <div className={`w-[2.3vw] h-[2.3vw] rounded-[0.65vw] flex items-center justify-center shrink-0 ${st.iconBg} ${st.iconColor}`}>
                <Icon icon={st.icon} className="w-[1.15vw] h-[1.15vw]" />
              </div>
              <div className="min-w-0 flex-1">
                {loading ? (
                  <div className="space-y-[0.2vw]">
                    <div className="h-[1.2vw] w-[4.5vw] bg-slate-200/80 rounded-[0.25vw] animate-pulse" />
                    <div className="h-[0.7vw] w-[3vw] bg-slate-100 rounded-[0.2vw] animate-pulse" />
                  </div>
                ) : (
                  <>
                    <div className="text-[1.1vw] font-semibold text-slate-900 tracking-tight leading-tight truncate">
                      {st.value}
                    </div>
                    <div className="text-[0.68vw] text-slate-500 font-medium mt-[0.05vw] truncate">
                      {st.sub}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs - Sticky on scroll at top-0 */}
        <div className="sticky top-0 z-30 bg-[#F6F7F9] -mx-[1.5vw] px-[1.5vw] pt-[0.5vw] border-b border-slate-200 flex items-center gap-[1.8vw] text-[0.78vw] shadow-2xs">
          {[
            { id: 'readers', label: 'Readers' },
            { id: 'leads', label: 'Lead Form & Enquires' },
            { id: 'devices', label: 'Devices & Sources' },
            { id: 'locations', label: 'Locations' },
            { id: 'downloads', label: 'Downloads' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setDetailTab(tab.id);
                scrollToTop();
              }}
              className={`pb-[0.6vw] -mb-[1.5px] transition-colors relative cursor-pointer ${
                detailTab === tab.id
                  ? 'text-[#F05338] font-medium border-b-[3px] border-[#F05338]'
                  : 'text-slate-500 font-normal hover:text-slate-900 border-b-[3px] border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Content */}
        {detailTab === 'leads' && (
          <LeadFormTab timeline={detailTimeline} summary={summary} analyticsData={analyticsData} loading={loading} />
        )}

        {detailTab === 'devices' && (
          <DevicesSourcesTab analyticsData={analyticsData} summary={summary} loading={loading} />
        )}

        {detailTab === 'locations' && (
          <LocationsTab timeline={detailTimeline} analyticsData={analyticsData} summary={summary} loading={loading} />
        )}

        {detailTab === 'downloads' && (
          <DownloadsTab timeline={detailTimeline} analyticsData={analyticsData} summary={summary} loading={loading} />
        )}

        {detailTab === 'readers' && (
          <>
            {/* Readers Trend Heading */}
            <div className="flex items-center gap-[0.55vw] pt-[0.1vw]">
              <div className="w-[2.3vw] h-[2.3vw] rounded-[0.65vw] bg-[#E8F5FF] text-[#0284C7] flex items-center justify-center shrink-0">
                <Icon icon="cuida:user-outline" className="w-[1.15vw] h-[1.15vw]" />
              </div>
              <div>
                <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight ">
                  Readers Trend
                </h3>
                <p className="text-[0.7vw] text-slate-500 font-normal">
                  Monitor unique readers and reading activity over your selected period.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-[0.65vw] p-[0.85vw] px-[1vw] border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-end justify-between gap-[1vw]">
              {/* Left Side: Date Range label stacked on top */}
              <div className="flex flex-col gap-[0.35vw]">
                <span className="text-[0.85vw] text-black font-normal whitespace-nowrap">
                  Date Range
                </span>
                <div className="flex items-center gap-[0.75vw] flex-wrap">
                  <AnalyticsDatePicker
                    ref={datePickerRef}
                    className="w-[15.5vw] min-w-[210px]"
                    startDate={customRange.startDate}
                    endDate={customRange.endDate}
                    onChange={(range) => {
                      setCustomRange(range);
                      setDetailDatePreset('Custom');
                    }}
                  />

                  <div className="inline-flex items-center bg-white border border-slate-200 rounded-[0.45vw] p-[0.2vw] gap-[0.25vw]">
                    {['Today', 'Yesterday', '7 Days', '30 Days', 'Custom'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => {
                          setDetailDatePreset(preset);
                          if (preset === 'Custom') {
                            if (datePickerRef.current) {
                              datePickerRef.current.open();
                            }
                            return;
                          }
                          const end = new Date();
                          const start = new Date();
                          if (preset === 'Today') {
                            // start is today
                          } else if (preset === 'Yesterday') {
                            start.setDate(end.getDate() - 1);
                            end.setDate(end.getDate() - 1);
                          } else if (preset === '7 Days') {
                            start.setDate(end.getDate() - 6);
                          } else if (preset === '30 Days') {
                            start.setDate(end.getDate() - 29);
                          }
                          setCustomRange({ startDate: start, endDate: end });
                        }}
                        className={`px-[1.05vw] py-[0.38vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          detailDatePreset === preset
                            ? 'bg-[#EC5137] text-white shadow-xs'
                            : 'text-[#555555] hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>


            </div>

        {/* Readers Trend Chart */}
        <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-[0.5vw]">
            <h4 className="text-[0.85vw] font-semibold text-slate-900 ">
              Readers Analytics Table
            </h4>
            <div className="flex items-center gap-[0.35vw] text-[0.7vw] text-slate-600 font-medium">
              <span className="w-[0.5vw] h-[0.5vw] rounded-full bg-[#0BA6FF]"></span>
              <span>Total Views</span>
            </div>
          </div>

          <div className="relative w-full mt-[0.3vw]">
            <svg
              viewBox={`0 0 ${dChartW} ${dChartH}`}
              className="w-full h-auto overflow-visible select-none"
              onMouseLeave={() => setDetailHoverIdx(null)}
            >
              <defs>
                <linearGradient id="detailBlueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0BA6FF" stopOpacity="0.40" />
                  <stop offset="100%" stopColor="#0BA6FF" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Vertical dashed grid lines matching each X date tick */}
              {detailXLabels.map((pt) => (
                <line
                  key={`v-grid-${pt.dateKey}`}
                  x1={pt.x}
                  y1={dPadT}
                  x2={pt.x}
                  y2={dChartH - dPadB}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              ))}

              {dYTicks.map((val) => {
                const y = dPadT + dInnerH - (val / dYAxisMax) * dInnerH;
                return (
                  <g key={val}>
                    <line
                      x1={dPadL}
                      y1={y}
                      x2={dChartW - dPadR}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={dPadL - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fill="#1F2937"
                      fontSize="9.5"
                      fontWeight="normal"
                    >
                      {val === 0 ? '0' : Number(val.toFixed(val < 10 && val % 1 !== 0 ? 1 : 0)).toLocaleString()}
                    </text>
                  </g>
                );
              })}

              <path d={dAreaD} fill="url(#detailBlueGradient)" />
              <path
                d={dPathD}
                fill="none"
                stroke="#0BA6FF"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Vertical guideline for active/hovered point from top of chart to baseline */}
              {(() => {
                if (detailHoverIdx === null || !detailChartPoints[detailHoverIdx]) return null;
                const activePt = detailChartPoints[detailHoverIdx];
                return (
                  <line
                    x1={activePt.x}
                    y1={dPadT}
                    x2={activePt.x}
                    y2={dChartH - dPadB}
                    stroke="#0BA6FF"
                    strokeWidth="1.2"
                  />
                );
              })()}

              {/* X-axis date tick text rendered directly on SVG to match exact vertical ticks */}
              {detailXLabels.map((pt) => (
                <text
                  key={`x-lbl-${pt.dateKey}`}
                  x={pt.x}
                  y={dChartH - dPadB + 18}
                  textAnchor="middle"
                  fill="#1F2937"
                  fontSize="9.5"
                  fontWeight="normal"
                >
                  {pt.formattedShort}
                </text>
              ))}

              {detailChartPoints.map((pt) => {
                const isHover = detailHoverIdx === pt.idx;

                return (
                  <g
                    key={pt.dateKey}
                    className="cursor-pointer"
                    onMouseEnter={() => setDetailHoverIdx(pt.idx)}
                  >
                    <rect
                      x={pt.x - 14}
                      y={dPadT}
                      width={28}
                      height={dInnerH}
                      fill="transparent"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHover ? 4.5 : 2.5}
                      fill={isHover ? '#FFFFFF' : '#0BA6FF'}
                      stroke="#0BA6FF"
                      strokeWidth={isHover ? 2 : 1}
                    />
                  </g>
                );
              })}
            </svg>

            {(() => {
              if (detailHoverIdx === null || !detailChartPoints[detailHoverIdx]) return null;
              const activePt = detailChartPoints[detailHoverIdx];
              const isFarRight = activePt.x > dChartW * 0.7;

              return (
                <div
                  className="absolute bg-white px-[0.9vw] py-[0.6vw] rounded-[0.55vw] shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-slate-200 pointer-events-none transition-all duration-150 z-20 text-[0.72vw] whitespace-nowrap min-w-[150px]"
                  style={{
                    left: `${(activePt.x / dChartW) * 100}%`,
                    top: `${(activePt.y / dChartH) * 100}%`,
                    transform: isFarRight ? 'translate(-112%, -50%)' : 'translate(12%, -50%)'
                  }}
                >
                  <table className="border-collapse">
                    <tbody>
                      <tr className="leading-[1.5vw]">
                        <td className="text-slate-700 font-normal pr-[0.8vw]">Readers</td>
                        <td className="text-slate-700 font-normal px-[0.4vw] text-center">:</td>
                        <td className="text-slate-800 font-normal pl-[0.4vw] text-left whitespace-nowrap">{activePt.readers}</td>
                      </tr>
                      <tr className="leading-[1.5vw]">
                        <td className="text-slate-700 font-normal pr-[0.8vw]">Total Views</td>
                        <td className="text-slate-700 font-normal px-[0.4vw] text-center">:</td>
                        <td className="text-slate-800 font-normal pl-[0.4vw] text-left whitespace-nowrap">{activePt.views}</td>
                      </tr>
                      <tr className="leading-[1.5vw]">
                        <td className="text-slate-700 font-normal pr-[0.8vw]">Total Reading Time</td>
                        <td className="text-slate-700 font-normal px-[0.4vw] text-center">:</td>
                        <td className="text-slate-800 font-normal pl-[0.4vw] text-left whitespace-nowrap">{activePt.totalDuration || '0s'}</td>
                      </tr>
                      <tr className="leading-[1.5vw]">
                        <td className="text-slate-700 font-normal pr-[0.8vw]">Avg Reading Time</td>
                        <td className="text-slate-700 font-normal px-[0.4vw] text-center">:</td>
                        <td className="text-slate-800 font-normal pl-[0.4vw] text-left whitespace-nowrap">{activePt.avgDuration || '0s'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Readers Analytics Table */}
        <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-[0.9vw]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw]">
            <div>
              <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight ">
                Readers Analytics Table
              </h3>
              <p className="text-[0.7vw] text-slate-500 font-normal">
                View date-wise readers, views and reading time in detail.
              </p>
            </div>

            <div className="flex items-center gap-[0.5vw]">
              <div className="relative" ref={detailSortDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDetailSortOpen(!isDetailSortOpen)}
                  onKeyDown={handleDetailSortKeyDown}
                  aria-haspopup="listbox"
                  aria-expanded={isDetailSortOpen}
                  className="inline-flex items-center gap-[0.45vw] px-[0.9vw] py-[0.42vw] bg-white border-[1.5px] border-slate-300 hover:border-slate-400 rounded-[0.55vw] text-[0.76vw] text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#F05338]/20 transition-all cursor-pointer shadow-xs"
                >
                  <Icon icon="iconoir:sort" className="w-[0.95vw] h-[0.95vw] text-[#F05338]" />
                  <span className="font-normal">{detailTableSort}</span>
                  <Icon icon="solar:alt-arrow-down-linear" className="w-[0.7vw] h-[0.7vw] text-slate-400" />
                </button>

              {isDetailSortOpen && (
                <div
                  role="listbox"
                  onMouseLeave={() => setFocusedDetailSortIndex(-1)}
                  className="absolute right-0 mt-[0.4vw] w-[11.5vw] bg-white border border-slate-200 rounded-[0.55vw] shadow-[0_6px_24px_rgba(0,0,0,0.08)] py-[0.35vw] px-[0.3vw] z-30 text-[0.76vw] animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-[0.8vw] py-[0.3vw] text-[0.65vw] font-semibold tracking-wider uppercase text-slate-400">
                    Sort Table
                  </div>
                  {detailSortOptions.map((opt, idx) => {
                    const isCurrent = detailTableSort === opt.value;
                    const isFocused = focusedDetailSortIndex === idx;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => {
                          setDetailTableSort(opt.value);
                          setIsDetailSortOpen(false);
                          setFocusedDetailSortIndex(-1);
                          setDetailCurrentPage(1);
                        }}
                        onMouseEnter={() => setFocusedDetailSortIndex(idx)}
                        onMouseLeave={() => setFocusedDetailSortIndex(-1)}
                        className={`w-full text-left px-[0.8vw] py-[0.45vw] rounded-[0.4vw] transition-colors cursor-pointer flex items-center justify-between font-normal ${
                          isFocused
                            ? 'bg-orange-50/80 text-[#F05338]'
                            : isCurrent
                            ? 'bg-orange-50/50 text-[#F05338]'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isCurrent && (
                          <Icon icon="solar:check-read-linear" className="w-[0.8vw] h-[0.8vw] text-[#F05338]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              </div>

              <button
                type="button"
                onClick={handleExportDetailCSV}
                className="inline-flex items-center gap-[0.35vw] px-[0.85vw] py-[0.42vw] bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-300 rounded-[0.45vw] text-[0.74vw] font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Icon icon="solar:download-minimalistic-linear" className="w-[0.85vw] h-[0.85vw] text-slate-600" />
                <span>Download file</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-[0.65vw] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[0.76vw]">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 font-semibold text-[0.72vw] border-b border-slate-200 tracking-wide uppercase">
                    <th className="py-[0.7vw] px-[1vw]">Date</th>
                    <th className="py-[0.7vw] px-[1vw] text-center">Total Unique Readers</th>
                    <th className="py-[0.7vw] px-[1vw] text-center">Total Views</th>
                    <th className="py-[0.7vw] px-[1vw] text-center">Total Reading Time</th>
                    <th className="py-[0.7vw] px-[1vw] text-center">Avg Reading Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`detail-skel-${i}`} className="animate-pulse">
                        <td className="py-[0.7vw] px-[1vw]">
                          <div className="h-[0.6vw] w-[8vw] bg-slate-100 rounded" />
                        </td>
                        <td className="py-[0.7vw] px-[1vw] text-center">
                          <div className="h-[0.6vw] w-[2.5vw] bg-slate-100 rounded mx-auto" />
                        </td>
                        <td className="py-[0.7vw] px-[1vw] text-center">
                          <div className="h-[0.6vw] w-[2.5vw] bg-slate-100 rounded mx-auto" />
                        </td>
                        <td className="py-[0.7vw] px-[1vw] text-center">
                          <div className="h-[0.6vw] w-[3.5vw] bg-slate-100 rounded mx-auto" />
                        </td>
                        <td className="py-[0.7vw] px-[1vw] text-center">
                          <div className="h-[0.6vw] w-[3.5vw] bg-slate-100 rounded mx-auto" />
                        </td>
                      </tr>
                    ))
                  ) : paginatedDetailTimeline.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-[2.5vw] text-center text-slate-400 font-normal">
                        No activity found for this period.
                      </td>
                    </tr>
                  ) : (
                    paginatedDetailTimeline.map((row) => (
                      <tr key={row.dateKey} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-[0.7vw] px-[1vw] text-slate-900 font-normal">
                          {row.formattedFull}
                        </td>
                        <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                          {row.readers.toLocaleString()}
                        </td>
                        <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                          {row.views.toLocaleString()}
                        </td>
                        <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                          {row.totalDuration || '0s'}
                        </td>
                        <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                          {row.avgDuration || '0s'}
                        </td>
                      </tr>
                    ))
                  )}

                  {/* Summary Total Row */}
                  <tr className="bg-slate-50/80 font-normal border-t-2 border-slate-200">
                    <td className="py-[0.7vw] px-[1vw] text-slate-900 font-normal">
                      Total
                    </td>
                    <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                      {(summary.uniqueVisitors || 0).toLocaleString()}
                    </td>
                    <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                      {(summary.totalViews || 0).toLocaleString()}
                    </td>
                    <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                      {formatDuration(summary.totalDuration || 0)}
                    </td>
                    <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                      {formatDuration(summary.avgDuration || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {sortedDetailTimeline.length > 0 && (
            <div className="flex items-center justify-between pt-[0.4vw] text-[0.72vw]">
              <span className="text-black font-medium">
                Showing {Math.min((detailCurrentPage - 1) * detailPageSize + 1, sortedDetailTimeline.length)}–{Math.min(detailCurrentPage * detailPageSize, sortedDetailTimeline.length)} of {sortedDetailTimeline.length}
              </span>

              <div className="flex items-center gap-[0.3vw]">
                {Array.from({ length: detailTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setDetailCurrentPage(page)}
                    className={`w-[1.6vw] h-[1.6vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer flex items-center justify-center ${
                      detailCurrentPage === page
                        ? 'bg-[#F05338] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </>
        )}

        </div>
      </div>

      {shareModalBook && (
        <ShareModal
          isOpen={Boolean(shareModalBook)}
          onClose={() => setShareModalBook(null)}
          currentBook={shareModalBook}
          flipbook={shareModalBook}
        />
      )}

    </div>
  );
}
