import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Generate a standalone HTML5 Canvas chart and return a PNG data URL.
 * Renders at 2x/3x scale for ultra-crisp Retina / high-DPI clarity in Excel.
 * Supports:
 * - 'bar' (vertical bar chart with values & labels)
 * - 'line' (smooth line + filled area chart with points)
 * - 'pie' / 'donut' (clean donut/pie chart with legend & percentages)
 */
export function generateChartImage({
  type = 'bar',
  title = '',
  subtitle = '',
  labels = [],
  datasets = [], // [{ label, data: [], color: '#4F46E5', fill: '#EEF2FF' }]
  width = 900,
  height = 460,
  pixelRatio = 2
}) {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  // Upscale canvas buffer dimensions for ultra sharp text and lines
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Scale drawing context so coordinate calculations remain identical
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Border & subtle rounded card container
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Title & Subtitle
  let curY = 40;
  if (title) {
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(title, 36, curY);
    curY += 22;
  }
  if (subtitle) {
    ctx.fillStyle = '#64748B';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(subtitle, 36, curY);
    curY += 26;
  } else {
    curY += 10;
  }

  const plotX = 70;
  const plotY = curY + 15;
  const plotW = width - plotX - 50;
  const plotH = height - plotY - 60;

  if (type === 'pie' || type === 'donut') {
    // Pie / Donut Chart
    const ds = datasets[0] || { data: [] };
    const values = ds.data || [];
    const total = values.reduce((sum, v) => sum + (Number(v) || 0), 0) || 1;
    const defaultColors = [
      '#F05338', '#0284C7', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#64748B'
    ];

    const centerX = plotX + plotW * 0.32;
    const centerY = plotY + plotH * 0.5;
    const radius = Math.min(plotW * 0.3, plotH * 0.44);
    const innerRadius = type === 'donut' ? radius * 0.55 : 0;

    let startAngle = -Math.PI / 2;
    values.forEach((val, i) => {
      const sliceAngle = ((Number(val) || 0) / total) * 2 * Math.PI;
      const color = (ds.colors && ds.colors[i]) || defaultColors[i % defaultColors.length];

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      if (innerRadius > 0) {
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      } else {
        ctx.lineTo(centerX, centerY);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      startAngle += sliceAngle;
    });

    // Donut center text
    if (type === 'donut') {
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(total >= 1000 ? `${(total / 1000).toFixed(1)}k` : `${total}`, centerX, centerY - 6);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('TOTAL', centerX, centerY + 14);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    // Legend on Right
    const legendX = plotX + plotW * 0.62;
    let legendY = plotY + 20;
    const maxLegendItems = Math.min(labels.length, 10);

    for (let i = 0; i < maxLegendItems; i++) {
      const val = Number(values[i]) || 0;
      const pct = Math.round((val / total) * 100);
      const color = (ds.colors && ds.colors[i]) || defaultColors[i % defaultColors.length];

      // Color badge
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(legendX, legendY - 11, 14, 14, 3) : ctx.fillRect(legendX, legendY - 11, 14, 14);
      ctx.fill();

      // Label text
      ctx.fillStyle = '#334155';
      ctx.font = '500 13px sans-serif';
      const labelText = labels[i] || `Item ${i + 1}`;
      ctx.fillText(labelText.length > 18 ? labelText.slice(0, 17) + '…' : labelText, legendX + 22, legendY);

      // Value & Percent
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`${val} (${pct}%)`, legendX + 175, legendY);

      legendY += 28;
    }

  } else if (type === 'line') {
    // Line & Area Chart
    const ds = datasets[0] || { data: [] };
    const values = ds.data.map(v => Number(v) || 0);
    const maxVal = Math.max(...values, 5);
    const yMax = Math.ceil(maxVal * 1.15) || 10;

    // Y Axis Grid lines & ticks
    const ticks = 4;
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px sans-serif';

    for (let t = 0; t <= ticks; t++) {
      const tickVal = Math.round((yMax / ticks) * t);
      const y = plotY + plotH - (t / ticks) * plotH;
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();

      ctx.fillText(tickVal >= 1000 ? `${(tickVal / 1000).toFixed(1)}k` : `${tickVal}`, plotX - 32, y + 4);
    }

    if (values.length > 0) {
      const stepX = values.length > 1 ? plotW / (values.length - 1) : plotW / 2;
      const pts = values.map((v, i) => ({
        x: values.length > 1 ? plotX + i * stepX : plotX + plotW / 2,
        y: plotY + plotH - (v / yMax) * plotH
      }));

      // Area fill
      ctx.beginPath();
      ctx.moveTo(pts[0].x, plotY + plotH);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, plotY + plotH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, plotY, 0, plotY + plotH);
      grad.addColorStop(0, 'rgba(240, 83, 56, 0.25)');
      grad.addColorStop(1, 'rgba(240, 83, 56, 0.01)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke Line
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = ds.color || '#F05338';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Points & Labels
      pts.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = ds.color || '#F05338';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // X Label
        if (labels[i]) {
          ctx.fillStyle = '#64748B';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(labels[i], p.x, plotY + plotH + 20);
          ctx.textAlign = 'left';
        }
      });
    }

  } else {
    // Vertical Bar Chart
    const primaryDs = datasets[0] || { data: [] };
    const secondaryDs = datasets[1] || null;
    const values1 = primaryDs.data.map(v => Number(v) || 0);
    const values2 = secondaryDs ? secondaryDs.data.map(v => Number(v) || 0) : [];
    const allVals = [...values1, ...values2];
    const maxVal = Math.max(...allVals, 5);
    const yMax = Math.ceil(maxVal * 1.15) || 10;

    // Y Axis Grid
    const ticks = 4;
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px sans-serif';

    for (let t = 0; t <= ticks; t++) {
      const tickVal = Math.round((yMax / ticks) * t);
      const y = plotY + plotH - (t / ticks) * plotH;
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();

      ctx.fillText(tickVal >= 1000 ? `${(tickVal / 1000).toFixed(1)}k` : `${tickVal}`, plotX - 32, y + 4);
    }

    const n = labels.length || 1;
    const slotW = plotW / n;
    const barW = secondaryDs ? Math.min(24, Math.max(8, slotW * 0.32)) : Math.min(38, Math.max(14, slotW * 0.55));

    labels.forEach((lbl, i) => {
      const slotCenterX = plotX + i * slotW + slotW / 2;

      // Bar 1
      const val1 = values1[i] || 0;
      // Minimum height for non-zero values so bars are clearly visible
      const rawBarH1 = (val1 / yMax) * plotH;
      const barH1 = val1 > 0 ? Math.max(4, rawBarH1) : 0;
      const x1 = secondaryDs ? slotCenterX - barW - 2 : slotCenterX - barW / 2;
      const y1 = plotY + plotH - barH1;

      if (val1 > 0) {
        ctx.fillStyle = primaryDs.color || '#F05338';
        ctx.beginPath();
        if (ctx.roundRect && barH1 > 4) {
          ctx.roundRect(x1, y1, barW, barH1, [4, 4, 0, 0]);
        } else {
          ctx.fillRect(x1, y1, barW, barH1);
        }
        ctx.fill();

        // Data value label on top of bar for instant readability
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(val1), x1 + barW / 2, y1 - 4);
      }

      // Bar 2 if any
      if (secondaryDs) {
        const val2 = values2[i] || 0;
        const rawBarH2 = (val2 / yMax) * plotH;
        const barH2 = val2 > 0 ? Math.max(4, rawBarH2) : 0;
        const x2 = slotCenterX + 2;
        const y2 = plotY + plotH - barH2;

        if (val2 > 0) {
          ctx.fillStyle = secondaryDs.color || '#0284C7';
          ctx.beginPath();
          if (ctx.roundRect && barH2 > 4) {
            ctx.roundRect(x2, y2, barW, barH2, [4, 4, 0, 0]);
          } else {
            ctx.fillRect(x2, y2, barW, barH2);
          }
          ctx.fill();

          // Data value label on top of secondary bar
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(val2), x2 + barW / 2, y2 - 4);
        }
      }

      // X Label
      ctx.fillStyle = '#64748B';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      const shortLabel = lbl.length > 10 ? lbl.slice(0, 9) + '…' : lbl;
      ctx.fillText(shortLabel, slotCenterX, plotY + plotH + 20);
      ctx.textAlign = 'left';
    });

    // Legend at Top Right
    const legendX = width - (secondaryDs ? 260 : 160);
    const legendY = 32;

    ctx.fillStyle = primaryDs.color || '#F05338';
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = '#334155';
    ctx.font = '500 12px sans-serif';
    ctx.fillText(primaryDs.label || 'Primary', legendX + 18, legendY + 10);

    if (secondaryDs) {
      ctx.fillStyle = secondaryDs.color || '#0284C7';
      ctx.fillRect(legendX + 100, legendY, 12, 12);
      ctx.fillStyle = '#334155';
      ctx.fillText(secondaryDs.label || 'Secondary', legendX + 118, legendY + 10);
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Common professional Excel Export utility using ExcelJS.
 * 
 * Features:
 * - Sheet 1: Styled Data Table (Banner, Filter block, Colored headers, Wrapped cells, Zebra rows, Total row)
 * - Sheet 2: Visual Charts & Summary (Embedded High-Res Canvas Chart + KPI Cards)
 * - Clean Auto-calculated Column Widths (min 14, max 50)
 */
export async function exportProfessionalExcel({
  filename = 'Analytics_Export',
  sheetName = 'Analytics Data',
  title = 'Analytics Report',
  subtitle = '',
  filters = {}, // e.g. { 'Flipbook': 'test2', 'Date Range': 'Last 7 Days', 'Status': 'All' }
  columns = [], // [{ header: 'Date', key: 'date', width: 16, align: 'left'|'center'|'right', isNumeric: false }]
  data = [],    // [{ date: '18 Nov 2026', views: 120, ... }]
  totals = null, // { date: 'Total', views: 500 } or null
  chartConfig = null, // { type: 'bar'|'line'|'donut', title, subtitle, labels, datasets }
  kpiCards = [] // [{ label: 'Total Views', value: '1,200', note: 'Last 7 days' }]
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FlipiBook';
  workbook.lastModifiedBy = 'FlipiBook Analytics';
  workbook.created = new Date();
  workbook.modified = new Date();

  // -------------------------------------------------------------
  // SHEET 1: DATA TABLE
  // -------------------------------------------------------------
  const ws = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  const totalCols = Math.max(columns.length, 4);

  // 1. Report Title Banner
  ws.mergeCells(1, 1, 1, totalCols);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = title.toUpperCase();
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // Slate 800
  };
  ws.getRow(1).height = 36;

  // 2. Subtitle & Generated Info
  ws.mergeCells(2, 1, 2, totalCols);
  const subCell = ws.getCell(2, 1);
  subCell.value = `${subtitle ? subtitle + '  |  ' : ''}Generated on: ${new Date().toLocaleString()}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' }
  };
  ws.getRow(2).height = 20;

  let curRow = 4;

  // 3. Applied Filters Box (if any)
  const filterEntries = Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '');
  if (filterEntries.length > 0) {
    ws.mergeCells(curRow, 1, curRow, totalCols);
    const filterHeader = ws.getCell(curRow, 1);
    filterHeader.value = 'APPLIED FILTERS & CONTEXT';
    filterHeader.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF475569' } };
    filterHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    filterHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    ws.getRow(curRow).height = 20;
    curRow++;

    // Add filter key-values in pairs
    for (const [k, val] of filterEntries) {
      const r = ws.getRow(curRow);
      r.getCell(1).value = `• ${k}:`;
      r.getCell(1).font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF334155' } };
      r.getCell(2).value = String(val);
      r.getCell(2).font = { name: 'Calibri', size: 9, color: { argb: 'FF0F172A' } };
      r.height = 18;
      curRow++;
    }
    curRow++; // empty spacing row
  }

  // 4. Table Header Row
  const headerRowIdx = curRow;
  const headerRow = ws.getRow(headerRowIdx);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = {
      horizontal: col.align || (col.isNumeric ? 'right' : 'left'),
      vertical: 'middle',
      wrapText: true
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF05338' } // FlipiBook Theme Primary
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FFD43B20' } },
      bottom: { style: 'medium', color: { argb: 'FFD43B20' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  });
  headerRow.height = 26;
  curRow++;

  // 5. Data Rows
  data.forEach((item, rIdx) => {
    const row = ws.getRow(curRow);
    const isEven = rIdx % 2 === 0;

    columns.forEach((col, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      const val = item[col.key] !== undefined ? item[col.key] : '';
      cell.value = val;

      cell.font = {
        name: 'Calibri',
        size: 10,
        color: { argb: 'FF1E293B' },
        bold: col.bold || false
      };
      cell.alignment = {
        horizontal: col.align || (col.isNumeric ? 'right' : 'left'),
        vertical: 'middle',
        wrapText: true
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' }
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFF1F5F9' } },
        right: { style: 'thin', color: { argb: 'FFF1F5F9' } }
      };
    });
    row.height = 22;
    curRow++;
  });

  // 6. Totals Row (if provided)
  if (totals) {
    const totRow = ws.getRow(curRow);
    columns.forEach((col, cIdx) => {
      const cell = totRow.getCell(cIdx + 1);
      cell.value = totals[col.key] !== undefined ? totals[col.key] : '';
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      cell.alignment = {
        horizontal: col.align || (col.isNumeric ? 'right' : 'left'),
        vertical: 'middle',
        wrapText: true
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' }
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'double', color: { argb: 'FF94A3B8' } }
      };
    });
    totRow.height = 24;
    curRow++;
  }

  // 7. Auto Column Widths (min 15, max 45)
  columns.forEach((col, idx) => {
    let maxLen = col.header ? String(col.header).length : 12;
    data.forEach(item => {
      const v = item[col.key];
      if (v !== undefined && v !== null) {
        maxLen = Math.max(maxLen, String(v).length);
      }
    });
    const colWidth = Math.min(Math.max(maxLen + 4, col.width || 14), 45);
    ws.getColumn(idx + 1).width = colWidth;
  });

  // -------------------------------------------------------------
  // SHEET 2: CHARTS & VISUAL SUMMARY
  // -------------------------------------------------------------
  const wsCharts = workbook.addWorksheet('Visual Charts', {
    views: [{ showGridLines: true }]
  });

  // Chart Sheet Banner
  wsCharts.mergeCells('B2:K2');
  const chartTitleCell = wsCharts.getCell('B2');
  chartTitleCell.value = `${title} — Visual Overview`.toUpperCase();
  chartTitleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  chartTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  chartTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF05338' }
  };
  wsCharts.getRow(2).height = 30;

  // KPI Metric Cards row (if provided)
  let nextChartRow = 4;
  if (kpiCards && kpiCards.length > 0) {
    let colStart = 2; // Column B
    kpiCards.slice(0, 4).forEach((kpi, kIdx) => {
      const cellVal = wsCharts.getCell(4, colStart);
      const cellLbl = wsCharts.getCell(5, colStart);
      const cellNote = wsCharts.getCell(6, colStart);

      cellVal.value = kpi.value;
      cellVal.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF0F172A' } };
      cellVal.alignment = { horizontal: 'center', vertical: 'middle' };
      cellVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

      cellLbl.value = (kpi.label || '').toUpperCase();
      cellLbl.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF64748B' } };
      cellLbl.alignment = { horizontal: 'center', vertical: 'middle' };
      cellLbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

      cellNote.value = kpi.note || '';
      cellNote.font = { name: 'Calibri', size: 8, italic: true, color: { argb: 'FF94A3B8' } };
      cellNote.alignment = { horizontal: 'center', vertical: 'middle' };
      cellNote.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

      wsCharts.getColumn(colStart).width = 20;
      colStart += 2;
    });

    wsCharts.getRow(4).height = 24;
    wsCharts.getRow(5).height = 18;
    wsCharts.getRow(6).height = 16;
    nextChartRow = 8;
  }

  // Generate & Embed Canvas Chart Image into Sheet 2
  if (chartConfig) {
    try {
      const chartDataUrl = generateChartImage({
        type: chartConfig.type || 'bar',
        title: chartConfig.title || 'Performance Trend',
        subtitle: chartConfig.subtitle || '',
        labels: chartConfig.labels || [],
        datasets: chartConfig.datasets || [],
        width: 1000,
        height: 500,
        pixelRatio: 2.5
      });

      if (chartDataUrl) {
        const base64Content = chartDataUrl.replace(/^data:image\/png;base64,/, '');
        const imageId = workbook.addImage({
          base64: base64Content,
          extension: 'png'
        });

        // Anchor chart cleanly
        wsCharts.addImage(imageId, {
          tl: { col: 1.2, row: nextChartRow },
          ext: { width: 800, height: 400 }
        });
      }
    } catch (chartErr) {
      console.warn('[Excel Export Chart Warning]:', chartErr?.message);
    }
  }

  // Generate binary and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Helper to populate a single worksheet with styled header, banner, filter block, data rows, totals, and column widths.
 */
export function populateWorksheet(ws, {
  sheetTitle = 'Report',
  subtitle = '',
  filters = {},
  columns = [],
  data = [],
  totals = null,
  headerBgColor = 'FFF05338'
}) {
  const totalCols = Math.max(columns.length, 4);

  // 1. Report Title Banner
  ws.mergeCells(1, 1, 1, totalCols);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = sheetTitle.toUpperCase();
  titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // Slate 800
  };
  ws.getRow(1).height = 34;

  // 2. Subtitle & Generated Info
  ws.mergeCells(2, 1, 2, totalCols);
  const subCell = ws.getCell(2, 1);
  subCell.value = `${subtitle ? subtitle + '  |  ' : ''}Exported on: ${new Date().toLocaleString()}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' }
  };
  ws.getRow(2).height = 20;

  let curRow = 4;

  // 3. Applied Filters Box (if any)
  const filterEntries = Object.entries(filters || {}).filter(([_, v]) => v !== undefined && v !== null && v !== '');
  if (filterEntries.length > 0) {
    ws.mergeCells(curRow, 1, curRow, totalCols);
    const filterHeader = ws.getCell(curRow, 1);
    filterHeader.value = 'APPLIED PARAMETERS & METRICS';
    filterHeader.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF475569' } };
    filterHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    filterHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    ws.getRow(curRow).height = 20;
    curRow++;

    for (const [k, val] of filterEntries) {
      const r = ws.getRow(curRow);
      r.getCell(1).value = `• ${k}:`;
      r.getCell(1).font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF334155' } };
      r.getCell(2).value = String(val);
      r.getCell(2).font = { name: 'Calibri', size: 9, color: { argb: 'FF0F172A' } };
      r.height = 18;
      curRow++;
    }
    curRow++; // Spacing
  }

  // 4. Table Header Row
  const headerRow = ws.getRow(curRow);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = {
      horizontal: col.align || (col.isNumeric ? 'right' : 'left'),
      vertical: 'middle',
      wrapText: true
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: headerBgColor }
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  });
  headerRow.height = 25;
  curRow++;

  // 5. Data Rows
  data.forEach((item, rIdx) => {
    const row = ws.getRow(curRow);
    const isEven = rIdx % 2 === 0;

    columns.forEach((col, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      const val = item[col.key] !== undefined ? item[col.key] : '';
      cell.value = val;

      cell.font = {
        name: 'Calibri',
        size: 10,
        color: { argb: 'FF1E293B' },
        bold: col.bold || false
      };
      cell.alignment = {
        horizontal: col.align || (col.isNumeric ? 'right' : 'left'),
        vertical: 'middle',
        wrapText: true
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' }
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFF1F5F9' } },
        right: { style: 'thin', color: { argb: 'FFF1F5F9' } }
      };
    });
    row.height = 21;
    curRow++;
  });

  // 6. Totals Row
  if (totals) {
    const totRow = ws.getRow(curRow);
    columns.forEach((col, cIdx) => {
      const cell = totRow.getCell(cIdx + 1);
      cell.value = totals[col.key] !== undefined ? totals[col.key] : '';
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      cell.alignment = {
        horizontal: col.align || (col.isNumeric ? 'right' : 'left'),
        vertical: 'middle',
        wrapText: true
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' }
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'double', color: { argb: 'FF94A3B8' } }
      };
    });
    totRow.height = 24;
    curRow++;
  }

  // 7. Auto Column Widths
  columns.forEach((col, idx) => {
    let maxLen = col.header ? String(col.header).length : 12;
    data.forEach(item => {
      const v = item[col.key];
      if (v !== undefined && v !== null) {
        maxLen = Math.max(maxLen, String(v).length);
      }
    });
    const colWidth = Math.min(Math.max(maxLen + 4, col.width || 14), 45);
    ws.getColumn(idx + 1).width = colWidth;
  });
}

/**
 * Helper to populate a Visual Charts worksheet with KPI Cards & embedded High-Res Canvas Chart.
 */
export function populateChartWorksheet(ws, workbook, {
  title = 'Visual Chart',
  kpiCards = [],
  chartConfig = null,
  headerBgColor = 'FFF05338'
}) {
  // Chart Sheet Banner
  ws.mergeCells('B2:K2');
  const chartTitleCell = ws.getCell('B2');
  chartTitleCell.value = `${title} — VISUAL OVERVIEW`;
  chartTitleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  chartTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  chartTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: headerBgColor }
  };
  ws.getRow(2).height = 30;

  // KPI Metric Cards row (if provided)
  let nextChartRow = 4;
  if (kpiCards && kpiCards.length > 0) {
    let colStart = 2; // Column B
    kpiCards.slice(0, 5).forEach((kpi) => {
      const cellVal = ws.getCell(4, colStart);
      const cellLbl = ws.getCell(5, colStart);
      const cellNote = ws.getCell(6, colStart);

      cellVal.value = kpi.value;
      cellVal.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FF0F172A' } };
      cellVal.alignment = { horizontal: 'center', vertical: 'middle' };
      cellVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

      cellLbl.value = (kpi.label || '').toUpperCase();
      cellLbl.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF64748B' } };
      cellLbl.alignment = { horizontal: 'center', vertical: 'middle' };
      cellLbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

      cellNote.value = kpi.note || '';
      cellNote.font = { name: 'Calibri', size: 8, italic: true, color: { argb: 'FF94A3B8' } };
      cellNote.alignment = { horizontal: 'center', vertical: 'middle' };
      cellNote.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

      ws.getColumn(colStart).width = 20;
      colStart += 2;
    });

    ws.getRow(4).height = 24;
    ws.getRow(5).height = 18;
    ws.getRow(6).height = 16;
    nextChartRow = 8;
  }

  // Generate & Embed Canvas Chart Image
  if (chartConfig) {
    try {
      const chartDataUrl = generateChartImage({
        type: chartConfig.type || 'bar',
        title: chartConfig.title || 'Performance Trend',
        subtitle: chartConfig.subtitle || '',
        labels: chartConfig.labels || [],
        datasets: chartConfig.datasets || [],
        width: 1000,
        height: 500,
        pixelRatio: 2.5
      });

      if (chartDataUrl) {
        const base64Content = chartDataUrl.replace(/^data:image\/png;base64,/, '');
        const imageId = workbook.addImage({
          base64: base64Content,
          extension: 'png'
        });

        ws.addImage(imageId, {
          tl: { col: 1.2, row: nextChartRow },
          ext: { width: 800, height: 400 }
        });
      }
    } catch (chartErr) {
      console.warn('[Excel Export Chart Warning]:', chartErr?.message);
    }
  }
}

/**
 * Multi-Tab Excel Export:
 * Exports all tabs (Readers, Lead Forms, Devices & Sources, Locations, Downloads)
 * into a single Excel workbook, where EACH tab gets:
 * 1) Its detailed data table worksheet
 * 2) Its dedicated visual chart & KPI worksheet
 */
export async function exportMultiTabAnalyticsExcel({
  filename = 'Flipbook_Full_Analytics',
  tabs = [] // Array of { name, chartSheetName, title, subtitle, filters, columns, data, totals, kpiCards, chartConfig, headerBgColor }
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FlipiBook';
  workbook.lastModifiedBy = 'FlipiBook Analytics';
  workbook.created = new Date();
  workbook.modified = new Date();

  tabs.forEach(tab => {
    // 1. Data Sheet
    const wsData = workbook.addWorksheet(tab.name, {
      views: [{ showGridLines: true }]
    });
    populateWorksheet(wsData, {
      sheetTitle: tab.title || tab.name,
      subtitle: tab.subtitle || '',
      filters: tab.filters || {},
      columns: tab.columns || [],
      data: tab.data || [],
      totals: tab.totals || null,
      headerBgColor: tab.headerBgColor || 'FFF05338'
    });

    // 2. Chart Sheet for this tab
    const chartSheetTitle = tab.chartSheetName || `${tab.name} Chart`;
    const wsChart = workbook.addWorksheet(chartSheetTitle, {
      views: [{ showGridLines: true }]
    });
    populateChartWorksheet(wsChart, workbook, {
      title: tab.title || tab.name,
      kpiCards: tab.kpiCards || [],
      chartConfig: tab.chartConfig || null,
      headerBgColor: tab.headerBgColor || 'FFF05338'
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}


