import {
  signup,
  login,
  genIdPw,
  genPort,
  getLoginCookies,
} from "@/utils/testutil";
import db from "@/db";
import setPort from "@/testapp";
import jwt from "jsonwebtoken";
import config from "@/config/token";
import request from "supertest";

const app = setPort(genPort());

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

test("login errors", async () => {
  const [username, password] = genIdPw();
  let res = await login(username, password, app);
  expect(res.status).toEqual(404);
  expect(res.body.message).toContain(username);
  const cookie = await getLoginCookies(username, password, app);
  res = await login(username, "wrongPassword", app);
  expect(res.status).toEqual(404);
  expect(res.body.message).toContain(username);
  res = await login("wrongUsername", password, app);
  expect(res.status).toEqual(404);
  expect(res.body.message).toContain("wrongUsername");
  res = await request(app)
    .post("/login")
    .send({ username, password })
    .set("Cookie", cookie);
  expect(res.status).toEqual(400);
  expect(res.body.message).toContain("Already logged in");
});
