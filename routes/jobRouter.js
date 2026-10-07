import { Router } from 'express';
const router = Router();

import { getAllJobs, createJob, getJob, updateJob, deleteJob, showStats } from '../controllers/jobController.js';
import { validateJobInput, validateParam } from '../middleware/validationMiddleware.js';
import { checkForTestUser } from '../middleware/authMiddleware.js';

// router.get('/, getAllJobs)
// router.post('/', createJob)

router.route('/')
    .get(getAllJobs)
    .post(checkForTestUser, validateJobInput, createJob);

router.route('/stats').get(showStats )

router.route('/:id')
    .get(validateParam, getJob)
    .patch(checkForTestUser, validateJobInput, validateParam, updateJob)
    .delete(checkForTestUser, validateParam, deleteJob);


export default router;