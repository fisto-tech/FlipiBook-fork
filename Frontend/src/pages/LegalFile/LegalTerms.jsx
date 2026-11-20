import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';

export default function LegalTerms() {
  const [activeSection, setActiveSection] = useState('agreement');

  const sections = [
    { id: 'agreement', title: '1. Agreement' },
    { id: 'eligibility', title: '2. Eligibility' },
    { id: 'your-account', title: '3. Your Account' },
    { id: 'the-services', title: '4. The Services' },
    { id: 'plans-fees-payment', title: '5. Plans, Fees and Payment' },
    { id: 'your-content', title: '6. Your Content' },
    { id: 'acceptable-use', title: '7. Acceptable Use' },
    { id: 'intellectual-property', title: '8. Our Intellectual Property' },
    { id: '3d-studio-ar', title: '8A. 3D Studio & Augmented Reality (AR)' },
    { id: 'analytics-leads', title: '9. Analytics, Leads and Reader Data' },
    { id: 'third-party', title: '10. Third-Party Services' },
    { id: 'availability', title: '11. Availability and Support' },
    { id: 'suspension-termination', title: '12. Suspension and Termination' },
    { id: 'disclaimer', title: '13. Disclaimer of Warranties' },
    { id: 'liability', title: '14. Limitation of Liability' },
    { id: 'indemnity', title: '15. Indemnity' },
    { id: 'governing-law', title: '16. Governing Law and Disputes' },
    { id: 'changes', title: '17. Changes to These Terms' },
    { id: 'general', title: '18. General' },
    { id: 'contact', title: '19. Contact Information' },
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
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The binding agreement governing your access to and use of FlipiBook websites, applications, and interactive catalogue services.
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-gray-400" />
                Last updated: 19 November 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-gray-400" />
                10 min read
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
                          className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-between cursor-pointer ${
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
                    <p className="font-semibold text-gray-800 mb-1">Questions on Terms?</p>
                    <p className="text-gray-600 mb-2 leading-relaxed">Contact our legal team regarding licensing, terms, or contracts.</p>
                    <a
                      href="mailto:info@flipibook-o.com"
                      className="inline-flex items-center gap-1 text-[#EA7233] font-medium hover:underline"
                    >
                      <span>Contact Legal Team</span>
                      <Icon icon="lucide:arrow-right" className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Content */}
            <article className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 lg:p-12 shadow-xs space-y-10 leading-relaxed text-sm sm:text-base text-gray-700">
              
              {/* Section 1 */}
              <section id="agreement" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  1. Agreement
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    These Terms & Conditions (&quot;Terms&quot;) form a binding agreement between you (&quot;User&quot;, &quot;you&quot;) and <strong>Fisto Tech Private Limited</strong> (&quot;FlipiBook&quot;, &quot;we&quot;, &quot;us&quot;), governing your use of the FlipiBook website, apps and services (&quot;Services&quot;). By creating an account or using the Services you agree to these Terms, our <Link to="/privacy-policy" className="text-[#EA7233] hover:underline font-medium">Privacy Policy</Link> and our <Link to="/cookie-policy" className="text-[#EA7233] hover:underline font-medium">Cookie Policy</Link>. If you use the Services for an organisation, you confirm you are authorised to bind it.
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    If you do not agree, please do not use the Services.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="eligibility" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  2. Eligibility
                </h2>
                <p className="text-gray-600">
                  You must be at least <strong>18 years old</strong> and able to enter into a legally binding contract under Indian law to use the Services.
                </p>
              </section>

              {/* Section 3 */}
              <section id="your-account" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  3. Your Account
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 text-xs sm:text-sm">
                  <li>Provide accurate information and keep it current.</li>
                  <li>Keep your password confidential; you are responsible for all activity under your account.</li>
                  <li>Tell us immediately at <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a> if you suspect unauthorised access.</li>
                  <li>We may suspend or close accounts that give false information or breach these Terms.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="the-services" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  4. The Services
                </h2>
                <div className="space-y-3.5 text-gray-600 text-xs sm:text-sm">
                  <p>
                    FlipiBook is an interactive digital catalogue platform that turns static PDFs into engaging, multimedia-rich flipbooks for businesses and organisations. Features depend on your plan and include:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><strong>Design & layout:</strong> creative layouts and page effects.</div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><strong>Branding & sharing:</strong> custom branding, QR codes and links.</div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><strong>Multimedia interaction:</strong> video, audio, links and hotspot elements.</div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><strong>3D editor studio:</strong> create and customise 3D product models.</div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><strong>Augmented reality (AR):</strong> let viewers see products in the real world.</div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><strong>Digital bookshelf:</strong> organise and showcase your publications.</div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><strong>Analytics & marketing:</strong> track views, engagement, clicks and leads.</div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><strong>Team collaboration:</strong> work on flipbooks with your team.</div>
                  </div>
                  <p className="pt-2 text-xs text-gray-500">
                    The Services are designed for business catalogues and publications in manufacturing, engineering, textile, fashion, e-commerce, medical, architecture, education and agriculture. We may improve, change or retire features, and will give reasonable notice of material reductions.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="plans-fees-payment" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  5. Plans, Fees and Payment
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 text-xs sm:text-sm">
                  <li><strong>Pricing:</strong> paid plans, features, storage and limits are shown on our pricing page at the time of purchase. Prices are in Indian Rupees unless stated, exclusive of GST and taxes.</li>
                  <li><strong>Billing:</strong> subscriptions renew automatically each billing period until cancelled. You authorise us and our payment processors to charge your payment method.</li>
                  <li><strong>Price changes:</strong> we will give at least 30 days’ notice before changing the price of your plan; the change applies from your next renewal.</li>
                  <li><strong>Cancellation:</strong> you may cancel at any time from Account Settings. Access continues until the end of the paid period.</li>
                  <li><strong>Refunds:</strong> fees are non-refundable except where required by law or stated in our <Link to="/refund-policy" className="text-[#EA7233] hover:underline font-medium">Payment & Refund Terms</Link>, which prevail in case of conflict.</li>
                  <li><strong>Late payment:</strong> we may suspend paid features if payment fails and is not corrected within 7 days of notice.</li>
                  <li><strong>Free trials:</strong> a trial converts to a paid plan only if you choose a plan before it ends.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section id="your-content" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  6. Your Content
                </h2>
                <div className="space-y-3 text-gray-600 text-xs sm:text-sm">
                  <p><strong>Ownership:</strong> you keep all rights in the catalogues, files, images, videos, 3D models and data you upload (&quot;Your Content&quot;).</p>
                  <p><strong>Licence to us:</strong> you grant us a limited, non-exclusive, worldwide licence to host, store, convert, display and deliver Your Content solely to operate and support the Services for you.</p>
                  <p><strong>Your promises:</strong> you own or have the rights to Your Content, it does not infringe anyone’s intellectual property, privacy or other rights, and it complies with law.</p>
                  <p><strong>Private and public flipbooks:</strong> Your flipbooks are private unless you choose to publish them publicly. For public flipbooks, you allow us to display and distribute them through the Services. We do not use content you keep private for promotion.</p>
                  <p><strong>Search engines:</strong> Public flipbooks may be indexed by search engines. Use privacy settings to keep flipbooks private if you do not want indexing.</p>
                  <p><strong>Content kept for others:</strong> If a flipbook has already been shared with a specific reader, we may keep a copy available until their access ends, unless the law or a valid takedown requires otherwise.</p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="acceptable-use" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  7. Acceptable Use
                </h2>
                <div className="space-y-3.5 text-gray-600 text-xs sm:text-sm">
                  <div className="p-4 bg-red-50/70 rounded-xl border border-red-200">
                    <p className="font-semibold text-red-900 mb-1">No adult content</p>
                    <p className="text-red-800 leading-relaxed">
                      FlipiBook is built for business, product, educational and professional catalogues. Adult, sexually explicit, pornographic or 18+ content is strictly prohibited on the Services. We may remove such content without notice, suspend or terminate the account, and report it to the authorities where required by law. No refund is due where an account is closed for this reason.
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800">You must not upload, publish, link to or transmit:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>content that threatens or promotes violence, or hatred against people because of race, ethnicity, religion, caste, disability, gender, age or sexual orientation;</li>
                    <li>content that harasses, stalks, defames, impersonates or defrauds another person or organisation;</li>
                    <li>content that harms or exploits children in any way;</li>
                    <li>spam, mass unsolicited promotion, deceptive or misleading material, phishing and fake offers;</li>
                    <li>other people’s personal data without their permission;</li>
                    <li>malware, scrapers, or links that lead to prohibited content;</li>
                    <li>content that threatens the sovereignty, integrity or security of India or public order.</li>
                  </ul>
                </div>
              </section>

              {/* Section 8 */}
              <section id="intellectual-property" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  8. Our Intellectual Property
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  The Services, including software, design, templates, 3D editor, branding and the FlipiBook name and logo, belong to Fisto Tech Private Limited or its licensors and are protected by law. We grant you a limited, revocable, non-transferable right to use the Services during your subscription. You may not use our trademarks without written permission.
                </p>
              </section>

              {/* Section 8A */}
              <section id="3d-studio-ar" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  8A. 3D Studio and Augmented Reality (AR)
                </h2>
                <div className="space-y-3 text-gray-600 text-xs sm:text-sm">
                  <p><strong>What they are:</strong> 3D Editor Studio lets you create, upload, customise and publish 3D models. AR lets viewers see those models in their own surroundings through a compatible phone, tablet or browser (GLB, GLTF, USDZ, OBJ, FBX supported).</p>
                  <p><strong>Your models:</strong> you keep ownership of the 3D models and designs you upload or create. You promise that you own them or have permission to use them and that they comply with Section 7 (including the ban on adult content).</p>
                  <p><strong>Built-in assets:</strong> any stock models, templates or materials we provide may be used only inside FlipiBook flipbooks and AR views. You may not resell or redistribute them as stand-alone files.</p>
                  <p><strong>Approximate results:</strong> 3D and AR views are visual aids only. Size, scale, colour, texture, lighting and fit may look different from the real product. FlipiBook is not responsible for purchase decisions made from 3D or AR views.</p>
                  <p><strong>Safety:</strong> viewers should use AR only in a safe place and stay aware of their surroundings. Do not use AR while driving, walking in traffic or operating machinery.</p>
                  <p><strong>Readers’ privacy:</strong> camera access is processed on the reader&apos;s device and permission is requested through the device or browser.</p>
                </div>
              </section>

              {/* Section 9 */}
              <section id="analytics-leads" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  9. Analytics, Leads and Reader Data
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  If you publish flipbooks to your own readers, you are the controller of the reader and lead data collected through them and FlipiBook acts as your processor. You must give readers any notices and obtain any consents required by law. Our Data Processing Agreement is available on request at <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a>.
                </p>
              </section>

              {/* Section 10 */}
              <section id="third-party" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  10. Third-Party Services
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  The Services may include or link to third-party services such as video embeds (YouTube, Vimeo), fonts, CDNs and payment processors. Those services are governed by their own terms, and we are not responsible for them.
                </p>
              </section>

              {/* Section 11 */}
              <section id="availability" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  11. Availability and Support
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  We work to keep the Services available but do not guarantee uninterrupted or error-free operation. We may carry out maintenance with reasonable notice where possible. Support is provided through the channels and hours listed for your plan.
                </p>
              </section>

              {/* Section 12 */}
              <section id="suspension-termination" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  12. Suspension and Termination
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  You may stop using the Services and cancel your plan at any time. We may suspend or terminate your access immediately if you breach these Terms, fail to pay, or create legal/security risks. After termination, you may export Your Content for <strong>90 days</strong>, after which we will delete it as described in the Privacy Policy.
                </p>
              </section>

              {/* Section 13 */}
              <section id="disclaimer" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  13. Disclaimer of Warranties
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  The Services are provided &quot;as is&quot; and &quot;as available&quot;. To the fullest extent permitted by law, we disclaim all implied warranties, including merchantability, fitness for a particular purpose and non-infringement. We do not warrant that the Services will meet all your requirements or that analytics, AR or 3D results will be error-free.
                </p>
              </section>

              {/* Section 14 */}
              <section id="liability" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  14. Limitation of Liability
                </h2>
                <div className="space-y-2 text-gray-600 text-xs sm:text-sm">
                  <p>To the fullest extent permitted by law:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>FlipiBook is not liable for indirect, incidental, special, consequential or punitive damages, or for loss of profits, revenue, data or goodwill.</li>
                    <li>Our total liability for any claim arising from the Services is limited to the fees you paid to us in the <strong>12 months</strong> before the event giving rise to the claim.</li>
                  </ul>
                </div>
              </section>

              {/* Section 15 */}
              <section id="indemnity" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  15. Indemnity
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  You agree to defend and compensate FlipiBook, its directors, employees and partners against claims, losses and expenses (including reasonable legal fees) arising from Your Content, your breach of these Terms, or your violation of law or third-party rights.
                </p>
              </section>

              {/* Section 16 */}
              <section id="governing-law" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  16. Governing Law and Disputes
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  These Terms are governed by the laws of India. If a dispute is not resolved informally within 30 days, the courts at <strong>Coimbatore, Tamil Nadu</strong> have exclusive jurisdiction, subject to any mandatory consumer rights that apply to you.
                </p>
              </section>

              {/* Section 17 */}
              <section id="changes" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  17. Changes to These Terms
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  We may update these Terms from time to time. For material changes we will notify registered Users by email or in-app notice at least <strong>15 days</strong> before they take effect.
                </p>
              </section>

              {/* Section 18 */}
              <section id="general" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  18. General
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-600 text-xs sm:text-sm">
                  <li><strong>Entire agreement:</strong> these Terms, the Privacy Policy, Cookie Policy and any plan details are the whole agreement.</li>
                  <li><strong>Severability:</strong> if a provision is unenforceable, the rest remains in force.</li>
                  <li><strong>No waiver:</strong> failure to enforce a right is not a waiver of it.</li>
                  <li><strong>Assignment:</strong> you may not transfer your rights without our consent; we may assign ours in a merger or sale.</li>
                  <li><strong>Force majeure:</strong> neither party is liable for delays caused by events beyond reasonable control.</li>
                </ul>
              </section>

              {/* Section 19 */}
              <section id="contact" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  19. Contact Information
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
                  <Link to="/privacy-policy" className="text-[#EA7233] hover:underline font-medium">Privacy Policy</Link>
                  <span>•</span>
                  <Link to="/cookie-policy" className="text-[#EA7233] hover:underline font-medium">Cookie Policy</Link>
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
