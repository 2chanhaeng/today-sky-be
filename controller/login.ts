import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "@/config/token";
import db from "@/models";
import isLogin from "@/utils/login";

export default {
  post,
};

async function post(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (user_id) return res.redirect("/diary");
  try {
    const { username, password } = req.body;
    const user = await db.user.findOne({
      where: { username, password },
    });
    if (!user) throw new Error("유저 정보 없음");
    const { id } = user.dataValues;
    // JWT 토큰 생성
    const access = jwt.sign({ id }, config.ACCESS_TOKEN!, {
      expiresIn: "1h",
    });
    const refresh = jwt.sign({ id }, config.REFRESH_TOKEN!, {
      expiresIn: "7d",
    });
    // DB에 refresh 토큰 저장
    await user.update({ refresh });

    // 쿠키 생성 및 설정
    if (req.body.keep == "on") {
      res
        .cookie("access", access, {
          httpOnly: true,
          secure: true,
          // 1달 유지
          maxAge: 60 * 60 * 24 * 30,
        })
        .cookie("refresh", refresh, { httpOnly: true, secure: true })
        .send({ result: true });
    } else {
      res
        .cookie("access", access, { httpOnly: true, secure: true })
        .cookie("refresh", refresh, { httpOnly: true, secure: true })
        .send({ result: true });
    }
  } catch (err) {
    console.log("로그인 오류:", err);
    res.status(401).json({ message: "인증 오류" });
  }
}
