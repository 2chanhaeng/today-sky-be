import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "@/config/token";
import db from "@/db";
import { ConnectionError, NotFound } from "@/types/error";

export default {
  post,
};

async function post(req: Request, res: Response) {
  try {
    const { refresh } = req.body;
    const { id } = jwt.verify(refresh, config.REFRESH_TOKEN!) as jwt.JwtPayload;
    const has_refresh = { user_id: id, refresh };
    const is_exist = await db.refresh.findUnique({ where: has_refresh });
    if (!is_exist) throw new NotFound({ refresh });
    const access = jwt.sign({ id }, config.ACCESS_TOKEN!, {
      expiresIn: "1h",
    });
    res.status(200).json({ access });
  } catch (error) {
    if (error instanceof ConnectionError) {
      const { status, message } = error;
      return res.status(status).json({ message });
    }
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      const { name, message } = error;
      return res.status(401).json({ name, message });
    }
    console.log("Unknown error in POST /login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
