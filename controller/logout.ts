import { Request, Response } from "express";
import db from "@/db";
import { isLogin, sendOrLogErrorMessage } from "@/utils";
import { BadRequest, Unauthorized } from "@/types/error";

export default {
  get,
};

async function get(req: Request, res: Response) {
  try {
    const id = await isLogin(req, res);
    if (!id) throw new Unauthorized("Not Login");
    const where = { id };
    const data = { refresh: null };
    const result = await db.user.update({ where, data });
    if (!result) throw new BadRequest("User does not exist");
    res.clearCookie("access").clearCookie("refresh").redirect("/");
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}
