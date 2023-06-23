import { signup, login, genIdPw, genPort } from "@/utils/testutil";
import { PrismaClient } from "@prisma/client";
import setPort from "@/testapp";
import jwt from "jsonwebtoken";
import config from "@/config/token";
import request from "supertest";

const app = setPort(genPort());
const db = new PrismaClient();

test("signup", async () => {
  const [username, password] = genIdPw();
  const res = await signup(username, password, app);
  expect(res.status).toEqual(200);
  const user = await db.user.findUnique({ where: { username } });
  expect(user?.password).toBe(password);
});

test("signup with already used username", async () => {
  const [username, password] = genIdPw();
  await signup(username, password, app);
  const res = await request(app).get("/signup/is-dupl").query({ username });
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({ isDupl: true });
});

test("signup errors", async () => {
  let username = " ";
  let password = "asd";
  let res = await signup(username, password, app);
  expect(res.status).toEqual(400);
  expect(res.body.message).toContain("Invalid username or password");
  (username = "asd"), (password = "");
  res = await signup(username, password, app);
  expect(res.status).toEqual(400);
  expect(res.body.message).toContain("Invalid username or password");
  let user = await db.user.findFirstOrThrow();
  res = await signup(user.username, user.password, app);
  expect(res.status).toEqual(400);
  expect(res.body.message).toContain("Already used username");
  expect(res.body.message).toContain(user.username);
});

test("login", async () => {
  const [username, password] = genIdPw();
  await signup(username, password, app);
  const res = await login(username, password, app);
  expect(res.header["set-cookie"]).toBeTruthy();
  const cookies = res.header["set-cookie"] as string[];
  const access = cookies
    .find((cookie) => cookie.startsWith("access="))
    ?.split(";")[0]
    .split("=")[1];
  expect(access).toBeTruthy();
  const refresh = cookies
    .find((cookie) => cookie.startsWith("refresh="))
    ?.split(";")[0]
    .split("=")[1];
  expect(refresh).toBeTruthy();
  if (!access || !refresh) return;
  const { id } = jwt.verify(access, config.ACCESS_TOKEN) as jwt.JwtPayload;
  const user = await db.user.findUnique({ where: { id } });
  expect(user?.username).toEqual(username);
  expect(user?.refresh).toEqual(refresh);
});
