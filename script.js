/* ===== 사이드바 토글 (미니모드) ===== */
(function () {
  var wrapper = document.getElementById('appWrapper');
  var toggleBtn = document.getElementById('sidebarToggle');
  var headerToggle = document.getElementById('headerToggle');

  function toggleMini() {
    if (wrapper.classList.contains('mini')) {
      wrapper.classList.remove('mini');
      if (toggleBtn) toggleBtn.title = '메뉴 닫기';
    } else {
      wrapper.classList.add('mini');
      if (toggleBtn) toggleBtn.title = '메뉴 열기';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleMini);
  }

  if (headerToggle) {
    headerToggle.addEventListener('click', toggleMini);
  }

  /* ===== 퀵메뉴 활성화 ===== */
  var quickItems = document.querySelectorAll('.quick-item');
  quickItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      quickItems.forEach(function (qi) { qi.classList.remove('active'); });
      item.classList.add('active');
    });
  });

  /* ===== 사이드바 메뉴 활성화 ===== */
  var navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function (item) {
    item.addEventListener('click', function () {
      navItems.forEach(function (ni) { ni.classList.remove('active'); });
      item.classList.add('active');
    });
  });

  /* ===== 알림 클릭 (읽음 처리) ===== */
  var notiItems = document.querySelectorAll('.noti-item');
  notiItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var dot = item.querySelector('.noti-dot');
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
    var activeDots = document.querySelectorAll('.noti-dot.active').length;
    var badge = document.querySelector('.badge-count');
    if (badge) {
      badge.textContent = activeDots;
      badge.style.display = activeDots > 0 ? 'flex' : 'none';
    }
  }

  /* ===== 광고 이미지 로드 실패 시 플레이스홀더 ===== */
  var adImgs = document.querySelectorAll('.ad-img');
  adImgs.forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.display = 'none';
      img.parentElement.style.background = '#ddd';
      img.parentElement.style.display = 'flex';
      img.parentElement.style.alignItems = 'center';
      img.parentElement.style.justifyContent = 'center';
      var placeholder = document.createElement('span');
      placeholder.style.cssText = 'color:#aaa;font-size:12px;';
      placeholder.textContent = '이미지';
      img.parentElement.appendChild(placeholder);
    });
  });

})();
