import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';

export default function LegalCookies() {
  const [activeSection, setActiveSection] = useState('what-are-cookies');

  const sections = [
    { id: 'what-are-cookies', title: '1. What Are Cookies?' },
    { id: 'how-we-use', title: '2. How We Use Them' },
    { id: 'categories', title: '3. Categories of Cookies' },
    { id: 'cookie-inventory', title: '4. Cookie Inventory' },
    { id: 'local-storage', title: '5. Local and Session Storage' },
    { id: 'third-party', title: '6. Third-Party Technologies' },
    { id: 'managing-choices', title: '7. Managing Your Choices' },
    { id: 'updates', title: '8. Updates to This Policy' },
    { id: 'contact', title: '9. Contact Information' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-60px 0px -65% 0px',
        threshold: 0
      }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between">
      <main className="w-full flex-1">
        {/* Hero Section */}
        <div className="relative w-full bg-gradient-to-b from-orange-50/50 via-white to-transparent border-b border-gray-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
          <div className="w-full max-w-[1920px] mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
              Cookie Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              How FlipiBook uses cookies, local storage and similar technologies to deliver, customise and improve your interactive flipbook experience.
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-gray-400" />
                Last updated: 19 November 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-gray-400" />
                6 min read
              </span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">
            {/* Left Sticky Table of Contents */}
            <aside className="w-full lg:w-[280px] xl:w-[320px] shrink-0 hidden lg:block sticky top-4 self-start z-10">
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs max-h-[calc(100vh-3.5rem)] overflow-y-auto custom-scrollbar flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                    Table of Contents
                  </h3>
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const isSelected = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50 text-[#EA7233] font-semibold shadow-2xs'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <span className="truncate">{section.title}</span>
                          {isSelected && (
                            <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5 text-[#EA7233] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="bg-orange-50/50 rounded-xl p-3.5 border border-orange-100 text-xs">
                    <p className="font-semibold text-gray-800 mb-1">Manage preferences</p>
                    <p className="text-gray-600 mb-2 leading-relaxed">You can modify cookie settings in your browser at any time.</p>
                    <a
                      href="mailto:info@flipibook-o.com"
                      className="inline-flex items-center gap-1 text-[#EA7233] font-medium hover:underline"
                    >
                      <span>Questions about Cookies?</span>
                      <Icon icon="lucide:arrow-right" className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Articles */}
            <article className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 lg:p-12 shadow-xs space-y-10 leading-relaxed text-sm sm:text-base text-gray-700">
              
              {/* Introduction Note */}
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-xs sm:text-sm text-gray-700">
                This Cookie Policy explains how FlipiBook, operated by <strong>Fisto Tech Private Limited</strong> (&quot;FlipiBook&quot;, &quot;we&quot;), uses cookies, local storage and similar technologies to deliver, customise and improve your interactive flipbook experience. It should be read with our <Link to="/privacy-policy" className="text-[#EA7233] hover:underline font-medium">Privacy Policy</Link>.
              </div>

              {/* Section 1 */}
              <section id="what-are-cookies" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  1. What Are Cookies?
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    Cookies are small text files placed on your computer, phone or tablet when you visit a website or web app. They keep sessions working, remember preferences and give service operators aggregate insight into usage. We also use browser local storage, session storage and pixel tags to support interactive 3D bookshelf rendering and reading continuity.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="how-we-use" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  2. How We Use Them
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 text-xs sm:text-sm">
                  <li>Keep you logged in safely as you move between pages.</li>
                  <li>Remember shelf styles, lighting presets and sound volume.</li>
                  <li>Remember reading positions so readers can resume where they stopped.</li>
                  <li>Measure engagement (page views, reading duration, device types) on published flipbooks.</li>
                  <li>Protect the platform against CSRF attacks, bots and abusive requests.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="categories" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  3. Categories of Cookies
                </h2>
                
                {/* Pricing Styled Table */}
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#333333] border-b border-[#222222] divide-x divide-[#444444] text-white">
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[28%]">Category</th>
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide">Purpose &amp; Description</th>
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[26%]">Consent Needed?</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-600 font-normal">
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">
                            A. Strictly necessary
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            Login, session security, API routing, form protection. The site cannot work without them.
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              No (Essential)
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">
                            B. Functionality &amp; preferences
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            Bookshelf theme, lamp brightness, music volume, flip sound, viewer layout.
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              Yes, where required by law
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">
                            C. Performance &amp; analytics
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            Page views, reading time, device type, template popularity, load speed, errors. Reports shown to us and flipbook owners are aggregated.
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              Yes (Consent required)
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">
                            D. Marketing &amp; tracking
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            Pixels and tags that measure campaign and email performance, and conversion or lead attribution.
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-50 text-[#EA7233] border border-orange-200">
                              Yes (Consent required)
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We will not set categories B, C or D (where consent is required) until you accept them through our cookie banner.
                </p>
              </section>

              {/* Section 4 */}
              <section id="cookie-inventory" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  4. Cookie Inventory
                </h2>
                
                {/* Pricing Styled Table */}
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#333333] border-b border-[#222222] divide-x divide-[#444444] text-white">
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[28%]">Cookie / Key</th>
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide">Provider</th>
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide">Category</th>
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-600 font-normal">
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-mono text-[12px] font-medium text-gray-800">session_id</td>
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">FlipiBook</td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">Strictly necessary</span></td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">Session</span></td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-mono text-[12px] font-medium text-gray-800">csrf_token</td>
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">FlipiBook</td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">Strictly necessary</span></td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">Session</span></td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-mono text-[12px] font-medium text-gray-800">consent_choice</td>
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">FlipiBook</td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">Strictly necessary</span></td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-50 text-gray-700 border border-gray-200">12 months</span></td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-mono text-[12px] font-medium text-gray-800">shelf_prefs</td>
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">FlipiBook</td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">Preferences</span></td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-50 text-gray-700 border border-gray-200">12 months</span></td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-mono text-[12px] font-medium text-gray-800">reading_position</td>
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">FlipiBook</td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">Preferences</span></td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-50 text-gray-700 border border-gray-200">6 months</span></td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-mono text-[12px] font-medium text-gray-800">analytics_id</td>
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">FlipiBook / Analytics</td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700">Analytics</span></td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-50 text-gray-700 border border-gray-200">13 months</span></td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-mono text-[12px] font-medium text-gray-800">__cf_bm / cf_clearance</td>
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">Cloudflare</td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">Security</span></td>
                          <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-50 text-gray-700 border border-gray-200">Session to 12 months</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section id="local-storage" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  5. Local and Session Storage
                </h2>
                <div className="space-y-3.5 text-gray-600 text-xs sm:text-sm">
                  <p>
                    FlipiBook also stores data directly on your device, which makes the app faster and more responsive:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Shelf customisations:</strong> active shelf styles, decor placement and temporary unsaved drafts.</li>
                    <li><strong>Page editor state:</strong> autosaved changes while editing, to protect against accidental browser closure.</li>
                    <li><strong>Audio and video state:</strong> mute/unmute and volume settings during presentation.</li>
                    <li><strong>3D and AR state:</strong> remembering viewer settings in the 3D model viewer, and your choice about AR and camera permission prompts. Camera access itself is controlled by your device or browser.</li>
                  </ul>
                  <p className="text-xs text-gray-500">
                    This storage is treated like cookies for consent purposes, except where strictly necessary to provide a feature you asked for.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="third-party" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  6. Third-Party Technologies
                </h2>
                <div className="space-y-3.5 text-gray-600 text-xs sm:text-sm">
                  <p>
                    Some features rely on third-party services such as YouTube or Vimeo embeds, web fonts and Cloudflare CDN caching. These providers may set their own cookies when you view a flipbook that includes their content. We do not control those cookies; please review their policies. Where possible we use privacy-enhanced embed modes and self-hosted fonts to limit tracking.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="managing-choices" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  7. Managing Your Choices
                </h2>
                <div className="space-y-3.5 text-gray-600 text-xs sm:text-sm">
                  <p>
                    <strong>Cookie banner:</strong> on your first visit you can accept all, reject non-essential, or customise your choices.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="logos:chrome" className="w-4 h-4 shrink-0" />
                        <p className="font-semibold text-gray-900 text-sm">Google Chrome</p>
                      </div>
                      <p className="text-gray-500 text-[11px]">Settings → Privacy and security → Third-party cookies</p>
                    </div>
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="logos:safari" className="w-4 h-4 shrink-0" />
                        <p className="font-semibold text-gray-900 text-sm">Apple Safari</p>
                      </div>
                      <p className="text-gray-500 text-[11px]">Settings → Privacy → Manage website data / Block all cookies</p>
                    </div>
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="logos:firefox" className="w-4 h-4 shrink-0" />
                        <p className="font-semibold text-gray-900 text-sm">Mozilla Firefox</p>
                      </div>
                      <p className="text-gray-500 text-[11px]">Settings → Privacy & Security → Enhanced Tracking Protection</p>
                    </div>
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="logos:microsoft-edge" className="w-4 h-4 shrink-0" />
                        <p className="font-semibold text-gray-900 text-sm">Microsoft Edge</p>
                      </div>
                      <p className="text-gray-500 text-[11px]">Settings → Cookies and site permissions → Manage cookies</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Disabling strictly necessary cookies may stop you from logging in, customising bookshelves or viewing some interactive features.
                  </p>
                  <p className="text-xs text-gray-700 bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                    <strong>Flipbook owners:</strong> if you publish flipbooks, you are responsible for showing your readers an appropriate cookie notice where our analytics or marketing features are enabled on your flipbooks.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section id="updates" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  8. Updates to This Policy
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  We may update this Cookie Policy when our cookies change or the law requires. The &quot;Last updated&quot; date shows the latest version, and we will notify registered Users of material changes.
                </p>
              </section>

              {/* Section 9 */}
              <section id="contact" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  9. Contact Information
                </h2>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/70 text-xs sm:text-sm space-y-1.5 text-gray-700">
                  <p className="font-semibold text-gray-900">Fisto Tech Private Limited (FlipiBook)</p>
                  <p>Email: <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a></p>
                  <p>Phone: <a href="tel:+917530025147" className="text-[#EA7233] hover:underline font-medium">+91 75300 25147</a></p>
                  <p>Address: Coimbatore, Tamil Nadu, India</p>
                </div>
              </section>

              {/* Navigation Footer Inside Article */}
              <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Related documents:</span>
                  <Link to="/terms-and-conditions" className="text-[#EA7233] hover:underline font-medium">Terms & Conditions</Link>
                  <span>•</span>
                  <Link to="/privacy-policy" className="text-[#EA7233] hover:underline font-medium">Privacy Policy</Link>
                  <span>•</span>
                  <Link to="/refund-policy" className="text-[#EA7233] hover:underline font-medium">Refund Policy</Link>
                  <span>•</span>
                  <Link to="/copyright-policy" className="text-[#EA7233] hover:underline font-medium">Copyright Policy</Link>
                </div>
                <Link to="/" className="inline-flex items-center gap-1.5 text-gray-700 hover:text-[#EA7233] font-medium transition-colors">
                  <Icon icon="lucide:arrow-left" className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>
              </div>

            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
