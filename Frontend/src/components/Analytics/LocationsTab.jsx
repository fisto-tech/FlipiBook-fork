import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import AnalyticsDatePicker from './AnalyticsDatePicker';
import { getPaginationPages, formatDuration } from './analyticsUtils';
import worldMapData from './worldMapData.json';

const DEFAULT_LOCATION_DATA = [
  { country: 'India', code: 'in', readers: 520, views: 1120, avgTime: '4m 12s', share: '41.7%', trend: [105, 145, 130, 185, 170, 220, 240] },
  { country: 'United States', code: 'us', readers: 310, views: 720, avgTime: '3m 35s', share: '24.8%', trend: [70, 90, 65, 110, 100, 130, 120] },
  { country: 'United Kingdom', code: 'gb', readers: 185, views: 430, avgTime: '3m 08s', share: '14.8%', trend: [50, 65, 55, 75, 70, 85, 90] },
  { country: 'Germany', code: 'de', readers: 110, views: 260, avgTime: '2m 54s', share: '8.8%', trend: [30, 40, 35, 50, 45, 55, 50] },
  { country: 'Canada', code: 'ca', readers: 123, views: 290, avgTime: '3m 15s', share: '9.9%', trend: [35, 45, 40, 55, 50, 60, 65] },
];

const COUNTRY_NAME_TO_CODE = {
  'india': 'in',
  'united states': 'us',
  'usa': 'us',
  'united kingdom': 'gb',
  'uk': 'gb',
  'germany': 'de',
  'canada': 'ca',
  'australia': 'au',
  'france': 'fr',
  'brazil': 'br',
  'china': 'cn',
  'japan': 'jp',
  'russia': 'ru',
  'spain': 'es',
  'italy': 'it',
  'mexico': 'mx'
};

const DATES = ['Oct 16', 'Oct 17', 'Oct 18', 'Oct 19', 'Oct 20', 'Oct 21', 'Oct 22'];

export default function LocationsTab({ timeline = [], analyticsData = {}, summary = {} }) {
  const [dateFilter, setDateFilter] = useState('7d');
  const [groupBy, setGroupBy] = useState('week');
  const [customRange, setCustomRange] = useState({
    startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [selectedMap, setSelectedMap] = useState('World');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedForCompare, setSelectedForCompare] = useState(['India', 'United States']);
  const [hoveredCompareDateIdx, setHoveredCompareDateIdx] = useState(4); // default hovered to Oct 20 like screenshot
  const [hoveredMapCountry, setHoveredMapCountry] = useState(null);
  const [tableSort, setTableSort] = useState('Most viewed');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [focusedSortIndex, setFocusedSortIndex] = useState(-1);
  const sortDropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

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
    { label: 'Most viewed', value: 'Most viewed' },
    { label: 'Most readers', value: 'Most readers' },
    { label: 'Location (A-Z)', value: 'Location (A-Z)' },
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

  const rawCountries = analyticsData?.countries || [];
  const rawTotalViews = summary?.totalViews || analyticsData?.summary?.totalViews || 0;
  const avgTimeStr = summary?.avgDurationSeconds
    ? `${Math.floor(summary.avgDurationSeconds / 60)}m ${summary.avgDurationSeconds % 60}s`
    : '4m 12s';

  // Merge backend data with fallback list
  const locationList = useMemo(() => {
    if (rawCountries.length > 0) {
      return rawCountries.map((c, idx) => {
        const cName = c.country || 'Unknown';
        const code = (c.code || COUNTRY_NAME_TO_CODE[cName.toLowerCase()] || '').toLowerCase();
        const viewsNum = c.views || 0;
        const fallback = DEFAULT_LOCATION_DATA.find(d => d.country.toLowerCase() === cName.toLowerCase());
        const trend = timeline.length >= 7
          ? timeline.slice(-7).map(t => Math.round((t.views || 0) * (c.percentage ? c.percentage / 100 : 0.5)))
          : (fallback?.trend || [viewsNum * 0.4, viewsNum * 0.6, viewsNum * 0.5, viewsNum * 0.8, viewsNum * 0.7, viewsNum * 0.9, viewsNum]);

        return {
          country: cName,
          code,
          readers: c.readers || Math.max(1, Math.round(viewsNum * 0.75)),
          views: viewsNum,
          avgTime: avgTimeStr,
          share: `${c.percentage || (rawTotalViews > 0 ? Math.round((viewsNum / rawTotalViews) * 100) : 100)}%`,
          trend
        };
      });
    }
    return DEFAULT_LOCATION_DATA;
  }, [rawCountries, rawTotalViews, avgTimeStr, timeline]);

  const maxReaders = useMemo(() => {
    return Math.max(...locationList.map(d => d.readers), 1);
  }, [locationList]);

  // Countries to highlight on map with varying blue shades matching the screenshot
  const mapCountryColors = useMemo(() => {
    const shades = {
      'in': '#1D4ED8', // Dark deep blue
      'us': '#1E40AF', // Dark deep blue
      'ca': '#2563EB', // Blue
      'gb': '#3B82F6', // Lighter blue
      'de': '#3B82F6',
      'au': '#2563EB',
      'br': '#3B82F6',
      'ru': '#2563EB',
      'fr': '#60A5FA',
      'es': '#60A5FA',
      'it': '#60A5FA',
      'sa': '#93C5FD',
      'za': '#60A5FA',
      'eg': '#93C5FD',
      'jp': '#2563EB',
      'cn': '#1D4ED8',
      'mx': '#3B82F6',
      'ar': '#60A5FA',
      'id': '#3B82F6'
    };

    // Also inject any countries present in locationList
    locationList.forEach(loc => {
      if (loc.code && !shades[loc.code]) {
        shades[loc.code] = '#2563EB';
      }
    });

    return shades;
  }, [locationList]);

  const toggleCompareCountry = (country) => {
    if (selectedForCompare.includes(country)) {
      if (selectedForCompare.length > 1) {
        setSelectedForCompare(selectedForCompare.filter(c => c !== country));
      }
    } else {
      setSelectedForCompare([...selectedForCompare, country]);
    }
  };

  // Compare Line Chart Layout
  const chartW = 580;
  const chartH = 220;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const yTicks = [275, 220, 165, 110, 55];
  const yMax = 275;

  const compareColors = {
    'India': { line: '#3B82F6', dot: '#3B82F6', bg: 'bg-[#3B82F6]' },
    'United States': { line: '#10B981', dot: '#10B981', bg: 'bg-[#10B981]' },
    'United Kingdom': { line: '#F59E0B', dot: '#F59E0B', bg: 'bg-[#F59E0B]' },
    'Germany': { line: '#8B5CF6', dot: '#8B5CF6', bg: 'bg-[#8B5CF6]' },
    'Canada': { line: '#EC4899', dot: '#EC4899', bg: 'bg-[#EC4899]' }
  };

  // Sort & Pagination for Table
  const sortedLocationList = useMemo(() => {
    const list = [...locationList];
    if (tableSort === 'Location (A-Z)') {
      return list.sort((a, b) => a.country.localeCompare(b.country));
    }
    return list.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
  }, [locationList, tableSort]);

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.max(1, Math.ceil(sortedLocationList.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedLocations = sortedLocationList.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);
  const pageItems = getPaginationPages(safeCurrentPage, totalPages);

  // Totals for summary footer
  const totalSummary = useMemo(() => {
    const totalReaders = locationList.reduce((acc, curr) => acc + (Number(curr.readers) || 0), 0);
    const totalViews = locationList.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0);
    return {
      readers: totalReaders,
      views: totalViews,
      avgTime: avgTimeStr,
      share: '100%'
    };
  }, [locationList, avgTimeStr]);

  const exportCSV = () => {
    if (sortedLocationList.length === 0) return;
    const headers = ['Location', 'Unique readers', 'Views', 'Avg. reading time', 'Share of readers'];
    const rows = sortedLocationList.map(r => [
      `"${r.country}"`,
      r.readers,
      r.views,
      `"${r.avgTime}"`,
      `"${r.share}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Location_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-[1.1vw]">
      {/* 1. Header: Readers by Location */}
      <div className="flex items-center gap-[0.55vw] pt-[0.1vw]">
        <div className="w-[2.3vw] h-[2.3vw] rounded-[0.65vw] bg-[#E6F7EF] text-[#16865C] flex items-center justify-center shrink-0">
          <Icon icon="basil:map-location-outline" className="w-[1.25vw] h-[1.25vw]" />
        </div>
        <div>
          <h2 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight">
            Readers by Location
          </h2>
          <p className="text-[0.7vw] text-slate-500 font-normal">
            Explore reader distribution across countries, regions and cities.
          </p>
        </div>
      </div>

      {/* 2. Top Filter Controls Card (Date Range + Group By) */}
      <div className="bg-white rounded-[0.65vw] p-[0.85vw] px-[1vw] border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-end justify-between gap-[1vw]">
        {/* Left Side: Date Range */}
        <div className="flex flex-col gap-[0.35vw]">
          <span className="text-[0.74vw] text-slate-700 font-medium whitespace-nowrap">
            Date Range
          </span>
          <div className="flex items-center gap-[0.75vw] flex-wrap">
            <AnalyticsDatePicker
              className="w-[15.5vw] min-w-[210px]"
              startDate={customRange.startDate}
              endDate={customRange.endDate}
              onChange={(range) => {
                setCustomRange(range);
                setDateFilter('custom');
              }}
            />

            <div className="inline-flex items-center bg-white border border-slate-200 rounded-[0.45vw] p-[0.2vw] gap-[0.25vw]">
              {['Today', 'Yesterday', '7 Days', '30 Days', 'Custom'].map((preset) => {
                const isActive = (preset === '7 Days' && dateFilter === '7d') ||
                  (preset === 'Today' && dateFilter === 'today') ||
                  (preset === 'Yesterday' && dateFilter === 'yesterday') ||
                  (preset === '30 Days' && dateFilter === '30d') ||
                  (preset === 'Custom' && dateFilter === 'custom');

                return (
                  <button
                    key={preset}
                    onClick={() => {
                      setDateFilter(preset === '7 Days' ? '7d' : preset === '30 Days' ? '30d' : preset.toLowerCase());
                      const end = new Date();
                      const start = new Date();
                      if (preset === 'Yesterday') {
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
                      isActive
                        ? 'bg-[#EC5137] text-white shadow-xs'
                        : 'text-[#555555] hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Group By */}
        <div className="flex flex-col gap-[0.35vw] shrink-0">
          <span className="text-[0.74vw] text-slate-700 font-medium whitespace-nowrap">
            Group By
          </span>
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-[0.45vw] p-[0.2vw] gap-[0.25vw]">
            {['Date', 'Week', 'Month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setGroupBy(mode.toLowerCase())}
                className={`px-[1.25vw] py-[0.38vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  groupBy === mode.toLowerCase()
                    ? 'bg-[#EC5137] text-white shadow-xs'
                    : 'text-[#555555] hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Section 1: Reader Locations (World Map + Country Bars) */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[1.5vw]">
          {/* Left: World Map */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <h4 className="text-[0.88vw] font-semibold text-slate-900 mb-[0.6vw]">
              Reader Locations
            </h4>

            {/* Interactive World Map SVG */}
            <div className="relative w-full h-[290px] flex items-center justify-center bg-white overflow-hidden">
              <svg
                viewBox="30.767 241.591 784.077 458.627"
                className="w-full h-full select-none"
                style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.04))' }}
              >
                {Object.entries(worldMapData).map(([countryId, paths]) => {
                  const fillColor = mapCountryColors[countryId] || '#E2E8F0';
                  const isHover = hoveredMapCountry === countryId;

                  return (
                    <g
                      key={countryId}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredMapCountry(countryId)}
                      onMouseLeave={() => setHoveredMapCountry(null)}
                    >
                      {paths.map((d, pIdx) => (
                        <path
                          key={pIdx}
                          d={d}
                          fill={isHover ? '#0BA6FF' : fillColor}
                          stroke="#FFFFFF"
                          strokeWidth="0.6"
                          strokeLinejoin="round"
                        />
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right: Selectors + Country Bars */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-[1.5vw] flex flex-col justify-between">
            <div>
              {/* Selectors Header (Map: World | Country: India) */}
              <div className="flex items-center justify-end gap-[1vw] mb-[1.2vw]">
                <div className="flex items-center gap-[0.35vw]">
                  <span className="text-[0.72vw] text-slate-500 font-normal">Map :</span>
                  <select
                    value={selectedMap}
                    onChange={(e) => setSelectedMap(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-[0.72vw] font-medium rounded-[0.4vw] px-[0.6vw] py-[0.25vw] focus:outline-none cursor-pointer"
                  >
                    <option value="World">World</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                  </select>
                </div>

                <div className="flex items-center gap-[0.35vw]">
                  <span className="text-[0.72vw] text-slate-500 font-normal">Country :</span>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-[0.72vw] font-medium rounded-[0.4vw] px-[0.6vw] py-[0.25vw] focus:outline-none cursor-pointer"
                  >
                    {locationList.map(item => (
                      <option key={item.country} value={item.country}>{item.country}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country List with progress bars */}
              <div className="space-y-[1vw]">
                {locationList.map((item) => {
                  const barWidth = `${Math.min(100, Math.max(12, (item.readers / maxReaders) * 100))}%`;
                  return (
                    <div key={item.country} className="space-y-[0.25vw]">
                      <div className="flex items-center justify-between text-[0.78vw]">
                        <span className="font-normal text-slate-800">{item.country}</span>
                        <span className="text-slate-500 text-[0.72vw] font-normal">{item.readers} readers</span>
                      </div>

                      {/* Navy / Dark Blue Progress Bar */}
                      <div className="w-full h-[0.32vw] bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#172554] rounded-full transition-all duration-500"
                          style={{ width: barWidth }}
                        />
                      </div>

                      <div className="text-[0.66vw] text-slate-400 font-normal">
                        {item.views.toLocaleString()} views Avg. {item.avgTime}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section 2: Compare Readers By Location (Compare Line Chart + Checkboxes) */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[1.5vw]">
          {/* Left: Multi-line Compare Chart */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <h4 className="text-[0.88vw] font-semibold text-slate-900 mb-[0.6vw]">
              Compare Readers By Location
            </h4>

            <div className="relative w-full h-[240px] select-none">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-full overflow-visible"
                onMouseLeave={() => {}}
              >
                {/* Horizontal Dashed Grid lines */}
                {yTicks.map((val) => {
                  const y = padT + (1 - val / yMax) * innerH;
                  return (
                    <g key={val}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={chartW - padR}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={padL - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        fontSize="9.5"
                        fill="#64748B"
                        fontWeight="normal"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical active guideline */}
                {hoveredCompareDateIdx !== null && (
                  <line
                    x1={padL + (hoveredCompareDateIdx / (DATES.length - 1)) * innerW}
                    y1={padT}
                    x2={padL + (hoveredCompareDateIdx / (DATES.length - 1)) * innerW}
                    y2={chartH - padB}
                    stroke="#0BA6FF"
                    strokeWidth="1.2"
                  />
                )}

                {/* X Axis Labels */}
                {DATES.map((date, i) => {
                  const x = padL + (i / (DATES.length - 1)) * innerW;
                  return (
                    <text
                      key={date}
                      x={x}
                      y={chartH - padB + 16}
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="#64748B"
                      fontWeight="normal"
                    >
                      {date}
                    </text>
                  );
                })}

                {/* Straight Lines for Selected Compare Countries */}
                {selectedForCompare.map((cName) => {
                  const countryObj = locationList.find(c => c.country === cName);
                  if (!countryObj) return null;
                  const pts = countryObj.trend.map((val, idx) => {
                    const x = padL + (idx / (DATES.length - 1)) * innerW;
                    const y = padT + (1 - val / yMax) * innerH;
                    return { x, y, val };
                  });

                  let pathD = `M ${pts[0].x} ${pts[0].y}`;
                  for (let i = 1; i < pts.length; i++) {
                    pathD += ` L ${pts[i].x} ${pts[i].y}`;
                  }

                  const color = compareColors[cName]?.line || '#3B82F6';

                  return (
                    <g key={cName}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {pts.map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r={i === hoveredCompareDateIdx ? 4 : 2.5}
                          fill={i === hoveredCompareDateIdx ? '#FFFFFF' : color}
                          stroke={color}
                          strokeWidth={i === hoveredCompareDateIdx ? 2 : 1}
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredCompareDateIdx(i)}
                        />
                      ))}
                    </g>
                  );
                })}
              </svg>

              {/* Compare Hover Tooltip (Matching screenshot: Oct 20 | India 175 | United States 105) */}
              {hoveredCompareDateIdx !== null && (
                <div
                  className="absolute bg-white/95 backdrop-blur-sm border border-slate-200 rounded-[0.55vw] shadow-[0_6px_20px_rgba(0,0,0,0.1)] px-[0.8vw] py-[0.5vw] pointer-events-none transition-all z-20 text-[0.72vw]"
                  style={{
                    left: `${((hoveredCompareDateIdx / (DATES.length - 1)) * 0.7 + 0.12) * 100}%`,
                    top: '42%'
                  }}
                >
                  <div className="text-[0.74vw] font-semibold text-slate-800 mb-[0.3vw]">
                    {DATES[hoveredCompareDateIdx]}
                  </div>
                  <table className="border-collapse">
                    <tbody>
                      {selectedForCompare.map((cName) => {
                        const item = locationList.find(d => d.country === cName);
                        const val = item ? item.trend[hoveredCompareDateIdx] : 0;
                        const cColor = compareColors[cName]?.bg || 'bg-blue-500';
                        return (
                          <tr key={cName} className="leading-[1.4vw]">
                            <td className="pr-[0.4vw]">
                              <span className={`inline-block w-[0.45vw] h-[0.45vw] rounded-full ${cColor}`} />
                            </td>
                            <td className="text-slate-700 font-normal pr-[1.2vw] whitespace-nowrap">{cName}</td>
                            <td className="text-slate-900 font-bold text-right pl-[0.5vw]">{val}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center justify-center gap-[1.5vw] pt-[0.4vw] text-[0.72vw]">
              {selectedForCompare.map((cName) => {
                const cColor = compareColors[cName]?.bg || 'bg-blue-500';
                return (
                  <div key={cName} className="flex items-center gap-[0.35vw]">
                    <span className={`w-[0.5vw] h-[0.5vw] rounded-full ${cColor}`} />
                    <span className="text-slate-700 font-medium">{cName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selectors + Checkboxes */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-[1.5vw] flex flex-col justify-between">
            <div>
              {/* Selectors Header (Map: World | Country: India) */}
              <div className="flex items-center justify-end gap-[1vw] mb-[1.2vw]">
                <div className="flex items-center gap-[0.35vw]">
                  <span className="text-[0.72vw] text-slate-500 font-normal">Map :</span>
                  <select
                    value={selectedMap}
                    onChange={(e) => setSelectedMap(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-[0.72vw] font-medium rounded-[0.4vw] px-[0.6vw] py-[0.25vw] focus:outline-none cursor-pointer"
                  >
                    <option value="World">World</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                  </select>
                </div>

                <div className="flex items-center gap-[0.35vw]">
                  <span className="text-[0.72vw] text-slate-500 font-normal">Country :</span>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-[0.72vw] font-medium rounded-[0.4vw] px-[0.6vw] py-[0.25vw] focus:outline-none cursor-pointer"
                  >
                    {locationList.map(item => (
                      <option key={item.country} value={item.country}>{item.country}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country Checkboxes List */}
              <div className="space-y-[1vw]">
                {locationList.map((item) => {
                  const isChecked = selectedForCompare.includes(item.country);
                  const barWidth = `${Math.min(100, Math.max(12, (item.readers / maxReaders) * 100))}%`;

                  return (
                    <div
                      key={item.country}
                      onClick={() => toggleCompareCountry(item.country)}
                      className="cursor-pointer group space-y-[0.25vw]"
                    >
                      <div className="flex items-center justify-between text-[0.78vw]">
                        <div className="flex items-center gap-[0.45vw]">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Controlled by parent div click
                            className="w-[0.85vw] h-[0.85vw] rounded text-[#EC5137] accent-[#EC5137] cursor-pointer"
                          />
                          <span className="font-normal text-slate-800 group-hover:text-[#EC5137] transition-colors">
                            {item.country}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[0.72vw] font-normal">{item.readers} readers</span>
                      </div>

                      <div className="w-full h-[0.32vw] bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#172554] rounded-full transition-all duration-500"
                          style={{ width: barWidth }}
                        />
                      </div>

                      <div className="text-[0.66vw] text-slate-400 font-normal">
                        {item.views.toLocaleString()} views Avg. {item.avgTime}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Section 3: Location Analytics Table */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-[0.9vw]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw]">
          <div>
            <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight">
              Location Analytics Table
            </h3>
            <p className="text-[0.7vw] text-slate-500 font-normal">
              Compare unique readers, views and reading time by location.
            </p>
          </div>

          <div className="flex items-center gap-[0.5vw]">
            {/* Sort Dropdown */}
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

            {/* Download File Button */}
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

        {/* Table Container */}
        <div className="border border-slate-200 rounded-[0.65vw] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[0.76vw]">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-semibold text-[0.72vw] border-b border-slate-200 tracking-wide uppercase">
                  <th className="py-[0.7vw] px-[1vw]">Location</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Unique readers</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Views</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Avg. reading time</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Share of readers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLocations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-[2.5vw] text-center text-slate-400 font-normal">
                      No location data available.
                    </td>
                  </tr>
                ) : (
                  paginatedLocations.map((row) => (
                    <tr key={row.country} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-[0.7vw] px-[1vw] text-slate-900 font-normal">
                        {row.country}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.readers.toLocaleString()}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.views.toLocaleString()}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.avgTime}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.share}
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
                    {totalSummary.readers.toLocaleString()}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.views.toLocaleString()}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.avgTime}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.share}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {sortedLocationList.length > 0 && (
          <div className="flex items-center justify-between pt-[0.4vw] text-[0.72vw]">
            <span className="text-black font-medium">
              Showing {Math.min((safeCurrentPage - 1) * ITEMS_PER_PAGE + 1, sortedLocationList.length)}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, sortedLocationList.length)} of {sortedLocationList.length}
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
