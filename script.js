// 搜索引擎配置
const searchEngines = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    baidu: 'https://www.baidu.com/s?wd=',
    yandex: 'https://yandex.com/search/?text=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    ecosia: 'https://www.ecosia.org/search?q='
};

const translateEngines = {
    google: 'https://translate.google.com/?sl=auto&tl=zh-CN&text=',
    bing: 'https://www.bing.com/translator?text=',
    deepl: 'https://www.deepl.com/zh/translator#zh/en-us/',
    baidu: 'https://fanyi.baidu.com/#auto/zh/'
};

// 初始化数据 - 根据需求不再内置网站，只保留空数组
let currentMode = 'search';
let currentEngine = 'google';
let links = JSON.parse(localStorage.getItem('navLinks')) || [];

// 切换模式
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // 移动滑块
     const slider = document.querySelector('.mode-slider');
     if (mode === 'translate') {
         slider.style.transform = 'translateX(100px)'; // 与按钮宽度保持一致
     } else {
         slider.style.transform = 'translateX(0)';
     }
    
    const searchInput = document.getElementById('searchQuery');
    if (mode === 'translate') {
        searchInput.placeholder = '输入要翻译的文本...';
        // 切换到翻译引擎
        selectEngine('google', 'Google翻译');
        // 更新引擎下拉菜单以显示适合翻译的选项
        updateEngineDropdown();
    } else {
        searchInput.placeholder = '输入搜索内容或网址...';
        // 切换回搜索引擎
        selectEngine('google', 'Google');
        // 更新引擎下拉菜单以显示所有搜索选项
        updateEngineDropdown();
    }
}

// 更新引擎下拉菜单内容
function updateEngineDropdown() {
    const dropdown = document.getElementById('engineDropdown');
    dropdown.innerHTML = '';
    
    if (currentMode === 'translate') {
        // 翻译模式下只显示翻译引擎
        dropdown.innerHTML = `
            <div class="engine-option" onclick="selectEngine('google', 'Google翻译')">
                <div class="engine-icon google-icon"></div>
                <span class="engine-name">Google翻译</span>
            </div>
            <div class="engine-option" onclick="selectEngine('bing', 'Bing翻译')">
                <div class="engine-icon bing-icon"></div>
                <span class="engine-name">Bing翻译</span>
            </div>
            <div class="engine-option" onclick="selectEngine('deepl', 'DeepL')">
                <div class="engine-icon deepl-icon"></div>
                <span class="engine-name">DeepL</span>
            </div>
            <div class="engine-option" onclick="selectEngine('baidu', '百度翻译')">
                <div class="engine-icon baidu-icon"></div>
                <span class="engine-name">百度翻译</span>
            </div>
        `;
    } else {
        // 搜索模式下显示所有搜索引擎
        dropdown.innerHTML = `
            <div class="engine-option" onclick="selectEngine('google', 'Google')">
                <div class="engine-icon google-icon"></div>
                <span class="engine-name">Google</span>
            </div>
            <div class="engine-option" onclick="selectEngine('bing', 'Bing')">
                <div class="engine-icon bing-icon"></div>
                <span class="engine-name">Bing</span>
            </div>
            <div class="engine-option" onclick="selectEngine('baidu', '百度')">
                <div class="engine-icon baidu-icon"></div>
                <span class="engine-name">百度</span>
            </div>
            <div class="engine-option" onclick="selectEngine('yandex', 'Yandex')">
                <div class="engine-icon yandex-icon"></div>
                <span class="engine-name">Yandex</span>
            </div>
            <div class="engine-option" onclick="selectEngine('duckduckgo', 'DuckDuckGo')">
                <div class="engine-icon duckduckgo-icon"></div>
                <span class="engine-name">DuckDuckGo</span>
            </div>
            <div class="engine-option" onclick="selectEngine('ecosia', 'Ecosia')">
                <div class="engine-icon ecosia-icon"></div>
                <span class="engine-name">Ecosia</span>
            </div>
        `;
    }
}

// 切换引擎下拉菜单
function toggleEngineDropdown() {
    const dropdown = document.getElementById('engineDropdown');
    dropdown.classList.toggle('show');
}

// 选择引擎
function selectEngine(engine, displayName) {
    currentEngine = engine;
    const selector = document.querySelector('.engine-selector');
    const icon = selector.querySelector('.engine-icon');
    const nameSpan = selector.querySelector('.engine-name');
    
    // 更新图标
    icon.className = 'engine-icon ' + engine + '-icon';
    if (nameSpan) {
        nameSpan.textContent = displayName;
    }
    
    // 关闭下拉菜单
    const dropdown = document.getElementById('engineDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

// 处理搜索
function handleSearch() {
    const query = document.getElementById('searchQuery').value.trim();
    if (!query) return;
    
    let url;
    if (currentMode === 'translate') {
        // 翻译模式
        url = translateEngines[currentEngine] + encodeURIComponent(query);
    } else {
        // 搜索模式
        // 检查是否是网址
        if (query.includes('.') && !query.includes(' ')) {
            url = query.startsWith('http') ? query : 'https://' + query;
        } else {
            url = searchEngines[currentEngine] + encodeURIComponent(query);
        }
    }
    
    window.open(url, '_blank');
}

// 设置主题
function setTheme(theme) {
    // 禁用过渡效果以避免毛玻璃闪烁
    document.body.style.transition = 'none';
    
    // 立即应用新主题
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('preferred-theme', theme);
    
    // 更新按钮状态
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.classList.contains(theme)) {
            btn.classList.add('active');
        }
    });
    
    // 重新启用过渡效果
    setTimeout(() => {
        document.body.style.transition = '';
    }, 50);
}



// 根据字符串生成颜色
function getColorFromString(str) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4ecdc4', '#45b7d1', '#96c93d', '#ff6b6b'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// 计算书签网格布局
function calculateGridLayout(totalItems) {
    if (totalItems <= 6) {
        return { columns: totalItems, rows: 1 };
    }
    
    // 计算最佳行数和列数分配
    const maxColumns = 6;
    const rows = Math.ceil(totalItems / maxColumns);
    
    if (rows === 2) {
        // 两行的情况，尽量平均分配
        const firstRowItems = Math.ceil(totalItems / 2);
        const secondRowItems = totalItems - firstRowItems;
        return { 
            columns: Math.max(firstRowItems, secondRowItems),
            rows: 2,
            firstRowItems,
            secondRowItems
        };
    } else {
        // 多行的情况，也要尽量均分
        const itemsPerRow = Math.ceil(totalItems / rows);
        const lastRowItems = totalItems - (rows - 1) * itemsPerRow;
        
        // 如果最后一行太少，重新分配
        if (lastRowItems < itemsPerRow / 2 && rows > 2) {
            const newItemsPerRow = Math.ceil(totalItems / (rows - 1));
            return { 
                columns: newItemsPerRow, 
                rows: rows - 1,
                itemsPerRow: newItemsPerRow
            };
        }
        
        return { 
            columns: itemsPerRow, 
            rows: rows,
            itemsPerRow: itemsPerRow
        };
    }
}

// 渲染快速链接
function renderQuickLinks() {
    const container = document.getElementById('quickLinksContainer');
    container.innerHTML = '';
    
    if (links.length === 0) return;
    
    const layout = calculateGridLayout(links.length);
    
    // 设置网格样式
    if (links.length <= 6) {
        container.style.gridTemplateColumns = `repeat(${layout.columns}, 80px)`;
        container.style.gridTemplateRows = '1fr';
    } else if (layout.rows === 2) {
        // 两行情况，需要特殊处理
        container.style.gridTemplateColumns = `repeat(${layout.columns}, 80px)`;
        container.style.gridTemplateRows = 'repeat(2, 1fr)';
    } else {
        // 多行情况
        container.style.gridTemplateColumns = `repeat(${layout.columns}, 80px)`;
        container.style.gridTemplateRows = `repeat(${layout.rows}, 1fr)`;
    }
    
    // 渲染每个链接
    links.forEach((link, index) => {
        const linkElement = document.createElement('div');
        linkElement.className = 'quick-link';
        linkElement.onclick = () => window.open(link.url, '_blank');
        
        const icon = document.createElement('div');
        icon.className = 'quick-link-icon';
        // 使用保存的favicon URL，如果没有则动态生成
        const faviconUrl = link.faviconUrl || getCachedFaviconUrl(link.url);
        icon.style.backgroundImage = `url('${faviconUrl}')`;
        icon.style.backgroundSize = 'contain';
        icon.style.backgroundRepeat = 'no-repeat';
        icon.style.backgroundPosition = 'center';
        
        const name = document.createElement('div');
        name.className = 'quick-link-name';
        name.textContent = link.name;
        
        linkElement.appendChild(icon);
        linkElement.appendChild(name);
        container.appendChild(linkElement);
    });
    
    // 检查是否需要显示滚动条（超过三行时）
    if (layout.rows > 3) {
        container.classList.add('overflowing');
    } else {
        container.classList.remove('overflowing');
    }
}


// 切换主题切换器显示状态
function toggleThemeSwitcher() {
    const themeSwitcher = document.getElementById('themeSwitcher');
    themeSwitcher.classList.toggle('show');
}

// 点击外部关闭主题切换器和引擎下拉菜单
document.addEventListener('click', function(event) {
    const themeSwitcher = document.getElementById('themeSwitcher');
    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    const engineDropdown = document.getElementById('engineDropdown');
    const engineSelector = document.querySelector('.engine-selector');
    
    if (!themeSwitcher.contains(event.target) && !themeToggleBtn.contains(event.target)) {
        themeSwitcher.classList.remove('show');
    }
    
    if (!engineDropdown.contains(event.target) && !engineSelector.contains(event.target)) {
        engineDropdown.classList.remove('show');
    }
});

// 打开设置
function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('show');
    renderLinks();
}

// 关闭设置
function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('show');
}

// 标签页切换
function switchTab(tabName) {
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // 移动滑块
    const slider = document.querySelector('.tab-slider');
    if (tabName === 'wallpaper') {
        slider.style.transform = 'translateX(calc(100% + 4px))';
    } else {
        slider.style.transform = 'translateX(0)';
    }
    
    // 更新标签内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName + '-tab');
    });
}

// 添加书签
function addLink() {
    const name = document.getElementById('linkName').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    
    if (!name || !url) {
        alert('请填写完整的网站名称和地址');
        return;
    }
    
    // 确保URL格式正确
    const formattedUrl = url.startsWith('http') ? url : 'https://' + url;
    
    // 获取favicon URL
    const faviconUrl = getCachedFaviconUrl(formattedUrl);
    
    links.push({ name, url: formattedUrl, faviconUrl });
    localStorage.setItem('navLinks', JSON.stringify(links));
    
    // 清空输入框
    document.getElementById('linkName').value = '';
    document.getElementById('linkUrl').value = '';
    
    // 重新渲染
    renderLinks();
    renderQuickLinks();
}

// 删除书签
function deleteLink(index) {
    if (confirm('确定要删除这个书签吗？')) {
        links.splice(index, 1);
        localStorage.setItem('navLinks', JSON.stringify(links));
        renderLinks();
        renderQuickLinks();
    }
}

// 渲染设置中的书签列表
// 获取网站favicon
function getFaviconUrl(url) {
    try {
        // 确保URL格式正确
        const fullUrl = url.startsWith('http') ? url : 'https://' + url;
        const domain = new URL(fullUrl).hostname;
        return `https://${domain}/favicon.ico`;
    } catch {
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E';
    }
}

// 获取带缓存的网站favicon（30分钟缓存）
function getCachedFaviconUrl(url) {
    try {
        // 确保URL格式正确
        const fullUrl = url.startsWith('http') ? url : 'https://' + url;
        const domain = new URL(fullUrl).hostname;
        const faviconKey = `favicon_${domain}`;
        const cacheKey = `favicon_cache_${domain}`;
        
        // 检查是否有缓存
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            const cache = JSON.parse(cachedData);
            const now = Date.now();
            
            // 如果缓存未过期（30分钟内），直接返回缓存的favicon
            if (now - cache.timestamp < 30 * 60 * 1000) {
                return cache.faviconUrl;
            }
        }
        
        // 生成新的favicon URL
        const faviconUrl = `https://${domain}/favicon.ico`;
        
        // 保存到缓存
        const cacheData = {
            faviconUrl: faviconUrl,
            timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        
        return faviconUrl;
    } catch {
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E';
    }
}

// 渲染设置中的书签列表
function renderLinks() {
    const container = document.getElementById('linksContainer');
    container.innerHTML = '';
    
    links.forEach((link, index) => {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        linkItem.id = `link-${index}`;
        
        // 网站图标
        const favicon = document.createElement('div');
        favicon.className = 'link-favicon';
        favicon.style.backgroundImage = `url('${getCachedFaviconUrl(link.url)}')`;
        
        // 网站信息
        const details = document.createElement('div');
        details.className = 'link-details';
        
        const name = document.createElement('div');
        name.className = 'link-name';
        name.textContent = link.name;
        
        const url = document.createElement('div');
        url.className = 'link-url';
        url.textContent = link.url;
        
        details.appendChild(name);
        details.appendChild(url);
        
        // 操作按钮
        const actions = document.createElement('div');
        actions.className = 'link-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = '修改';
        editBtn.onclick = () => editLink(index);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '删除';
        deleteBtn.onclick = () => deleteLink(index);
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        linkItem.appendChild(favicon);
        linkItem.appendChild(details);
        linkItem.appendChild(actions);
        container.appendChild(linkItem);
    });
}

// 编辑书签
function editLink(index) {
    const linkItem = document.getElementById(`link-${index}`);
    const link = links[index];
    
    // 获取现有元素
    const nameDiv = linkItem.querySelector('.link-name');
    const urlDiv = linkItem.querySelector('.link-url');
    const editBtn = linkItem.querySelector('.edit-btn');
    const deleteBtn = linkItem.querySelector('.delete-btn');
    
    // 将名称和URL改为输入框
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = link.name;
    nameInput.style.cssText = 'width: 100%; padding: 2px 4px; border: 1px solid var(--border-color); border-radius: 3px; font-size: 14px; font-weight: 500; background: transparent; color: var(--text-color); margin-bottom: 2px; box-sizing: border-box; outline: none;';
    
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.value = link.url;
    urlInput.style.cssText = 'width: 100%; padding: 2px 4px; border: 1px solid var(--border-color); border-radius: 3px; font-size: 12px; background: transparent; color: var(--text-secondary); box-sizing: border-box; outline: none;';
    
    // 添加焦点事件来改善视觉效果
    nameInput.addEventListener('focus', function() {
        this.style.borderColor = 'var(--primary-color)';
        this.style.backgroundColor = 'var(--input-background, var(--card-background))';
    });
    
    nameInput.addEventListener('blur', function() {
        this.style.borderColor = 'var(--border-color)';
        this.style.backgroundColor = 'transparent';
    });
    
    urlInput.addEventListener('focus', function() {
        this.style.borderColor = 'var(--primary-color)';
        this.style.backgroundColor = 'var(--input-background, var(--card-background))';
    });
    
    urlInput.addEventListener('blur', function() {
        this.style.borderColor = 'var(--border-color)';
        this.style.backgroundColor = 'transparent';
    });
    
    // 替换文本为输入框
    nameDiv.innerHTML = '';
    nameDiv.appendChild(nameInput);
    urlDiv.innerHTML = '';
    urlDiv.appendChild(urlInput);
    
    // 修改按钮文字和功能
    editBtn.textContent = '保存';
    editBtn.className = 'save-btn';
    editBtn.onclick = () => saveLink(index, nameInput.value.trim(), urlInput.value.trim());
    
    deleteBtn.textContent = '取消';
    deleteBtn.className = 'cancel-btn';
    deleteBtn.onclick = () => renderLinks();
}

// 保存编辑的书签
function saveLink(index, name, url) {
    if (!name || !url) {
        alert('请填写完整的网站名称和地址');
        return;
    }
    
    // 确保URL格式正确
    const formattedUrl = url.startsWith('http') ? url : 'https://' + url;
    
    // 获取favicon URL
    const faviconUrl = getFaviconUrl(formattedUrl);
    
    links[index] = { name, url: formattedUrl, faviconUrl };
    localStorage.setItem('navLinks', JSON.stringify(links));
    
    // 重新渲染
    renderLinks();
    renderQuickLinks();
}

// 设置壁纸
function setWallpaper(type) {
    let backgroundStyle = '';
    
    switch(type) {
        case 'default':
            backgroundStyle = '';
            break;
        case 'gradient1':
            backgroundStyle = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            break;
        case 'gradient2':
            backgroundStyle = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            break;
        case 'gradient3':
            backgroundStyle = 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)';
            break;
        case 'gradient4':
            backgroundStyle = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
            break;
        case 'gradient5':
            backgroundStyle = 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)';
            break;
    }
    
    if (backgroundStyle) {
        document.body.style.background = backgroundStyle;
        localStorage.setItem('customWallpaper', backgroundStyle);
    } else {
        document.body.style.background = '';
        localStorage.removeItem('customWallpaper');
    }
}

// 设置自定义壁纸
function setCustomWallpaper() {
    const url = document.getElementById('customWallpaperUrl').value.trim();
    if (!url) {
        alert('请输入图片URL');
        return;
    }
    
    // 测试图片是否能正常加载
    const img = new Image();
    img.onload = function() {
        const backgroundStyle = `url('${url}') center/cover no-repeat`;
        document.body.style.background = backgroundStyle;
        localStorage.setItem('customWallpaper', backgroundStyle);
        // 保存输入框的值
        localStorage.setItem('customWallpaperUrl', url);
        alert('壁纸设置成功！');
    };
    img.onerror = function() {
        alert('图片加载失败，请检查URL是否正确');
    };
    img.src = url;
}

// 初始化事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 初始更新引擎下拉菜单
    updateEngineDropdown();
    
    // 模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });
    
    // 回车搜索
    document.getElementById('searchQuery').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // 搜索框焦点事件
    const searchInput = document.getElementById('searchQuery');
    const searchContainer = document.querySelector('.search-container');
    const modeSwitcher = document.querySelector('.mode-switcher');
    const quickLinks = document.querySelector('.quick-links');
    
    searchInput.addEventListener('focus', () => {
        searchContainer.classList.add('focused');
        // 模式切换器收起动画
        modeSwitcher.classList.add('collapsed');
        // 快速链接收起动画
        quickLinks.classList.add('collapsed');
        // 统一 transform 和 transition 逻辑，避免重绘问题
        applyFocusTransition(true);
    });
    
    searchInput.addEventListener('blur', () => {
        searchContainer.classList.remove('focused');
        // 模式切换器展开动画
        modeSwitcher.classList.remove('collapsed');
        // 快速链接展开动画
        quickLinks.classList.remove('collapsed');
        // 统一恢复逻辑
        applyFocusTransition(false);
    });
    
    // 加载保存的主题
    const savedTheme = localStorage.getItem('preferred-theme') || 'light';
    setTheme(savedTheme);
    
    // 应用默认设置
    const defaultMode = localStorage.getItem('defaultMode') || 'search';
    switchMode(defaultMode);
    
    // 初始化模式滑块
     const slider = document.querySelector('.mode-slider');
     if (defaultMode === 'translate') {
         slider.style.transform = 'translateX(100px)'; // 与按钮宽度保持一致
     }
    
    const defaultSearchEngine = localStorage.getItem('defaultSearchEngine') || 'google';
    const displayName = defaultSearchEngine === 'google' ? 'Google' : 
                       defaultSearchEngine === 'bing' ? 'Bing' : 
                       defaultSearchEngine === 'baidu' ? '百度' : 'DuckDuckGo';
    selectEngine(defaultSearchEngine, displayName);
    
    // 渲染快速链接
    renderQuickLinks();
    
    // 标签页切换事件
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // 加载保存的壁纸
    const savedWallpaper = localStorage.getItem('customWallpaper');
    if (savedWallpaper) {
        document.body.style.background = savedWallpaper;
    }
    
    // 恢复自定义壁纸URL输入框的值
    const savedWallpaperUrl = localStorage.getItem('customWallpaperUrl');
    if (savedWallpaperUrl) {
        document.getElementById('customWallpaperUrl').value = savedWallpaperUrl;
    }
    
    // 初始化自定义颜色混色功能
    initColorMixer();
});

// 获取当前选择的渐变方向
function getCurrentDirection() {
    const activeBtn = document.querySelector('.direction-btn.active');
    return activeBtn ? activeBtn.dataset.direction : '135deg';
}

// 自动更新渐变预览
function updateGradientPreview() {
    const color1 = document.getElementById('color1').value;
    const color2 = document.getElementById('color2').value;
    const direction = getCurrentDirection();
    
    const gradient = `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
    
    const preview = document.getElementById('gradientPreview');
    preview.style.background = gradient;
}

// 随机生成颜色
function randomColors() {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4ecdc4', '#44a08d',
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96c93d', '#feca57', '#ff9ff3',
        '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24',
        '#0abde3', '#006ba6', '#f38ba8', '#a8e6cf', '#ffd93d', '#6c5ce7'
    ];
    
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    let color2 = colors[Math.floor(Math.random() * colors.length)];
    
    // 确保两个颜色不同
    while (color2 === color1) {
        color2 = colors[Math.floor(Math.random() * colors.length)];
    }
    
    document.getElementById('color1').value = color1;
    document.getElementById('color2').value = color2;
    
    // 随机选择方向
    const directions = ['135deg', '45deg', '90deg', '0deg'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    
    // 更新方向按钮
    document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.direction === randomDirection);
    });
    

    
    // 自动更新预览
    updateGradientPreview();
}

// 应用自定义渐变
function applyCustomGradient() {
    const color1 = document.getElementById('color1').value;
    const color2 = document.getElementById('color2').value;
    const direction = getCurrentDirection();
    
    const gradient = `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
    
    document.body.style.background = gradient;
    localStorage.setItem('customWallpaper', gradient);
    alert('自定义背景应用成功！');
}

// 统一处理焦点状态的 transform 和 transition
function applyFocusTransition(isFocused) {
    if (isFocused) {
        // 应用焦点状态 - 只使用CSS类，保持毛玻璃效果
        document.body.classList.add('search-focused');
        
        // 添加自定义类来控制额外的变换效果
        document.body.classList.add('search-transition-active');
    } else {
        // 恢复默认状态
        document.body.classList.remove('search-focused');
        
        // 延迟移除过渡类，确保动画完成
        setTimeout(() => {
            document.body.classList.remove('search-transition-active');
        }, 300);
    }
}

// 初始化颜色混色器
function initColorMixer() {
    // 方向按钮事件
    document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.direction-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateGradientPreview();
        });
    });
    
    // 颜色输入事件 - 自动刷新
    document.getElementById('color1').addEventListener('input', updateGradientPreview);
    document.getElementById('color2').addEventListener('input', updateGradientPreview);
    
    // 初始预览
    updateGradientPreview();
}