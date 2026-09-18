import WhoWeAreContent from '../models/WhoWeAreContent.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import sanitizeHtml from '../utils/sanitizeHtml.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

// Helper function to sanitize rich text fields in WhoWeAre payload
const sanitizeWhoWeArePayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const sanitized = JSON.parse(JSON.stringify(data));

  if (sanitized.overview && typeof sanitized.overview.body === 'string') {
    sanitized.overview.body = sanitizeHtml(sanitized.overview.body);
  }

  if (sanitized.whoAreWe) {
    if (sanitized.whoAreWe.identity && typeof sanitized.whoAreWe.identity.body === 'string') {
      sanitized.whoAreWe.identity.body = sanitizeHtml(sanitized.whoAreWe.identity.body);
    }
    if (sanitized.whoAreWe.founder && typeof sanitized.whoAreWe.founder.body === 'string') {
      sanitized.whoAreWe.founder.body = sanitizeHtml(sanitized.whoAreWe.founder.body);
    }
  }

  if (sanitized.teamPage) {
    if (sanitized.teamPage.intro && typeof sanitized.teamPage.intro.body === 'string') {
      sanitized.teamPage.intro.body = sanitizeHtml(sanitized.teamPage.intro.body);
    }
  }

  return sanitized;
};

// Helper function to sanitize a single section payload
const sanitizeSectionPayload = (section, payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const sanitized = JSON.parse(JSON.stringify(payload));

  if (section === 'overview' && typeof sanitized.body === 'string') {
    sanitized.body = sanitizeHtml(sanitized.body);
  } else if (section === 'whoAreWe') {
    if (sanitized.identity && typeof sanitized.identity.body === 'string') {
      sanitized.identity.body = sanitizeHtml(sanitized.identity.body);
    }
    if (sanitized.founder && typeof sanitized.founder.body === 'string') {
      sanitized.founder.body = sanitizeHtml(sanitized.founder.body);
    }
  } else if (section === 'teamPage') {
    if (sanitized.intro && typeof sanitized.intro.body === 'string') {
      sanitized.intro.body = sanitizeHtml(sanitized.intro.body);
    }
  }

  return sanitized;
};

/**
 * @desc   Get Who We Are page content (Public)
 * @route  GET /api/v1/content/who-we-are
 * @access Public
 */
export const getWhoWeAreContent = asyncHandler(async (req, res) => {
  const content = await WhoWeAreContent.getOrInitContent();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, content, 'Who We Are content fetched successfully')
  );
});

/**
 * @desc   Update / Upsert Who We Are page content
 * @route  PUT /api/v1/content/who-we-are
 * @access Admin / Super Admin
 */
export const updateWhoWeAreContent = asyncHandler(async (req, res) => {
  const cleanedPayload = sanitizeWhoWeArePayload(req.body);

  const updateFields = {
    ...cleanedPayload,
    updatedBy: req.user?._id
  };

  const updatedContent = await WhoWeAreContent.findOneAndUpdate(
    { key: 'who-we-are' },
    { $set: updateFields },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }
  );

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, updatedContent, 'Who We Are content updated successfully')
  );
});

/**
 * @desc   Patch a specific section of Who We Are content
 * @route  PATCH /api/v1/content/who-we-are/:section
 * @access Admin / Super Admin
 */
export const patchWhoWeAreSection = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const allowedSections = ['overview', 'landing', 'whoAreWe', 'teamPage'];

  if (!allowedSections.includes(section)) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      `Invalid section '${section}'. Allowed sections: ${allowedSections.join(', ')}`
    );
  }

  const cleanedSection = sanitizeSectionPayload(section, req.body);

  const updatedContent = await WhoWeAreContent.findOneAndUpdate(
    { key: 'who-we-are' },
    {
      $set: {
        [section]: cleanedSection,
        updatedBy: req.user?._id
      }
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }
  );

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      updatedContent,
      `Who We Are ${section} section updated successfully`
    )
  );
});
