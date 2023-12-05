import { fst, snd } from "fp-ts/ReadonlyTuple";
import { findFirst } from "fp-ts/ReadonlyArray";
import { flow, pipe, constant } from "fp-ts/function";
import { fold } from "fp-ts/lib/Option";

/**
 * Search k is key or if k is class constructor, check if key is instance of k
 * @param {K} key key
 * @returns {(k: K) => boolean} function that returns boolean
 */
const search =
  <K>(key: K): ((k: K) => boolean) =>
  (k: K) =>
    key === k || (k instanceof Function && key instanceof k);

/**
 * Functional switch-case
 * @param {readonly [K, V][]} cases key-value pairs
 * @param {V} defaults default value
 * @returns {(key: K) => V} function that returns value
 */
export const match =
  <K, V>(cases: readonly [K, V][], defaults: V): ((key: K) => V) =>
  (key) =>
    pipe(
      cases,
      findFirst(flow(fst, search(key))),
      fold(constant(defaults), snd)
    );
