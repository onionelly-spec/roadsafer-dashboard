/**
 * rss-common.js
 * 로드세이프티시스템 (RSS) — 공통 인터랙션 스크립트
 * Vanilla JS (ES6+) — 프레임워크 비종속
 * 개발환경: Java + MariaDB
 *
 * ─────────────────────────────────────────────────────────
 * [목차]
 *  0. 공통 컴포넌트 fetch 삽입 (sidebar.html / header.html / footer.html)
 *  1. 사이드바 토글
 *  2. 탭 전환
 *  3. 검색 폼 — Enter 키 지원
 *  4. 모달 공통
 *  5. 현재 페이지 네비게이션 active 처리
 *  6. 토스트 알림
 *  7. 사용자 유형별 UI 제어
 *  8. 공사 액션 모달 (차단취소 · 오늘완료 공통 프로세스)
 * ─────────────────────────────────────────────────────────
 *
 * [Java Thymeleaf 전환 시]
 *  - 0번 fetch 로직은 불필요 → 삭제하거나 주석 처리
 *  - sidebar.html → /templates/fragments/sidebar.html
 *  - header.html  → /templates/fragments/header.html
 *  - footer.html  → /templates/fragments/footer.html
 *  - 각 페이지에서 th:replace="fragments/sidebar :: sidebar" 로 교체
 *  - 5번 active 처리는 th:classappend="${currentMenu=='xxx'}?'active'" 로 교체
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   0. 공통 컴포넌트 fetch 삽입
   ─────────────────────────────────────────────────────────
   [사용법] 각 HTML 페이지에 아래 세 줄을 배치하세요.
     <div id="rss-sidebar-wrap"></div>
     <div id="rss-header-wrap" data-title="페이지 제목"></div>
     <div id="rss-footer-wrap"></div>  ← rss-main 내부 맨 아래

   [주의] fetch()는 file:// 프로토콜에서 동작하지 않습니다.
          반드시 localhost 또는 실제 서버 환경에서 실행하세요.
          (Live Server, Tomcat, Nginx 등)

   [Java Thymeleaf 전환 시]
     이 섹션 전체를 삭제하고 th:replace 방식으로 교체하세요.
   ═══════════════════════════════════════════════════════════ */
(function initComponents() {
  const sidebarWrap = document.getElementById('rss-sidebar-wrap');
  const headerWrap  = document.getElementById('rss-header-wrap');

  /* 현재 파일 기준 상대 경로 계산 */
  const base = (function() {
    const scripts = document.querySelectorAll('script[src*="rss-common.js"]');
    if (scripts.length) {
      const src = scripts[scripts.length - 1].getAttribute('src');
      /* 쿼리스트링(?v=...) 제거 후 파일명 제거 */
      const cleanSrc = src.split('?')[0];
      return cleanSrc.replace('rss-common.js', '');
    }
    return '';
  })();

  /* ── 사이드바 삽입 ── */
  if (sidebarWrap) {
    fetch(base + 'sidebar.html')
      .then(function(res) {
        if (!res.ok) throw new Error('sidebar.html 로드 실패: ' + res.status);
        return res.text();
      })
      .then(function(html) {
        sidebarWrap.innerHTML = html;
        /* 삽입 후 Lucide 아이콘 재렌더링 */
        if (window.lucide) lucide.createIcons();
        /* 삽입 후 사이드바 관련 기능 초기화 */
        _initSidebarBehavior();
        _initNavActive();
        _initUserInfo();
      })
      .catch(function(err) {
        console.warn('[RSS] sidebar.html fetch 오류:', err.message);
        console.warn('[RSS] file:// 프로토콜에서는 fetch가 동작하지 않습니다. Live Server를 사용하세요.');
      });
  }

  /* ── 헤더 삽입 ── */
  if (headerWrap) {
    fetch(base + 'header.html')
      .then(function(res) {
        if (!res.ok) throw new Error('header.html 로드 실패: ' + res.status);
        return res.text();
      })
      .then(function(html) {
        headerWrap.innerHTML = html;
        /* data-title 속성으로 페이지 타이틀 설정 */
        const pageTitle = headerWrap.dataset.title || '대시보드';
        const titleEl = document.getElementById('rss_header_title');
        if (titleEl) {
          /* data-icon 속성이 있으면 타이틀 앞에 Lucide 아이콘 삽입 */
          var iconName = headerWrap.dataset.icon;
          if (iconName) {
            titleEl.innerHTML =
              '<i data-lucide="' + iconName + '" class="rss-header__title-icon" style="width:20px;height:20px;flex-shrink:0;opacity:0.7;"></i>' +
              '<span>' + pageTitle + '</span>';
          } else {
            titleEl.textContent = pageTitle;
          }
        }
        /* 삽입 후 Lucide 아이콘 재렌더링 */
        if (window.lucide) lucide.createIcons();
        /* 삽입 후 사이드바 토글 버튼 재바인딩 */
        _bindToggleBtn();
        _initUserInfo();
      })
      .catch(function(err) {
        console.warn('[RSS] header.html fetch 오류:', err.message);
      });
  }
  /* ── 푸터 삽입 ── */
  var footerWrap = document.getElementById('rss-footer-wrap');
  if (footerWrap) {
    fetch(base + 'footer.html')
      .then(function(res) {
        if (!res.ok) throw new Error('footer.html 로드 실패: ' + res.status);
        return res.text();
      })
      .then(function(html) {
        footerWrap.innerHTML = html;
        /* 삽입 후 Lucide 아이콘 재렌더링 */
        if (window.lucide) lucide.createIcons();
        /* 모바일 토글 버튼 바인딩 */
        _initFooterToggle();
      })
      .catch(function(err) {
        console.warn('[RSS] footer.html fetch 오류:', err.message);
      });
  }
})();


/* ═══════════════════════════════════════════════════════════
   0-1. 푸터 모바일 토글 (내부 함수 — footer fetch 완료 후 호출)
   ═══════════════════════════════════════════════════════════ */
function _initFooterToggle() {
  var btn  = document.getElementById('footerToggleBtn');
  var info = document.getElementById('footerMobileInfo');
  if (!btn || !info) return;

  btn.addEventListener('click', function() {
    var isOpen = info.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    info.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  });
}


/* ═══════════════════════════════════════════════════════════
   1. 사이드바 토글 (내부 함수 — fetch 완료 후 호출됨)
   ═══════════════════════════════════════════════════════════ */
function _initSidebarBehavior() {
  const sidebar  = document.getElementById('rssSidebar');
  const main     = document.getElementById('rssMain');
  const overlay  = document.getElementById('rssOverlay');

  if (!sidebar) return;

  const COLLAPSED_KEY = 'rss_sidebar_collapsed';
  const isMobile = function() { return window.innerWidth < 1024; };

  /* 저장된 상태 복원 (PC만) */
  if (!isMobile() && localStorage.getItem(COLLAPSED_KEY) === '1') {
    sidebar.classList.add('collapsed');
    main && main.classList.add('sidebar-collapsed');
  }

  function toggleSidebar() {
    if (isMobile()) {
      const isOpen = sidebar.classList.toggle('mobile-open');
      overlay && overlay.classList.toggle('show', isOpen);
    } else {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      main && main.classList.toggle('sidebar-collapsed', isCollapsed);
      localStorage.setItem(COLLAPSED_KEY, isCollapsed ? '1' : '0');
    }
  }

  /* 모바일 햄버거 토글 버튼 바인딩 */
  _bindToggleBtn = function() {
    const btnToggle = document.getElementById('rssSidebarToggle');
    btnToggle && btnToggle.addEventListener('click', toggleSidebar);
  };
  _bindToggleBtn();

  /* PC 전용 사이드바 화살표 접기 버튼 바인딩 */
  const collapseBtn  = document.getElementById('rssSidebarCollapseBtn');
  const collapseIcon = document.getElementById('rssSidebarCollapseIcon');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', function() {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      main && main.classList.toggle('sidebar-collapsed', isCollapsed);
      localStorage.setItem(COLLAPSED_KEY, isCollapsed ? '1' : '0');
      /* 아이콘 방향 전환은 CSS .collapsed 클래스로 처리 */
    });
  }

  overlay && overlay.addEventListener('click', function() {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('show');
  });

  window.addEventListener('resize', function() {
    if (!isMobile()) {
      sidebar.classList.remove('mobile-open');
      overlay && overlay.classList.remove('show');
    }
  });
}

/* 토글 버튼 바인딩 함수 (헤더 삽입 후 재호출용) */
var _bindToggleBtn = function() {};


/* ═══════════════════════════════════════════════════════════
   2. 탭 전환
   사용법: data-tab-group="그룹명" data-tab="탭명" 버튼에 적용
          대응 패널: data-tab-panel="그룹명" data-panel="탭명"
   ═══════════════════════════════════════════════════════════ */
(function initTabs() {
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    const group  = btn.dataset.tabGroup || 'default';
    const target = btn.dataset.tab;

    document.querySelectorAll('[data-tab-group="' + group + '"]').forEach(function(b) {
      b.classList.toggle('active', b.dataset.tab === target);
    });
    document.querySelectorAll('[data-tab-panel="' + group + '"]').forEach(function(p) {
      p.classList.toggle('active', p.dataset.panel === target);
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   3. 검색 폼 — Enter 키 지원
   ═══════════════════════════════════════════════════════════ */
(function initSearch() {
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    const input = e.target.closest('.rss-search-wrap input');
    if (!input) return;
    const form = input.closest('form');
    form ? form.submit() : console.log('[RSS Search]', input.value);
  });
})();


/* ═══════════════════════════════════════════════════════════
   4. 모달 공통
   사용법: data-modal-open="모달ID" 버튼 / data-modal-close 버튼
   ═══════════════════════════════════════════════════════════ */
(function initModal() {
  function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function(e) {
    /* 열기 */
    const openBtn = e.target.closest('[data-modal-open]');
    if (openBtn) {
      const modal = document.getElementById(openBtn.dataset.modalOpen);
      if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
      return;
    }
    /* 닫기 버튼 */
    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) {
      const modal = closeBtn.closest('.rss-modal');
      if (modal) closeModal(modal);
      return;
    }
    /* 오버레이 클릭 닫기 */
    if (e.target.classList.contains('rss-modal')) closeModal(e.target);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.rss-modal[style*="flex"]').forEach(closeModal);
    }
  });
})();


/* ═══════════════════════════════════════════════════════════
   5. 현재 페이지 네비게이션 active 처리
   ─────────────────────────────────────────────────────────
   [Java Thymeleaf 전환 시]
     th:classappend="${currentMenu == 'notice'} ? 'active'" 로 교체하세요.
   ═══════════════════════════════════════════════════════════ */
function _initNavActive() {
  const current = location.pathname.split('/').pop() || 'index.html';
  
  /* 상세/등록 페이지 매핑 규칙 (하위 페이지 이동 시에도 부모 메뉴 활성화) */
  const menuMap = {
    'construction-detail.html': 'construction-list.html',
    'notice-detail.html': 'notice.html',
    'community-detail.html': 'community.html',
    'community-write.html': 'community.html',
    'market-detail.html': 'market.html',
    'market-write.html': 'market.html',
    'ad-detail.html': 'ad.html',
    'construction-info-detail.html': 'construction-info.html'
  };

  const activeMenu = menuMap[current] || current;

  document.querySelectorAll('.rss-nav__link').forEach(function(link) {
    const href = link.getAttribute('href') || '';
    const isActive = (href === activeMenu);
    link.classList.toggle('active', isActive);
  });
}
/* 사이드바가 이미 DOM에 있는 경우(fetch 없이 직접 삽입)를 위해 즉시 실행 */
_initNavActive();


/* ═══════════════════════════════════════════════════════════
   6. 사용자 정보 동기화
   ─────────────────────────────────────────────────────────
   사이드바와 헤더에 동일한 사용자 정보를 표시합니다.
   [Java Thymeleaf 전환 시]
     서버사이드 렌더링으로 대체 → 이 함수 불필요
   ═══════════════════════════════════════════════════════════ */
function _initUserInfo() {
  /* 세션 스토리지 또는 더미 데이터에서 사용자 정보 읽기 */
  /* [Java] 실제 환경에서는 서버에서 직접 렌더링 */
  /* sessionStorage 키: rss_usr_nm, rss_company_nm (용어사전: usr=사용자, nm=이름, company_nm=회사명) */
  const usrNm     = sessionStorage.getItem('rss_usr_nm')      || '나잘난';
  const companyNm = sessionStorage.getItem('rss_company_nm')  || '한국도로차단(주)';
  const avatarChar  = usrNm.charAt(0);

  /* 사이드바 */
  const sbName    = document.getElementById('sidebar_usr_nm');
  const sbCompany = document.getElementById('sidebar_company_nm');
  const sbAvatar  = document.getElementById('sidebar_usr_avatar');
  if (sbName)    sbName.textContent    = usrNm;
  if (sbCompany) sbCompany.textContent = companyNm;
  if (sbAvatar)  sbAvatar.textContent  = avatarChar;

  /* 헤더 퀵버튼 배지 초기화 (0이면 숨김) */
  /* [Java Thymeleaf 전환 시] 서버에서 직접 렌더링 → 이 블록 불필요 */
  /* [DB] tbl_mber WHERE mber_type='EMPLOYEE' AND approve_yn=0 AND company_nm=#{loginUsr.companyNm} COUNT → approveCnt */
  /* [DB] tbl_noti WHERE mber_id = ? AND read_yn = 0 COUNT → noticeCnt */
  var approveBtn   = document.getElementById('header_approve_btn');
  var approveBadge = document.getElementById('header_approve_badge');
  var noticeBadge  = document.getElementById('header_notice_badge');

  /* 승인관리 버튼: mberType이 'BLOCK'(차단기업 대표)인 경우만 표시 */
  /* [Java Thymeleaf 전환 시] th:if="${session.loginUsr.mberType == 'BLOCK'}" 로 대체 */
  /* 더미: sessionStorage에 rss_mber_type 없으면 'BLOCK'으로 간주 */
  var mberType = sessionStorage.getItem('rss_mber_type') || 'company';
  if (approveBtn) {
    if (mberType === 'company') {
      approveBtn.style.display = '';
    } else {
      /* employee 등 직원은 숨김 */
      approveBtn.style.display = 'none';
    }
  }

  /* 더미 데이터: 실제 환경에서는 서버 렌더링으로 교체 */
  var approveCnt = parseInt(sessionStorage.getItem('rss_approve_cnt') || '1', 10);
  var noticeCnt  = parseInt(sessionStorage.getItem('rss_notice_cnt')  || '2', 10);
  if (approveBadge) {
    if (approveCnt > 0) { approveBadge.textContent = approveCnt; approveBadge.style.display = ''; }
    else { approveBadge.style.display = 'none'; }
  }
  if (noticeBadge) {
    if (noticeCnt > 0) { noticeBadge.textContent = noticeCnt; noticeBadge.style.display = ''; }
    else { noticeBadge.style.display = 'none'; }
  }
}
_initUserInfo();


/* ═══════════════════════════════════════════════════════════
   7. 토스트 알림 (선택적 사용)
   사용법: RSS.toast('메시지', 'success' | 'error' | 'info' | 'warning')
   ═══════════════════════════════════════════════════════════ */
window.RSS = window.RSS || {};
RSS.toast = function(msg, type) {
  type = type || 'info';
  const colors = {
    success: '#16a34a',
    error:   '#dc2626',
    info:    '#0284c7',
    warning: '#d97706'
  };
  const toast = document.createElement('div');
  toast.style.cssText = [
    'position:fixed', 'bottom:24px', 'right:24px', 'z-index:9999',
    'padding:12px 20px', 'border-radius:8px',
    'background:' + (colors[type] || colors.info),
    'color:#fff', 'font-size:13.5px', 'font-weight:600',
    'box-shadow:0 4px 16px rgba(0,0,0,0.18)',
    'animation:rssToastIn 0.25s ease',
    'max-width:320px', 'word-break:keep-all'
  ].join(';');
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
};

/* 토스트 애니메이션 */
(function() {
  if (document.getElementById('rssToastStyle')) return;
  const s = document.createElement('style');
  s.id = 'rssToastStyle';
  s.textContent = '@keyframes rssToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(s);
})();
_initUserInfo();

/* ═══════════════════════════════════════════════════════════
   7. 사용자 유형별 UI 제어
   ─────────────────────────────────────────────────────────
   역할 기반 UI 숨김 처리:
   - 직원(employee) 로그인 시 다음 요소들이 숨겨집니다:
     1. data-role-block="true" 속성을 가진 모든 요소 (월매출 정보 등)
     2. .td-amount 클래스를 가진 모든 요소 (금액 관련 셀)
   
   [Java Thymeleaf 전환 시]
     th:if, th:classappend 등을 사용하여 서버사이드에서 처리하세요.
   ═══════════════════════════════════════════════════════════ */
(function initConditionalUI() {
  // DOM이 완전히 로드된 후 실행
  document.addEventListener('DOMContentLoaded', function() {
    const userType = sessionStorage.getItem('rss_mber_type');
    const userName = sessionStorage.getItem('rss_mber_name') || '사용자';

    // 로그인 페이지가 아니면 실행
    if (!document.body.classList.contains('login-page')) {
      if (userType === 'employee') {
        // ① data-role-block="true" 속성을 가진 모든 요소 숨기기
        // 예: 월매출 정보, 승인관리 버튼 등 기업 전용 요소
        document.querySelectorAll('[data-role-block="true"]').forEach(el => {
          el.style.display = 'none';
        });

        // ② .td-amount 클래스를 가진 모든 요소 숨기기
        // 예: 테이블 금액 열, 모바일 카드의 금액 행
        document.querySelectorAll('.td-amount').forEach(el => {
          el.style.display = 'none';
        });

        // ③ TMA 카드 관리 숨기기 (대시보드 퀵메뉴)
        document.querySelectorAll('[data-menu-id="tma-card"]').forEach(el => {
          el.style.display = 'none';
        });

        // ⑤ 담당자 이름 변경 (대시보드)
        const approverEl = document.querySelector('#company-approver');
        if (approverEl) {
          approverEl.innerHTML = `<strong>담당자</strong><span>${userName}</span>`;
        }

        // ⑥ 사이드바 정보변경 링크 → 직원용 페이지로 변경
        // sidebar.html이 fetch 완료된 후 DOM에 삽입되므로 MutationObserver로 감지
        // [Java] 서버사이드 전환 시 th:href="@{/profile/staff}" 등으로 처리
        (function applyStaffProfileLink() {
          var link = document.getElementById('sidebarProfileLink');
          if (link) {
            link.href = 'profile-staff.html';
            return;
          }
          // 사이드바가 아직 로드되지 않은 경우 MutationObserver로 대기
          var observer = new MutationObserver(function(mutations, obs) {
            var l = document.getElementById('sidebarProfileLink');
            if (l) {
              l.href = 'profile-staff.html';
              obs.disconnect();
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        })();
      }
    }
  });
})();


/* ═══════════════════════════════════════════════════════════
   8. 공사 액션 모달 — 차단취소 · 오늘완료 공통 프로세스
   ─────────────────────────────────────────────────────────
   [사용법]
     차단 취소 버튼:
       <button class="rss-btn rss-action-btn rss-action-btn--cancel"
               onclick="RSS.action.openCancelModal(this)"
               data-nm="공사명">차단 취소</button>

     오늘 완료 버튼:
       <button class="rss-btn rss-action-btn rss-action-btn--complete"
               onclick="RSS.action.openCompleteModal(this)"
               data-nm="공사명">오늘 완료</button>

   [모달 HTML 삽입]
     각 페이지 <body> 닫기 태그 바로 위에 아래 한 줄을 추가하세요:
       <div id="rss-action-modals"></div>
     → rss-common.js가 자동으로 모달 HTML을 주입합니다.

   [Java Thymeleaf 전환 시]
     - POST /construction/cancel   { constructionSeq, reason }
     - POST /construction/complete { constructionSeq }
     - 다음 일정 여부: ${item.hasNextSchedule} (boolean)
     - 다음 일정 정보: \${nextSchedule.startDt} \${nextSchedule.startTime}
   ═══════════════════════════════════════════════════════════ */

RSS.action = (function() {

  /* ── 모달 HTML 템플릿 ────────────────────────────────── */
  var MODAL_HTML = `
<!-- ══ 취소 사유 모달 ═════════════════════════════════ -->
<div class="rss-modal-backdrop" id="rssModalCancel">
  <div class="rss-modal" role="dialog" aria-modal="true" aria-labelledby="rssCancelTitle">
    <p class="rss-modal__title" id="rssCancelTitle">취소 사유</p>
    <textarea id="rssCancelReason" placeholder="취소 사유를 입력하세요 (필수)"></textarea>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--outline rss-btn--sm"
              onclick="RSS.action.closeModal('rssModalCancel')">취소</button>
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.submitCancel()">확인</button>
    </div>
  </div>
</div>

<!-- 취소 완료
     [Java] 운영관리시스템: 취소 대역에 등록되고 차단 합니다.
     [Java] POST /construction/cancel { constructionSeq, reason } 완료 후 표시
     확인 클릭 시: 페이지 새로고침 (state: 취소로 변경) -->
<div class="rss-modal-backdrop" id="rssModalCancelDone">
  <div class="rss-modal">
    <p class="rss-modal__title">처리 완료</p>
    <p class="rss-modal__body">
      공사가 취소되었습니다.<br>
      차단 비용은 별도 협의 후 안내됩니다.
    </p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.reloadToProgressTab()">확인</button>
    </div>
  </div>
</div>

<!-- ══ 차단신청 취소 (간소화: 내 공사현황 목록·차단 정보 탭 전용) ══ -->
<div class="rss-modal-backdrop" id="rssModalCancelSimple">
  <div class="rss-modal" role="dialog" aria-modal="true" aria-labelledby="rssCancelSimpleTitle">
    <p class="rss-modal__title" id="rssCancelSimpleTitle">차단신청 취소</p>
    <p class="rss-modal__body">
      차단 취소에 대해 <span class="highlight">발주업체와 협의</span>가 되었습니까?
    </p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--outline rss-btn--sm"
              onclick="RSS.action.cancelSimpleNo()">아니오</button>
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.cancelSimpleYes()">예</button>
    </div>
  </div>
</div>

<!-- ══ 오늘 완료 모달 (Step 1) ══════════════════════════ -->
<div class="rss-modal-backdrop" id="rssModalComplete1">
  <div class="rss-modal" role="dialog" aria-modal="true">
    <p class="rss-modal__title">오늘 완료</p>
    <p class="rss-modal__body">
      투입된 씨인카 수량이 바뀌었다면 콜센터
      <span class="highlight">(1566-0000)</span>으로 연락해주세요.<br><br>
      수량이 바뀌었나요?
    </p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--outline rss-btn--sm"
              onclick="RSS.action.completeStep1No()">아니오</button>
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.completeStep1Yes()">예</button>
    </div>
  </div>
</div>

<!-- Step 1-예: 콜센터 안내 -->
<div class="rss-modal-backdrop" id="rssModalCompleteCallCenter">
  <div class="rss-modal">
    <p class="rss-modal__title">콜센터 안내</p>
    <p class="rss-modal__body">
      콜센터 <span class="highlight">(1566-0000)</span>으로 연락해주세요.<br>
      콜센터에서 처리해드립니다.
    </p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.closeModal('rssModalCompleteCallCenter')">확인</button>
    </div>
  </div>
</div>

<!-- Step 2: 다음 공사 일정 협의 확인 -->
<div class="rss-modal-backdrop" id="rssModalComplete2">
  <div class="rss-modal">
    <p class="rss-modal__title">다음 공사 일정 확인</p>
    <p class="rss-modal__body">
      다음 공사 일정에 대해<br>
      <span class="highlight">상호 차단 협의</span>가 되었습니까?
    </p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--outline rss-btn--sm"
              onclick="RSS.action.completeStep2No()">아니오</button>
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.completeStep2Yes()">예</button>
    </div>
  </div>
</div>

<!-- Step 2-예: 다음 일정 알림 후 완료
     [Java] POST /construction/complete-today { constructionSeq } 완료 후 표시
     [Java] 발주업체, 차단업체에 카톡 알림 (코드: P09)
     확인 클릭 시: 페이지 새로고침 (진행상황 탭에 공사 금액 자동 계산 후 표시) -->
<div class="rss-modal-backdrop" id="rssModalComplete2YesDone">
  <div class="rss-modal">
    <p class="rss-modal__title">진행 완료</p>
    <p class="rss-modal__body">
      <!-- [Java] th:text="'다음 공사는 '+\${nextSchedule.startDt}+' '+\${nextSchedule.startTime}+'에 차단 시작입니다.'" -->
      다음 공사는 <span class="highlight" id="rssNextScheduleText">**월 **일 **시</span>에 차단 시작입니다.
    </p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.reloadToProgressTab()">확인</button>
    </div>
  </div>
</div>

<!-- Step 2-아니오: 추가 진행 불가 확인 (패널티 경고) -->
<div class="rss-modal-backdrop" id="rssModalComplete2NoPenalty">
  <div class="rss-modal">
    <p class="rss-modal__title">추가 진행 불가</p>
    <p class="rss-modal__body">
      추가 진행이 불가능합니까?<br>
      추가불진행시 공사는 종료되고 <span class="highlight">패널티가 발생</span>합니다.
    </p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--outline rss-btn--sm"
              onclick="RSS.action.completeNoPenaltyNo()">아니오</button>
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.completeNoPenaltyYes()">예</button>
    </div>
  </div>
</div>

<!-- 패널티 동의: 운영자 알림 -->
<div class="rss-modal-backdrop" id="rssModalCompleteNoPenaltyDone">
  <div class="rss-modal">
    <p class="rss-modal__title">운영자 알림</p>
    <p class="rss-modal__body">
      운영자에게 알림이 발송되었습니다.<br>
      추가 불진행시 패널티가 발생합니다.
    </p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.closeModal('rssModalCompleteNoPenaltyDone')">확인</button>
    </div>
  </div>
</div>

<!-- 패널티 거부: 협의 후 진행완료 안내 -->
<div class="rss-modal-backdrop" id="rssModalCompleteNoPenaltyNoMsg">
  <div class="rss-modal">
    <p class="rss-modal__title">협의 후 처리</p>
    <p class="rss-modal__body">
      다음 공사 일정을 협의한 후 '진행완료' 해주십시오.
    </p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.closeModal('rssModalCompleteNoPenaltyNoMsg')">확인</button>
    </div>
  </div>
</div>

<!-- 마지막 날 분기: 모든 공사 종료
     [Java] \${item.hasNextSchedule} == false 일 때 이 모달로 분기
     확인 클릭 시: completeLastDayConfirm() 호출 → rssModalCompleteFinal 표시 -->
<div class="rss-modal-backdrop" id="rssModalCompleteLastDay">
  <div class="rss-modal">
    <p class="rss-modal__title">공사 종료</p>
    <p class="rss-modal__body">금일로 모든 공사가 종료됩니다.</p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.completeLastDayConfirm()">확인</button>
    </div>
  </div>
</div>

<!-- 마지막 날 최종 완료
     [Java] POST /construction/complete-final { constructionSeq } 완료 후 표시
     확인 클릭 시: 페이지 새로고침 (state: 종료로 변경, 이후 차단 공사 불가) -->
<div class="rss-modal-backdrop" id="rssModalCompleteFinal">
  <div class="rss-modal">
    <p class="rss-modal__title">진행 완료</p>
    <p class="rss-modal__body">진행 완료되었습니다.</p>
    <div class="rss-modal__footer">
      <button type="button" class="rss-btn rss-btn--amber rss-btn--sm"
              onclick="RSS.action.reloadToProgressTab()">확인</button>
    </div>
  </div>
</div>
`;

  /* ── 모달 주입 (DOM 준비 후 실행) ─────────────────── */
  document.addEventListener('DOMContentLoaded', function() {
    var wrap = document.getElementById('rss-action-modals');
    if (!wrap) return; /* 해당 페이지에 마운트 포인트 없으면 건너뜀 */
    wrap.innerHTML = MODAL_HTML;

    /* 배경 클릭 시 닫기 */
    wrap.querySelectorAll('.rss-modal-backdrop').forEach(function(backdrop) {
      backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) backdrop.classList.remove('open');
      });
    });
  });

  /* ── 내부 유틸 ───────────────────────────────────── */
  function openModal(id)  {
    var el = document.getElementById(id);
    if (el) el.classList.add('open');
  }
  function closeAll() {
    document.querySelectorAll('.rss-modal-backdrop').forEach(function(el) {
      el.classList.remove('open');
    });
  }

  /* ── 공개 API ────────────────────────────────────── */
  return {

    closeModal: function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('open');
    },

    /* ── 차단 취소 플로우 ──────────────────────────── */
    openCancelModal: function(btn) {
      var reasonEl = document.getElementById('rssCancelReason');
      if (reasonEl) reasonEl.value = '';
      openModal('rssModalCancel');
    },

    /* ── 차단신청 취소 (간소화: 내 공사현황 목록·차단 정보 탭 전용) ── */
    openCancelSimpleModal: function() {
      openModal('rssModalCancelSimple');
    },

    cancelSimpleYes: function() {
      /* [Java] POST /construction/block-cancel { constructionSeq } */
      this.closeModal('rssModalCancelSimple');
      /* 취소 완료 후 내 공사현황 목록으로 이동 (해당 행 사라짐) */
      location.href = 'construction-list.html';
    },

    cancelSimpleNo: function() {
      this.closeModal('rssModalCancelSimple');
    },

    submitCancel: function() {
      var reasonEl = document.getElementById('rssCancelReason');
      var reason = reasonEl ? reasonEl.value.trim() : '';
      if (!reason) {
        alert('취소 사유를 입력해주세요.');
        return;
      }
      /* [Java] POST /construction/cancel { constructionSeq, reason } */
      this.closeModal('rssModalCancel');
      openModal('rssModalCancelDone');
    },

    /* ── 오늘 완료 플로우 ──────────────────────────── */
    openCompleteModal: function(btn) {
      closeAll();
      openModal('rssModalComplete1');
    },

    completeStep1Yes: function() {
      this.closeModal('rssModalComplete1');
      openModal('rssModalCompleteCallCenter');
    },

    completeStep1No: function() {
      this.closeModal('rssModalComplete1');
      /* [Java] \${item.hasNextSchedule} 로 분기
         더미: 다음 일정 있음 시나리오 */
      var hasNextSchedule = true;
      if (hasNextSchedule) {
        openModal('rssModalComplete2');
      } else {
        openModal('rssModalCompleteLastDay');
      }
    },

    completeStep2Yes: function() {
      this.closeModal('rssModalComplete2');
      /* [Java] POST /construction/complete-today { constructionSeq } */
      openModal('rssModalComplete2YesDone');
    },

    completeStep2No: function() {
      this.closeModal('rssModalComplete2');
      openModal('rssModalComplete2NoPenalty');
    },

    completeNoPenaltyYes: function() {
      this.closeModal('rssModalComplete2NoPenalty');
      /* [Java] 운영자 알림 발송 POST /construction/penalty-notify */
      openModal('rssModalCompleteNoPenaltyDone');
    },

    completeNoPenaltyNo: function() {
      this.closeModal('rssModalComplete2NoPenalty');
      openModal('rssModalCompleteNoPenaltyNoMsg');
    },

    completeLastDayConfirm: function() {
      this.closeModal('rssModalCompleteLastDay');
      /* [Java] POST /construction/complete-final { constructionSeq } */
      openModal('rssModalCompleteFinal');
    },

    /**
     * reloadToProgressTab()
     * 완료/취소 최종 모달 확인 시 호출하는 함수.
     * - construction-detail.html 페이지에서는 #tab-status 해시를 붙여
     *   새로고침 후에도 진행 상황 탭으로 복원합니다.
     * - 다른 페이지에서는 일반 새로고침으로 동작합니다.
     * [Java] 연동 시도 동일하게 동작합니다.
     */
    reloadToProgressTab: function() {
      var isDetailPage = location.pathname.indexOf('construction-detail') !== -1;
      if (isDetailPage) {
        /*
         * sessionStorage에 복원할 탭 ID를 저장한 뒤 새로고침.
         * construction-detail.html의 탭 초기화 로직이 이 값을 읽어
         * 진행 상황 탭(tab-status)을 자동 활성화합니다.
         * [Java] 서버사이드 렌더링 시에도 동일하게 동작합니다.
         */
        sessionStorage.setItem('rss_restore_tab', 'tab-status');
        location.reload();
      } else {
        location.reload();
      }
    }
  };

})();
