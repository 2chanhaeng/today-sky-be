import request from "supertest";
import db from "@/db";
import { today } from "@/utils";
import {
  getLoginCookies,
  genIdPw,
  genPort,
  genString,
  getUserIDfromCookie,
} from "@/utils/testutil";
import { Todo } from "@/types/models";
import setPort from "@/testapp";

const app = setPort(genPort());
const url = (...paths: (number | string)[]) =>
  "/todo/" + paths.map(String).join("/");

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
  const { id } = resTodo;
  const dbTodo = await db.todo.findUnique({ where: { id } });
  expect(dbTodo?.content).toBe(content);
});

test("get todo", async () => {
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const user_id = getUserIDfromCookie(cookie)!;
  const [year, month, date] = today();
  const dbTodos = await Promise.all(
    Array.from({ length: 10 })
      .map(genString)
      .map((content) => ({ user_id, year, month, date, content }))
      .map(async (data) => await db.todo.create({ data }))
  );
  if (!dbTodos) return;
  const res = await request(app)
    .get(url(year, month, date))
    .set("Cookie", cookie);
  const todos = res.body as Todo[];
  expect(todos.length).toBe(dbTodos.length);
  todos.forEach(({ id, content }) => {
    const dbTodo = dbTodos.find((todo) => todo.id === id);
    expect(dbTodo).toBeTruthy();
    expect(dbTodo?.content).toBe(content);
  });
});

test("update todo", async () => {
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const user_id = getUserIDfromCookie(cookie)!;
  if (!user_id) return;
  const [year, month, date] = today();
  const old = genString();
  const data = { user_id, year, month, date, content: old };
  const { id } = await db.todo.create({ data });
  const patchRes = await request(app)
    .patch(url(id))
    .set("Cookie", cookie)
    .send({ checked: true });
  expect(patchRes.body).toBe(true);
  const content = genString();
  const putRes = await request(app)
    .put(url(id))
    .set("Cookie", cookie)
    .send({ content });
  expect(putRes.body).toBe(true);
  const newTodo = await db.todo.findUnique({
    where: { id },
  });
  expect(newTodo?.id).toBe(id);
  expect(newTodo?.checked).toBe(true);
  expect(newTodo?.content).toBe(content);
});

test("delete todo", async () => {
  const [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  const user_id = getUserIDfromCookie(cookie)!;
  if (!user_id) return;
  const [year, month, date] = today();
  const content = genString();
  const data = { user_id, year, month, date, content };
  const { id } = await db.todo.create({ data });
  const res = await request(app).delete(url(id)).set("Cookie", cookie);
  expect(res.body).toBe(true);
  const deleted = await db.todo.findUnique({
    where: { id },
  });
  expect(deleted).toBeNull();
  await Promise.all(
    Array.from({ length: 10 })
      .map(genString)
      .map((content) => ({ user_id, year, month, date, content }))
      .map(async (data) => await db.todo.create({ data }))
  );
  const deletesRes = await request(app)
    .delete(url(year, month, date))
    .set("Cookie", cookie);
  expect(deletesRes.body).toBe(true);
  const where = { year, month, date, user_id };
  const deleteds = await db.todo.findMany({ where });
  expect(deleteds.length).toBe(0);
});
