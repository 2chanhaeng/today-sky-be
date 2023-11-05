import { Request, Response } from "express";
import db from "@/db";
import { sendOrLogErrorMessage } from "@/utils";
import { BadRequest } from "@/types/error";

export default {
  get,
};

async function get(req: Request, res: Response) {
  try {
    const access = req.headers.authorization || req.cookies.access;
    if (!access) throw new BadRequest("Not Logged In");
    const where = { access };
    await db.refresh.deleteMany({ where });
    res.clearCookie("access").status(200).end();
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}
