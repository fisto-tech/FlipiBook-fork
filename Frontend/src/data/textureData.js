const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL !== undefined ? import.meta.env.VITE_BACKEND_URL : '') || '';
const TEXTURE_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/textures` : '/textures';

export const textureData = [
  {
    id: "none",
    name: "None",
    category: "All",
    preview: null,
    maps: {},
  },
];

let cachedMaterials = null;

export const fetchMaterials = async () => {
  if (cachedMaterials) return cachedMaterials;
  cachedMaterials = textureData;
  return textureData;
};
