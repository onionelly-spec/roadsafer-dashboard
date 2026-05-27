# 관리자 사이트 공통 CSS 마무리 점검 보고서

> 점검 기준: `adm/adm-common-v2.css` + `rss-common.css` (총 617개 클래스 정의)
> 점검 대상: `adm/*.html` 24개 파일 (`page-list.html` 제외)
> 점검 항목: ① `<style>` 태그 사용 ② 인라인 `style=` ③ 공통 CSS 미정의 클래스

---

## ① `<style>` 태그 사용 현황

| 결과 | 내용 |
|------|------|
| **이상 없음** | 24개 파일 모두 `<style>` 태그 없음 (page-list.html은 독립 참조 페이지로 제외) |

---

## ② 인라인 `style=` 사용 현황

### 공통 패턴 (허용 — 기존 전체 페이지 일관 사용)

| 패턴 | 사용 파일 수 | 비고 |
|------|------------|------|
| `style="display:none;"` | 11개 | 전체보기 버튼 초기 숨김 |
| `style="overflow-x:auto;"` | 6개 | 테이블 가로 스크롤 래퍼 |
| `style="min-width:NNNpx;"` | 6개 | 테이블 최소 너비 |

→ 위 3가지는 전체 페이지에서 동일하게 사용되는 **공통 패턴**으로 허용.

### 수정 필요 인라인 style (공통 CSS 추상화 대상)

| 파일 | 라인 | 인라인 style 내용 | 조치 방안 |
|------|------|-----------------|---------|
| `construction-write.html` | 326 | `font-size:12px;font-weight:400;color:#16a34a;` | `adm-price-sub-label` 클래스 추가 |
| `construction-write.html` | 493, 504 | `font-weight:600;color:#374151;` | `adm-label-strong` 클래스 추가 |
| `construction-write.html` | 480 | `padding:4px 10px;font-size:12px;` (버튼) | `adm-btn--xs` 클래스 추가 |
| `construction-write.html` | 713~740 | `padding:3px 10px;font-size:12px;` (버튼 4개) | 동일 `adm-btn--xs` 적용 |
| `construction-write.html` | 296 | `width:160px;` (th 고정폭) | `adm-form-table th` 기본값 확인 후 `adm-th--w160` 추가 |
| `notice-write.html` | 107, 126 | `vertical-align:top;padding-top:12px;` (th) | `adm-th--top` 클래스 추가 |
| `notice-write.html` | 130 | `display:flex;align-items:center;gap:8px;flex-wrap:wrap;` | `adm-file-group` 클래스로 대체 가능 (이미 정의됨) |
| `order-corp-write.html` | 98~213 | `width:72px~140px;text-align:center;flex:1;` (입력 필드 다수) | `rss-input--sm`, `rss-input--md` 클래스 추가 |
| `order-corp-write.html` | 198 | `margin-bottom:6px;` (adm-inline-group) | `adm-inline-group--mb` 수정자 추가 |
| `market-detail.html` | 57 | `margin-bottom:20px;` (rss-table) | `rss-table--mb` 수정자 추가 |

---

## ③ 공통 CSS 미정의 클래스 현황

### A. JS 템플릿 리터럴 오탐 (수정 불필요)

다음은 JavaScript 동적 클래스 바인딩으로 HTML 파서 오탐입니다.

| 파일 | 오탐 클래스 |
|------|-----------|
| `ad-list.html` | `${item.adUseYn`, `==`, `?`, `:` 등 |
| `notice-list.html` | `${item.useYn`, `rss-badge--cancel'}`, `rss-badge--complete'` 등 |
| `construction-list.html` | `${const.statusBadgeClass}` |
| `construction-write.html` | `cal-grid__cell'`, `sat':'` 등 |

### B. 공통 CSS 추가 필요 클래스

| 클래스 | 사용 파일 | 우선순위 | 조치 |
|--------|---------|---------|------|
| `rss-empty` | 13개 파일 | **높음** | `adm-common-v2.css`에 추가 (빈 목록 표시 공통 스타일) |
| `rss-table__empty` | `sales-list.html` | **높음** | `rss-empty`와 통일 또는 별도 추가 |
| `rss-btn--primary` | `construction-detail.html` | **높음** | `adm-common-v2.css`에 추가 |
| `rss-page-actions__center` | `admin-write.html` | **높음** | `adm-common-v2.css`에 추가 |
| `rss-col-biz` | `order-corp-list.html` | **중간** | `rss-common.css`에 colgroup 클래스 추가 |
| `rss-col-corp` | `order-corp-list.html` | **중간** | `rss-common.css`에 colgroup 클래스 추가 |
| `row-pending` | `company-list.html`, `company-staff-list.html` | **중간** | `adm-common-v2.css`에 행 상태 클래스 추가 |
| `unit-price-box` | `construction-detail.html` | **낮음** | 페이지 전용 → 공통 추가 또는 유지 |
| `market-photo-item` | `community-detail.html` | **낮음** | 페이지 전용 → 공통 추가 또는 유지 |

### C. 체크박스 ID 클래스 (페이지 전용 — 허용)

| 클래스 | 파일 | 비고 |
|--------|------|------|
| `adminChk`, `community-chk`, `company-chk`, `staff-chk`, `market-chk`, `notice-chk`, `reply-chk`, `tma-chk`, `ad-chk` | 각 목록 페이지 | JS 체크박스 선택용 페이지 전용 ID 클래스 |

---

## 종합 평가

| 항목 | 상태 | 건수 |
|------|------|------|
| `<style>` 태그 | ✅ 이상 없음 | 0건 |
| 인라인 style (공통 패턴) | ✅ 허용 | 3패턴 |
| 인라인 style (추상화 필요) | ⚠️ 수정 권장 | 10건 |
| JS 오탐 클래스 | ✅ 무시 | 4파일 |
| 공통 CSS 추가 필요 클래스 | ⚠️ 수정 필요 | 9개 |
| 페이지 전용 허용 클래스 | ✅ 허용 | 9개 |

---

## 수정 우선순위 요약

### 즉시 수정 (공통 CSS 추가)

1. `rss-empty` — 13개 파일에서 사용 중이나 미정의
2. `rss-btn--primary` — construction-detail.html
3. `rss-page-actions__center` — admin-write.html
4. `rss-col-biz`, `rss-col-corp` — order-corp-list.html

### 권장 수정 (인라인 → 클래스 추상화)

5. `adm-btn--xs` — construction-write.html 버튼 5개
6. `adm-th--top` — notice-write.html th 2개
7. `adm-file-group` 재사용 — notice-write.html 130번 라인 (이미 정의됨, 클래스 교체만 필요)
8. `row-pending` — company-list, company-staff-list

---

## 2026-05-27 마무리 점검 처리 결과

### 처리 완료

| 항목 | 파일 | 상태 |
|------|------|------|
| `adm-common-v2.css` §M13 공통 보완 클래스 13개 추가 | `adm-common-v2.css` | ✅ 완료 |
| `rss-col-biz`, `rss-col-corp` colgroup 클래스 추가 | `rss-common.css` | ✅ 완료 |
| `construction-write.html` 인라인 style → 공통 클래스 교체 (26건) | `construction-write.html` | ✅ 완료 |
| `notice-write.html` 인라인 style → 공통 클래스 교체 (5건) | `notice-write.html` | ✅ 완료 |
| `order-corp-write.html` 인라인 style → 공통 클래스 교체 (15건) | `order-corp-write.html` | ✅ 완료 |

### 미처리 항목 (다음 세션 처리 예정)

| 파일 | 잔존 인라인 style 건수 | 주요 내용 |
|------|---------------------|----------|
| `construction-detail.html` | 30건+ | 탭 패널 패딩, 버튼 그룹 flex, 모달 크기, 폼 레이블 스타일 등 |
| `construction-list.html` | 1건 | 검색 input `width:180px` |
| `market-detail.html` | 1건 | `rss-table margin-bottom:20px` → `rss-table--mb` 클래스 이미 추가됨, HTML만 교체 필요 |
| `market-list.html` | 1건 | 툴바 `margin-left:auto` |
| `non-performance-list.html` | 1건 | 검색 input `width:220px` |
| `notice-list.html` | 1건 | 검색 input `width:240px` |

---

*생성일: 2026-05-27 / 최종 업데이트: 2026-05-27*
