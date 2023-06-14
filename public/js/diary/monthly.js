"use strict";

import fillCalendar from "../components/calendar.js";
import { getYMFromUrl } from "../utils/date.js";

const calendar = document.querySelector("#calendar");
const [year, month] = getYMFromUrl();
fillCalendar(year, month, "diary", calendar);

// diary
const diaries = document.querySelector("#diaries");
renderDiaries(diaries);

async function renderDiaries(root) {
  // api로 데이터 불러오기
  const diaryByDate = await getDiariesByDate();
  console.log(diaryByDate);
  Object.entries(diaryByDate)
    // 날짜 순으로 정렬하기
    .sort(([date1], [date2]) => date1 - date2)
    // 날짜 별 Diaries 생성하기
    .map(([date, diary]) => Diary(date, diary))
    // diaries에 추가하기
    .forEach((diary) => root.appendChild(diary));
  // 일기 있는 달은 달력에 표시하기
  Object.entries(diaryByDate)
    // 링크로 변환
    .map(([date]) => `/diary/${year}/${month}/${date}`)
    // 해당 링크를 가지고 있는 앵커의 부모 div 찾기
    .map((link) => document.querySelector(`a[href="${link}"]`).parentElement)
    // 클래스 추가해서 표시하기
    .forEach((date) => date.classList.add("diary-written"));
}
/**
 * @typedef {Object} Diary
 * @property {number} date
 * @property {string} content
 * @property {string} [image]
 * @property {string} [feel]
 *
 * @returns {Promise<{[date: number]: Diary}>}
 */
async function getDiariesByDate() {
  const res = await fetch(`/api/diary/${year}/${month}`);
  const diary = await res.json();
  return diary;
}

/**
 * ```
 * ┌─────────┬─────────┬──────────────────┐
 * │  date   │ emotion │                  │
 * ├─────────┴─────────┤     content      │
 * │       image       │                  │
 * └───────────────────┴──────────────────┘
 * ```
 * @param {Diary} param0
 * @return {HTMLElement}
 */
function Diary(date, { content, image, feel }) {
  // diary
  const root = document.createElement("article");
  root.classList.add("diary");
  // section for date-emo and image
  const DateEmoImg = document.createElement("section");
  DateEmoImg.classList.add("diary");
  DateEmoImg.classList.add("date-emo-img");
  root.appendChild(DateEmoImg);
  // section for date and emotion
  const DateEmo = document.createElement("section");
  DateEmo.classList.add("diary");
  DateEmo.classList.add("date-emo");
  DateEmoImg.appendChild(DateEmo);
  // date
  const Date = document.createElement("h2");
  Date.classList.add("diary");
  Date.classList.add("date");
  Date.textContent = `${date}일`;
  DateEmo.appendChild(Date);
  // emotion
  if (feel) {
    const Emo = document.createElement("img");
    Emo.classList.add("diary");
    Emo.classList.add("emo");
    Emo.src = feel;
    DateEmo.appendChild(Emo);
  }
  // image
  if (image) {
    const Image = document.createElement("img");
    Image.classList.add("diary");
    Image.classList.add("img");
    Image.src = image;
    DateEmoImg.appendChild(Image);
  }
  // content
  const Content = document.createElement("p");
  Content.classList.add("diary");
  Content.classList.add("content");
  Content.textContent = content;
  root.appendChild(Content);
  return root;
}
