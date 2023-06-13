"use strict";

/**
 * @returns {number[]} [year, month]
 */
export function getYMFromUrl() {
  const url = window.location.href;
  const dates = url
    .match(/\d{4}\/\d{1,2}/)[0]
    .split("/")
    .map(Number);
  return dates;
}

/**
 * @returns {number[]} [year, month, date]
 */
export function getYMDFromUrl() {
  const url = window.location.href;
  const dates = url
    .match(/\d{4}\/\d{1,2}\/\d{1,2}/)[0]
    .split("/")
    .map(Number);
  return dates;
}
