import HeroSlider from '../models/HeroSlider.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

/**
 * @desc   Get Hero Slider content (Public)
 * @route  GET /api/v1/content/hero-slider
 * @access Public
 */
export const getHeroSlider = asyncHandler(async (req, res) => {
    const slider = await HeroSlider.getOrInitSlider();
    return res.status(STATUS_CODES.OK).json(
        new ApiResponse(STATUS_CODES.OK, slider, 'Hero slider fetched successfully')
    );
});

/**
 * @desc   Update / Upsert Hero Slider content
 * @route  PUT /api/v1/content/hero-slider
 * @access Admin / Super Admin
 */
export const updateHeroSlider = asyncHandler(async (req, res) => {
    const payload = req.body || {};

    const updateFields = {
        ...payload,
        updatedBy: req.user?._id
    };

    const updated = await HeroSlider.findOneAndUpdate(
        { key: 'hero-slider' },
        { $set: updateFields },
        { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return res.status(STATUS_CODES.OK).json(
        new ApiResponse(STATUS_CODES.OK, updated, 'Hero slider updated successfully')
    );
});
