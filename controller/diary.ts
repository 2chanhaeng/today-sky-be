import { Request, Response } from "express";
import db from "@/models";
import {
  validateDate,
  isFuture,
  isLogin,
  getDateFromUrl,
  getImageNameIfHave,
} from "@/utils";
import { DiaryResponse } from "@/types/models";

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
  const user_id = await isLogin(req, res);
  if (!user_id) return res.redirect("/login");
  const [year, month, date] = getDateFromUrl(req);
  const { emotion, content } = req.body;
  if (!validateDate(year, month, date) || isFuture(year, month, date)) {
    return res.status(400).json({ error: "Invalid date" }).end();
  }
  const emotion_id = emotion ? Number(emotion) : undefined;

  const [diary, isCreated] = await db.diary.upsert({
    user_id,
    year,
    month,
    date,
    content,
    emotion_id,
  });
  if (!diary) {
    return res.status(500).json({ error: "DB error", result: false }).end();
  }
  diary.save();
  res.status(201).json({ isCreated, diary: diary.dataValues, result: true });
}
