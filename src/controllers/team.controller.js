import Team from '../models/Team.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import cleanUpdates from '../utils/cleanUpdates.js';
import { STATUS_CODES } from '../constants/statusCodes.js';


export const getTeam = asyncHandler(async (req, res) => {
  const team = await Team.find({ status: 'Active' }).sort({ order: 1, createdAt: 1 }).lean();

  const formatted = team.map((t) => ({
    id: t._id,
    name: t.name,
    role: t.role,
    bio: t.bio,
    image: t.image,
    experienceYears: t.experienceYears,
    socials: t.socials,
    order: t.order,
    status: t.status
  }));

  return res.status(STATUS_CODES.OK).json({
    success: true,
    count: formatted.length,
    data: formatted
  });
});

export const getTeamAdmin = asyncHandler(async (req, res) => {
  const team = await Team.find().sort({ order: 1, createdAt: 1 }).lean();

  const formatted = team.map((t) => ({
    id: t._id,
    name: t.name,
    role: t.role,
    bio: t.bio,
    image: t.image,
    experienceYears: t.experienceYears,
    socials: t.socials,
    order: t.order,
    status: t.status,
    createdAt: t.createdAt
  }));

  return res.status(STATUS_CODES.OK).json({
    success: true,
    count: formatted.length,
    data: formatted
  });
});

export const createTeamMember = asyncHandler(async (req, res) => {
  const { name, role, bio, image, experienceYears, socials, order, status } = req.body;

  const member = await Team.create({
    name,
    role,
    bio,
    image,
    experienceYears: experienceYears || 5,
    socials: socials || {},
    order: order || 0,
    status: status || 'Active'
  });

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, member, 'Team member added successfully')
  );
});

export const updateTeamMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = cleanUpdates(req.body);

  const member = await Team.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  if (!member) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Team member not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, member, 'Team member updated successfully')
  );
});

export const deleteTeamMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const member = await Team.findByIdAndDelete(id);

  if (!member) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Team member not found');
  }

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Team member removed successfully',
    deletedId: id
  });
});

