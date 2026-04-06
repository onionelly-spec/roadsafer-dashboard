#!/usr/bin/env python3
"""
모든 서브 페이지의 사이드바를 메인 대시보드(index.html) 스타일로 통일
- common.css → style.css + sub.css 로 변경
- common.js → script.js 로 변경
- app-layout → app-wrapper 로 변경
- main-content/mainContent → main-area/mainArea 로 변경
- 사이드바 HTML 구조를 index.html 방식으로 통일
"""

import re, os

# 각 페이지별 active 메뉴 정보
PAGE_ACTIVE = {
    'construction-list.html': '내 공사 현황',
    'construction-detail.html': '내 공사 현황',
    'construction-info.html': '공사 정보',
    'construction-info-detail.html': '공사 정보',
    'tma-card.html': 'TMA 카드 관리',
    'market.html': '장터',
    'market-detail.html': '장터',
    'market-write.html': '장터',
    'community.html': '커뮤니티',
    'community-detail.html': '커뮤니티',
    'community-write.html': '커뮤니티',
    'notice.html': '공지사항',
    'notice-detail.html': '공지사항',
    'ad.html': '광고',
    'ad-detail.html': '광고',
    'profile.html': '정보변경',
}

def make_sidebar(active_label):
    def nav_item(href, label, icon_svg, active=''):
        active_class = ' active' if label == active_label else ''
        return f'''        <li class="nav-item{active_class}">
          <a href="{href}" class="nav-link" data-tooltip="{label}">
            <span class="nav-icon">{icon_svg}</span>
            <span class="nav-label">{label}</span>
          </a>
        </li>'''

    icons = {
        '메인 대시보드': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        '내 공사 현황': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
        '공사 정보': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
        'TMA 카드 관리': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
        '장터': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
        '커뮤니티': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        '공지사항': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
        '광고': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>',
        '정보변경': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>',
        '로그아웃': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    }

    sidebar = f'''  <!-- ===== SIDEBAR ===== -->
  <aside class="sidebar" id="sidebar">

    <!-- 로고 + 토글 -->
    <div class="sidebar-logo-row">
      <a href="index.html" class="sidebar-logo">
        <img src="logo.png" alt="로드세이프터 로고" class="logo-img" />
        <span class="logo-text-wrap">
          <span class="logo-main">(주)로드세이프티시스템</span>
          <span class="logo-sub">Road Safety System</span>
        </span>
      </a>
      <button class="sidebar-toggle" id="sidebarToggle" title="메뉴 닫기">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- 사용자 정보 -->
    <div class="sidebar-user">
      <div class="user-avatar">나</div>
      <div class="user-info">
        <div class="user-name">나잘난</div>
        <div class="user-company">한국도로차단(주)</div>
      </div>
    </div>

    <!-- 메뉴 -->
    <nav class="sidebar-nav">
      <div class="nav-section-label">차단기업</div>
      <ul class="nav-list">
{nav_item('index.html', '메인 대시보드', icons['메인 대시보드'])}
{nav_item('construction-list.html', '내 공사 현황', icons['내 공사 현황'])}
{nav_item('construction-info.html', '공사 정보', icons['공사 정보'])}
{nav_item('tma-card.html', 'TMA 카드 관리', icons['TMA 카드 관리'])}
{nav_item('market.html', '장터', icons['장터'])}
{nav_item('community.html', '커뮤니티', icons['커뮤니티'])}
{nav_item('notice.html', '공지사항', icons['공지사항'])}
{nav_item('ad.html', '광고', icons['광고'])}
      </ul>
    </nav>

    <!-- 하단 메뉴 -->
    <div class="sidebar-bottom">
      <a href="profile.html" class="bottom-link" data-tooltip="정보변경">
        <span class="nav-icon">{icons['정보변경']}</span>
        <span class="nav-label">정보변경</span>
      </a>
      <a href="login.html" class="bottom-link" data-tooltip="로그아웃">
        <span class="nav-icon">{icons['로그아웃']}</span>
        <span class="nav-label">로그아웃</span>
      </a>
    </div>

  </aside>'''
    return sidebar

# 각 서브 페이지 처리
dashboard_dir = '/home/ubuntu/dashboard'

for filename, active_label in PAGE_ACTIVE.items():
    filepath = os.path.join(dashboard_dir, filename)
    if not os.path.exists(filepath):
        print(f"SKIP (not found): {filename}")
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. CSS 링크 교체: common.css → style.css + sub.css
    # common.css를 style.css + sub.css로 교체
    content = re.sub(
        r'<link rel="stylesheet" href="common\.css" />',
        '<link rel="stylesheet" href="style.css" />\n  <link rel="stylesheet" href="sub.css" />',
        content
    )

    # 2. JS 교체: common.js → script.js (있으면)
    content = re.sub(
        r'<script src="common\.js"></script>',
        '<script src="script.js"></script>',
        content
    )

    # 3. app-layout → app-wrapper
    content = content.replace('class="app-layout"', 'class="app-wrapper" id="appWrapper"')

    # 4. main-content id=mainContent → main-area id=mainArea
    content = re.sub(
        r'<div class="main-content" id="mainContent">',
        '<div class="main-area" id="mainArea">',
        content
    )
    # main-content 클래스만 있는 경우
    content = re.sub(
        r'<div class="main-content">',
        '<div class="main-area" id="mainArea">',
        content
    )

    # 5. 사이드바 전체 교체: <aside class="sidebar" id="sidebar"> ... </aside> 블록 교체
    new_sidebar = make_sidebar(active_label)
    # aside 블록 찾아서 교체
    aside_pattern = re.compile(
        r'  <!-- ===== SIDEBAR ===== -->.*?</aside>',
        re.DOTALL
    )
    if aside_pattern.search(content):
        content = aside_pattern.sub(new_sidebar, content, count=1)
    else:
        # 패턴이 없으면 <aside ... > ... </aside> 직접 교체
        aside_pattern2 = re.compile(r'  <aside class="sidebar"[^>]*>.*?</aside>', re.DOTALL)
        if aside_pattern2.search(content):
            content = aside_pattern2.sub(new_sidebar, content, count=1)
        else:
            print(f"WARNING: aside not found in {filename}")

    # 6. header 구조 통일 (main-header 내부)
    # header-title → page-title 방식으로 교체 (main-header 내 header-title 클래스 수정)
    # header-right → header-user 방식으로 교체
    content = re.sub(
        r'<div class="header-title">([^<]+)</div>',
        r'<h1 class="page-title">\1</h1>',
        content
    )
    content = re.sub(
        r'<div class="header-right">\s*<a href="profile\.html" class="header-user"><div class="header-user-avatar">나</div><span class="header-user-name">나잘난</span></a>\s*</div>',
        '<div class="header-user"><div class="header-avatar">나</div><span class="header-username">나잘난</span></div>',
        content
    )

    # 7. main-header에 header-left 추가 (hamburger + title)
    # <header class="main-header"> 다음에 header-left 구조 추가
    def add_header_left(m):
        inner = m.group(1)
        # 이미 header-left가 있으면 건드리지 않음
        if 'header-left' in inner:
            return m.group(0)
        # page-title 찾아서 header-left로 감싸기
        inner2 = re.sub(
            r'(<h1 class="page-title">.*?</h1>)',
            r'''<div class="header-left">
        <button class="header-toggle" id="headerToggle" title="메뉴 토글">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        \1
      </div>''',
            inner,
            flags=re.DOTALL
        )
        return f'<header class="main-header">{inner2}</header>'

    content = re.sub(
        r'<header class="main-header">(.*?)</header>',
        add_header_left,
        content,
        flags=re.DOTALL
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"UPDATED: {filename}")
    else:
        print(f"NO CHANGE: {filename}")

print("\nDone!")
