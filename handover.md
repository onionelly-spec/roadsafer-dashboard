# 로드세이프티시스템(RSS) 대시보드 퍼블리싱 인수인계 문서

이 문서는 로드세이프티시스템(RSS) 대시보드 웹 퍼블리싱 산출물을 Java + MariaDB 개발 환경(Spring Boot + Thymeleaf 등)에 적용하기 위한 가이드입니다.

## 1. 프로젝트 개요 및 기술 스택

본 퍼블리싱 결과물은 프론트엔드 프레임워크(React, Vue 등)에 종속되지 않은 **순수 HTML, CSS, JavaScript**로 작성되었습니다.

* **HTML**: HTML5 시맨틱 태그 활용, BEM 방법론 및 직관적 클래스명 혼용
* **CSS**: Tailwind CSS (CDN 방식) + 커스텀 CSS (`rss-common.css`)
* **JavaScript**: Vanilla JS (ES6+) 프레임워크 비종속 (`rss-common.js`)
* **아이콘**: Lucide Icons (CDN 방식, `data-lucide` 속성 사용)
* **폰트**: Pretendard (CDN 방식)
* **반응형**: 데스크탑, 태블릿, 모바일(모바일 최우선 또는 미디어 쿼리 적용) 지원

> **주의사항 (Tailwind CSS)**: 현재 개발 편의를 위해 Tailwind CSS를 CDN 방식(`<script src="https://cdn.tailwindcss.com"></script>`)으로 불러오고 있습니다. 실제 운영 서버 배포 시에는 성능 향상을 위해 Tailwind CLI나 PostCSS를 이용해 **빌드된 정적 CSS 파일**로 교체하는 것을 권장합니다.

## 2. 파일 구조 및 역할

전달드리는 산출물의 주요 파일 구조는 다음과 같습니다.

| 파일명 | 역할 및 설명 |
| :--- | :--- |
| `index.html` | 메인 대시보드 화면 |
| `login.html` | 로그인 화면 (사이드바/헤더 없음, 1:1.5 패널 비율 적용) |
| `notice.html` | 공지사항 목록 화면 |
| `notice-detail.html` | 공지사항 상세 화면 |
| `community.html` | 커뮤니티 목록 화면 |
| `community-detail.html` | 커뮤니티 상세 화면 |
| `construction-info.html` | 공사 정보 목록 화면 |
| `construction-info-detail.html` | 공사 정보 상세 화면 (공사정보/차단정보/진행상황 탭 포함) |
| `sidebar.html` | **공통 사이드바 컴포넌트** (로고, 메뉴, 하단 버튼 등) |
| `header.html` | **공통 헤더 컴포넌트** (모바일 토글, 페이지 타이틀, 알림, 사용자 정보) |
| `rss-common.css` | 공통 디자인 시스템 (색상 변수, 타이포그래피, 버튼, 폼, 테이블, 레이아웃 등) |
| `rss-common.js` | 공통 인터랙션 스크립트 (컴포넌트 삽입, 사이드바 토글, 탭 전환, 모달, 토스트 등) |
| `logo-rss.png` | RSS 공식 로고 이미지 |

## 3. 공통 컴포넌트 (사이드바 / 헤더) 적용 방법

현재 퍼블리싱 파일은 `rss-common.js`의 `fetch()` API를 이용해 `sidebar.html`과 `header.html`을 각 페이지에 동적으로 삽입하고 있습니다. Java (Thymeleaf) 환경으로 전환 시 이 방식을 **서버 사이드 인클루드(Server-side Include)** 방식으로 변경해야 합니다.

### 3.1. Thymeleaf Fragment 전환 방법

1. `sidebar.html`과 `header.html`의 내용을 `/templates/fragments/` 폴더로 이동합니다.
2. `rss-common.js` 최상단에 있는 `0. 공통 컴포넌트 fetch 삽입` 로직 전체를 **삭제하거나 주석 처리**합니다.
3. 각 HTML 페이지의 Placeholder 영역을 Thymeleaf 문법으로 교체합니다.

**변경 전 (현재 퍼블리싱 마크업)**
```html
<!-- 사이드바 -->
<div id="rss-sidebar-wrap"></div>

<!-- 헤더 -->
<div id="rss-header-wrap" data-title="공지사항"></div>
```

**변경 후 (Thymeleaf 적용 예시)**
```html
<!-- 사이드바 -->
<div th:replace="fragments/sidebar :: sidebar"></div>

<!-- 헤더 (파라미터로 페이지 타이틀 전달) -->
<div th:replace="fragments/header :: header(title='공지사항')"></div>
```

### 3.2. 활성 메뉴 (Active) 처리

현재는 `rss-common.js`에서 현재 URL을 파싱하여 사이드바 메뉴에 `active` 클래스를 자동으로 부여하고 있습니다. Thymeleaf 환경에서는 컨트롤러에서 현재 메뉴 코드를 모델에 담아 전달하고, 조건문으로 클래스를 추가하는 방식을 권장합니다.

**Thymeleaf 적용 예시 (`sidebar.html` 내부)**
```html
<a th:href="@{/notice}" 
   class="rss-nav__link" 
   th:classappend="${currentMenu == 'notice'} ? 'active'">
  <span class="rss-nav__icon"><i data-lucide="bell"></i></span>
  <span class="rss-nav__label">공지사항</span>
</a>
```

## 4. 데이터 바인딩 가이드

퍼블리싱 소스 코드 내에는 Java 개발자가 데이터를 쉽게 바인딩할 수 있도록 **HTML 주석** 형태로 가이드가 포함되어 있습니다.

* `<!-- [DB] tbl_user: user_name, company_name -->`: 연관된 데이터베이스 테이블 및 컬럼 정보
* `<!-- [Java] ${session.loginUser.userName} -->`: 추천하는 Thymeleaf 표현식 예시

### 4.1. 폼(Form) 요소 명명 규칙

`input`, `select`, `textarea` 등의 `name`과 `id` 속성은 실제 데이터베이스 컬럼명과 최대한 유사하게 작성되었습니다. (예: `user_id`, `user_pw`, `board_title`, `board_content` 등) 백엔드 DTO(VO)와 매핑할 때 이 속성값들을 참고하시기 바랍니다.

### 4.2. 더미 데이터 및 이미지 교체

* 목록(Table)이나 카드(Card) UI에는 디자인 확인을 위한 더미 데이터가 반복적으로 하드코딩되어 있습니다. `th:each`를 사용해 반복 처리하고, 나머지 더미 요소는 삭제하시면 됩니다.
* 프로필 사진이나 첨부파일 썸네일 등은 `https://placehold.co/` 서비스의 이미지 링크를 사용 중입니다. 실제 업로드된 파일의 URL 경로나 기본 이미지 경로(`/assets/images/default.png` 등)로 교체해 주십시오. (단, `logo-rss.png`는 실제 로고 파일이므로 정적 리소스 폴더로 이동하여 사용합니다.)

## 5. 정적 리소스(Assets) 경로 설정

현재 모든 CSS, JS, 이미지 파일이 HTML과 동일한 폴더에 위치해 있습니다. Spring Boot 프로젝트 구조에 맞게 정적 리소스를 이동하고, HTML의 `<head>` 영역과 하단 `<script>` 영역의 경로를 수정해야 합니다.

**Spring Boot 권장 디렉토리 구조 예시**
```text
src/main/resources/
 ├── static/
 │    ├── assets/
 │    │    ├── css/rss-common.css
 │    │    ├── js/rss-common.js
 │    │    └── images/logo-rss.png
 ├── templates/
 │    ├── fragments/
 │    │    ├── sidebar.html
 │    │    └── header.html
 │    ├── index.html
 │    └── notice.html
```

**경로 수정 예시 (Thymeleaf)**
```html
<!-- CSS -->
<link rel="stylesheet" th:href="@{/assets/css/rss-common.css}" />

<!-- JS -->
<script th:src="@{/assets/js/rss-common.js}"></script>

<!-- 이미지 -->
<img th:src="@{/assets/images/logo-rss.png}" alt="로고" />
```

## 6. 추가 확인 사항

* **Lucide 아이콘**: 아이콘은 `lucide.createIcons()` 함수를 통해 렌더링됩니다. Ajax나 Fetch를 통해 동적으로 DOM이 추가되는 경우, 해당 함수를 다시 호출해 주어야 아이콘이 정상적으로 표시됩니다.
* **모달 및 탭 기능**: `rss-common.js`에 `data-modal-open`, `data-tab` 속성을 이용한 공통 스크립트가 구현되어 있습니다. 별도의 커스텀 JS 작성 없이 HTML 속성만으로 동작을 제어할 수 있습니다.
* **로컬 테스트 시 주의사항**: 현재 퍼블리싱 상태에서 HTML 파일을 브라우저로 직접 열면(`file://` 프로토콜), CORS 정책으로 인해 `fetch()`가 동작하지 않아 사이드바와 헤더가 보이지 않습니다. 반드시 Live Server(VS Code 확장)나 로컬 웹 서버 환경에서 확인하시기 바랍니다.
