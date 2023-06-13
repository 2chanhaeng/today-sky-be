import { Request, Response } from "express";
import db from "@/models";
import { TodoResponse } from "@/types/models";
import {
  isLogin,
  validateDate,
  getDateFromUrl,
  today,
  isFuture,
  getImageNameIfHave,
} from "@/utils";

export default {
  daily,
  monthly,
  redirectMonthly,
  timeline,
  calendar,
  post,
  get,
  gets,
  put,
  patch,
  destroy,
  destroyAll,
};

// page

// 일별 투두
async function daily(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return res.redirect("/login");
  let [year, month, date] = getDateFromUrl(req);
  if (!validateDate(year, month, date)) {
    return res.redirect(`/todo/${today().join("/")}`);
  }
  res.render("todo/daily", { year, month, date });
}

// 월별 투두
async function monthly(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return res.redirect("/login");
  let [year, month] = getDateFromUrl(req);
  if (!validateDate(year, month, 1)) {
    return res.redirect("/todo");
  }
  res.render("todo/monthly", { year, month });
}

// 월별 투두로 리다이렉트
async function redirectMonthly(req: Request, res: Response) {
  const [year, month] = today();
  res.redirect(`/todo/${year}/${month}`);
}

// 투두 타임라인
async function timeline(req: Request, res: Response) {
  res.render("todo/timeline");
}

// 투두 캘린더
async function calendar(req: Request, res: Response) {
  res.render("todo/calendar");
}

// api

//투두 생성
async function post(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return res.redirect("/login");
  const [year, month, date] = getDateFromUrl(req);
  if (!validateDate(year, month, date)) {
    return res.status(400).json({ message: "날짜 형식이 잘못됨." });
  }
  const { content } = req.body;
  try {
    const result = await db.todo.create({
      user_id,
      year,
      month,
      date,
      content,
    });
    const todo = result.toJSON();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// 투두 조회
async function get(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return res.redirect("/login");
    const [year, month, date] = getDateFromUrl(req);
    let result: any;
    //todocalendar에서 3개만 보여주기 위해 limit 3
    if (req.query.position === "todocalendar") {
      result = await db.todo.findAll({
        where: {
          year,
          month,
          date,
          user_id,
        },
        limit: 3,
        order: [["id", "DESC"]],
      });
      //캘린더 페이지가 아닌 todo 페이지에서는 모두 보여줌
    } else {
      result = await db.todo.findAll({
        where: {
          year,
          month,
          date,
          user_id,
        },
      });
    }

    const todos = result.map((todo: any) => todo.toJSON());
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// 월별 투두 조회
async function gets(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return res.redirect("/login");
  let [year, month] = getDateFromUrl(req);
  if (!validateDate(year, month, 1)) {
    return res.redirect("/todo");
  }
  const todos = await db.todo.findAll({ where: { year, month, user_id } });
  const todosByDate = await todos
    .map((todo) => todo.dataValues)
    .map(async ({ id, checked, content, date }) => {
      const commentr = await db.comment.findOne({ where: { todo_id: id } });
      const comment = commentr?.dataValues.content;
      const emotion_id = commentr?.dataValues.emotion_id;
      if (!emotion_id) return { date, id, content, checked, comment };
      const emotion = await db.emotion.findOne({ where: { id: emotion_id } });
      const feel = emotion?.dataValues.feel;
      return { date, id, content, checked, comment, feel };
    })
    .reduce(async (pracc, todo) => {
      const { date } = await todo;
      const acc = await pracc;
      if (!acc[date]) acc[date] = [];
      acc[date].push(await todo);
      return acc;
    }, Promise.resolve({} as { [date: number]: TodoResponse[] }));
  res.status(200).json(todosByDate);
}

//투두 수정
async function put(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return res.redirect("/login");
    const { id } = req.params;
    const { content } = req.body;
    const result = await db.todo.update(
      { content },
      { where: { id, user_id } }
    );
    if (!result) {
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }

    res.status(200).json({ message: "Todo 수정 완료." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// 투두 선택
async function patch(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return res.redirect("/login");
    const { id } = req.params;
    const { checked } = req.body;
    const result = await db.todo.update(
      { checked },
      { where: { id, user_id } }
    );
    if (!result) {
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }
    res.status(200).json({ message: "Todo 수정 완료." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

//투두 삭제
async function destroy(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user_id = await isLogin(req, res);
    if (!user_id) return res.redirect("/login");
    const result = await db.todo.destroy({
      where: { id, user_id },
    });

    if (result === 0) {
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }

    res.status(200).json({ message: "Todo 삭제 완료." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

//투두 전체 삭제
async function destroyAll(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return res.redirect("/login");
    const { year, month, date } = req.params;
    const result = await db.todo.destroy({
      //year, month, date, user_id가 일치하는 todo를 모두 삭제
      where: {
        year,
        month,
        date,
        user_id,
      },
    });

    if (result === 0) {
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }

    res.status(200).json({ message: "Todo 삭제 완료." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function calendarGets(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (!user_id) return res.redirect("/login");
  const [year, month] = getDateFromUrl(req);
  if (!validateDate(year, month, 1) || isFuture(year, month, 1)) {
    res.redirect("/todo/calendar");
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
