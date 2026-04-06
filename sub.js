/* ===== 탭 전환 ===== */
(function () {
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');

      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      tabContents.forEach(function (c) { c.classList.remove('active'); });

      btn.classList.add('active');
      var targetEl = document.getElementById('tab-' + target);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  /* ===== 필터 버튼 ===== */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var listItems = document.querySelectorAll('.list-item');
  var listDividers = document.querySelectorAll('.list-divider');
  var emptyState = document.getElementById('emptyState');

  function applyFilter(filter) {
    var visibleCount = 0;
    var prevVisible = false;

    listItems.forEach(function (item) {
      var status = item.getAttribute('data-status');
      var show = (filter === 'all') || (status === filter);
      item.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    /* 구분선 처리: 연속된 보이는 항목 사이에만 표시 */
    listDividers.forEach(function (div) {
      div.style.display = 'none';
    });

    var visibleItems = [];
    listItems.forEach(function (item) {
      if (item.style.display !== 'none') visibleItems.push(item);
    });

    /* 보이는 항목들 사이 구분선 다시 표시 */
    for (var i = 0; i < visibleItems.length - 1; i++) {
      var nextSibling = visibleItems[i].nextElementSibling;
      if (nextSibling && nextSibling.classList.contains('list-divider')) {
        nextSibling.style.display = '';
      }
    }

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      applyFilter(filter);
      /* 검색어도 같이 적용 */
      var searchInput = document.getElementById('searchInput');
      if (searchInput && searchInput.value.trim()) {
        applySearch(searchInput.value.trim(), filter);
      }
    });
  });

  /* ===== 검색 ===== */
  var searchInput = document.getElementById('searchInput');

  function applySearch(keyword, filter) {
    filter = filter || 'all';
    var kw = keyword.toLowerCase();
    var visibleCount = 0;

    listItems.forEach(function (item) {
      var status = item.getAttribute('data-status');
      var text = item.textContent.toLowerCase();
      var matchFilter = (filter === 'all') || (status === filter);
      var matchSearch = !kw || text.indexOf(kw) !== -1;
      var show = matchFilter && matchSearch;
      item.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    /* 구분선 재처리 */
    listDividers.forEach(function (div) { div.style.display = 'none'; });
    var visibleItems = [];
    listItems.forEach(function (item) {
      if (item.style.display !== 'none') visibleItems.push(item);
    });
    for (var i = 0; i < visibleItems.length - 1; i++) {
      var nextSibling = visibleItems[i].nextElementSibling;
      if (nextSibling && nextSibling.classList.contains('list-divider')) {
        nextSibling.style.display = '';
      }
    }

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var activeFilter = document.querySelector('.filter-btn.active');
      var filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
      applySearch(searchInput.value.trim(), filter);
    });
  }

})();
