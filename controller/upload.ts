import fs from "fs";
import { Request, Response } from "express";
import sharp from "sharp";
import { isLogin, createImageName } from "@/utils";

export default { image };

async function image(req: Request, res: Response) {
  // 로그인 확인
  const id = await isLogin(req, res);
  if (!id) return;
  const { year, month, date } = req.params;
  // 파일 경로 생성
  const ymd = `/${year}/${month}/${date}`;
  const dir = `upload/${ymd}`;
  fs.mkdir(dir, { recursive: true }, (err) => {
    if (err) throw err;
  });
  const fn = createImageName(Number(year), Number(month), Number(date), id);
  const fp = `${dir}/${fn}`;
  try {
    // sharp로 파일 jpg로 변환하여 저장
    const result = await sharp(req?.file?.buffer).toFile(fp);
    if (!result) throw new Error("파일 저장 실패");
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "파일 저장 실패" });
  }
  // 파일 경로 응답
  const path = `image/${ymd}/${fn}`;
  res.status(200).json({ message: "파일 저장 성공", path });
}
