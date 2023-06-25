import { Request, Response } from "express";
import db from "@/db";
import { TodosResponse } from "@/types/models";
import {
  isLogin,
  validateDate,
  getDateFromUrl,
  sendOrLogErrorMessage,
} from "@/utils";
import { Unauthorized, BadRequest, NotFound } from "@/types/error";

export default {
  post,
  get,
  gets,
  put,
  patch,
  destroy,
  destroys,
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
    const select = { id: true };
    const todo = await db.todo.create({ data, select });
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
    const where = { year, month, date, user_id };
    const select = {
      id: true,
      checked: true,
      content: true,
      comment: { select: { content: true, emotion_id: true } },
    };
    const todos = await db.todo.findMany({
      where,
      select,
      orderBy: { id: "asc" },
    });
    // 필요한 데이터를 합쳐 객체화
    const todosByDate = todos
      .map(({ comment: [comment], ...todo }) => ({ ...todo, comment }));
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
    const where = { year, month, user_id };
    const select = {
      id: true,
      checked: true,
      content: true,
      date: true,
      comment: { select: { content: true, emotion_id: true } },
    };
    const todos = await db.todo.findMany({
      where,
      select,
      orderBy: { id: "asc" },
    });
    // 필요한 데이터를 합쳐 객체화
    const todosByDate = todos
      .map(({ comment: [comment], ...todo }) => ({ ...todo, comment }))
      .reduce((acc, { date, ...curr }) => {
        if (date in acc) acc[date].push(curr);
        else acc[date] = [curr];
        return acc;
      }, {} as TodosResponse);
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
    const where = { hasTodo: { id, user_id } }; // user의 todo 소유권 확인
    const todo = await db.todo.delete({ where });
    if (!todo) throw new NotFound({ todo_id: id });
    res.status(200).json(true);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}

// 투두 전체 삭제
async function destroys(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) throw new Unauthorized("Not Login");
    const [year, month, date] = getDateFromUrl(req);
    // 해당 날짜 유저의 todo를 모두 삭제
    await db.todo.deleteMany({
      where: {
        year,
        month,
        date,
        user_id,
      },
    });
    res.status(200).json(true);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}
