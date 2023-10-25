import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "@/config/token";
import { Unauthorized } from "@/types/error";

export default async function isLogin(req: Request, res: Response) {
  try {
    const access = req.headers.authorization || req.cookies.access;
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
      console.log("Access 토큰 검증 오류", err);
      return;
    }
  }
}
