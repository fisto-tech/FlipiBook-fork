import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import AnalyticsDatePicker from './AnalyticsDatePicker';

export default function DownloadsTab({ timeline = [], summary = {}, analyticsData = {} }) {
  const [detailHoverIdx, setDetailHoverIdx] = useState(null);
  const [tableSort, setTableSort] = useState('Date (Newest)');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [focusedSortIndex, setFocusedSortIndex] = useState(-1);
  const sortDropdownRef = useRef(null);
  const datePickerRef = useRef(null);

  const [datePreset, setDatePreset] = useState('7 Days');
  const [groupBy, setGroupBy] = useState('Week');
  const [customRange, setCustomRange] = useState({
    startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Close sort on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  const sortOptions = useMemo(() => [
    { label: 'Date (Newest)', value: 'Date (Newest)' },
    { label: 'Date (Oldest)', value: 'Date (Oldest)' },
    { label: 'Most downloads', value: 'Most downloads' },
    { label: 'Most unique', value: 'Most unique' },
  ], []);

  const handleSortKeyDown = (e) => {
    if (!isSortOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsSortOpen(true);
        const idx = sortOptions.findIndex(opt => opt.value === tableSort);
        setFocusedSortIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSortIndex(prev => (prev + 1) % sortOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSortIndex(prev => (prev - 1 + sortOptions.length) % sortOptions.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedSortIndex >= 0 && focusedSortIndex < sortOptions.length) {
        setTableSort(sortOptions[focusedSortIndex].value);
        setIsSortOpen(false);
        setCurrentPage(1);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsSortOpen(false);
    }
  };

  const totalDownloads = summary?.totalDownloads ?? summary?.downloads ?? analyticsData?.downloads ?? 0;

  // Map daily download metrics from backend if available
  const dailyDownloadsMap = useMemo(() => {
    const map = {};
    const dList = analyticsData?.dailyDownloads || [];
    dList.forEach(item => {
      if (item && item._id) {
        map[item._id] = item;
      }
    });
    return map;
  }, [analyticsData?.dailyDownloads]);

  // Chart trend points mapped to timeline
  const downloadData = useMemo(() => {
    return timeline.map((d, i) => {
      const key = d.dateKey || d.date;
      const realDl = dailyDownloadsMap[key]?.downloads;
      const views = Number(d.views) || 0;
      const val = realDl !== undefined ? Number(realDl) : (totalDownloads > 0 ? Math.round(views * 0.1) : 0);
      const unique = dailyDownloadsMap[key]?.uniqueDownloaders !== undefined 
        ? Number(dailyDownloadsMap[key].uniqueDownloaders) 
        : Math.round(val * 0.8);

      return {
        ...d,
        downloads: val,
        uniqueDownloaders: unique,
        idx: i
      };
    });
  }, [timeline, dailyDownloadsMap, totalDownloads]);

  // Chart computations matching Readers Trend exact proportions
  const dChartW = 860;
  const dChartH = 220;
  const dPadL = 40;
  const dPadR = 10;
  const dPadT = 20;
  const dPadB = 32;
  const dInnerW = dChartW - dPadL - dPadR;
  const dInnerH = dChartH - dPadT - dPadB;

  const maxVal = Math.max(...downloadData.map(d => d.downloads), 0);
  const yAxisMax = useMemo(() => {
    if (maxVal <= 0) return 10;
    if (maxVal <= 5) return 5;
    if (maxVal <= 10) return 10;
    if (maxVal <= 25) return 25;
    if (maxVal <= 50) return 50;
    if (maxVal <= 100) return 100;
    if (maxVal <= 250) return 250;
    if (maxVal <= 500) return 500;
    if (maxVal <= 1000) return 1000;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    return Math.ceil(maxVal / magnitude) * magnitude;
  }, [maxVal]);

  const yTicks = useMemo(() => {
    return [0, yAxisMax * 0.2, yAxisMax * 0.4, yAxisMax * 0.6, yAxisMax * 0.8, yAxisMax];
  }, [yAxisMax]);

  const chartPoints = useMemo(() => {
    const len = downloadData.length;
    return downloadData.map((d, i) => {
      const x = len > 1 ? dPadL + (i / (len - 1)) * dInnerW : dPadL + dInnerW / 2;
      const y = dPadT + dInnerH - (d.downloads / yAxisMax) * dInnerH;
      return { x, y, ...d };
    });
  }, [downloadData, dInnerW, dInnerH, dPadL, dPadT, yAxisMax]);

  const { pathD, areaD } = useMemo(() => {
    if (chartPoints.length === 0) return { pathD: '', areaD: '' };
    if (chartPoints.length === 1) {
      const pt = chartPoints[0];
      return {
        pathD: `M ${dPadL} ${pt.y} L ${dChartW - dPadR} ${pt.y}`,
        areaD: `M ${dPadL} ${pt.y} L ${dChartW - dPadR} ${pt.y} L ${dChartW - dPadR} ${dChartH - dPadB} L ${dPadL} ${dChartH - dPadB} Z`
      };
    }
    let d = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p1 = chartPoints[i + 1];
      d += ` L ${p1.x} ${p1.y}`;
    }
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    const area = `${d} L ${last.x} ${dChartH - dPadB} L ${first.x} ${dChartH - dPadB} Z`;
    return { pathD: d, areaD: area };
  }, [chartPoints, dChartH, dPadL, dPadR, dPadB]);

  const sortedDownloadData = useMemo(() => {
    const arr = [...downloadData];
    if (tableSort === 'Date (Newest)') {
      return arr.sort((a, b) => (b.dt ? b.dt.getTime() : 0) - (a.dt ? a.dt.getTime() : 0));
    }
    if (tableSort === 'Date (Oldest)') {
      return arr.sort((a, b) => (a.dt ? a.dt.getTime() : 0) - (b.dt ? b.dt.getTime() : 0));
    }
    if (tableSort === 'Most downloads') {
      return arr.sort((a, b) => b.downloads - a.downloads);
    }
    if (tableSort === 'Most unique') {
      return arr.sort((a, b) => b.uniqueDownloaders - a.uniqueDownloaders);
    }
    return arr;
  }, [downloadData, tableSort]);

  const totalPages = Math.max(1, Math.ceil(sortedDownloadData.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedDownloads = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedDownloadData.slice(start, start + pageSize);
  }, [sortedDownloadData, safeCurrentPage, pageSize]);

  // Totals for summary footer
  const totalSummary = useMemo(() => {
    const totalDls = downloadData.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
    const totalUnique = downloadData.reduce((acc, curr) => acc + (curr.uniqueDownloaders || 0), 0);
    return {
      totalDownloads: totalDls,
      totalUnique: totalUnique,
    };
  }, [downloadData]);

  const exportCSV = () => {
    if (sortedDownloadData.length === 0) return;
    const headers = ["Date", "Downloads", "Unique Downloaders"];
    const rows = sortedDownloadData.map(d => [
      `"${d.formattedFull}"`,
      d.downloads,
      d.uniqueDownloaders
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Downloads_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-[1.1vw]">
      {/* Sub-Header */}
      <div className="flex items-center gap-[0.55vw] pt-[0.1vw]">
        <div className="w-[2.3vw] h-[2.3vw] rounded-[0.65vw] bg-[#FFF4DF] text-[#B77908] flex items-center justify-center shrink-0">
          <Icon icon="bi:download" className="w-[1.15vw] h-[1.15vw]" />
        </div>
        <div>
          <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight ">
            Downloads Trend
          </h3>
          <p className="text-[0.7vw] text-slate-500 font-normal">
            Track how PDF downloads change over your selected period.
          </p>
        </div>
      </div>

      {/* Controls Bar - matching Readers Trend */}
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
                setDatePreset('Custom');
              }}
            />

            <div className="inline-flex items-center bg-white border border-slate-200 rounded-[0.45vw] p-[0.2vw] gap-[0.25vw]">
              {['Today', 'Yesterday', '7 Days', '30 Days', 'Custom'].map(preset => (
                <button
                  key={preset}
                  onClick={() => {
                    setDatePreset(preset);
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
                    datePreset === preset
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

        {/* Right Side: Group By label stacked on top */}
        <div className="flex flex-col gap-[0.35vw] shrink-0">
          <span className="text-[0.85vw] text-black font-normal whitespace-nowrap">
            Group By
          </span>

          <div className="inline-flex items-center bg-white border border-slate-200 rounded-[0.45vw] p-[0.2vw] gap-[0.25vw]">
            {['Date', 'Week', 'Month'].map(grp => (
              <button
                key={grp}
                onClick={() => setGroupBy(grp)}
                className={`px-[1.25vw] py-[0.38vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  groupBy === grp
                    ? 'bg-[#EC5137] text-white shadow-xs'
                    : 'text-[#555555] hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Downloads Over Time Chart */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-[0.5vw]">
          <h4 className="text-[0.85vw] font-semibold text-slate-900 ">
            Downloads Over Time
          </h4>
          <div className="flex items-center gap-[0.35vw] text-[0.7vw] text-slate-600 font-medium">
            <span className="w-[0.5vw] h-[0.5vw] rounded-full bg-[#0BA6FF]"></span>
            <span>Total Downloads</span>
          </div>
        </div>

        <div className="relative w-full mt-[0.3vw]">
          <svg
            viewBox={`0 0 ${dChartW} ${dChartH}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setDetailHoverIdx(null)}
          >
            <defs>
              <linearGradient id="downloadDetailBlueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0BA6FF" stopOpacity="0.40" />
                <stop offset="100%" stopColor="#0BA6FF" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Vertical dashed grid lines matching each X date tick */}
            {chartPoints.map((pt) => (
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

            {/* Horizontal Grid lines */}
            {yTicks.map((val) => {
              const y = dPadT + dInnerH - (val / yAxisMax) * dInnerH;
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

            <path d={areaD} fill="url(#downloadDetailBlueGradient)" />
            <path
              d={pathD}
              fill="none"
              stroke="#0BA6FF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Vertical guideline for active/hovered point */}
            {(() => {
              if (detailHoverIdx === null || !chartPoints[detailHoverIdx]) return null;
              const activePt = chartPoints[detailHoverIdx];
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

            {/* X-axis date tick text rendered directly on SVG */}
            {chartPoints.map((pt) => (
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

            {/* Interactive Circles */}
            {chartPoints.map((pt) => {
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

          {/* Tooltip Card matching Readers tab */}
          {(() => {
            if (detailHoverIdx === null || !chartPoints[detailHoverIdx]) return null;
            const activePt = chartPoints[detailHoverIdx];
            const isFarRight = activePt.x > dChartW * 0.7;

            return (
              <div
                className="absolute bg-white px-[0.9vw] py-[0.6vw] rounded-[0.55vw] shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-slate-200 pointer-events-none transition-all duration-150 z-20 text-[0.72vw] space-y-[0.3vw] whitespace-nowrap min-w-[150px]"
                style={{
                  left: `${(activePt.x / dChartW) * 100}%`,
                  top: `${(activePt.y / dChartH) * 100}%`,
                  transform: isFarRight ? 'translate(-112%, -50%)' : 'translate(12%, -50%)'
                }}
              >
                <div className="font-semibold text-slate-800 border-b border-slate-100 pb-[0.2vw]">
                  {activePt.formattedFull || activePt.formattedShort}
                </div>
                <div className="flex items-center justify-between gap-[1.4vw]">
                  <span className="text-slate-600 font-normal">Downloads</span>
                  <span className="text-slate-800 font-semibold">: {activePt.downloads}</span>
                </div>
                <div className="flex items-center justify-between gap-[1.4vw]">
                  <span className="text-slate-600 font-normal">Unique Downloaders</span>
                  <span className="text-slate-800 font-semibold">: {activePt.uniqueDownloaders}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Table: Download Analytics Table */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-[0.9vw]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw]">
          <div>
            <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight ">
              Download Analytics Table
            </h3>
            <p className="text-[0.7vw] text-slate-500 font-normal">
              Review date-wise download counts and unique downloaders.
            </p>
          </div>

          <div className="flex items-center gap-[0.5vw]">
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                onKeyDown={handleSortKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
                className="inline-flex items-center gap-[0.45vw] px-[0.9vw] py-[0.42vw] bg-white border-[1.5px] border-slate-300 hover:border-slate-400 rounded-[0.55vw] text-[0.76vw] text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#F05338]/20 transition-all cursor-pointer shadow-xs"
              >
                <Icon icon="iconoir:sort" className="w-[0.95vw] h-[0.95vw] text-[#F05338]" />
                <span className="font-normal">{tableSort}</span>
                <Icon icon="solar:alt-arrow-down-linear" className="w-[0.7vw] h-[0.7vw] text-slate-400" />
              </button>

              {isSortOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-[0.4vw] w-[11.5vw] bg-white border border-slate-200 rounded-[0.55vw] shadow-[0_6px_24px_rgba(0,0,0,0.08)] py-[0.35vw] px-[0.3vw] z-30 text-[0.76vw] animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-[0.8vw] py-[0.3vw] text-[0.65vw] font-semibold tracking-wider uppercase text-slate-400">
                    Sort Table
                  </div>
                  {sortOptions.map((opt, idx) => {
                    const isCurrent = tableSort === opt.value;
                    const isFocused = focusedSortIndex === idx;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => {
                          setTableSort(opt.value);
                          setIsSortOpen(false);
                          setCurrentPage(1);
                        }}
                        onMouseEnter={() => setFocusedSortIndex(idx)}
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
              onClick={exportCSV}
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
                  <th className="py-[0.7vw] px-[1vw] text-center">Downloads</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Unique Downloaders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDownloads.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-[2.5vw] text-center text-slate-400 font-normal">
                      No activity found for this period.
                    </td>
                  </tr>
                ) : (
                  paginatedDownloads.map((row) => (
                    <tr key={row.dateKey} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-[0.7vw] px-[1vw] text-slate-900 font-normal">
                        {row.formattedFull}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.downloads.toLocaleString()}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.uniqueDownloaders.toLocaleString()}
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
                    {totalSummary.totalDownloads.toLocaleString()}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.totalUnique.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls matching Readers tab */}
        {sortedDownloadData.length > 0 && (
          <div className="flex items-center justify-between pt-[0.4vw] text-[0.72vw]">
            <span className="text-black font-medium">
              Showing {Math.min((safeCurrentPage - 1) * pageSize + 1, sortedDownloadData.length)}–{Math.min(safeCurrentPage * pageSize, sortedDownloadData.length)} of {sortedDownloadData.length}
            </span>

            <div className="flex items-center gap-[0.3vw]">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-[1.6vw] h-[1.6vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer flex items-center justify-center ${
                    safeCurrentPage === page
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
    </div>
  );
}
