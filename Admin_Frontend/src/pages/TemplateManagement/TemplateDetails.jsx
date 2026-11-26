import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AdminHeaderActions from '../../components/AdminHeaderActions';

export default function TemplateDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const templateData = location.state?.template;
  const [selectedPlan, setSelectedPlan] = useState('Free Plan');
  const [templateNameInput, setTemplateNameInput] = useState(templateData?.name || 'Industrial Train');
  const [categoryInput, setCategoryInput] = useState(templateData?.category || 'Product catalogue');
  const [descriptionInput, setDescriptionInput] = useState(
    'A professionally designed product catalogue template to showcase products, highlight key features, and present product information with a clean and engaging layout.'
  );
  const [isPublished, setIsPublished] = useState(
    templateData?.status === 'Published' || false
  );

  return (
    <div className="w-full space-y-[1.6vw] font-sans pb-[3vw] text-[#1f2937]">
      {/* Top Navigation & Header Row */}
      <div className="flex items-center justify-between">
        {/* Left: Back Link & Breadcrumb */}
        <div className="flex items-center gap-[0.7vw] text-[0.82vw]">
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="flex items-center gap-[0.35vw] text-gray-700 hover:text-black font-medium transition cursor-pointer"
          >
            <svg
              className="w-[1vw] h-[1vw]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Template Management</span>
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 font-normal">TMP-FB-001</span>
        </div>

        {/* Right Admin Header Actions (bell & avatar) */}
        <AdminHeaderActions />
      </div>

      {/* Main White Card Wrapper */}
      <div className="bg-white rounded-[1.1vw] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-[1.8vw] space-y-[2vw]">
        {/* Title Header with Status Badge */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[1.7vw] font-bold text-[#111827] tracking-tight leading-tight">
              Product Catalogue
            </h1>
            <p className="text-[0.76vw] text-gray-500 mt-[0.25vw]">
              TPL-001 • Business • Created 12 Nov 2026
            </p>
          </div>

          <span className="inline-block px-[0.9vw] py-[0.25vw] rounded-full text-[0.74vw] font-medium bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]/50">
            Approved
          </span>
        </div>

        {/* Section 01: Template Preview */}
        <div>
          <div className="flex items-center gap-[0.45vw] mb-[1vw]">
            <span className="text-[0.78vw] font-bold text-[#f87171] bg-[#fef2f2] px-[0.4vw] py-[0.1vw] rounded-[0.25vw]">
              01
            </span>
            <h2 className="text-[1vw] font-bold text-[#f87171]">
              Template Preview
            </h2>
          </div>

          {/* Interactive Flipbook Container */}
          <div className="w-full bg-[#f8f9fa] rounded-[0.9vw] p-[1.8vw] flex flex-col items-center justify-center border border-gray-100 relative">
            {/* Book Display Container */}
            <div className="relative w-[75%] max-w-[50vw] aspect-[16/9] flex items-center justify-center">
              {/* Prev Arrow */}
              <button
                type="button"
                className="absolute left-[-2.2vw] top-1/2 -translate-y-1/2 w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              >
                <svg className="w-[1vw] h-[1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* Realistic Spread Showcase */}
              <div className="w-full h-full bg-[#faf7f2] rounded-[0.4vw] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200/70 flex overflow-hidden">
                {/* Left Page: Sidebar info + Food photos */}
                <div className="w-1/2 h-full border-r border-[#eae2d5] flex flex-row p-[1vw] gap-[0.7vw] bg-[#fdfbf7]">
                  {/* Miniature recipe/item column */}
                  <div className="w-[30%] flex flex-col justify-around py-[0.5vw] border-r border-[#f1ebd9] pr-[0.4vw]">
                    {[
                      { title: 'Greek Salad', sub: 'Healthy Recipe' },
                      { title: 'Chicken Tacos', sub: 'Mexican Food' },
                      { title: 'Garden Cooker', sub: 'Traditional Pot' },
                      { title: 'Hotel Recipes', sub: 'Premium Dish' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div className="w-[1.4vw] h-[1.4vw] rounded-full bg-[#faecd6] text-[#b45309] flex items-center justify-center mb-[0.15vw]">
                          <svg className="w-[0.8vw] h-[0.8vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                          </svg>
                        </div>
                        <span className="text-[0.48vw] font-bold text-gray-800 leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[0.4vw] text-gray-400 leading-tight">
                          {item.sub}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Main appetizing visual dish */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="w-full h-[65%] rounded-[0.3vw] overflow-hidden relative shadow-inner">
                      <img
                        src="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
                        alt="Gourmet dish"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-full h-[30%] rounded-[0.3vw] overflow-hidden relative shadow-inner">
                      <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"
                        alt="Restaurant ambiance"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Page: Contents Menu Page */}
                <div className="w-1/2 h-full p-[1.4vw] flex flex-col justify-between bg-[#fdfbf7]">
                  <div>
                    <h3 className="text-[1.2vw] font-serif font-black tracking-widest text-[#2c3327] uppercase">
                      CONTENTS
                    </h3>
                    <div className="w-[3vw] h-[2px] bg-[#d97706] mt-[0.1vw] mb-[0.8vw]" />
                  </div>

                  {/* Numbered Table of Contents items */}
                  <div className="space-y-[0.7vw]">
                    {[
                      { num: '01', title: 'The Art of Flavour', desc: 'Introduction and culinary philosophy' },
                      { num: '02', title: "Chef's Special", desc: 'Handcrafted seasonal signatures' },
                      { num: '03', title: 'World on a Plate', desc: 'Global street inspirations refined' },
                      { num: '04', title: 'The Dining Experience', desc: 'Atmosphere, cellar & private spaces' },
                      { num: '05', title: 'Contact Us', desc: 'Reservations, locations & catering' }
                    ].map((row) => (
                      <div key={row.num} className="flex items-start gap-[0.6vw]">
                        <span className="text-[0.85vw] font-serif font-bold text-[#b45309]">
                          {row.num}
                        </span>
                        <div>
                          <p className="text-[0.65vw] font-bold text-gray-900 leading-tight">
                            {row.title}
                          </p>
                          <p className="text-[0.45vw] text-gray-500 leading-tight">
                            {row.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[0.45vw] text-gray-400 font-serif pt-[0.4vw]">
                    FLIPBOOK EXCLUSIVE • 2027
                  </div>
                </div>
              </div>

              {/* Next Arrow */}
              <button
                type="button"
                className="absolute right-[-2.2vw] top-1/2 -translate-y-1/2 w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              >
                <svg className="w-[1vw] h-[1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Bottom Media / Flip Player Controls */}
            <div className="w-[65%] flex items-center justify-between gap-[1vw] mt-[1.2vw] pt-[0.4vw]">
              {/* Play button */}
              <button type="button" className="text-gray-500 hover:text-gray-800 transition cursor-pointer">
                <svg className="w-[0.9vw] h-[0.9vw] fill-current" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>

              {/* Progress track */}
              <div className="flex-1 h-[3px] bg-gray-200 rounded-full relative flex items-center">
                <div className="w-[28%] h-full bg-[#f87171] rounded-full" />
                <div className="w-[0.65vw] h-[0.65vw] bg-white border-2 border-[#f87171] rounded-full -ml-[0.32vw] shadow-xs cursor-pointer" />
              </div>

              {/* Sound & Fullscreen */}
              <div className="flex items-center gap-[0.7vw] text-gray-400">
                <button type="button" className="hover:text-gray-700 transition cursor-pointer">
                  <svg className="w-[0.9vw] h-[0.9vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </button>
                <button type="button" className="hover:text-gray-700 transition cursor-pointer">
                  <svg className="w-[0.9vw] h-[0.9vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 02: Template Information */}
        <div>
          <div className="flex items-center gap-[0.45vw] mb-[0.9vw]">
            <span className="text-[0.78vw] font-bold text-[#f87171] bg-[#fef2f2] px-[0.4vw] py-[0.1vw] rounded-[0.25vw]">
              02
            </span>
            <h2 className="text-[1vw] font-bold text-[#f87171]">
              Template Information
            </h2>
          </div>

          <div className="bg-[#f9fafb]/60 rounded-[0.7vw] border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse text-[0.8vw]">
              <thead>
                <tr className="bg-[#f3f4f6]/70 text-gray-700 font-semibold border-b border-gray-100">
                  <th className="py-[0.8vw] px-[1.4vw] w-[25%] font-semibold">Field</th>
                  <th className="py-[0.8vw] px-[1.4vw] font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr>
                  <td className="py-[0.7vw] px-[1.4vw] font-medium text-gray-900">Template Name</td>
                  <td className="py-[0.7vw] px-[1.4vw] text-gray-600">Product Catalogue</td>
                </tr>
                <tr>
                  <td className="py-[0.7vw] px-[1.4vw] font-medium text-gray-900">Template ID</td>
                  <td className="py-[0.7vw] px-[1.4vw] text-gray-600">TPL-001</td>
                </tr>
                <tr>
                  <td className="py-[0.7vw] px-[1.4vw] font-medium text-gray-900">Category</td>
                  <td className="py-[0.7vw] px-[1.4vw] text-gray-600">Business</td>
                </tr>
                <tr>
                  <td className="py-[0.7vw] px-[1.4vw] font-medium text-gray-900 align-top">Description</td>
                  <td className="py-[0.7vw] px-[1.4vw] text-gray-600 leading-relaxed max-w-[45vw]">
                    A professionally designed product catalogue template to showcase products, highlight key features, and present product information with a clean and engaging layout.
                  </td>
                </tr>
                <tr>
                  <td className="py-[0.7vw] px-[1.4vw] font-medium text-gray-900">Created By</td>
                  <td className="py-[0.7vw] px-[1.4vw] text-gray-600">Gayathri</td>
                </tr>
                <tr>
                  <td className="py-[0.7vw] px-[1.4vw] font-medium text-gray-900">Created Date</td>
                  <td className="py-[0.7vw] px-[1.4vw] text-gray-600">12 Nov 2026</td>
                </tr>
                <tr>
                  <td className="py-[0.7vw] px-[1.4vw] font-medium text-gray-900">Last Updated</td>
                  <td className="py-[0.7vw] px-[1.4vw] text-gray-600">13 Nov 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 03: Review Information */}
        <div>
          <div className="flex items-center gap-[0.45vw] mb-[0.9vw]">
            <span className="text-[0.78vw] font-bold text-[#f87171] bg-[#fef2f2] px-[0.4vw] py-[0.1vw] rounded-[0.25vw]">
              03
            </span>
            <h2 className="text-[1vw] font-bold text-[#f87171]">
              Review Information
            </h2>
          </div>

          <div className="space-y-[0.8vw] text-[0.8vw]">
            <div>
              <p className="text-[0.68vw] text-gray-400 font-medium">Reviewer</p>
              <p className="text-[0.88vw] font-semibold text-gray-900 mt-[0.1vw]">
                Akshaya
              </p>
            </div>

            <div>
              <p className="text-[0.68vw] text-gray-400 font-medium">Last Reviewed Date</p>
              <p className="text-[0.84vw] font-semibold text-gray-900 mt-[0.1vw]">
                14 Nov 2026
              </p>
            </div>

            <div>
              <p className="text-[0.68vw] text-gray-400 font-medium">Status</p>
              <div className="mt-[0.2vw]">
                <span className="inline-block px-[0.9vw] py-[0.22vw] rounded-full text-[0.72vw] font-medium bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]/50">
                  Approved
                </span>
              </div>
            </div>

            <div>
              <p className="text-[0.68vw] text-gray-400 font-medium">Approved Date</p>
              <p className="text-[0.84vw] font-semibold text-gray-900 mt-[0.1vw]">
                14 Nov 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Publishing Preferences Peach / Warm Box */}
      <div className="bg-[#fff9f6] rounded-[1vw] border border-[#ffedd5] p-[1.8vw] space-y-[1.4vw]">
        {/* Title */}
        <div className="flex items-center gap-[0.5vw]">
          <div className="w-[1.4vw] h-[1.4vw] rounded-full bg-[#ffedd5] text-[#eb4b36] flex items-center justify-center">
            <svg className="w-[0.85vw] h-[0.85vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <h3 className="text-[1.05vw] font-bold text-[#eb4b36]">
            Setup Publishing Preferences
          </h3>
        </div>

        {/* Inputs */}
        <div className="space-y-[1.1vw]">
          {/* Template Name */}
          <div className="w-[30vw]">
            <label className="block text-[0.76vw] font-medium text-gray-700 mb-[0.35vw]">
              Template Name <span className="text-[#f87171]">*</span>
            </label>
            <input
              type="text"
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              className="w-full px-[0.9vw] py-[0.52vw] bg-white border border-gray-200/90 rounded-[0.45vw] text-[0.82vw] text-gray-800 focus:outline-none focus:border-[#eb4b36] shadow-2xs"
            />
          </div>

          {/* Template Category */}
          <div className="w-[30vw]">
            <label className="block text-[0.76vw] font-medium text-gray-700 mb-[0.35vw]">
              Template Category <span className="text-[#f87171]">*</span>
            </label>
            <div className="relative">
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full px-[0.9vw] py-[0.52vw] bg-white border border-gray-200/90 rounded-[0.45vw] text-[0.82vw] text-gray-800 focus:outline-none focus:border-[#eb4b36] appearance-none shadow-2xs cursor-pointer"
              >
                <option value="Product catalogue">Product catalogue</option>
                <option value="Business">Business</option>
                <option value="Portfolio">Portfolio</option>
                <option value="Restaurant">Restaurant</option>
              </select>
              <svg
                className="absolute right-[0.9vw] top-1/2 -translate-y-1/2 w-[0.85vw] h-[0.85vw] text-gray-400 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[0.76vw] font-medium text-gray-700 mb-[0.35vw]">
              Description <span className="text-[#f87171]">*</span>
            </label>
            <input
              type="text"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              className="w-full px-[0.9vw] py-[0.52vw] bg-white border border-gray-200/90 rounded-[0.45vw] text-[0.82vw] text-gray-800 focus:outline-none focus:border-[#eb4b36] shadow-2xs"
            />
          </div>

          {/* Subscription Access Selection */}
          <div className="pt-[0.3vw]">
            <p className="text-[0.76vw] font-medium text-gray-700 mb-[0.6vw]">
              Select which subscription plans can access this template <span className="text-[#f87171]">*</span>
            </p>

            <div className="grid grid-cols-3 gap-[1.2vw]">
              {/* Free Plan */}
              <div
                onClick={() => setSelectedPlan('Free Plan')}
                className={`bg-white rounded-[0.6vw] p-[1vw] border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                  selectedPlan === 'Free Plan'
                    ? 'border-[#eb4b36] ring-1 ring-[#eb4b36]'
                    : 'border-gray-200/80 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-[0.7vw]">
                  <div className="w-[2vw] h-[2vw] rounded-full bg-[#ecfdf5] text-[#16a34a] flex items-center justify-center">
                    <svg className="w-[1vw] h-[1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[0.85vw] font-bold text-gray-900 leading-tight">
                      Free Plan
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.1vw]">
                      Last Reviewed Date
                    </p>
                  </div>
                </div>

                <div
                  className={`w-[1.2vw] h-[1.2vw] rounded-full flex items-center justify-center border ${
                    selectedPlan === 'Free Plan'
                      ? 'bg-[#eb4b36] border-[#eb4b36] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedPlan === 'Free Plan' && (
                    <svg className="w-[0.7vw] h-[0.7vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Pro Plan */}
              <div
                onClick={() => setSelectedPlan('Pro Plan')}
                className={`bg-white rounded-[0.6vw] p-[1vw] border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                  selectedPlan === 'Pro Plan'
                    ? 'border-[#eb4b36] ring-1 ring-[#eb4b36]'
                    : 'border-gray-200/80 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-[0.7vw]">
                  <div className="w-[2vw] h-[2vw] rounded-full bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center">
                    <svg className="w-[1vw] h-[1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[0.85vw] font-bold text-gray-900 leading-tight">
                      Pro Plan
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.1vw]">
                      Last Reviewed Date
                    </p>
                  </div>
                </div>

                <div
                  className={`w-[1.2vw] h-[1.2vw] rounded-full flex items-center justify-center border ${
                    selectedPlan === 'Pro Plan'
                      ? 'bg-[#eb4b36] border-[#eb4b36] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedPlan === 'Pro Plan' && (
                    <svg className="w-[0.7vw] h-[0.7vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Premium Plan */}
              <div
                onClick={() => setSelectedPlan('Premium Plan')}
                className={`bg-white rounded-[0.6vw] p-[1vw] border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                  selectedPlan === 'Premium Plan'
                    ? 'border-[#eb4b36] ring-1 ring-[#eb4b36]'
                    : 'border-gray-200/80 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-[0.7vw]">
                  <div className="w-[2vw] h-[2vw] rounded-full bg-[#faf5ff] text-[#a855f7] flex items-center justify-center">
                    <svg className="w-[1vw] h-[1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 3h12l4 6-10 13L2 9z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[0.85vw] font-bold text-gray-900 leading-tight">
                      Premium Plan
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.1vw]">
                      Last Reviewed Date
                    </p>
                  </div>
                </div>

                <div
                  className={`w-[1.2vw] h-[1.2vw] rounded-full flex items-center justify-center border ${
                    selectedPlan === 'Premium Plan'
                      ? 'bg-[#eb4b36] border-[#eb4b36] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedPlan === 'Premium Plan' && (
                    <svg className="w-[0.7vw] h-[0.7vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Publishing Actions */}
      <div className="flex items-center justify-between pt-[0.4vw]">
        {/* Info label on left */}
        <div className="flex items-center gap-[0.4vw] text-[0.78vw] text-gray-500">
          <svg className="w-[0.9vw] h-[0.9vw] text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Publish this template to make it available to users in the Templates library.</span>
        </div>

        {/* Buttons on right */}
        <div className="flex items-center gap-[0.9vw]">
          {isPublished ? (
            <>
              {/* Edit Setup button - Hug content with compact side padding */}
              <button
                type="button"
                className="inline-flex items-center justify-center gap-[10px] px-[20px] h-[48px] rounded-[12px] bg-white hover:bg-[#fafafa] text-[15px] font-normal text-[#858585] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] transition active:scale-[0.99] cursor-pointer"
              >
                {/* Outlined square sheet with pencil protruding through top-right edge */}
                <svg
                  className="w-[18px] h-[18px] text-[#858585] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                </svg>
                <span>Edit Setup</span>
              </button>

              {/* Un Publish this Template button - matching exact Figma specs */}
              <button
                type="button"
                onClick={() => setIsPublished(false)}
                className="inline-flex items-center justify-center gap-[10px] px-[20px] h-[48px] rounded-[12px] bg-white hover:bg-[#fafafa] text-[15px] font-normal text-[#858585] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] transition active:scale-[0.99] cursor-pointer"
              >
                <span>Un Publish this Template</span>
                <svg
                  className="w-[18px] h-[18px] text-[#858585] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* Request Changes button */}
              <button
                type="button"
                className="inline-flex items-center justify-center gap-[10px] px-[20px] h-[48px] rounded-[12px] bg-white hover:bg-[#fafafa] text-[15px] font-normal text-[#858585] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] transition active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-[18px] h-[18px] text-[#858585] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                </svg>
                <span>Request Changes</span>
              </button>

              {/* Publish This Template button */}
              <button
                type="button"
                onClick={() => setIsPublished(true)}
                className="inline-flex items-center justify-center gap-[10px] px-[22px] h-[48px] rounded-[12px] bg-[#eb4b36] hover:bg-[#d9422e] text-[15px] font-medium text-white shadow-[0px_2px_4px_rgba(0,0,0,0.25)] transition active:scale-[0.99] cursor-pointer"
              >
                <span>Publish This Template</span>
                <svg className="w-[18px] h-[18px] text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <polyline points="9 3 9 21" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
