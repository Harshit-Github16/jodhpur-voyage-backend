import { Router } from 'express';
import {
  getTeam,
  getTeamAdmin,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} from '../controllers/team.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import { ROLES, ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', getTeam);
router.get('/admin', protect, authorizeRoles(...ADMIN_ROLES), getTeamAdmin);
router.post('/', protect, authorizeRoles(...ADMIN_ROLES), createTeamMember);
router.put('/:id', protect, authorizeRoles(...ADMIN_ROLES), updateTeamMember);
router.patch('/:id', protect, authorizeRoles(...ADMIN_ROLES), updateTeamMember);
router.delete('/:id', protect, authorizeRoles(...ADMIN_ROLES), deleteTeamMember);

export default router;


