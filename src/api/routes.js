import { Router } from 'express';
import { sendSuccess } from '../shared/api-response.js';

const router = Router();

router.get('/', (req, res) => {
  sendSuccess(res, {
    version: '1.0.0',
    message: 'AdePetBot API v1',
    modules: {
      profile: 'planned',
      pets: 'planned',
      inventory: 'planned',
      professions: 'planned',
      market: 'planned',
    },
  });
});

router.get('/status', (req, res) => {
  sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
