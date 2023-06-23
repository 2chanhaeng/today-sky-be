import { Request, Response } from "express";
import db from "@/db";
import { Prisma } from "@prisma/client";
import isLogin from "@/utils/login";
import {
  ConnectionError,
  BadRequest,
  AlreadyUsedUsername,
} from "@/types/error";

export default {
  post,
  isDupl,
};

//회원가입 Post
async function post(req: Request, res: Response) {
  try {
    // 회원가입 요청 시 로그인 상태인지 확인
    const user_id = await isLogin(req, res);
    // 로그인 상태라면 에러 발생
    if (user_id) throw new BadRequest("Already logged in");
    // 회원가입 요청 데이터 추출
    const data = req.body as Prisma.UserCreateInput;
    try {
      // 회원가입 요청 데이터 검증
      // TODO: 데이터 검증 로직 추가
      if (!data.username.trim() || !data.password.trim())
        // 검증 오류 시 BadRequest 에러 발생
        throw new BadRequest("Invalid username or password");
      // DB에 회원가입 요청 데이터 저장
      const result = await db.user.create({ data });
      // DB에 저장 실패 시 BadRequest 에러 발생
      if (!result) throw new BadRequest("Failed to create user");
      // 회원가입 성공 시 200 응답
      res.status(200).end();
    } catch (error) {
      // DB에 저장 중 발생한 에러 처리
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: 유일해야하는 필드(username) 중복 에러
        if (error.code === "P2002")
          // AlreadyUsedUsername 에러 발생
          throw new AlreadyUsedUsername(data.username);
        // 그 외의 에러는 BadRequest 에러 발생
      } else if (error instanceof Error) throw new BadRequest(error.message);
      // 이외의 에러는 Unknown 에러 발생
      throw error;
    }
  } catch (error) {
    // 알려진 에러의 경우
    if (error instanceof ConnectionError) {
      // status, message 추출
      const { status, message } = error;
      // status, message를 json 형태로 응답
      return res.status(status).json({ message }).end();
    }
    // 이외의 에러일 경우 서버 내부 에러로 간주
    // 에러 로그 기록
    console.error("Unknown error in POST /signup:", error);
    // 500 에러 응답
    res.status(500).json({ message: "Internal Server Error" }).end();
  }
}

// 회원가입 시 username 중복 검사
async function isDupl(req: Request, res: Response) {
  try {
    // username 추출
    const { username } = req.query;
    // username이 존재하고 문자열일 경우
    if (username && typeof username === "string") {
      // DB에서 username 검색
      const result = await db.user.findUnique({ where: { username } });
      // 검색 결과를 json 형태로 응답
      return res.status(200).json({ isDupl: !!result }).end();
    }
  } catch (error) {
    // 에러 로그 기록
    console.error("Unknown error in GET /signup/isDupl:", error);
    // 500 에러 응답
    res.status(500).json({ message: "Internal Server Error" }).end();
  }
  // username이 존재하지 않거나 문자열이 아닌 등 에러 시 400 에러 응답
  res.status(400).end();
}
