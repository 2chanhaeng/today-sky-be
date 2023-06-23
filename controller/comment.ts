import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { isLogin, sendOrLogErrorMessage } from "@/utils";
import { BadRequest, Unauthorized } from "@/types/error";

const db = new PrismaClient();

export default {
  post,
  put,
  destroy,
};

// comment생성
async function post(req: Request, res: Response) {
  try {
    // 로그인 확인
    const user_id = await isLogin(req, res);
    if (!user_id) throw new Unauthorized("Not Login");
    // 투두ID 추출
    const { todo_id } = req.params;
    // 실제 존재하며 해당 유저가 권한(소유)이 있는 투두인지
    const hasTodo = { id: todo_id, user_id };
    const todo = await db.todo.findUnique({ where: { hasTodo } });
    if (!todo) throw new BadRequest("Todo does not exist");
    const { content, emotion_id } = req.body as {
      content: string;
      emotion_id?: number;
    };
    const where = { todo_id };
      const update = { content, emotion_id };
      const create = { ...update, todo_id };
      await db.comment.upsert({ where, update, create });
    res.status(200).json(true);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}

// comment수정
async function put(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return res.redirect("/login");
    const todo_id = Number(req.params.todo_id);
    const todo = await db.todo.findOne({ where: { user_id, id: todo_id } });
    if (!todo) {
      return res
        .status(404)
        .json({ message: "Todo가 존재하지 않음.", result: false });
    }
    const { content } = req.body;
    const comment = await db.comment.findOne({ where: { todo_id } });
    if (!comment) {
      return res
        .status(404)
        .json({ message: "Comment가 존재하지 않음.", result: false });
    }
    const result = await db.comment.update({ content }, { where: { todo_id } });
    if (!result) {
      return res
        .status(500)
        .json({ message: "Comment 수정 실패.", result: false });
    }
    res.status(200).json({ message: "Comment 수정 완료.", result: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", result: false });
  }
}

// comment 삭제
async function destroy(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return res.redirect("/login");
    const todo_id = Number(req.params.todo_id);
    const todo = await db.todo.findOne({ where: { user_id, id: todo_id } });
    if (!todo) {
      return res
        .status(404)
        .json({ message: "Todo가 존재하지 않음.", result: false });
    }
    const comment = await db.comment.findOne({ where: { todo_id } });
    if (!comment) {
      return res
        .status(404)
        .json({ message: "Comment가 존재하지 않음.", result: false });
    }
    await comment.destroy();
    const check = await db.comment.findOne({ where: { todo_id } });
    if (check) {
      return res
        .status(500)
        .json({ message: "Comment 삭제 실패.", result: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", result: false });
