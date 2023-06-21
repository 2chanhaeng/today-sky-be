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
  const resDiary = res.body as Diary;
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
  const [year, month, date] = today();
  const diary = await getFromDB(db.diary, {
    where: { year, month, date },
  });
  const user_id = diary?.user_id;
  const user = await getFromDB(db.user, {
    where: { id: user_id },
  });
  if (!user) return;
  const [id, pw] = [user.username, user.password];
  const cookie = await getLoginSession(id, pw, app);
  const res = await request(app)
    .get(url(year, month, date))
    .set("Cookie", cookie);
  const result = res.body as Diary;
  expect(result?.title).toBe(diary?.title);
  expect(result?.content).toBe(diary?.content);
});
