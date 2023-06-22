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

test("get comment", async () => {
  // 코멘트를 생성할 임의의 투두 불러오기
  const todo = await getFromDB(db.todo, { order: [["id", "DESC"]] });
  if (!todo) return; // 투두가 없으면 테스트 실패
  // 투두에서 필요한 정보 추출
  const { id: todo_id, user_id } = todo;
  // 임의의 코멘트 생성
  const content = genIdPw().toString();
  const comment = await createFromDB(db.comment, { todo_id, content });
  if (!comment) return; // 코멘트가 생성되지 않으면 테스트 실패
  // 유저 아이디로 유저를 불러옴
  const user = await getFromDB(db.user, { where: { id: user_id } });
  if (!user) return; // 유저가 없으면 테스트 실패
  const { username, password } = user;
  // 유저로 로그인을 하고 쿠키(로그인 세션)를 가져옴
  const cookie = await getLoginSession(username, password, app);
  // API로 코멘트를 불러옴
  const res = await request(app).get(url(todo_id)).set("Cookie", cookie);
  const resComment = res.body as Comment;
  // 응답받은 코멘트와 생성된 코멘트가 일치하는지 확인
  expect(resComment?.content).toBe(content);
});
