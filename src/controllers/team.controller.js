import Team from '../models/Team.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import cleanUpdates from '../utils/cleanUpdates.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const getTeam = asyncHandler(async (req, res) => {
  const { limit, sort } = req.query;

  let query = Team.find({ status: 'Active' });

  if (sort === 'createdAt') {
    query = query.sort({ createdAt: -1 });
  } else {
    query = query.sort({ order: 1, createdAt: 1 });
  }

  if (limit && !isNaN(parseInt(limit, 10))) {
    query = query.limit(parseInt(limit, 10));
  }

  const team = await query.lean();

  const formatted = team.map((t) => ({
    id: t._id,
    name: t.name,
    role: t.role,
    expertise: t.expertise || '',
    bio: t.bio || '',
    image: t.image || '',
    experienceYears: t.experienceYears || 0,
    socials: t.socials || {},
    order: t.order || 0,
    status: t.status || 'Active'
  }));

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, formatted, 'Team fetched successfully')
  );
});

export const getTeamAdmin = asyncHandler(async (req, res) => {
  const team = await Team.find().sort({ order: 1, createdAt: 1 }).lean();

  const formatted = team.map((t) => ({
    id: t._id,
    name: t.name,
    role: t.role,
    expertise: t.expertise || '',
    bio: t.bio || '',
    image: t.image || '',
    experienceYears: t.experienceYears || 0,
    socials: t.socials || {},
    order: t.order || 0,
    status: t.status || 'Active',
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }));

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, formatted, 'Team fetched successfully')
  );
});

export const createTeamMember = asyncHandler(async (req, res) => {
  const { name, role, expertise, bio, image, experienceYears, socials, order, status } = req.body;

  const member = await Team.create({
    name,
    role,
    expertise: expertise || '',
    bio: bio || '',
    image: image || '',
    experienceYears: typeof experienceYears === 'number' ? experienceYears : 0,
    socials: socials || {},
    order: typeof order === 'number' ? order : 0,
    status: status || 'Active'
  });

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, member, 'Team member created successfully')
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

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, { id }, 'Team member deleted successfully')
  );
});
