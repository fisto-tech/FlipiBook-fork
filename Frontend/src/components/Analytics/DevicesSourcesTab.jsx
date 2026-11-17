import React, { useState } from 'react';
import { Icon } from '@iconify/react';

export default function DevicesSourcesTab({ analyticsData = {}, summary = {} }) {
  const [tableSort, setTableSort] = useState('Most viewed');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredSource, setHoveredSource] = useState('Referral');

  const rawDevices = analyticsData?.devices || [];
  const rawBrowsers = analyticsData?.browsers || [];
  const rawSources = analyticsData?.sources || [];
  const totalViews = summary?.totalViews || analyticsData?.summary?.totalViews || 0;

  // Donut values dynamically from analyticsData if available
  const devices = React.useMemo(() => {
    if (rawDevices.length > 0) {
      const palette = ['#0284C7', '#84CC16', '#7DD3FC', '#F59E0B', '#8B5CF6'];
      return rawDevices.map((d, idx) => ({
        name: d.type || 'Other',
        pct: d.percentage || (totalViews > 0 ? Math.round((d.views / totalViews) * 100) : 0),
        users: `${d.views} - Views`,
        color: palette[idx % palette.length]
      }));
    }
    return [
      { name: 'Desktop', pct: 100, users: `${totalViews} - Views`, color: '#0284C7' },
      { name: 'Mobile', pct: 0, users: '0 - Views', color: '#84CC16' },
      { name: 'Tablet', pct: 0, users: '0 - Views', color: '#7DD3FC' },
    ];
  }, [rawDevices, totalViews]);

  // Bar chart views by source dynamically from backend or fallback to real counts
  const sources = React.useMemo(() => {
    const list = [
      { name: 'Direct', color: 'bg-[#0284C7]' },
      { name: 'Social', color: 'bg-[#10B981]' },
      { name: 'Referral', color: 'bg-[#A3E635]' },
      { name: 'Campaign', color: 'bg-[#7DD3FC]' },
      { name: 'Others', color: 'bg-[#BEF264]' },
    ];
    return list.map(item => {
      const found = rawSources.find(s => s.name.toLowerCase().includes(item.name.toLowerCase()));
      const actualViews = found ? found.views : (item.name === 'Direct' && rawSources.length === 0 ? totalViews : 0);
      const views = totalViews > 0 ? Math.round((actualViews / totalViews) * 100) : (item.name === 'Direct' && actualViews > 0 ? 100 : 0);
      return {
        ...item,
        actualViews,
        views
      };
    });
  }, [rawSources, totalViews]);

  // Table rows dynamically from browsers or fallback
  const trafficRows = React.useMemo(() => {
    if (rawBrowsers.length > 0) {
      return rawBrowsers.map((b) => ({
        browser: b.browser || 'Chrome',
        platform: 'Windows / Mac / Mobile',
        views: b.views?.toLocaleString() || '1',
        share: totalViews > 0 ? `${Math.round((b.views / totalViews) * 100)}%` : '100%'
      }));
    }
    return [
      { browser: 'Chrome', platform: 'Windows', views: `${totalViews || 1}`, share: '100%' }
    ];
  }, [rawBrowsers, totalViews]);

  const exportCSV = () => {
    const headers = ["Browser", "Platform", "Views", "Share"];
    const rows = trafficRows.map(r => [
      `"${r.browser}"`,
      `"${r.platform}"`,
      `"${r.views}"`,
      `"${r.share}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Traffic_Sources_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-[1.1vw]">
      {/* Sub-Header */}
      <div className="flex items-center gap-[0.5vw] pt-[0.1vw]">
        <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
          <Icon icon="solar:devices-bold" className="w-[0.95vw] h-[0.95vw]" />
        </div>
        <div>
          <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
            Device Breakdown
          </h3>
          <p className="text-[0.7vw] text-slate-500 font-normal">
            See how readers access your flipbooks across desktop, mobile and tablet.
          </p>
        </div>
      </div>

      {/* Dual Cards: Devices Used (Donut with leader lines) + Views by source (Bar chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1vw]">

        {/* Left: Devices Used Donut with leader lines */}
        <div className="bg-white rounded-[0.75vw] p-[1.2vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <h4 className="text-[0.85vw] font-semibold text-slate-900 font-['Outfit',sans-serif] mb-[0.5vw]">
            Devices Used
          </h4>

          <div className="relative w-full h-[15vw] flex items-center justify-center my-[0.4vw]">
            {/* SVG Donut with Leader Lines */}
            <svg viewBox="0 0 300 240" className="w-full h-full select-none">
              {/* Leader lines & labels */}
              {/* Mobile (Top Left 40%): line to (75, 45) -> (50, 45) */}
              <polyline points="75,100 50,55 25,55" fill="none" stroke="#64748B" strokeWidth="1" />
              <text x="25" y="45" fontSize="12" fontWeight="600" fill="#0F172A">40 %</text>
              <text x="25" y="68" fontSize="9" fill="#64748B">400 - Users</text>

              {/* Desktop (Right 50%): line to (215, 110) -> (245, 110) */}
              <polyline points="215,130 245,130 270,130" fill="none" stroke="#64748B" strokeWidth="1" />
              <text x="245" y="120" fontSize="12" fontWeight="600" fill="#0F172A">50 %</text>
              <text x="245" y="142" fontSize="9" fill="#64748B">586 - Users</text>

              {/* Tablet (Bottom Left 10%): line to (115, 185) -> (70, 205) */}
              <polyline points="120,175 90,205 60,205" fill="none" stroke="#64748B" strokeWidth="1" />
              <text x="60" y="198" fontSize="12" fontWeight="600" fill="#0F172A">10 %</text>
              <text x="60" y="218" fontSize="9" fill="#64748B">180 - Users</text>

              {/* Center Donut Ring */}
              <g transform="translate(150, 120) rotate(-90)">
                {(() => {
                  const circumference = 2 * Math.PI * 52;
                  // Desktop 50% (dash 163.3), Mobile 40% (dash 130.6), Tablet 10% (dash 32.7)
                  const deskDash = 0.5 * circumference;
                  const mobDash = 0.4 * circumference;
                  const tabDash = 0.1 * circumference;

                  return (
                    <>
                      {/* Desktop Segment (#0284C7) */}
                      <circle
                        cx="0"
                        cy="0"
                        r="52"
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="28"
                        strokeDasharray={`${deskDash} ${circumference - deskDash}`}
                        strokeDashoffset="0"
                      />
                      {/* Mobile Segment (#A3E635 / Green) */}
                      <circle
                        cx="0"
                        cy="0"
                        r="52"
                        fill="none"
                        stroke="#A3E635"
                        strokeWidth="28"
                        strokeDasharray={`${mobDash} ${circumference - mobDash}`}
                        strokeDashoffset={`-${deskDash}`}
                      />
                      {/* Tablet Segment (#7DD3FC / Light Blue) */}
                      <circle
                        cx="0"
                        cy="0"
                        r="52"
                        fill="none"
                        stroke="#7DD3FC"
                        strokeWidth="28"
                        strokeDasharray={`${tabDash} ${circumference - tabDash}`}
                        strokeDashoffset={`-${deskDash + mobDash}`}
                      />
                    </>
                  );
                })()}
              </g>

              {/* Center Content */}
              <text x="150" y="118" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0F172A">100 %</text>
              <text x="150" y="134" textAnchor="middle" fontSize="9" fill="#64748B">1200 Users</text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-[2vw] pt-[0.5vw] border-t border-slate-100 text-[0.74vw]">
            <div className="flex items-center gap-[0.4vw]">
              <span className="w-[0.6vw] h-[0.6vw] rounded-full bg-[#0284C7]"></span>
              <span className="text-slate-700 font-medium">Desktop</span>
            </div>
            <div className="flex items-center gap-[0.4vw]">
              <span className="w-[0.6vw] h-[0.6vw] rounded-full bg-[#7DD3FC]"></span>
              <span className="text-slate-700 font-medium">Tablet</span>
            </div>
            <div className="flex items-center gap-[0.4vw]">
              <span className="w-[0.6vw] h-[0.6vw] rounded-full bg-[#A3E635]"></span>
              <span className="text-slate-700 font-medium">Mobile</span>
            </div>
          </div>
        </div>

        {/* Right: Views by source (Bar chart) */}
        <div className="bg-white rounded-[0.75vw] p-[1.2vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <h4 className="text-[0.85vw] font-semibold text-slate-900 font-['Outfit',sans-serif] mb-[0.5vw]">
            Views by source
          </h4>

          {/* Bar Chart Canvas with Dotted Grid */}
          <div className="relative w-full h-[15vw] flex flex-col justify-between my-[0.4vw]">
            <svg viewBox="0 0 440 200" className="w-full h-full select-none overflow-visible">
              {/* Dotted Y-axis Guide lines */}
              {[0, 20, 40, 60, 80, 100].map(v => {
                const y = 170 - (v / 100) * 150;
                return (
                  <g key={v}>
                    <line x1="30" y1={y} x2="430" y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="24" y={y + 3.5} textAnchor="end" fontSize="9" fill="#94A3B8">{v}</text>
                  </g>
                );
              })}

              {/* Bars */}
              {sources.map((src, i) => {
                const barWidth = 32;
                const barSpacing = 78;
                const x = 50 + i * barSpacing;
                const h = (src.views / 100) * 150;
                const y = 170 - h;
                const isHovered = hoveredSource === src.name;

                const fillColor = {
                  'Direct': '#0284C7',
                  'Social': '#10B981',
                  'Referral': '#A3E635',
                  'Campaign': '#7DD3FC',
                  'Others': '#BEF264'
                }[src.name] || '#0284C7';

                return (
                  <g key={src.name} className="cursor-pointer" onMouseEnter={() => setHoveredSource(src.name)}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      rx="4"
                      fill={fillColor}
                      className="transition-all duration-300 hover:opacity-90"
                    />
                    <text
                      x={x + barWidth / 2}
                      y="185"
                      textAnchor="middle"
                      fontSize="9"
                      fill="#64748B"
                      fontWeight="500"
                    >
                      {src.name === 'Others' ? 'Other / Unknown' : src.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card matching the screenshot (e.g. Referral: 523 Views) */}
            {hoveredSource && (
              <div
                className="absolute bg-white px-[0.7vw] py-[0.35vw] rounded-[0.45vw] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-200 pointer-events-none text-[0.72vw] z-10"
                style={{
                  left: hoveredSource === 'Direct' ? '20%' : hoveredSource === 'Social' ? '36%' : hoveredSource === 'Referral' ? '54%' : hoveredSource === 'Campaign' ? '70%' : '84%',
                  top: '60%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="flex items-center gap-[0.3vw]">
                  <span className="text-slate-700 font-semibold">{hoveredSource}</span>
                  <span className="text-slate-500">:</span>
                  <span className="text-slate-900 font-bold">
                    {sources.find(s => s.name === hoveredSource)?.actualViews || 0} Views
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-[1.5vw] pt-[0.5vw] border-t border-slate-100 text-[0.74vw] flex-wrap">
            <div className="flex items-center gap-[0.3vw]">
              <span className="w-[0.55vw] h-[0.55vw] rounded-full bg-[#0284C7]"></span>
              <span className="text-slate-700 font-medium">Direct</span>
            </div>
            <div className="flex items-center gap-[0.3vw]">
              <span className="w-[0.55vw] h-[0.55vw] rounded-full bg-[#10B981]"></span>
              <span className="text-slate-700 font-medium">Social</span>
            </div>
            <div className="flex items-center gap-[0.3vw]">
              <span className="w-[0.55vw] h-[0.55vw] rounded-full bg-[#A3E635]"></span>
              <span className="text-slate-700 font-medium">Referral</span>
            </div>
            <div className="flex items-center gap-[0.3vw]">
              <span className="w-[0.55vw] h-[0.55vw] rounded-full bg-[#7DD3FC]"></span>
              <span className="text-slate-700 font-medium">Campaign</span>
            </div>
            <div className="flex items-center gap-[0.3vw]">
              <span className="w-[0.55vw] h-[0.55vw] rounded-full bg-[#BEF264]"></span>
              <span className="text-slate-700 font-medium">Others</span>
            </div>
          </div>
        </div>

      </div>

      {/* Traffic Sources Table */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-[0.9vw]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw]">
          <div>
            <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Traffic Sources
            </h3>
            <p className="text-[0.7vw] text-slate-500 font-normal">
              Understand where your readers come from, including direct, social and referral traffic.
            </p>
          </div>

          <div className="flex items-center gap-[0.5vw]">
            <div className="relative">
              <button className="cursor-pointer"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="inline-flex items-center gap-[0.4vw] px-[0.75vw] py-[0.32vw] bg-white border border-slate-200 rounded-[0.4vw] text-[0.7vw] text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
              >
                <Icon icon="solar:sort-vertical-linear" className="w-[0.8vw] h-[0.8vw] text-[#F05338]" />
                <span>{tableSort}</span>
                <Icon icon="solar:alt-arrow-down-linear" className="w-[0.65vw] h-[0.65vw] text-slate-400" />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-[0.25vw] w-[8vw] bg-white border border-slate-200 rounded-[0.4vw] shadow-lg py-[0.25vw] z-20 text-[0.7vw]">
                  {['Most viewed', 'Browser (A-Z)'].map(s => (
                    <button className="cursor-pointer"
                      key={s}
                      onClick={() => { setTableSort(s); setIsSortOpen(false); }}
                      className="w-full text-left px-[0.7vw] py-[0.3vw] hover:bg-slate-50 text-slate-700 cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={exportCSV}
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
                  <th className="py-[0.65vw] px-[1vw] font-medium">Browser</th>
                  <th className="py-[0.65vw] px-[1vw] font-medium">Platform</th>
                  <th className="py-[0.65vw] px-[1vw] font-medium text-center">Views</th>
                  <th className="py-[0.65vw] px-[1vw] font-medium text-center">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trafficRows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-[0.65vw] px-[1vw] text-slate-800 font-medium">
                      {row.browser}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-slate-600 font-normal">
                      {row.platform}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-center text-slate-800 font-medium">
                      {row.views}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-center text-slate-800 font-medium">
                      {row.share}
                    </td>
                  </tr>
                ))}

                <tr className="bg-slate-50/80 font-semibold border-t-2 border-slate-200">
                  <td className="py-[0.65vw] px-[1vw] text-slate-900 font-semibold">
                    Total
                  </td>
                  <td className="py-[0.65vw] px-[1vw] text-slate-700 font-normal">
                    {trafficRows.length} Browsers
                  </td>
                  <td className="py-[0.65vw] px-[1vw] text-center text-slate-900 font-semibold">
                    {totalViews || 0}
                  </td>
                  <td className="py-[0.65vw] px-[1vw] text-center text-slate-900 font-semibold">
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-[0.72vw] text-slate-500 pt-[0.4vw]">
          <span>Showing 1–4 of 24 locations</span>
          <div className="flex items-center gap-[0.3vw]">
            {[1, 2, 3, 4, '...', 24].map((page, i) => (
              <button className="cursor-pointer"
                key={i}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                className={`w-[1.6vw] h-[1.6vw] rounded-[0.3vw] flex items-center justify-center text-[0.7vw] font-medium transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#F05338] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
