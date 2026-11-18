import React, { useState } from 'react';
import {
  FiCalendar,
  FiChevronDown,
  FiDownload,
  FiLayers,
  FiGlobe,
  FiMapPin
} from 'react-icons/fi';
import AnalyticsDatePicker from './AnalyticsDatePicker';
import { getPaginationPages } from './analyticsUtils';

const LOCATION_DATA = [
  { country: 'India', readers: 520, views: '1,120', avgTime: '4m 12s', share: '41.7%', trend: [100, 120, 110, 150, 140, 180, 195] },
  { country: 'United States', readers: 310, views: '720', avgTime: '3m 35s', share: '24.8%', trend: [80, 95, 75, 110, 105, 125, 120] },
  { country: 'United Kingdom', readers: 185, views: '430', avgTime: '3m 08s', share: '14.8%', trend: [50, 60, 55, 70, 65, 80, 85] },
  { country: 'Germany', readers: 110, views: '260', avgTime: '2m 54s', share: '8.8%', trend: [30, 35, 40, 45, 50, 48, 52] },
  { country: 'Canada', readers: 123, views: '290', avgTime: '3m 15s', share: '9.9%', trend: [35, 42, 38, 50, 48, 55, 58] },
];

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
  const [viewMode, setViewMode] = useState('compare'); // 'map' or 'compare'
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [hoveredDateIdx, setHoveredDateIdx] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const rawCountries = analyticsData?.countries || [];
  const rawStates = analyticsData?.states || [];
  const rawTotalViews = summary?.totalViews || analyticsData?.summary?.totalViews || 0;
  const avgTimeStr = summary?.avgDuration ? `${Math.round(summary.avgDuration / 60)}m ${summary.avgDuration % 60}s` : '0s';

  const locationData = React.useMemo(() => {
    if (rawCountries.length > 0) {
      return rawCountries.map((c) => ({
        country: c.country || 'Unknown',
        readers: c.views || 0,
        views: (c.views || 0).toLocaleString(),
        avgTime: avgTimeStr,
        share: `${c.percentage || (rawTotalViews > 0 ? Math.round((c.views / rawTotalViews) * 100) : 100)}%`,
        trend: timeline.map(t => t.views || 0)
      }));
    }
    if (rawStates.length > 0) {
      return rawStates.map((s) => ({
        country: s.state || 'Local State',
        readers: s.views || 0,
        views: (s.views || 0).toLocaleString(),
        avgTime: avgTimeStr,
        share: '100%',
        trend: timeline.map(t => t.views || 0)
      }));
    }
    return [
      { country: summary?.topLocation || 'Localhost', readers: rawTotalViews, views: `${rawTotalViews}`, avgTime: avgTimeStr, share: '100%', trend: timeline.map(t => t.views || 0) }
    ];
  }, [rawCountries, rawStates, rawTotalViews, avgTimeStr, timeline, summary?.topLocation]);

  // Default first 2 countries selected for comparison
  React.useEffect(() => {
    if (locationData.length > 0 && selectedForCompare.length === 0) {
      setSelectedForCompare(locationData.slice(0, 2).map(c => c.country));
      if (locationData[0]?.country) {
        setSelectedCountry(locationData[0].country);
      }
    }
  }, [locationData]);

  const toggleCompareCountry = (country) => {
    if (selectedForCompare.includes(country)) {
      if (selectedForCompare.length > 1) {
        setSelectedForCompare(selectedForCompare.filter(c => c !== country));
      }
    } else {
      setSelectedForCompare([...selectedForCompare, country]);
    }
  };

  const maxReaders = Math.max(...locationData.map(d => d.readers), 1);

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(locationData.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedLocations = locationData.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);
  const pageItems = getPaginationPages(safeCurrentPage, totalPages);

  const startCount = locationData.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endCount = Math.min(safeCurrentPage * ITEMS_PER_PAGE, locationData.length);
  const labelText = locationData.length <= 1
    ? `Showing ${locationData.length} ${locationData.length === 1 ? 'location' : 'locations'}`
    : `Showing ${startCount}–${endCount} of ${locationData.length} locations`;

  // Multi-line chart calculations
  const chartHeight = 240;
  const chartWidth = 560;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const graphW = chartWidth - padding.left - padding.right;
  const graphH = chartHeight - padding.top - padding.bottom;
  const yMax = 275;
  const yTicks = [275, 220, 165, 110, 55];

  const getPoints = (trend) => {
    return trend.map((val, idx) => {
      const x = padding.left + (idx / (DATES.length - 1)) * graphW;
      const y = padding.top + (1 - val / yMax) * graphH;
      return { x, y, val };
    });
  };

  const getPath = (points) => {
    return points.reduce((acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '');
  };

  const colors = {
    'India': { line: '#3B82F6', text: 'text-blue-500', bg: 'bg-blue-500' },
    'United States': { line: '#10B981', text: 'text-emerald-500', bg: 'bg-emerald-500' },
    'United Kingdom': { line: '#F59E0B', text: 'text-amber-500', bg: 'bg-amber-500' },
    'Germany': { line: '#8B5CF6', text: 'text-purple-500', bg: 'bg-purple-500' },
    'Canada': { line: '#EC4899', text: 'text-pink-500', bg: 'bg-pink-500' },
  };

  return (
    <div className="w-full space-y-[1.8vw]">
      {/* Title & Filter Bar */}
      <div className="bg-white rounded-[1.2vw] p-[1.4vw] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/80">
        <div className="flex items-start gap-[0.8vw] mb-[1.2vw]">
          <div className="w-[2.4vw] h-[2.4vw] rounded-[0.6vw] bg-emerald-50 flex items-center justify-center text-emerald-600 text-[1.1vw]">
            <FiMapPin />
          </div>
          <div>
            <h2 className="text-[1.25vw] font-medium text-slate-800 tracking-tight">Readers by Location</h2>
            <p className="text-[0.8vw] text-slate-500 mt-[0.1vw]">Explore reader distribution across countries, regions and cities.</p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center justify-between gap-[1vw] pt-[0.4vw]">
          <div className="flex items-center gap-[0.8vw]">
            <span className="text-[0.8vw] text-slate-600 font-medium">Date Range</span>
            <AnalyticsDatePicker
              startDate={customRange.startDate}
              endDate={customRange.endDate}
              onChange={(range) => {
                setCustomRange(range);
                setDateFilter('custom');
              }}
            />
            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-[0.6vw] p-[0.2vw] text-[0.78vw]">
              {['Today', 'Yesterday', '7 Days', '30 Days', 'Custom'].map((pill) => {
                const isActive = (pill === '7 Days' && dateFilter === '7d') || (pill === 'Today' && dateFilter === 'today');
                return (
                  <button className="cursor-pointer"
                    key={pill}
                    onClick={() => {
                      setDateFilter(pill.toLowerCase());
                      const end = new Date();
                      const start = new Date();
                      if (pill === 'Yesterday') {
                        start.setDate(end.getDate() - 1);
                        end.setDate(end.getDate() - 1);
                      } else if (pill === '7 Days') {
                        start.setDate(end.getDate() - 6);
                      } else if (pill === '30 Days') {
                        start.setDate(end.getDate() - 29);
                      }
                      setCustomRange({ startDate: start, endDate: end });
                    }}
                    className={`px-[0.9vw] py-[0.4vw] rounded-[0.5vw] font-medium transition-all cursor-pointer ${
                      isActive ? 'bg-[#FF4D2D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-[0.8vw]">
            <span className="text-[0.8vw] text-slate-600 font-medium">Group By</span>
            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-[0.6vw] p-[0.2vw] text-[0.78vw]">
              {['Date', 'Week', 'Month'].map((mode) => (
                <button className="cursor-pointer"
                  key={mode}
                  onClick={() => setGroupBy(mode.toLowerCase())}
                  className={`px-[1vw] py-[0.4vw] rounded-[0.5vw] font-medium transition-all cursor-pointer ${
                    groupBy === mode.toLowerCase() ? 'bg-[#FF4D2D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Map / Compare Chart Section */}
      <div className="bg-white rounded-[1.2vw] p-[1.6vw] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[2vw]">
          {/* Left Visual Area (Compare Line Chart or World Map) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-[1vw]">
              <div className="flex items-center gap-[1vw]">
                <h3 className="text-[1.05vw] font-medium text-slate-800">
                  {viewMode === 'compare' ? 'Compare Readers By Location' : 'Reader Locations'}
                </h3>
                <div className="flex items-center gap-[0.4vw] bg-slate-100 p-[0.2vw] rounded-[0.5vw] text-[0.72vw]">
                  <button className="cursor-pointer"
                    onClick={() => setViewMode('compare')}
                    className={`px-[0.6vw] py-[0.25vw] rounded-[0.4vw] font-medium transition-colors cursor-pointer ${
                      viewMode === 'compare' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Compare Trend
                  </button>
                  <button className="cursor-pointer"
                    onClick={() => setViewMode('map')}
                    className={`px-[0.6vw] py-[0.25vw] rounded-[0.4vw] font-medium transition-colors cursor-pointer ${
                      viewMode === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    World Map
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'compare' ? (
              <div className="relative w-full h-[260px] flex items-center justify-center">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  {yTicks.map((val) => {
                    const y = padding.top + (1 - val / yMax) * graphH;
                    return (
                      <g key={val}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={chartWidth - padding.right}
                          y2={y}
                          stroke="#F1F5F9"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x={padding.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          className="text-[10px] fill-slate-400 font-sans"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical Guideline at hovered index */}
                  {hoveredDateIdx !== null && (
                    <line
                      x1={padding.left + (hoveredDateIdx / (DATES.length - 1)) * graphW}
                      y1={padding.top}
                      x2={padding.left + (hoveredDateIdx / (DATES.length - 1)) * graphW}
                      y2={chartHeight - padding.bottom}
                      stroke="#60A5FA"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Render Lines for selected countries */}
                  {selectedForCompare.map((country) => {
                    const countryData = LOCATION_DATA.find(d => d.country === country);
                    if (!countryData) return null;
                    const pts = getPoints(countryData.trend);
                    const color = colors[country]?.line || '#3B82F6';
                    return (
                      <g key={country}>
                        <path
                          d={getPath(pts)}
                          fill="none"
                          stroke={color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {pts.map((pt, i) => (
                          <circle
                            key={i}
                            cx={pt.x}
                            cy={pt.y}
                            r={i === hoveredDateIdx ? 5 : 3.5}
                            fill="#FFFFFF"
                            stroke={color}
                            strokeWidth={i === hoveredDateIdx ? 3 : 2}
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredDateIdx(i)}
                          />
                        ))}
                      </g>
                    );
                  })}

                  {/* X Axis Labels */}
                  {DATES.map((date, i) => {
                    const x = padding.left + (i / (DATES.length - 1)) * graphW;
                    return (
                      <text
                        key={date}
                        x={x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        className="text-[10px] fill-slate-400 font-sans"
                      >
                        {date}
                      </text>
                    );
                  })}
                </svg>

                {/* Tooltip Card */}
                {hoveredDateIdx !== null && (
                  <div
                    className="absolute bg-white/95 backdrop-blur-sm border border-slate-100 rounded-[0.8vw] shadow-xl p-[0.8vw] pointer-events-none transition-all z-10"
                    style={{
                      left: `${((hoveredDateIdx / (DATES.length - 1)) * 65 + 15)}%`,
                      top: '30%',
                    }}
                  >
                    <div className="text-[0.75vw] font-medium text-slate-800 mb-[0.4vw]">
                      {DATES[hoveredDateIdx]}
                    </div>
                    <div className="space-y-[0.3vw]">
                      {selectedForCompare.map((c) => {
                        const item = LOCATION_DATA.find(d => d.country === c);
                        const val = item ? item.trend[hoveredDateIdx] : 0;
                        const cColor = colors[c]?.bg || 'bg-blue-500';
                        return (
                          <div key={c} className="flex items-center justify-between gap-[1.2vw] text-[0.72vw]">
                            <div className="flex items-center gap-[0.4vw]">
                              <span className={`w-[0.5vw] h-[0.5vw] rounded-full ${cColor}`} />
                              <span className="text-slate-600 font-normal">{c}</span>
                            </div>
                            <span className="font-semibold text-slate-800">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* World Map SVG representation */
              <div className="w-full h-[260px] flex items-center justify-center p-[1vw] bg-slate-50/50 rounded-[0.8vw]">
                <svg viewBox="0 0 800 400" className="w-full h-full max-h-[250px]">
                  {/* Simplified stylized continents */}
                  <g fill="#CBD5E1" opacity="0.6">
                    {/* North America */}
                    <path d="M 80,60 Q 140,50 180,80 Q 230,100 240,160 Q 180,220 120,180 Q 80,140 80,60 Z" fill="#2563EB" opacity="0.85" />
                    {/* South America */}
                    <path d="M 170,220 Q 220,240 200,320 Q 170,380 150,330 Q 140,260 170,220 Z" fill="#3B82F6" opacity="0.75" />
                    {/* Europe */}
                    <path d="M 360,70 Q 420,60 440,110 Q 400,140 360,120 Q 340,90 360,70 Z" fill="#1D4ED8" opacity="0.8" />
                    {/* Africa */}
                    <path d="M 360,150 Q 430,160 420,240 Q 390,310 360,260 Q 330,200 360,150 Z" fill="#93C5FD" opacity="0.5" />
                    {/* Asia */}
                    <path d="M 450,70 Q 580,50 630,120 Q 590,200 480,180 Q 440,130 450,70 Z" fill="#1E40AF" opacity="0.9" />
                    {/* India Highlight */}
                    <path d="M 500,180 Q 530,190 520,240 Q 490,220 500,180 Z" fill="#2563EB" opacity="1" />
                    {/* Australia */}
                    <path d="M 580,260 Q 640,250 640,310 Q 590,330 580,260 Z" fill="#2563EB" opacity="0.8" />
                  </g>
                </svg>
              </div>
            )}

            {/* Bottom Legend for Compare */}
            {viewMode === 'compare' && (
              <div className="flex items-center justify-center gap-[1.5vw] mt-[0.8vw] text-[0.75vw]">
                {selectedForCompare.map((c) => {
                  const cColor = colors[c]?.bg || 'bg-blue-500';
                  return (
                    <div key={c} className="flex items-center gap-[0.4vw]">
                      <span className={`w-[0.55vw] h-[0.55vw] rounded-full ${cColor}`} />
                      <span className="text-slate-600 font-medium">{c}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Selector & Bars Checklist */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-[1.8vw] flex flex-col justify-between">
            <div>
              {/* Selectors Header */}
              <div className="flex items-center justify-between gap-[0.8vw] mb-[1.4vw]">
                <div className="flex items-center gap-[0.4vw]">
                  <span className="text-[0.75vw] text-slate-500 font-medium">Map:</span>
                  <select className="cursor-pointer"
                    value={selectedMap}
                    onChange={(e) => setSelectedMap(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-[0.75vw] font-medium rounded-[0.4vw] px-[0.6vw] py-[0.3vw] focus:outline-none cursor-pointer"
                  >
                    <option value="World">World</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                  </select>
                </div>

                <div className="flex items-center gap-[0.4vw]">
                  <span className="text-[0.75vw] text-slate-500 font-medium">Country:</span>
                  <select className="cursor-pointer"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-[0.75vw] font-medium rounded-[0.4vw] px-[0.6vw] py-[0.3vw] focus:outline-none cursor-pointer"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>

              {/* Country Bars with Checkboxes */}
              <div className="space-y-[1.2vw]">
                {locationData.map((item) => {
                  const isChecked = selectedForCompare.includes(item.country);
                  const barWidth = `${(item.readers / maxReaders) * 100}%`;
                  return (
                    <div
                      key={item.country}
                      onClick={() => toggleCompareCountry(item.country)}
                      className="cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[0.82vw] mb-[0.25vw]">
                        <div className="flex items-center gap-[0.6vw]">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Handled by div click
                            className="w-[0.9vw] h-[0.9vw] rounded text-[#FF4D2D] accent-[#FF4D2D] cursor-pointer"
                          />
                          <span className="font-medium text-slate-800 group-hover:text-[#FF4D2D] transition-colors">
                            {item.country}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[0.75vw] font-normal">{item.readers} readers</span>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-[0.35vw] bg-slate-100 rounded-full overflow-hidden mb-[0.2vw]">
                        <div
                          className="h-full bg-blue-900 rounded-full transition-all duration-500"
                          style={{ width: barWidth }}
                        />
                      </div>
                      <div className="text-[0.68vw] text-slate-400">
                        {item.views} views Avg. {item.avgTime}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Analytics Table */}
      <div className="bg-white rounded-[1.2vw] p-[1.6vw] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[1vw] mb-[1.2vw]">
          <div>
            <h3 className="text-[1.1vw] font-medium text-slate-800">Location Analytics Table</h3>
            <p className="text-[0.78vw] text-slate-500 mt-[0.1vw]">Compare unique readers, views and reading time by location.</p>
          </div>
          <div className="flex items-center gap-[0.8vw]">
            <button className="flex items-center gap-[0.5vw] px-[0.9vw] py-[0.45vw] bg-white border border-slate-200 rounded-[0.6vw] text-[0.78vw] font-medium text-slate-700 hover:border-slate-300 transition-colors shadow-sm cursor-pointer">
              <span className="text-[#FF4D2D]">⇅</span>
              <span>Most viewed</span>
              <FiChevronDown className="text-slate-400 text-[0.8vw]" />
            </button>
            <button className="flex items-center gap-[0.5vw] px-[1vw] py-[0.45vw] bg-red-50 text-[#FF4D2D] rounded-[0.6vw] text-[0.78vw] font-medium hover:bg-red-100 transition-colors cursor-pointer">
              <FiDownload className="text-[0.85vw]" />
              <span>Download file</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[0.78vw] font-medium text-slate-700">
                <th className="py-[1vw] px-[1.2vw]">Location</th>
                <th className="py-[1vw] px-[1.2vw] text-center">Unique readers</th>
                <th className="py-[1vw] px-[1.2vw] text-center">Views</th>
                <th className="py-[1vw] px-[1.2vw] text-center">Avg. reading time</th>
                <th className="py-[1vw] px-[1.2vw] text-right">Share of readers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[0.8vw] text-slate-700">
              {paginatedLocations.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-[1.1vw] px-[1.2vw] font-medium text-slate-800">
                    {row.country}
                  </td>
                  <td className="py-[1.1vw] px-[1.2vw] text-center font-normal text-slate-600">
                    {row.readers}
                  </td>
                  <td className="py-[1.1vw] px-[1.2vw] text-center font-normal text-slate-600">
                    {row.views}
                  </td>
                  <td className="py-[1.1vw] px-[1.2vw] text-center font-normal text-slate-600">
                    {row.avgTime}
                  </td>
                  <td className="py-[1.1vw] px-[1.2vw] text-right font-normal text-slate-600">
                    {row.share}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between pt-[1.2vw] border-t border-slate-100 mt-[0.5vw] text-[0.78vw] text-slate-500">
          <span>{labelText}</span>
          {totalPages > 1 ? (
            <div className="flex items-center gap-[0.4vw]">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={`w-[1.8vw] h-[1.8vw] rounded-[0.4vw] flex items-center justify-center transition-colors ${
                  safeCurrentPage <= 1
                    ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'hover:bg-slate-100 text-slate-600 cursor-pointer'
                }`}
              >
                ‹
              </button>
              {pageItems.map((page, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={page === '...'}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  className={`w-[1.8vw] h-[1.8vw] rounded-[0.4vw] flex items-center justify-center font-medium transition-colors ${
                    page === '...'
                      ? 'cursor-default text-slate-400'
                      : safeCurrentPage === page
                      ? 'bg-[#FF4D2D] text-white shadow-xs cursor-pointer'
                      : 'hover:bg-slate-100 text-slate-600 cursor-pointer'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={`w-[1.8vw] h-[1.8vw] rounded-[0.4vw] flex items-center justify-center transition-colors ${
                  safeCurrentPage >= totalPages
                    ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'hover:bg-slate-100 text-slate-600 cursor-pointer'
                }`}
              >
                ›
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-[0.4vw]">
              <button
                type="button"
                className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] bg-[#FF4D2D] text-white font-medium flex items-center justify-center cursor-default"
              >
                1
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
