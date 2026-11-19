import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Info, Check, Plus } from 'lucide-react';
import axios from 'axios';
import { useToast } from './CustomToast';
import { useAuth } from '../context/AuthContext';
import {
  COVER_TEMPLATES,
  extractPageBgColor,
  detectFlipbookOrientation,
  getPageAspectRatio,
  normalizePageHtml,
  renderTemplateBooks,
  getShadowRgba,
  TemplatePreview,
  CoverPicturePopup,
  CoverPicturePopupWithStyles
} from './CoverPictureTemplate';

export {
  COVER_TEMPLATES,
  extractPageBgColor,
  detectFlipbookOrientation,
  getPageAspectRatio,
  normalizePageHtml,
  renderTemplateBooks,
  getShadowRgba,
  TemplatePreview,
  CoverPicturePopup,
  CoverPicturePopupWithStyles
};

const scrollbarStyles = `
  .custom-popup-scrollbar::-webkit-scrollbar {
    width: 0.35vw;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-thumb {
    background: #292a2bff;
    border-radius: 10px;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-button {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-button:vertical:decrement,
  .custom-popup-scrollbar::-webkit-scrollbar-button:vertical:increment,
  .custom-popup-scrollbar::-webkit-scrollbar-button:horizontal:decrement,
  .custom-popup-scrollbar::-webkit-scrollbar-button:horizontal:increment {
    display: none !important;
  }
  ::-webkit-scrollbar-button {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
  }
  .custom-popup-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #475569 transparent;
  }
`;


const FlipbookInfoModal = ({ isOpen, onClose, currentBook, onSaveSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [bookName, setBookName] = useState('');
  const [quotes, setQuotes] = useState('');
  const [about, setAbout] = useState('');
  const [category, setCategory] = useState('Product Based');
  const [language, setLanguage] = useState('English');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCoverPopup, setShowCoverPopup] = useState(false);
  const [coverPicture, setCoverPicture] = useState(null);

  const bookId = currentBook?.v_id || currentBook?.id || currentBook?.realName || currentBook?.flipbookName || currentBook?.title || '';

  // Sync state when book ID changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setBookName(currentBook?.flipbookName || currentBook?.realName || currentBook?.title || '');
      setQuotes(currentBook?.quotes || currentBook?.quote || currentBook?.tagline || currentBook?.meta?.quotes || currentBook?.meta?.quote || currentBook?.meta?.tagline || '');
      setAbout(currentBook?.about || currentBook?.meta?.about || '');
      setCategory(currentBook?.category || currentBook?.meta?.category || 'Product Based');
      setLanguage(currentBook?.language || currentBook?.meta?.language || 'English');
      setErrors({});

      const rawCp = currentBook?.coverPicture ||
        currentBook?.Customized_Settings?.FlipbookInfo?.coverPicture ||
        currentBook?.Customized_Settings?.otherSetup?.coverPicture ||
        currentBook?.Customized_Settings?.coverPicture ||
        currentBook?.settings?.othersetup?.coverPicture ||
        currentBook?.settings?.otherSetup?.coverPicture ||
        currentBook?.settings?.FlipbookInfo?.coverPicture ||
        currentBook?.meta?.coverPicture ||
        null;

      const detectedOrient = detectFlipbookOrientation(currentBook, currentBook?.pages || []);
      const tplId = typeof rawCp?.selectedTemplate === 'object' && rawCp?.selectedTemplate
        ? rawCp.selectedTemplate.id
        : Number(rawCp?.selectedTemplate || rawCp?.templateId || 0);

      const foundInitial = COVER_TEMPLATES.find(t => t.id === tplId);
      const initialTemplate = (foundInitial && (foundInitial.orientation || 'portrait').toLowerCase() === detectedOrient.toLowerCase())
        ? foundInitial
        : (COVER_TEMPLATES.find(t => (t.orientation || 'portrait').toLowerCase() === detectedOrient.toLowerCase()) || COVER_TEMPLATES[0]);
      const bookTitle = currentBook?.flipbookName || currentBook?.realName || currentBook?.title || '';
      const bookSubtitle = currentBook?.quotes || currentBook?.quote || currentBook?.tagline || '';

      const resolvedText1 = rawCp?.text1 || initialTemplate.defaultText1 || 'Name of the Book';
      const resolvedText2 = rawCp?.text2 || initialTemplate.defaultText2 || '“Turn every page into an experience”';

      const cp = rawCp ? {
        ...rawCp,
        selectedTemplate: initialTemplate,
        text1: resolvedText1,
        text2: resolvedText2,
        bgColor: rawCp.bgColor || rawCp.selectedTemplate?.defaultBgColor || initialTemplate.defaultBgColor || '#F8FAFC'
      } : {
        type: 'template',
        url: '',
        selectedTemplate: initialTemplate,
        text1: resolvedText1,
        text2: resolvedText2,
        bgColor: initialTemplate.defaultBgColor || '#F8FAFC',
        fit: 'Fit'
      };
      setCoverPicture(cp);
    }
  }, [isOpen, bookId]);

  if (!isOpen) return null;

  const visibilityMode = currentBook?.share?.access || currentBook?.settings?.visibility?.type || 'Public';
  const pageCount = currentBook?.pages?.length || currentBook?.pageCount || 12;
  const thumbnailUrl = currentBook?.thumbnail || currentBook?.coverImage || null;

  const uploadFile = async (file) => {
    const userEmail = user?.emailId || user?.email || currentBook?.userEmail;
    if (!userEmail) return null;

    const formData = new FormData();
    formData.append('emailId', userEmail);
    formData.append('folderName', currentBook?.folder || 'My_Flipbooks');
    formData.append('flipbookName', currentBook?.flipbookName || currentBook?.realName || bookName || 'Untitled Document');
    formData.append('type', 'image');
    formData.append('assetType', 'Image');
    formData.append('page_v_id', 'popup_gallery');
    formData.append('file', file);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await axios.post(`${backendUrl}/api/flipbook/upload-asset`, formData);
      if (res.data.url) {
        const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${backendUrl}${res.data.url}`;
        return {
          url: fullUrl,
          file_v_id: res.data.file_v_id,
          name: res.data.filename
        };
      }
    } catch (err) {
      console.error("Cover image upload failed:", err);
    }
    return null;
  };

  const handleSaveClick = async () => {
    // Validate required fields
    const newErrors = {};
    if (!bookName.trim()) newErrors.bookName = "Flipbook Name is required.";
    if (!quotes.trim()) newErrors.quotes = "Quote / Tagline is required.";
    if (!about.trim()) newErrors.about = "About description is required.";
    if (!category.trim()) newErrors.category = "Category is required.";
    if (!language.trim()) newErrors.language = "Language is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErr = Object.values(newErrors)[0];
      toast?.error?.(firstErr || "Please fill in all required fields.");
      return;
    }

    setErrors({});
    setIsSaving(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const v_id = currentBook?.v_id || currentBook?.realName;
      const userEmail = user?.emailId || user?.email || currentBook?.userEmail;

      if (userEmail && v_id) {
        const payload = {
          emailId: userEmail,
          v_id: v_id,
          bookName: bookName.trim(),
          flipbookName: bookName.trim(),
          newName: bookName.trim(),
          category: category.trim(),
          language: language.trim(),
          quotes: quotes.trim(),
          about: about.trim(),
          totalPages: pageCount,
          visibility: visibilityMode,
          coverPicture: coverPicture,
          settings: {
            ...(currentBook?.settings || {}),
            othersetup: {
              ...(currentBook?.settings?.othersetup || {}),
              coverPicture: coverPicture
            }
          }
        };

        try {
          await axios.post(`${backendUrl}/api/customized-editor/book-info`, payload);
        } catch (postErr) {
          console.warn("Direct book-info endpoint failed, attempting fallback to update-settings:", postErr);
          await axios.post(`${backendUrl}/api/flipbook/update-settings`, payload);
        }
      }

      toast?.success?.("Flipbook information updated successfully!");
      if (onSaveSuccess) {
        onSaveSuccess({
          bookName: bookName.trim(),
          quotes: quotes.trim(),
          about: about.trim(),
          category: category.trim(),
          language: language.trim(),
          coverPicture
        });
      }
      onClose();
    } catch (err) {
      console.error("Save info failed:", err);
      toast?.error?.("Failed to update flipbook information.");
    } finally {
      setIsSaving(false);
    }
  };

  const modalJsx = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-[1vw]">
      <style>{scrollbarStyles}</style>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative bg-white w-[54vw] max-h-[94vh] rounded-[1.2vw] shadow-2xl animate-in fade-in zoom-in-95 duration-300 font-sans p-[1.6vw] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-[1vw] mb-[0.2vw]">
          <h2 className="text-[1.4vw] font-bold text-gray-900 whitespace-nowrap tracking-tight">
            {showCoverPopup ? (
              <>
                Flipbook Information <span className="text-gray-400 font-medium mx-[0.4vw]">&rarr;</span> Cover Picture Customization
              </>
            ) : (
              "Flipbook Information"
            )}
          </h2>
          <div className="flex-1 h-[1px] bg-gray-200" />
          <button
            onClick={showCoverPopup ? () => setShowCoverPopup(false) : onClose}
            className="p-[0.35vw] rounded-full hover:bg-gray-100 transition-colors border border-red-200 text-red-500 cursor-pointer flex-shrink-0"
          >
            <X size="1vw" />
          </button>
        </div>

        <p className="text-[0.78vw] text-gray-400 font-medium mb-[0.6vw]">
          {showCoverPopup
            ? "Choose and customize cover template or upload a cover image"
            : "Add basic details about your flipbook"}
        </p>

        {showCoverPopup ? (
          <CoverPicturePopup
            inline={true}
            settings={{ coverPicture }}
            currentBook={currentBook}
            pages={currentBook?.pages || []}
            onClose={() => setShowCoverPopup(false)}
            onSave={async (coverData) => {
              let finalUrl = coverData.url;
              let finalLogoUrl = coverData.logoUrl;

              // If it's an uploaded image, we must upload it to the server to get a permanent URL
              if (coverData.type === 'upload' && coverData.rawFile) {
                try {
                  const uploaded = await uploadFile(coverData.rawFile);
                  if (uploaded && uploaded.url) {
                    finalUrl = uploaded.url;
                  }
                } catch (err) {
                  console.error("Failed to upload cover picture", err);
                }
              }

              // If a new raw logo was picked, upload it to get a permanent server URL
              if (coverData.rawLogoFile) {
                try {
                  const uploadedLogo = await uploadFile(coverData.rawLogoFile);
                  if (uploadedLogo && uploadedLogo.url) {
                    finalLogoUrl = uploadedLogo.url;
                  }
                } catch (err) {
                  console.error("Failed to upload cover logo", err);
                }
              }

              setCoverPicture({
                ...coverData,
                url: finalUrl,
                logoUrl: finalLogoUrl,
                rawFile: null, // Clear file object from state
                rawLogoFile: null
              });
              setShowCoverPopup(false);
            }}
          />
        ) : (
          <>
            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-2 gap-[1.5vw]">
              {/* Left Column */}
              <div className="flex flex-col justify-between gap-[0.9vw]">
                <div className="relative group rounded-[0.9vw] bg-gray-50 w-full aspect-[4/3] flex items-center justify-center shadow-inner overflow-hidden border border-gray-200/50">
                  {coverPicture?.type === 'template' ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gray-100 rounded-[0.5vw]">
                      <TemplatePreview
                        {...coverPicture}
                        pages={currentBook?.pages || []}
                      />
                    </div>
                  ) : coverPicture?.url ? (
                    <img
                      src={coverPicture.url}
                      alt="Flipbook Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="Flipbook Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-[14vw] h-[15vw] flex items-center justify-center">
                      <div className="absolute w-[10vw] h-[13.5vw] bg-gradient-to-br from-orange-500 to-amber-600 rounded-[0.6vw] shadow-xl transform -rotate-6 border border-orange-400 p-[0.7vw] flex flex-col justify-between text-white">
                        <span className="text-[0.7vw] font-bold tracking-widest uppercase opacity-85">HARD.COVER</span>
                        <div>
                          <h3 className="text-[0.85vw] font-black leading-tight break-words">Hard.Cover Book</h3>
                          <p className="text-[0.6vw] opacity-90 mt-[0.1vw] break-words">Free .psd Mockup</p>
                        </div>
                      </div>
                      <div className="absolute w-[10vw] h-[13.5vw] bg-gradient-to-br from-amber-600 to-orange-500 rounded-[0.6vw] shadow-2xl transform rotate-6 border border-amber-400 p-[0.7vw] flex flex-col justify-between text-white">
                        <span className="text-[0.7vw] font-bold tracking-widest uppercase opacity-85">HARD.COVER</span>
                        <div>
                          <h3 className="text-[0.85vw] font-black leading-tight break-words">Hard.Cover Book</h3>
                          <p className="text-[0.6vw] opacity-90 mt-[0.1vw] break-words">Free .psd Mockup</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replace Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <button
                      type="button"
                      onClick={() => setShowCoverPopup(true)}
                      className="px-[1.2vw] py-[0.6vw] bg-white text-black font-semibold text-[0.8vw] rounded-[0.5vw] hover:bg-gray-100 transition-all flex items-center gap-[0.4vw] shadow-lg cursor-pointer"
                    >
                      <Plus size="1vw" />
                      <span>Replace Cover</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Input Group */}
                <div className="flex flex-col gap-[0.8vw]">
                  {/* Flipbook Name */}
                  <div>
                    <label className="text-[0.82vw] font-bold text-gray-900 mb-[0.3vw] block">
                      Flipbook Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        maxLength={20}
                        value={bookName}
                        onChange={(e) => {
                          setBookName(e.target.value);
                          if (errors.bookName) setErrors(prev => ({ ...prev, bookName: null }));
                        }}
                        placeholder="Name of the book"
                        className={`w-full border rounded-[0.5vw] px-[0.8vw] py-[0.5vw] pr-[3.2vw] text-[0.8vw] font-normal text-gray-600 bg-gray-50/70 cursor-not-allowed placeholder-gray-300 focus:outline-none shadow-xs transition-colors ${errors.bookName ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                      />
                      <span className="absolute right-[0.8vw] top-1/2 -translate-y-1/2 text-[0.7vw] text-gray-300 font-normal select-none">
                        {bookName.length}/20
                      </span>
                    </div>
                    {errors.bookName && <p className="text-[0.68vw] text-red-500 font-medium mt-[0.2vw]">{errors.bookName}</p>}
                  </div>

                  {/* Quote / Tagline */}
                  <div>
                    <label className="text-[0.82vw] font-bold text-gray-900 mb-[0.3vw] block">
                      Quote / Tagline <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={20}
                        value={quotes}
                        onChange={(e) => {
                          setQuotes(e.target.value);
                          if (errors.quotes) setErrors(prev => ({ ...prev, quotes: null }));
                        }}
                        placeholder="Quotes About Book"
                        className={`w-full border rounded-[0.5vw] px-[0.8vw] py-[0.5vw] pr-[3.2vw] text-[0.8vw] font-normal text-gray-800 placeholder-gray-300 focus:outline-none shadow-xs transition-colors ${errors.quotes ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-gray-400'}`}
                      />
                      <span className="absolute right-[0.8vw] top-1/2 -translate-y-1/2 text-[0.7vw] text-gray-300 font-normal select-none">
                        {quotes.length}/20
                      </span>
                    </div>
                    {errors.quotes && <p className="text-[0.68vw] text-red-500 font-medium mt-[0.2vw]">{errors.quotes}</p>}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-[0.8vw]">
                {/* About */}
                <div>
                  <label className="text-[0.82vw] font-bold text-gray-900 mb-[0.3vw] block">
                    About <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      maxLength={100}
                      value={about}
                      onChange={(e) => {
                        setAbout(e.target.value);
                        if (errors.about) setErrors(prev => ({ ...prev, about: null }));
                      }}
                      placeholder="About Book"
                      className={`w-full border rounded-[0.5vw] px-[0.8vw] py-[0.5vw] pb-[1.5vw] text-[0.8vw] font-normal text-gray-800 placeholder-gray-300 focus:outline-none shadow-xs resize-none h-[5.5vw] transition-colors ${errors.about ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-gray-400'}`}
                    />
                    <span className="absolute right-[0.8vw] bottom-[0.5vw] text-[0.7vw] text-gray-300 font-normal select-none">
                      {about.length}/100
                    </span>
                  </div>
                  {errors.about && <p className="text-[0.68vw] text-red-500 font-medium mt-[0.2vw]">{errors.about}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="text-[0.82vw] font-bold text-gray-900 mb-[0.3vw] block">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (errors.category) setErrors(prev => ({ ...prev, category: null }));
                      }}
                      className={`w-full border rounded-[0.5vw] px-[0.8vw] py-[0.5vw] text-[0.8vw] font-normal text-gray-800 bg-white focus:outline-none appearance-none cursor-pointer shadow-xs transition-colors ${errors.category ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-gray-400'}`}
                    >
                      <option value="Product Based">Product Based</option>
                      <option value="Business">Business</option>
                      <option value="Catalog">Catalog</option>
                      <option value="Brochure">Brochure</option>
                      <option value="Magazine">Magazine</option>
                      <option value="Portfolio">Portfolio</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown size="1vw" className="text-gray-500 absolute right-[0.8vw] top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.category && <p className="text-[0.68vw] text-red-500 font-medium mt-[0.2vw]">{errors.category}</p>}
                </div>

                {/* Language */}
                <div>
                  <label className="text-[0.82vw] font-bold text-gray-900 mb-[0.3vw] block">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        if (errors.language) setErrors(prev => ({ ...prev, language: null }));
                      }}
                      className={`w-full border rounded-[0.5vw] px-[0.8vw] py-[0.5vw] text-[0.8vw] font-normal text-gray-800 bg-white focus:outline-none appearance-none cursor-pointer shadow-xs transition-colors ${errors.language ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-gray-400'}`}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                    <ChevronDown size="1vw" className="text-gray-500 absolute right-[0.8vw] top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.language && <p className="text-[0.68vw] text-red-500 font-medium mt-[0.2vw]">{errors.language}</p>}
                </div>

                {/* Total Pages */}
                <div>
                  <label className="text-[0.82vw] font-bold text-gray-900 mb-[0.3vw] block">Total Pages</label>
                  <input
                    type="text"
                    disabled
                    value={`${pageCount} Pages`}
                    className="w-full border border-gray-300 rounded-[0.5vw] px-[0.8vw] py-[0.5vw] text-[0.8vw] font-normal text-gray-600 bg-gray-50/70 cursor-not-allowed shadow-xs"
                  />
                </div>

                {/* Visibility Info Box */}
                <div className="bg-[#f0f4fe] border border-blue-100/60 rounded-[0.8vw] p-[0.7vw] space-y-[0.2vw]">
                  <div className="flex items-center gap-[0.4vw]">
                    <Info size="0.9vw" className="text-[#4338ca] flex-shrink-0" />
                    <span className="text-[0.78vw] font-semibold text-gray-800">
                      Access Mode : <span className="text-[#4338ca] font-bold">{visibilityMode}</span>
                    </span>
                  </div>
                  <p className="text-[0.68vw] text-gray-500 leading-snug pl-[1.3vw]">
                    When published, this flipbook will be visible as {visibilityMode}.<br />
                    Change access settings anytime from: <strong className="text-gray-700 font-semibold">Customize &gt; Visibility</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Divider Line */}
            <div className="w-full h-[1px] bg-gray-200 mt-[1.4vw] mb-[1.2vw]" />

            {/* Footer Action Buttons */}
            <div className="grid grid-cols-2 gap-[1.2vw]">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-[0.65vw] rounded-[0.5vw] border border-gray-300 bg-white text-gray-800 text-[0.85vw] font-semibold flex items-center justify-center gap-[0.4vw] hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
              >
                <X size="0.95vw" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleSaveClick}
                disabled={isSaving}
                className="w-full py-[0.65vw] rounded-[0.5vw] bg-black hover:bg-gray-900 text-white text-[0.85vw] font-semibold flex items-center justify-center gap-[0.4vw] transition-all shadow-md cursor-pointer disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="w-[0.95vw] h-[0.95vw] border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size="0.95vw" />
                    <span>Save Info Changes</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalJsx, document.body);
};

export default FlipbookInfoModal;
