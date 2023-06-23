/** 서버 내 에러를 처리하기 위한 추상적 예외 */
export class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.message = `${this.name}: ${message}`;
  }
  status = 500;
}

export class Unauthorized extends ConnectionError {
  constructor(message: string) {
    super(message);
    this.name = "Unauthorized";
  }
  status = 401;
}

/** 서버 내 리소스를 찾을 수 없을 시 발생 */
export class NotFound extends ConnectionError {
  constructor(...args: object[]) {
    super("Not Found");
    this.name = "Not Found";
    this.message = `${this.name} ${JSON.stringify(args)}`;
  }
  status = 404;
}

/** 잘못된 요청 시 발생 */
export class BadRequest extends ConnectionError {
  constructor(message: string) {
    super(message);
    this.name = "Bad Request";
    this.message = `${this.name}: ${message}`;
  }
  status = 400;
}
