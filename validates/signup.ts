import { Do, Either, flatMap, getApplicativeValidation } from "fp-ts/Either";
import { isEmpty } from "fp-ts/string";
import { getMonoid } from "fp-ts/Array";
import { apS } from "fp-ts/Apply";
import { pipe } from "fp-ts/function";
import { not } from "fp-ts/Predicate";
import { validate, validateString } from ".";

interface Body extends Record<string, unknown> {}
export interface Username extends Body {
  username: string;
}
interface Password extends Body {
  password: string;
}
export interface UserCreateInput extends Username, Password {}

const errorsApplicative = getApplicativeValidation(getMonoid<string>());
const errorsApS = apS(errorsApplicative);

const isNonEmptyString = not(isEmpty);

const validateUsernameValue = flatMap(
  validate([[isNonEmptyString, "username must be a non-empty string"]])
);
const validateUsername = (username: unknown) =>
  pipe(username, validateString, validateUsernameValue);

const validatePasswordValue = flatMap(
  validate([[isNonEmptyString, "password must be a non-empty string"]])
);
const validatePassword = (password: unknown) =>
  pipe(password, validateString, validatePasswordValue);

export const validUserCreateInput = ({
  username,
  password,
}: Body): Either<string[], UserCreateInput> =>
  pipe(
    Do,
    errorsApS("username", validateUsername(username)),
    errorsApS("password", validatePassword(password))
  );

export const validDuplInput = ({
  username,
}: Body): Either<string[], Username> =>
  pipe(Do, errorsApS("username", validateUsername(username)));
