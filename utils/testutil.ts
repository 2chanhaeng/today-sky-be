import { Express } from "express";
import request from "supertest";

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

export async function getLoginSession(id: string, pw: string, app: Express) {
  return (await login(id, pw, app)).header["set-cookie"];
}

export function genIdPw() {
  return [
    Math.random().toString(36).substring(2, 8),
    Math.random().toString(36).substring(2, 8),
  ];
}

export function genString() {
  return Math.random().toString(36);
}

export function genPort() {
  return Math.floor(Math.random() * 10000) + 8000;
}
