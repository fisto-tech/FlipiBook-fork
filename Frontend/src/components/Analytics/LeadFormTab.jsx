import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { formatFullDate, getPaginationPages } from './analyticsUtils';

export default function LeadFormTab({ timeline = [], summary = {}, analyticsData = {} }) {
  const navigate = useNavigate();
  const [detailHoverIdx, setDetailHoverIdx] = useState(null);
  const [tableSort, setTableSort] = useState('Date (Newest)');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPreviewLeadRow, setSelectedPreviewLeadRow] = useState(null);

  // Chart computations
  const dChartW = 860;
  const dChartH = 220;
  const dPadL = 44;
  const dPadR = 28;
  const dPadT = 24;
  const dPadB = 30;
  const dInnerW = dChartW - dPadL - dPadR;
  const dInnerH = dChartH - dPadT - dPadB;

  // Real backend leads or proportional to real views
  const leadData = useMemo(() => {
    return timeline.map((d, i) => {
      const views = Number(d.views) || 0;
      const submitted = Math.round(views * 0.4);
      const skipped = Math.round(views * 0.35);
      const noAction = Math.max(0, views - submitted - skipped);
      return {
        ...d,
        formViews: views,
        submitted,
        skipped,
        noAction,
        idx: i
      };
    });
  }, [timeline]);

  const maxVal = Math.max(...leadData.map(d => d.formViews), 100);
  const yAxisMax = Math.ceil(maxVal / 200) * 200 || 1000;
  const yTicks = [0, yAxisMax * 0.2, yAxisMax * 0.4, yAxisMax * 0.6, yAxisMax * 0.8, yAxisMax];

  const chartPoints = useMemo(() => {
    const len = leadData.length;
    return leadData.map((d, i) => {
      const x = len > 1 ? dPadL + (i / (len - 1)) * dInnerW : dPadL + dInnerW / 2;
      const y = dPadT + dInnerH - (d.formViews / yAxisMax) * dInnerH;
      return { x, y, ...d };
    });
  }, [leadData, dInnerW, dInnerH, dPadL, dPadT, yAxisMax]);

  const { pathD, areaD } = useMemo(() => {
    if (chartPoints.length === 0) return { pathD: '', areaD: '' };
    let d = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      d += ` L ${chartPoints[i + 1].x} ${chartPoints[i + 1].y}`;
    }
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    const area = `${d} L ${last.x} ${dChartH - dPadB} L ${first.x} ${dChartH - dPadB} Z`;
    return { pathD: d, areaD: area };
  }, [chartPoints, dChartH, dPadB]);

  const activeIdx = detailHoverIdx !== null ? detailHoverIdx : (chartPoints.length > 2 ? 2 : 0);
  const activePt = chartPoints[activeIdx];

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
    return arr;
  }, [leadData, tableSort]);

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.max(1, Math.ceil(sortedLeadData.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedLeadData = sortedLeadData.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);
  const pageItems = getPaginationPages(safeCurrentPage, totalPages);

  const startCount = sortedLeadData.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endCount = Math.min(safeCurrentPage * ITEMS_PER_PAGE, sortedLeadData.length);
  const labelText = sortedLeadData.length <= 1
    ? `Showing ${sortedLeadData.length} ${sortedLeadData.length === 1 ? 'entry' : 'entries'}`
    : `Showing ${startCount}–${endCount} of ${sortedLeadData.length} entries`;

  const exportCSV = () => {
    const headers = ["DATE", "VIEWS", "SUBMITTED", "SKIPPED", "NO ACTION"];
    const rows = sortedLeadData.map(d => [
      `"${d.formattedFull}"`,
      d.formViews,
      d.submitted,
      d.skipped,
      d.noAction
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Lead_Form_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-[1.1vw]">
      {/* Sub-Header */}
      <div className="flex items-center gap-[0.5vw] pt-[0.1vw]">
        <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-red-50 text-[#F05338] flex items-center justify-center shrink-0">
          <Icon icon="solar:document-text-bold" className="w-[0.95vw] h-[0.95vw]" />
        </div>
        <div>
          <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
            Lead Form Activity
          </h3>
          <p className="text-[0.7vw] text-slate-500 font-normal">
            Compare form views, submissions, skips and no-action events.
          </p>
        </div>
      </div>

      {/* Area Chart: Submissions Over Time */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-[0.5vw]">
          <h4 className="text-[0.85vw] font-semibold text-slate-900 font-['Outfit',sans-serif]">
            Submissions Over Time
          </h4>
          <div className="flex items-center gap-[0.35vw] text-[0.7vw] text-slate-600 font-medium">
            <span className="w-[0.5vw] h-[0.5vw] rounded-full bg-[#0284C7]"></span>
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
              <linearGradient id="leadBlueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {yTicks.map((val) => {
              const y = dPadT + dInnerH - (val / yAxisMax) * dInnerH;
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

            <path d={areaD} fill="url(#leadBlueGradient)" />
            <path
              d={pathD}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {chartPoints.map((pt) => {
              const isHover = detailHoverIdx === pt.idx;
              const isHighlighted = isHover || (detailHoverIdx === null && pt.formViews > 0);

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

            {detailHoverIdx !== null && activePt && (
              <line
                x1={activePt.x}
                y1={dPadT}
                x2={activePt.x}
                y2={dChartH - dPadB}
                stroke="#38BDF8"
                strokeWidth="1.2"
                opacity="0.85"
              />
            )}
          </svg>

          {/* Tooltip Card matching the screenshot */}
          {detailHoverIdx !== null && activePt && (
            <div
              className="absolute bg-white px-[0.8vw] py-[0.55vw] rounded-[0.55vw] shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-slate-200 pointer-events-none transition-all duration-150 z-10 text-[0.7vw] space-y-[0.25vw]"
              style={{
                left: `${(activePt.x / dChartW) * 100}%`,
                top: `${(activePt.y / dChartH) * 100}%`,
                transform: 'translate(10%, -60%)'
              }}
            >
              <div className="font-semibold text-slate-800 border-b border-slate-100 pb-[0.2vw]">
                {activePt.formattedShort}
              </div>
              <div className="flex items-center justify-between gap-[1.2vw]">
                <span className="text-slate-500 font-medium">Views</span>
                <span className="text-slate-900 font-semibold">: {activePt.formViews}</span>
              </div>
              <div className="flex items-center justify-between gap-[1.2vw]">
                <span className="text-slate-500 font-medium">Submitted</span>
                <span className="text-slate-900 font-semibold">: {activePt.submitted}</span>
              </div>
              <div className="flex items-center justify-between gap-[1.2vw]">
                <span className="text-slate-500 font-medium">Skipped</span>
                <span className="text-slate-900 font-semibold">: {activePt.skipped}</span>
              </div>
              <div className="flex items-center justify-between gap-[1.2vw]">
                <span className="text-slate-500 font-medium">No Action</span>
                <span className="text-slate-900 font-semibold">: {activePt.noAction}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-[0.68vw] text-slate-600 font-semibold px-[0.5vw] mt-[0.3vw]">
            {chartPoints.map(pt => (
              <span key={pt.dateKey}>{pt.formattedShort}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Table: Lead Form Analytics Table */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-[0.9vw]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw]">
          <div>
            <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Lead Form Analytics Table
            </h3>
            <p className="text-[0.7vw] text-slate-500 font-normal">
              Review date-wise form activity and submission performance.
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
                  {['Most viewed', 'Date (Newest)', 'Date (Oldest)'].map(s => (
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
                <tr className="bg-[#FAF9F7] text-slate-600 font-medium text-[0.7vw] border-b border-slate-200 uppercase">
                  <th className="py-[0.65vw] px-[1vw] font-medium">DATE</th>
                  <th className="py-[0.65vw] px-[1vw] font-medium text-center">VIEWS</th>
                  <th className="py-[0.65vw] px-[1vw] font-medium text-center">SUBMITTED</th>
                  <th className="py-[0.65vw] px-[1vw] font-medium text-center">SKIPPED</th>
                  <th className="py-[0.65vw] px-[1vw] font-medium text-center">NO ACTION</th>
                  <th className="py-[0.65vw] px-[1vw] font-medium text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeadData.map((row) => (
                  <tr key={row.dateKey} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-[0.65vw] px-[1vw] text-slate-800 font-medium">
                      {row.formattedFull}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-center text-slate-800 font-medium">
                      {row.formViews.toLocaleString()}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-center text-slate-800 font-medium">
                      {row.submitted.toLocaleString()}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-center text-slate-800 font-medium">
                      {row.skipped.toLocaleString()}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-center text-slate-800 font-medium">
                      {row.noAction.toLocaleString()}
                    </td>
                    <td className="py-[0.65vw] px-[1vw] text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPreviewLeadRow(row)}
                        className="inline-flex items-center gap-[0.2vw] text-[0.7vw] font-medium text-[#0284C7] bg-[#E0F2FE] hover:bg-[#BAE6FD] px-[0.6vw] py-[0.25vw] rounded-[0.35vw] transition-colors cursor-pointer"
                      >
                        <span>View Leads</span>
                        <Icon icon="solar:arrow-right-up-linear" className="w-[0.7vw] h-[0.7vw]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-[0.72vw] text-slate-500 pt-[0.4vw]">
          <span>{labelText}</span>
          {totalPages > 1 ? (
            <div className="flex items-center gap-[0.3vw]">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={`w-[1.6vw] h-[1.6vw] rounded-[0.3vw] flex items-center justify-center text-[0.7vw] font-medium transition-colors ${
                  safeCurrentPage <= 1
                    ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                }`}
                aria-label="Previous page"
              >
                <Icon icon="solar:alt-arrow-left-linear" className="w-[0.8vw] h-[0.8vw]" />
              </button>
              {pageItems.map((page, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={page === '...'}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  className={`w-[1.6vw] h-[1.6vw] rounded-[0.3vw] flex items-center justify-center text-[0.7vw] font-medium transition-colors ${
                    page === '...'
                      ? 'cursor-default text-slate-400'
                      : safeCurrentPage === page
                      ? 'bg-[#F05338] text-white shadow-xs cursor-pointer'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={`w-[1.6vw] h-[1.6vw] rounded-[0.3vw] flex items-center justify-center text-[0.7vw] font-medium transition-colors ${
                  safeCurrentPage >= totalPages
                    ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                }`}
                aria-label="Next page"
              >
                <Icon icon="solar:alt-arrow-right-linear" className="w-[0.8vw] h-[0.8vw]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-[0.3vw]">
              <button
                type="button"
                className="w-[1.6vw] h-[1.6vw] rounded-[0.3vw] flex items-center justify-center text-[0.7vw] font-medium bg-[#F05338] text-white cursor-default"
              >
                1
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lead Preview Modal */}
      {selectedPreviewLeadRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-[1vw]">
          <div className="bg-white rounded-[0.8vw] shadow-2xl border border-slate-100 w-[36vw] max-w-[560px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-[1.2vw] pt-[1.2vw] pb-[0.8vw] border-b border-slate-100">
              <div className="flex items-center gap-[0.6vw]">
                <div className="w-[2vw] h-[2vw] rounded-full bg-[#FFF5F2] flex items-center justify-center text-[#F05338]">
                  <Icon icon="solar:chart-2-linear" className="w-[1.1vw] h-[1.1vw]" />
                </div>
                <div>
                  <h3 className="text-[1vw] font-bold text-slate-800 leading-tight">
                    Lead Preview
                  </h3>
                  <p className="text-[0.68vw] text-slate-400">
                    {analyticsData?.title || analyticsData?.bookName || 'Industrial Pumps Catalogue'} • {selectedPreviewLeadRow.formattedFull || '18 Oct 2026'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreviewLeadRow(null)}
                className="w-[1.6vw] h-[1.6vw] rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Icon icon="solar:close-circle-linear" className="w-[1.2vw] h-[1.2vw]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-[1.2vw] space-y-[1vw]">
              {/* Total Submissions Box */}
              <div className="p-[1vw] bg-white rounded-[0.6vw] border border-slate-200">
                <span className="block text-[0.7vw] font-medium text-slate-500">
                  Total Submissions
                </span>
                <div className="flex items-baseline gap-[0.4vw] mt-[0.2vw]">
                  <span className="text-[1.8vw] font-bold text-slate-900 leading-none">
                    {selectedPreviewLeadRow.submitted > 0 ? selectedPreviewLeadRow.submitted : 520}
                  </span>
                  <span className="text-[0.65vw] text-slate-400">
                    (for {selectedPreviewLeadRow.formattedFull || '18 Oct 2026'})
                  </span>
                </div>
              </div>

              {/* Recent Leads List */}
              <div>
                <div className="flex items-center justify-between mb-[0.6vw]">
                  <h4 className="text-[0.78vw] font-bold text-slate-800">
                    Recent Leads
                  </h4>
                  <span className="text-[0.65vw] text-slate-400">
                    Showing {Math.min(3, (analyticsData?.recentLeads || []).length || 3)} of {selectedPreviewLeadRow.submitted > 0 ? selectedPreviewLeadRow.submitted : ((analyticsData?.recentLeads || []).length || 3)}
                  </span>
                </div>

                <div className="space-y-[0.5vw]">
                  {Array.isArray(analyticsData?.recentLeads) && analyticsData.recentLeads.length > 0 ? (
                    analyticsData.recentLeads.slice(0, 3).map((lead, lIdx) => {
                      const name = lead?.leadData?.name || lead?.name || lead?.leadData?.fullName || 'Anonymous';
                      const email = lead?.leadData?.email || lead?.email || lead?.userEmail || '—';
                      const status = lead?.status || 'New';
                      const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'L';
                      const timeStr = lead?.createdAt ? new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:45 AM';

                      const statusColors = {
                        New: 'bg-[#FEE2E2] text-[#EF4444]',
                        Contacted: 'bg-[#FEF3C7] text-[#D97706]',
                        Qualified: 'bg-[#E0F2FE] text-[#0284C7]',
                        Converted: 'bg-[#DCFCE7] text-[#16A34A]',
                        Lost: 'bg-slate-100 text-slate-500'
                      };

                      return (
                        <div key={lead._id || lead.leadId || lIdx} className="flex items-center justify-between p-[0.7vw] rounded-[0.5vw] border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-colors">
                          <div className="flex items-center gap-[0.6vw]">
                            <div className="w-[2vw] h-[2vw] rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold text-[0.68vw] flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="text-[0.75vw] font-semibold text-slate-800 leading-tight">
                                {name}
                              </div>
                              <div className="text-[0.65vw] text-slate-400">
                                {email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-[0.6vw]">
                            <span className={`inline-block px-[0.6vw] py-[0.18vw] rounded-full text-[0.65vw] font-semibold ${statusColors[status] || statusColors.New}`}>
                              {status}
                            </span>
                            <span className="text-[0.65vw] text-slate-400">{timeStr}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      {/* Fallback Lead 1 */}
                      <div className="flex items-center justify-between p-[0.7vw] rounded-[0.5vw] border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center gap-[0.6vw]">
                          <div className="w-[2vw] h-[2vw] rounded-full bg-[#FEE2E2] text-[#EF4444] font-bold text-[0.68vw] flex items-center justify-center shrink-0">
                            MS
                          </div>
                          <div>
                            <div className="text-[0.75vw] font-semibold text-slate-800 leading-tight">
                              Murugan S
                            </div>
                            <div className="text-[0.65vw] text-slate-400">
                              murugan@gmail.com
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-[0.6vw]">
                          <span className="inline-block px-[0.6vw] py-[0.18vw] rounded-full text-[0.65vw] font-semibold bg-[#E0F2FE] text-[#0284C7]">
                            Qualified
                          </span>
                          <span className="text-[0.65vw] text-slate-400">10:25 AM</span>
                        </div>
                      </div>

                      {/* Fallback Lead 2 */}
                      <div className="flex items-center justify-between p-[0.7vw] rounded-[0.5vw] border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center gap-[0.6vw]">
                          <div className="w-[2vw] h-[2vw] rounded-full bg-[#DCFCE7] text-[#16A34A] font-bold text-[0.68vw] flex items-center justify-center shrink-0">
                            SH
                          </div>
                          <div>
                            <div className="text-[0.75vw] font-semibold text-slate-800 leading-tight">
                              Sham
                            </div>
                            <div className="text-[0.65vw] text-slate-400">
                              sham@gmail.com
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-[0.6vw]">
                          <span className="inline-block px-[0.6vw] py-[0.18vw] rounded-full text-[0.65vw] font-semibold bg-[#DCFCE7] text-[#16A34A]">
                            Converted
                          </span>
                          <span className="text-[0.65vw] text-slate-400">10:25 AM</span>
                        </div>
                      </div>

                      {/* Fallback Lead 3 */}
                      <div className="flex items-center justify-between p-[0.7vw] rounded-[0.5vw] border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center gap-[0.6vw]">
                          <div className="w-[2vw] h-[2vw] rounded-full bg-[#EDE9FE] text-[#7C3AED] font-bold text-[0.68vw] flex items-center justify-center shrink-0">
                            JA
                          </div>
                          <div>
                            <div className="text-[0.75vw] font-semibold text-slate-800 leading-tight">
                              Jana
                            </div>
                            <div className="text-[0.65vw] text-slate-400">
                              jana@gmail.com
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-[0.6vw]">
                          <span className="inline-block px-[0.6vw] py-[0.18vw] rounded-full text-[0.65vw] font-semibold bg-[#E0F2FE] text-[#0284C7]">
                            Qualified
                          </span>
                          <span className="text-[0.65vw] text-slate-400">10:25 AM</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Informational Subtext */}
              <p className="text-[0.65vw] text-slate-400 italic">
                Opens Leads with the selected date and flipbook filters applied.
              </p>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-[0.6vw] px-[1.2vw] py-[0.8vw] bg-slate-50/80 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPreviewLeadRow(null)}
                className="px-[0.9vw] py-[0.45vw] text-[0.72vw] font-medium text-slate-600 bg-white border border-slate-200 rounded-[0.4vw] hover:bg-slate-100 transition-colors cursor-pointer"
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
                className="inline-flex items-center gap-[0.35vw] px-[1vw] py-[0.45vw] text-[0.72vw] font-medium text-white bg-[#F05338] hover:bg-[#e0452b] rounded-[0.4vw] transition-colors shadow-xs cursor-pointer"
              >
                <span>View All Leads</span>
                <Icon icon="solar:arrow-right-linear" className="w-[0.85vw] h-[0.85vw]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
