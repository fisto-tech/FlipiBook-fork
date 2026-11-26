export const getFormattedPopupSvg = (svgString) => {
  if (!svgString || typeof svgString !== "string") return "";
  try {
    const trimmed = svgString.trim();
    if (!trimmed.includes("<svg")) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg || doc.querySelector("parsererror")) {
      return trimmed;
    }
    if (!svg.getAttribute("viewBox")) {
      const w = parseFloat(svg.getAttribute("width") || 800);
      const h = parseFloat(svg.getAttribute("height") || 600);
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    }
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.maxWidth = "100%";
    svg.style.maxHeight = "100%";
    svg.style.display = "block";
    return new XMLSerializer().serializeToString(svg);
  } catch {
    return svgString;
  }
};
