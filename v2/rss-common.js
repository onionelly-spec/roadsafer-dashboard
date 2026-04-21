/**
 * rss-common.js
 * 로드세이프티시스템 (RSS) — 공통 인터랙션 스크립트
 * Vanilla JS (ES6+) — 프레임워크 비종속
 * 개발환경: Java + MariaDB
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. 사이드바 토글
   ═══════════════════════════════════════════════════════════ */
(function initSidebar() {
  const sidebar  = document.getElementById('rssSidebar');
  const main     = document.getElementById('rssMain');
  const overlay  = document.getElementById('rssOverlay');
  const btnToggle = document.getElementById('rssSidebarToggle');

  if (!sidebar) return;

  const COLLAPSED_KEY = 'rss_sidebar_collapsed';
  const isMobile = () => window.innerWidth < 1024;

  /* 저장된 상태 복원 (PC만) */
  if (!isMobile() && localStorage.getItem(COLLAPSED_KEY) === '1') {
    sidebar.classList.add('collapsed');
    main && main.classList.add('sidebar-collapsed');
  }

  function toggleSidebar() {
    if (isMobile()) {
      /* 모바일: 오버레이 + 슬라이드 */
      const isOpen = sidebar.classList.toggle('mobile-open');
      overlay && overlay.classList.toggle('show', isOpen);
    } else {
      /* PC: 접기/펼치기 */
      const isCollapsed = sidebar.classList.toggle('collapsed');
      main && main.classList.toggle('sidebar-collapsed', isCollapsed);
      localStorage.setItem(COLLAPSED_KEY, isCollapsed ? '1' : '0');
    }
  }

  btnToggle && btnToggle.addEventListener('click', toggleSidebar);
  overlay   && overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('show');
  });

  /* 화면 크기 변경 시 초기화 */
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      sidebar.classList.remove('mobile-open');
      overlay && overlay.classList.remove('show');
    }
  });
})();


/* ═══════════════════════════════════════════════════════════
   2. 탭 전환
   사용법: data-tab-group="그룹명" data-tab="탭명" 버튼에 적용
          대응 패널: data-tab-panel="그룹명" data-panel="탭명"
   ═══════════════════════════════════════════════════════════ */
(function initTabs() {
  document.querySelectorAll('[data-tab]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const group = btn.dataset.tabGroup || 'default';
      const target = btn.dataset.tab;

      /* 버튼 active 전환 */
      document.querySelectorAll('[data-tab-group="' + group + '"]').forEach(function(b) {
        b.classList.toggle('active', b.dataset.tab === target);
      });

      /* 패널 active 전환 */
      document.querySelectorAll('[data-tab-panel="' + group + '"]').forEach(function(p) {
        p.classList.toggle('active', p.dataset.panel === target);
      });
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   3. 검색 폼 — Enter 키 지원
   ═══════════════════════════════════════════════════════════ */
(function initSearch() {
  document.querySelectorAll('.rss-search-wrap input').forEach(function(input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const form = input.closest('form');
        form ? form.submit() : console.log('[RSS Search]', input.value);
      }
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   4. 모달 공통
   사용법: data-modal-open="모달ID" 버튼 / data-modal-close 버튼
   ═══════════════════════════════════════════════════════════ */
(function initModal() {
  /* 열기 */
  document.querySelectorAll('[data-modal-open]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const id = btn.dataset.modalOpen;
      const modal = document.getElementById(id);
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    });
  });

  /* 닫기 */
  function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-modal-close]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const modal = btn.closest('.rss-modal');
      if (modal) closeModal(modal);
    });
  });

  /* 오버레이 클릭 닫기 */
  document.querySelectorAll('.rss-modal').forEach(function(modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal(modal);
    });
  });

  /* ESC 키 닫기 */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.rss-modal[style*="flex"]').forEach(closeModal);
    }
  });
})();


/* ═══════════════════════════════════════════════════════════
   5. 현재 페이지 네비게이션 active 처리
   ═══════════════════════════════════════════════════════════ */
(function initNavActive() {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.rss-nav__link').forEach(function(link) {
    const href = link.getAttribute('href') || '';
    if (href === current || href.includes(current)) {
      link.classList.add('active');
    }
  });
})();


/* ═══════════════════════════════════════════════════════════
   6. 토스트 알림 (선택적 사용)
   사용법: RSS.toast('메시지', 'success' | 'error' | 'info')
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
