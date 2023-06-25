import { Request, Response } from "express";
import db from "@/db";
import {
  validateDate,
  isFuture,
  isLogin,
  getDateFromUrl,
  getImageNameIfHave,
  sendOrLogErrorMessage,
} from "@/utils";
import { DiaryResponse } from "@/types/models";
import {
  BadRequest,
  NotFound,
  Unauthorized,
  InternalServerError,
} from "@/types/error";

export default {
  get,
  gets,
  post,
};

async function gets(req: Request, res: Response) {
  try {
    // 로그인 여부 확인
    const user_id = await isLogin(req, res);
    if (!user_id) throw new Unauthorized("Not Login");
    // 요청 url에서 year, month 추출
    const [year, month] = getDateFromUrl(req);
    if (!validateDate(year, month, 1) || isFuture(year, month, 1)) {
      throw new BadRequest("Invalid date");
    }
    // 해당 월의 일기들을 가져옴
    const diariesResult = await db.diary.findMany({
      where: { user_id, year, month },
    });
    // 필요한 데이터만 추출해 객체로 만듦
    const diaries = diariesResult
      // 날짜, 내용, 감정(존재 시), 이미지(존재 시) 추출
      .map(({ date, content, emotion_id }) => {
        // 이미지가 있으면 이미지 링크를 가져옴
        const image = getImageNameIfHave(year, month, date, user_id) || "";
        // 감정이 있으면 감정 이미지 링크를 가져옴
        const feel = emotion_id ? `/public/images/feel/${emotion_id}.png` : "";
        return { date, content, image, feel };
      })
      // 날짜에 대해 해당 데이터를 갖는 객체로 변환
      .reduce((acc, { date, ...cur }) => {
        acc[date] = cur;
        return acc;
      }, {} as { [key: number]: DiaryResponse });
    // 일기들을 json으로 응답
    res.status(200).json(diaries);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}

async function get(req: Request, res: Response) {
  try {
    // 로그인 여부 확인
    const user_id = await isLogin(req, res);
    if (!user_id) throw new Unauthorized("Not Login");
    // 요청 url에서 year, month, date 추출
    const [year, month, date] = getDateFromUrl(req);
    if (!validateDate(year, month, date) || isFuture(year, month, date)) {
      throw new BadRequest("Invalid date");
    }
    // 일기의 id 값 (user_id, year, month, date)
    const id = { user_id, year, month, date };
    // 일기를 가져옴
    const diary = await db.diary.findUnique({ where: { id } });
    if (!diary) throw new NotFound(id);
    const { content, emotion_id } = diary;
    // 일기에 이미지가 있으면 이미지 링크를 가져옴
    const image = getImageNameIfHave(year, month, date, user_id) || "";
    // 일기를 json으로 응답
    res.status(200).json({ content, image, emotion_id });
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}

async function post(req: Request, res: Response) {
  try {
    // 로그인 여부 확인
    const user_id = await isLogin(req, res);
    // 로그인이 안 되어 있으면 401 응답
    if (!user_id) throw new Unauthorized("Not Login");
    // 요청 url에서 year, month, date 추출
    const [year, month, date] = getDateFromUrl(req);
    // year, month, date가 유효하지 않거나 미래의 날짜이면 400 응답
    if (!validateDate(year, month, date) || isFuture(year, month, date)) {
      throw new BadRequest("Invalid date");
    }
    // 요청 body에서 emotion, content 추출
    const { emotion_id, content } =
      req.body as Prisma.DiaryUncheckedCreateInput;
    // content가 없으면 400 응답
    if (!content) {
      // TODO: 콘텐츠 없으면 일기 삭제
      throw new BadRequest("Content is required");
    }
    // emotion_id가 있으면 emotion을 생성
    const emotion = emotion_id
      ? { emotion: { create: { id: emotion_id } } }
      : {};
    // 일기의 id 값 (user_id, year, month, date)
    const id = { user_id, year, month, date };
    // 일기를 생성하거나 수정
    const where = { id };
    const update = { content, ...emotion };
    const create = { ...id, content, emotion_id };
    const diary = await db.diary.upsert({ where, update, create });
    // 일기 생성에 실패하면 500 응답
    if (!diary) throw new InternalServerError("Diary is not created");
    // 일기 생성에 성공하면 201 응답
    res.status(201).json(true);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}
