import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { db } from '../services/db';
import { signToken } from '../services/jwt';
import { registrationSchema, loginSchema } from '../schemas/index';
import type { AuthedRequest } from '../middleware/auth';

/**
 * Auth controller — registration + login.
 *
 * Endpoints (mounted under /api/auth):
 *   POST /register
 *   POST /login
 *   GET  /home   (protected)
 */

export async function register(req: Request, res: Response) {
  const { error } = registrationSchema.validate(req.body);
  if (error) {
    return res.status(422).json({ error: error.details[0].message });
  }

  const { Name, Email, Password } = req.body;
  const id = uuid();
  const hashedPassword = await bcrypt.hash(Password, 10);

  try {
    await db.exec('RegisterUser', { id, name: Name, email: Email, password: hashedPassword });
    return res.status(201).json({ message: 'User registered' });
  } catch (error: any) {
    console.error('[auth.register]', error);
    return res.status(500).json({ error: 'Failed to register user', detail: error.message });
  }
}

export async function login(req: Request, res: Response) {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(422).json({ error: error.details[0].message });
  }

  const { Email, Password } = req.body;
  try {
    const result = await db.exec('getUserByEmail', { email: Email });
    const users = result.recordset;
    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    const valid = await bcrypt.compare(Password, user.Password);
    if (!valid) {
      return res.status(404).json({ error: 'User not found' });
    }
    const token = signToken({
      Id: user.Id,
      Name: user.Name,
      Email: user.Email,
      Role: user.Role,
    });
    return res.status(200).json({
      message: 'User Logged in',
      token,
      role: user.Role,
      name: user.Name,
    });
  } catch (error: any) {
    console.error('[auth.login]', error);
    return res.status(500).json({ error: 'Failed to login', detail: error.message });
  }
}

export function home(req: AuthedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return res.status(200).json({ message: `Welcome ${req.user.Name}` });
}
