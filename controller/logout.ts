import { Request, Response } from "express";
import db from "@/models";
import isLogin from "@/utils/login";

export default {
  get,
};

async function get(req: Request, res: Response) {
  const id = await isLogin(req, res);
  if (!id) return res.redirect("/login");
  const result = await db.user.update({ refresh: "" }, { where: { id } });
  if (!result) return res.status(500).json({ message: "로그아웃 실패" });
  res.clearCookie("access").clearCookie("refresh").redirect("/startpage");
}
