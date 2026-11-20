import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { formatFullDate, getPaginationPages, buildDynamicTimeline, getSampledXLabels } from './analyticsUtils';
import AnalyticsDatePicker from './AnalyticsDatePicker';
import { exportProfessionalExcel } from '../../utils/excelExportHelper';

export default function LeadFormTab({ timeline = [], summary = {}, analyticsData = {}, loading = false }) {
  const navigate = useNavigate();
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
  const [selectedPreviewLeadRow, setSelectedPreviewLeadRow] = useState(null);

  // Dynamic timeline driven by LeadFormTab's date filters
  const activeTimeline = useMemo(() => {
    return buildDynamicTimeline(datePreset, customRange, analyticsData?.dailyViews || [], summary.avgDuration || 0);
  }, [datePreset, customRange, analyticsData?.dailyViews, summary.avgDuration]);

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
    { label: 'Most viewed', value: 'Most viewed' },
    { label: 'Most submitted', value: 'Most submitted' },
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

  // Map backend dailyLeads and dailyLeadEvents if present
  const dailyLeadsMap = useMemo(() => {
    const map = {};
    const dList = analyticsData?.dailyLeads || [];
    dList.forEach(item => {
      if (item && item._id) {
        map[item._id] = { leads: Number(item.leads) || 0, views: 0, skipped: 0 };
      }
    });

    const eList = analyticsData?.dailyLeadEvents || [];
    eList.forEach(item => {
      if (item && item._id) {
        if (!map[item._id]) {
          map[item._id] = { leads: 0, views: 0, skipped: 0 };
        }
        map[item._id].views = Number(item.views) || 0;
        map[item._id].skipped = Number(item.skipped) || 0;
      }
    });

    return map;
  }, [analyticsData?.dailyLeads, analyticsData?.dailyLeadEvents]);

  const totalLeadsCount = summary?.totalLeads || analyticsData?.summary?.totalLeads || 0;

  // Real backend leads matching actual submissions and form interactions
  const leadData = useMemo(() => {
    return activeTimeline.map((d, i) => {
      const key = d.dateKey || d.date;
      const entry = dailyLeadsMap[key];
      const submitted = entry?.leads !== undefined ? entry.leads : 0;
      const formViews = entry?.views ? entry.views : (submitted + (entry?.skipped || 0));
      const skipped = entry?.skipped !== undefined ? entry.skipped : 0;
      const noAction = Math.max(0, formViews - submitted - skipped);
      return {
        ...d,
        formViews,
        submitted,
        skipped,
        noAction,
        idx: i
      };
    });
  }, [activeTimeline, dailyLeadsMap]);

  // Chart computations matching Readers Trend exact proportions
  const dChartW = 860;
  const dChartH = 220;
  const dPadL = 40;
  const dPadR = 10;
  const dPadT = 20;
  const dPadB = 32;
  const dInnerW = dChartW - dPadL - dPadR;
  const dInnerH = dChartH - dPadT - dPadB;

  const maxVal = Math.max(...leadData.map(d => d.submitted), ...leadData.map(d => d.formViews), 0);
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
    const len = leadData.length;
    return leadData.map((d, i) => {
      const x = len > 1 ? dPadL + (i / (len - 1)) * dInnerW : dPadL + dInnerW / 2;
      const y = dPadT + dInnerH - (d.submitted / yAxisMax) * dInnerH;
      return { x, y, ...d };
    });
  }, [leadData, dInnerW, dInnerH, dPadL, dPadT, yAxisMax]);

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

  const xLabels = useMemo(() => {
    return getSampledXLabels(chartPoints, 7);
  }, [chartPoints]);

  const sortedLeadData = useMemo(() => {
    const arr = [...leadData];
    if (tableSort === 'Date (Newest)') {
      return arr.sort((a, b) => (b.dt ? b.dt.getTime() : 0) - (a.dt ? a.dt.getTime() : 0));
    }
    if (tableSort === 'Date (Oldest)') {
      return arr.sort((a, b) => (a.dt ? a.dt.getTime() : 0) - (b.dt ? b.dt.getTime() : 0));
    }
    if (tableSort === 'Most viewed') {
      return arr.sort((a, b) => b.formViews - a.formViews);
    }
    if (tableSort === 'Most submitted') {
      return arr.sort((a, b) => b.submitted - a.submitted);
    }
    return arr;
  }, [leadData, tableSort]);

  const totalPages = Math.max(1, Math.ceil(sortedLeadData.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedLeadData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedLeadData.slice(start, start + pageSize);
  }, [sortedLeadData, safeCurrentPage, pageSize]);

  // Totals for summary footer
  const totalSummary = useMemo(() => {
    const totalViews = leadData.reduce((acc, curr) => acc + (curr.formViews || 0), 0);
    const totalSubmitted = leadData.reduce((acc, curr) => acc + (curr.submitted || 0), 0);
    const totalSkipped = leadData.reduce((acc, curr) => acc + (curr.skipped || 0), 0);
    const totalNoAction = leadData.reduce((acc, curr) => acc + (curr.noAction || 0), 0);
    return {
      totalViews,
      totalSubmitted,
      totalSkipped,
      totalNoAction
    };
  }, [leadData]);

  const exportCSV = async () => {
    if (sortedLeadData.length === 0) return;
    const columns = [
      { header: 'Date', key: 'formattedFull', width: 22, align: 'center' },
      { header: 'Form Views', key: 'formViews', width: 18, align: 'right' },
      { header: 'Submitted Leads', key: 'submitted', width: 20, align: 'right' },
      { header: 'Skipped', key: 'skipped', width: 16, align: 'right' },
      { header: 'No Action', key: 'noAction', width: 16, align: 'right' }
    ];

    const data = sortedLeadData.map(d => ({
      formattedFull: d.formattedFull,
      formViews: Number(d.formViews) || 0,
      submitted: Number(d.submitted) || 0,
      skipped: Number(d.skipped) || 0,
      noAction: Number(d.noAction) || 0
    }));

    const dateStr = datePreset === 'Custom' && customRange.startDate && customRange.endDate
      ? `${new Date(customRange.startDate).toLocaleDateString()} to ${new Date(customRange.endDate).toLocaleDateString()}`
      : datePreset;

    const metadata = [
      { label: 'Date Range', value: dateStr },
      { label: 'Group By', value: groupBy },
      { label: 'Sort Order', value: tableSort },
      { label: 'Total Form Views', value: totalSummary.totalViews },
      { label: 'Total Submitted', value: totalSummary.totalSubmitted },
      { label: 'Total Skipped', value: totalSummary.totalSkipped },
      { label: 'Total No Action', value: totalSummary.totalNoAction },
      { label: 'Export Date', value: new Date().toLocaleString() }
    ];

    const chartConfig = {
      title: 'Lead Form Activity Trends',
      type: 'bar',
      labels: sortedLeadData.map(d => d.dateLabel || d.formattedFull).slice(-10),
      datasets: [
        {
          label: 'Views',
          data: sortedLeadData.map(d => Number(d.formViews) || 0).slice(-10),
          color: '#3B82F6'
        },
        {
          label: 'Submitted',
          data: sortedLeadData.map(d => Number(d.submitted) || 0).slice(-10),
          color: '#10B981'
        },
        {
          label: 'Skipped',
          data: sortedLeadData.map(d => Number(d.skipped) || 0).slice(-10),
          color: '#F59E0B'
        }
      ]
    };

    const summaryCards = [
      { title: 'Form Views', value: totalSummary.totalViews, color: '3B82F6' },
      { title: 'Submissions', value: totalSummary.totalSubmitted, color: '10B981' },
      { title: 'Skipped', value: totalSummary.totalSkipped, color: 'F59E0B' },
      { title: 'No Action', value: totalSummary.totalNoAction, color: '64748B' }
    ];

    await exportProfessionalExcel({
      filename: `Lead_Form_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetTitle: 'Lead Form Activity',
      reportName: 'Lead Form & Enquiries Analytics Report',
      columns,
      data,
      metadata,
      summaryCards,
      chartConfig,
      totalRowLabelCol: 'formattedFull',
      sumCols: ['formViews', 'submitted', 'skipped', 'noAction']
    });
  };

  return (
    <div className="space-y-[1.1vw]">
      {/* Sub-Header */}
      <div className="flex items-center gap-[0.55vw] pt-[0.1vw]">
        <div className="w-[2.3vw] h-[2.3vw] rounded-[0.65vw] bg-[#FFF0EB] text-[#EC5137] flex items-center justify-center shrink-0">
          <Icon icon="boxicons:form" className="w-[1.15vw] h-[1.15vw]" />
        </div>
        <div>
          <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight ">
            Lead Form Activity
          </h3>
          <p className="text-[0.7vw] text-slate-500 font-normal">
            Compare form views, submissions, skips and no-action events.
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


      </div>

      {/* Submissions Over Time Chart */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-[0.5vw]">
          <h4 className="text-[0.85vw] font-semibold text-slate-900 ">
            Submissions Over Time
          </h4>
          <div className="flex items-center gap-[0.35vw] text-[0.7vw] text-slate-600 font-medium">
            <span className="w-[0.5vw] h-[0.5vw] rounded-full bg-[#0BA6FF]"></span>
            <span>Total Lead Generated</span>
          </div>
        </div>

        <div className="relative w-full mt-[0.3vw]">
          <svg
            viewBox={`0 0 ${dChartW} ${dChartH}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setDetailHoverIdx(null)}
          >
            <defs>
              <linearGradient id="leadDetailBlueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0BA6FF" stopOpacity="0.40" />
                <stop offset="100%" stopColor="#0BA6FF" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Vertical dashed grid lines matching each X date tick */}
            {xLabels.map((pt) => (
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

            <path d={areaD} fill="url(#leadDetailBlueGradient)" />
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
            {xLabels.map((pt) => (
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
                  <span className="text-slate-600 font-normal">Views</span>
                  <span className="text-slate-800 font-semibold">: {activePt.formViews}</span>
                </div>
                <div className="flex items-center justify-between gap-[1.4vw]">
                  <span className="text-slate-600 font-normal">Submitted</span>
                  <span className="text-slate-800 font-semibold">: {activePt.submitted}</span>
                </div>
                <div className="flex items-center justify-between gap-[1.4vw]">
                  <span className="text-slate-600 font-normal">Skipped</span>
                  <span className="text-slate-800 font-semibold">: {activePt.skipped}</span>
                </div>
                <div className="flex items-center justify-between gap-[1.4vw]">
                  <span className="text-slate-600 font-normal">No Action</span>
                  <span className="text-slate-800 font-semibold">: {activePt.noAction}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Table: Lead Form Analytics Table */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-[0.9vw]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw]">
          <div>
            <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight ">
              Lead Form Analytics Table
            </h3>
            <p className="text-[0.7vw] text-slate-500 font-normal">
              Review date-wise form activity and submission performance.
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
                  <th className="py-[0.7vw] px-[1vw] text-center">Views</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Submitted</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Skipped</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">No Action</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`lead-skel-${i}`} className="animate-pulse">
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
                        <div className="h-[0.6vw] w-[2.5vw] bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center">
                        <div className="h-[0.6vw] w-[2.5vw] bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center">
                        <div className="h-[1.2vw] w-[4.5vw] bg-slate-100 rounded-[0.35vw] mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : paginatedLeadData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-[2.5vw] text-center text-slate-400 font-normal">
                      No activity found for this period.
                    </td>
                  </tr>
                ) : (
                  paginatedLeadData.map((row) => (
                    <tr key={row.dateKey} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-[0.7vw] px-[1vw] text-slate-900 font-normal">
                        {row.formattedFull}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.formViews.toLocaleString()}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.submitted.toLocaleString()}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.skipped.toLocaleString()}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.noAction.toLocaleString()}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedPreviewLeadRow(row)}
                          className="inline-flex items-center gap-[0.25vw] text-[0.72vw] font-normal text-[#0284C7] bg-[#E0F2FE] hover:bg-[#BAE6FD] px-[0.7vw] py-[0.3vw] rounded-[0.4vw] transition-colors cursor-pointer"
                        >
                          <span>View Leads</span>
                          <Icon icon="solar:arrow-right-up-linear" className="w-[0.75vw] h-[0.75vw]" />
                        </button>
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
                    {totalSummary.totalViews.toLocaleString()}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.totalSubmitted.toLocaleString()}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.totalSkipped.toLocaleString()}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.totalNoAction.toLocaleString()}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-400 font-normal">
                    —
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls matching Readers tab */}
        {sortedLeadData.length > 0 && (
          <div className="flex items-center justify-between pt-[0.4vw] text-[0.72vw]">
            <span className="text-black font-medium">
              Showing {Math.min((safeCurrentPage - 1) * pageSize + 1, sortedLeadData.length)}–{Math.min(safeCurrentPage * pageSize, sortedLeadData.length)} of {sortedLeadData.length}
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

      {/* Lead Preview Modal */}
      {selectedPreviewLeadRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-[1vw]">
          <div className="bg-white rounded-[0.9vw] shadow-2xl border border-slate-200/80 w-[42vw] max-w-[620px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-[1.4vw] pt-[1.3vw] pb-[0.9vw]">
              <div className="flex items-center gap-[0.7vw]">
                <div className="w-[2.2vw] h-[2.2vw] rounded-[0.55vw] bg-[#FFF0EB] flex items-center justify-center text-[#EC5137] shrink-0">
                  <Icon icon="carbon:activity" className="w-[1.2vw] h-[1.2vw]" />
                </div>
                <div>
                  <h3 className="text-[1.05vw] font-semibold text-slate-900 leading-tight">
                    Lead Preview
                  </h3>
                  <p className="text-[0.7vw] text-slate-500 font-normal mt-[0.1vw]">
                    {analyticsData?.title || analyticsData?.bookName || 'Industrial Pumps Catalogue'} • {selectedPreviewLeadRow.formattedFull || '18 Oct 2026'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreviewLeadRow(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-[0.3vw]"
                title="Close"
              >
                <Icon icon="solar:close-linear" className="w-[1.25vw] h-[1.25vw]" />
              </button>
            </div>

            {/* Subtle Divider below header */}
            <div className="mx-[1.4vw] border-b border-slate-100" />

            {/* Modal Body */}
            <div className="p-[1.4vw] space-y-[1.2vw]">
              {/* Total Submissions Box */}
              <div className="p-[1.1vw] bg-white rounded-[0.65vw] border border-slate-200/90 shadow-2xs">
                <span className="block text-[0.72vw] font-medium text-slate-500">
                  Total Submissions
                </span>
                <div className="flex items-baseline gap-[0.5vw] mt-[0.25vw]">
                  <span className="text-[1.9vw] font-bold text-slate-900 leading-none">
                    {selectedPreviewLeadRow.submitted > 0 ? selectedPreviewLeadRow.submitted : 0}
                  </span>
                  <span className="text-[0.7vw] text-slate-400 font-normal">
                    (for {selectedPreviewLeadRow.formattedFull})
                  </span>
                </div>
              </div>

              {/* Recent Leads Section */}
              <div>
                <div className="flex items-center justify-between mb-[0.65vw]">
                  <h4 className="text-[0.82vw] font-bold text-slate-900">
                    Recent Leads
                  </h4>
                  <span className="text-[0.68vw] text-slate-400 font-normal">
                    Showing {Math.min(3, (analyticsData?.recentLeads || []).length)} of {selectedPreviewLeadRow.submitted > 0 ? selectedPreviewLeadRow.submitted : (analyticsData?.recentLeads || []).length}
                  </span>
                </div>

                <div className="space-y-[0.6vw]">
                  {Array.isArray(analyticsData?.recentLeads) && analyticsData.recentLeads.length > 0 ? (
                    analyticsData.recentLeads.slice(0, 3).map((lead, lIdx) => {
                      const name = lead?.leadData?.['Full Name'] || lead?.leadData?.name || lead?.name || lead?.leadData?.fullName || 'Anonymous';
                      const email = lead?.leadData?.['Email Address'] || lead?.leadData?.email || lead?.email || lead?.userEmail || '—';
                      const status = lead?.status || 'New';
                      const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'L';
                      const timeStr = lead?.createdAt ? new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

                      const statusColors = {
                        New: 'bg-[#FFF0EB] text-[#EC5137]',
                        Contacted: 'bg-[#FEF9C3] text-[#B45309]',
                        Qualified: 'bg-[#E0F2FE] text-[#0284C7]',
                        Converted: 'bg-[#DCFCE7] text-[#16A34A]',
                        Lost: 'bg-slate-100 text-slate-500'
                      };

                      return (
                        <div key={lead._id || lead.leadId || lIdx} className="flex items-center justify-between p-[0.8vw] px-[1vw] rounded-[0.65vw] border border-slate-200/80 bg-white hover:border-slate-300 transition-colors">
                          <div className="flex items-center gap-[0.75vw]">
                            <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#FCE7F3] text-[#BE185D] font-bold text-[0.72vw] flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="text-[0.78vw] font-semibold text-slate-900 leading-tight">
                                {name}
                              </div>
                              <div className="text-[0.68vw] text-slate-400 mt-[0.1vw]">
                                {email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-[0.8vw]">
                            <span className={`inline-block px-[0.65vw] py-[0.18vw] rounded-full text-[0.68vw] font-medium ${statusColors[status] || statusColors.New}`}>
                              {status}
                            </span>
                            <span className="text-[0.68vw] text-slate-400 font-normal">{timeStr}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-[1.8vw] text-center text-slate-400 text-[0.74vw] border border-dashed border-slate-200 rounded-[0.65vw] bg-slate-50/50">
                      No leads recorded for this date.
                    </div>
                  )}
                </div>
              </div>

              {/* Informational Subtext */}
              <p className="text-[0.68vw] text-slate-400 font-normal">
                Opens Leads with the selected date and flipbook filters applied.
              </p>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-[0.6vw] px-[1.4vw] py-[0.9vw] bg-white">
              <button
                type="button"
                onClick={() => setSelectedPreviewLeadRow(null)}
                className="px-[1.1vw] py-[0.45vw] text-[0.74vw] font-medium text-slate-700 bg-white border border-slate-300 rounded-[0.45vw] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = analyticsData?.v_id || analyticsData?.bookId;
                  setSelectedPreviewLeadRow(null);
                  if (targetId) {
                    navigate(`/lead-form/${targetId}`);
                  } else {
                    navigate('/lead-form');
                  }
                }}
                className="inline-flex items-center gap-[0.4vw] px-[1.2vw] py-[0.45vw] text-[0.74vw] font-medium text-white bg-[#EC5137] hover:bg-[#d63e27] rounded-[0.45vw] transition-colors shadow-xs cursor-pointer"
              >
                <span>View All Leads</span>
                <Icon icon="solar:arrow-right-linear" className="w-[0.9vw] h-[0.9vw]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}