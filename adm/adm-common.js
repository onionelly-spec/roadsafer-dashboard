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

  // 1단계: 정확히 일치하는 링크 우선 탐색
  let matched = false;
  links.forEach(link => {
    const menu = link.getAttribute('data-menu');
    if (currentFile === menu) {
      matched = true;
      link.classList.add('active');
      // 서브메뉴 내 항목이면 부모 아코디언 열기
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

  // 2단계: 정확 일치가 없을 때만 startsWith 매칭 (단, 서브메뉴 항목 제외)
  if (!matched) {
    links.forEach(link => {
      const menu = link.getAttribute('data-menu');
      const isSubItem = !!link.closest('.adm-nav__sub');
      if (!isSubItem && currentFile.startsWith(menu)) {
        link.classList.add('active');
        // 아코디언 버튼이면 서브메뉴 열기
        const parentLi = link.closest('li');
        if (parentLi) {
          const sub = parentLi.querySelector('.adm-nav__sub');
          if (sub) {
            sub.style.display = 'block';
            link.setAttribute('aria-expanded', 'true');
            const arrow = link.querySelector('.adm-nav__accordion-arrow i');
            if (arrow) arrow.style.transform = 'rotate(180deg)';
          }
        }
      }
    });
  }
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
    closeBlockCorpModal();
  }
});

/* ─── 10. 차단업체 선택 모달 (M2-1) ─────────────────────────
   공통 모달 — non-performance-list, construction-write 공유
   [Java] GET /adm/block-corp/search?keyword=
   사용법:
     openBlockCorpModal(seq, callback)
       seq      : 대상 공사 시퀀스 (non-performance-list에서 사용)
       callback : 선택 완료 시 호출 function(blockCorpSeq, blockCorpNm)
─────────────────────────────────────────────────────────── */
/* 현재 모달 컨텍스트 — IIFE 앞에 var로 선언하여 TDZ 방지 */
var _blockCorpModalCallback = null; /* 선택 완료 시 호출할 콜백 */
var _blockCorpModalSeq      = null; /* non-performance-list 전용 시퀀스 */

(function injectBlockCorpModal() {
  /* 이미 삽입된 경우 중복 방지 */
  if (document.getElementById('modalBlockCorpSearch')) return;

  const html = `
<!-- ══════════════════════════════════════════════════
     M2-1. 차단업체 선택 모달 (공통 — adm-common.js 자동 삽입)
     용어사전 §22-3 modalBlockCorpSearch
══════════════════════════════════════════════════ -->
<div class="adm-modal-overlay" id="modalBlockCorpSearch" role="dialog"
     aria-modal="true" aria-labelledby="modalBlockCorpSearchTitle">
  <div class="adm-modal-box adm-modal-box--wide">
    <div class="adm-modal-box__head">
      <h3 class="adm-modal-box__title" id="modalBlockCorpSearchTitle">차단업체</h3>
      <button type="button" class="adm-modal-box__close" onclick="closeBlockCorpModal()" aria-label="닫기"></button>
    </div>
    <div class="adm-modal-box__search">
      <!-- [Java] GET /adm/block-corp/search?keyword= -->
      <!-- 용어사전 §7 searchKeyword + block_corp → blockCorpSearchKeyword -->
      <input type="text" id="blockCorpSearchKeyword" class="rss-input" style="flex:1;"
             placeholder="업체명을 입력하세요"
             onkeydown="if(event.key==='Enter') searchBlockCorp()" />
      <button type="button" class="rss-btn rss-btn--amber" onclick="searchBlockCorp()">
        <i data-lucide="search" style="width:14px;height:14px;margin-right:4px;"></i>
        찾기
      </button>
    </div>
    <div class="adm-modal-box__body">
      <div class="rss-table-wrap" style="margin:0;">
        <!-- [Java] th:if="\${#lists.isEmpty(blockCorpList)}" -->
        <!-- <div class="rss-empty">검색 결과가 없습니다.</div> -->
        <!-- [Java] th:unless="\${#lists.isEmpty(blockCorpList)}" -->
        <table class="rss-table" id="blockCorpResultTable">
          <colgroup>
            <col class="rss-col-nm" />
            <col class="rss-col-bizno" />
            <col class="rss-col-addr" />
            <col class="rss-col-mgmt" />     <!-- 선택 버튼 열 10% -->
          </colgroup>
          <thead>
            <tr>
              <th>업체명</th>
              <th>사업자 등록번호</th>
              <th>사업장 주소</th>
              <th>선택</th>
            </tr>
          </thead>
          <tbody id="blockCorpResultBody">
            <!-- ══════════════════════════════════════════════
                 [Java] th:each="corp : \${blockCorpList}"
                 더미 데이터 — 스토리보드 §M2-1 기준
            ══════════════════════════════════════════════ -->
            <tr>
              <td>순희차단</td>
              <td>000-00-00000</td>
              <td>경기도 부천시 조마루로111 1401호</td>
              <td>
                <button type="button" class="rss-btn rss-btn--outline" style="padding:3px 10px;font-size:12px;"
                        onclick="selectBlockCorpRow('1001','순희차단')">선택</button>
              </td>
            </tr>
            <tr>
              <td>우리국도차단</td>
              <td>111-11-11111</td>
              <td>경기도 안성시 단원1길 111</td>
              <td>
                <button type="button" class="rss-btn rss-btn--outline" style="padding:3px 10px;font-size:12px;"
                        onclick="selectBlockCorpRow('1002','우리국도차단')">선택</button>
              </td>
            </tr>
            <tr>
              <td>프리마제일차단</td>
              <td>222-22-22222</td>
              <td>경기도 의정부시 의정부대로 331</td>
              <td>
                <button type="button" class="rss-btn rss-btn--outline" style="padding:3px 10px;font-size:12px;"
                        onclick="selectBlockCorpRow('1003','프리마제일차단')">선택</button>
              </td>
            </tr>
            <tr>
              <td>한국도로차단</td>
              <td>333-33-33333</td>
              <td>경기도 수원시 장안대로13번길 1</td>
              <td>
                <button type="button" class="rss-btn rss-btn--outline" style="padding:3px 10px;font-size:12px;"
                        onclick="selectBlockCorpRow('1004','한국도로차단')">선택</button>
              </td>
            </tr>
            <!-- ══════════════════════════════════════════════
                 [Java] /th:each 끝
            ══════════════════════════════════════════════ -->
          </tbody>
        </table>
      </div>
      <div class="rss-pagination" style="margin-top:12px;">
        <button class="rss-pagination__btn" disabled>&lt;&lt;</button>
        <button class="rss-pagination__btn" disabled>&lt;</button>
        <button class="rss-pagination__btn active" data-page="1">1</button>
        <button class="rss-pagination__btn" data-page="2">2</button>
        <button class="rss-pagination__btn" data-page="3">3</button>
        <button class="rss-pagination__btn">&gt;</button>
        <button class="rss-pagination__btn">&gt;&gt;</button>
      </div>
    </div>
    <div class="adm-modal-box__foot">
      <button type="button" class="rss-btn rss-btn--outline" onclick="closeBlockCorpModal()">닫기</button>
    </div>
  </div>
</div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  /* backdrop 클릭 시 닫기 */
  document.getElementById('modalBlockCorpSearch').addEventListener('click', function(e) {
    if (e.target === this) closeBlockCorpModal();
  });
})();

function openBlockCorpModal(seq, callback) {
  _blockCorpModalSeq      = seq      || null;
  _blockCorpModalCallback = callback || null;

  const modal = document.getElementById('modalBlockCorpSearch');
  if (!modal) return;
  modal.classList.add('open');

  /* 검색창 초기화 */
  const kw = document.getElementById('blockCorpSearchKeyword');
  if (kw) { kw.value = ''; kw.focus(); }

  /* 결과 행 전체 표시 초기화 */
  document.querySelectorAll('#blockCorpResultBody tr').forEach(function(r) {
    r.style.display = '';
  });
  const emptyRow = document.getElementById('blockCorpEmptyRow');
  if (emptyRow) emptyRow.style.display = 'none';

  if (window.lucide) lucide.createIcons();
}

function closeBlockCorpModal() {
  const modal = document.getElementById('modalBlockCorpSearch');
  if (modal) modal.classList.remove('open');
  _blockCorpModalSeq      = null;
  _blockCorpModalCallback = null;
}

/* [Java] GET /adm/block-corp/search?keyword= */
function searchBlockCorp() {
  const keyword = document.getElementById('blockCorpSearchKeyword').value.trim();
  const rows    = document.querySelectorAll('#blockCorpResultBody tr:not(#blockCorpEmptyRow)');
  let found = 0;

  rows.forEach(function(row) {
    const nm   = row.cells[0] ? row.cells[0].textContent.trim() : '';
    const show = !keyword || nm.indexOf(keyword) !== -1;
    row.style.display = show ? '' : 'none';
    if (show) found++;
  });

  /* 결과 없음 처리 */
  let emptyRow = document.getElementById('blockCorpEmptyRow');
  if (!emptyRow) {
    emptyRow = document.createElement('tr');
    emptyRow.id = 'blockCorpEmptyRow';
    emptyRow.innerHTML = '<td colspan="4" class="rss-empty" style="padding:24px 0;text-align:center;color:var(--rss-text-muted);">검색 결과가 없습니다.</td>';
    document.getElementById('blockCorpResultBody').appendChild(emptyRow);
  }
  emptyRow.style.display = (found === 0 && keyword) ? '' : 'none';

  console.log('[M2-1] 차단업체 검색:', keyword);
}

/* 선택 버튼 클릭 → 확인창 → 콜백 또는 기본 처리 */
function selectBlockCorpRow(blockCorpSeq, blockCorpNm) {
  if (!confirm(blockCorpNm + '을(를) 선택하시겠습니까?')) return;

  if (typeof _blockCorpModalCallback === 'function') {
    /* construction-write 등 콜백 방식 */
    _blockCorpModalCallback(blockCorpSeq, blockCorpNm);
  } else {
    /* non-performance-list 기본 처리 */
    /* [Java] POST /adm/non-perf/assign-block-corp */
    /* { constructionSeq: _blockCorpModalSeq, blockCorpSeq, blockCorpNm } */
    console.log('[M2-1] 차단업체 지정:', _blockCorpModalSeq, blockCorpSeq, blockCorpNm);
    alert('차단업체가 지정되었습니다.\n발주·차단업체에 카카오 알림톡이 발송됩니다.');
  }

  closeBlockCorpModal();
}
