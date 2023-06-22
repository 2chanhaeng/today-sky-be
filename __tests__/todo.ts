import request from "supertest";
import { today, getFromDB } from "@/utils";
import {
  getLoginCookies,
  genIdPw,
  genPort,
  genString,
  getUserIDfromCookie,
} from "@/utils/testutil";
import db from "@/models";
import { Todo } from "@/types/models";
import setPort from "@/testapp";

const app = setPort(genPort());
const url = (...paths: number[]) => "/todo/" + paths.map(String).join("/");

test("create todo", async () => {
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const content = genString();
  const [year, month, date] = today();
  const res = await request(app)
    .post(url(year, month, date))
    .set("Cookie", cookie)
    .send({ content });
  const resTodo = res.body as Todo;
  expect(resTodo?.content).toBe(content);
  const user_id = getUserIDfromCookie(cookie)!;
  const dbTodo = await db.todo.findOne({ where: { user_id } });
  expect(dbTodo?.dataValues.id).toBe(resTodo?.id);
});

test("get todo", async () => {
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const user_id = getUserIDfromCookie(cookie)!;
  const [year, month, date] = today();
  const content = genString();
  const dbTodo = await db.todo.create({
    year,
    month,
    date,
    user_id,
    content,
  });
  if (!dbTodo) return;
  const res = await request(app)
    .get(url(year, month, date))
    .set("Cookie", cookie);
  const todos = res.body.todos as Todo[];
  const { id } = dbTodo.dataValues;
  const todo = todos.find((todo) => todo.id === dbTodo.dataValues.id);
  expect(todo).toBeTruthy();
  expect(todo?.id).toBe(id);
  expect(todo?.content).toBe(content);
});

test("update todo", async () => {
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const user_id = getUserIDfromCookie(cookie)!;
  if (!user_id) return;
  const [year, month, date] = today();
  const old = genString();
  const oldTodo = await db.todo.create({
    user_id,
    year,
    month,
    date,
    content: old,
  });
  const id = oldTodo?.dataValues.id;
  const patchRes = await request(app)
    .patch(url(id))
    .set("Cookie", cookie)
    .send({ checked: true });
  expect(patchRes.body?.result).toBe(true);
  const content = genString();
  const putRes = await request(app)
    .put(url(id))
    .set("Cookie", cookie)
    .send({ content });
  expect(res.status).toBe(200);
  expect(putRes.body?.result).toBe(true);
  const newTodo = await getFromDB(db.todo, {
    where: { id },
  });
  expect(newTodo?.id).toBe(id);
  expect(newTodo?.checked).toBe(true);
  expect(newTodo?.content).toBe(content);
});

test("delete todo", async () => {
  const dbTodo = await getFromDB(db.todo, {});
  if (!dbTodo) return;
  const { year, month, date, user_id } = dbTodo;
  const user = await getFromDB(db.user, {
    where: { id: user_id },
  });
  if (!user) return;
  const { username, password } = user;
  const cookie = await getLoginSession(username, password, app);
  const res = await request(app)
    .delete(url(year, month, date))
    .set("Cookie", cookie);
  expect(res.status).toBe(200);
  const deleted = await db.todo.findOne({
    where: { id: dbTodo.id },
  });
  expect(deleted).toBeNull();
});
