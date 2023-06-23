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
