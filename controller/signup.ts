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
    const { id } = result.toJSON();
    req.session.user = id; // 세션에 사용자 정보 저장
  } catch (e) {
    console.log("아이디 중복", e);
    res.send({ result: false });
    return;
  }
  try {
    res.redirect("/login");
  } catch (err) {
    console.log("회원가입 실패", err);
    res.send({ result: false });
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
