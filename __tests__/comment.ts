import request from "supertest";
import db from "@/db";
import { today } from "@/utils";
import {
  getLoginCookies,
  genIdPw,
  genPort,
  getUserIDfromCookie,
  genString,
  genEmoji,
} from "@/utils/testutil";
import setPort from "@/testapp";

const app = setPort(genPort());
const url = (...paths: string[]) =>
  "/todo/comment/" + paths.map(String).join("/");

test("create comment", async () => {
  // 투두를 생성하고 투두 아이디와 쿠키를 추출
  const { cookie, todo_id } = await createTodoAndCookie();
  // 임의의 코멘트 내용을 생성
  const content = genString();
  const emotion_id = genEmoji();
  // API로 코멘트 생성
  const res = await request(app)
    .post(url(todo_id))
    .set("Cookie", cookie)
    .send({ todo_id, content, emotion_id });
  expect(res.body).toBe(true);
  // TODO ID로 생성된 코멘트를 DB에서 불러옴
  const dbComment = await db.comment.findUnique({ where: { todo_id } });
  // DB에서 불러온 코멘트 내용이 일치하는지 확인
  expect(dbComment?.content).toBe(content);
  expect(dbComment?.emotion_id).toBe(emotion_id);
});

test("get commented todo", async () => {
  // 투두를 생성하고 투두 아이디와 쿠키를 추출
  const { cookie, todo_id } = await createTodoAndCookie();
  // 임의의 코멘트 내용을 생성
  const content = genString();
  const emotion_id = genEmoji();
  // 코멘트 생성
  const where = { id: todo_id };
  const data = { comment: { create: { content, emotion_id } } };
  const include = { comment: true };
  const dbTodo = await db.todo.update({ where, data, include });
  const { year, month, date } = dbTodo;
  // API로 TODO 조회
  const res = await request(app)
    .get(`/todo/${year}/${month}/${date}`)
    .set("Cookie", cookie);
  // 응답에서 코멘트 추출해서 결과 확인
  const { comment } = res.body[0];
  expect(comment?.content).toBe(content);
  expect(comment?.emotion_id).toBe(emotion_id);
});

test("update comment", async () => {
  // 투두를 생성하고 투두 아이디와 쿠키를 추출
  const { cookie, todo_id } = await createTodoAndCookie();
  // 임의의 내용으로 코멘트 생성
  const data = { todo_id, content: genString(), emotion_id: genEmoji() };
  const comment = await db.comment.create({ data });
  if (!comment) throw new Error("comment 생성 실패");
  // 업데이트할 내용 생성
  const content = genString();
  const emotion_id = genEmoji();
  // API로 코멘트 업데이트
  const res = await request(app)
    .post(url(todo_id))
    .set("Cookie", cookie)
    .send({ todo_id, content, emotion_id });
  // 결과가 true인지 확인
  expect(res.body).toBe(true);
  // DB에서 업데이트된 코멘트를 불러옴
  const dbComment = await db.comment.findUnique({ where: { todo_id } });
  // DB에서 불러온 코멘트 내용이 일치하는지 확인
  expect(dbComment?.content).toBe(content);
  expect(dbComment?.emotion_id).toBe(emotion_id);
});

test("delete comment", async () => {
  // 투두를 생성하고 투두 아이디와 쿠키를 추출
  const { cookie, todo_id } = await createTodoAndCookie();
  // 임의의 내용으로 코멘트 생성
  const data = { todo_id, content: genString() };
  const comment = await db.comment.create({ data });
  if (!comment) throw new Error("comment 생성 실패");
  // API로 코멘트 삭제
  const res = await request(app)
    .post(url(todo_id))
    .set("Cookie", cookie)
    .send({ todo_id });
  // 삭제 결과가 true인지 확인
  expect(res.body).toBe(true);
  // DB에서 코멘트를 불러와 null인지 확인
  const dbComment = await db.comment.findUnique({ where: { todo_id } });
  expect(dbComment).toBeNull();
});

// 쿠키 및 투두 생성 후 반환
async function createTodoAndCookie() {
  // username, password를 생성
  const [username, password] = genIdPw();
  // 유저로 로그인을 하고 쿠키(로그인 세션) 추출
  const cookie = await getLoginCookies(username, password, app);
  // 쿠키로 유저 아이디를 추출
  const user_id = getUserIDfromCookie(cookie)!;
  // 임의의 날짜로 오늘 날짜를 가져옴
  const [year, month, date] = today();
  // 임의의 투두 생성 후 id 추출
  const data = {
    year,
    month,
    date,
    user_id,
    content: genString(),
  };
  const select = { id: true };
  const { id: todo_id } = await db.todo.create({ data, select });
  return { cookie, todo_id };
}
