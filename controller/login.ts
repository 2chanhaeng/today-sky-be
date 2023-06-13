import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, JsonWebTokenError } from "jsonwebtoken";
import config from "@/config/token";
import db from "@/models";
import isLogin from "@/utils/login";

export default {
  get,
  post,
  processRequest,
};

// 사용자 정의 에러 클래스
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

// 로그인 GET
async function get(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (user_id) return res.redirect("/");
  res.render("login");
}

// 로그인 POST
async function post(req: Request, res: Response) {
  const user_id = await isLogin(req, res);
  if (user_id) return res.redirect("/");
  try {
    const { username, password } = req.body;
    const user = await db.user.findOne({
      where: { username, password },
    });
    if (!user) throw new Error("유저 정보 없음");
    const { id } = user.dataValues;
    // JWT 토큰 생성
    const access = jwt.sign({ id }, config.ACCESS_TOKEN!, {
      expiresIn: "1h",
    });
    const refresh = jwt.sign({ id }, config.REFRESH_TOKEN!, {
      expiresIn: "7d",
    });
    // DB에 refresh 토큰 저장
    await user.update({ refresh });

    // 쿠키 생성 및 설정
    if (req.body.keep == "on") {
      res
        .cookie("access", access, {
          httpOnly: true,
          secure: true,
          // 1달 유지
          maxAge: 60 * 60 * 24 * 30,
        })
        .cookie("refresh", refresh, { httpOnly: true, secure: true })
        .redirect("/");
    } else {
      res
        .cookie("access", access, { httpOnly: true, secure: true })
        .cookie("refresh", refresh, { httpOnly: true, secure: true })
        .redirect("/");
    }
  } catch (err) {
    console.log("콘솔 로깅", err);
    res.status(401).json({ message: "인증 오류" });
  }
}

async function processRequest(req: Request, res: Response, next: NextFunction) {
  try {
    // 클라이언트에서 토큰을 쿠키로 전달받음
    const access_token = req.cookies.access;

    if (!access_token) {
      // 토큰이 없으면 인증 실패
      throw new AuthenticationError("인증 실패");
    }

    try {
      const decoded = jwt.verify(
        access_token,
        config.ACCESS_TOKEN!
      ) as JwtPayload;

      // 필요한 추가 검증 로직을 수행하고 필요한 데이터를 가져옴
      const { authed } = decoded;

      if (authed) {
        // 사용자 인증된 상태에서만 접근 가능한 요청 처리 로직
        // 요청 처리 로직을 구현합니다.

        // 처리 결과에 따라 적절한 응답을 생성하고 클라이언트에게 전송합니다.
        res.send({ result: true });
      } else {
        throw new AuthenticationError("인증 실패");
      }
    } catch (err: any) {
      if (
        err instanceof JsonWebTokenError &&
        err.name === "JsonWebTokenError"
      ) {
        // 토큰이 유효하지 않은 경우
        throw new AuthenticationError("토큰이 유효하지 않습니다.");
      } else {
        // 다른 예외 처리를 진행하거나 적절한 응답을 생성하여 클라이언트에게 전송합니다.
        res.send({ result: false, error: err.message });
      }
    }
  } catch (err) {
    console.log("인증 오류", err);
    next(err); // 에러 핸들링 미들웨어로 에러 전달
  }
}
