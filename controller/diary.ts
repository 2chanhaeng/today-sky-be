import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  validateDate,
  isFuture,
  isLogin,
  getDateFromUrl,
  getImageNameIfHave,
} from "@/utils";
import { DiaryResponse } from "@/types/models";
import {
  BadRequest,
  ConnectionError,
  Unauthorized,
  InternalServerError,
} from "@/types/error";

const db = new PrismaClient();

export default {
  get,
  gets,
  post,
};

async function gets(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return res.redirect("/login");
  const [year, month] = getDateFromUrl(req);
  if (!validateDate(year, month, 1) || isFuture(year, month, 1)) {
    return res.status(400).json({ error: "Invalid date", result: false }).end();
  }
  const diariesResult = await db.diary.findAll({
    where: { user_id, year, month },
  });
  if (!diariesResult) {
    return res
      .status(404)
      .json({ error: "이번 달 일기가 없습니다.", result: false })
      .end();
  }
  const diaries = diariesResult
    .filter((diary) => diary)
    .map((diary) => diary.dataValues)
    .map(({ date, content, emotion_id }) => {
      const image = getImageNameIfHave(year, month, date, user_id) || "";
      const feel = emotion_id ? `/public/images/feel/${emotion_id}.png` : "";
      return { date, content, image, feel };
    })
    .reduce((acc, cur) => {
      acc[cur.date] = cur;
      return acc;
    }, {} as { [key: number]: DiaryResponse });
  res.json({ ...diaries, result: true });
}

async function get(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return res.redirect("/login");
  const [year, month, date] = getDateFromUrl(req);
  if (!validateDate(year, month, date) || isFuture(year, month, date)) {
    return res.status(400).json({ error: "Invalid date" }).end();
  }
  const diary = await db.diary.findOne({
    where: { user_id, year, month, date },
  });
  if (!diary) {
    return res
      .status(404)
      .json({
        error: "일기가 없습니다.",
        result: false,
      })
      .end();
  }
  const image = getImageNameIfHave(year, month, date, user_id) || "";
  const { content, emotion_id } = diary.dataValues;
  res.json({ content, emotion_id, image, result: true });
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
    const { emotion, content } = req.body;
    // content가 없으면 400 응답
    if (!content) throw new BadRequest("Content is required");
    // emotion이 있으면 emotion_id를 number로 변환
    const emotion_id = emotion ? Number(emotion) : undefined;
    // 일기의 id 값 (user_id, year, month, date)
    const id = { user_id, year, month, date };
    // 일기를 생성하거나 수정
    const diary = await db.diary.upsert({
      create: { user_id, year, month, date, content, emotion_id },
      where: { id },
      update: { content, emotion_id },
    });
    // 일기 생성에 실패하면 500 응답
    if (!diary) throw new InternalServerError("Diary is not created");
    // 일기 생성에 성공하면 201 응답
    res.status(201).json(diary);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}
