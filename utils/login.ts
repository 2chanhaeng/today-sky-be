import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "@/db";
import config from "@/config/token";
import { Unauthorized, NotFound } from "@/types/error";

const cutBearer = (access: string) =>
  access.substring(0, 7) === "Bearer " ? access.slice(7) : access;

export async function isLogin(req: Request, res: Response) {
  try {
    const access = cutBearer(req.headers.authorization || req.cookies.access);
    console.log("Access 토큰", access);
    if (!access) throw new Unauthorized("");
    // access 토큰이 존재하는 경우
    const { id } = jwt.verify(access, config.ACCESS_TOKEN) as jwt.JwtPayload;
    if (!id) throw new Error("유저 정보 없음");
    return id;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      // access 토큰이 만료된 경우에만 refresh 토큰 검증
      console.log("Access 토큰 만료");
    } else if (err instanceof Unauthorized) {
      // Access 없을 경우 비 로그인 상태로 취급
      // 별다른 경고 없이 그냥 리턴
      // 로그인이 필요한 경우 로그인 페이지로 리디렉션
      return;
    } else {
      // 그외의 경우 모두 로그인 페이지로 리디렉션
      console.log("Access 토큰 검증 오류" /*, err*/);
      return;
    }
  }
}

/**
 * Encodes plain text with salt using pbkdf2
 * @param plain {string} original plain text
 * @param salt {string} salt
 * @returns {string} encoded text
 */
export function pbkdf2(plain: string, salt: string): string {
  return crypto
    .pbkdf2Sync(plain, salt, 100000, 64, "sha512")
    .toString("base64");
}

export async function verifyUserinfo(username: string, plain: string) {
  // 유저 정보 확인
  const where = { username };
  const select = { id: true, salt: true, password: true };
  const user = await db.user.findUnique({ where, select });
  if (!user) throw new NotFound({ username });
  const { id, salt, password } = user;
  const encoded = pbkdf2(plain, salt);
  // pw가 일치하지 않아도 NotFound 에러 발생
  // pw가 틀렸다고 하면 username의 존재를 알려주기 때문에 DB 간접적으로 노출
  if (password !== encoded) throw new NotFound({ username });
  return id;
}

export async function createTokens(id: string, keep: boolean = false) {
  const access = jwt.sign({ id }, config.ACCESS_TOKEN!, {
    expiresIn: "1h",
  });
  const refresh = jwt.sign({ id }, config.REFRESH_TOKEN!, {
    expiresIn: keep ? "30d" : "1h",
  });
  // DB에 refresh 토큰 저장
  return await db.refresh.create({ data: { user_id: id, refresh, access } });
}
