import request from "supertest";
import db from "@/db";
import { signup, genIdPw, genPort, getLoginCookies } from "@/utils/testutil";
import setPort from "@/testapp";
import { pbkdf2 } from "@/utils";

const app = setPort(genPort());

test("signup", async () => {
  const [username, password] = genIdPw();
  const res = await signup(username, password, app);
  expect(res.status).toEqual(200);
  const user = await db.user.findUnique({ where: { username } });
  expect(user?.password).toBe(pbkdf2(password, user?.salt!));
});

test("check duplication username", async () => {
  const [username, password] = genIdPw();
  await signup(username, password, app);
  const res = await request(app).get("/signup/is-dupl").query({ username });
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({ isDupl: true });
});

test("signup error by empty username", async () => {
  const username = "";
  const password = "asd";
  let res = await signup(username, password, app);
  expect(res.status).toEqual(400);
  expect(res.body.message).toContain("username must be a non-empty string");
});

test("signup errors by empty password", async () => {
  const username = "asd";
  const password = "";
  const res = await signup(username, password, app);
  expect(res.status).toEqual(400);
  expect(res.body.message).toContain("password must be a non-empty string");
});

test("signup errors already used username", async () => {
  let [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  let res = await signup(username, password, app);
  expect(res.status).toEqual(400);
  expect(res.body.message).toContain("Already used username");
  expect(res.body.message).toContain(username);
});
