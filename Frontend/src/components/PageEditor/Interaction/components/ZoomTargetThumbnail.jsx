import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export const ZoomTargetThumbnail = ({ targetId }) => {
  const [svgContent, setSvgContent] = useState(null);
  const [viewBox, setViewBox] = useState("0 0 100 100");
  const editorDoc =
    document.getElementById("main-flipbook-editor")?.contentDocument ||
    document;

  useEffect(() => {
    if (!targetId || !editorDoc) return;

    const updateThumb = () => {
      const el = editorDoc.getElementById(targetId);
      if (el) {
        const pageSvg = el.closest("svg");

        let localBox = { x: 0, y: 0, width: 100, height: 100 };
        let absBox = { x: 0, y: 0, width: 100, height: 100 };

        try {
          if (typeof el.getBBox === "function") {
            localBox = el.getBBox();
          } else {
            const rect = el.getBoundingClientRect();
            localBox = {
              x: 0,
              y: 0,
              width: rect.width || 100,
              height: rect.height || 100,
            };
          }
        } catch {}

        if (pageSvg && typeof pageSvg.createSVGPoint === "function") {
          try {
            const elRect = el.getBoundingClientRect();
            const ctm = pageSvg.getScreenCTM();
            if (ctm) {
              const inverseCtm = ctm.inverse();
              const pt1 = pageSvg.createSVGPoint();
              pt1.x = elRect.left;
              pt1.y = elRect.top;
              const svgPt1 = pt1.matrixTransform(inverseCtm);

              const pt2 = pageSvg.createSVGPoint();
              pt2.x = elRect.right;
              pt2.y = elRect.bottom;
              const svgPt2 = pt2.matrixTransform(inverseCtm);

              absBox = {
                x: svgPt1.x,
                y: svgPt1.y,
                width: svgPt2.x - svgPt1.x,
                height: svgPt2.y - svgPt1.y,
              };
            } else {
              absBox = localBox;
            }
          } catch {
            absBox = localBox;
          }
        } else {
          absBox = localBox;
        }

        const padding = 10;
        const isFreeFrame =
          el.getAttribute("data-name")?.toLowerCase() === "free frame" ||
          el.getAttribute("data-type") === "free-frame";

        if (isFreeFrame && pageSvg) {
          const framePadding = 0;
          const viewBoxStr = `${absBox.x - framePadding} ${absBox.y - framePadding} ${absBox.width + framePadding * 2} ${absBox.height + framePadding * 2}`;
          setViewBox(viewBoxStr);

          // For Free Frames, capture the exact area underneath it by cloning the parent SVG
          const clone = pageSvg.cloneNode(true);
          const frameInClone =
            clone.getElementById(targetId) ||
            clone.querySelector(`[id="${targetId}"]`);
          if (frameInClone) frameInClone.style.display = "none"; // hide the dashed box itself

          // Scale up the intrinsic size so it expands to fill the preview container
          const ratio = absBox.height / absBox.width;
          clone.setAttribute("width", "10000");
          clone.setAttribute("height", String(10000 * ratio));
          clone.setAttribute("viewBox", viewBoxStr);
          clone.setAttribute("preserveAspectRatio", "xMidYMid meet");

          clone.style.width = "auto"; // allow max-width/max-height to scale it proportionally
          clone.style.height = "auto";
          clone.style.maxWidth = "100%";
          clone.style.maxHeight = "100%";
          clone.style.overflow = "hidden";

          setSvgContent(clone.outerHTML);
        } else {
          const viewBoxStr = `${localBox.x - padding} ${localBox.y - padding} ${localBox.width + padding * 2} ${localBox.height + padding * 2}`;
          setViewBox(viewBoxStr);

          // For normal elements, isolate and display the element directly (worked perfectly before)
          const clone = el.cloneNode(true);
          if (clone.style) {
            clone.style.display = "block";
            clone.style.opacity = "1";
            clone.style.visibility = "visible";
            clone.style.transform = "none";
          }
          if (typeof clone.removeAttribute === "function")
            clone.removeAttribute("transform");

          let finalHTML = clone.outerHTML;
          const isSVG =
            el instanceof SVGElement ||
            el.tagName.toLowerCase() === "svg" ||
            el.tagName.toLowerCase() === "g" ||
            el.tagName.toLowerCase() === "image";
          if (!isSVG) {
            finalHTML = `<foreignObject x="${localBox.x}" y="${localBox.y}" width="${localBox.width}" height="${localBox.height}">${clone.outerHTML}</foreignObject>`;
          }
          setSvgContent(finalHTML);
        }
      } else {
        setSvgContent(null);
      }
    };

    updateThumb();

    let timeoutId;
    const handleUpdate = (e) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (
          !e.detail ||
          e.detail.elementId === targetId ||
          e.type === "canvas-updated"
        ) {
          updateThumb();
        }
      }, 300);
    };

    window.addEventListener("update-interaction-badge", handleUpdate);
    window.addEventListener("canvas-updated", handleUpdate);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("update-interaction-badge", handleUpdate);
      window.removeEventListener("canvas-updated", handleUpdate);
    };
  }, [targetId, editorDoc]);

  if (!svgContent) {
    return (
      <div className="w-full h-[22vh] rounded-[0.6vw] bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm animate-pulse">
        <Icon icon="tabler:photo" className="text-gray-400 text-[2vw]" />
      </div>
    );
  }

  const isFullSvg = svgContent.trim().toLowerCase().startsWith("<svg");

  return (
    <div className="w-full h-[22vh] rounded-[0.6vw] bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden p-[0.4vw]">
      {isFullSvg ? (
        <div
          className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain [&>svg]:overflow-hidden"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="max-w-full max-h-full object-contain overflow-hidden"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
};
