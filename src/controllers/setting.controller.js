import Setting from '../models/Setting.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import cleanUpdates from '../utils/cleanUpdates.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.getSettings();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        siteName: settings.siteName,
        siteTagline: settings.siteTagline,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        address: settings.address,
        socialLinks: settings.socialLinks,
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        bookingConfirmationEmail: settings.bookingConfirmationEmail,
        maintenanceMode: settings.maintenanceMode
      },
      'Site settings retrieved'
    )
  );
});

export const updateSettings = asyncHandler(async (req, res) => {
  const updates = cleanUpdates(req.body);

  const settings = await Setting.findOneAndUpdate(
    {},
    { $set: updates },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, settings, 'Site settings updated successfully')
  );
});

