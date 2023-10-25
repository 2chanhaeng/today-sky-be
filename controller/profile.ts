import { Request, Response } from "express";
import { isLogin } from "@/utils/login";
import db from "@/db";

export default {
  get,
};

async function get(req: Request, res: Response) {
  const id = await isLogin(req, res);
  if (!id) return res.json({ message: "로그인이 필요합니다." });
  const userResult = await db.user.findUnique({
    where: { id },
  });
  const user = userResult;
  res.json(user);
}
