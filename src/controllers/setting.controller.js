import Setting from '../models/Setting.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
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
  let settings = await Setting.findOne();

  if (!settings) {
    settings = await Setting.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, settings, 'Site settings updated successfully')
  );
});
