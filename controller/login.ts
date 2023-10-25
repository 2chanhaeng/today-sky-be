import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { isLogin, sendOrLogErrorMessage } from "@/utils";
import { ConnectionError, BadRequest } from "@/types/error";
import { createTokens, verifyUserinfo } from "@/utils/verify";

export default {
  post,
};

async function post(req: Request, res: Response) {
  try {
    const is_logged_in = await isLogin(req, res);
    // 이미 로그인 상태인 경우 에러 발생
    if (is_logged_in) throw new BadRequest("Already logged in");
    // 입력값 추출
    const { username, password } = req.body as Prisma.UserCreateInput;
    // 비밀번호 확인
    const id = await verifyUserinfo(username, password);
    // JWT 토큰 생성
    const { access, refresh } = await createTokens(id);
    // 토큰 전송
    res.status(200).json({ access, refresh });
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}
