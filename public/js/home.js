const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const date = today.getDate();

const todoAnchor = document.createElement("a");
todoAnchor.href = `/todo/${year}/${month}/${date}`;
todoAnchor.textContent = "오늘의 할 일";
document.body.append(todoAnchor);

const diaryAnchor = document.createElement("a");
diaryAnchor.href = `/diary/${year}/${month}/${date}`;
diaryAnchor.textContent = "오늘의 일기";
document.body.append(diaryAnchor);

const todosAnchor = document.createElement("a");
todosAnchor.href = `/todo/${year}/${month}`;
todosAnchor.textContent = "이번 달 할 일";
document.body.append(todosAnchor);

const diariesAnchor = document.createElement("a");
diariesAnchor.href = `/diary/${year}/${month}`;
diariesAnchor.textContent = "이번 달 일기";
document.body.append(diariesAnchor);

function signup() {
  location.href = "/signup";
}

function login() {
  location.href = "/login";
}
