import { Router } from 'express';
import {
  getTeam,
  getTeamAdmin,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} from '../controllers/team.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema
} from '../validations/team.validation.js';
import { ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', getTeam);
router.get('/admin', protect, authorizeRoles(...ADMIN_ROLES), getTeamAdmin);
router.post(
  '/',
  protect,
  authorizeRoles(...ADMIN_ROLES),
  validate(createTeamMemberSchema),
  createTeamMember
);
router.put(
  '/:id',
  protect,
  authorizeRoles(...ADMIN_ROLES),
  validate(updateTeamMemberSchema),
  updateTeamMember
);
router.patch(
  '/:id',
  protect,
  authorizeRoles(...ADMIN_ROLES),
  validate(updateTeamMemberSchema),
  updateTeamMember
);
router.delete('/:id', protect, authorizeRoles(...ADMIN_ROLES), deleteTeamMember);

export default router;
