import React from 'react';
import { ExternalLink, Globe, MessageCircle } from 'lucide-react';

export default function ProfileDetailsTab({ user, profile }) {
  const p = profile || {};
  const u = user || {};

  // Form values mapped dynamically from profile and user
  const fullName = p.fullName || p.name || u.name || '-';
  const displayName = p.displayName || u.displayName || u.name || '-';
  const emailAddress = p.emailAddress || p.email || u.emailId || u.email || '-';
  const profileType = p.profileType || p.accountType || u.profileType || u.accountType || 'Individual';

  const companyName = p.companyName || '-';
  const industryType = p.industryType || p.industry || '-';
  const companySize = p.companySize || p.teamSize || u.companySize || u.teamSize || '-';
  const businessEmail = p.businessEmail || p.companyEmail || '-';
  
  const rawServices = p.services || p.skills || u.services || [];
  const servicesList = Array.isArray(rawServices) && rawServices.length > 0
    ? rawServices
    : (typeof rawServices === 'string' && rawServices.trim() ? [rawServices] : []);
    
  const aboutBio = p.about || p.bio || '-';

  const rawPhone = p.mobile || p.phone || p.contact1 || u.mobile || '';
  const countryCode = p.countryCode || p.contact1CountryCode || '+91';
  const contactNumber = rawPhone ? `${countryCode} ${rawPhone}` : (p.contactNumber || '-');
  
  const rawAltPhone = p.alternateNumber || p.contact2 || '';
  const altCountryCode = p.contact2CountryCode || '+91';
  const alternateNumber = rawAltPhone ? `${altCountryCode} ${rawAltPhone}` : '-';

  // Construct full address from parts if full address string is not set
  const addressParts = [p.address || p.address1, p.address2].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : '-';
  const city = p.city || '-';
  const state = p.state || '-';
  const country = p.country || 'India';
  const pinCode = p.pinCode || p.pincode || p.zipCode || '-';

  const website = p.website || p.socials?.website || '-';
  const instagram = p.socials?.instagram || p.instagram || '-';
  const linkedin = p.socials?.linkedin || p.linkedin || '-';
  const facebook = p.socials?.facebook || p.facebook || '-';
  const whatsapp = p.socials?.whatsapp || p.whatsapp || '-';

  const visibility = p.visibilitySettings || p.visibility || {};
  const showProfileInExplore = visibility.showInExplore ?? visibility.showProfileInExplore ?? true;
  const showContactLocation = visibility.showContact ?? visibility.showContactLocation ?? true;
  const showSocialMediaLinks = visibility.showSocial ?? visibility.showSocialMediaLinks ?? true;

  return (
    <div className="bg-white rounded-[0.85vw] border border-gray-100/90 p-[2vw] shadow-xs space-y-[1.8vw] font-sans">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-[1.3vw] font-semibold text-gray-900 tracking-tight leading-none">Profile Details</h2>
        <p className="text-[0.9vw] text-gray-400 mt-[0.35vw] leading-tight">
          User's personal and professional information.
        </p>
      </div>

      {/* 01 Personal Information */}
      <div className="space-y-[0.8vw]">
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[1.1vw] font-semibold text-[#ec5137]">01</span>
          <h3 className="text-[1.1vw] font-semibold text-[#ec5137]">Personal Information</h3>
        </div>

        <div className="grid grid-cols-2 gap-x-[3vw] gap-y-[0.9vw]">
          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Full Name</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{fullName}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Display Name</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{displayName}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Email Address</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{emailAddress}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Profile Type</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{profileType}</span>
          </div>
        </div>
      </div>

      {/* 02 Professional Information */}
      <div className="space-y-[0.8vw]">
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[1.1vw] font-semibold text-[#ec5137]">02</span>
          <h3 className="text-[1.1vw] font-semibold text-[#ec5137]">Professional Information</h3>
        </div>

        <div className="grid grid-cols-2 gap-x-[3vw] gap-y-[0.9vw]">
          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Company Name</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{companyName}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Industry Type</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{industryType}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Company Size</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{companySize}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Business Email</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{businessEmail}</span>
          </div>
        </div>

        {/* Services / Expertise Badges */}
        <div className="pt-[0.1vw]">
          <span className="text-[0.8vw] text-gray-400 block font-semibold mb-[0.45vw]">Services / Expertise</span>
          {servicesList.length > 0 ? (
            <div className="flex flex-wrap items-center gap-[0.5vw]">
              {servicesList.map((item, idx) => (
                <span
                  key={idx}
                  className="px-[0.85vw] py-[0.3vw] rounded-full text-[0.8vw] font-semibold text-gray-700 bg-gray-50 border border-gray-200/80 shadow-2xs"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[0.9vw] font-semibold text-gray-500 block">-</span>
          )}
        </div>

        {/* About / Bio */}
        <div className="pt-[0.1vw]">
          <span className="text-[0.8vw] text-gray-400 block font-semibold mb-[0.3vw]">About / Bio</span>
          <p className="text-[0.9vw] text-gray-800 leading-relaxed font-semibold">
            {aboutBio}
          </p>
        </div>
      </div>

      {/* 03 Contact & Location */}
      <div className="space-y-[0.8vw]">
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[1.1vw] font-semibold text-[#ec5137]">03</span>
          <h3 className="text-[1.1vw] font-semibold text-[#ec5137]">Contact & Location</h3>
        </div>

        <div className="grid grid-cols-2 gap-x-[3vw] gap-y-[0.9vw]">
          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Contact Number</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{contactNumber}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Alternate Number</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{alternateNumber}</span>
          </div>

          <div className="col-span-2">
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Address</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{address}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">City</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{city}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">State</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{state}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Country</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{country}</span>
          </div>

          <div>
            <span className="text-[0.8vw] text-gray-400 block font-semibold">Pin Code</span>
            <span className="text-[0.9vw] font-semibold text-gray-900 block mt-[0.2vw]">{pinCode}</span>
          </div>
        </div>
      </div>

      {/* 04 Social Media & Links */}
      <div className="space-y-[0.8vw]">
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[1.1vw] font-semibold text-[#ec5137]">04</span>
          <h3 className="text-[1.1vw] font-semibold text-[#ec5137]">Social Media & Links</h3>
        </div>

        <div className="space-y-[1vw]">
          {/* Website */}
          <div className="flex items-center justify-between py-[0.2vw]">
            <div className="flex items-center gap-[0.8vw]">
              <div className="text-gray-500">
                <Globe size="1.1vw" strokeWidth={1.8} />
              </div>
              <div>
                <span className="text-[0.8vw] text-gray-400 block font-semibold">Website</span>
                <span className="text-[0.9vw] font-semibold text-gray-900 block">{website}</span>
              </div>
            </div>
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <ExternalLink size="1.05vw" />
            </a>
          </div>

          {/* Instagram */}
          <div className="flex items-center justify-between py-[0.2vw]">
            <div className="flex items-center gap-[0.8vw]">
              <div className="text-gray-500">
                <svg viewBox="0 0 24 24" width="1.1vw" height="1.1vw" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <div>
                <span className="text-[0.8vw] text-gray-400 block font-semibold">Instagram</span>
                <span className="text-[0.9vw] font-semibold text-gray-900 block">{instagram}</span>
              </div>
            </div>
            <a
              href={instagram.startsWith('http') ? instagram : `https://${instagram}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <ExternalLink size="1.05vw" />
            </a>
          </div>

          {/* LinkedIn */}
          <div className="flex items-center justify-between py-[0.2vw]">
            <div className="flex items-center gap-[0.8vw]">
              <div className="text-gray-500">
                <svg viewBox="0 0 24 24" width="1.1vw" height="1.1vw" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </div>
              <div>
                <span className="text-[0.8vw] text-gray-400 block font-semibold">LinkedIn</span>
                <span className="text-[0.9vw] font-semibold text-gray-900 block">{linkedin}</span>
              </div>
            </div>
            <a
              href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <ExternalLink size="1.05vw" />
            </a>
          </div>

          {/* Facebook */}
          <div className="flex items-center justify-between py-[0.2vw]">
            <div className="flex items-center gap-[0.8vw]">
              <div className="text-gray-500">
                <svg viewBox="0 0 24 24" width="1.1vw" height="1.1vw" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </div>
              <div>
                <span className="text-[0.8vw] text-gray-400 block font-semibold">Facebook</span>
                <span className="text-[0.9vw] font-semibold text-gray-900 block">{facebook}</span>
              </div>
            </div>
            <a
              href={facebook.startsWith('http') ? facebook : `https://${facebook}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <ExternalLink size="1.05vw" />
            </a>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between py-[0.2vw]">
            <div className="flex items-center gap-[0.8vw]">
              <div className="text-gray-500">
                <MessageCircle size="1.1vw" strokeWidth={1.8} />
              </div>
              <div>
                <span className="text-[0.8vw] text-gray-400 block font-semibold">WhatsApp</span>
                <span className="text-[0.9vw] font-semibold text-gray-900 block">{whatsapp}</span>
              </div>
            </div>
            <a
              href={whatsapp.startsWith('http') ? whatsapp : '#'}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <ExternalLink size="1.05vw" />
            </a>
          </div>
        </div>
      </div>

      {/* 05 Profile Visibility */}
      <div className="space-y-[0.8vw]">
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[1.1vw] font-semibold text-[#ec5137]">05</span>
          <h3 className="text-[1.1vw] font-semibold text-[#ec5137]">Profile Visibility</h3>
        </div>

        <div className="space-y-[1vw]">
          {/* Show Profile in Explore */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[0.9vw] font-semibold text-gray-900 block">Show Profile in Explore</span>
              <span className="text-[0.8vw] text-gray-400 block mt-[0.05vw]">Public profile visibility</span>
            </div>
            <span className="px-[0.85vw] py-[0.3vw] rounded-[0.4vw] text-[0.8vw] font-semibold text-[#16a34a] bg-[#dcfce7]/80">
              {showProfileInExplore ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          {/* Contact & Location */}
          <div className="flex items-center justify-between">
            <span className="text-[0.9vw] font-semibold text-gray-800">Contact & Location</span>
            <span className="px-[0.85vw] py-[0.3vw] rounded-[0.4vw] text-[0.8vw] font-semibold text-[#16a34a] bg-[#dcfce7]/80">
              {showContactLocation ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center justify-between">
            <span className="text-[0.9vw] font-semibold text-gray-800">Social Media Links</span>
            <span className="px-[0.85vw] py-[0.3vw] rounded-[0.4vw] text-[0.8vw] font-semibold text-[#16a34a] bg-[#dcfce7]/80">
              {showSocialMediaLinks ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
