import { Request, Response } from "express";

export default {
  get,
};

async function get(req: Request, res: Response) {
  res.render("index");
}
