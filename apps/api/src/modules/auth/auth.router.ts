import { Router } from 'express';

import { validateBody } from '../../utils/validate';
import {
  loginSchema,
  refreshSchema,
  logoutSchema,
} from './auth.validators';
import {
  loginWithCredentials,
  refreshTokens,
  logoutWithToken,
} from './auth.service';

const router = Router();

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await loginWithCredentials(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', validateBody(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await refreshTokens(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', validateBody(logoutSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    await logoutWithToken(refreshToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
