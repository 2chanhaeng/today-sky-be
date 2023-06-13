"use strict";

const isToday = isTheDate();

function isTheDate(today = new Date()) {
  return (date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
}

export default function fillCalendar(year, month, app, root) {
  root.appendChild(Header(year, month, app));
  root.appendChild(Weekdays());
  root.appendChild(Calendar(year, month, app));
  root.appendChild(Footer());
}

function Header(year, month, app, root = document.createElement("header")) {
  root.classList.add("calendar");
  // <
  const prev = document.createElement("a");
  const prevDate = new Date(year, month - 1, 0);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth() + 1;
  prev.href = `/${app}/${prevYear}/${prevMonth}`;
  prev.textContent = "<";
  root.appendChild(prev);
  // yyyy . mm
  const h2 = document.createElement("h2");
  h2.textContent = `${year} . ${month}`;
  root.appendChild(h2);
  // >
  const next = document.createElement("a");
  const nextDate = new Date(year, month, 1);
  const nextYear = nextDate.getFullYear();
  const nextMonth = nextDate.getMonth() + 1;
  next.href = `/${app}/${nextYear}/${nextMonth}`;
  next.textContent = ">";
  root.appendChild(next);
  return root;
}

function Weekdays(root = document.createElement("div")) {
  root.classList.add("calendar");
  root.classList.add("weekdays");
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
    const div = document.createElement("div");
    div.textContent = day;
    div.classList.add(day.toLowerCase());
    div.classList.add("day");
    root.appendChild(div);
  });
  return root;
}

function Calendar(year, month, app, root = document.createElement("section")) {
  root.classList.add("calendar");
  root.classList.add("dates");
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const firstSun = new Date(
    first.getFullYear(),
    first.getMonth(),
    1 - first.getDay()
  );
  const lastSat = new Date(
    last.getFullYear(),
    last.getMonth(),
    last.getDate() + (6 - last.getDay())
  );
  const [fsy, fsm, fsd] = [
    firstSun.getFullYear(),
    firstSun.getMonth() + 1,
    firstSun.getDate(),
  ];
  const dates = Array.from(
    { length: (lastSat - firstSun) / 86400000 + 1 },
    (_, i) => new Date(fsy, fsm - 1, fsd + i)
  );
  const DateDiv = createDateDiv(app, month);
  dates.map(DateDiv).forEach((div) => root.appendChild(div));
  return root;
}

function createDateDiv(app, month) {
  return function (date) {
    const div = document.createElement("div");
    const dateMonth = date.getMonth() + 1;
    const dateDate = date.getDate();
    const monthClass = compareMonth(dateMonth, month) + "-month";
    div.classList.add(monthClass);
    if (isToday(date)) div.classList.add("today");
    const anchor = document.createElement("a");
    anchor.href = `/${app}/${date.getFullYear()}/${dateMonth}/${dateDate}`;
    anchor.textContent = dateDate === 1 ? `${dateMonth}/${dateDate}` : dateDate;
    div.appendChild(anchor);
    return div;
  };
}

function compareMonth(month, basis) {
  const diff = (month - basis) % 12;
  return diff === 0 ? "this" : diff === 1 ? "next" : "prev";
}

function Footer(root = document.createElement("footer")) {
  root.classList.add("calendar");
  return root;
}
