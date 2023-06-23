import {
  getLoginCookies,
  genIdPw,
  genPort,
  genString,
  getUserIDfromCookie,
} from "@/utils/testutil";
import { today } from "@/utils";
import { PrismaClient } from "@prisma/client";
import { Diary } from "@/types/models";
import setPort from "@/testapp";
import request from "supertest";

const app = setPort(genPort());
const db = new PrismaClient();
const url = (year: number, month: number, date: number) =>
  `/diary/${year}/${month}/${date}`;

test("create diary", async () => {
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const user_id = getUserIDfromCookie(cookie)!;
  const [year, month, date] = today();
  const content = genString();
  const res = await request(app)
    .post(url(year, month, date))
    .set("Cookie", cookie)
    .send({ content });
  const resDiary = res.body as Diary;
  const id = { user_id, year, month, date };
  const dbDiary = await db.diary.findUnique({ where: { id } });
  expect(dbDiary?.content).toBe(resDiary?.content);
});

test("get diary", async () => {
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const user_id = getUserIDfromCookie(cookie)!;
  const [year, month, date] = today();
  const content = genString();
  // TODO: emotion, image 추가 테스트 필요
  const data = { year, month, date, content, user_id };
  const diary = await db.diary.create({ data });
  if (!diary) throw new Error("일기 생성 실패");
  const res = await request(app)
    .get(url(year, month, date))
    .set("Cookie", cookie);
  const result = res.body as Diary;
  expect(result?.content).toBe(diary?.content);
});
