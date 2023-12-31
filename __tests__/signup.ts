import crypto from "crypto";
import request from "supertest";
import db from "@/db";
import { signup, genIdPw, genPort, getLoginCookies } from "@/utils/testutil";
import setPort from "@/testapp";

const app = setPort(genPort());

test("signup", async () => {
  const [username, password] = genIdPw();
  const res = await signup(username, password, app);
  expect(res.status).toEqual(200);
  const user = await db.user.findUnique({ where: { username } });
  expect(user?.password).toBe(
    crypto
      .pbkdf2Sync(password, user?.salt!, 100000, 64, "sha512")
      .toString("base64")
  );
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
  [username, password] = genIdPw();
  const cookie = await getLoginCookies(username, password, app);
  res = await signup(username, password, app);
  expect(res.status).toEqual(400);
  expect(res.body.message).toContain("Already used username");
  expect(res.body.message).toContain(username);
  [username, password] = genIdPw();
  res = await request(app)
    .post("/signup")
    .send({ username, password })
    .set("Cookie", cookie);
  expect(res.status).toEqual(400);
  expect(res.body.message).toContain("Already logged in");
});
