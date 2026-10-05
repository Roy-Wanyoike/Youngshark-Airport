/**
 * Shared domain types — single source of truth for the API layer.
 */

export interface User {
  Id: string;
  Name: string;
  Email: string;
  Password: string;
  Role: string;
}

export interface PublicUser {
  Id: string;
  Name: string;
  Email: string;
  Role: string;
}

export interface Message {
  message: string;
}

export interface LoginUser {
  Email: string;
  Password: string;
}

export interface LoginSuccess {
  message: string;
  token: string;
  role: string;
  name: string;
}

export interface Booking {
  Id: string;
  Name: string;
  Email: string;
  Destination: string;
  TravelDate: string;
}

export interface AddBooking {
  Destination: string;
  TravelDate: string;
}

export interface DecodedToken {
  Id: string;
  Name: string;
  Email: string;
  Role: string;
  isSent: string;
  iat: number;
  exp: number;
}

/** Request extension for authenticated routes — populated by verifyToken middleware. */
export interface AuthedRequest extends Request {
  user?: DecodedToken;
}

import type { Request } from 'express';
