import { Request, Response } from "express";
import db from "@/models";

export default {
  post,
  isDupl,
};

//회원가입 Post
async function post(req: Request, res: Response) {
  const { username, password } = req.body;
  try {
    const result = await db.user.create({
      username,
      password,
    });
    if (!result) throw new Error("회원가입 실패");
  } catch (e) {
    console.log("회원가입 에러", e);
    res.json({ result: false });
    return;
  }
  try {
    res.json({ result: true });
  } catch (err) {
    console.log("회원가입 실패", err);
    res.json({ result: false });
  }
}

async function isDupl(req: Request, res: Response) {
  const { username } = req.query;
  if (username && typeof username === "string") {
    const result = await db.user.findOne({ where: { username } });
    return res.json({ result: result ? true : false });
  }
  res.status(404).end();
}
