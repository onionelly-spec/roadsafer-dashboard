/**
 * adm-common.js
 * 로드세이프티시스템 (RSS) — 관리자 사이트 공통 스크립트
 * ============================================================
 * [역할]
 *   1. adm-topbar.html, adm-sidebar.html 동적 삽입
 *   2. 현재 페이지 URL 기준 사이드바 active 메뉴 자동 설정
 *   3. 모바일 사이드바 토글
 *   4. 통계 메뉴 아코디언
 *   5. 비밀번호 변경 모달 제어
 *   6. 로그아웃 처리
 *
 * [Java 연동 시]
 *   - 세션 정보(admNm, admRole)는 Thymeleaf th:text로 직접 바인딩하고
 *     이 JS의 더미 데이터 주입 부분을 제거하세요.
 *   - POST 요청 URL은 각 함수 주석의 [Java] 표기를 참조하세요.
 * ============================================================
 */

/* ─── 1. 공통 컴포넌트 삽입 ─────────────────────────────── */
(function loadAdmComponents() {
  const topbarWrap = document.getElementById('adm-topbar-wrap');
  const sidebarWrap = document.getElementById('adm-sidebar-wrap');

  // 컴포넌트 파일 경로 (adm/ 루트 기준)
  // adm/ath/ 등 하위 폴더에서 사용 시 basePath를 '../' 로 조정
  const basePath = (function() {
    const depth = location.pathname.split('/adm/')[1] || '';
    return depth.includes('/') ? '../' : './';
  })();

  function loadFragment(wrap, file, callback) {
    if (!wrap) return;
    fetch(basePath + file)
      .then(r => r.text())
      .then(html => {
        wrap.innerHTML = html;
        if (callback) callback();
      })
      .catch(() => console.warn('[ADM] 컴포넌트 로드 실패:', file));
  }

  loadFragment(topbarWrap, 'adm-topbar.html', function() {
    initAdmTopbar();
  });

  loadFragment(sidebarWrap, 'adm-sidebar.html', function() {
    initAdmSidebar();
    setAdmActiveMenu();
    initAdmAccordion();
    // Lucide 아이콘 재렌더링
    if (window.lucide) lucide.createIcons();
  });
})();

/* ─── 2. 상단 바 초기화 ─────────────────────────────────── */
function initAdmTopbar() {
  // Lucide 아이콘 렌더링
  if (window.lucide) lucide.createIcons();

  // 모바일 햄버거 버튼 이벤트
  const menuBtn = document.getElementById('admSidebarToggle');
  if (menuBtn) {
    menuBtn.addEventListener('click', toggleAdmSidebar);
  }
}

/* ─── 3. 사이드바 초기화 ─────────────────────────────────── */
function initAdmSidebar() {
  if (window.lucide) lucide.createIcons();
}

/* ─── 4. 현재 페이지 기준 active 메뉴 설정 ─────────────── */
function setAdmActiveMenu() {
  const currentFile = location.pathname.split('/').pop().replace('.html', '');
  const links = document.querySelectorAll('#admSidebar .rss-nav__link[data-menu]');

  links.forEach(link => {
    const menu = link.getAttribute('data-menu');
    if (currentFile.startsWith(menu) || currentFile === menu) {
      link.classList.add('active');
      // 아코디언 서브메뉴 내 항목이면 부모 아코디언 열기
      const sub = link.closest('.adm-nav__sub');
      if (sub) {
        sub.style.display = 'block';
        const parentBtn = sub.previousElementSibling;
        if (parentBtn) {
          parentBtn.setAttribute('aria-expanded', 'true');
          const arrow = parentBtn.querySelector('.adm-nav__accordion-arrow i');
          if (arrow) arrow.style.transform = 'rotate(180deg)';
        }
      }
    }
  });
}

/* ─── 5. 모바일 사이드바 토글 ───────────────────────────── */
function toggleAdmSidebar() {
  const sidebar = document.getElementById('admSidebar');
  const overlay = document.getElementById('admOverlay');
  if (!sidebar) return;
  const isOpen = sidebar.classList.contains('mobile-open');
  if (isOpen) {
    closeAdmSidebar();
  } else {
    sidebar.classList.add('mobile-open');
    if (overlay) overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
}

function closeAdmSidebar() {
  const sidebar = document.getElementById('admSidebar');
  const overlay = document.getElementById('admOverlay');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (overlay) overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ─── 6. 통계 아코디언 ──────────────────────────────────── */
function initAdmAccordion() {
  // 페이지 로드 시 active 서브메뉴는 setAdmActiveMenu()에서 처리
}

function toggleAdmAccordion(btn) {
  const isExpanded = btn.getAttribute('aria-expanded') === 'true';
  const subMenuId = btn.closest('li').querySelector('.adm-nav__sub');
  const arrow = btn.querySelector('.adm-nav__accordion-arrow i');

  if (isExpanded) {
    btn.setAttribute('aria-expanded', 'false');
    if (subMenuId) subMenuId.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  } else {
    btn.setAttribute('aria-expanded', 'true');
    if (subMenuId) subMenuId.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  }
}

/* ─── 7. 비밀번호 변경 모달 ─────────────────────────────── */
function openAdmPwModal() {
  const modal = document.getElementById('admPwModal');
  if (modal) {
    modal.classList.add('is-open');
    // 입력 초기화
    ['adm_cur_pw', 'adm_new_pw', 'adm_new_pw_confirm'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const msg = document.getElementById('admPwMatchMsg');
    if (msg) msg.style.display = 'none';
  }
}

function closeAdmPwModal() {
  const modal = document.getElementById('admPwModal');
  if (modal) modal.classList.remove('is-open');
}

function checkAdmPwMatch() {
  const newPw = document.getElementById('adm_new_pw');
  const confirmPw = document.getElementById('adm_new_pw_confirm');
  const msg = document.getElementById('admPwMatchMsg');
  if (!newPw || !confirmPw || !msg) return;

  if (confirmPw.value.length > 0 && newPw.value !== confirmPw.value) {
    msg.style.display = 'block';
    confirmPw.classList.add('rss-input--error');
  } else {
    msg.style.display = 'none';
    confirmPw.classList.remove('rss-input--error');
  }
}

function submitAdmPwChange() {
  const curPw = document.getElementById('adm_cur_pw');
  const newPw = document.getElementById('adm_new_pw');
  const confirmPw = document.getElementById('adm_new_pw_confirm');

  if (!curPw.value.trim()) {
    curPw.focus();
    curPw.classList.add('rss-input--error');
    return;
  }
  if (!newPw.value.trim()) {
    newPw.focus();
    newPw.classList.add('rss-input--error');
    return;
  }
  if (newPw.value !== confirmPw.value) {
    confirmPw.focus();
    return;
  }

  // [Java] POST /adm/ath/pw-change
  // { admCurPw: curPw.value, admNewPw: newPw.value }
  console.log('[ADM] 비밀번호 변경 요청 (Java 연동 시 구현)');
  closeAdmPwModal();
  alert('비밀번호가 변경되었습니다.');
}

/* ─── 8. 로그아웃 ───────────────────────────────────────── */
function admLogout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    // [Java] POST /adm/ath/logout → redirect /adm/ath/parLoginForm.do
    location.href = 'ath/parLoginForm.html';
  }
}

/* ─── 9. ESC 키로 모달 닫기 ─────────────────────────────── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeAdmPwModal();
    closeAdmSidebar();
  }
});
