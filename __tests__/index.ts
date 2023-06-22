import { signup, login, genIdPw, genPort } from "@/utils/testutil";
import db from "@/models";
import { User } from "@/types/models";
import setPort from "@/testapp";
import request from "supertest";

const app = setPort(genPort());

test("signup", async () => {
  const [id, pw] = genIdPw();
  const res = await signup(id, pw, app);
  expect(res.statusCode).toBe(200);
  const result = await db.user.findOne({
    where: {
      username: id,
    },
  });
  const user = result?.toJSON<User>();
  expect(user?.password).toBe(pw);
  db.user.destroy({
    where: {
      username: id,
    },
  });
});

test("login", async () => {
  const [id, pw] = genIdPw();
  await signup(id, pw, app);
  const res = await login(id, pw, app);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ result: true });
  db.user.destroy({
    where: {
      username: id,
    },
  });
});
