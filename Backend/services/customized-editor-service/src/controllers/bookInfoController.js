

const bookInfoService = require('../services/bookInfoService');

/**
 * Controller for managing Flipbook Information and Cover Picture
 */
const getAuthUser = (req) => {
  return {
    customUserId: req.user?.customUserId || req.user?.userID || req.body?.userID || null,
    emailId: req.user?.emailId || req.user?.email || req.body?.emailId || null
  };
};

/**
 * POST /book-info or /save-book-info
 * Save Flipbook Name, Quotes, About, Category, Language, Cover Picture, etc.
 */
const saveBookInfo = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const result = await bookInfoService.saveBookInfo(req.body, authUser);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[BookInfoController] Error saving book info:', error);
    const status = error.message.includes('required') ? 400 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to save book information and cover picture'
    });
  }
};

/**
 * GET /book-info/:v_id
 * Get Flipbook Information and Cover Picture
 */
const getBookInfo = async (req, res) => {
  try {
    const v_id = req.params?.v_id || req.query?.v_id;
    if (!v_id) {
      return res.status(400).json({ success: false, message: 'v_id is required' });
    }
    const result = await bookInfoService.getBookInfo(v_id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[BookInfoController] Error fetching book info:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to fetch book information'
    });
  }
};

/**
 * POST /cover-picture
 * Dedicated endpoint to update cover picture only
 */
const saveCoverPicture = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const { v_id, coverPicture } = req.body;
    if (!v_id) {
      return res.status(400).json({ success: false, message: 'v_id is required' });
    }
    if (!coverPicture) {
      return res.status(400).json({ success: false, message: 'coverPicture is required' });
    }

    const result = await bookInfoService.saveBookInfo({ v_id, coverPicture }, authUser);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[BookInfoController] Error saving cover picture:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save cover picture'
    });
  }
};

module.exports = {
  saveBookInfo,
  getBookInfo,
  saveCoverPicture
};
