import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { TodoResponse } from "@/types/models";
import {
  isLogin,
  validateDate,
  getDateFromUrl,
  sendOrLogErrorMessage,
} from "@/utils";
import { Unauthorized, BadRequest, NotFound } from "@/types/error";

const db = new PrismaClient();

export default {
  post,
  get,
  gets,
  put,
  patch,
  destroy,
  destroyAll,
};

// 투두 생성
async function post(req: Request, res: Response) {
  try {
    // 로그인 확인
    const user_id = await isLogin(req, res);
    if (!user_id) throw new Unauthorized("Not Login");
    // 날짜 확인
    const [year, month, date] = getDateFromUrl(req);
    if (!validateDate(year, month, date)) throw new BadRequest("Invalid date");
    // 요청에서 content 추출
    const { content } = req.body;
    // DB에 저장
    const data = { year, month, date, content, user_id };
    const todo = await db.todo.create({ data });
    // 결과 반환
    res.status(200).json(todo);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}

// 투두 조회
async function get(req: Request, res: Response) {
  try {
    // 로그인 확인
    const user_id = await isLogin(req, res);
    if (!user_id) throw new Unauthorized("Not Login");
    // 날짜 확인
    let [year, month, date] = getDateFromUrl(req);
    if (!validateDate(year, month, date)) {
      throw new BadRequest("Invalid date");
    }
    // DB에서 해당 날짜의 투두 조회
    const todos = await db.todo.findMany({
      where: { year, month, date, user_id },
      orderBy: { date: "asc", id: "asc" },
    });
    // 필요한 데이터를 합쳐 객체화
    const todosByDate = await Promise.all(
      todos.map(async ({ id, checked, content, date }) => {
        // 해당 투두의 코멘트 조회
        const commentr = await db.comment.findUnique({
          where: { todo_id: id },
        });
        const comment = commentr?.content;
        // 해당 투두의 감정 조회
        const emotion_id = commentr?.emotion_id;
        if (!emotion_id) return { date, id, content, checked, comment };
        const emotion = await db.emotion.findUnique({
          where: { id: emotion_id },
        });
        const feel = emotion ? `/public/images/feel/${emotion.feel}.png` : "";
        return { id, content, checked, comment, feel };
      })
    );
    res.status(200).json(todosByDate);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}

// 월별 투두 조회
async function gets(req: Request, res: Response) {
  try {
    // 로그인 확인
    const user_id = await isLogin(req, res);
    if (!user_id) throw new Unauthorized("Not Login");
    // 날짜 확인
    let [year, month] = getDateFromUrl(req);
    if (!validateDate(year, month, 1)) {
      return res.redirect("/todo");
    }
    // DB에서 해당 월의 투두 조회
    const todos = await db.todo.findMany({ where: { year, month, user_id } });
    // 필요한 데이터를 합쳐 객체화
    const todosByDate = await todos
      .map(async ({ id, checked, content, date }) => {
        // 해당 투두의 코멘트 조회
        const commentr = await db.comment.findUnique({
          where: { todo_id: id },
        });
        const comment = commentr?.content;
        // 해당 투두의 감정 조회
        const emotion_id = commentr?.emotion_id;
        if (!emotion_id) return { date, id, content, checked, comment };
        const emotion = await db.emotion.findUnique({
          where: { id: emotion_id },
        });
        const feel = emotion ? `/public/images/feel/${emotion.feel}.png` : "";
        return { date, id, content, checked, comment, feel };
      })
      .reduce(async (pracc, todo) => {
        const { date, ...curr } = await todo;
        const acc = await pracc;
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
      }, Promise.resolve({} as { [date: number]: TodoResponse[] }));
    res.status(200).json(todosByDate);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}

// 투두 수정
async function put(req: Request, res: Response) {
  try {
    // 로그인 확인
    const user_id = await isLogin(req, res);
    if (!user_id) throw new Unauthorized("Not Login");
    // 요청에서 todo id, content 추출
    const { id } = req.params;
    const data = req.body;
    // DB에 업데이트
    const where = { hasTodo: { id, user_id } }; // user의 todo 소유권 확인
    const result = await db.todo.update({ where, data });
    if (!result) throw new NotFound({ todo_id: id });
    res.status(200).json(true);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}

// 투두 선택
async function patch(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) throw new Unauthorized("Not Login");
    const { id } = req.params;
    const data = req.body;
    const where = { hasTodo: { id, user_id } }; // user의 todo 소유권 확인
    const result = await db.todo.update({ data, where });
    if (!result) throw new NotFound({ todo_id: id });
    res.status(200).json(true);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}

// 투두 삭제
async function destroy(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user_id = await isLogin(req, res);
    if (!user_id) return res.redirect("/login");
    const todo = await db.todo.findOne({ where: { id, user_id } });
    const comment = await db.comment.findOne({ where: { todo_id: id } });
    await comment?.destroy();
    comment?.save();
    await todo?.destroy();
    todo?.save();
    res.status(200).json({ result: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", result: false });
  }
}

// 투두 전체 삭제
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
      return res
        .status(404)
        .json({ message: "Todo가 존재하지 않음.", result: false });
    }

    res.status(200).json({ result: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", result: false });
  }
}
