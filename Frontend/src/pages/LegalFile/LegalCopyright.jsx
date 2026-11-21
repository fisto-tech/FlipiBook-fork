import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';

export default function LegalCopyright() {
  const [activeSection, setActiveSection] = useState('approach');

  const sections = [
    { id: 'approach', title: '1. Our Approach' },
    { id: 'how-to-report', title: '2. How to Report Infringement' },
    { id: 'action-after-notice', title: '3. What We Do After a Valid Notice' },
    { id: 'counter-notice', title: '4. Counter-Notice by the User' },
    { id: 'repeat-infringers', title: '5. Repeat Infringers' },
    { id: 'designated-officer', title: '6. Designated Contact & Grievance Officer' },
    { id: 'report-prohibited', title: '7. Report Prohibited Content' },
    { id: 'changes', title: '8. Changes' },
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
              Copyright & Takedown Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              How to report intellectual property infringement, counter-notice procedures, and actions under the Indian IT Rules and US DMCA.
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-gray-400" />
                Last updated: 19 November 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-gray-400" />
                5 min read
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
                    <p className="font-semibold text-gray-800 mb-1">Copyright Infringement?</p>
                    <p className="text-gray-600 mb-2 leading-relaxed">Submit a DMCA takedown notice or intellectual property query to our Grievance Officer.</p>
                    <a
                      href="mailto:info@flipibook-o.com?subject=Copyright%20Infringement%20Notice"
                      className="inline-flex items-center gap-1 text-[#EA7233] font-medium hover:underline"
                    >
                      <span>Submit Infringement Notice</span>
                      <Icon icon="lucide:arrow-right" className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Articles */}
            <article className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 lg:p-12 shadow-xs space-y-10 leading-relaxed text-sm sm:text-base text-gray-700">
              
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-xs sm:text-sm text-gray-700">
                FlipiBook respects intellectual property rights and expects its users to do the same. This policy explains how to report content that infringes your rights, how users can respond, and what we do about repeat infringers. It follows the <strong>Copyright Act, 1957</strong>, the <strong>Information Technology Act, 2000</strong> and the <strong>IT (Intermediary Guidelines) Rules, 2021</strong> in India, and the <strong>US Digital Millennium Copyright Act (&quot;DMCA&quot;)</strong> for notices from the United States.
              </div>

              {/* Section 1 */}
              <section id="approach" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  1. Our Approach
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 text-xs sm:text-sm">
                  <li>Users must own or have permission for everything they upload. FlipiBook does not allow copyright-infringing activity.</li>
                  <li>We act on complete, valid notices promptly. We do not review every flipbook in advance.</li>
                  <li>We may remove or disable content, or an account, where we reasonably believe it infringes rights or breaks our Terms.</li>
                  <li className="text-gray-500 italic">This policy is general information and not legal advice.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section id="how-to-report" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  2. How to Report Infringement
                </h2>
                <div className="space-y-3 text-gray-600 text-xs sm:text-sm">
                  <p>Email our designated contact (Section 6) with the following information:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Your name, address, phone number and email.</li>
                    <li>A description of the copyrighted work you say has been infringed, and proof that you own it or act for the owner.</li>
                    <li>The exact web address (URL) of the flipbook or page, so we can find it.</li>
                    <li>A statement that you believe in good faith that the use is not authorised by the owner, its agent or the law.</li>
                    <li>A statement that the information in your notice is accurate and, for US notices, that you make it under penalty of perjury.</li>
                    <li>Your physical or electronic signature.</li>
                  </ol>
                  <p className="text-xs text-gray-500 pt-1">
                    <em>Incomplete notices may be returned for more information. Knowingly false claims can lead to legal liability, including damages.</em>
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section id="action-after-notice" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  3. What We Do After a Valid Notice
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 text-xs sm:text-sm">
                  <li>We remove or disable access to the reported content and tell the user who published it.</li>
                  <li>We may share your notice and contact details with that user, as the law allows.</li>
                  <li>We act on valid court orders and government directions within the time the law requires.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="counter-notice" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  4. Counter-Notice by the User
                </h2>
                <div className="space-y-3 text-gray-600 text-xs sm:text-sm">
                  <p>
                    If you believe your content was removed by mistake or you have permission to use it, send us a counter-notice with:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Your name, address, phone number and email.</li>
                    <li>The content that was removed and where it appeared before removal.</li>
                    <li>A statement, under penalty of perjury for US matters, that you believe in good faith the removal was a mistake or misidentification.</li>
                    <li>Your consent to the courts of your location (or, if outside the US, to the courts at Coimbatore) and to accept service from the person who made the original notice.</li>
                    <li>Your signature.</li>
                  </ol>
                  <p className="pt-1">
                    We will pass the counter-notice to the complainant. If they do not tell us within <strong>10 business days</strong> that they have started court action, we may restore the content.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="repeat-infringers" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  5. Repeat Infringers
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  We may suspend or terminate, without notice, accounts of users who repeatedly infringe rights. No refund is due where an account is closed for this reason.
                </p>
              </section>

              {/* Section 6 */}
              <section id="designated-officer" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  6. Designated Contact and Grievance Officer
                </h2>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/80 text-xs sm:text-sm space-y-2 text-gray-700">
                  <p className="font-semibold text-gray-900">Copyright and Content Grievance Officer — Fisto Tech Private Limited</p>
                  <p>Email: <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a></p>
                  <p>Phone: <a href="tel:+917530025147" className="text-[#EA7233] hover:underline font-medium">+91 75300 25147</a></p>
                  <p>Address: Fisto Tech Private Limited, Coimbatore, Tamil Nadu, India</p>
                  <p className="text-xs text-gray-500 pt-1">
                    We acknowledge content complaints within <strong>24 hours</strong> and aim to resolve them within <strong>7 days</strong>. We act on complaints about nudity, sexual content or impersonation as fast as possible and within the time the IT Rules require. We act on valid court or government takedown orders within <strong>36 hours</strong>, or sooner where the law requires.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="report-prohibited" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  7. Report Prohibited Content
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  To report adult content, hate, harassment, malware, spam or other content that breaks Terms & Conditions, use the &quot;Report content&quot; link in the flipbook viewer or email <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a> with the flipbook’s web address and the reason.
                </p>
              </section>

              {/* Section 8 */}
              <section id="changes" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  8. Changes
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  We may update this policy and will post the new version with its date.
                </p>
              </section>

              {/* Navigation Footer Inside Article */}
              <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Related documents:</span>
                  <Link to="/terms-and-conditions" className="text-[#EA7233] hover:underline font-medium">Terms & Conditions</Link>
                  <span>•</span>
                  <Link to="/privacy-policy" className="text-[#EA7233] hover:underline font-medium">Privacy Policy</Link>
                  <span>•</span>
                  <Link to="/cookie-policy" className="text-[#EA7233] hover:underline font-medium">Cookie Policy</Link>
                  <span>•</span>
                  <Link to="/refund-policy" className="text-[#EA7233] hover:underline font-medium">Refund Policy</Link>
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
