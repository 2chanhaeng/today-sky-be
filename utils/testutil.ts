import { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import token from "@/config/token";

const ACCESS_TOKEN = token.ACCESS_TOKEN;

export function signup(id: string, pw: string, app: Express) {
  return request(app).post("/signup").send({
    username: id,
    password: pw,
  });
}

export function login(id: string, pw: string, app: Express) {
  return request(app).post("/login").send({
    username: id,
    password: pw,
  });
}

export async function getLoginCookies(id: string, pw: string, app: Express) {
  try {
    await signup(id, pw, app);
  } catch (e) {
    console.log(e);
  }
  return (await login(id, pw, app)).header["set-cookie"] as string[];
}

export function getUserIDfromCookie(cookies: string[]) {
  const access = cookies
    .find((cookie) => cookie.startsWith("access="))
    ?.split(";")[0]
    .split("=")[1];
  if (!access) return;
  const { id } = jwt.verify(access, ACCESS_TOKEN) as jwt.JwtPayload;
  return id;
}

export function genIdPw() {
  return [genString(), genString()];
}

export function genString() {
  return crypto.randomBytes(20).toString("hex");
}

export function genPort() {
  return Math.floor(Math.random() * 10000) + 8000;
}

export function genEmoji() {
  const emojis = 80;
  return String.fromCodePoint(128512 + Math.floor(Math.random() * emojis));
}
