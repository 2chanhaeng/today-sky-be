import * as E from "fp-ts/Either";
import * as T from "fp-ts/Tuple";
import * as A from "fp-ts/Array";
import * as S from "fp-ts/string";
import { pipe, apply, flow, constant, constVoid } from "fp-ts/function";
import { Predicate, not } from "fp-ts/Predicate";
import { Refinement } from "fp-ts/Refinement";

export const validate =
  <U, T extends U>(predAndError: [Predicate<T> | Refinement<U, T>, string][]) =>
  (v: U) =>
    pipe(
      predAndError,
      A.filter(flow(T.fst, not, apply(v as T))),
      A.map(T.snd),
      E.fromPredicate(A.isNonEmpty, constVoid),
      E.fold(constant(E.of(v as T)), E.left<string[], T>)
    );
