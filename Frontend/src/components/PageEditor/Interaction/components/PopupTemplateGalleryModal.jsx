import PopupTemplateSelection, { TEMPLATES } from "../PopupTemplateSelection";

/** Popup template selection gallery modal. */
const PopupTemplateGalleryModal = ({
  activePageIndex,
  activeTemplateSelectionId,
  interactiveElementsList,
  itemValueOverrides,
  onCustomizePopup,
  setActiveTemplateSelectionId,
  setItemValueOverrides,
  setPopupCustomHtmlOverrides,
  updateElementAttribute,
}) => (
  <PopupTemplateSelection
    isOpen={activeTemplateSelectionId !== null}
    onClose={() => setActiveTemplateSelectionId(null)}
    onCustomize={(templateId) => {
      if (onCustomizePopup) {
        onCustomizePopup(
          templateId,
          activeTemplateSelectionId,
          activePageIndex,
        );
      }
      setActiveTemplateSelectionId(null);
    }}
    onSelect={async (templateId) => {
      if (updateElementAttribute && activeTemplateSelectionId) {
        setItemValueOverrides((prev) => ({
          ...prev,
          [activeTemplateSelectionId]: templateId,
        }));

        let fallbackHtml = "";
        const template = TEMPLATES.find((t) => t.id === templateId);
        if (template && template.image) {
          try {
            const res = await fetch(template.image);
            if (res.ok) {
              fallbackHtml = await res.text();
            }
          } catch {}
        }
        if (!fallbackHtml) {
          fallbackHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
            <g id="layer-1" data-name="Background"><rect width="100%" height="100%" fill="#ffffff" rx="16" /></g>
            <g id="layer-2" data-name="Content"><text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="#333">Popup Template</text></g>
          </svg>`;
        }

        setPopupCustomHtmlOverrides((prev) => ({
          ...prev,
          [activeTemplateSelectionId]: fallbackHtml,
        }));

        updateElementAttribute(activePageIndex, activeTemplateSelectionId, {
          "data-interaction": "popup",
          "data-interaction-value": templateId,
          "data-interaction-popup-custom-html": fallbackHtml,
        });
      }
    }}
    selectedTemplateId={
      activeTemplateSelectionId
        ? itemValueOverrides[activeTemplateSelectionId] !== undefined
          ? itemValueOverrides[activeTemplateSelectionId]
          : interactiveElementsList.find(
              (item) => item.id === activeTemplateSelectionId,
            )?.value
        : ""
    }
  />
);

export default PopupTemplateGalleryModal;
