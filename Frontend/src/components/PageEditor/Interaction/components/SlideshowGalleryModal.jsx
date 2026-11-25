import MediaGalleryPopup from "../../modals/MediaGalleryPopup";

/** Slideshow image gallery modal. */
const SlideshowGalleryModal = ({
  activePageIndex,
  activeSlideshowItem,
  isSlideshowGalleryOpen,
  itemValueOverrides,
  setActiveSlideshowItem,
  setIsSlideshowGalleryOpen,
  setItemValueOverrides,
  updateElementAttribute,
}) => (
  <MediaGalleryPopup
    isOpen={isSlideshowGalleryOpen}
    onClose={() => {
      setIsSlideshowGalleryOpen(false);
      setActiveSlideshowItem(null);
    }}
    imageOnly={true}
    initialGalleryType="Image Gallery"
    onFileSelect={async (file, asset) => {
      if (!activeSlideshowItem) return;
      const currentItem = activeSlideshowItem;
      setIsSlideshowGalleryOpen(false);
      setActiveSlideshowItem(null);

      let currentImages = [];
      if (Array.isArray(currentItem.currentImages)) {
        currentImages = [...currentItem.currentImages];
      } else {
        const raw =
          itemValueOverrides[currentItem.id] !== undefined
            ? itemValueOverrides[currentItem.id]
            : "";
        try {
          if (raw) currentImages = JSON.parse(raw);
        } catch {}
      }

      if (currentImages.length >= 6) {
        alert("You can only add up to 6 images in slideshow.");
        return;
      }

      const addImage = (dataUrl, name) => {
        if (!dataUrl) return;
        // Deduplicate against existing images
        const isDup = currentImages.some((img) => {
          const src = typeof img === "string" ? img : img.data || img.url;
          return src === dataUrl || (name && img.name === name);
        });
        if (isDup) return;

        const updated = [
          ...currentImages,
          { name: name || "Gallery Image", data: dataUrl, url: dataUrl },
        ].slice(0, 6);
        const storedVal = JSON.stringify(updated);
        setItemValueOverrides((prev) => ({
          ...prev,
          [currentItem.id]: storedVal,
        }));
        const targetIdx =
          currentItem.pageIndex !== undefined
            ? currentItem.pageIndex
            : activePageIndex;
        if (updateElementAttribute) {
          updateElementAttribute(targetIdx, currentItem.id, {
            "data-interaction": "slideshow",
            "data-interaction-value": storedVal,
          });
        }
      };

      if (asset && (asset.url || asset.rawUrl)) {
        addImage(asset.url || asset.rawUrl, asset.name);
      } else if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          addImage(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
      }
    }}
  />
);

export default SlideshowGalleryModal;
