import request from "supertest";
import { today } from "@/utils";
import {
  getLoginCookies,
  genIdPw,
  genPort,
  getUserIDfromCookie,
  genString,
} from "@/utils/testutil";
import db from "@/models";
import { Comment } from "@/types/models";
import setPort from "@/testapp";

const app = setPort(genPort());
const url = (...paths: number[]) =>
  "/todo/comment/" + paths.map(String).join("/");

test("create comment", async () => {
  // username, password를 생성
  const [username, password] = genIdPw();
  // 유저로 로그인을 하고 쿠키(로그인 세션) 추출
  const cookie = await getLoginCookies(username, password, app);
  // 쿠키로 유저 아이디를 추출
  const user_id = getUserIDfromCookie(cookie)!;
  // 임의의 날짜로 오늘 날짜를 가져옴
  const [year, month, date] = today();
  // 임의의 투두 생성
  const todo = await db.todo.create({
    year,
    month,
    date,
    user_id,
    content: genString(),
  });
  // 투두 아이디 추출
  const todo_id = todo.dataValues.id;
  // 임의의 코멘트 내용을 생성
  const content = genString();
  // API로 코멘트 생성
  const res = await request(app)
    .post(url(todo_id))
    .set("Cookie", cookie)
    .send({ todo_id, content });
  // 생성된 코멘트를 받아옴(DB에서 ID로 불러와 다시 비교해야 하기 때문에 필요)
  const resComment = res.body.comment as Comment;
  // 코멘트 내용이 일치하는지 확인
  expect(resComment?.content).toBe(content);
  // 응답받은 코멘트에서 ID 추출
  const { id } = resComment;
  // ID로 생성된 코멘트를 DB에서 불러옴
  const dbComment = await db.comment.findOne({ where: { id } });
  // DB에서 불러온 코멘트 내용이 일치하는지 확인
  expect(dbComment?.dataValues.content).toBe(content);
});

test("update comment", async () => {
  // username, password를 생성
  const [username, password] = genIdPw();
  // 유저로 로그인을 하고 쿠키(로그인 세션) 추출
  const cookie = await getLoginCookies(username, password, app);
  // 쿠키로 유저 아이디를 추출
  const user_id = getUserIDfromCookie(cookie)!;
  // 임의의 날짜로 오늘 날짜를 가져옴
  const [year, month, date] = today();
  // 임의의 투두 생성
  const todo = await db.todo.create({
    year,
    month,
    date,
    user_id,
    content: genString(),
  });
  // 투두 아이디 추출
  const todo_id = todo.dataValues.id;
  // 임의의 내용으로 코멘트 생성
  const comment = await db.comment.create({ todo_id, content: genString() });
  if (!comment) throw new Error("comment 생성 실패");
  // 업데이트할 내용 생성
  const content = genString();
  // API로 코멘트 업데이트
  const res = await request(app)
    .put(url(todo_id))
    .set("Cookie", cookie)
    .send({ todo_id, content });
  // 업데이트된 코멘트를 받아옴
  const result = res.body.result as boolean;
  // 업데이트 결과가 true인지 확인
  expect(result).toBe(true);
  // DB에서 업데이트된 코멘트를 불러옴
  const dbComment = await db.comment.findOne({ where: { todo_id } });
  // DB에서 불러온 코멘트 내용이 일치하는지 확인
  expect(dbComment?.dataValues.content).toBe(content);
});
