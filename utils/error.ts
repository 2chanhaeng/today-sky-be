import { Response } from "express";
import { Prisma } from "@prisma/client";
import { ConnectionError } from "@/types/error";

export default function sendOrLogErrorMessage(res: Response, error: unknown) {
  if (error instanceof ConnectionError) {
    // ConnectionError 에러를 상속 받은 알려진 예외라면 로그 없이 status와 message를 json으로 응답
    const { status, message } = error;
    return res.status(status).json({ message }).end();
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma 로 인한 에러라면 로그를 남기고 500 응답
    console.log(`Prisma Error ${error.code}: ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error" }).end();
  }
  // ConnectionError가 아니라면 알려지지 않은 에러이므로 로그를 남기고 500 응답
  console.error(`Unknown error:`, error);
  return res.status(500).json({ message: "Internal Server Error" }).end();
}
