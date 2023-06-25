import { NextFunction, Request, Response } from "express";

declare module "jsonwebtoken" {
  interface JwtPayload {
    id: string;
  }
}

export interface Controller {
  [key: string]: Control;
}

export type Control = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void;
