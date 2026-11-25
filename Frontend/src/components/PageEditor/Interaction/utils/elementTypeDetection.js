export function detectTypeFromElement(el, id) {
  const idNum =
    id.match(/\d+/)?.[0] || id.substring(Math.max(0, id.length - 3));
  if (!el)
    return { type: "Element", number: idNum, name: `Element ${idNum}` };

  const tagName = el.tagName.toLowerCase();
  const dataType = (el.getAttribute("data-type") || "").toLowerCase();
  const dataName = (el.getAttribute("data-name") || "").toLowerCase();
  const idLower = el.id.toLowerCase();
  const href = el.getAttribute("href") || el.getAttribute("xlink:href") || "";

  let detectedType = "Element";
  if (tagName === "g" || tagName === "svg") {
    const deepType = deepDetectType(el);
    if (deepType) {
      detectedType = deepType;
    } else {
      detectedType = "Group";
    }
  } else {
    if (
      dataType === "gif" ||
      dataName.includes("gif") ||
      idLower.includes("gif") ||
      href.toLowerCase().endsWith(".gif")
    ) {
      detectedType = "GIF";
    } else if (
      dataType === "video" ||
      tagName === "video" ||
      idLower.includes("video")
    ) {
      detectedType = "Video";
    } else if (
      dataType === "icon" ||
      dataType === "hotspot" ||
      idLower.includes("icon") ||
      idLower.includes("hotspot") ||
      el.classList?.contains("iconify")
    ) {
      detectedType = "Icon";
    } else if (
      tagName === "image" ||
      tagName === "img" ||
      dataType === "image" ||
      idLower.includes("image")
    ) {
      detectedType = "Image";
    } else if (
      tagName === "text" ||
      tagName === "tspan" ||
      dataType === "text" ||
      idLower.includes("text")
    ) {
      detectedType = "Text";
    } else if (
      tagName === "rect" ||
      tagName === "circle" ||
      tagName === "ellipse" ||
      tagName === "path" ||
      tagName === "polygon" ||
      tagName === "polyline"
    ) {
      detectedType = "Shape";
    }
  }

  return {
    type: detectedType,
    number: idNum,
    name: `${detectedType} ${idNum}`,
  };
}

// Deep recursive helper: scan all descendants for dominant type
export function deepDetectType(el) {
  if (!el) return null;
  const tag = el.tagName?.toLowerCase() || "";
  const dt = el.getAttribute("data-type") || "";
  const dn = (el.getAttribute("data-name") || "").toLowerCase();
  const id = (el.id || "").toLowerCase();
  const href =
    el.getAttribute("href") ||
    el.getAttribute("xlink:href") ||
    el.getAttribute("src") ||
    "";

  // Direct type checks on this element
  if (
    dt === "gif" ||
    dn.includes("gif") ||
    id.includes("gif") ||
    href.toLowerCase().endsWith(".gif")
  )
    return "GIF";
  if (
    dt === "video" ||
    tag === "video" ||
    tag === "iframe" ||
    dn.includes("video")
  )
    return "Video";
  if (
    dt === "icon" ||
    dt === "hotspot" ||
    dn.includes("icon") ||
    dn.includes("hotspot") ||
    el.classList?.contains("iconify")
  )
    return "Icon";
  if (
    tag === "image" ||
    tag === "img" ||
    dt === "image" ||
    dn.includes("image") ||
    id.includes("image") ||
    (href && !href.toLowerCase().endsWith(".gif"))
  )
    return "Image";
  if (
    tag === "text" ||
    tag === "tspan" ||
    dt === "text" ||
    dn.includes("text") ||
    id.includes("text")
  )
    return "Text";
  if (tag === "rect") return "Rectangle";
  if (tag === "circle") return "Circle";
  if (tag === "ellipse") return "Ellipse";
  if (tag === "path" || tag === "polygon" || tag === "polyline")
    return "Shape";
  if (tag === "line") return "Line";

  // Recurse into children — prioritize specific types over generic
  const typePriority = [
    "GIF",
    "Video",
    "Icon",
    "Image",
    "Text",
    "Rectangle",
    "Circle",
    "Ellipse",
    "Shape",
    "Line",
  ];
  let found = null;
  for (const child of Array.from(el.children || [])) {
    const childType = deepDetectType(child);
    if (childType) {
      const ci = typePriority.indexOf(childType);
      const fi = found ? typePriority.indexOf(found) : 999;
      if (ci < fi) found = childType;
    }
  }
  return found;
}
