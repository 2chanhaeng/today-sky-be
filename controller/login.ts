import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import config from "@/config/token";
import db from "@/db";
import isLogin from "@/utils/login";
import { ConnectionError, BadRequest, NotFound } from "@/types/error";

export default {
  post,
};

const aMonth = 60 * 60 * 24 * 30;

async function post(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (user_id) throw new BadRequest("Already logged in");
    const { username, password: plain } = req.body as Prisma.UserCreateInput;
    // 유저 정보 확인
    const where = { username };
    const select = { id: true, salt: true, password: true };
    const user = await db.user.findUnique({ where, select });
    if (!user) throw new NotFound({ username });
    const { id, salt, password } = user;
    // 비밀번호 확인
    const encoded = crypto
      .pbkdf2Sync(plain, salt, 100000, 64, "sha512")
      .toString("base64");
    // pw가 일치하지 않아도 NotFound 에러 발생
    // pw가 틀렸다고 하면 username의 존재를 알려주기 때문에 DB 간접적으로 노출
    if (password !== encoded) throw new NotFound({ username });
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
  } catch (error) {
    if (error instanceof ConnectionError) {
      const { status, message } = error;
      return res.status(status).json({ message });
    }
    console.log("Unknown error in POST /login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
