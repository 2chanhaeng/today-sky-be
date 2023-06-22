import { Request, Response } from "express";
import db from "@/models";
import { isLogin } from "@/utils";

export default {
  post,
  put,
  destroy,
};

// comment생성
async function post(req: Request, res: Response) {
  try {
    const user_id = await isLogin(req, res);
    if (!user_id) return res.redirect("/login");
    const todo_id = Number(req.params.todo_id);
    // 유저ID와 투두ID로 조회: 실제 존재하는 투두인지, 해당 유저가 권한(소유)이 있는지
    const todo = await db.todo.findOne({
      where: { id: todo_id, user_id },
    });
    if (!todo) {
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }
    const { content, emotion_id } = req.body as {
      content: string;
      emotion_id?: number;
    };
    const toCreate = emotion_id
      ? { todo_id, content, emotion_id }
      : { todo_id, content };
    const comment = await db.comment.create(toCreate);
    if (comment.toJSON().content !== content) {
      return res.status(500).json({ message: "Comment 생성 실패." });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }
    const { content } = req.body;
    const comment = await db.comment.findOne({ where: { todo_id } });
    if (!comment) {
      return res.status(404).json({ message: "Comment가 존재하지 않음." });
    }
    const result = await comment.update({ content });
    if (result.toJSON().content !== content) {
      return res.status(500).json({ message: "Comment 수정 실패." });
    }
    res.status(200).json({ message: "Comment 수정 완료." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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
      return res.status(404).json({ message: "Todo가 존재하지 않음." });
    }
    const comment = await db.comment.findOne({ where: { todo_id } });
    if (!comment) {
      return res.status(404).json({ message: "Comment가 존재하지 않음." });
    }
    await comment.destroy();
    const check = await db.comment.findOne({ where: { todo_id } });
    if (check) {
      return res.status(500).json({ message: "Comment 삭제 실패." });
    }
    res.status(200).json({ message: "Comment 삭제 완료." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
