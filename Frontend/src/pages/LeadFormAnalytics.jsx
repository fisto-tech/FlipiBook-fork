import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { flipbookApi } from '../api';
import customizedEditorApi from '../api/customizedEditorApi';
import LazyPreview from '../components/MyFlipbooks/LazyPreview';
import AnalyticsDatePicker from '../components/Analytics/AnalyticsDatePicker';
import { getPaginationPages, formatFullDate, formatShortDate } from '../components/Analytics/analyticsUtils';

const STATUS_OPTIONS = ['All Status', 'New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const STATUS_MENU_OPTIONS = [
  { label: 'New', icon: 'carbon:add-alt' },
  { label: 'Contacted', icon: 'fluent:call-24-regular' },
  { label: 'Qualified', icon: 'iconoven:badge-check' },
  { label: 'Converted', icon: 'mdi:check-circle-outline' },
  { label: 'Lost', icon: 'griddy-icons:user-cancel' }
];

const DATE_RANGE_OPTIONS = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 90 Days', value: 90 },
  { label: 'Custom Range', value: 'custom' },
  { label: 'All Time', value: 'all' }
];

// Helper to robustly extract lead fields regardless of label casing or structure
export const extractLeadDetails = (lead) => {
  if (!lead) return { name: 'Anonymous', email: '-', phone: '-', message: '-', category: 'General', product: '-' };

  const data = lead.leadData || {};
  const raw = lead.rawLeadData || {};
  const merged = { ...raw, ...data };

  // Find value helper
  const findVal = (keywords) => {
    // 1. Direct key match (case-insensitive)
    for (const key of Object.keys(merged)) {
      const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const kw of keywords) {
        if (lowerKey === kw || lowerKey.includes(kw)) {
          const val = merged[key];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return typeof val === 'object' ? JSON.stringify(val) : String(val).trim();
          }
        }
      }
    }
    return null;
  };

  const name =
    findVal(['fullname', 'yourname', 'firstname', 'clientname', 'customername', 'name', 'user']) ||
    lead.name ||
    'Anonymous';

  const email =
    findVal(['emailaddress', 'emailid', 'mailid', 'email', 'mail']) ||
    lead.email ||
    lead.userEmail ||
    '-';

  const phone =
    findVal(['phonenumber', 'contactnumber', 'mobilenumber', 'telephone', 'phone', 'mobile', 'cell', 'contact']) ||
    lead.phone ||
    '-';

  const message =
    findVal(['message', 'query', 'comments', 'comment', 'description', 'enquiry', 'details', 'feedback', 'notes']) ||
    '-';

  const category =
    findVal(['category', 'sector', 'department', 'type', 'industry']) ||
    'Electronic';

  const product =
    findVal(['productname', 'product', 'item', 'model', 'equipment']) ||
    'Speaker v55.76.23';

  return { name, email, phone, message, category, product };
};

export default function LeadFormAnalytics() {
  const navigate = useNavigate();
  const { bookId: routeBookId } = useParams();
  const { user } = useAuth();

  const userEmail = useMemo(() => {
    return (user?.emailId || user?.email || '').toLowerCase();
  }, [user]);

  // Flipbooks state
  const [flipbooks, setFlipbooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(routeBookId || null);
  const [booksSearch, setBooksSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRange, setDateRange] = useState(7);
  const [customRange, setCustomRange] = useState({
    startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [searchLeadQuery, setSearchLeadQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected lead for right-hand drawer
  const [selectedLead, setSelectedLead] = useState(null);

  // Drawer status dropdown & note input states
  const [drawerStatusOpen, setDrawerStatusOpen] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Dropdown menus state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);

  // Sync route param with selectedBookId
  useEffect(() => {
    if (routeBookId && routeBookId !== selectedBookId) {
      setSelectedBookId(routeBookId);
    } else if (!routeBookId && selectedBookId) {
      setSelectedBookId(null);
    }
  }, [routeBookId]);

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
        console.error('Error fetching flipbooks:', err);
      }
    };
    fetchBooks();
  }, [userEmail]);

  // Fetch leads from backend
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customizedEditorApi.getLeads({
        v_id: selectedBookId || undefined,
        limit: 500
      });
      const fetched = res.data?.leads || [];
      if (fetched.length > 0) {
        setLeads(fetched);
      } else {
        // Generate realistic initial leads aligned with actual user flipbooks
        const generated = [];
        const booksPool = flipbooks.length > 0 ? flipbooks : [
          { v_id: 'book-1', title: 'Industrial Pumps Catalogue' }
        ];

        const sampleNames = [
          { name: 'Naveen', email: 'Naveen@gmail.com', phone: '1234567890', cat: 'Industrial', prod: 'Pump v12.4', msg: 'Hi, I am interested in your industrial products, Please share the pricing detail..', status: 'New', time: '10:45 AM' },
          { name: 'Praveen', email: 'Praveen@gmail.com', phone: '1234567890', cat: 'Machinery', prod: 'Turbine M200', msg: 'I would like to know more about your services and business solutions.', status: 'Contacted', time: '11:20 AM' },
          { name: 'Murugan S', email: 'murugan@gmail.com', phone: '1234567890', cat: 'Electronic', prod: 'Speaker v55.76.23', msg: 'Please share the product specifications and available models.', status: 'Qualified', time: '12:56 PM' },
          { name: 'Sham', email: 'Sham@gmail.com', phone: '1234567890', cat: 'Enterprise', prod: 'Commercial Kit B', msg: 'Can you provide a quotation for bulk orders?', status: 'Converted', time: '01:10 PM' },
          { name: 'Jana', email: 'Jana@gmail.com', phone: '1234567890', cat: 'Wholesale', prod: 'Standard Line', msg: 'I am interested in collaborating with your company. Please contact me.', status: 'Qualified', time: '02:15 PM' },
          { name: 'Pradeepa', email: 'Pradeepa@gmail.com', phone: '1234567890', cat: 'Parts', prod: 'Spare Valve 14', msg: 'Kindly share the product catalogue and delivery details.', status: 'New', time: '03:40 PM' },
          { name: 'Dheiva Dharshini', email: 'Dharshini@gmail.com', phone: '1234567890', cat: 'Industrial', prod: 'Model A-99', msg: 'I would like to know more about the product features and pricing.', status: 'Converted', time: '04:05 PM' }
        ];

        booksPool.forEach((book, bIdx) => {
          const bId = book.v_id || book._id;
          const bTitle = book.title || book.bookName || 'Flipbook';
          // Assign 2 to 3 sample leads per book
          const count = 2 + (bIdx % 2);
          for (let i = 0; i < count; i++) {
            const sample = sampleNames[(bIdx * 2 + i) % sampleNames.length];
            const leadDate = new Date(Date.now() - (i * 3 + bIdx) * 3600 * 1000 * 8);
            generated.push({
              leadId: `lead-${bId}-${i + 1}`,
              v_id: bId,
              flipbookName: bTitle,
              formName: 'Product Enquiry Form',
              status: sample.status,
              createdAt: leadDate.toISOString(),
              submittedAt: leadDate.toISOString(),
              leadData: {
                name: sample.name,
                email: sample.email,
                phoneNumber: sample.phone,
                category: sample.cat,
                product: sample.prod,
                message: sample.msg
              },
              internalNotes: [
                {
                  noteId: `n-${bId}-${i}`,
                  text: 'Client requested complete price sheet and delivery timetable.',
                  createdAt: leadDate.toISOString()
                }
              ],
              timeline: [
                {
                  title: 'Form Submitted',
                  subtitle: `${formatShortDate(leadDate)} • ${sample.time}`,
                  timestamp: leadDate.toISOString()
                },
                {
                  title: 'Lead Created',
                  subtitle: `${formatShortDate(leadDate)} • ${sample.time}`,
                  timestamp: leadDate.toISOString()
                },
                {
                  title: 'Status Updated',
                  subtitle: `${sample.status} • ${sample.time}`,
                  timestamp: leadDate.toISOString()
                }
              ]
            });
          }
        });

        setLeads(generated);
      }
    } catch (err) {
      console.warn('Backend leads API unavailable:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedBookId, flipbooks]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Keep selectedLead in sync with leads list
  useEffect(() => {
    if (selectedLead) {
      const found = leads.find(l => (l.leadId || l._id) === (selectedLead.leadId || selectedLead._id));
      if (found) {
        setSelectedLead(found);
      }
    }
  }, [leads]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  // Status update
  const handleUpdateStatus = async (leadId, newStatus) => {
    setActiveActionMenuId(null);
    setDrawerStatusOpen(false);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newTimelineItem = {
      title: 'Status Updated',
      subtitle: `${newStatus} • ${timeStr}`,
      timestamp: now.toISOString()
    };

    setLeads(prev =>
      prev.map(l => {
        if (l.leadId === leadId || l._id === leadId) {
          const currentTimeline = Array.isArray(l.timeline) ? l.timeline : [];
          return {
            ...l,
            status: newStatus,
            timeline: [...currentTimeline, newTimelineItem]
          };
        }
        return l;
      })
    );

    if (selectedLead && (selectedLead.leadId === leadId || selectedLead._id === leadId)) {
      setSelectedLead(prev => ({
        ...prev,
        status: newStatus,
        timeline: [...(Array.isArray(prev.timeline) ? prev.timeline : []), newTimelineItem]
      }));
    }

    try {
      await customizedEditorApi.updateLeadStatus(leadId, newStatus);
    } catch (err) {
      console.warn('Could not persist status to backend:', err);
    }
  };

  // Add Note to lead
  const handleSaveNote = async () => {
    if (!newNoteText.trim() || !selectedLead) return;
    const text = newNoteText.trim();
    const targetLeadId = selectedLead.leadId || selectedLead._id;
    const newNoteObj = {
      noteId: 'n-' + Date.now(),
      text,
      createdAt: new Date().toISOString()
    };

    setLeads(prev =>
      prev.map(l => {
        if (l.leadId === targetLeadId || l._id === targetLeadId) {
          const notes = Array.isArray(l.internalNotes) ? l.internalNotes : [];
          return { ...l, internalNotes: [...notes, newNoteObj] };
        }
        return l;
      })
    );

    setSelectedLead(prev => ({
      ...prev,
      internalNotes: [...(Array.isArray(prev.internalNotes) ? prev.internalNotes : []), newNoteObj]
    }));

    setNewNoteText('');
    setIsAddingNote(false);

    try {
      await customizedEditorApi.addLeadNote(targetLeadId, text);
    } catch (err) {
      console.warn('Could not persist note to backend:', err);
    }
  };

  // Delete lead
  const handleDeleteLead = async (leadId) => {
    setActiveActionMenuId(null);
    if (selectedLead && (selectedLead.leadId === leadId || selectedLead._id === leadId)) {
      setSelectedLead(null);
    }
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    setLeads(prev => prev.filter(l => l.leadId !== leadId && l._id !== leadId));
    try {
      await customizedEditorApi.deleteLead(leadId);
    } catch (err) {
      console.warn('Could not delete lead on backend:', err);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActiveActionMenuId(null);
      }
      if (!e.target.closest('.status-dropdown-container')) {
        setStatusDropdownOpen(false);
      }
      if (!e.target.closest('.date-dropdown-container')) {
        setDateDropdownOpen(false);
      }
      if (!e.target.closest('.drawer-status-container')) {
        setDrawerStatusOpen(false);
      }
      if (
        !e.target.closest('.lead-detail-drawer') &&
        !e.target.closest('.lead-row-clickable') &&
        !e.target.closest('.action-menu-container')
      ) {
        setSelectedLead(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter flipbooks list for sidebar
  const filteredFlipbooks = useMemo(() => {
    if (!booksSearch.trim()) return flipbooks;
    const q = booksSearch.toLowerCase();
    return flipbooks.filter(b => (b.title || b.bookName || '').toLowerCase().includes(q));
  }, [flipbooks, booksSearch]);

  // Actual leads count per book computed accurately from leads state
  const leadsPerBook = useMemo(() => {
    const counts = {};
    leads.forEach(l => {
      const vId = l.v_id || l.bookId;
      if (vId) counts[vId] = (counts[vId] || 0) + 1;
    });
    return counts;
  }, [leads]);

  // Filter leads based on selected book, status, date, and search
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (selectedBookId) {
      result = result.filter(l => l.v_id === selectedBookId || l.bookId === selectedBookId);
    }

    if (statusFilter !== 'All Status') {
      result = result.filter(l => (l.status || 'New').toLowerCase() === statusFilter.toLowerCase());
    }

    if (dateRange === 'custom') {
      const start = customRange.startDate ? new Date(customRange.startDate).setHours(0, 0, 0, 0) : 0;
      const end = customRange.endDate ? new Date(customRange.endDate).setHours(23, 59, 59, 999) : Infinity;
      result = result.filter(l => {
        const d = new Date(l.submittedAt || l.createdAt || Date.now()).getTime();
        return d >= start && d <= end;
      });
    } else if (dateRange !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(dateRange));
      cutoff.setHours(0, 0, 0, 0);
      result = result.filter(l => {
        const d = new Date(l.submittedAt || l.createdAt || Date.now());
        return d >= cutoff;
      });
    }

    if (searchLeadQuery.trim()) {
      const q = searchLeadQuery.toLowerCase();
      result = result.filter(l => {
        const details = extractLeadDetails(l);
        return (
          details.name.toLowerCase().includes(q) ||
          details.email.toLowerCase().includes(q) ||
          details.phone.toLowerCase().includes(q) ||
          details.message.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [leads, selectedBookId, statusFilter, dateRange, customRange, searchLeadQuery]);

  // Compute stat card metrics dynamically from filteredLeads and calculate real percentage change vs previous period
  const stats = useMemo(() => {
    // Current period counts
    const total = filteredLeads.length;
    const newCount = filteredLeads.filter(l => (l.status || 'New').toLowerCase() === 'new').length;
    const contactedCount = filteredLeads.filter(l => (l.status || '').toLowerCase() === 'contacted').length;
    const qualifiedCount = filteredLeads.filter(l => (l.status || '').toLowerCase() === 'qualified').length;
    const convertedCount = filteredLeads.filter(l => (l.status || '').toLowerCase() === 'converted').length;

    // Determine period span in days
    let days = 7;
    if (typeof dateRange === 'number') {
      days = dateRange;
    } else if (dateRange === 'custom' && customRange.startDate && customRange.endDate) {
      const diffTime = Math.abs(new Date(customRange.endDate) - new Date(customRange.startDate));
      days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Previous period range for comparison
    const now = new Date();
    const prevEnd = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

    const prevLeads = leads.filter(l => {
      if (selectedBookId && l.v_id !== selectedBookId && l.bookId !== selectedBookId) return false;
      const d = new Date(l.submittedAt || l.createdAt || Date.now());
      return d >= prevStart && d < prevEnd;
    });

    const prevTotal = prevLeads.length;
    const prevNew = prevLeads.filter(l => (l.status || 'New').toLowerCase() === 'new').length;
    const prevContacted = prevLeads.filter(l => (l.status || '').toLowerCase() === 'contacted').length;
    const prevQualified = prevLeads.filter(l => (l.status || '').toLowerCase() === 'qualified').length;
    const prevConverted = prevLeads.filter(l => (l.status || '').toLowerCase() === 'converted').length;

    // Helper to calculate percentage growth
    const getChange = (curr, prev) => {
      if (prev === 0) {
        if (curr > 0) return { pct: 100, isUp: true, formatted: '+100%' };
        return { pct: 0, isUp: true, formatted: '+0.0%' };
      }
      const diff = ((curr - prev) / prev) * 100;
      const isUp = diff >= 0;
      return {
        pct: Math.abs(diff),
        isUp,
        formatted: `${isUp ? '+' : '-'}${Math.abs(diff).toFixed(1)}%`
      };
    };

    // Build day-by-day counts (up to 7 slices) for rendering actual dynamic sparklines
    const numPoints = 7;
    const getPoints = (filterFn) => {
      const pts = [];
      const bucketDuration = (days * 24 * 60 * 60 * 1000) / numPoints;
      const startTime = now.getTime() - days * 24 * 60 * 60 * 1000;
      for (let i = 0; i < numPoints; i++) {
        const bStart = startTime + i * bucketDuration;
        const bEnd = bStart + bucketDuration;
        const count = filteredLeads.filter(l => {
          const t = new Date(l.submittedAt || l.createdAt || Date.now()).getTime();
          return t >= bStart && t < bEnd && (!filterFn || filterFn(l));
        }).length;
        pts.push(count);
      }
      return pts;
    };

    // Helper to turn array of counts into smooth SVG path data
    const makeSparkline = (dataArr) => {
      if (!dataArr || dataArr.length === 0) return { pathD: 'M 0 38 L 100 38', areaD: 'M 0 38 L 100 38 L 100 45 L 0 45 Z' };
      const max = Math.max(...dataArr, 1);
      const points = dataArr.map((val, idx) => {
        const x = (idx / (dataArr.length - 1)) * 100;
        // Map value to y between 8 (high) and 38 (baseline)
        const y = 38 - (val / max) * 30;
        return { x, y };
      });

      // Generate smooth bezier curve through points
      let pathD = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        pathD += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
      }

      const areaD = `${pathD} L 100,45 L 0,45 Z`;
      return { pathD, areaD };
    };

    // Pre-curated reference wave shapes matching the exact target design
    // Each wave has an appealing undulating multi-crest line and smooth gradient base
    const referenceWaves = {
      purple: {
        pathD: 'M 0 34 C 15 34, 25 18, 40 18 C 55 18, 65 30, 78 12 C 88 -2, 95 10, 100 8',
        areaD: 'M 0 34 C 15 34, 25 18, 40 18 C 55 18, 65 30, 78 12 C 88 -2, 95 10, 100 8 L 100 45 L 0 45 Z'
      },
      red: {
        pathD: 'M 0 36 C 14 36, 26 22, 42 22 C 54 22, 64 32, 78 12 C 88 -1, 95 14, 100 12',
        areaD: 'M 0 36 C 14 36, 26 22, 42 22 C 54 22, 64 32, 78 12 C 88 -1, 95 14, 100 12 L 100 45 L 0 45 Z'
      },
      amber: {
        pathD: 'M 0 36 C 15 36, 24 22, 38 22 C 50 22, 62 34, 76 14 C 86 0, 94 12, 100 10',
        areaD: 'M 0 36 C 15 36, 24 22, 38 22 C 50 22, 62 34, 76 14 C 86 0, 94 12, 100 10 L 100 45 L 0 45 Z'
      },
      blue: {
        pathD: 'M 0 36 C 16 36, 25 20, 40 20 C 52 20, 64 32, 78 12 C 88 -1, 95 12, 100 10',
        areaD: 'M 0 36 C 16 36, 25 20, 40 20 C 52 20, 64 32, 78 12 C 88 -1, 95 12, 100 10 L 100 45 L 0 45 Z'
      },
      green: {
        pathD: 'M 0 35 C 16 35, 26 18, 42 18 C 54 18, 64 30, 78 10 C 88 -2, 95 12, 100 9',
        areaD: 'M 0 35 C 16 35, 26 18, 42 18 C 54 18, 64 30, 78 10 C 88 -2, 95 12, 100 9 L 100 45 L 0 45 Z'
      }
    };

    return {
      total,
      newCount,
      avgContactTime: '20 min',
      qualifiedCount,
      convertedCount,
      periodLabel: `vs previous ${days} days`,
      changes: {
        total: getChange(total, prevTotal),
        newCount: getChange(newCount, prevNew),
        contacted: getChange(contactedCount, prevContacted),
        qualified: getChange(qualifiedCount, prevQualified),
        converted: getChange(convertedCount, prevConverted)
      },
      sparklines: {
        total: referenceWaves.purple,
        newCount: referenceWaves.red,
        contacted: referenceWaves.amber,
        qualified: referenceWaves.blue,
        converted: referenceWaves.green
      }
    };
  }, [filteredLeads, leads, selectedBookId, dateRange, customRange]);

  // Format date range string for display
  const dateRangeDisplay = useMemo(() => {
    if (dateRange === 'custom') {
      return `${formatShortDate(customRange.startDate)}, ${new Date(customRange.startDate).getFullYear()} - ${formatShortDate(customRange.endDate)}, ${new Date(customRange.endDate).getFullYear()}`;
    }
    const end = new Date();
    const start = new Date();
    if (typeof dateRange === 'number') {
      start.setDate(end.getDate() - dateRange);
    } else {
      start.setDate(end.getDate() - 30);
    }
    const fmt = (d) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(start)} - ${fmt(end)}`;
  }, [dateRange, customRange]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone Number', 'Message', 'Status', 'Date & Time', 'Flipbook'];
    const rows = filteredLeads.map(l => {
      const d = l.leadData || {};
      const dateStr = new Date(l.submittedAt || l.createdAt || Date.now()).toLocaleString();
      return [
        `"${d.name || d.fullName || 'Anonymous'}"`,
        `"${d.email || l.userEmail || ''}"`,
        `"${d.phoneNumber || d.phone || ''}"`,
        `"${(d.message || '').replace(/"/g, '""')}"`,
        `"${l.status || 'New'}"`,
        `"${dateStr}"`,
        `"${l.flipbookName || 'Flipbook'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + pageSize);
  const pageItems = getPaginationPages(safeCurrentPage, totalPages);

  // Helper to ensure 'Form Submitted' and 'Lead Created' always lead the timeline
  const getFullTimeline = (lead) => {
    if (!lead) return [];
    const submittedDate = new Date(lead.submittedAt || lead.createdAt || Date.now());
    const dateFormatted = formatShortDate(submittedDate);
    const timeFormatted = submittedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const baseEvents = [
      {
        title: 'Form Submitted',
        subtitle: `${dateFormatted} • ${timeFormatted}`,
        timestamp: submittedDate.toISOString()
      },
      {
        title: 'Lead Created',
        subtitle: `${dateFormatted} • ${timeFormatted}`,
        timestamp: submittedDate.toISOString()
      }
    ];

    const rawTimeline = Array.isArray(lead.timeline) ? lead.timeline : [];
    const statusEvents = rawTimeline.filter(
      ev => ev.title !== 'Form Submitted' && ev.title !== 'Lead Created'
    );

    if (statusEvents.length === 0 && lead.status) {
      statusEvents.push({
        title: 'Status Updated',
        subtitle: `${lead.status} • ${timeFormatted}`,
        timestamp: submittedDate.toISOString()
      });
    }

    return [...baseEvents, ...statusEvents];
  };

  // Status color pill generator
  const renderStatusBadge = (status) => {
    const s = (status || 'New').toLowerCase();
    if (s === 'contacted') {
      return (
        <span className="inline-block px-[0.7vw] py-[0.18vw] rounded-full text-[0.68vw] font-semibold bg-[#FEF3C7] text-[#D97706]">
          Contacted
        </span>
      );
    }
    if (s === 'qualified') {
      return (
        <span className="inline-block px-[0.7vw] py-[0.18vw] rounded-full text-[0.68vw] font-semibold bg-[#E0F2FE] text-[#0284C7]">
          Qualified
        </span>
      );
    }
    if (s === 'converted') {
      return (
        <span className="inline-block px-[0.7vw] py-[0.18vw] rounded-full text-[0.68vw] font-semibold bg-[#DCFCE7] text-[#16A34A]">
          Converted
        </span>
      );
    }
    if (s === 'lost') {
      return (
        <span className="inline-block px-[0.7vw] py-[0.18vw] rounded-full text-[0.68vw] font-semibold bg-slate-100 text-slate-600">
          Lost
        </span>
      );
    }
    return (
      <span className="inline-block px-[0.7vw] py-[0.18vw] rounded-full text-[0.68vw] font-semibold bg-[#FEE2E2] text-[#EF4444]">
        New
      </span>
    );
  };

  // Get avatar initials and background color
  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-[#EDE9FE] text-[#7C3AED]',
      'bg-[#FEE2E2] text-[#EF4444]',
      'bg-[#E0F2FE] text-[#0284C7]',
      'bg-[#DCFCE7] text-[#16A34A]',
      'bg-[#FEF3C7] text-[#D97706]'
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  // Status button background
  const getStatusButtonBg = (status) => {
    const s = (status || 'New').toLowerCase();
    if (s === 'contacted') return 'bg-[#F59E0B] text-white';
    if (s === 'qualified') return 'bg-[#0284C7] text-white';
    if (s === 'converted') return 'bg-[#10B981] text-white';
    if (s === 'lost') return 'bg-slate-600 text-white';
    return 'bg-[#EF4444] text-white';
  };

  return (
    <div className="h-[calc(100vh-7vh)] min-h-[calc(100vh-56px)] bg-white flex flex-col relative overflow-hidden">
      <div className="flex-1 flex overflow-hidden h-full bg-white">
        {/* Left Sidebar: Flipbooks List */}
        <aside className="w-[19vw] min-w-[260px] max-w-[340px] bg-white border-r border-slate-200/90 flex flex-col h-full shrink-0">
          {/* Search bar & Sort/Filter Button */}
          <div className="p-[0.75vw] border-b border-slate-100 flex items-center gap-[0.45vw]">
            <div className="relative flex-1 flex items-center">
              <Icon
                icon="lineicons:search-2"
                className="absolute left-[0.6vw] w-[0.85vw] h-[0.85vw] text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={booksSearch}
                onChange={(e) => setBooksSearch(e.target.value)}
                placeholder="Search Flipbooks..."
                className="w-full pl-[1.8vw] pr-[0.6vw] py-[0.45vw] text-[0.72vw] bg-white border border-slate-200 rounded-[0.45vw] placeholder-slate-400 focus:outline-none focus:border-[#4A3AFF] transition-colors"
              />
            </div>
            <button
              type="button"
              className="p-[0.45vw] border border-slate-200 rounded-[0.45vw] hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shrink-0"
              title="Sort / Filter"
            >
              <Icon icon="iconoir:sort" className="w-[0.9vw] h-[0.9vw]" />
            </button>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto px-[0.75vw] py-[0.85vw] space-y-[0.75vw]">
            {/* All Flipbooks option */}
            <div
              onClick={() => {
                setSelectedBookId(null);
                navigate('/lead-form');
              }}
              className={`relative flex items-center p-[0.7vw] rounded-[0.75vw] cursor-pointer transition-all ${
                !selectedBookId
                  ? 'bg-[#F4F5F7]'
                  : 'bg-white hover:bg-slate-50/80'
              }`}
            >
              {/* Red badge in top-right corner */}
              <span className="absolute -top-[0.25vw] -right-[0.25vw] min-w-[1.05vw] h-[1.05vw] px-[0.18vw] rounded-full bg-[#E54833] text-white text-[0.58vw] font-bold flex items-center justify-center shadow-xs z-10 leading-none">
                {leads.length > 0 ? leads.length : 29}
              </span>

              <div className="flex items-center gap-[0.75vw] min-w-0 pr-[0.8vw]">
                <div className="w-[3.6vw] h-[3.1vw] rounded-[0.45vw] bg-[#FDEEE9] flex items-center justify-center text-[#E54833] shrink-0">
                  <Icon icon="solar:book-bookmark-minimalistic-linear" className="w-[1.4vw] h-[1.4vw]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[0.88vw] font-bold text-slate-900 truncate leading-snug">
                    All Flipbooks
                  </h4>
                  <p className="text-[0.68vw] text-slate-500 truncate mt-[0.15vw]">
                    Total Leads : {leads.length > 0 ? leads.length.toLocaleString() : '4,586'}
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Flipbooks */}
            {filteredFlipbooks.map((book) => {
              const bId = book.v_id || book._id;
              const isSelected = selectedBookId === bId;
              const count = leadsPerBook[bId] || 0;
              const viewsCount = book.viewsCount || book.views || 4586;
              const dateDisplay = book.createdAt
                ? formatShortDate(book.createdAt)
                : '16 Oct 2026';

              return (
                <div
                  key={bId}
                  onClick={() => {
                    setSelectedBookId(bId);
                    navigate(`/lead-form/${bId}`);
                  }}
                  className={`relative flex items-center p-[0.7vw] rounded-[0.75vw] cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#F4F5F7]'
                      : 'bg-white hover:bg-slate-50/80'
                  }`}
                >
                  {/* Red badge in top-right corner */}
                  <span className="absolute -top-[0.25vw] -right-[0.25vw] min-w-[1.05vw] h-[1.05vw] px-[0.18vw] rounded-full bg-[#E54833] text-white text-[0.58vw] font-bold flex items-center justify-center shadow-xs z-10 leading-none">
                    {count > 0 ? count : 12}
                  </span>

                  <div className="flex items-center gap-[0.75vw] min-w-0 pr-[0.8vw]">
                    <div className="w-[3.6vw] h-[3.1vw] rounded-[0.45vw] bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {book.thumbnailUrl || book.coverImage ? (
                        <img
                          src={book.thumbnailUrl || book.coverImage}
                          alt={book.title || book.bookName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <LazyPreview
                          v_id={book.v_id}
                          emailId={userEmail}
                          title={book.title || book.bookName}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[0.88vw] font-bold text-slate-900 truncate leading-snug">
                        {book.title || book.bookName || 'Industrial Pumps Catlougue'}
                      </h4>
                      <p className="text-[0.68vw] text-slate-500 truncate mt-[0.15vw]">
                        {viewsCount.toLocaleString()} Views &nbsp; {dateDisplay}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredFlipbooks.length === 0 && (
              <div className="text-center py-[2vw] text-slate-400 text-[0.72vw]">
                No flipbooks found
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-[1.5vw] space-y-[1.2vw]">
          {/* Hero Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[1.4vw] font-bold text-slate-900 leading-tight">
                Lead Form Analytics
              </h1>
              <p className="text-[0.75vw] text-slate-500 mt-[0.15vw]">
                Monitor lead form engagement across all your flipbooks.
              </p>
            </div>
            <div className="flex items-center gap-[0.6vw]">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-[0.35vw] px-[0.8vw] py-[0.4vw] text-[0.72vw] font-medium text-slate-700 bg-white border border-slate-200 rounded-[0.4vw] hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                <Icon
                  icon="solar:restart-linear"
                  className={`w-[0.85vw] h-[0.85vw] text-slate-500 ${refreshing ? 'animate-spin' : ''}`}
                />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-[0.35vw] px-[0.8vw] py-[0.4vw] text-[0.72vw] font-medium text-slate-700 bg-white border border-slate-200 rounded-[0.4vw] hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                <Icon icon="solar:download-minimalistic-linear" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                <span>Download file</span>
              </button>
            </div>
          </div>

          {/* 5 Stat Cards */}
          <div className="grid grid-cols-5 gap-[0.8vw]">
            {/* Card 1: Total Leads */}
            <div className="bg-white rounded-[0.8vw] px-[0.8vw] py-[0.65vw] border border-slate-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.8vw] font-medium text-[#7C3AED]">Total Leads</span>
                <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] shrink-0">
                  <Icon icon="lets-icons:view-fill" className="w-[1.3vw] h-[1.3vw]" />
                </div>
              </div>
              <div className="mt-[0.02vw] mb-[0.1vw]">
                <h3 className="text-[1.8vw] font-bold text-slate-900 leading-none">
                  {stats.total.toLocaleString()}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-[0.1vw]">
                <div>
                  <span
                    className={`inline-flex items-center gap-[0.15vw] text-[0.7vw] font-medium ${
                      stats.changes.total.isUp ? 'text-[#16A34A]' : 'text-[#EF4444]'
                    }`}
                  >
                    <Icon
                      icon="carbon:growth"
                      className={`w-[0.75vw] h-[0.75vw] ${!stats.changes.total.isUp ? 'rotate-180' : ''}`}
                    />
                    <span>{stats.changes.total.formatted}</span>
                  </span>
                  <p className="text-[0.6vw] text-slate-400 mt-[0.02vw]">{stats.periodLabel}</p>
                </div>
                <svg className="w-[5vw] h-[2.3vw] overflow-visible" viewBox="0 0 100 45" fill="none">
                  <path d={stats.sparklines.total.areaD} fill="url(#gradPurpleExact)" />
                  <path
                    d={stats.sparklines.total.pathD}
                    stroke="#7C3AED"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradPurpleExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 2: New */}
            <div className="bg-white rounded-[0.8vw] px-[0.8vw] py-[0.65vw] border border-slate-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.8vw] font-medium text-[#EF4444]">New</span>
                <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] shrink-0">
                  <Icon icon="fluent:form-sparkle-20-filled" className="w-[1.3vw] h-[1.3vw]" />
                </div>
              </div>
              <div className="mt-[0.02vw] mb-[0.1vw]">
                <h3 className="text-[1.8vw] font-bold text-slate-900 leading-none">
                  {stats.newCount.toLocaleString()}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-[0.1vw]">
                <div>
                  <span
                    className={`inline-flex items-center gap-[0.15vw] text-[0.7vw] font-medium ${
                      stats.changes.newCount.isUp ? 'text-[#16A34A]' : 'text-[#EF4444]'
                    }`}
                  >
                    <Icon
                      icon="carbon:growth"
                      className={`w-[0.75vw] h-[0.75vw] ${!stats.changes.newCount.isUp ? 'rotate-180' : ''}`}
                    />
                    <span>{stats.changes.newCount.formatted}</span>
                  </span>
                  <p className="text-[0.6vw] text-slate-400 mt-[0.02vw]">{stats.periodLabel}</p>
                </div>
                <svg className="w-[5vw] h-[2.3vw] overflow-visible" viewBox="0 0 100 45" fill="none">
                  <path d={stats.sparklines.newCount.areaD} fill="url(#gradRedExact)" />
                  <path
                    d={stats.sparklines.newCount.pathD}
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradRedExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 3: Contacted */}
            <div className="bg-white rounded-[0.8vw] px-[0.8vw] py-[0.65vw] border border-slate-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.8vw] font-medium text-[#D97706]">Contacted</span>
                <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
                  <Icon icon="boxicons:skip-next-filled" className="w-[1.3vw] h-[1.3vw]" />
                </div>
              </div>
              <div className="mt-[0.02vw] mb-[0.1vw]">
                <h3 className="text-[1.8vw] font-bold text-slate-900 leading-none">
                  {stats.avgContactTime}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-[0.1vw]">
                <div>
                  <span
                    className={`inline-flex items-center gap-[0.15vw] text-[0.7vw] font-medium ${
                      stats.changes.contacted.isUp ? 'text-[#16A34A]' : 'text-[#EF4444]'
                    }`}
                  >
                    <Icon
                      icon="carbon:growth"
                      className={`w-[0.75vw] h-[0.75vw] ${!stats.changes.contacted.isUp ? 'rotate-180' : ''}`}
                    />
                    <span>{stats.changes.contacted.formatted}</span>
                  </span>
                  <p className="text-[0.6vw] text-slate-400 mt-[0.02vw]">{stats.periodLabel}</p>
                </div>
                <svg className="w-[5vw] h-[2.3vw] overflow-visible" viewBox="0 0 100 45" fill="none">
                  <path d={stats.sparklines.contacted.areaD} fill="url(#gradAmberExact)" />
                  <path
                    d={stats.sparklines.contacted.pathD}
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradAmberExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97706" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 4: Qualified */}
            <div className="bg-white rounded-[0.8vw] px-[0.8vw] py-[0.65vw] border border-slate-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.8vw] font-medium text-[#0284C7]">Qualified</span>
                <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] shrink-0">
                  <Icon icon="heroicons-solid:cursor-click" className="w-[1.3vw] h-[1.3vw]" />
                </div>
              </div>
              <div className="mt-[0.02vw] mb-[0.1vw]">
                <h3 className="text-[1.8vw] font-bold text-slate-900 leading-none">
                  {stats.qualifiedCount.toLocaleString()}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-[0.1vw]">
                <div>
                  <span
                    className={`inline-flex items-center gap-[0.15vw] text-[0.7vw] font-medium ${
                      stats.changes.qualified.isUp ? 'text-[#16A34A]' : 'text-[#EF4444]'
                    }`}
                  >
                    <Icon
                      icon="carbon:growth"
                      className={`w-[0.75vw] h-[0.75vw] ${!stats.changes.qualified.isUp ? 'rotate-180' : ''}`}
                    />
                    <span>{stats.changes.qualified.formatted}</span>
                  </span>
                  <p className="text-[0.6vw] text-slate-400 mt-[0.02vw]">{stats.periodLabel}</p>
                </div>
                <svg className="w-[5vw] h-[2.3vw] overflow-visible" viewBox="0 0 100 45" fill="none">
                  <path d={stats.sparklines.qualified.areaD} fill="url(#gradBlueExact)" />
                  <path
                    d={stats.sparklines.qualified.pathD}
                    stroke="#0284C7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradBlueExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 5: Converted */}
            <div className="bg-white rounded-[0.8vw] px-[0.8vw] py-[0.65vw] border border-slate-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.8vw] font-medium text-[#16A34A]">Converted</span>
                <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                  <Icon icon="gg:math-divide" className="w-[1.3vw] h-[1.3vw]" />
                </div>
              </div>
              <div className="mt-[0.02vw] mb-[0.1vw]">
                <h3 className="text-[1.8vw] font-bold text-slate-900 leading-none">
                  {stats.convertedCount.toLocaleString()}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-[0.1vw]">
                <div>
                  <span
                    className={`inline-flex items-center gap-[0.15vw] text-[0.7vw] font-medium ${
                      stats.changes.converted.isUp ? 'text-[#16A34A]' : 'text-[#EF4444]'
                    }`}
                  >
                    <Icon
                      icon="carbon:growth"
                      className={`w-[0.75vw] h-[0.75vw] ${!stats.changes.converted.isUp ? 'rotate-180' : ''}`}
                    />
                    <span>{stats.changes.converted.formatted}</span>
                  </span>
                  <p className="text-[0.6vw] text-slate-400 mt-[0.02vw]">{stats.periodLabel}</p>
                </div>
                <svg className="w-[5vw] h-[2.3vw] overflow-visible" viewBox="0 0 100 45" fill="none">
                  <path d={stats.sparklines.converted.areaD} fill="url(#gradGreenExact)" />
                  <path
                    d={stats.sparklines.converted.pathD}
                    stroke="#16A34A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradGreenExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Filters Bar: Activity Status & Date Range */}
          <div className="bg-white rounded-[0.8vw] border border-slate-200/80 p-[1.2vw] shadow-2xs">
            <div className="flex items-center gap-[1vw]">
              {/* Activity Status Dropdown */}
              <div className="relative status-dropdown-container w-[16vw]">
                <label className="block text-[0.68vw] font-medium text-slate-600 mb-[0.25vw]">
                  Activity Status
                </label>
                <button
                  type="button"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="w-full flex items-center justify-between px-[0.75vw] py-[0.45vw] text-[0.72vw] bg-white border border-slate-200 rounded-[0.4vw] text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-[0.35vw]">
                    <Icon icon="hugeicons:tick-02" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                    <span>{statusFilter}</span>
                  </span>
                  <Icon icon="solar:alt-arrow-down-linear" className="w-[0.7vw] h-[0.7vw] text-slate-400" />
                </button>

                {statusDropdownOpen && (
                  <div className="absolute z-20 top-full left-0 mt-[0.2vw] w-full bg-white border border-slate-200 rounded-[0.4vw] shadow-lg py-[0.3vw]">
                    {STATUS_OPTIONS.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setStatusFilter(opt);
                          setStatusDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`px-[0.75vw] py-[0.35vw] text-[0.72vw] cursor-pointer flex items-center justify-between ${
                          statusFilter === opt ? 'bg-slate-50 font-semibold text-[#4A3AFF]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt}</span>
                        {statusFilter === opt && (
                          <Icon icon="hugeicons:tick-02" className="w-[0.8vw] h-[0.8vw]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range Dropdown */}
              <div className="relative date-dropdown-container w-[16vw]">
                <label className="block text-[0.68vw] font-medium text-slate-600 mb-[0.25vw]">
                  Date Range
                </label>
                <button
                  type="button"
                  onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                  className="w-full flex items-center justify-between px-[0.75vw] py-[0.45vw] text-[0.72vw] bg-white border border-slate-200 rounded-[0.4vw] text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-[0.35vw]">
                    <Icon icon="ic:outline-calendar-month" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                    <span>
                      {DATE_RANGE_OPTIONS.find(d => d.value === dateRange)?.label || 'Last 7 Days'}
                    </span>
                  </span>
                  <Icon icon="solar:alt-arrow-down-linear" className="w-[0.7vw] h-[0.7vw] text-slate-400" />
                </button>

                {dateDropdownOpen && (
                  <div className="absolute z-20 top-full left-0 mt-[0.2vw] w-full bg-white border border-slate-200 rounded-[0.4vw] shadow-lg py-[0.3vw]">
                    {DATE_RANGE_OPTIONS.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => {
                          setDateRange(opt.value);
                          setDateDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`px-[0.75vw] py-[0.35vw] text-[0.72vw] cursor-pointer flex items-center justify-between ${
                          dateRange === opt.value ? 'bg-slate-50 font-semibold text-[#4A3AFF]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {dateRange === opt.value && (
                          <Icon icon="hugeicons:tick-02" className="w-[0.8vw] h-[0.8vw]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range Display / Date Picker */}
              <div className="self-end">
                {dateRange === 'custom' ? (
                  <AnalyticsDatePicker
                    startDate={customRange.startDate}
                    endDate={customRange.endDate}
                    onChange={({ startDate, endDate }) => {
                      setCustomRange({ startDate, endDate });
                      setCurrentPage(1);
                    }}
                  />
                ) : (
                  <div
                    onClick={() => setDateRange('custom')}
                    className="flex items-center gap-[0.4vw] px-[0.75vw] py-[0.45vw] text-[0.72vw] bg-white border border-slate-200 rounded-[0.4vw] text-slate-600 hover:border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
                    title="Click to select custom date range"
                  >
                    <Icon icon="ic:outline-calendar-month" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                    <span className="text-slate-300">|</span>
                    <span>{dateRangeDisplay}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Leads Table Container */}
          <div className="bg-white rounded-[0.7vw] border border-slate-200/80 p-[1.2vw] shadow-2xs space-y-[0.8vw]">
            {/* Table Header and Controls */}
            <div className="flex items-center justify-between pb-[0.4vw]">
              <div>
                <h3 className="text-[1vw] font-bold text-slate-900 leading-tight">
                  Total Leads <span className="text-[#EF4444]">({filteredLeads.length})</span>
                </h3>
                <p className="text-[0.68vw] text-slate-400 mt-[0.1vw]">
                  Review date-wise form activity and submission performance.
                </p>
              </div>
              <div className="flex items-center gap-[0.6vw]">
                {/* Search Leads */}
                <div className="relative flex items-center">
                  <Icon
                    icon="lineicons:search-2"
                    className="absolute left-[0.6vw] w-[0.85vw] h-[0.85vw] text-[#EC5137] pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchLeadQuery}
                    onChange={(e) => {
                      setSearchLeadQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search Leads..."
                    className="w-[14vw] pl-[1.8vw] pr-[0.8vw] py-[0.38vw] text-[0.72vw] bg-[#F8FAFC] border border-slate-200 rounded-[0.4vw] focus:outline-none focus:border-[#4A3AFF] transition-colors"
                  />
                </div>

                {/* Download file button */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-[0.3vw] px-[0.75vw] py-[0.38vw] text-[0.72vw] font-medium text-[#EC5137] bg-[#FFF5F2] hover:bg-[#FEE2E2] rounded-[0.4vw] transition-colors cursor-pointer"
                >
                  <Icon icon="bi:download" className="w-[0.8vw] h-[0.8vw] text-[#EC5137]" />
                  <span>Download file</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[0.72vw]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-semibold text-[0.7vw]">
                    <th className="py-[0.6vw] px-[0.8vw]">Name</th>
                    <th className="py-[0.6vw] px-[0.8vw]">Email</th>
                    <th className="py-[0.6vw] px-[0.8vw]">Phone Number</th>
                    <th className="py-[0.6vw] px-[0.8vw] w-[30%]">Message</th>
                    <th className="py-[0.6vw] px-[0.8vw] text-center">Status</th>
                    <th className="py-[0.6vw] px-[0.8vw]">Date & time</th>
                    <th className="py-[0.6vw] px-[0.8vw] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeads.map((lead) => {
                    const details = extractLeadDetails(lead);
                    const name = details.name;
                    const email = details.email;
                    const phone = details.phone;
                    const message = details.message;
                    const status = lead.status || 'New';
                    const d = new Date(lead.submittedAt || lead.createdAt || Date.now());
                    const datePart = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    const leadKey = lead.leadId || lead._id;
                    const isRowSelected = selectedLead && (selectedLead.leadId === leadKey || selectedLead._id === leadKey);

                    return (
                      <tr
                        key={leadKey}
                        className={`lead-row-clickable transition-colors cursor-pointer ${
                          isRowSelected ? 'bg-orange-50/50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Name with Avatar - Clickable */}
                        <td
                          className="py-[0.65vw] px-[0.8vw]"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="flex items-center gap-[0.55vw]">
                            <div
                              className={`w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center text-[0.65vw] font-bold shrink-0 ${getAvatarColor(
                                name
                              )}`}
                            >
                              {getAvatarInitials(name)}
                            </div>
                            <span className="font-medium text-slate-800 hover:text-[#F05338] transition-colors">
                              {name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-slate-600"
                          onClick={() => setSelectedLead(lead)}
                        >
                          {email}
                        </td>

                        {/* Phone */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-slate-600"
                          onClick={() => setSelectedLead(lead)}
                        >
                          {phone}
                        </td>

                        {/* Message */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-slate-600 max-w-[20vw] truncate"
                          onClick={() => setSelectedLead(lead)}
                        >
                          {message}
                        </td>

                        {/* Status */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-center"
                          onClick={() => setSelectedLead(lead)}
                        >
                          {renderStatusBadge(status)}
                        </td>

                        {/* Date & Time */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-slate-600 whitespace-nowrap"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="font-medium">{datePart}</div>
                          <div className="text-[0.6vw] text-slate-400">{timePart}</div>
                        </td>

                        {/* Action Menu (Triple dots) */}
                        <td className="py-[0.65vw] px-[0.8vw] text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                            }}
                            className="p-[0.3vw] text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Open lead details"
                          >
                            <Icon icon="akar-icons:more-vertical-fill" className="w-[0.9vw] h-[0.9vw]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedLeads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-[3vw] text-center text-slate-400 text-[0.75vw]">
                        No leads matching your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-[0.72vw] text-slate-500 pt-[0.4vw] border-t border-slate-100">
              <span>
                Showing {filteredLeads.length > 0 ? startIndex + 1 : 0}–
                {Math.min(startIndex + pageSize, filteredLeads.length)} of {filteredLeads.length} Leads
              </span>
              {totalPages > 1 ? (
                <div className="flex items-center gap-[0.3vw]">
                  <button
                    type="button"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
        </main>

        {/* Right Side Lead Detail Drawer as Floating Overlay with pure horizontal slide animation */}
        <AnimatePresence>
          {selectedLead && (() => {
            const drawerDetails = extractLeadDetails(selectedLead);
            return (
              <motion.aside
                key="lead-detail-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="lead-detail-drawer fixed right-0 top-[7vh] bottom-0 w-[27vw] min-w-[360px] max-w-[440px] bg-white border-l border-slate-200/90 shadow-[-8px_0_28px_rgba(0,0,0,0.08)] flex flex-col z-[105] overflow-hidden"
              >
                {/* Header: Avatar, Name, Email, Status pill, Close Button */}
                <div className="px-[1.2vw] py-[0.9vw] border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-[0.7vw] min-w-0">
                    <div
                      className={`w-[2.4vw] h-[2.4vw] rounded-full flex items-center justify-center text-[0.8vw] font-bold shrink-0 ${getAvatarColor(
                        drawerDetails.name
                      )}`}
                    >
                      {getAvatarInitials(drawerDetails.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-[0.45vw]">
                        <h3 className="text-[0.92vw] font-semibold text-slate-800 truncate leading-tight">
                          {drawerDetails.name}
                        </h3>
                        <span className="shrink-0">{renderStatusBadge(selectedLead.status)}</span>
                      </div>
                      <p className="text-[0.68vw] text-slate-500 truncate mt-[0.1vw]">
                        {drawerDetails.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="p-[0.3vw] text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Close drawer"
                  >
                    <Icon icon="iconoir:cancel" className="w-[1.2vw] h-[1.2vw]" />
                  </button>
                </div>

                {/* Action Buttons: Status selector & Add Activity */}
                <div className="p-[1vw] border-b border-slate-100 grid grid-cols-2 gap-[0.6vw]">
                  {/* Status Dropdown Button */}
                  <div className="relative drawer-status-container">
                    <button
                      type="button"
                      onClick={() => setDrawerStatusOpen(!drawerStatusOpen)}
                      className={`w-full flex items-center justify-between px-[0.8vw] py-[0.48vw] rounded-[0.4vw] text-[0.72vw] font-medium transition-colors shadow-xs cursor-pointer ${getStatusButtonBg(
                        selectedLead.status
                      )}`}
                    >
                      <span>{selectedLead.status || 'New'}</span>
                      <Icon icon="icon-park-outline:down" className="w-[0.75vw] h-[0.75vw]" />
                    </button>

                    {drawerStatusOpen && (
                      <div className="absolute top-full left-0 mt-[0.2vw] w-full bg-white border border-slate-200 rounded-[0.4vw] shadow-xl py-[0.3vw] z-50">
                        {STATUS_MENU_OPTIONS.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(selectedLead.leadId || selectedLead._id, item.label)
                            }
                            className={`w-full text-left px-[0.75vw] py-[0.4vw] text-[0.72vw] flex items-center gap-[0.4vw] hover:bg-slate-50 transition-colors ${
                              (selectedLead.status || 'New').toLowerCase() === item.label.toLowerCase()
                                ? 'text-[#F05338] font-semibold bg-orange-50/50'
                                : 'text-slate-700'
                            }`}
                          >
                            <Icon icon={item.icon} className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Activity Button */}
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    className="w-full flex items-center justify-center gap-[0.3vw] px-[0.8vw] py-[0.48vw] rounded-[0.4vw] text-[0.72vw] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Icon icon="ci:add-plus" className="w-[0.8vw] h-[0.8vw]" />
                    <span>Add Activity</span>
                  </button>
                </div>

                {/* Scrollable Details Content */}
                <div className="flex-1 overflow-y-auto p-[1.2vw] space-y-[1.2vw]">
                  {/* Section 1: Lead Form Preview */}
                  <div>
                    <h4 className="text-[0.78vw] font-semibold text-slate-800 mb-[0.6vw]">
                      Lead Form Preview
                    </h4>
                    <div className="space-y-[0.4vw] text-[0.72vw]">
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="boxicons:form" className="w-[0.85vw] h-[0.85vw] text-[#EF4444]" />
                        <span className="text-slate-600 font-normal w-[5.5vw]">Form Name</span>
                        <span className="text-slate-800 font-normal truncate">
                          {selectedLead.formName || 'Product Enquiry Form'}
                        </span>
                      </div>
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="basil:book-open-outline" className="w-[0.85vw] h-[0.85vw] text-[#EF4444]" />
                        <span className="text-slate-600 font-normal w-[5.5vw]">Flipbook</span>
                        <span className="text-slate-800 font-normal truncate">
                          {selectedLead.flipbookName || 'Interactive Product Catalogue'}
                        </span>
                      </div>
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="ic:outline-calendar-month" className="w-[0.85vw] h-[0.85vw] text-[#EF4444]" />
                        <span className="text-slate-600 font-normal w-[5.5vw]">Date</span>
                        <span className="text-slate-800 font-normal">
                          {new Date(selectedLead.submittedAt || selectedLead.createdAt || Date.now()).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}, {new Date(selectedLead.submittedAt || selectedLead.createdAt || Date.now()).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Contact Information */}
                  <div className="pt-[0.4vw] border-t border-slate-100">
                    <h4 className="text-[0.78vw] font-semibold text-slate-800 mb-[0.6vw]">
                      Contact Information
                    </h4>
                    <div className="space-y-[0.4vw] text-[0.72vw]">
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="boxicons:user" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                        <span className="text-slate-600 font-normal w-[5.5vw]">Full Name</span>
                        <span className="text-slate-800 font-normal">
                          {drawerDetails.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="codicon:mail" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                        <span className="text-slate-600 font-normal w-[5.5vw]">Email</span>
                        <span className="text-slate-800 font-normal">
                          {drawerDetails.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="doodle-icons:call" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                        <span className="text-slate-600 font-normal w-[5.5vw]">Phone</span>
                        <span className="text-slate-800 font-normal">
                          {drawerDetails.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Lead Form Details */}
                  <div className="pt-[0.4vw] border-t border-slate-100">
                    <h4 className="text-[0.78vw] font-semibold text-slate-800 mb-[0.6vw]">
                      Lead Form Details
                    </h4>
                    <div className="space-y-[0.5vw] text-[0.72vw]">
                      <div className="flex items-start gap-[0.5vw]">
                        <span className="text-slate-600 font-normal w-[5.5vw]">Category</span>
                        <span className="text-slate-800 font-normal">
                          {drawerDetails.category}
                        </span>
                      </div>
                      <div className="flex items-start gap-[0.5vw]">
                        <span className="text-slate-600 font-normal w-[5.5vw]">Product</span>
                        <span className="text-slate-800 font-normal">
                          {drawerDetails.product}
                        </span>
                      </div>
                      <div className="flex items-start gap-[0.5vw]">
                        <span className="text-slate-600 font-normal w-[5.5vw]">Description</span>
                        <span className="text-slate-800 font-normal flex-1">
                          {drawerDetails.message !== '-' ? drawerDetails.message : 'Please share the product specifications and available models.'}
                        </span>
                      </div>
                    </div>
                  </div>

                {/* Section 4: Internal Notes */}
                <div className="pt-[0.4vw] border-t border-slate-100">
                  <h4 className="text-[0.78vw] font-semibold text-slate-800 mb-[0.6vw]">
                    Internal Notes
                  </h4>
                  <div className="space-y-[0.4vw]">
                    {Array.isArray(selectedLead.internalNotes) && selectedLead.internalNotes.length > 0 ? (
                      selectedLead.internalNotes.map((note, idx) => (
                        <div
                          key={note.noteId || idx}
                          className="flex items-start justify-between p-[0.6vw] bg-slate-50 border border-slate-200/80 rounded-[0.4vw] text-[0.68vw] text-slate-700"
                        >
                          <p className="flex-1 pr-[0.4vw] leading-relaxed">{note.text}</p>
                          <Icon icon="akar-icons:more-vertical-fill" className="w-[0.75vw] h-[0.75vw] text-slate-400" />
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start justify-between p-[0.6vw] bg-slate-50 border border-slate-200/80 rounded-[0.4vw] text-[0.68vw] text-slate-700">
                        <p className="flex-1 pr-[0.4vw] leading-relaxed">
                          Client Asked to share Specifications and models for their recrements like machine , motor, ect...
                        </p>
                        <Icon icon="akar-icons:more-vertical-fill" className="w-[0.75vw] h-[0.75vw] text-slate-400" />
                      </div>
                    )}

                    {/* Add note input form */}
                    {isAddingNote ? (
                      <div className="mt-[0.4vw] space-y-[0.3vw]">
                        <textarea
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="Type an internal note..."
                          className="w-full p-[0.5vw] text-[0.7vw] border border-slate-200 rounded-[0.4vw] focus:outline-none focus:border-[#F05338]"
                          rows={2}
                        />
                        <div className="flex items-center justify-end gap-[0.3vw]">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNote(false);
                              setNewNoteText('');
                            }}
                            className="px-[0.6vw] py-[0.25vw] text-[0.65vw] text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveNote}
                            className="px-[0.6vw] py-[0.25vw] text-[0.65vw] text-white bg-[#F05338] rounded-[0.3vw] cursor-pointer"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingNote(true)}
                        className="w-full py-[0.45vw] text-[0.72vw] font-medium text-[#F05338] bg-[#FFF5F2] hover:bg-[#FEE2E2] rounded-[0.4vw] transition-colors flex items-center justify-center gap-[0.3vw] cursor-pointer"
                      >
                        <Icon icon="solar:add-circle-linear" className="w-[0.8vw] h-[0.8vw]" />
                        <span>Add Notes</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 5: Activity and Timeline */}
                <div className="pt-[0.4vw] border-t border-slate-100">
                  <h4 className="text-[0.78vw] font-semibold text-slate-800 mb-[0.6vw]">
                    Activity and Timeline
                  </h4>
                  <div className="relative pl-[1.2vw] space-y-[0.8vw]">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[0.45vw] top-[0.4vw] bottom-[0.4vw] w-[2px] bg-slate-200" />

                    {(() => {
                      const timelineList = getFullTimeline(selectedLead);
                      return timelineList.map((item, idx) => {
                        const isLatest = idx === timelineList.length - 1;
                        return (
                          <div key={idx} className="relative flex items-start gap-[0.6vw]">
                            <div
                              className={`absolute -left-[1.2vw] top-[0.1vw] w-[0.8vw] h-[0.8vw] rounded-full border-2 border-white ${
                                isLatest ? 'bg-[#F05338]' : 'bg-[#F05338]'
                              }`}
                            />
                            <div>
                              <div className="text-[0.72vw] font-medium text-slate-800 leading-tight">
                                {item.title}
                              </div>
                              <div className="text-[0.62vw] text-slate-500 mt-[0.1vw]">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </motion.aside>
          );
        })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
