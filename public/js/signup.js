"use strict";

/** @type {HTMLInputElement} */
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");

async function checkId() {
  const username = usernameInput.value;
  if (!username) {
    usernameInput.reportValidity();
    usernameInput.focus();
    return;
  }
  // 서버에 아이디 중복확인 요청
  if (await isDupl(username)) {
    usernameInput.setCustomValidity(
      "이미 사용중인 아이디입니다. 다른 아이디를 입력해주세요."
    );
    usernameInput.reportValidity();
    usernameInput.focus();
    return;
  }
}

async function isDupl(username) {
  const res = await fetch(`/api/signup/is-dupl?username=${username}`);
  if (res.ok) {
    const { result } = await res.json();
    return result;
  }
}

async function checkPw() {
  const password = passwordInput.value;
  if (!password) {
    passwordInput.reportValidity();
    passwordInput.focus();
    return;
  }
}
