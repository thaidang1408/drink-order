import { asyncHandler, authenticate } from '../../shared/middlewares/index.js';
import { sendSuccess } from '../../shared/utils/index.js';
import authService from './auth.service.js';

class AuthController {
  constructor(service) {
    this.service = service;
  }

  healthCheck = asyncHandler(async (_req, res) => {
    sendSuccess(res, { module: 'auth', status: 'ok' });
  });

  login = asyncHandler(async (req, res) => {
    const result = await this.service.login(req.body);
    sendSuccess(res, result);
  });

  me = asyncHandler(async (req, res) => {
    const profile = await this.service.getProfile(req.user.userId);
    sendSuccess(res, profile);
  });
}

const authController = new AuthController(authService);

export { authenticate };
export default authController;
