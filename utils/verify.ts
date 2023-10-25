import crypto from "crypto";
import jwt from "jsonwebtoken";
import db from "@/db";
import config from "@/config/token";
import { NotFound } from "@/types/error";

export async function verifyUserinfo(username: string, plain: string) {
  // 유저 정보 확인
  const where = { username };
  const select = { id: true, salt: true, password: true };
  const user = await db.user.findUnique({ where, select });
  if (!user) throw new NotFound({ username });
  const { id, salt, password } = user;
  const encoded = crypto
    .pbkdf2Sync(plain, salt, 100000, 64, "sha512")
    .toString("base64");
  // pw가 일치하지 않아도 NotFound 에러 발생
  // pw가 틀렸다고 하면 username의 존재를 알려주기 때문에 DB 간접적으로 노출
  if (password !== encoded) throw new NotFound({ username });
  return id;
}

export async function createTokens(id: string) {
  const access = jwt.sign({ id }, config.ACCESS_TOKEN!, {
    expiresIn: "1h",
  });
  const refresh = jwt.sign({ id }, config.REFRESH_TOKEN!, {
    expiresIn: "30d",
  });
  // DB에 refresh 토큰 저장
  return await db.refresh.create({ data: { user_id: id, refresh, access } });
}
