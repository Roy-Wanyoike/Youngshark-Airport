import { Router } from 'express';
import { register, login, home } from '../controllers/auth.controller';
import { verifyTokenMiddleware } from '../middleware/auth';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/home', verifyTokenMiddleware, home);

export default authRouter;
