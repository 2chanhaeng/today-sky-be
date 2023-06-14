---
marp: true
style: @import url('https://unpkg.com/tailwindcss@^2/dist/utilities.min.css');
---

# 그날의 하늘

## 2021년 10월 10일

> 이찬행(조장), 권대용, 엄준석, 임지현, 최하영

---

# 접속

![QR코드](/public/images/qr코드.png)

# https://today-sky.chomu.dev/startpage

---

# 앱 소개

- 감정에 휘둘리지 않고 나 자신을 아끼고 챙기는 가장 첫 단계는 바로 감정을 기록하는 것이다.
- '그날의 하늘'은 오늘 있었던 일들과 오늘 느꼈던 감정들을 기록할 수 있도록 제작한 웹 사이트
- 이에 더불어 할 일도 기록하고, 그 할 일 혹은 한 일 에 따른 감정, 생각 기록 가능하다.

---

# 기술 스팩

- 언어
  - HTML, CSS, JS
  - TypeScript
- FE
  - EJS
- BE
  - Node.js
  - Express
  - CloudType

---

# 기술 스팩

- DB
  - MySQL
  - FreeDB tech
- 코드 관리
  - Git
  - GitHub
- 기타
  - Slack
  - Notion

---

# 왜?

- Typesctipt
  - 에러와 타입을 미리 확인할 수 있어서 오류를 줄일 수 있음.
  - 강력한 타입 체크로 코드의 가독성을 높일 수 있음.
- CloudType
  - 빠르고 쉽게 API 구축이 가능
  - **무료**

---

# DB 설계

![DB 설계](/public/images/db%EC%84%A4%EA%B3%84.png)

---

# API 명세

![API 명세](/public/images/API%20%EB%AA%85%EC%84%B8.jpg)

---

# 페이지 명세

| Path                        | Description                            |
| --------------------------- | -------------------------------------- |
| /                           | 메인 페이지                            |
| /login                      | 로그인 페이지                          |
| /signup                     | 회원가입 페이지                        |
| /diary                      | /diary/`year`/`month` 리다이렉트       |
| /diary/`year`/`month`       | `year`년 `month`월 일기 페이지         |
| /diary/`year`/`month`/`day` | `year`년 `month`월 `day`일 일기 페이지 |

---

# 페이지 명세

| Path                       | Description                             |
| -------------------------- | --------------------------------------- |
| /todo/`year`/`month`       | `year`년 `month`월 TODO 페이지          |
| /todo/`year`/`month`/`day` | `year`년 `month`월 `day`dlf TODO 페이지 |

---

# 소감

- 이찬행
  - git 관리 잘 하고 커밋, PR 메세지를 자세히 남깁시다. PM 너무 힘들어집니다. 🥲
  - 코드는 제발 복붙하지 말고 git을 써서 공유합시다. 컨플릭트가 한 번에 열 몇 개씩 나요. 😱
  - Next.js 도 써보고 싶었는데 이미 팀원들이 어려워하는 부분이 많아서 하지 못했습니다.
  - 타입 확인을 잘 하고 `any`는 절대 쓰지 말아주세요. (5시간 날림)
  - 팀원 간의 포매터 설정 동기화는 되도록 빨리 합시다. 4자릿수 커밋 기록이 남아요. 😇
  - 팀 프로젝트는 남들한테 맞춰가면서 뭘 해야할지 보다는 뭘 하고 싶은지를 생각하고 실천하는 것이 좋다고 생각합니다.

---

# 소감

- 권대용

---

# 소감

- 엄준석

---

# 소감

- 임지현

---

# 소감

- 최하영

---

# 감사합니다!
