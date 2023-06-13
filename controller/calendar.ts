import { Request, Response } from "express";
import db from "@/models";
import {
  validateDate,
  isFuture,
  isLogin,
  getDateFromUrl,
  getImageNameIfHave,
} from "@/utils";

export default {
  page,
  gets,
};

// page

async function page(req: Request, res: Response) {
  res.render("todocalendar");
}

// api

async function gets(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return res.redirect("/login");
  const [year, month] = getDateFromUrl(req);
  if (!validateDate(year, month, 1) || isFuture(year, month, 1)) {
    res.redirect("/todocalendar/");
    return;
  }
  const rawDiaries = await db.diary.findAll({
    where: { user_id, year, month },
    order: [["date", "ASC"]],
  });
  const diaries = rawDiaries.map((diary) => {
    const { year, month, date } = diary.dataValues;
    const image = getImageNameIfHave(year, month, date, user_id);
    return { year, month, date, image };
  });
  res.json({ diaries });
}
