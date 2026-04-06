/* ===== 사이드바 토글 ===== */
(function () {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const openBtn = document.getElementById('sidebarOpenBtn');

  function collapseSidebar() {
    sidebar.classList.add('collapsed');
    toggleBtn.title = '메뉴 열기';
  }

  function expandSidebar() {
    sidebar.classList.remove('collapsed');
    toggleBtn.title = '메뉴 닫기';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      if (sidebar.classList.contains('collapsed')) {
        expandSidebar();
      } else {
        collapseSidebar();
      }
    });
  }

  if (openBtn) {
    openBtn.addEventListener('click', function () {
      expandSidebar();
    });
  }

  /* ===== 퀵메뉴 활성화 ===== */
  const quickItems = document.querySelectorAll('.quick-item');
  quickItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      quickItems.forEach(function (qi) { qi.classList.remove('active'); });
      item.classList.add('active');
    });
  });

  /* ===== 사이드바 메뉴 활성화 ===== */
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function (item) {
    item.addEventListener('click', function () {
      navItems.forEach(function (ni) { ni.classList.remove('active'); });
      item.classList.add('active');
    });
  });

  /* ===== 알림 클릭 ===== */
  const notiItems = document.querySelectorAll('.noti-item');
  notiItems.forEach(function (item) {
    item.addEventListener('click', function () {
      const dot = item.querySelector('.noti-dot');
      if (dot && dot.classList.contains('active')) {
        dot.classList.remove('active');
        dot.classList.add('inactive');
        item.classList.remove('active');
        item.classList.add('inactive');
        updateBadgeCount();
      }
    });
  });

  function updateBadgeCount() {
    const activeDots = document.querySelectorAll('.noti-dot.active').length;
    const badge = document.querySelector('.badge-count');
    if (badge) {
      badge.textContent = activeDots;
      badge.style.display = activeDots > 0 ? 'flex' : 'none';
    }
  }

  /* ===== 광고 이미지 로드 실패 시 플레이스홀더 ===== */
  const adImgs = document.querySelectorAll('.ad-img');
  adImgs.forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.display = 'none';
      img.parentElement.style.background = '#ddd';
      img.parentElement.style.display = 'flex';
      img.parentElement.style.alignItems = 'center';
      img.parentElement.style.justifyContent = 'center';
      const placeholder = document.createElement('span');
      placeholder.style.cssText = 'color:#aaa;font-size:12px;';
      placeholder.textContent = '이미지';
      img.parentElement.appendChild(placeholder);
    });
  });

})();
