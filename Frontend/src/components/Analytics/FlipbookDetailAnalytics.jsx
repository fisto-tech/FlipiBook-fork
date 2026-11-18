import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import LazyPreview from '../MyFlipbooks/LazyPreview';
import ShareModal from '../ShareModal';
import { formatDuration, formatShortDate, formatFullDate, scrollToTop } from './analyticsUtils';
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
  const [detailTableSort, setDetailTableSort] = useState('Date (Newest)');
  const [isDetailSortOpen, setIsDetailSortOpen] = useState(false);
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

  // Filtered sidebar list
  const sidebarBooks = useMemo(() => {
    if (!detailSidebarSearch.trim()) return flipbooks;
    const q = detailSidebarSearch.toLowerCase();
    return flipbooks.filter(b => (b.flipbookName || '').toLowerCase().includes(q));
  }, [flipbooks, detailSidebarSearch]);

  // Aggregate stats
  const summary = useMemo(() => {
    const tv = analyticsData?.summary?.totalViews || analyticsData?.totalViews || flipbook?.viewsCount || flipbook?.views || 0;
    const uv = analyticsData?.summary?.uniqueViewers || analyticsData?.uniqueVisitors || (tv > 0 ? Math.round(tv * 0.8) : 0);
    const ad = analyticsData?.summary?.avgDurationSeconds || analyticsData?.avgDurationSeconds || 0;
    const td = analyticsData?.summary?.totalDurationSeconds || analyticsData?.totalDurationSeconds || (tv * ad);
    const topDev = analyticsData?.devices?.[0]?.type || 'Desktop';
    const topLoc = analyticsData?.states?.[0]?.state || analyticsData?.countries?.[0]?.country || 'Unknown';

    const formatCount = (count) => {
      const num = Number(count) || 0;
      if (num === 0) return '0';
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
      return `${num}`;
    };

    return {
      totalViews: tv,
      uniqueVisitors: uv,
      avgDuration: ad,
      totalDuration: td,
      shares: analyticsData?.shares || (tv > 0 ? Math.round(tv * 0.15) : 0),
      downloads: analyticsData?.downloads || (tv > 0 ? Math.round(tv * 0.08) : 0),
      leads: tv > 0 ? Math.round(tv * 0.22) : 0,
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
      icon: 'solar:user-bold',
      iconColor: 'text-[#0284C7]',
      iconBg: 'bg-[#E0F2FE]'
    },
    {
      label: 'Total Lead Recived',
      value: summary.formatCount(summary.leads),
      sub: 'Total Lead Recived',
      icon: 'solar:document-text-bold',
      iconColor: 'text-[#F05338]',
      iconBg: 'bg-[#FFEDE8]'
    },
    {
      label: 'Top Device',
      value: summary.topDevice || 'DESKTOP',
      sub: 'Top Device',
      icon: 'solar:laptop-minimalistic-bold',
      iconColor: 'text-[#7C3AED]',
      iconBg: 'bg-[#EDE9FE]'
    },
    {
      label: 'Top Location',
      value: summary.topLocation || 'LOCAL',
      sub: 'Top Location',
      icon: 'solar:map-point-wave-bold',
      iconColor: 'text-[#16A34A]',
      iconBg: 'bg-[#DCFCE7]'
    },
    {
      label: 'Total Downloads',
      value: summary.formatCount(summary.downloads),
      sub: 'Total Downloads',
      icon: 'solar:download-minimalistic-bold',
      iconColor: 'text-[#D97706]',
      iconBg: 'bg-[#FEF3C7]'
    }
  ];

  // 7-day timeline for chart and table
  const rawDailyViews = analyticsData?.dailyViews || [];
  const detailTimeline = useMemo(() => {
    const result = [];
    const now = new Date();
    const count = 7;
    for (let i = count - 1; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(now.getDate() - i);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      const found = rawDailyViews.find(d => d._id === key);
      const views = found ? Number(found.views) || 0 : 0;
      const readers = found ? (found.readers || Math.max(0, Math.round(views * 0.8))) : 0;
      const durationSeconds = found ? (found.avgDuration || summary.avgDuration || 0) : 0;
      result.push({
        dateKey: key,
        dt,
        formattedShort: `${String(dt.getDate()).padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][dt.getMonth()]}`,
        formattedFull: formatFullDate(dt),
        views,
        readers,
        totalDuration: formatDuration(views * durationSeconds),
        avgDuration: formatDuration(durationSeconds)
      });
    }
    return result;
  }, [rawDailyViews, summary]);

  const dateRangeLabel = detailTimeline.length >= 2
    ? `${formatShortDate(detailTimeline[0].dt)}, 2026 - ${formatShortDate(detailTimeline[detailTimeline.length - 1].dt)}, 2026`
    : 'Oct 16, 2026 - Oct 22, 2026';

  // Export CSV
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
    return arr;
  }, [detailTimeline, detailTableSort]);

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
  const dPadL = 44;
  const dPadR = 28;
  const dPadT = 24;
  const dPadB = 30;
  const dInnerW = dChartW - dPadL - dPadR;
  const dInnerH = dChartH - dPadT - dPadB;

  const dMaxViews = Math.max(...detailTimeline.map(d => d.views), 100);
  const dYAxisMax = Math.ceil(dMaxViews / 200) * 200 || 1000;
  const dYTicks = [0, dYAxisMax * 0.2, dYAxisMax * 0.4, dYAxisMax * 0.6, dYAxisMax * 0.8, dYAxisMax];

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
    let d = `M ${detailChartPoints[0].x} ${detailChartPoints[0].y}`;
    for (let i = 0; i < detailChartPoints.length - 1; i++) {
      d += ` L ${detailChartPoints[i + 1].x} ${detailChartPoints[i + 1].y}`;
    }
    const first = detailChartPoints[0];
    const last = detailChartPoints[detailChartPoints.length - 1];
    const area = `${d} L ${last.x} ${dChartH - dPadB} L ${first.x} ${dChartH - dPadB} Z`;
    return { dPathD: d, dAreaD: area };
  }, [detailChartPoints, dChartH, dPadB]);

  return (
    <div className="w-full min-h-screen bg-[#FDFBF9] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 antialiased flex">

      {/* 1. LEFT SIDEBAR */}
      <div className="w-[17.5vw] min-w-[220px] max-w-[290px] bg-white border-r border-slate-200/90 flex flex-col shrink-0 min-h-screen">
        <div className="p-[0.9vw] border-b border-slate-100">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-[0.35vw] text-[0.76vw] font-medium text-[#F05338] hover:text-[#d43f26] transition-colors cursor-pointer group"
          >
            <Icon icon="solar:arrow-left-linear" className="w-[0.9vw] h-[0.9vw] transition-transform group-hover:-translate-x-0.5" />
            <span>Go to Analytics Dashboard</span>
          </button>
        </div>

        <div className="p-[0.75vw] border-b border-slate-100 flex items-center gap-[0.4vw]">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="w-[0.8vw] h-[0.8vw] text-slate-400 absolute left-[0.55vw] top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Flipbooks..."
              value={detailSidebarSearch}
              onChange={(e) => setDetailSidebarSearch(e.target.value)}
              className="w-full pl-[1.8vw] pr-[0.5vw] py-[0.32vw] bg-slate-50 border border-slate-200 rounded-[0.4vw] text-[0.72vw] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F05338]"
            />
          </div>
          <button
            title="Filter"
            className="p-[0.35vw] rounded-[0.4vw] border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer"
          >
            <Icon icon="solar:tuning-2-linear" className="w-[0.8vw] h-[0.8vw]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/70">
          {sidebarBooks.map((b) => {
            const isSelected = b.v_id === flipbook?.v_id;
            const viewsCount = b.viewsCount || b.views || 0;
            const dateStr = formatShortDate(b.updatedAt || b.createdAt);

            return (
              <div
                key={b.v_id}
                onClick={() => onSelectBook(b.v_id)}
                className={`p-[0.65vw] flex items-center gap-[0.6vw] cursor-pointer transition-colors ${
                  isSelected ? 'bg-orange-50/70 border-l-4 border-l-[#F05338]' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="w-[2.4vw] h-[1.9vw] rounded-[0.3vw] bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {b.thumbnailUrl || b.coverImage ? (
                    <img src={b.thumbnailUrl || b.coverImage} alt={b.flipbookName} className="w-full h-full object-cover" />
                  ) : (
                    <LazyPreview v_id={b.v_id} emailId={userEmail} title={b.flipbookName} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.75vw] font-medium text-slate-900 truncate">
                    {b.flipbookName || 'Untitled Flipbook'}
                  </div>
                  <div className="text-[0.65vw] text-slate-500 mt-[0.05vw]">
                    {viewsCount.toLocaleString()} Views • {dateStr}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 p-[1.5vw] space-y-[1.1vw] overflow-x-hidden">

        {/* Hero Card */}
        <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-[1vw]">
          <div className="flex items-start gap-[1vw]">
            <div className="w-[5vw] h-[6.2vw] rounded-[0.45vw] bg-slate-100 border border-slate-200 shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
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

            <div className="space-y-[0.25vw]">
              <h2 className="text-[1.35vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif] leading-tight">
                {bookTitle}
              </h2>
              <div className="flex items-center gap-[0.5vw] text-[0.74vw] text-slate-600 font-medium">
                {isPublic ? (
                  <span className="inline-flex items-center gap-[0.2vw] px-[0.5vw] py-[0.1vw] rounded-full bg-emerald-50 text-emerald-700 text-[0.68vw] font-medium border border-emerald-200/70">
                    <Icon icon="solar:global-linear" className="w-[0.75vw] h-[0.75vw]" />
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
              <p className="text-[0.72vw] text-slate-600 font-normal max-w-[40vw] leading-relaxed">
                {flipbook?.description || 'Explore interactive publications, user dwell metrics, reader locations, and engagement journeys across all devices.'}
              </p>

              <div className="flex items-center gap-[0.6vw] pt-[0.3vw]">
                <button className="cursor-pointer"
                  onClick={() => setShareModalBook(flipbook)}
                  className="inline-flex items-center gap-[0.35vw] px-[0.9vw] py-[0.4vw] bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-[0.45vw] text-[0.74vw] font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <Icon icon="solar:share-linear" className="w-[0.85vw] h-[0.85vw] text-slate-600" />
                  <span>Share</span>
                </button>

                <button className="cursor-pointer"
                  onClick={() => window.open(`/share/${shareId}`, '_blank')}
                  className="inline-flex items-center gap-[0.35vw] px-[1vw] py-[0.4vw] bg-[#0F172A] hover:bg-slate-800 text-white rounded-[0.45vw] text-[0.74vw] font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <span>View Flipbook</span>
                  <Icon icon="solar:arrow-right-linear" className="w-[0.8vw] h-[0.8vw]" />
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
              className="bg-white rounded-[0.75vw] p-[0.9vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-[0.75vw]"
            >
              <div className={`w-[2.1vw] h-[2.1vw] rounded-full flex items-center justify-center shrink-0 ${st.iconBg} ${st.iconColor}`}>
                <Icon icon={st.icon} className="w-[1.05vw] h-[1.05vw]" />
              </div>
              <div>
                <div className="text-[1.1vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif] leading-tight">
                  {st.value}
                </div>
                <div className="text-[0.68vw] text-slate-500 font-medium mt-[0.05vw]">
                  {st.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-[1.8vw] text-[0.78vw] font-medium pt-[0.2vw]">
          {[
            { id: 'readers', label: 'Readers' },
            { id: 'leads', label: 'Lead Form & Enquires' },
            { id: 'devices', label: 'Devices & Sources' },
            { id: 'locations', label: 'Locations' },
            { id: 'downloads', label: 'Downloads' },
          ].map(tab => (
            <button className="cursor-pointer"
              key={tab.id}
              onClick={() => {
                setDetailTab(tab.id);
                scrollToTop();
              }}
              className={`pb-[0.55vw] font-medium transition-colors relative cursor-pointer ${
                detailTab === tab.id
                  ? 'text-[#F05338] border-b-2 border-[#F05338]'
                  : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Content */}
        {detailTab === 'leads' && (
          <LeadFormTab timeline={detailTimeline} summary={summary} analyticsData={analyticsData} />
        )}

        {detailTab === 'devices' && (
          <DevicesSourcesTab analyticsData={analyticsData} summary={summary} />
        )}

        {detailTab === 'locations' && (
          <LocationsTab timeline={detailTimeline} analyticsData={analyticsData} summary={summary} />
        )}

        {detailTab === 'downloads' && (
          <DownloadsTab timeline={detailTimeline} analyticsData={analyticsData} summary={summary} />
        )}

        {detailTab === 'readers' && (
          <>
            {/* Readers Trend Heading */}
            <div className="flex items-center gap-[0.5vw] pt-[0.1vw]">
              <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-blue-50 text-[#0284C7] flex items-center justify-center shrink-0">
                <Icon icon="solar:user-bold" className="w-[0.95vw] h-[0.95vw]" />
              </div>
              <div>
                <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  Readers Trend
                </h3>
                <p className="text-[0.7vw] text-slate-500 font-normal">
                  Monitor unique readers and reading activity over your selected period.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-[0.65vw] p-[0.55vw] px-[0.8vw] border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-[0.6vw]">
              <div className="flex items-center gap-[0.7vw] flex-wrap">
                <span className="text-[0.7vw] text-slate-500 font-medium">Date Range</span>
                <AnalyticsDatePicker
                  startDate={customRange.startDate}
                  endDate={customRange.endDate}
                  onChange={(range) => {
                    setCustomRange(range);
                    setDetailDatePreset('Custom');
                  }}
                />

                <div className="inline-flex items-center gap-[0.25vw]">
                  {['Today', 'Yesterday', '7 Days', '30 Days', 'Custom'].map(preset => (
                    <button className="cursor-pointer"
                      key={preset}
                      onClick={() => {
                        setDetailDatePreset(preset);
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
                      className={`px-[0.65vw] py-[0.3vw] rounded-[0.35vw] text-[0.7vw] font-medium transition-colors cursor-pointer ${
                        detailDatePreset === preset
                          ? 'bg-[#F05338] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-[0.5vw]">
                <span className="text-[0.7vw] text-slate-500 font-medium">Group By</span>
                <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-[0.4vw] p-[0.12vw]">
                  {['Date', 'Week', 'Month'].map(grp => (
                    <button className="cursor-pointer"
                      key={grp}
                      onClick={() => setDetailGroupBy(grp)}
                      className={`px-[0.65vw] py-[0.28vw] rounded-[0.3vw] text-[0.68vw] font-medium transition-colors cursor-pointer ${
                        detailGroupBy === grp
                          ? 'bg-[#F05338] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

        {/* Readers Trend Chart */}
        <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-[0.5vw]">
            <h4 className="text-[0.85vw] font-semibold text-slate-900 font-['Outfit',sans-serif]">
              Readers Analytics Table
            </h4>
            <div className="flex items-center gap-[0.35vw] text-[0.7vw] text-slate-600 font-medium">
              <span className="w-[0.5vw] h-[0.5vw] rounded-full bg-[#0284C7]"></span>
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
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {dYTicks.map((val) => {
                const y = dPadT + dInnerH - (val / dYAxisMax) * dInnerH;
                return (
                  <g key={val}>
                    <line
                      x1={dPadL}
                      y1={y}
                      x2={dChartW - dPadR}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                      strokeDasharray={val === 0 ? 'none' : '3 3'}
                    />
                    <text
                      x={dPadL - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fill="#64748B"
                      fontSize="11"
                      fontWeight="500"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {val === 0 ? '0' : val.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              <path d={dAreaD} fill="url(#detailBlueGradient)" />
              <path
                d={dPathD}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {detailChartPoints.map((pt) => {
                const isHover = detailHoverIdx === pt.idx;
                const isHighlighted = isHover || (detailHoverIdx === null && (pt.views > 0 || pt.idx === detailChartPoints.length - 1));

                return (
                  <g
                    key={pt.dateKey}
                    className="cursor-pointer"
                    onMouseEnter={() => setDetailHoverIdx(pt.idx)}
                  >
                    <rect
                      x={pt.x - 12}
                      y={dPadT}
                      width={24}
                      height={dInnerH}
                      fill="transparent"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHighlighted ? 5.5 : 3.5}
                      fill={isHighlighted ? '#FFFFFF' : '#0284C7'}
                      stroke="#0284C7"
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                    />
                  </g>
                );
              })}

              {(() => {
                if (detailHoverIdx === null) return null;
                const activePt = detailChartPoints[detailHoverIdx];
                if (!activePt) return null;
                return (
                  <line
                    x1={activePt.x}
                    y1={dPadT}
                    x2={activePt.x}
                    y2={dChartH - dPadB}
                    stroke="#38BDF8"
                    strokeWidth="1.2"
                    opacity="0.85"
                  />
                );
              })()}
            </svg>

            {(() => {
              if (detailHoverIdx === null) return null;
              const activePt = detailChartPoints[detailHoverIdx];
              if (!activePt) return null;

              return (
                <div
                  className="absolute bg-white px-[0.8vw] py-[0.55vw] rounded-[0.55vw] shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-slate-200 pointer-events-none transition-all duration-150 z-10 text-[0.7vw] space-y-[0.25vw]"
                  style={{
                    left: `${(activePt.x / dChartW) * 100}%`,
                    top: `${(activePt.y / dChartH) * 100}%`,
                    transform: 'translate(10%, -60%)'
                  }}
                >
                  <div className="flex items-center justify-between gap-[1.2vw]">
                    <span className="text-slate-500 font-medium">Readers</span>
                    <span className="text-slate-900 font-semibold">: {activePt.readers}</span>
                  </div>
                  <div className="flex items-center justify-between gap-[1.2vw]">
                    <span className="text-slate-500 font-medium">Total Views</span>
                    <span className="text-slate-900 font-semibold">: {activePt.views}</span>
                  </div>
                  <div className="flex items-center justify-between gap-[1.2vw]">
                    <span className="text-slate-500 font-medium">Total Reading Time</span>
                    <span className="text-slate-900 font-semibold">: {activePt.totalDuration || '0s'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-[1.2vw]">
                    <span className="text-slate-500 font-medium">Avg Reading Time</span>
                    <span className="text-slate-900 font-semibold">: {activePt.avgDuration || '0s'}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-between items-center text-[0.68vw] text-slate-600 font-semibold px-[0.5vw] mt-[0.3vw]">
              {detailChartPoints.map(pt => (
                <span key={pt.dateKey}>{pt.formattedShort}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Readers Analytics Table */}
        <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-[0.9vw]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw]">
            <div>
              <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                Readers Analytics Table
              </h3>
              <p className="text-[0.7vw] text-slate-500 font-normal">
                View date-wise readers, views and reading time in detail.
              </p>
            </div>

            <div className="flex items-center gap-[0.5vw]">
              <div className="relative">
                <button className="cursor-pointer"
                  onClick={() => setIsDetailSortOpen(!isDetailSortOpen)}
                  className="inline-flex items-center gap-[0.4vw] px-[0.75vw] py-[0.32vw] bg-white border border-slate-200 rounded-[0.4vw] text-[0.7vw] text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  <Icon icon="solar:sort-vertical-linear" className="w-[0.8vw] h-[0.8vw] text-[#F05338]" />
                  <span>{detailTableSort}</span>
                  <Icon icon="solar:alt-arrow-down-linear" className="w-[0.65vw] h-[0.65vw] text-slate-400" />
                </button>

                {isDetailSortOpen && (
                  <div className="absolute right-0 mt-[0.25vw] w-[8vw] bg-white border border-slate-200 rounded-[0.4vw] shadow-lg py-[0.25vw] z-20 text-[0.7vw]">
                    {['Most viewed', 'Date (Newest)', 'Date (Oldest)'].map(s => (
                      <button className="cursor-pointer"
                        key={s}
                        onClick={() => { setDetailTableSort(s); setIsDetailSortOpen(false); }}
                        className="w-full text-left px-[0.7vw] py-[0.3vw] hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleExportDetailCSV}
                className="inline-flex items-center gap-[0.35vw] px-[0.75vw] py-[0.32vw] bg-[#FFF2EE] hover:bg-[#FFE6E0] text-[#F05338] border border-orange-200 rounded-[0.4vw] text-[0.7vw] font-medium transition-colors cursor-pointer"
              >
                <Icon icon="solar:download-minimalistic-linear" className="w-[0.8vw] h-[0.8vw]" />
                <span>Download file</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-[0.6vw] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[0.74vw]">
                <thead>
                  <tr className="bg-[#FAF9F7] text-slate-600 font-medium text-[0.7vw] border-b border-slate-200">
                    <th className="py-[0.65vw] px-[1vw] font-medium">Date</th>
                    <th className="py-[0.65vw] px-[1vw] font-medium text-center">Total Unique Readers</th>
                    <th className="py-[0.65vw] px-[1vw] font-medium text-center">Total Views</th>
                    <th className="py-[0.65vw] px-[1vw] font-medium text-center">Total Reading Time</th>
                    <th className="py-[0.65vw] px-[1vw] font-medium text-center">Avg Reading Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedDetailTimeline.map((row) => (
                    <tr key={row.dateKey} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-[0.65vw] px-[1vw] text-slate-800 font-medium">
                        {row.formattedFull}
                      </td>
                      <td className="py-[0.65vw] px-[1vw] text-center text-slate-800 font-medium">
                        {row.readers}
                      </td>
                      <td className="py-[0.65vw] px-[1vw] text-center text-slate-800 font-medium">
                        {row.views}
                      </td>
                      <td className="py-[0.65vw] px-[1vw] text-center text-slate-800 font-medium">
                        {row.totalDuration || '0s'}
                      </td>
                      <td className="py-[0.65vw] px-[1vw] text-center text-slate-800 font-medium">
                        {row.avgDuration || '0s'}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-slate-50/80 font-semibold border-t-2 border-slate-200">
                    <td className="py-[0.65vw] px-[1vw] text-slate-900 font-semibold">
                      Total
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-center text-slate-900 font-semibold">
                      {summary.uniqueVisitors || 0}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-center text-slate-900 font-semibold">
                      {summary.totalViews || 0}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-center text-slate-900 font-semibold">
                      {formatDuration(summary.totalDuration || 0)}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-center text-slate-900 font-semibold">
                      {formatDuration(summary.avgDuration || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </>
        )}

      </div>

      {shareModalBook && (
        <ShareModal
          isOpen={Boolean(shareModalBook)}
          onClose={() => setShareModalBook(null)}
          flipbook={shareModalBook}
        />
      )}

    </div>
  );
}
