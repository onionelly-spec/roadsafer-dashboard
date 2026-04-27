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
      return src.replace('rss-common.js', '');
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
  document.querySelectorAll('.rss-nav__link').forEach(function(link) {
    const href = link.getAttribute('href') || '';
    const isActive = href === current
      || (href !== 'index.html' && current.startsWith(href.replace('.html', '')));
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
        // 1. TMA 카드 관리만 숨기기 (승인관리는 이미 header에서 처리됨)
        document.querySelectorAll('[data-menu-id="tma-card"]').forEach(el => el.style.display = 'none');

        // 2. 공사 현황 테이블의 '금액' 열 전체 숨기기 (colgroup, th, td 모두)
        // colgroup
        document.querySelectorAll('.rss-col-price').forEach(el => el.style.display = 'none');
        // thead
        document.querySelectorAll('[data-th="금액"]').forEach(el => el.style.display = 'none');
        // tbody
        document.querySelectorAll('.rss-col-amount').forEach(el => el.style.display = 'none');

        // 3. 담당자 이름 변경
        const approverEl = document.querySelector('#company-approver');
        if (approverEl) {
          approverEl.innerHTML = `<strong>담당자</strong><span>${userName}</span>`;
        }
      }
    }
  });
})();
