import { Router } from 'express';
import {
  getCities,
  getCityByIdOrSlug,
  createCity,
  updateCity,
  deleteCity
} from '../controllers/city.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createCitySchema, updateCitySchema } from '../validations/city.validation.js';
import { ROLES, ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

router
  .route('/')
  .get(getCities)
  .post(protect, authorizeRoles(...ADMIN_ROLES), validate(createCitySchema), createCity);

router
  .route('/:idOrSlug')
  .get(getCityByIdOrSlug);

router
  .route('/:id')
  .put(protect, authorizeRoles(...ADMIN_ROLES), validate(updateCitySchema), updateCity)
  .delete(protect, authorizeRoles(ROLES.SUPER_ADMIN), deleteCity);

export default router;
