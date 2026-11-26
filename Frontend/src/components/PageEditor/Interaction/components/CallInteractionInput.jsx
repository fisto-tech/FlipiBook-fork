import { Icon } from "@iconify/react";
import PhoneInputModule from "react-phone-input-2";
import React, { useEffect, useRef, useState } from "react";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";
import "react-phone-input-2/lib/style.css";

const PhoneInput = PhoneInputModule?.default || PhoneInputModule;

export const CallInteractionInput = ({ initialValue, onSave, isWhatsApp }) => {
  const defaultCountry = "in";
  const defaultDialCode = "91";

  const parsedInitial = React.useMemo(() => {
    if (!initialValue)
      return {
        country: defaultCountry,
        nationalNumber: "",
        dialCode: defaultDialCode,
      };
    const str = initialValue.startsWith("+")
      ? initialValue
      : "+" + initialValue;
    try {
      const phoneNumber = parsePhoneNumberFromString(str);
      if (phoneNumber && phoneNumber.country) {
        return {
          country: phoneNumber.country.toLowerCase(),
          nationalNumber: phoneNumber.nationalNumber,
          dialCode: phoneNumber.countryCallingCode,
        };
      }
    } catch {}
    return {
      country: defaultCountry,
      nationalNumber: "",
      dialCode: defaultDialCode,
    };
  }, [initialValue]);

  const [localValue, setLocalValue] = useState(parsedInitial.nationalNumber);
  const [selectedCountry, setSelectedCountry] = useState(parsedInitial.country);
  const [dialCode, setDialCode] = useState(parsedInitial.dialCode);
  const [isSaved, setIsSaved] = useState(true);
  const containerRef = useRef(null);

  let isInvalid = false;
  let hasDigits = false;

  hasDigits = localValue.trim().length > 0;
  if (hasDigits) {
    try {
      isInvalid = !isValidPhoneNumber(
        localValue,
        selectedCountry.toUpperCase(),
      );
    } catch {
      isInvalid = true;
    }
  }

  const isValidAndFilled = hasDigits && !isInvalid;
  const isUnsavedValid = isValidAndFilled && !isSaved;

  const textColor = isInvalid ? "#EF4444" : "#374151";
  const borderColor = isUnsavedValid
    ? "#22C55E"
    : isInvalid
      ? "#EF4444"
      : "#D1D5DB";
  const bgColor = isUnsavedValid
    ? "#F0FDF4"
    : isInvalid
      ? "#FEF2F2"
      : "#F3F4F6";

  useEffect(() => {
    if (initialValue) {
      const str = initialValue.startsWith("+")
        ? initialValue
        : "+" + initialValue;
      try {
        const phoneNumber = parsePhoneNumberFromString(str);
        if (phoneNumber && phoneNumber.country) {
          setSelectedCountry(phoneNumber.country.toLowerCase());
          setLocalValue(phoneNumber.nationalNumber);
          setDialCode(phoneNumber.countryCallingCode);
        }
      } catch {}
    } else {
      setLocalValue("");
      setSelectedCountry(defaultCountry);
      setDialCode(defaultDialCode);
    }
    setIsSaved(true);
  }, [initialValue]);

  useEffect(() => {
    if (!containerRef.current) return;

    const removeTitle = () => {
      if (!containerRef.current) return;
      const flags = containerRef.current.querySelectorAll(".selected-flag");
      flags.forEach((el) => {
        if (el.hasAttribute("title")) {
          el.removeAttribute("title");
        }
      });
    };

    removeTitle();

    const observer = new MutationObserver(() => {
      removeTitle();
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["title"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <style>{`
        .react-tel-input .flag-dropdown .selected-flag,
        .react-tel-input .flag-dropdown:hover .selected-flag,
        .react-tel-input .flag-dropdown.open-dropdown .selected-flag,
        .react-tel-input .flag-dropdown:focus .selected-flag {
          background-color: transparent !important;
          width: 100% !important;
          justify-content: center !important;
        }
        .react-tel-input .country-list .country {
          padding: 0.6vw 0.6vw 0.6vw 2.6vw !important;
        }
        .react-tel-input .country-list .flag {
          left: 0.8vw !important;
          margin-top: 0.2vw !important;
        }
        .react-tel-input .country-list {
          margin: 0 !important;
          left: 0 !important;
          transform: none !important;
          top: 100% !important;
          bottom: auto !important;
          margin-top: 0.2vw !important;
          z-index: 99999 !important;
        }
      `}</style>
      <PhoneInput
        country={selectedCountry}
        preferredCountries={["in", "us", "gb"]}
        disableCountryGuess={true}
        value={"+" + dialCode + localValue}
        onChange={(phone, data) => {
          let nationalNum = phone;
          if (data && data.dialCode && phone.startsWith(data.dialCode)) {
            nationalNum = phone.substring(data.dialCode.length);
          }
          setLocalValue(nationalNum);

          if (
            data &&
            data.countryCode &&
            data.countryCode !== selectedCountry
          ) {
            setSelectedCountry(data.countryCode);
            setDialCode(data.dialCode);
          }
          setIsSaved(false);
        }}
        onBlur={() => {
          const saveVal = "+" + dialCode + localValue;
          if (saveVal !== initialValue) {
            onSave(saveVal);
            setIsSaved(true);
          }
        }}
        placeholder="1234567890"
        containerStyle={{
          width: "100%",
          height: "100%",
        }}
        inputStyle={{
          width: "100%",
          height: "100%",
          border: `1px solid ${borderColor}`,
          borderRadius: "0.6vw",
          fontSize: "0.85vw",
          color: textColor,
          fontWeight: "500",
          paddingLeft: "3.8vw",
          backgroundColor: "#FFFFFF",
          outline: "none",
          boxShadow: isUnsavedValid
            ? "0 0 0 3px rgba(34,197,94,0.15)"
            : "0 1px 2px rgba(0,0,0,0.05)",
          transition: "all 0.3s ease",
        }}
        buttonStyle={{
          backgroundColor: bgColor,
          borderTop: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
          borderLeft: `1px solid ${borderColor}`,
          borderRight: "1px solid #D1D5DB",
          borderRadius: "0.6vw 0 0 0.6vw",
          width: "3.2vw",
          height: "100%",
          top: "0",
          left: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
        }}
        dropdownStyle={{
          width: "14vw",
          maxHeight: "20vh",
          fontSize: "0.8vw",
          borderRadius: "0.6vw",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          border: "1px solid #E5E7EB",
          textAlign: "left",
          zIndex: 50,
        }}
      />
      {/* Green Checkmark inside input when valid */}
      {isValidAndFilled && (
        <div className="absolute right-[0.8vw] top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
          <div className="w-[1vw] h-[1vw] bg-[#22C55E] rounded-full flex items-center justify-center">
            <Icon
              icon="lucide:check"
              className="text-white text-[0.7vw]"
              strokeWidth="3"
            />
          </div>
        </div>
      )}
      {isInvalid && (
        <div className="absolute left-[0.2vw] -bottom-[2.5vh] text-[#EF4444] text-[0.7vw] font-normal whitespace-nowrap z-10">
          Please enter the valid number *
        </div>
      )}
      {isValidAndFilled && !isWhatsApp && (
        <div className="absolute left-[0.2vw] -bottom-[2.5vh] text-[#22C55E] text-[0.7vw] font-normal whitespace-nowrap z-10">
          Phone Number Linked
        </div>
      )}
    </div>
  );
};
