import { Request, Response } from "express";
import db from "@/models";
import { validateDate, isFuture, isLogin } from "@/utils";
import { Controller } from "@/types";
import { Emotion } from "@/types/models";
import route from "@/routes";

export default {
  getEmotion,
  page,
};

async function getEmotion(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return;
  const { year: years, month: months } = req.params;
  const year = Number(years);
  const month = Number(months);

  const diaries = await db.diary.findAll({
    where: {
      user_id,
      month,
      year,
    },
  });
  const emotions = diaries
    .map((diary) => diary.dataValues)
    .reduce((acc, diary) => {
      const emotion_id = diary.emotion_id;
      if (!emotion_id) return acc;
      if (!acc[emotion_id]) acc[emotion_id] = 0;
      acc[emotion_id] += 1;
      return acc;
    }, {} as { [emotion_id: number]: number });

  const data = {
    Happy: emotions[1],
    Good: emotions[2],
    Soso: emotions[3],
    Notbad: emotions[4],
    Bad: emotions[5],
  };

  res.send({ emotion: data });
}

async function page(req: Request, res: Response) {
  res.render("emotion");
}
