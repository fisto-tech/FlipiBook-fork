import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';

export default function LegalPrivacy() {
  const [activeSection, setActiveSection] = useState('who-we-are');

  const sections = [
    { id: 'who-we-are', title: '1. Who We Are and Scope' },
    { id: 'info-we-collect', title: '2. Information We Collect' },
    { id: 'legal-bases', title: '3. How & Why We Use Information' },
    { id: 'sharing-providers', title: '4. Sharing and Service Providers' },
    { id: 'international-transfers', title: '5. International Transfers' },
    { id: 'security-breach', title: '6. Security & Breach Notification' },
    { id: 'data-retention', title: '7. Data Retention' },
    { id: 'your-rights', title: '8. Your Rights' },
    { id: 'grievance-redressal', title: '9. Grievance Redressal' },
    { id: 'children', title: '10. Children' },
    { id: 'dnt-changes', title: '11. Do Not Track & Policy Changes' },
    { id: 'contact', title: '12. Contact Us' },
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
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              How FlipiBook collects, uses, stores, shares, and deletes personal data when you use our websites and services.
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-gray-400" />
                Last updated: 19 November 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-gray-400" />
                8 min read
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
                    <p className="font-semibold text-gray-800 mb-1">Privacy questions?</p>
                    <p className="text-gray-600 mb-2 leading-relaxed">Reach out to our Data Privacy & Grievance team anytime.</p>
                    <a
                      href="mailto:info@flipibook-o.com"
                      className="inline-flex items-center gap-1 text-[#EA7233] font-medium hover:underline"
                    >
                      <span>Email Privacy Team</span>
                      <Icon icon="lucide:arrow-right" className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Content */}
            <article className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 lg:p-12 shadow-xs space-y-10 leading-relaxed text-sm sm:text-base text-gray-700">
              
              {/* Introduction */}
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-xs sm:text-sm text-gray-700 space-y-2">
                <p>
                  Welcome to <strong>FlipiBook</strong> (&quot;FlipiBook&quot;, &quot;Platform&quot;, &quot;Site&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;), operated by <strong>Fisto Tech Private Limited</strong>, Coimbatore, Tamil Nadu, India (&quot;Company&quot;). We value the privacy of our registered members, subscribers, guests and visitors (&quot;Users&quot;, &quot;you&quot; or &quot;your&quot;). This Privacy Policy explains how we collect, use, store, share and delete personal data when you use FlipiBook&apos;s websites and services (&quot;Services&quot;).
                </p>
                <p>
                  By using the Services you acknowledge this Policy. Where the law requires your consent, we will ask for it separately and clearly.
                </p>
              </div>

              {/* Section 1 */}
              <section id="who-we-are" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  1. Who We Are and Scope
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Service overview:</strong> FlipiBook is a cloud-based interactive digital catalogue platform. Registered Users can upload, create, convert, edit, host and share interactive flipbooks, including 3D models, video, links, AR and analytics.</li>
                    <li><strong>Registered office:</strong> Fisto Tech Private Limited, Coimbatore, Tamil Nadu, India.</li>
                    <li><strong>Laws we follow:</strong> We aim to comply with India’s Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;) and the Information Technology Act, 2000, and to align with the EU/UK General Data Protection Regulation (&quot;GDPR&quot;) and the California Online Privacy Protection Act (&quot;CalOPPA&quot;) where they apply.</li>
                  </ul>
                  <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2 text-xs sm:text-sm">
                    <p className="font-semibold text-gray-900">Our Roles:</p>
                    <p><strong>• Data Controller (Data Fiduciary):</strong> For personal data of our Users, such as account, billing and support data.</p>
                    <p><strong>• Data Processor:</strong> For personal data of readers and leads who view flipbooks published by our business customers. The customer decides why and how that data is used, and we process it only on the customer’s instructions under our Data Processing Agreement (&quot;DPA&quot;).</p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section id="info-we-collect" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  2. Information We Collect
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>We collect <strong>Personal Information</strong>, which can identify you, and <strong>Non-Personal Information</strong>, which is aggregated or technical data that does not.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">2.1 Account and registration data</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">Name, email address, phone number (optional), company name, job title, billing address, and your password (stored only in hashed form).</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">2.2 Purchase and billing data</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">Payments are handled by PCI-DSS compliant payment processors. We do not store full card numbers or CVV codes. We may store the card’s last four digits, expiry date, billing history and GST details to manage subscriptions, prevent fraud and meet tax obligations.</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">2.3 Uploaded content</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">PDFs, documents, images, videos, 3D models, links and metadata you upload to create and publish flipbooks. You own your content. Please do not upload personal data you have no right to share.</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">2.4 Usage, device and analytics data</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">IP address, browser type and version, operating system, device type, visit timestamps, referring URLs, pages viewed, search terms, reader engagement (page turns, reading time, downloads, link clicks), approximate location derived from IP, and lead-capture details.</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
                    <p><strong>2.5 Cookies, local storage and pixels:</strong> We use cookies, browser local and session storage, and pixel tags. Details and choices are in our <Link to="/cookie-policy" className="text-[#EA7233] hover:underline font-medium">Cookie Policy</Link>.</p>
                    <p><strong>2.6 Communications:</strong> We use your email for service messages (invoices, renewals, password resets, security alerts) and, with your consent where required, for product updates and offers. You can unsubscribe from marketing at any time.</p>
                    <p><strong>2.7 3D models and AR:</strong> When you use the 3D Editor Studio, we collect and store the 3D models, textures, images and settings you upload or create. When a reader opens an AR view, the experience runs on the reader’s own phone, tablet or browser and needs their permission to use the camera and motion sensors. Camera images are processed on the reader’s device and are not uploaded to or stored by FlipiBook.</p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="legal-bases" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  3. How and Why We Use Information (Legal Bases)
                </h2>
                
                {/* Pricing Styled Table */}
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#333333] border-b border-[#222222] divide-x divide-[#444444] text-white">
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide">Purpose</th>
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[36%]">Legal Basis</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-600 font-normal">
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">Create your account, deliver, host and support the Services</td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-50 text-[#EA7233] border border-orange-200">
                              Contract / Consent
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">Process payments, issue invoices, meet tax and accounting rules</td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              Contract / Legal Obligation
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">Secure the platform, prevent fraud, spam and abuse</td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              Legitimate Interest / Legal Obligation
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">Analyse usage and improve features</td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Legitimate Interest / Consent
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">Send product news and marketing</td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Consent
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">Provide reader analytics and leads to our customers</td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              Processing on Customer Instructions
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Under the DPDP Act we process personal data for the purposes you consented to and for permitted &quot;legitimate uses&quot; defined in the Act.</p>
              </section>

              {/* Section 4 */}
              <section id="sharing-providers" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  4. Sharing and Service Providers
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p><strong>We do not sell or rent your personal data.</strong> We share it only with:</p>

                  {/* Pricing Styled Suppliers Table */}
                  <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden my-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-[#333333] border-b border-[#222222] divide-x divide-[#444444] text-white">
                            <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[28%]">Category</th>
                            <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide">Purpose</th>
                            <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[30%]">Example Providers</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600 font-normal">
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">Cloud hosting, storage &amp; CDN</td>
                            <td className="py-3 px-4 sm:px-5">Host the platform, assets, 3D files and backups</td>
                            <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">Cloudflare / AWS</span></td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">Payment processing</td>
                            <td className="py-3 px-4 sm:px-5">Take payments, prevent fraud, handle refunds and chargebacks</td>
                            <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">Razorpay / Stripe / PayPal</span></td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">Analytics &amp; session tools</td>
                            <td className="py-3 px-4 sm:px-5">Measure site and flipbook usage, debug performance</td>
                            <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">Google Analytics / Internal</span></td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">Email &amp; communications</td>
                            <td className="py-3 px-4 sm:px-5">Send transactional receipts, security alerts and service notices</td>
                            <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">SendGrid / Resend</span></td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">Customer support</td>
                            <td className="py-3 px-4 sm:px-5">Support ticket management and customer assistance</td>
                            <td className="py-3 px-4 sm:px-5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">Dedicated Support Desk</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                    <li><strong>Our business customers:</strong> reader and lead data from flipbooks they publish.</li>
                    <li><strong>Authorities:</strong> where required by law, court order or government request, or to protect rights, safety or investigate fraud.</li>
                    <li><strong>Business transfers:</strong> in a merger, acquisition or asset sale, with the same protections continuing.</li>
                  </ul>
                  <p className="text-xs text-gray-500 pt-1">If we use tools that record page interactions (such as heatmaps or session recordings), form fields that hold passwords or payment details are never recorded.</p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="international-transfers" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  5. International Transfers
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    Our Suppliers may store or process data outside India. Where we transfer personal data across borders we rely on lawful mechanisms such as contractual safeguards (for example Standard Contractual Clauses for GDPR-covered data) and we remain responsible for that data. Transfers will not be made to any country India restricts by notification.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="security-breach" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  6. Security and Breach Notification
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    We use TLS/SSL encryption in transit, encrypted storage for credentials, role-based access controls, logging and regular reviews. No system is completely secure. If a personal data breach occurs, we will notify each affected person and the Data Protection Board of India without delay, send the Board a detailed report within 72 hours, and, where required, the EU/UK supervisory authority (within 72 hours where GDPR applies) and affected Users or customers without undue delay.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="data-retention" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  7. Data Retention
                </h2>
                
                {/* Pricing Styled Table */}
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#333333] border-b border-[#222222] divide-x divide-[#444444] text-white">
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[32%]">Data Category</th>
                          <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide">Retention Schedule</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-600 font-normal">
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">Account and uploaded content</td>
                          <td className="py-3 px-4 sm:px-5">
                            While you have an active paid plan or trial; deleted or anonymised within <strong>30 days</strong> of account deletion, or <strong>90 days</strong> after your subscription or trial ends if you do not renew.
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">Billing and tax records</td>
                          <td className="py-3 px-4 sm:px-5">
                            As required by Indian law (generally up to <strong>8 years</strong>).
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">Server and security logs</td>
                          <td className="py-3 px-4 sm:px-5">
                            At least <strong>12 months</strong> (the DPDP Rules require logs to be kept for breach detection), then deleted.
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">Reader analytics and lead data</td>
                          <td className="py-3 px-4 sm:px-5">
                            As set by the customer; deleted with the customer’s account.
                          </td>
                        </tr>
                        <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                          <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">System backups</td>
                          <td className="py-3 px-4 sm:px-5">
                            Overwritten within <strong>90 days</strong>.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">We may keep data longer where needed for legal claims or to comply with law.</p>
              </section>

              {/* Section 8 */}
              <section id="your-rights" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  8. Your Rights
                </h2>
                <div className="space-y-3 text-gray-600 text-xs sm:text-sm">
                  <p>Depending on where you live, you may have the right to:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>access your personal data and get a summary of how it is processed;</li>
                    <li>correct or update inaccurate data;</li>
                    <li>erase your data;</li>
                    <li>withdraw consent at any time (this does not affect earlier lawful processing);</li>
                    <li>port your data (GDPR);</li>
                    <li>object to or restrict certain processing (GDPR);</li>
                    <li>nominate another person to exercise your rights if you die or become incapacitated (DPDP Act);</li>
                    <li>lodge a complaint with the Data Protection Board of India or your local supervisory authority.</li>
                  </ul>
                  <p className="pt-1">
                    <strong>How to use your rights:</strong> email us at <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a> or use your Account Settings. We will verify your identity and respond within <strong>30 days</strong> (or sooner where the law requires).
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section id="grievance-redressal" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  9. Grievance Redressal
                </h2>
                <p className="text-gray-600 mb-3 text-xs sm:text-sm">
                  If you have a complaint about how we handle your personal data, contact our Grievance Officer:
                </p>
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200/80 text-xs sm:text-sm space-y-1.5 text-gray-700">
                  <p className="font-semibold text-gray-900">Grievance Officer — FlipiBook</p>
                  <p>Email: <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a></p>
                  <p>Phone: <a href="tel:+917530025147" className="text-[#EA7233] hover:underline font-medium">+91 75300 25147</a></p>
                  <p>Address: Fisto Tech Private Limited, Coimbatore, Tamil Nadu, India</p>
                  <p className="text-xs text-gray-500 pt-1">We will acknowledge your complaint within <strong>48 hours</strong> and aim to resolve it within <strong>30 days</strong>. If you are not satisfied, you may approach the Data Protection Board of India.</p>
                </div>
              </section>

              {/* Section 10 */}
              <section id="children" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  10. Children
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  FlipiBook is a business service intended for people aged <strong>18 and over</strong>. We do not knowingly collect personal data of children. If we learn that we have, we will delete it promptly. Under Indian law, processing a child’s data requires verifiable parental consent.
                </p>
              </section>

              {/* Section 11 */}
              <section id="dnt-changes" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  11. Do Not Track and Changes to This Policy
                </h2>
                <div className="space-y-3 text-gray-600 text-xs sm:text-sm">
                  <p><strong>Do Not Track:</strong> our Site does not currently respond to browser Do Not Track signals, but you can control cookies as described in our Cookie Policy.</p>
                  <p><strong>Changes:</strong> we may update this Policy. For material changes we will notify registered Users by email or in-app notice before they take effect. The &quot;Last updated&quot; date shows the latest version.</p>
                </div>
              </section>

              {/* Section 12 */}
              <section id="contact" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  12. Contact Us
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
