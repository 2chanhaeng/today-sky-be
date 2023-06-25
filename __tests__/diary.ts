import {
  getLoginCookies,
  genIdPw,
  genPort,
  genString,
  getUserIDfromCookie,
  genEmoji,
} from "@/utils/testutil";
import { today } from "@/utils";
import db from "@/db";
import setPort from "@/testapp";
import request from "supertest";

const app = setPort(genPort());
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
  expect(res.body).toBe(true);
  const where = { id: { user_id, year, month, date } };
  const select = { content: true, emotion_id: true };
  const dbDiary = await db.diary.findUnique({ where, select });
  expect(dbDiary?.content).toBe(content);
});

test("create diary with emotion", async () => {
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const user_id = getUserIDfromCookie(cookie)!;
  const [year, month, date] = today();
  const content = genString();
  const emotion_id = genEmoji();
  const res = await request(app)
    .post(url(year, month, date))
    .set("Cookie", cookie)
    .send({ content, emotion_id });
  expect(res.body).toBe(true);
  const where = { id: { user_id, year, month, date } };
  const select = { content: true, emotion_id: true };
  const dbDiary = await db.diary.findUnique({ where, select });
  expect(dbDiary?.content).toBe(content);
  expect(dbDiary?.emotion_id).toBe(emotion_id);
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
  expect(res.body?.content).toBe(content);
});
