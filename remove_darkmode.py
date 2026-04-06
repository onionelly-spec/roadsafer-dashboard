#!/usr/bin/env python3
"""모든 HTML 파일에서 다크모드 버튼 일괄 삭제"""
import os
import re

dashboard_dir = '/home/ubuntu/dashboard'
html_files = [f for f in os.listdir(dashboard_dir) if f.endswith('.html')]

# 다크모드 버튼 패턴들
patterns = [
    # construction-list.html 패턴: <button class="header-icon-btn" title="다크모드">...</button>
    r'<button[^>]*title="다크모드"[^>]*>.*?</button>',
    # construction-info.html 패턴: <div class="header-btn" title="다크모드">...</div>
    r'<div[^>]*title="다크모드"[^>]*>.*?</div>',
    # 일반적인 다크모드 토글 버튼
    r'<button[^>]*(?:dark-toggle|theme-toggle|darkMode)[^>]*>.*?</button>',
    # index.html의 다크모드 버튼 (moon SVG)
    r'<button[^>]*id="darkToggle"[^>]*>.*?</button>',
]

for filename in html_files:
    filepath = os.path.join(dashboard_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    for pattern in patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ 다크모드 버튼 삭제: {filename}")
    else:
        print(f"   변경 없음: {filename}")

print("\n완료!")
