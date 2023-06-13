import { Request, Response } from "express";

export function removeLastSlash(req: Request, res: Response, next: Function) {
  if (req.path !== "/" && req.path.endsWith("/")) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
}
