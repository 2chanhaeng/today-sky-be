const apiDateURL = `/api${window.location.pathname}`; // get, post, deleteAll
const apiIndivURL = (id) => `/api/todo/${id}`; // put, patch, delete
console.log(apiDateURL);
const todoForm = document.forms.todoForm;
const todoList = document.querySelector("ul#todoList");
const clearBtn = document.getElementById("clear");

todoForm.addEventListener("submit", addTodo);
clearBtn.addEventListener("click", clearTodoList);
initTodo();

async function initTodo() {
  // 서버에서 투두리스트를 가져와서 화면에 렌더링
  const todos = await (await fetch(apiDateURL)).json();
  todos.forEach(({ id, checked, content }) => appendTodo(id, checked, content));
}

async function removeTodo(e) {
  // 투두 ID 추출
  const todo = e.target.closest("li");
  const id = Number(todo.id);
  try {
    // 서버에서 투두 삭제
    const res = await deleteTodo(id);
    if (!res.ok) throw new Error(res.status);
    // 화면에서 투두 삭제
    todoList.removeChild(todo);
    console.log("투두리스트가 성공적으로 삭제되었습니다.");
  } catch (error) {
    console.error("투두리스트 삭제 중 오류가 발생했습니다.", error);
  }
}

async function deleteTodo(id) {
  // 서버에서 투두 삭제
  try {
    const res = await fetch(apiIndivURL(id), { method: "DELETE" });
    if (!res.ok) throw new Error(res.status);
    return res;
  } catch {
    console.error("투두리스트 삭제 중 오류가 발생했습니다.", error);
  }
}

async function clearTodoList(e) {
  // 서버에서 투두리스트 전체 삭제
  try {
    const res = await fetch(apiDateURL, { method: "DELETE" });
    if (!res.ok) throw new Error(res.status);
    Array.from(todoList.children).forEach((child) => child.remove());
  } catch (error) {
    console.error("투두리스트 전체 삭제 중 오류가 발생했습니다.", error);
  }
}

async function addTodo(e) {
  e.preventDefault();
  const todo = todoForm.todo.value;
  try {
    if (todo !== "") {
      // 투두리스트를 서버에 저장 후 아이디 값 수신
      const { id, checked } = await postTodo(todo);
      // 화면에 투두리스트 추가
      appendTodo(id, checked, todo);
    }
    todoForm.reset();
  } catch (error) {
    console.error("투두리스트 추가 중 오류가 발생했습니다.", error);
  }
}

function appendTodo(id, checked, value) {
  /**
   * <li id="${id}">
   *   <input type="checkbox" id="${id}check">
   *   <label for="${id}check">${value}</label>
   *   <button class="delete">x</button>
   * </li>
   */
  const li = document.createElement("li");
  li.id = id;
  li.innerHTML = `
  <input type="checkbox" id="${id}check" ${checked ? "checked" : ""}>
  <label for="${id}check">${value}</label>
  <button class="delete">x</button>
  `;
  li.querySelector('input[type="checkbox"]').addEventListener(
    "change",
    toggleTodo
  );
  li.querySelector(".delete").addEventListener("click", removeTodo);
  todoList.appendChild(li);
  document.querySelector("section").style.display = "block";
}

async function toggleTodo(e) {
  const todo = e.target.closest("li");
  const id = Number(todo.id);
  const checked = e.target.checked;
  try {
    const res = await fetch(apiIndivURL(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked }),
    });
    if (!res.ok) throw new Error(res.status);
    console.log("투두리스트가 성공적으로 수정되었습니다.");
  } catch (error) {
    console.error("투두리스트 수정 중 오류가 발생했습니다.", error);
  }
}

async function postTodo(content) {
  try {
    const res = await fetch(apiDateURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error(res.status);
    const { id, checked } = await res.json();
    console.log("투두리스트가 성공적으로 저장되었습니다.");
    return { id, checked };
  } catch (error) {
    console.error("투두리스트 저장 중 오류가 발생했습니다.", error);
  }
}
