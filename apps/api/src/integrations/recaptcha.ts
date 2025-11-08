import env from '../config/env';
import { logger } from '../middleware/logger';

const verifyEndpoint = 'https://www.google.com/recaptcha/api/siteverify';

export const verifyRecaptcha = async (token?: string | null) => {
  if (!env.RECAPTCHA_SECRET) {
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', env.RECAPTCHA_SECRET);
    params.append('response', token);

    const response = await fetch(verifyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const result = (await response.json()) as { success?: boolean };
    return Boolean(result.success);
  } catch (error) {
    logger.warn({ err: error }, 'Recaptcha verification failed');
    return false;
  }
};

export default verifyRecaptcha;
