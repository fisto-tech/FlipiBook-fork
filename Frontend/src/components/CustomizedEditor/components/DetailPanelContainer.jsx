import React from "react";
import {
  BackgroundPanel,
  LayoutDesignPanel,
  LayoutSettingsPanel,
  BookAppearancePanel,
  LeadFormPanel,
  VisibilityPrivacyPanel,
  AnalyticsPanel,
  BrandingPanel,
} from "../sidebar/panels";
import OtherSetup from "./OtherSetup";

const DetailPanelContainer = ({
  activeSubView,
  setActiveSubView,
  setIsPanelCollapsed,
  logoSettings,
  setLogoSettings,
  watermarkSettings,
  setWatermarkSettings,
  preloaderSettings,
  setPreloaderSettings,
  backgroundSettings,
  setBackgroundSettings,
  layoutSettings,
  setLayoutSettings,
  layoutColors,
  setLayoutColors,
  bookAppearanceSettings,
  setBookAppearanceSettings,
  menuBarSettings,
  setMenuBarSettings,
  otherSetupSettings,
  setOtherSetupSettings,
  otherSetupTarget,
  setOtherSetupTarget,
  leadFormSettings,
  setLeadFormSettings,
  visibilitySettings,
  setVisibilitySettings,
  pages,
  folder,
  bookName,
  v_id,
  setTocOpenTrigger,
  setIsLoading,
}) => {
  const handleBack = () => setIsPanelCollapsed(true);

  const renderPanel = () => {
    switch (activeSubView) {
      case "logo":
        return (
          <BrandingPanel
            type={activeSubView}
            onBack={handleBack}
            logoSettings={logoSettings}
            onUpdateLogo={(newVal) =>
              setLogoSettings((prev) => ({
                ...(prev || {}),
                ...(newVal || {}),
              }))
            }
            watermarkSettings={watermarkSettings}
            onUpdateWatermark={(newVal) =>
              setWatermarkSettings((prev) => ({
                ...(prev || {}),
                ...(newVal || {}),
              }))
            }
            preloaderSettings={preloaderSettings}
            onUpdatePreloader={(newVal) =>
              setPreloaderSettings((prev) => {
                const updated = {
                  ...(prev || {}),
                  ...(newVal || {}),
                };
                try {
                  const pStr = JSON.stringify(updated);
                  if (v_id) {
                    sessionStorage.setItem(`flipibook_preloader_${v_id}`, pStr);
                    localStorage.setItem(`flipibook_preloader_${v_id}`, pStr);
                    localStorage.setItem(`customized_editor_branding_${v_id}`, JSON.stringify({ preloader: updated, preloaderSettings: updated, Branding: { preloaderSettings: updated } }));
                  }
                } catch (e) {}
                return updated;
              })
            }
            folder={folder}
            flipbookName={bookName}
            v_id={v_id}
            onPreviewPreloader={() => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
              }, 3000);
            }}
          />
        );

      case "background":
        return (
          <BackgroundPanel
            onBack={handleBack}
            backgroundSettings={backgroundSettings}
            onUpdateBackground={setBackgroundSettings}
            folder={folder}
            flipbookName={bookName}
            v_id={v_id}
          />
        );

      case "layout":
        return (
          <LayoutDesignPanel
            onBack={handleBack}
            activeLayout={layoutSettings}
            onUpdateLayout={setLayoutSettings}
            layoutColors={layoutColors}
            onUpdateLayoutColors={setLayoutColors}
            onTocSettingsClick={() => setTocOpenTrigger((prev) => prev + 1)}
          />
        );

      case "bookappearance":
        return (
          <BookAppearancePanel
            onBack={handleBack}
            bookAppearanceSettings={bookAppearanceSettings}
            onUpdateBookAppearance={setBookAppearanceSettings}
            pages={pages}
            folder={folder}
            flipbookName={bookName}
            v_id={v_id}
          />
        );

      case "menubar":
        return (
          <LayoutSettingsPanel
            onBack={handleBack}
            settings={menuBarSettings}
            onUpdate={setMenuBarSettings}
            otherSettings={otherSetupSettings}
            onUpdateOther={setOtherSetupSettings}
            bookAppearanceSettings={bookAppearanceSettings}
            pages={pages}
            folderName={folder}
            bookName={bookName}
            activeLayout={layoutSettings}
            onNavigateToOtherSetup={(target) => {
              setActiveSubView("othersetup");
              setOtherSetupTarget(target);
            }}
            onTocSettingsClick={() => setTocOpenTrigger((prev) => prev + 1)}
          />
        );

      case "othersetup":
        return (
          <OtherSetup
            onBack={handleBack}
            settings={otherSetupSettings}
            onUpdate={setOtherSetupSettings}
            bookAppearanceSettings={bookAppearanceSettings}
            folderName={folder}
            bookName={v_id || bookName}
            pages={pages}
            targetAccordion={otherSetupTarget}
          />
        );

      case "leadform":
        return (
          <LeadFormPanel
            onBack={handleBack}
            settings={leadFormSettings}
            onUpdate={setLeadFormSettings}
            pages={pages}
          />
        );

      case "visibility":
        return (
          <VisibilityPrivacyPanel
            onBack={handleBack}
            settings={visibilitySettings}
            onUpdate={setVisibilitySettings}
            bookName={bookName}
            v_id={v_id}
            folder={folder}
          />
        );

      case "statistic":
        return <AnalyticsPanel onBack={handleBack} />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-visible">
      {renderPanel()}
    </div>
  );
};

export default DetailPanelContainer;
