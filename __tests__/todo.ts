import request from "supertest";
import { PrismaClient } from "@prisma/client";
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
const db = new PrismaClient();
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
  expect(resTodo?.content).toBe(content);
  const { id } = resTodo;
  const dbTodo = await db.todo.findUnique({ where: { id } });
  expect(dbTodo?.content).toBe(content);
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
  expect(putRes.body?.result).toBe(true);
  const newTodo = await getFromDB(db.todo, {
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
  const dbTodo = await db.todo.create({ user_id, year, month, date, content });
  const id = dbTodo?.dataValues.id;
  const res = await request(app).delete(url(id)).set("Cookie", cookie);
  expect(res.body.result).toBe(true);
  const deleted = await db.todo.findOne({
    where: { id },
  });
  expect(deleted).toBeNull();
  await Promise.all(
    Array.from({ length: 10 })
      .map(genString)
      .map(
        async (content) =>
          await db.todo.create({ user_id, year, month, date, content })
      )
  );
  const deleteAllRes = await request(app)
    .delete(url(year, month, date))
    .set("Cookie", cookie);
  expect(deleteAllRes.body.result).toBe(true);
  const deletedAll = await db.todo.findAll({
    where: { year, month, date, user_id },
  });
  expect(deletedAll.length).toBe(0);
});
