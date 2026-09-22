import { Router } from 'express';
import {
  getWhoWeAreContent,
  updateWhoWeAreContent,
  patchWhoWeAreSection
} from '../controllers/whoWeAreContent.controller.js';
import { getHeroSlider, updateHeroSlider } from '../controllers/heroSlider.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  updateWhoWeAreContentSchema
} from '../validations/whoWeAreContent.validation.js';
import { ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

// Who We Are Content APIs
router
  .route('/who-we-are')
  .get(getWhoWeAreContent)
  .put(
    protect,
    authorizeRoles(...ADMIN_ROLES),
    validate(updateWhoWeAreContentSchema),
    updateWhoWeAreContent
  );

router
  .route('/who-we-are/:section')
  .patch(
    protect,
    authorizeRoles(...ADMIN_ROLES),
    patchWhoWeAreSection
  );

// Hero slider (singleton)
router
  .route('/hero-slider')
  .get(getHeroSlider)
  .put(protect, authorizeRoles(...ADMIN_ROLES), updateHeroSlider);

export default router;
