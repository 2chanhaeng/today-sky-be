"use strict";

import fillCalendar from "../components/calendar.js";
import { getYMFromUrl } from "../utils/date.js";

const calendar = document.querySelector("#calendar");
const [year, month] = getYMFromUrl();
fillCalendar(year, month, "todo", calendar);

// todos
const todosByDate = document.querySelector("#todos-by-date");
renderTodosByDate(todosByDate);

async function renderTodosByDate(root) {
  // api로 데이터 불러오기
  const todosByDate = await getTodosByDate();
  Object.entries(todosByDate)
    // 날짜 순으로 정렬하기
    .sort(([date1], [date2]) => date1 - date2)
    // 날짜 별 Todos 생성하기
    .map(([date, todos]) => Todos(date, todos))
    // todoList에 추가하기
    .forEach((todos) => root.appendChild(todos));
}
/**
 * @typedef {Object} Todo
 * @property {number} date
 * @property {number} id
 * @property {string} content
 * @property {boolean} [checked]
 * @property {string} [comment]
 * @property {string} [feel]
 *
 * @returns {Promise<{[date: number]: Todo}>}
 */
async function getTodosByDate() {
  const res = await fetch(`/api/todo/${year}/${month}`);
  const todos = await res.json();
  return todos;
}

function Todos(date, todos) {
  // todos of date root
  const root = document.createElement("article");
  root.classList.add("todos");
  // date
  const Date = document.createElement("a");
  Date.classList.add("date-of-todo");
  Date.textContent = `${date}일`;
  Date.href = `/todo/${year}/${month}/${date}`;
  root.appendChild(Date);
  // todos
  const TodosOfDate = document.createElement("dl");
  TodosOfDate.classList.add("todos");
  todos.map(Todo).forEach(([dt, dd]) => {
    TodosOfDate.appendChild(dt);
    TodosOfDate.appendChild(dd);
  });
  root.appendChild(TodosOfDate);
  return root;
}

/**
 * @param {Todo} param0
 * @return {HTMLDListElement[]}
 */
function Todo({ id, checked, content, comment, feel }) {
  // dt
  const Content = document.createElement("dt");
  Content.id = `todo-${id}`;
  // label for checkbox, content
  const label = document.createElement("label");
  Content.appendChild(label);
  // checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = checked;
  label.appendChild(checkbox);
  // content
  label.appendChild(document.createTextNode(content));
  // dd for comment, emotion
  const Comment = document.createElement("dd");
  Comment.id = `todo-${id}-comment`;
  // comment
  if (comment) {
    Comment.appendChild(document.createTextNode(comment));
    // emotion
    if (feel) {
      const emotionImg = document.createElement("img");
      emotionImg.classList.add("emotion");
      emotionImg.src = `/feel/${feel}`;
      Comment.appendChild(emotionImg);
    }
  }
  return [Content, Comment];
}
