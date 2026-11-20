const mongoose = global.mongoose || require('mongoose');
const CustomizedSettings = require('../../../../shared/models/CustomizedSettings');
const Flipbook = require('../../../../shared/models/Flipbook');
const { getDefaultSettings } = require('../utils/defaultSettings');

/**
 * Service to manage Flipbook Information & Cover Picture for customized-editor-service
 */
class BookInfoService {
  /**
   * Save or update book information and cover picture
   * @param {Object} params Request parameters
   * @param {Object} authUser Authenticated user metadata
   * @returns {Object} Updated book information and settings
   */
  async saveBookInfo(params = {}, authUser = {}) {
    const {
      v_id,
      bookName,
      newName,
      flipbookName,
      quotes,
      tagline,
      about,
      category,
      language,
      tags,
      totalPages,
      visibility,
      coverPicture,
      thumbnailUrl,
      settings
    } = params;

    const resolvedVId = v_id || params.realName || params.id;
    if (!resolvedVId) {
      throw new Error('v_id is required');
    }

    // 1. Fetch Flipbook and existing CustomizedSettings
    let flipbook = await Flipbook.findOne({ v_id: resolvedVId });
    let existingSettings = await CustomizedSettings.findOne({ v_id: resolvedVId });

    // Determine target user identity
    const targetUserID =
      authUser.customUserId ||
      authUser.userID ||
      params.userID ||
      flipbook?.userID ||
      existingSettings?.userID ||
      'default_user';

    const targetEmail =
      authUser.emailId ||
      authUser.email ||
      params.emailId ||
      flipbook?.userEmail ||
      existingSettings?.userEmail ||
      '';

    const defaults = getDefaultSettings();
    const existingObj = existingSettings
      ? (typeof existingSettings.toObject === 'function' ? existingSettings.toObject() : existingSettings)
      : {};

    const existingFlipbookInfo = existingObj.FlipbookInfo || defaults.FlipbookInfo || {};
    const existingOtherSetup = existingObj.otherSetup || {};

    // 2. Canonicalize Book Information
    const effectiveBookName = (newName || bookName || flipbookName || '').trim() || existingObj.flipbookName || flipbook?.flipbookName || '';
    const effectiveQuotes = quotes !== undefined ? String(quotes).trim() : (tagline !== undefined ? String(tagline).trim() : existingFlipbookInfo.quotes);
    const effectiveAbout = about !== undefined ? String(about).trim() : existingFlipbookInfo.about;
    const effectiveCategory = category !== undefined ? String(category).trim() : (existingFlipbookInfo.category || 'Product Based');
    const effectiveLanguage = language !== undefined ? String(language).trim() : (existingFlipbookInfo.language || 'English');
    const effectiveTags = Array.isArray(tags) ? tags : (existingFlipbookInfo.tags || []);

    // 3. Canonicalize Cover Picture
    let incomingCoverPicture = coverPicture;
    if (!incomingCoverPicture && settings?.othersetup?.coverPicture) {
      incomingCoverPicture = settings.othersetup.coverPicture;
    } else if (!incomingCoverPicture && params.meta?.coverPicture) {
      incomingCoverPicture = params.meta.coverPicture;
    }

    const currentCoverPicture = existingFlipbookInfo.coverPicture || existingOtherSetup.coverPicture || existingObj.coverPicture || null;
    const effectiveCoverPicture = incomingCoverPicture !== undefined ? incomingCoverPicture : currentCoverPicture;

    // 4. Build merged FlipbookInfo
    const updatedFlipbookInfo = {
      ...existingFlipbookInfo,
      category: effectiveCategory,
      language: effectiveLanguage,
      quotes: effectiveQuotes,
      about: effectiveAbout,
      tags: effectiveTags,
      coverPicture: effectiveCoverPicture
    };

    // 5. Build merged otherSetup
    const updatedOtherSetup = {
      ...existingOtherSetup,
      coverPicture: effectiveCoverPicture
    };

    // 6. Handle Visibility if provided
    let updatedVisibility = existingObj.Visibility || defaults.Visibility;
    if (visibility) {
      const accessVal = typeof visibility === 'string' ? visibility.toLowerCase() : (visibility.access || visibility.type || 'public');
      updatedVisibility = {
        ...updatedVisibility,
        access: accessVal,
        type: accessVal
      };
    }

    // 7. Prepare update payload for CustomizedSettings
    const updatePayload = {
      $set: {
        userID: targetUserID,
        userEmail: targetEmail,
        v_id: resolvedVId,
        flipbookName: effectiveBookName,
        FlipbookInfo: updatedFlipbookInfo,
        otherSetup: updatedOtherSetup,
        coverPicture: effectiveCoverPicture,
        Visibility: updatedVisibility
      },
      $unset: {
        userId: 1,
        appearance: 1,
        background: 1
      }
    };

    let updatedSettings;
    try {
      updatedSettings = await CustomizedSettings.findOneAndUpdate(
        { v_id: resolvedVId },
        updatePayload,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    } catch (upsertErr) {
      if (upsertErr.code === 11000) {
        updatedSettings = await CustomizedSettings.findOneAndUpdate(
          { v_id: resolvedVId },
          updatePayload,
          { returnDocument: 'after' }
        );
      } else {
        throw upsertErr;
      }
    }

    // 8. Synchronize with Flipbook document
    const flipbookUpdates = {
      lastUpdated: new Date()
    };

    if (effectiveBookName) {
      flipbookUpdates.flipbookName = effectiveBookName;
    }

    if (effectiveCoverPicture) {
      flipbookUpdates.coverPicture = effectiveCoverPicture;
      if (effectiveCoverPicture.url) {
        flipbookUpdates.thumbnail = effectiveCoverPicture.url;
      }
    } else if (thumbnailUrl) {
      flipbookUpdates.thumbnail = thumbnailUrl;
    }

    // Note: Do not automatically mark the book as published when saving book info or cover picture.
    // Publication status is explicitly controlled by the Publish / Unpublish actions in the PublishModal.
    if (params.isPublished !== undefined) {
      flipbookUpdates.isPublished = Boolean(params.isPublished);
    }

    try {
      if (flipbook) {
        Object.assign(flipbook, flipbookUpdates);
        await flipbook.save();
      } else {
        await Flipbook.updateOne(
          { v_id: resolvedVId },
          { $set: flipbookUpdates }
        );
      }
    } catch (fbErr) {
      console.warn('[BookInfoService] Failed to sync with Flipbook model:', fbErr.message);
    }

    const calculatedTotalPages = totalPages || flipbook?.pages?.length || 0;

    return {
      success: true,
      message: 'Book information and cover picture saved successfully',
      data: {
        v_id: resolvedVId,
        flipbookName: effectiveBookName,
        quotes: effectiveQuotes,
        about: effectiveAbout,
        category: effectiveCategory,
        language: effectiveLanguage,
        totalPages: calculatedTotalPages,
        visibility: updatedVisibility.access || 'public',
        coverPicture: effectiveCoverPicture,
        thumbnail: effectiveCoverPicture?.url || flipbook?.thumbnail || '',
        FlipbookInfo: updatedFlipbookInfo,
        settings: updatedSettings
      }
    };
  }

  /**
   * Get book information and cover picture by v_id
   * @param {String} v_id Flipbook unique identifier
   * @returns {Object} Book info details
   */
  async getBookInfo(v_id) {
    if (!v_id) {
      throw new Error('v_id is required');
    }

    const [flipbook, settingsDoc] = await Promise.all([
      Flipbook.findOne({ v_id }).lean(),
      CustomizedSettings.findOne({ v_id }).lean()
    ]);

    if (!flipbook && !settingsDoc) {
      throw new Error('Flipbook not found');
    }

    const fbInfo = settingsDoc?.FlipbookInfo || {};
    const otherSetup = settingsDoc?.otherSetup || {};
    const coverPicture = fbInfo.coverPicture || otherSetup.coverPicture || settingsDoc?.coverPicture || flipbook?.coverPicture || null;
    const visibility = settingsDoc?.Visibility?.access || settingsDoc?.Visibility?.type || (flipbook?.isPublished ? 'public' : 'private');

    return {
      success: true,
      data: {
        v_id,
        flipbookName: settingsDoc?.flipbookName || flipbook?.flipbookName || '',
        quotes: fbInfo.quotes || '',
        about: fbInfo.about || '',
        category: fbInfo.category || 'Product Based',
        language: fbInfo.language || 'English',
        tags: fbInfo.tags || [],
        totalPages: flipbook?.pages?.length || 0,
        visibility,
        coverPicture,
        thumbnail: coverPicture?.url || flipbook?.thumbnail || '',
        FlipbookInfo: fbInfo,
        settings: settingsDoc
      }
    };
  }
}

module.exports = new BookInfoService();
