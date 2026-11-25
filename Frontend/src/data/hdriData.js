const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL !== undefined ? import.meta.env.VITE_BACKEND_URL : '') || '';

// Empty array for backward compatibility imports
export const builtInHdris = [];

let cachedHdris = null;

export const getRegisteredHdris = () => {
  return cachedHdris || [];
};

export const fetchHdris = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/presets/hdri`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.hdris)) {
        cachedHdris = data.hdris;
        return data.hdris;
      }
    }
  } catch (err) {
    console.error("Failed to fetch HDRIs from backend API:", err);
  }
  cachedHdris = [];
  return [];
};
