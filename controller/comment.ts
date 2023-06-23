import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { isLogin, sendOrLogErrorMessage } from "@/utils";
import { BadRequest, Unauthorized } from "@/types/error";

const db = new PrismaClient();

export default {
  post,
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
    if (content) {
      const update = { content, emotion_id };
      const create = { ...update, todo_id };
      await db.comment.upsert({ where, update, create });
    } else {
      await db.comment.delete({ where });
    }
    res.status(200).json(true);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}
