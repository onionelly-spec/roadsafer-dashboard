# 로드세이프티시스템(RSS) 퍼블리싱 규칙 준수 현황 분석 보고서

> 분석 기준일: 2026-04-30  
> 분석 대상: `/roadsafer-dashboard` 전체 HTML(31개), `rss-common.css`, `rss-common.js`, `00-03.용어사전.md`, `handover.md`

---

## 종합 평가

| 규칙 영역 | 준수 수준 | 비고 |
|---|---|---|
| 1-1. 디자인 시스템 (Color/Typography/Spacing) | **양호** | 일부 임의 색상값 직접 사용 존재 |
| 1-2. 공통 CSS 자산화 | **양호** | 일부 페이지별 임의 클래스 잔존 |
| 2-1. ID/Class 명명 규칙 (용어사전 기준) | **양호** | 용어사전 기반 `rss-` 접두사 체계 확립 |
| 2-2. HTML5 시맨틱 마크업 | **부분 준수** | `<main>` 사용은 양호, `<section>/<article>/<nav>` 미사용 다수 |
| 2-3. 데이터 바인딩 주석 (`[Java]`) | **양호** | 핵심 페이지 적용, 일부 페이지 미흡 |
| 3-1. Tailwind CSS CDN 방식 | **준수** | 전체 31개 파일 통일 적용 |
| 3-2. Tailwind 중복 클래스 추상화 | **부분 준수** | 일부 인라인 Tailwind 클래스 잔존 |
| 3-3. 반응형 대응 | **부분 준수** | 8개 파일 `@media` 미적용 |
| 3-4. Vanilla JS | **준수** | 외부 JS 라이브러리 의존성 없음 |

---

## 1. 디자인 시스템 및 공통 스타일 준수

### 1-1. Color Palette / Typography / Spacing

`rss-common.css`에 CSS 변수(`--rss-primary`, `--rss-text-*`, `--rss-spacing-*` 등)가 체계적으로 정의되어 있으며, 대부분의 페이지에서 이를 올바르게 참조하고 있습니다. 다만 일부 HTML 파일의 `<style>` 태그 내에 CSS 변수를 거치지 않고 HEX 값을 직접 사용하는 사례가 확인되었습니다.

**임의 색상값 직접 사용 사례 (발췌)**

| 파일 | 사용 위치 | 값 |
|---|---|---|
| community.html | `.comm-kebab-btn:hover` | `#f3f4f6`, `#374151` |
| community.html | `.comm-kebab-menu button.danger` | `#dc2626`, `#fef2f2` |
| construction-detail.html | `.text-modified` | `#dc2626` |
| construction-detail.html | `.detail-status-label` | `#374151` |
| approval.html | 상태 배지 | `#94a3b8` |

이 값들은 `--rss-danger`, `--rss-text-secondary` 등 기존 CSS 변수로 대체 가능합니다.

### 1-2. 공통 CSS 자산화

`rss-common.css`는 버튼, 입력창, 카드, 모달, 테이블, 배지, 토스트 등 주요 UI 컴포넌트를 클래스화하여 관리하고 있습니다. 그러나 일부 페이지에서 공통 클래스를 사용하지 않고 페이지 고유 클래스를 별도 정의한 사례가 있습니다.

**공통 CSS 미사용 임의 클래스 사례**

| 클래스명 | 사용 파일 | 공통 대체 가능 클래스 |
|---|---|---|
| `reg-input` | register-*.html | `rss-form-input` |
| `reg-alert-modal`, `reg-alert-modal__box` | register-*.html | `notice-modal`, `notice-modal__body` |
| `reg-input-hint` | register-*.html | `rss-form-hint` |
| `reg-file-btn` | register-*.html | `rss-btn rss-btn--outline` |
| `td-amount` | construction-list.html | `rss-table__td` + 인라인 정렬 |

---

## 2. 개발자 친화적 코드 구조

### 2-1. ID/Class 명명 규칙 (용어사전 기준)

`rss-` 접두사 체계가 확립되어 있으며, 용어사전(`00-03.용어사전.md`)과 연계된 DB 컬럼명 기반 `name` 속성이 폼 요소에 일관되게 적용되어 있습니다. 예를 들어 `name="mberId"`, `name="bizNo1"`, `name="smsReceiveYn"` 등이 용어사전의 영문약어 규칙을 따르고 있습니다.

다만 `tma-card__row`, `tma-card__label`, `clist-mobile-card__*`, `quick-item__*` 등 페이지 고유 BEM 클래스는 용어사전에 등재되지 않은 상태입니다. 개발팀 인계 전 용어사전에 추가가 필요합니다.

### 2-2. HTML5 시맨틱 마크업

`<main>` 태그는 대부분의 페이지에서 사용되고 있으나, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>` 등의 시맨틱 태그는 거의 사용되지 않고 있습니다.

**시맨틱 태그 사용 현황**

| 파일 | `<main>` | `<header>` | `<nav>` | `<section>` | `<article>` | `<footer>` |
|---|---|---|---|---|---|---|
| index.html | O | X | X | X | X | X |
| construction-list.html | O | X | X | X | X | X |
| tma-card.html | O | X | X | X | X | X |
| profile.html | O | X | X | X | X | X |
| login.html | X | X | X | X | X | X |
| register-company.html | O | O | O | X | X | X |
| find-id.html | X | X | X | X | X | X |
| find-password.html | X | X | X | X | X | X |
| notice.html | O | X | X | X | X | X |
| community.html | O | X | X | X | X | X |

`login.html`, `find-id.html`, `find-password.html`은 `<main>` 태그조차 사용되지 않고 있어 시맨틱 구조 보완이 필요합니다. 사이드바/헤더가 공통 컴포넌트로 분리된 구조상 `<header>`, `<nav>`가 `sidebar.html`과 `header.html`에 위치해야 하므로, 개별 페이지에서의 부재는 구조적으로 허용 가능합니다. 단, `<section>`과 `<article>` 활용은 전반적으로 미흡합니다.

### 2-3. 데이터 바인딩 주석 (`[Java]`)

핵심 업무 페이지(index.html, construction-list.html, construction-detail.html, approval.html 등)에는 `<!-- [Java] ... -->`, `<!-- [DB] ... -->` 형식의 바인딩 주석이 체계적으로 적용되어 있습니다. 그러나 아래 페이지들은 바인딩 주석이 없거나 매우 부족합니다.

**바인딩 주석 미흡 파일**

| 파일 | 상태 |
|---|---|
| terms.html | 정적 콘텐츠로 바인딩 불필요 (허용) |
| privacy.html | 정적 콘텐츠로 바인딩 불필요 (허용) |
| find-id.html | 결과 영역에 바인딩 주석 없음 |
| find-password.html | 결과 영역에 바인딩 주석 없음 |
| community-write.html | 등록 폼 필드에 주석 미흡 |
| market-write.html | 등록 폼 필드에 주석 미흡 |

---

## 3. 기술적 사양

### 3-1. Tailwind CSS CDN 방식

전체 31개 HTML 파일 모두 `https://cdn.tailwindcss.com` CDN 방식으로 통일 적용되어 있습니다. `handover.md`에 운영 배포 시 빌드된 정적 CSS 파일로 교체 권장 사항이 명시되어 있습니다.

### 3-2. Tailwind 중복 클래스 추상화

대부분의 반복 UI 패턴은 `rss-common.css`의 커스텀 클래스로 추상화되어 있습니다. 다만 일부 파일에서 Tailwind 유틸리티 클래스를 직접 조합하여 사용하는 사례가 잔존합니다.

**추상화 미흡 사례**

| 패턴 | 사용 빈도 | 추상화 권장 클래스 |
|---|---|---|
| `flex items-center` | 17회 이상 | `rss-flex-center` 또는 기존 클래스 활용 |
| `text-gray-500` | 6회 이상 | `rss-text-muted` |
| `justify-between` | 6회 이상 | `rss-flex-between` |
| `gap-2`, `gap-3` | 7회 이상 | `rss-gap-sm`, `rss-gap-md` |

### 3-3. 반응형 대응

`rss-common.css`에 모바일/태블릿/데스크탑 미디어 쿼리가 체계적으로 정의되어 있으며, 주요 업무 페이지는 반응형이 적용되어 있습니다. 그러나 아래 파일들은 페이지 고유 `@media` 쿼리가 없습니다.

**반응형 미적용 파일**

| 파일 | 비고 |
|---|---|
| ad.html | 광고 상세 페이지 — 반응형 보완 필요 |
| community-write.html | 글쓰기 폼 — 반응형 보완 필요 |
| construction-info-detail.html | 공사정보 상세 — 반응형 보완 필요 |
| market-write.html | 장터 글쓰기 — 반응형 보완 필요 |
| notice-detail.html | 공지사항 상세 — 반응형 보완 필요 |
| footer.html | 공통 컴포넌트 (rss-common.css 의존) |
| header.html | 공통 컴포넌트 (rss-common.css 의존) |
| sidebar.html | 공통 컴포넌트 (rss-common.css 의존) |

`footer.html`, `header.html`, `sidebar.html`은 공통 컴포넌트로서 `rss-common.css`의 반응형 규칙에 의존하므로 별도 `@media` 부재는 허용 가능합니다.

### 3-4. Vanilla JS 준수

`rss-common.js`는 ES6+ 순수 자바스크립트로 작성되었으며, jQuery 등 외부 JS 라이브러리 의존성이 전혀 없습니다. Lucide Icons는 아이콘 렌더링 전용 경량 라이브러리로, JS 인터랙션 로직과 분리되어 있어 규칙 위반에 해당하지 않습니다.

---

## 개발팀 인계 적합성 평가

### 강점

`handover.md`에 Thymeleaf Fragment 전환 방법, 공통 컴포넌트 처리, DB 연동 가이드가 상세히 기술되어 있어 개발팀이 퍼블리싱 파일을 Java 환경에 적용하는 데 필요한 정보가 충분히 제공됩니다. 폼 `name` 속성이 용어사전 기반 DB 컬럼명으로 설정되어 있어 Java VO 매핑이 용이합니다. `rss-common.js`의 목차 주석과 Thymeleaf 전환 가이드가 파일 상단에 명시되어 있어 개발자가 퍼블리싱 코드를 빠르게 이해할 수 있습니다.

### 개선 권고 사항

아래 사항들은 개발팀 인계 전 보완을 권고합니다.

| 우선순위 | 항목 | 대상 파일 |
|---|---|---|
| 높음 | `register-*.html`의 임의 클래스(`reg-input`, `reg-alert-modal` 등)를 공통 CSS로 통합 | register-company.html, register-employee.html |
| 높음 | `login.html`, `find-id.html`, `find-password.html`에 `<main>` 시맨틱 태그 추가 | 3개 파일 |
| 중간 | `find-id.html`, `find-password.html`, `community-write.html`, `market-write.html`에 바인딩 주석 추가 | 4개 파일 |
| 중간 | `ad.html`, `community-write.html`, `construction-info-detail.html`, `market-write.html`, `notice-detail.html`에 반응형 미디어 쿼리 보완 | 5개 파일 |
| 낮음 | 임의 HEX 색상값을 CSS 변수로 교체 | community.html, construction-detail.html, approval.html |
| 낮음 | 용어사전에 페이지 고유 BEM 클래스 등재 | 00-03.용어사전.md |
