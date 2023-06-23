import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { isLogin, sendOrLogErrorMessage } from "@/utils";
import { BadRequest, Unauthorized } from "@/types/error";
import { CommentRequest } from "@/types/models";

const db = new PrismaClient();

export default {
  post,
};

// comment
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
    // 요청에서 코멘트 내용 추출
    const update = req.body as CommentRequest;
    const where = { todo_id };
    if (update.content) {
      // 코멘트 내용이 있으면 생성 또는 업데이트
      const create = { ...update, todo_id };
      await db.comment.upsert({ where, update, create });
    } else {
      // 코멘트 내용이 없으면 삭제
      await db.comment.delete({ where });
    }
    res.status(200).json(true);
  } catch (error) {
    sendOrLogErrorMessage(res, error);
  }
}
