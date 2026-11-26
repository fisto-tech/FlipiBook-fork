export const SOCIAL_PLATFORMS = {
  youtube: {
    name: "YouTube",
    inputLabel: "Enter your YouTube Link",
    placeholder: "https://www.youtube.com/watch?v=... or @channel",
    icon: "ri:youtube-fill",
    iconColor: "text-[#FF0000]",
    regex:
      /^(https?:\/\/)?((www|m|music)\.)?(youtube\.com(\/[^\s]*)?|youtu\.be\/[^\s]+)$/i,
    errorMessage: "Please enter a valid YouTube link *",
    successMessage: "YouTube Link Linked",
  },
  instagram: {
    name: "Instagram",
    inputLabel: "Enter your Instagram Link",
    placeholder: "https://www.instagram.com/username",
    icon: "ri:instagram-line",
    iconColor: "text-[#E1306C]",
    regex: /^(https?:\/\/)?((www)\.)?(instagram\.com|instagr\.am)(\/[^\s]*)?$/i,
    errorMessage: "Please enter a valid Instagram link *",
    successMessage: "Instagram Link Linked",
  },
  x: {
    name: "X (Twitter)",
    inputLabel: "Enter your X (Twitter) Link",
    placeholder: "https://x.com/username",
    icon: "ri:twitter-x-fill",
    iconColor: "text-black",
    regex: /^(https?:\/\/)?((www|mobile)\.)?(x\.com|twitter\.com)(\/[^\s]*)?$/i,
    errorMessage: "Please enter a valid X (Twitter) link *",
    successMessage: "X Link Linked",
  },
  facebook: {
    name: "Facebook",
    inputLabel: "Enter your Facebook Link",
    placeholder: "https://www.facebook.com/username",
    icon: "ri:facebook-fill",
    iconColor: "text-[#1877F2]",
    regex:
      /^(https?:\/\/)?((www|m|web)\.)?(facebook\.com|fb\.com|fb\.me|fb\.watch)(\/[^\s]*)?$/i,
    errorMessage: "Please enter a valid Facebook link *",
    successMessage: "Facebook Link Linked",
  },
  linkedin: {
    name: "LinkedIn",
    inputLabel: "Enter your LinkedIn Link",
    placeholder: "https://www.linkedin.com/in/username",
    icon: "ri:linkedin-fill",
    iconColor: "text-[#0A66C2]",
    regex:
      /^(https?:\/\/)?((www|mobile)\.)?(linkedin\.com|lnkd\.in)(\/[^\s]*)?$/i,
    errorMessage: "Please enter a valid LinkedIn link *",
    successMessage: "LinkedIn Link Linked",
  },
};

export const getSocialPlatform = (item, currentVal = "") => {
  const pId = (item?.presetId || "").toLowerCase();
  if (SOCIAL_PLATFORMS[pId])
    return { platformKey: pId, ...SOCIAL_PLATFORMS[pId] };
  if (pId === "twitter") return { platformKey: "x", ...SOCIAL_PLATFORMS.x };

  const name = ((item?.name || item?.label || "") + "").toLowerCase();
  if (name.includes("youtube"))
    return { platformKey: "youtube", ...SOCIAL_PLATFORMS.youtube };
  if (name.includes("instagram"))
    return { platformKey: "instagram", ...SOCIAL_PLATFORMS.instagram };
  if (name.includes("twitter") || name === "x")
    return { platformKey: "x", ...SOCIAL_PLATFORMS.x };
  if (name.includes("facebook"))
    return { platformKey: "facebook", ...SOCIAL_PLATFORMS.facebook };
  if (name.includes("linkedin"))
    return { platformKey: "linkedin", ...SOCIAL_PLATFORMS.linkedin };

  const val = (currentVal || "").trim().toLowerCase();
  if (val.includes("youtube.com") || val.includes("youtu.be"))
    return { platformKey: "youtube", ...SOCIAL_PLATFORMS.youtube };
  if (val.includes("instagram.com") || val.includes("instagr.am"))
    return { platformKey: "instagram", ...SOCIAL_PLATFORMS.instagram };
  if (val.includes("twitter.com") || val.includes("x.com"))
    return { platformKey: "x", ...SOCIAL_PLATFORMS.x };
  if (
    val.includes("facebook.com") ||
    val.includes("fb.com") ||
    val.includes("fb.watch") ||
    val.includes("fb.me")
  )
    return { platformKey: "facebook", ...SOCIAL_PLATFORMS.facebook };
  if (val.includes("linkedin.com") || val.includes("lnkd.in"))
    return { platformKey: "linkedin", ...SOCIAL_PLATFORMS.linkedin };

  return {
    platformKey: "generic",
    name: "Open Link",
    inputLabel: "Enter your link",
    placeholder: "https://maps.app.go...",
    icon: "ph:globe",
    iconColor: "text-gray-500",
    regex:
      /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i,
    errorMessage: "Please enter a valid link *",
    successMessage: "Link Linked",
  };
};
