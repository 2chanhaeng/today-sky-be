import { getLoginSession, genIdPw, genPort, genString } from "@/utils/testutil";
import { today } from "@/utils";
import db from "@/models";
import { Diary } from "@/types/models";
import setPort from "@/testapp";
import request from "supertest";

const app = setPort(genPort());
const url = (year: number, month: number, date: number) =>
  `/diary/${year}/${month}/${date}`;

test("create diary", async () => {
  const [id, pw] = genIdPw();
  const cookie = await getLoginSession(id, pw, app);
  const [year, month, date] = today();
  const content = genString();
  const res = await request(app)
    .post(url(year, month, date))
    .set("Cookie", cookie)
    .send({ content });
  const resDiary = res.body.diary as Diary;
  const user = await db.user.findOne({
    where: { username: id },
  });
  const dbDiary = await db.diary.findOne({
    where: {
      user_id: user?.dataValues?.id,
      year,
      month,
      date,
    },
  });
  expect(dbDiary?.dataValues?.content).toBe(resDiary?.content);
});

test("get diary", async () => {
  const [id, pw] = genIdPw();
  const cookie = await getLoginSession(id, pw, app);
  const user = await db.user.findOne({
    where: { username: id },
  });
  const user_id = user?.dataValues?.id!;
  const [year, month, date] = today();
  const content = genString();
  // TODO: emotion, image 추가 테스트 필요
  const diaries = await db.diary.upsert({
    year,
    month,
    date,
    content,
    user_id,
  });
  if (!diaries) throw new Error("일기 생성 실패");
  const diary = diaries[0];
  diary.save();
  const res = await request(app)
    .get(url(year, month, date))
    .set("Cookie", cookie);
  const result = res.body as Diary;
  expect(result?.content).toBe(diary?.dataValues.content);
});
