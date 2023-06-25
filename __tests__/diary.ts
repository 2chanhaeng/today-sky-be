import request from "supertest";
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
import { DiariesResponse } from "@/types/models";

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

test("get diary with emotion", async () => {
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const user_id = getUserIDfromCookie(cookie)!;
  const [year, month, date] = today();
  const content = genString();
  // TODO: image 추가 테스트 필요
  const emotion_id = genEmoji();
  const data = { year, month, date, content, user_id, emotion_id };
  const diary = await db.diary.create({ data });
  if (!diary) throw new Error("일기 생성 실패");
  const res = await request(app)
    .get(url(year, month, date))
    .set("Cookie", cookie);
  const result = res.body;
  expect(result?.content).toBe(diary?.content);
  expect(result?.emotion_id).toBe(emotion_id);
});

test("gets diary", async () => {
  // 계정 생성 및 로그인
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const user_id = getUserIDfromCookie(cookie)!;
  // 날짜 생성
  const [year, thisMonth] = today();
  const month = thisMonth - 1; // 미래 일기 생성 방지
  const where = { user_id, year, month };
  const minMonthLength = 28; // 가장 짧은 달 날 수
  // 일기 생성
  const data = Array.from({ length: minMonthLength }).map((_, i) => {
    const date = i + 1;
    const content = genString();
    const emotion_id = Math.random() > 0.5 ? genEmoji() : undefined;
    return { ...where, date, content, emotion_id };
  });
  const result = await db.diary.createMany({ data });
  // 생성 개수 확인
  expect(result.count).toBe(minMonthLength);
  // 일기 조회
  const select = { date: true, content: true, emotion_id: true };
  const diaries = await db.diary.findMany({ where, select });
  const res = await request(app)
    .get(`/diary/${year}/${month}`)
    .set("Cookie", cookie);
  // 날짜별 일기 확인
  Object.entries(res.body as DiariesResponse).map(
    ([dateS, { content, emotion_id }]) => {
      // 해당 날짜 일기 검색
      const diary = diaries.find(({ date }) => date === Number(dateS));
      if (!diary) throw new Error("일기 조회 실패");
      // 내용, 감정 확인
      expect(diary.content).toBe(content);
      expect(diary.emotion_id).toBe(emotion_id);
    }
  );
});
