/* ============================================================
   ROADSAFER SYSTEM - COMMON JS
   ============================================================ */

// ===== 사이드바 토글 =====
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (!sidebar) return;

  const isMini = () => sidebar.classList.contains('mini');

  function applyState(mini) {
    if (mini) {
      sidebar.classList.add('mini');
      if (mainContent) mainContent.classList.add('mini');
    } else {
      sidebar.classList.remove('mini');
      if (mainContent) mainContent.classList.remove('mini');
    }
    try { localStorage.setItem('sidebarMini', mini ? '1' : '0'); } catch(e) {}
  }

  // 저장된 상태 복원
  try {
    const saved = localStorage.getItem('sidebarMini');
    if (saved === '1') applyState(true);
  } catch(e) {}

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      applyState(!isMini());
    });
  }

  // 모바일: 900px 이하에서 자동 미니
  function checkMobile() {
    if (window.innerWidth <= 900) {
      sidebar.classList.add('mini');
      if (mainContent) mainContent.classList.add('mini');
    }
  }
  checkMobile();
  window.addEventListener('resize', checkMobile);
}

// ===== 탭 전환 =====
function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector || '.tab-container');
  if (!container) return;
  const tabs = container.querySelectorAll('.tab-btn');
  const panels = container.querySelectorAll('.tab-panel');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      const target = this.getAttribute('data-tab');
      tabs.forEach(function(t) { t.classList.remove('active'); });
      panels.forEach(function(p) { p.classList.remove('active'); });
      this.classList.add('active');
      const panel = container.querySelector('#' + target);
      if (panel) panel.classList.add('active');
    });
  });
}

// ===== 모달 =====
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('open');
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('open');
}
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  document.querySelectorAll('[data-modal-open]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      openModal(this.getAttribute('data-modal-open'));
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      closeModal(this.getAttribute('data-modal-close'));
    });
  });
}

// ===== 활성 메뉴 표시 =====
function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(function(item) {
    const href = item.getAttribute('href') || '';
    if (href === current || href.includes(current)) {
      item.classList.add('active');
    }
  });
}

// ===== 필터 탭 =====
function initFilterTabs() {
  document.querySelectorAll('.filter-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      const group = this.closest('.filter-tabs');
      if (group) {
        group.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
      }
      this.classList.add('active');
      const filter = this.getAttribute('data-filter');
      filterList(filter);
    });
  });
}

// ===== 목록 필터링 =====
function filterList(status) {
  const items = document.querySelectorAll('[data-status]');
  items.forEach(function(item) {
    if (!status || status === 'all') {
      item.style.display = '';
    } else {
      item.style.display = (item.getAttribute('data-status') === status) ? '' : 'none';
    }
  });
}

// ===== 검색 =====
function initSearch(inputId, targetSelector) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    document.querySelectorAll(targetSelector).forEach(function(item) {
      const text = item.textContent.toLowerCase();
      item.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  });
}

// ===== 확인 다이얼로그 =====
function confirmAction(msg, callback) {
  if (window.confirm(msg)) callback();
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', function() {
  initSidebar();
  initTabs();
  initModals();
  setActiveNav();
  initFilterTabs();
});
