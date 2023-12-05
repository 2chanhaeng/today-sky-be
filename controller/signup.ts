import crypto from "crypto";
import { Request, Response } from "express";
import { map, mapLeft } from "fp-ts/Either";
import {
  flatMap,
  tryCatch,
  fromEither,
  match as TEmatch,
} from "fp-ts/TaskEither";
import { map as Tmap } from "fp-ts/Task";
import { apply, flow, pipe } from "fp-ts/function";
import { IO } from "fp-ts/IO";
import { Prisma } from "@prisma/client";
import db from "@/db";
import {
  ConnectionError,
  BadRequest,
  AlreadyUsedUsername,
  InternalServerError,
} from "@/types/error";
import {
  UserCreateInput,
  Username,
  validDuplInput,
  validUserCreateInput,
} from "@/validates/signup";
import { match } from "@/utils/match";
import { pbkdf2 } from "@/utils/login";
export default {
  post,
  isDupl,
};

type ErrorIO = IO<ConnectionError>;
interface ResponseSummary {
  status: number;
  message?: string;
  isDupl?: boolean;
}

//회원가입 Post
async function post({ body }: Request, res: Response) {
  return pipe(
    body,
    validUserCreateInput,
    mapLeft(handleValidError),
    map(addSaltAndHash),
    fromEither,
    flatMap(createUser),
    makeCreateResponse,
    Tmap(sendResponse(res))
  )();
}

const salt: IO<string> = () => crypto.randomBytes(64).toString("base64");
const hash = (plain: string, salt: string) => ({
  salt,
  password: pbkdf2(plain, salt),
});
const addSaltAndHash = ({
  password,
  username,
}: UserCreateInput): Prisma.UserCreateInput => ({
  username,
  ...hash(password, salt()),
});

const matchPrismaError =
  (username: string) => (error: { code?: string } | any) =>
    match<unknown, ErrorIO>(
      [["P2002", () => new AlreadyUsedUsername(username)]],
      () => new BadRequest("Failed to create user")
    )(error?.code);
const unknownErrorFromCreateUser =
  (error: unknown): ErrorIO =>
  (): ConnectionError =>
    new InternalServerError(`Unknown error in POST /signup: ${error}`);
const errorCaseWhenCreateUser = (username: string) =>
  [
    [Prisma.PrismaClientKnownRequestError, matchPrismaError(username)],
    [Error, (error: unknown) => () => new BadRequest(JSON.stringify(error))],
  ] as [unknown, (error: unknown) => ErrorIO][];

const matchCreateUserError =
  ({ username }: UserCreateInput) =>
  (error: unknown): ErrorIO =>
    match(errorCaseWhenCreateUser(username), unknownErrorFromCreateUser)(error)(
      error
    );

const createUser = (data: Prisma.UserCreateInput) =>
  tryCatch(
    async () => !!(await db.user.create({ data })),
    matchCreateUserError(data)
  );
const handleValidError = (errors: string[]) => (): ConnectionError =>
  new BadRequest(`Failed to create user: ${errors.join(", ")}`);

const getStatusMessage = ({ status, message }: ResponseSummary) => ({
  status,
  message,
});
const makeCreateResponse = TEmatch<ErrorIO, ResponseSummary, boolean>(
  flow(apply(null), getStatusMessage),
  (isSuccess) =>
    isSuccess
      ? { status: 200 }
      : { status: 400, message: "Failed to create user" }
);
const sendResponse =
  (res: Response) =>
  ({ status, ...body }: ResponseSummary) =>
    res.status(status).json(body).end();

// 회원가입 시 username 중복 검사
async function isDupl({ query }: Request, res: Response) {
  return pipe(
    query,
    validDuplInput,
    mapLeft(handleValidError),
    fromEither,
    flatMap(trySearchUsername),
    makeDuplResponse,
    Tmap(sendResponse(res))
  )();
}
const searchUsername = async (where: Username) =>
  !!db.user.findUnique({ where });
const trySearchUsername = (where: Username) =>
  tryCatch(
    async () => searchUsername(where),
    (error) => () =>
      new InternalServerError(`Unknown error in GET /signup/dupl: ${error}`)
  );
const makeDuplResponse = TEmatch<ErrorIO, ResponseSummary, boolean>(
  (error: ErrorIO) => error(),
  (isDupl) => ({ status: 200, isDupl })
);
