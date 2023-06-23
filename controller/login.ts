import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "@/config/token";
import { PrismaClient, Prisma } from "@prisma/client";
import isLogin from "@/utils/login";

export default {
  post,
};

const aMonth = 60 * 60 * 24 * 30;

async function post(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (user_id) return res.redirect("/diary");
  try {
    const { username, password } = req.body as Prisma.UserCreateInput;
    // 유저 정보 확인
    const user = await db.user.findFirst({
      where: { username, password },
      select: { id: true },
    });
    if (!user) throw new Error("유저 정보 없음");
    const { id } = user;
    // JWT 토큰 생성
    const access = jwt.sign({ id }, config.ACCESS_TOKEN!, {
      expiresIn: "1h",
    });
    const refresh = jwt.sign({ id }, config.REFRESH_TOKEN!, {
      expiresIn: "30d",
    });
    // DB에 refresh 토큰 저장
    await db.user.update({ where: { id }, data: { refresh } });
    const accessOptions = { httpOnly: true, secure: true };
    const refreshOptions =
      req.body.keep == "on"
        ? { ...accessOptions, maxAge: aMonth }
        : accessOptions;
    // 쿠키 생성 및 설정
    res
      .status(200)
      .cookie("access", access, accessOptions)
      .cookie("refresh", refresh, refreshOptions)
      .end();
    }
  } catch (err) {
    console.log("로그인 오류:", err);
    res.status(401).json({ message: "인증 오류" });
  }
}
