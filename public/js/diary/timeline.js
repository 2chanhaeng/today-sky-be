const currentPath = window.location.pathname;
var diaryradio = document.getElementById("diarytimeline");
var todoradio = document.getElementById("todotimeline");

if (currentPath === "/diary/timeline") {
  const diaryradio = document.getElementById("diarytimeline");
  diaryradio.checked = true;
}

const radioButtons = document.querySelectorAll(
  'input[type="radio"][name="page"]'
);

// 라디오 버튼 변경 시 페이지 이동 함수
function handleRadioChange() {
  if (this.checked) {
    const pageValue = this.value;
    window.location.href = pageValue; // 페이지 변경을 위한 URL 이동
  }
}

// 라디오 버튼에 이벤트 리스너 추가
radioButtons.forEach((button) => {
  button.addEventListener("change", handleRadioChange);
  diarytimeline.addEventListener("click", function () {
    diarytimeline.checked = true;
  });
  todotimeline.addEventListener("click", function () {
    todotimeline.checked = true;
  });
});
window.onload = function () {
  buildCalendar();
}; // 웹 페이지가 로드되면 buildCalendar 실행
let newDIV = document.createElement("p");

let nowMonth = new Date(); // 현재 달을 페이지를 로드한 날의 달로 초기화
let today = new Date(); // 페이지를 로드한 날짜를 저장
today.setHours(0, 0, 0, 0); // 비교 편의를 위해 today의 시간을 초기화
const calMonth = document.getElementById("calMonth");

// 달력 생성 : 해당 달에 맞춰 테이블을 만들고, 날짜를 채워 넣는다.
function buildCalendar() {
  let firstDate = new Date(nowMonth.getFullYear(), nowMonth.getMonth(), 1); // 이번달 1일
  let lastDate = new Date(nowMonth.getFullYear(), nowMonth.getMonth() + 1, 0); // 이번달 마지막날

  let tbody_Calendar = document.querySelector(".Calendar > tbody");
  document.getElementById("calYear").innerText = nowMonth.getFullYear(); // 연도 숫자 갱신
  document.getElementById("calMonth").innerText = leftPad(
    nowMonth.getMonth() + 1
  ); // 월 숫자 갱신

  while (tbody_Calendar.rows.length > 0) {
    // 이전 출력결과가 남아있는 경우 초기화
    tbody_Calendar.deleteRow(tbody_Calendar.rows.length - 1);
  }

  let nowRow = tbody_Calendar.insertRow(); // 첫번째 행 추가

  for (let j = 0; j < firstDate.getDay(); j++) {
    // 이번달 1일의 요일만큼
    let nowColumn = nowRow.insertCell(); // 열 추가
  }

  for (
    let nowDay = firstDate;
    nowDay <= lastDate;
    nowDay.setDate(nowDay.getDate() + 1)
  ) {
    // day는 날짜를 저장하는 변수, 이번달 마지막날까지 증가시키며 반복

    let nowColumn = nowRow.insertCell(); // 새 열을 추가하고

    let newDIV = document.createElement("p");
    newDIV.innerHTML = leftPad(nowDay.getDate()); // 추가한 열에 날짜 입력
    nowColumn.appendChild(newDIV);

    let newIMG = document.createElement("img");
    newIMG.append("");

    if (nowDay.getDay() == 6) {
      // 토요일인 경우
      nowRow = tbody_Calendar.insertRow(); // 새로운 행 추가
    }
  }
}
// 이전달 버튼 클릭
function prevCalendar() {
  nowMonth = new Date(
    nowMonth.getFullYear(),
    nowMonth.getMonth() - 1,
    nowMonth.getDate()
  ); // 현재 달을 1 감소
  buildCalendar(); // 달력 다시 생성
}
// 다음달 버튼 클릭
function nextCalendar() {
  nowMonth = new Date(
    nowMonth.getFullYear(),
    nowMonth.getMonth() + 1,
    nowMonth.getDate()
  ); // 현재 달을 1 증가
  buildCalendar(); // 달력 다시 생성
}
