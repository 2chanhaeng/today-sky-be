import { signup, login, genIdPw, genPort } from "@/utils/testutil";
import db from "@/models";
import { User } from "@/types/models";
import setPort from "@/testapp";
import jwt from "jsonwebtoken";
import config from "@/config/token";

const app = setPort(genPort());

test("signup", async () => {
  const [id, pw] = genIdPw();
  const res = await signup(id, pw, app);
  expect(res.body).toEqual({ result: true });
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
  const [un, pw] = genIdPw();
  await signup(un, pw, app);
  const res = await login(un, pw, app);
  expect(res.body).toEqual({ result: true });
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
  const user = await db.user.findOne({ where: { id } });
  expect(user?.dataValues.username).toEqual(un);
  expect(user?.dataValues.refresh).toEqual(refresh);
});
