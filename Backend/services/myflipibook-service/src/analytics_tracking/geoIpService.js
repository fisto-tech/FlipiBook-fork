// Backend/services/myflipibook-service/src/analytics_tracking/geoIpService.js
let geoip = null;
try {
  geoip = require("geoip-lite");
} catch (e) {
  // geoip-lite optional fallback
}

const countryNameMap = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  SG: "Singapore",
  AE: "United Arab Emirates",
  JP: "Japan",
  NL: "Netherlands",
  BR: "Brazil",
  IT: "Italy",
  ES: "Spain",
  ID: "Indonesia",
  MY: "Malaysia",
  SA: "Saudi Arabia",
  ZA: "South Africa",
  KR: "South Korea",
  MX: "Mexico"
};

// State mapping for India (ISO 3166-2:IN codes to full state names)
const indiaStates = {
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CT: "Chhattisgarh",
  CG: "Chhattisgarh",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OR: "Odisha",
  OD: "Odisha",
  PB: "Punjab",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TS: "Telangana",
  TG: "Telangana",
  TR: "Tripura",
  UT: "Uttarakhand",
  UK: "Uttarakhand",
  UP: "Uttar Pradesh",
  WB: "West Bengal",
  AN: "Andaman and Nicobar",
  CH: "Chandigarh",
  DH: "Dadra and Nagar Haveli",
  DD: "Daman and Diu",
  DL: "Delhi",
  JK: "Jammu and Kashmir",
  LA: "Ladakh",
  LD: "Lakshadweep",
  PY: "Puducherry"
};

// State mapping for United States (2-letter postal codes)
const usStates = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia"
};

// Canada Provinces
const canadaProvinces = {
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland and Labrador", NS: "Nova Scotia", ON: "Ontario",
  PE: "Prince Edward Island", QC: "Quebec", SK: "Saskatchewan",
  NT: "Northwest Territories", NU: "Nunavut", YT: "Yukon"
};

// Australia States
const australiaStates = {
  NSW: "New South Wales", QLD: "Queensland", SA: "South Australia",
  TAS: "Tasmania", VIC: "Victoria", WA: "Western Australia",
  ACT: "Australian Capital Territory", NT: "Northern Territory"
};

/**
 * Resolve 2-letter region code into human-friendly full State/Province name
 */
const resolveStateName = (countryCode = "", regionCode = "") => {
  if (!regionCode) return "";
  const code = regionCode.trim().toUpperCase();
  const country = (countryCode || "").trim().toUpperCase();

  if (country === "IN") return indiaStates[code] || code;
  if (country === "US") return usStates[code] || code;
  if (country === "CA") return canadaProvinces[code] || code;
  if (country === "AU") return australiaStates[code] || code;

  return code;
};

/**
 * Extract the true client IP address from express request
 */
const extractClientIp = (req) => {
  if (!req) return "127.0.0.1";

  // Cloudflare Header
  if (req.headers && req.headers["cf-connecting-ip"]) {
    return req.headers["cf-connecting-ip"].trim();
  }

  // X-Real-IP Header
  if (req.headers && req.headers["x-real-ip"]) {
    return req.headers["x-real-ip"].trim();
  }

  // Standard X-Forwarded-For Header (first IP in comma-separated list)
  const forwarded = req.headers && req.headers["x-forwarded-for"];
  if (forwarded) {
    const list = forwarded.split(",");
    if (list.length > 0 && list[0].trim()) {
      return list[0].trim();
    }
  }

  // Fallback to socket remoteAddress
  let ip = req.socket?.remoteAddress || req.connection?.remoteAddress || "127.0.0.1";
  
  // Normalize IPv6 mapped IPv4 addresses (e.g. ::ffff:192.168.1.1)
  if (typeof ip === 'string' && ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  return ip;
};

/**
 * Check if an IP address is a private / local loopback address
 */
const isPrivateOrLocalIp = (ip) => {
  if (!ip) return true;
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
  );
};

// Map timezone to approximate real country/state when request IP is local or behind proxy
const timezoneLocationMap = {
  "Asia/Calcutta": { country: "India", countryCode: "IN", state: "Tamil Nadu", city: "Chennai" },
  "Asia/Kolkata": { country: "India", countryCode: "IN", state: "Tamil Nadu", city: "Chennai" },
  "America/New_York": { country: "United States", countryCode: "US", state: "New York", city: "New York" },
  "America/Los_Angeles": { country: "United States", countryCode: "US", state: "California", city: "Los Angeles" },
  "America/Chicago": { country: "United States", countryCode: "US", state: "Illinois", city: "Chicago" },
  "Europe/London": { country: "United Kingdom", countryCode: "GB", state: "England", city: "London" },
  "Europe/Paris": { country: "France", countryCode: "FR", state: "Île-de-France", city: "Paris" },
  "Europe/Berlin": { country: "Germany", countryCode: "DE", state: "Berlin", city: "Berlin" },
  "Asia/Singapore": { country: "Singapore", countryCode: "SG", state: "Singapore", city: "Singapore" },
  "Asia/Dubai": { country: "United Arab Emirates", countryCode: "AE", state: "Dubai", city: "Dubai" },
  "Australia/Sydney": { country: "Australia", countryCode: "AU", state: "New South Wales", city: "Sydney" },
  "America/Toronto": { country: "Canada", countryCode: "CA", state: "Ontario", city: "Toronto" },
  "Asia/Tokyo": { country: "Japan", countryCode: "JP", state: "Tokyo", city: "Tokyo" }
};

/**
 * Resolve IP into Geographic Information using local GeoIP database (Country, State, City)
 */
const resolveIpLocation = (ip, clientTimezone = "") => {
  const tz = clientTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const tzMatch = timezoneLocationMap[tz] || (tz.startsWith("Asia/") && tz.includes("Calcutta") ? timezoneLocationMap["Asia/Calcutta"] : null) || {
    country: "India",
    countryCode: "IN",
    state: "Tamil Nadu",
    city: "Chennai"
  };

  if (!ip || isPrivateOrLocalIp(ip)) {
    return {
      ip: ip || "127.0.0.1",
      country: tzMatch.country,
      countryCode: tzMatch.countryCode,
      state: tzMatch.state,
      region: tzMatch.countryCode,
      city: tzMatch.city,
      timezone: tz,
      latitude: 0,
      longitude: 0
    };
  }

  if (!geoip) {
    return {
      ip,
      country: tzMatch.country || "Unknown",
      countryCode: tzMatch.countryCode || "UN",
      state: tzMatch.state || "Unknown",
      region: "",
      city: tzMatch.city || "Unknown",
      timezone: tz,
      latitude: 0,
      longitude: 0
    };
  }

  try {
    const geo = geoip.lookup(ip);
    if (!geo) {
      return {
        ip,
        country: tzMatch.country || "Unknown",
        countryCode: tzMatch.countryCode || "UN",
        state: tzMatch.state || "Unknown",
        region: "",
        city: tzMatch.city || "Unknown",
        timezone: tz,
        latitude: 0,
        longitude: 0
      };
    }

    const countryCode = geo.country || "UN";
    let countryName = countryNameMap[countryCode];
    if (!countryName) {
      try {
        const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
        countryName = regionNames.of(countryCode) || countryCode;
      } catch (e) {
        countryName = countryCode;
      }
    }
    const regionCode = geo.region || "";
    const stateName = resolveStateName(countryCode, regionCode) || regionCode || "Unknown";

    return {
      ip,
      country: countryName,
      countryCode: countryCode,
      state: stateName,
      region: regionCode,
      city: geo.city || "Unknown",
      timezone: geo.timezone || tz,
      latitude: geo.ll && geo.ll[0] ? geo.ll[0] : 0,
      longitude: geo.ll && geo.ll[1] ? geo.ll[1] : 0
    };
  } catch (err) {
    console.error("[GeoIP Lookup Error]:", err.message);
    return {
      ip,
      country: tzMatch.country || "India",
      countryCode: tzMatch.countryCode || "IN",
      state: tzMatch.state || "Tamil Nadu",
      region: "",
      city: tzMatch.city || "Chennai",
      timezone: tz,
      latitude: 0,
      longitude: 0
    };
  }
};

module.exports = {
  countryNameMap,
  indiaStates,
  usStates,
  canadaProvinces,
  australiaStates,
  resolveStateName,
  extractClientIp,
  isPrivateOrLocalIp,
  resolveIpLocation
};

