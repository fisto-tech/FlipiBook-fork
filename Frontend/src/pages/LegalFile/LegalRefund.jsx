import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';

export default function LegalRefund() {
  const [activeSection, setActiveSection] = useState('plans-pricing');

  const sections = [
    { id: 'plans-pricing', title: '1. Plans and Pricing' },
    { id: 'currency-taxes', title: '2. Currency and Taxes' },
    { id: 'payment-methods', title: '3. Payment Methods & Security' },
    { id: 'auto-renewal', title: '4. Subscriptions & Auto-Renewal' },
    { id: 'free-trials', title: '5. Free Trials' },
    { id: 'upgrades-downgrades', title: '6. Upgrades, Downgrades & Add-ons' },
    { id: 'cancellation', title: '7. Cancellation' },
    { id: 'refund-policy', title: '8. Refund Policy' },
    { id: 'failed-payments-deletion', title: '9. Failed Payments & 90-Day Deletion' },
    { id: 'chargebacks', title: '10. Chargebacks & Payment Disputes' },
    { id: 'price-changes', title: '11. Price and Plan Changes' },
    { id: 'invoices-records', title: '12. Invoices and Records' },
    { id: 'billing-contact', title: '13. Billing Contact & Complaints' },
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
              Payment, Billing & Refund Terms
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transparent terms governing pricing, tax, auto-renewal, cancellations, refund eligibility, and data retention after plan expiration.
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-gray-400" />
                Last updated: 19 November 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-gray-400" />
                7 min read
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
                    <p className="font-semibold text-gray-800 mb-1">Billing questions?</p>
                    <p className="text-gray-600 mb-2 leading-relaxed">Reach out to our billing and payment operations team.</p>
                    <a
                      href="mailto:info@flipibook-o.com"
                      className="inline-flex items-center gap-1 text-[#EA7233] font-medium hover:underline"
                    >
                      <span>Contact Billing</span>
                      <Icon icon="lucide:arrow-right" className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Articles */}
            <article className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 lg:p-12 shadow-xs space-y-10 leading-relaxed text-sm sm:text-base text-gray-700">
              
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-xs sm:text-sm text-gray-700">
                These Payment, Billing & Refund Terms (&quot;Payment Terms&quot;) apply to every paid plan, add-on and service bought from <strong>Fisto Tech Private Limited</strong> (&quot;FlipiBook&quot;, &quot;we&quot;). They are part of our <Link to="/terms-and-conditions" className="text-[#EA7233] hover:underline font-medium">Terms & Conditions</Link>. If the two conflict on payments or refunds, these Payment Terms prevail.
              </div>

              {/* Section 1 */}
              <section id="plans-pricing" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  1. Plans and Pricing
                </h2>
                <div className="space-y-3.5 text-gray-600 text-xs sm:text-sm">
                  <p>
                    Our current plans, prices, storage limits and features are shown on our pricing page and at checkout. The price you see at checkout is the price you pay for that billing period.
                  </p>
                  
                  {/* Pricing Styled Plans Table */}
                  <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden my-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-[#333333] border-b border-[#222222] divide-x divide-[#444444] text-white">
                            <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[24%]">Plan</th>
                            <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[20%]">Billing Period</th>
                            <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[22%]">Price (excl. tax)</th>
                            <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide">Key Features &amp; Limits</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600 font-normal">
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">
                              Free / Trial
                            </td>
                            <td className="py-3 px-4 sm:px-5 text-gray-600">Evaluation</td>
                            <td className="py-3 px-4 sm:px-5 font-bold text-gray-900">₹0</td>
                            <td className="py-3 px-4 sm:px-5 text-gray-600">Standard flipbooks, storage, basic branding</td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Starter
                              </span>
                            </td>
                            <td className="py-3 px-4 sm:px-5 text-gray-600">Monthly / Annual</td>
                            <td className="py-3 px-4 sm:px-5 font-medium text-gray-700">As shown on pricing</td>
                            <td className="py-3 px-4 sm:px-5 text-gray-600">Enhanced storage, custom branding, user seats</td>
                          </tr>
                          <tr className="bg-orange-50/15 hover:bg-orange-50/30 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-bold text-[#EA7233]">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#EA7233]"></span>
                                Professional
                              </span>
                            </td>
                            <td className="py-3 px-4 sm:px-5 text-gray-700 font-medium">Monthly / Annual</td>
                            <td className="py-3 px-4 sm:px-5 font-bold text-[#EA7233]">As shown on pricing</td>
                            <td className="py-3 px-4 sm:px-5 text-gray-700">3D Studio, AR preview, analytics, team seats</td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                Enterprise / Custom
                              </span>
                            </td>
                            <td className="py-3 px-4 sm:px-5 text-gray-600">Annual / Custom</td>
                            <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900">By Quotation</td>
                            <td className="py-3 px-4 sm:px-5 text-gray-600">Custom limits, dedicated DPA, priority SLA support</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section id="currency-taxes" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  2. Currency and Taxes
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 text-xs sm:text-sm">
                  <li>Prices are in <strong>Indian Rupees (INR)</strong> for customers in India and in <strong>USD</strong> for international customers, unless the checkout says otherwise.</li>
                  <li>Prices exclude GST and other applicable taxes, which are added at checkout. For customers in India, GST is charged at the rate in force (currently 18% for software services) and shown on your invoice. Services supplied to customers outside India may be zero-rated as an export of services where the law allows.</li>
                  <li>Indian business customers should enter a valid <strong>GSTIN</strong> at checkout to receive a GST invoice. A GSTIN cannot be added after the invoice is issued, except as the law allows.</li>
                  <li>International customers are responsible for any local taxes, duties or withholding that apply, and for bank or currency-conversion charges.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="payment-methods" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  3. Payment Methods and Security
                </h2>
                <div className="space-y-3 text-gray-600 text-xs sm:text-sm">
                  <p>
                    We accept UPI, credit and debit cards, net banking, wallets and international cards through PCI-DSS compliant payment gateways such as Razorpay, Stripe, and PayPal.
                  </p>
                  <p>
                    We do not store your full card number or CVV. Payments are processed by the gateway under its own terms and privacy policy.
                  </p>
                  <p>
                    Enterprise customers may pay by bank transfer against an invoice, with payment due within <strong>30 days</strong> of the invoice date.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id="auto-renewal" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  4. Subscriptions and Auto-Renewal
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 text-xs sm:text-sm">
                  <li>Paid plans renew automatically at the end of each billing period for the same period, at the then-current price, until you cancel.</li>
                  <li>For recurring card and UPI payments we follow the Reserve Bank of India’s (RBI) rules, which may include advance notice before a charge and additional authentication. We will email you before each renewal where the rules or your plan require it.</li>
                  <li>You can switch off auto-renewal at any time in <strong>Account Settings → Billing</strong>. Cancel before the renewal date to avoid the next charge.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="free-trials" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  5. Free Trials
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  A free trial gives limited access to paid features for the stated period. No charge is made unless you choose a paid plan before the trial ends. We may limit trials to one per person or organisation. If you do not upgrade, your account moves to the free plan and content above the free limits may become unavailable.
                </p>
              </section>

              {/* Section 6 */}
              <section id="upgrades-downgrades" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  6. Upgrades, Downgrades and Add-ons
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 text-xs sm:text-sm">
                  <li><strong>Upgrade:</strong> takes effect immediately. We charge the price difference for the rest of your current period, calculated pro rata.</li>
                  <li><strong>Downgrade:</strong> takes effect at the end of your current billing period. No refund or credit is given for the unused part of the higher plan.</li>
                  <li><strong>Add-ons (extra storage, extra seats, custom domain, premium support):</strong> billed with your plan and renewed with it unless you remove them.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section id="cancellation" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  7. Cancellation
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  You may cancel at any time. Cancellation stops future charges and your paid features remain until the end of the period you have already paid for. Cancelling does not by itself delete your content. After your plan ends, the data-retention rules in the Privacy Policy apply.
                </p>
              </section>

              {/* Section 8 */}
              <section id="refund-policy" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  8. Refund Policy
                </h2>
                <div className="space-y-4">
                  
                  {/* Pricing Styled Refund Matrix Table */}
                  <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-[#333333] border-b border-[#222222] divide-x divide-[#444444] text-white">
                            <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide">Situation</th>
                            <th className="py-3 px-4 sm:px-5 font-semibold text-white tracking-wide w-[38%]">Refund Eligibility</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600 font-normal">
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">
                              First-time purchase of a monthly or annual plan, requested within 7 days and with limited use
                            </td>
                            <td className="py-3 px-4 sm:px-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Full Refund (Taxes as law allows)
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">
                              Renewals, mid-term cancellations and unused time
                            </td>
                            <td className="py-3 px-4 sm:px-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                No Refund
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">
                              Downgrades and unused add-ons
                            </td>
                            <td className="py-3 px-4 sm:px-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                No Refund
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">
                              Duplicate or wrongly charged payment, or a technical billing error
                            </td>
                            <td className="py-3 px-4 sm:px-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Full Refund / Prompt Correction
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">
                              Account closed for breach of Terms (including prohibited adult content)
                            </td>
                            <td className="py-3 px-4 sm:px-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                No Refund
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">
                              Service unavailable for a long period due to our fault
                            </td>
                            <td className="py-3 px-4 sm:px-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                Pro-rata Credit or Refund
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-orange-50/20 transition-colors divide-x divide-gray-100">
                            <td className="py-3 px-4 sm:px-5 font-medium text-gray-800">
                              Enterprise or custom contracts
                            </td>
                            <td className="py-3 px-4 sm:px-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                As Stated in Signed Order Form
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-gray-600 pt-1">
                    <p><strong>How to ask:</strong> email <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a> with your registered email, invoice number and reason.</p>
                    <p><strong>Processing:</strong> approved refunds go back to the original payment method within <strong>5–10 business days</strong>. Your bank may take longer to show them.</p>
                    <p className="text-gray-500 italic">Your statutory rights under applicable consumer law are not affected.</p>
                  </div>
                </div>
              </section>

              {/* Section 9 */}
              <section id="failed-payments-deletion" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  9. Failed Payments & 90-Day Data Deletion
                </h2>
                <div className="space-y-3.5 text-gray-600 text-xs sm:text-sm">
                  <p>
                    If a payment fails, we will retry and notify you by email. If payment is not made within <strong>7 days</strong> of the due date, we may suspend paid features and move you to the free plan.
                  </p>
                  <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100 space-y-2 text-xs sm:text-sm">
                    <p className="font-semibold text-gray-900">Non-members and Data Deletion Policy</p>
                    <p>If you are not a paid FlipiBook member, your details and content will be <strong>permanently deleted 90 days</strong> after your access ends. This applies when your subscription is cancelled or expires, a payment fails, or a free trial ends without choosing a paid plan:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Day 0:</strong> your paid features stop and your account moves to the free plan or suspended status.</li>
                      <li><strong>Days 1–90:</strong> you can renew to restore everything, or log in and export your flipbooks and files.</li>
                      <li><strong>Reminders:</strong> we will email your registered address at approximately <strong>30 days, 60 days, and 7 days</strong> before permanent deletion.</li>
                      <li><strong>After Day 90:</strong> your account details, flipbooks, uploaded files, analytics and lead data are deleted or anonymised and cannot be recovered. Backups are overwritten within a further 90 days.</li>
                      <li><strong>Records we must keep:</strong> billing, invoice and tax records are kept for the period Indian law requires (up to 8 years).</li>
                      <li><strong>Earlier deletion:</strong> you can request earlier deletion at any time by emailing <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a>.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 10 */}
              <section id="chargebacks" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  10. Chargebacks and Payment Disputes
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Please contact us before raising a chargeback or bank dispute so we can fix any problem quickly. If a dispute is raised without contacting us, we may suspend the account while we investigate, and we may share transaction details with the payment gateway and bank to respond. A chargeback does not cancel the plan or your obligation to pay valid charges.
                </p>
              </section>

              {/* Section 11 */}
              <section id="price-changes" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  11. Price and Plan Changes
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  We may change prices, plans or features. We will give at least <strong>30 days’ notice</strong> by email or in-app notice before a change affects your plan. The change applies from your next renewal, and you may cancel before it takes effect.
                </p>
              </section>

              {/* Section 12 */}
              <section id="invoices-records" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  12. Invoices and Records
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Invoices are emailed after each payment and available in <strong>Account Settings → Billing</strong>. Please keep your billing name, address and GSTIN up to date. We keep billing records for the period Indian tax and accounting law requires.
                </p>
              </section>

              {/* Section 13 */}
              <section id="billing-contact" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5">
                  13. Billing Contact and Complaints
                </h2>
                <p className="text-gray-600 mb-3 text-xs sm:text-sm">
                  For billing questions or payment problems, contact:
                </p>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/70 text-xs sm:text-sm space-y-1.5 text-gray-700">
                  <p className="font-semibold text-gray-900">Fisto Tech Private Limited (FlipiBook Billing)</p>
                  <p>Email: <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a></p>
                  <p>Phone: <a href="tel:+917530025147" className="text-[#EA7233] hover:underline font-medium">+91 75300 25147</a></p>
                  <p>Address: Coimbatore, Tamil Nadu, India</p>
                  <p className="text-xs text-gray-500 pt-1">We aim to reply within 2 business days. Unresolved disputes follow the governing law and jurisdiction clause in the Terms & Conditions.</p>
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
                  <Link to="/cookie-policy" className="text-[#EA7233] hover:underline font-medium">Cookie Policy</Link>
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
