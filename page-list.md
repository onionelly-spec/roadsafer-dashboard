# 로드세이프티시스템 — 전체 페이지 목록

> **기준 브랜치**: `main`  
> **GitHub Pages 베이스 URL**: `https://onionelly-spec.github.io/roadsafer-dashboard/`  
> **작성일**: 2026-04-30

---

## 페이지 목록

| No. | 메인메뉴 | 2depth | 3depth | 링크 | 삽입된 모달 |
|:---:|---|---|---|---|---|
| 1 | 로그인 | — | — | [login.html](https://onionelly-spec.github.io/roadsafer-dashboard/login.html) | 없음 |
| 2 | 대시보드 | — | — | [index.html](https://onionelly-spec.github.io/roadsafer-dashboard/index.html) | `rss-action-modals` (공통 액션 모달, JS 자동 주입) |
| 3 | 내 공사 현황 | 목록 | — | [construction-list.html](https://onionelly-spec.github.io/roadsafer-dashboard/construction-list.html) | `rss-action-modals` (공통 액션 모달, JS 자동 주입) |
| 4 | 내 공사 현황 | 상세 | — | [construction-detail.html](https://onionelly-spec.github.io/roadsafer-dashboard/construction-detail.html) | `rss-action-modals` (공통 액션 모달) / `dailyProgModalBackdrop` (공사 금액 일별 진행 모달) |
| 5 | 내 공사 현황 | 공사 신청 | — | [construction-apply.html](https://onionelly-spec.github.io/roadsafer-dashboard/construction-apply.html) | 없음 |
| 6 | 공사 정보 | 목록 | — | [construction-info.html](https://onionelly-spec.github.io/roadsafer-dashboard/construction-info.html) | 없음 |
| 7 | 공사 정보 | 상세 | — | [construction-info-detail.html](https://onionelly-spec.github.io/roadsafer-dashboard/construction-info-detail.html) | 없음 |
| 8 | TMA 카드 관리 | — | — | [tma-card.html](https://onionelly-spec.github.io/roadsafer-dashboard/tma-card.html) | `tmaModal` (TMA 카드 등록/수정 모달) |
| 9 | 장터 | 목록 | — | [market.html](https://onionelly-spec.github.io/roadsafer-dashboard/market.html) | 없음 |
| 10 | 장터 | 상세 | — | [market-detail.html](https://onionelly-spec.github.io/roadsafer-dashboard/market-detail.html) | `consultModal` (상담 신청 모달) / `consultDoneModal` (상담 신청 완료 모달) |
| 11 | 장터 | 등록/수정 | — | [market-write.html](https://onionelly-spec.github.io/roadsafer-dashboard/market-write.html) | 없음 |
| 12 | 커뮤니티 | 목록 | — | [community.html](https://onionelly-spec.github.io/roadsafer-dashboard/community.html) | 없음 |
| 13 | 커뮤니티 | 상세 | — | [community-detail.html](https://onionelly-spec.github.io/roadsafer-dashboard/community-detail.html) | 없음 |
| 14 | 커뮤니티 | 등록/수정 | — | [community-write.html](https://onionelly-spec.github.io/roadsafer-dashboard/community-write.html) | 없음 |
| 15 | 공지사항 | 목록 | — | [notice.html](https://onionelly-spec.github.io/roadsafer-dashboard/notice.html) | `noticeModalBackdrop` (공지사항 미리보기 모달) |
| 16 | 공지사항 | 상세 | — | [notice-detail.html](https://onionelly-spec.github.io/roadsafer-dashboard/notice-detail.html) | 없음 |
| 17 | 광고 | 목록 | — | [ad.html](https://onionelly-spec.github.io/roadsafer-dashboard/ad.html) | 없음 |
| 18 | 광고 | 상세 | — | [ad-detail.html](https://onionelly-spec.github.io/roadsafer-dashboard/ad-detail.html) | 없음 |
| 19 | 승인 관리 | — | — | [approval.html](https://onionelly-spec.github.io/roadsafer-dashboard/approval.html) | `apvConfirmModal` (승인 확인 모달) / `apvCancelModal` (승인 취소 모달) |
| 20 | 정보변경 | 기업주 | — | [profile.html](https://onionelly-spec.github.io/roadsafer-dashboard/profile.html) | `pwModal` (비밀번호 변경) / `withdrawModal` (회원탈퇴) / `withdrawBlockModal` (탈퇴 불가) / `modalValidAlert` (입력 오류) / `modalRegionAlert` (권역 선택 초과) / `modalSaveConfirm` (저장 확인) |
| 21 | 정보변경 | 차단직원 | — | [profile-staff.html](https://onionelly-spec.github.io/roadsafer-dashboard/profile-staff.html) | `pwModal` (비밀번호 변경) / `withdrawModal` (회원탈퇴) / `withdrawBlockModal` (탈퇴 불가) / `modalValidAlert` (입력 오류) / `modalSaveConfirm` (저장 확인) |
| 22 | 회원가입 | 약관 동의 | — | [register-terms.html](https://onionelly-spec.github.io/roadsafer-dashboard/register-terms.html) | `modalTermsAlert` (약관 미동의 경고) / `modalEmployeeAlert` (기업 먼저 가입 필요) / `modalCompanyAlert` (사업자등록증 첨부 안내) |
| 23 | 회원가입 | 기업 정보 입력 | — | [register-company.html](https://onionelly-spec.github.io/roadsafer-dashboard/register-company.html) | `modalValidAlert` (입력 오류) / `modalRegionAlert` (권역 선택 초과) / `modalConfirm` (가입 최종 확인) |
| 24 | 회원가입 | 직원 정보 입력 | — | [register-employee.html](https://onionelly-spec.github.io/roadsafer-dashboard/register-employee.html) | `modalCompanySearch` (기업 검색) / `modalValidAlert` (입력 오류) / `modalConfirm` (가입 최종 확인) |
| 25 | 회원가입 | 가입 완료 | — | [register-complete.html](https://onionelly-spec.github.io/roadsafer-dashboard/register-complete.html) | 없음 |
| 26 | 아이디 찾기 | — | — | [find-id.html](https://onionelly-spec.github.io/roadsafer-dashboard/find-id.html) | 없음 |
| 27 | 비밀번호 찾기 | — | — | [find-password.html](https://onionelly-spec.github.io/roadsafer-dashboard/find-password.html) | 없음 |

---

## 비고

- **`rss-action-modals`**: `rss-common.js`의 `RSS.action`이 `#rss-action-modals` 컨테이너에 공통 확인/알림 모달을 자동 주입하는 방식으로, 대시보드·내 공사 현황 목록·상세 페이지에서 사용됩니다.
- **`TMA 카드 관리`** 메뉴는 기업주(owner) 역할에만 노출됩니다 (`data-role-only="owner"`).
- **`승인 관리`** 페이지는 사이드바 메뉴에는 표시되지 않으며, 관리자 전용 경로로 접근합니다.
- **`정보변경`** 페이지는 로그인 사용자 유형(기업주/차단직원)에 따라 `profile.html` 또는 `profile-staff.html`로 분기됩니다.
- `footer.html`, `header.html`, `sidebar.html`은 공통 컴포넌트 파일로 독립 페이지가 아닙니다.
- `privacy.html`, `terms.html`은 약관/개인정보처리방침 전문 페이지입니다.
