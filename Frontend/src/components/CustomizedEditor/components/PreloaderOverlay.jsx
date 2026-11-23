import React from 'react';

export const getLogoAnimationStyle = (anim) => {
  switch (anim) {
    case 'bounce':
      return { animation: 'preloaderJump 1.2s infinite ease-in-out' };
    case 'slide':
      return { animation: 'preloaderSlide 1.6s infinite ease-in-out' };
    case 'fade':
      return { animation: 'preloaderFade 1.6s infinite ease-in-out' };
    case 'pulse':
      return { animation: 'preloaderPulse 1.4s infinite ease-in-out' };
    case 'none':
    default:
      return {};
  }
};

const DEFAULT_BG = '#22252A';
const DEFAULT_TEXT = '#ffffff';
const DEFAULT_SPINNER = '#E04752';

const PreloaderOverlay = ({ isLoading, preloaderSettings, loadingProgress = 0 }) => {
  if (!isLoading || preloaderSettings?.enabled === false) return null;

  // Determine if user has set a custom preloader
  const isCustom = preloaderSettings?.isCustom === true;
  const isComplete = loadingProgress >= 100;

  // Keyframes for animations
  const keyframesStyle = (
    <style>{`
      @keyframes preloaderJump {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-16px);
        }
      }
      @keyframes preloaderSlide {
        0%, 100% {
          transform: translateX(-18px);
        }
        50% {
          transform: translateX(18px);
        }
      }
      @keyframes preloaderFade {
        0%, 100% {
          opacity: 0.25;
          transform: scale(0.96);
        }
        50% {
          opacity: 1;
          transform: scale(1.02);
        }
      }
      @keyframes preloaderPulse {
        0%, 100% {
          transform: scale(0.92);
        }
        50% {
          transform: scale(1.08);
        }
      }
    `}</style>
  );

  // 1. DEFAULT PRELOADER (Exactly like Image 1: Dark theme with centered spinner & "Preparing Flipbook...")
  if (!isCustom) {
    return (
      <div 
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 ${
          isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{
          backgroundColor: DEFAULT_BG,
          color: DEFAULT_TEXT
        }}
      >
        <div className="flex flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="relative flex flex-col items-center justify-center">
            <div 
              className="w-10 h-10 border-[2.5px] border-t-transparent rounded-full animate-spin"
              style={{ 
                borderColor: `${DEFAULT_SPINNER} ${DEFAULT_SPINNER} ${DEFAULT_SPINNER} transparent` 
              }}
            />
          </div>
          <p 
            className="font-medium text-sm tracking-wide text-center text-gray-200"
            style={{ fontFamily: 'Poppins' }}
          >
            Preparing Flipbook...
          </p>
        </div>
      </div>
    );
  }

  // 2. CUSTOM PRELOADER (When user explicitly customizes it)
  const displayOption = preloaderSettings?.displayOption || (
    preloaderSettings?.layout === 'logo-only'
      ? 'logo-only'
      : (preloaderSettings?.logo ? 'both' : 'preloader-only')
  );

  const rawText = preloaderSettings?.text;
  const displayText = (!rawText || rawText === 'Loading Modal Please Wait....')
    ? 'Preparing Flipbook...'
    : rawText;

  // RULE: when both are shown, DO NOT show animation for logo (static only!)
  const logoAnimation = displayOption === 'both' ? 'none' : (preloaderSettings?.logoAnimation || 'bounce');
  const animStyle = getLogoAnimationStyle(logoAnimation);

  const customBg = (!preloaderSettings?.bgColor || preloaderSettings.bgColor === '#D6E0F4')
    ? DEFAULT_BG
    : preloaderSettings.bgColor;
  const customColor = preloaderSettings?.textColor || DEFAULT_TEXT;
  const customSpinner = (!preloaderSettings?.spinnerColor || preloaderSettings.spinnerColor === '#3B3C8A')
    ? DEFAULT_SPINNER
    : preloaderSettings.spinnerColor;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 ${
        isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: customBg,
        color: customColor
      }}
    >
      {keyframesStyle}

      <div className="flex flex-col items-center gap-5 px-4 text-center">
        {/* OPTION A: Logo Only */}
        {displayOption === 'logo-only' ? (
          <div className="flex flex-col items-center gap-3">
            {preloaderSettings?.logo ? (
              <div className="flex items-center justify-center p-2" style={animStyle}>
                <img
                  src={preloaderSettings.logo}
                  alt="Preloader Logo"
                  className="h-[75px] max-w-[220px] object-contain drop-shadow-sm"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center p-2" style={animStyle}>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-sm">
                  <span className="text-3xl">📖</span>
                </div>
              </div>
            )}
            {preloaderSettings?.showPercentage && (
              <span
                className="font-bold text-sm tracking-wide"
                style={{
                  fontFamily: preloaderSettings?.percentageFont || 'Poppins',
                  fontSize: preloaderSettings?.percentageFontSize
                    ? `${preloaderSettings.percentageFontSize}px`
                    : undefined,
                }}
              >
                {loadingProgress}%
              </span>
            )}
          </div>
        ) : (
          /* OPTION B (Preloader Only) or OPTION C (Both: Static Logo + Preloader below) */
          <div className="flex flex-col items-center justify-center gap-4">
            {/* Show Logo ONLY if displayOption is 'both' - and with NO animation */}
            {displayOption === 'both' && preloaderSettings?.logo && (
              <div className="flex items-center justify-center">
                <img
                  src={preloaderSettings.logo}
                  alt="Preloader Logo"
                  className="h-[60px] max-w-[180px] object-contain"
                />
              </div>
            )}

            {/* Preloader Indicator (Spinner, Bar, or Dots) */}
            {preloaderSettings?.layout === 'bar' ? (
              <div className="flex flex-col items-center gap-2.5 w-[220px] max-w-[80vw]">
                <div className="w-full bg-gray-600/30 h-[6px] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-100 ease-out" 
                    style={{ 
                      width: `${loadingProgress}%`, 
                      backgroundColor: customSpinner 
                    }}
                  />
                </div>
                {preloaderSettings?.showPercentage && (
                  <span 
                    className="font-semibold text-xs"
                    style={{ 
                      fontFamily: preloaderSettings?.percentageFont || 'Poppins',
                      fontSize: preloaderSettings?.percentageFontSize
                        ? `${preloaderSettings.percentageFontSize}px`
                        : undefined
                    }}
                  >
                    {loadingProgress}%
                  </span>
                )}
              </div>
            ) : preloaderSettings?.layout === 'dots' ? (
              <div className="flex flex-col items-center gap-2 py-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full animate-bounce [animation-delay:-0.3s]"
                    style={{ backgroundColor: customSpinner }}
                  />
                  <div
                    className="w-3 h-3 rounded-full animate-bounce [animation-delay:-0.15s]"
                    style={{ backgroundColor: customSpinner }}
                  />
                  <div
                    className="w-3 h-3 rounded-full animate-bounce"
                    style={{ backgroundColor: customSpinner }}
                  />
                </div>
                {preloaderSettings?.showPercentage && (
                  <span 
                    className="font-semibold text-xs mt-1"
                    style={{ 
                      fontFamily: preloaderSettings?.percentageFont || 'Poppins',
                      fontSize: preloaderSettings?.percentageFontSize
                        ? `${preloaderSettings.percentageFontSize}px`
                        : undefined
                    }}
                  >
                    {loadingProgress}%
                  </span>
                )}
              </div>
            ) : (
              /* Default Circular Spinner: rendered strictly below logo */
              <div className="relative flex flex-col items-center justify-center">
                <div 
                  className="w-10 h-10 border-[2.5px] border-t-transparent rounded-full animate-spin"
                  style={{ 
                    borderColor: `${customSpinner} ${customSpinner} ${customSpinner} transparent` 
                  }}
                />
                {preloaderSettings?.showPercentage && (
                  <span 
                    className="font-bold text-[11px] mt-2"
                    style={{ 
                      fontFamily: preloaderSettings?.percentageFont || 'Poppins',
                      fontSize: preloaderSettings?.percentageFontSize
                        ? `${preloaderSettings.percentageFontSize}px`
                        : undefined
                    }}
                  >
                    {loadingProgress}%
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Text */}
        <p 
          className="font-medium text-sm tracking-wide text-center max-w-[320px] truncate"
          style={{ 
            fontFamily: preloaderSettings?.font || 'Poppins',
            fontSize: preloaderSettings?.fontSize ? `${preloaderSettings.fontSize}px` : undefined
          }}
        >
          {displayText}
        </p>
      </div>
    </div>
  );
};

export default PreloaderOverlay;
