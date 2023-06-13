import { Request, Response } from "express";
import db from "@/models";
import isLogin from "@/utils/login";

export default {
  get,
  post,
  isDupl,
};

//회원가입 GET
async function get(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (user_id) return res.redirect("/");
  res.render("signup");
}

//회원가입 Post
async function post(req: Request, res: Response) {
  const { username, password } = req.body;
  const result = await db.user.create({
    username,
    password,
  });
  const { id } = result.toJSON();
  req.session.user = id; // 세션에 사용자 정보 저장
  try {
    res.send({
      result: true,
      name: username,
      password: password,
    });
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
