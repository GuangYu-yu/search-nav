// 搜索引擎配置
const searchEngines = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    baidu: 'https://www.baidu.com/s?wd=',
    yandex: 'https://yandex.com/search/?text=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    ecosia: 'https://www.ecosia.org/search?q=',
    yahoo: 'https://search.yahoo.com/search?p=',
    searx: 'https://searx.org/?q=',
    qwant: 'https://www.qwant.com/?q='
};

const resourceEngines = {
    // 知识/问答
    zhihu: 'https://www.zhihu.com/search?q=',
    
    // 社交
    weibo: 'https://s.weibo.com/weibo?q=',
    xiaohongshu: 'https://www.xiaohongshu.com/search_result?keyword=',
    
    // 视频
    bilibili: 'https://search.bilibili.com/all?keyword=',
    douyin: 'https://www.douyin.com/search/',
    
    // 电商
    taobao: 'https://s.taobao.com/search?q='
};

const translateEngines = {
    google: 'https://translate.google.com/?sl=auto&tl=zh-CN&text=',
    bing: 'https://www.bing.com/translator?text=',
    deepl: 'https://www.deepl.com/zh/translator#zh/en-us/',
    baidu: 'https://fanyi.baidu.com/#auto/zh/',
    yandex: 'https://translate.yandex.com/?source_lang=en&target_lang=zh&text='
};

// 初始化数据 - 根据需求不再内置网站，只保留空数组
let currentMode = 'search';
let currentEngine = 'google';
let links = JSON.parse(localStorage.getItem('navLinks')) || [];
let resources = JSON.parse(localStorage.getItem('navResources')) || [];

// 初始化数据预览
function initializeDataPreview() {
    const data = {
        links: links,
        resources: resources
    };
    const dataStr = JSON.stringify(data, null, 2);
    updateDataPreview(dataStr);
}

// 在页面加载完成后初始化数据预览
document.addEventListener('DOMContentLoaded', function() {
    initializeDataPreview();
    
    // 使数据预览区域可编辑
    const dataPreview = document.getElementById('dataPreview');
    if (dataPreview) {
        dataPreview.setAttribute('contenteditable', 'true');
        
        // 添加保存提示
        dataPreview.addEventListener('input', function() {
            // 可以在这里添加自动保存或其他逻辑
        });
    }
});

// 数据管理功能
function saveDataConfig() {
    const previewElement = document.getElementById('dataPreview');
    if (previewElement) {
        try {
            const data = JSON.parse(previewElement.textContent);
            if (data.links && data.resources) {
                links = data.links;
                resources = data.resources;
                localStorage.setItem('navLinks', JSON.stringify(links));
                localStorage.setItem('navResources', JSON.stringify(resources));
                renderLinks();
                renderResources();
                renderQuickLinks(); // 添加这行来更新搜索框下方的书签
                updateEngineDropdown(); // 添加这行来更新资源下拉菜单
                alert('配置已保存');
            } else {
                alert('数据格式不正确');
            }
        } catch (err) {
            console.error('保存失败:', err);
            alert('保存失败，数据不是有效的JSON格式');
        }
    }
}

function applyDataFromURL() {
    const urlInput = document.getElementById('dataUrlInput');
    const url = urlInput.value.trim();
    if (!url) {
        alert('请输入URL');
        return;
    }
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data.links && data.resources) {
                const dataStr = JSON.stringify(data, null, 2);
                updateDataPreview(dataStr);
                alert('数据已从URL获取，请点击保存配置应用更改');
            } else {
                alert('URL中的数据格式不正确');
            }
        })
        .catch(err => {
            console.error('从URL获取数据失败:', err);
            alert('从URL获取数据失败，请检查URL是否正确');
        });
}

function updateDataPreview(data) {
    const previewElement = document.getElementById('dataPreview');
    if (previewElement) {
        previewElement.textContent = data;
    }
}

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
     } else if (mode === 'resource') {
         slider.style.transform = 'translateX(200px)'; // 第三个按钮位置
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
    } else if (mode === 'resource') {
        searchInput.placeholder = '搜索各类资源...';
        // 切换到资源引擎
        selectEngine('bilibili', '哔哩哔哩');
        // 更新引擎下拉菜单以显示资源搜索选项
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
            <div class="engine-option" onclick="selectEngine('yandex', 'Yandex翻译')">
                <div class="engine-icon yandex-icon"></div>
                <span class="engine-name">Yandex翻译</span>
            </div>
        `;
    } else if (currentMode === 'resource') {
        // 资源模式下显示资源搜索引擎
        let resourceDropdownHTML = `
            <div class="engine-option" onclick="selectEngine('zhihu', '知乎')">
                <div class="engine-icon zhihu-icon"></div>
                <span class="engine-name">知乎</span>
            </div>
            <div class="engine-option" onclick="selectEngine('weibo', '微博')">
                <div class="engine-icon weibo-icon"></div>
                <span class="engine-name">微博</span>
            </div>
            <div class="engine-option" onclick="selectEngine('xiaohongshu', '小红书')">
                <div class="engine-icon xiaohongshu-icon"></div>
                <span class="engine-name">小红书</span>
            </div>
            <div class="engine-option" onclick="selectEngine('bilibili', '哔哩哔哩')">
                <div class="engine-icon bilibili-icon"></div>
                <span class="engine-name">哔哩哔哩</span>
            </div>
            <div class="engine-option" onclick="selectEngine('douyin', '抖音')">
                <div class="engine-icon douyin-icon"></div>
                <span class="engine-name">抖音</span>
            </div>
            <div class="engine-option" onclick="selectEngine('taobao', '淘宝')">
                <div class="engine-icon taobao-icon"></div>
                <span class="engine-name">淘宝</span>
            </div>
        `;
        
        // 添加用户自定义的资源条目
        resources.forEach((resource, index) => {
            // 为用户自定义资源生成唯一的引擎标识符
            const customEngineId = `custom_${index}`;
            const searchUrl = resource.url;
            
            // 添加到资源引擎对象中
            resourceEngines[customEngineId] = searchUrl;
            
            // 添加到下拉菜单HTML中
            resourceDropdownHTML += `
                <div class="engine-option" onclick="selectEngine('${customEngineId}', '${resource.name}')">
                    <div class="engine-icon" style="background-image: url('${resource.faviconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text x="8" y="12" font-size="12" text-anchor="middle" fill="%23666">📂</text></svg>'}')"></div>
                    <span class="engine-name">${resource.name}</span>
                </div>
            `;
        });
        
        dropdown.innerHTML = resourceDropdownHTML;
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
            <div class="engine-option" onclick="selectEngine('yahoo', 'Yahoo!')">
                <div class="engine-icon yahoo-icon"></div>
                <span class="engine-name">Yahoo!</span>
            </div>
            <div class="engine-option" onclick="selectEngine('searx', 'Searx')">
                <div class="engine-icon searx-icon"></div>
                <span class="engine-name">Searx</span>
            </div>
            <div class="engine-option" onclick="selectEngine('qwant', 'Qwant')">
                <div class="engine-icon qwant-icon"></div>
                <span class="engine-name">Qwant</span>
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
    // 检查是否是用户自定义的资源引擎
    if (currentMode === 'resource' && engine.startsWith('custom_')) {
        // 获取资源索引
        const index = parseInt(engine.replace('custom_', ''));
        if (index >= 0 && index < resources.length) {
            const resource = resources[index];
            // 设置自定义图标
            icon.className = 'engine-icon';
            icon.style.backgroundImage = `url('${resource.faviconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text x="8" y="12" font-size="12" text-anchor="middle" fill="%23666">📂</text></svg>'}')`;
        }
    } else {
        icon.className = 'engine-icon ' + engine + '-icon';
        icon.style.backgroundImage = '';
    }
    
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
    if (!query) {
        return;
    }
    
    let url;
    if (currentMode === 'translate') {
        // 翻译模式
        url = translateEngines[currentEngine] + encodeURIComponent(query);
    } else if (currentMode === 'resource') {
        // 资源模式
        url = resourceEngines[currentEngine] + encodeURIComponent(query);
    } else {
        // 搜索模式
        // 检查是否是网址
        if (query.includes('.') && !query.includes(' ')) {
            url = query.startsWith('http') ? query : 'https://' + query;
        } else {
            url = searchEngines[currentEngine] + encodeURIComponent(query);
        }
    }
    
    window.location.href = url;
}

// 设置主题
function setTheme(theme) {
    // 添加过渡类来启用平滑过渡
    document.documentElement.classList.add('theme-transitioning');
    
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
    
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
    }, 300);
}

// 计算书签网格布局
function calculateGridLayout(totalItems) {
    const maxColumns = 5;

    if (totalItems <= maxColumns) {
        return { columns: totalItems, rows: 1 };
    }

    const rows = Math.ceil(totalItems / maxColumns);
    const itemsPerRow = Math.ceil(totalItems / rows);

    return { 
        columns: itemsPerRow,
        rows: rows
    };
}

// 渲染快速链接
function renderQuickLinks() {
    const container = document.getElementById('quickLinksContainer');
    container.innerHTML = '';
    if (!links.length) return;

    const layout = calculateGridLayout(links.length);

    // 设置网格样式
    container.style.gridTemplateColumns = `repeat(${layout.columns}, 80px)`;
    container.style.gridTemplateRows = `repeat(${layout.rows}, 1fr)`;

    const fragment = document.createDocumentFragment();

    links.forEach(link => {
        const linkElement = document.createElement('div');
        linkElement.className = 'quick-link';
        linkElement.onclick = () => window.location.href = link.url;

        const icon = document.createElement('div');
        icon.className = 'quick-link-icon';
        // 使用自定义图片URL或缓存的favicon
        icon.style.backgroundImage = `url('${link.faviconUrl || getCachedFaviconUrl(link.url)}')`;

        const name = document.createElement('div');
        name.className = 'quick-link-name';
        name.textContent = link.name;

        linkElement.append(icon, name);
        fragment.appendChild(linkElement);
    });

    container.appendChild(fragment);

    // 超过三行显示滚动条
    container.classList.toggle('overflowing', layout.rows > 3);
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
    
    // 更新标签内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName + '-tab');
    });
}

// 添加书签
function addLink() {
    const name = document.getElementById('linkName').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    const imageUrl = document.getElementById('linkImageUrl').value.trim();
    
    if (!url) {
        alert('请填写网站地址');
        return;
    }
    
    // 确保URL格式正确
    const formattedUrl = url.startsWith('http') ? url : 'https://' + url;
    
    // 获取favicon URL，如果有自定义图片URL则使用自定义的
    const faviconUrl = imageUrl || getCachedFaviconUrl(formattedUrl);
    
    links.push({ name, url: formattedUrl, faviconUrl });
    localStorage.setItem('navLinks', JSON.stringify(links));
    
    // 清空输入框
    document.getElementById('linkName').value = '';
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkImageUrl').value = '';
    
    // 重新渲染
    renderLinks();
    renderQuickLinks();
    
    // 更新数据预览
    initializeDataPreview();
}

// 添加资源
function addResource() {
    const name = document.getElementById('resourceName').value.trim();
    const url = document.getElementById('resourceUrl').value.trim();
    const imageUrl = document.getElementById('resourceImageUrl').value.trim();
    
    if (!url) {
        alert('请填写资源地址');
        return;
    }
    
    // 确保URL格式正确
    const formattedUrl = url.startsWith('http') ? url : 'https://' + url;
    
    // 获取favicon URL，如果有自定义图片URL则使用自定义的
    const faviconUrl = imageUrl || getCachedFaviconUrl(formattedUrl);
    
    resources.push({ name, url: formattedUrl, faviconUrl });
    localStorage.setItem('navResources', JSON.stringify(resources));
    
    // 清空输入框
    document.getElementById('resourceName').value = '';
    document.getElementById('resourceUrl').value = '';
    document.getElementById('resourceImageUrl').value = '';
    
    // 重新渲染
    renderResources();
    
    // 更新数据预览
    initializeDataPreview();
    
    // 更新引擎下拉菜单
    if (currentMode === 'resource') {
        updateEngineDropdown();
    }
}

// 全局变量，用于存储待删除书签的索引
let pendingDeleteIndex = -1;
let currentEditIndex = -1;
// 全局变量，用于存储待删除资源的索引
let pendingDeleteResourceIndex = -1;

// 删除书签
function deleteLink(index) {
    pendingDeleteIndex = index;
    showConfirmDialog();
}

// 删除资源
function deleteResource(index) {
    pendingDeleteResourceIndex = index;
    showConfirmResourceDialog();
}

// 显示资源删除确认对话框
function showConfirmResourceDialog() {
    const dialog = document.getElementById('confirmResourceDialog');
    dialog.classList.add('show');
}

// 关闭资源删除确认对话框
function closeConfirmResourceDialog() {
    const dialog = document.getElementById('confirmResourceDialog');
    dialog.classList.remove('show');
    pendingDeleteResourceIndex = -1;
}

// 确认删除资源
function confirmDeleteResource() {
    if (pendingDeleteResourceIndex >= 0 && pendingDeleteResourceIndex < resources.length) {
        // 清除该域名的favicon缓存
        try {
            const domain = new URL(resources[pendingDeleteResourceIndex].url).hostname;
            const cacheKey = `favicon_cache_${domain}`;
            localStorage.removeItem(cacheKey);
        } catch (e) {
            // URL解析失败时忽略
        }
        
        resources.splice(pendingDeleteResourceIndex, 1);
        localStorage.setItem('navResources', JSON.stringify(resources));
        renderResources();
        
        // 更新数据预览
        initializeDataPreview();
        
        // 更新引擎下拉菜单
        if (currentMode === 'resource') {
            updateEngineDropdown();
        }
    }
    closeConfirmResourceDialog();
}

// 显示确认对话框
function showConfirmDialog() {
    const dialog = document.getElementById('confirmDialog');
    dialog.classList.add('show');
}

// 关闭确认对话框
function closeConfirmDialog() {
    const dialog = document.getElementById('confirmDialog');
    dialog.classList.remove('show');
    pendingDeleteIndex = -1;
}

// 确认删除书签
function confirmDeleteLink() {
    if (pendingDeleteIndex >= 0 && pendingDeleteIndex < links.length) {
        // 清除该域名的favicon缓存
        try {
            const domain = new URL(links[pendingDeleteIndex].url).hostname;
            const cacheKey = `favicon_cache_${domain}`;
            localStorage.removeItem(cacheKey);
        } catch (e) {
            // URL解析失败时忽略
        }
        
        links.splice(pendingDeleteIndex, 1);
        localStorage.setItem('navLinks', JSON.stringify(links));
        renderLinks();
        renderQuickLinks();
        
        // 更新数据预览
        initializeDataPreview();
    }
    closeConfirmDialog();
}

// 显示编辑对话框
function showEditDialog(index) {
    currentEditIndex = index;
    const link = links[index];
    
    // 填充表单数据
    document.getElementById('editLinkName').value = link.name;
    document.getElementById('editLinkUrl').value = link.url;
    
    // 判断是否是自定义图片URL
    const isCustomImage = link.faviconUrl && !link.faviconUrl.includes('google.com/s2/favicons') && !link.faviconUrl.startsWith('data:image/svg+xml');
    document.getElementById('editLinkImageUrl').value = isCustomImage ? link.faviconUrl : '';
    
    // 显示对话框
    const dialog = document.getElementById('editDialog');
    dialog.classList.add('show');
}

// 显示资源编辑对话框
function showEditResourceDialog(index) {
    currentEditIndex = index;
    const resource = resources[index];
    
    // 填充表单数据
    document.getElementById('editResourceName').value = resource.name;
    document.getElementById('editResourceUrl').value = resource.url;
    
    // 判断是否是自定义图片URL
    const isCustomImage = resource.faviconUrl && !resource.faviconUrl.includes('google.com/s2/favicons') && !resource.faviconUrl.startsWith('data:image/svg+xml');
    document.getElementById('editResourceImageUrl').value = isCustomImage ? resource.faviconUrl : '';
    
    // 显示对话框
    const dialog = document.getElementById('editResourceDialog');
    dialog.classList.add('show');
}

// 关闭编辑对话框
function closeEditDialog() {
    const dialog = document.getElementById('editDialog');
    dialog.classList.remove('show');
    currentEditIndex = -1;
}

// 关闭资源编辑对话框
function closeEditResourceDialog() {
    const dialog = document.getElementById('editResourceDialog');
    dialog.classList.remove('show');
    currentEditIndex = -1;
}

// 保存编辑的书签
function saveEditedLink() {
    if (currentEditIndex >= 0 && currentEditIndex < links.length) {
        const name = document.getElementById('editLinkName').value.trim();
        const url = document.getElementById('editLinkUrl').value.trim();
        const imageUrl = document.getElementById('editLinkImageUrl').value.trim();
        
        if (!url) {
            alert('请填写网站地址');
            return;
        }
        
        // 确保URL格式正确
        const formattedUrl = url.startsWith('http') ? url : 'https://' + url;
        
        // 清除旧域名的favicon缓存
        try {
            const oldDomain = new URL(links[currentEditIndex].url).hostname;
            const oldCacheKey = `favicon_cache_${oldDomain}`;
            localStorage.removeItem(oldCacheKey);
        } catch (e) {
            // URL解析失败时忽略
        }
        
        // 获取favicon URL，如果有自定义图片URL则使用自定义的
        const faviconUrl = imageUrl || getFaviconUrl(formattedUrl);
        
        links[currentEditIndex] = { name, url: formattedUrl, faviconUrl };
        localStorage.setItem('navLinks', JSON.stringify(links));
        
        // 重新渲染
        renderLinks();
        renderQuickLinks();
        
        // 更新数据预览
        initializeDataPreview();
    }
    closeEditDialog();
}

// 保存编辑的资源
function saveEditedResource() {
    if (currentEditIndex >= 0 && currentEditIndex < resources.length) {
        const name = document.getElementById('editResourceName').value.trim();
        const url = document.getElementById('editResourceUrl').value.trim();
        const imageUrl = document.getElementById('editResourceImageUrl').value.trim();
        
        if (!url) {
            alert('请填写资源地址');
            return;
        }
        
        // 确保URL格式正确
        const formattedUrl = url.startsWith('http') ? url : 'https://' + url;
        
        // 清除旧域名的favicon缓存
        try {
            const oldDomain = new URL(resources[currentEditIndex].url).hostname;
            const oldCacheKey = `favicon_cache_${oldDomain}`;
            localStorage.removeItem(oldCacheKey);
        } catch (e) {
            // URL解析失败时忽略
        }
        
        // 获取favicon URL，如果有自定义图片URL则使用自定义的
        const faviconUrl = imageUrl || getFaviconUrl(formattedUrl);
        
        resources[currentEditIndex] = { name, url: formattedUrl, faviconUrl };
        localStorage.setItem('navResources', JSON.stringify(resources));
        
        // 重新渲染
        renderResources();
        
        // 更新数据预览
        initializeDataPreview();
        
        // 更新引擎下拉菜单
        if (currentMode === 'resource') {
            updateEngineDropdown();
        }
    }
    closeEditResourceDialog();
}

// 渲染设置中的书签列表
// 获取网站favicon
function getFaviconUrl(url) {
    try {
        // 确保URL格式正确
        const fullUrl = url.startsWith('http') ? url : 'https://' + url;
        const domain = new URL(fullUrl).hostname;
        return `https://favicone.com/${domain}?s=256`;
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
        
        // 使用favicone.com服务获取图标
        const faviconeUrl = `https://favicone.com/${domain}?s=256`;
        
        // 保存到缓存
        const cacheData = {
            faviconUrl: faviconeUrl,
            timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        
        return googleFaviconUrl;
    } catch {
        // 如果Google服务失败，尝试使用<link>标签获取favicon
        try {
            const fullUrl = url.startsWith('http') ? url : 'https://' + url;
            const domain = new URL(fullUrl).hostname;
            return `https://${domain}/favicon.ico`;
        } catch {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E';
        }
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
        editBtn.onclick = () => showEditDialog(index);
        
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

// 渲染设置中的资源列表
function renderResources() {
    const container = document.getElementById('resourcesContainer');
    container.innerHTML = '';
    
    resources.forEach((resource, index) => {
        const resourceItem = document.createElement('div');
        resourceItem.className = 'link-item';
        resourceItem.id = `resource-${index}`;
        
        // 资源图标
        const favicon = document.createElement('div');
        favicon.className = 'link-favicon';
        favicon.style.backgroundImage = `url('${getCachedFaviconUrl(resource.url)}')`;
        
        // 资源信息
        const details = document.createElement('div');
        details.className = 'link-details';
        
        const name = document.createElement('div');
        name.className = 'link-name';
        name.textContent = resource.name;
        
        const url = document.createElement('div');
        url.className = 'link-url';
        url.textContent = resource.url;
        
        details.appendChild(name);
        details.appendChild(url);
        
        // 操作按钮
        const actions = document.createElement('div');
        actions.className = 'link-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = '修改';
        editBtn.onclick = () => showEditResourceDialog(index);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '删除';
        deleteBtn.onclick = () => deleteResource(index);
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        resourceItem.appendChild(favicon);
        resourceItem.appendChild(details);
        resourceItem.appendChild(actions);
        container.appendChild(resourceItem);
    });
}

// 保存编辑的书签
function saveLink(index, name, url, imageUrl = '') {
    if (!url) {
        alert('请填写网站地址');
        return;
    }
    
    // 确保URL格式正确
    const formattedUrl = url.startsWith('http') ? url : 'https://' + url;
    
    // 清除旧域名的favicon缓存
    try {
        const oldDomain = new URL(links[index].url).hostname;
        const oldCacheKey = `favicon_cache_${oldDomain}`;
        localStorage.removeItem(oldCacheKey);
    } catch (e) {
        // URL解析失败时忽略
    }
    
    // 获取favicon URL，如果有自定义图片URL则使用自定义的
    const faviconUrl = imageUrl.trim() || getFaviconUrl(formattedUrl);
    
    links[index] = { name, url: formattedUrl, faviconUrl };
    localStorage.setItem('navLinks', JSON.stringify(links));
    
    // 重新渲染
    renderLinks();
    renderQuickLinks();
    
    // 更新数据预览
    initializeDataPreview();
}

// 设置壁纸
function setWallpaper(type) {
    let backgroundStyle = '';
    
    if (type.startsWith('gradient')) {
        const gradientIndex = parseInt(type.replace('gradient', '')) - 1;
        const gradientPairs = getGradientPairs();
        if (gradientIndex >= 0 && gradientIndex < gradientPairs.length) {
            const [color1, color2] = gradientPairs[gradientIndex];
            backgroundStyle = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
        }
    }
    
    const wallpaperContainer = document.getElementById('wallpaperContainer');
    if (backgroundStyle) {
        wallpaperContainer.style.background = backgroundStyle;
        localStorage.setItem('customWallpaper', backgroundStyle);
    } else {
        wallpaperContainer.style.background = '';
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
        const wallpaperContainer = document.getElementById('wallpaperContainer');
        wallpaperContainer.style.background = backgroundStyle;
        localStorage.setItem('customWallpaper', backgroundStyle);
        // 保存输入框的值
        localStorage.setItem('customWallpaperUrl', url);
    };
    img.onerror = function() {
        // 图片加载失败处理
        console.log('图片加载失败，请检查URL是否正确');
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
        // 快速链接淡出动画
        quickLinks.classList.add('collapsed');
        // 统一 transform 和 transition 逻辑，避免重绘问题
        applyFocusTransition(true);
        // 壁纸缩放虚化效果
        const wallpaperContainer = document.getElementById('wallpaperContainer');
        wallpaperContainer.style.transform = 'scale(1.1)';
        wallpaperContainer.style.filter = 'blur(10px) brightness(0.8)';
    });
    
    searchInput.addEventListener('blur', () => {
        searchContainer.classList.remove('focused');
        // 模式切换器展开动画
        modeSwitcher.classList.remove('collapsed');
        // 快速链接淡入动画
        quickLinks.classList.remove('collapsed');
        // 统一恢复逻辑
        applyFocusTransition(false);
        // 恢复壁纸效果
        const wallpaperContainer = document.getElementById('wallpaperContainer');
        wallpaperContainer.style.transform = 'scale(1)';
        wallpaperContainer.style.filter = 'none';
    });
    
    // 搜索按钮mousedown事件 - 阻止默认行为，避免触发搜索框blur
    document.querySelector('.search-btn').addEventListener('mousedown', (e) => {
        e.preventDefault();
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
                       defaultSearchEngine === 'baidu' ? '百度' : 
                       defaultSearchEngine === 'yahoo' ? 'Yahoo!' : 'DuckDuckGo';
    selectEngine(defaultSearchEngine, displayName);
    
    // 渲染快速链接
    renderQuickLinks();
    
    // 渲染资源
    renderResources();
    
    // 标签页切换事件
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // 加载保存的壁纸
    const savedWallpaper = localStorage.getItem('customWallpaper');
    if (savedWallpaper) {
        const wallpaperContainer = document.getElementById('wallpaperContainer');
        wallpaperContainer.style.background = savedWallpaper;
    }
    
    // 恢复自定义壁纸URL输入框的值
    const savedWallpaperUrl = localStorage.getItem('customWallpaperUrl');
    if (savedWallpaperUrl) {
        document.getElementById('customWallpaperUrl').value = savedWallpaperUrl;
    }
    
    // 恢复SVG代码
    const savedSVGCode = localStorage.getItem('svgCode');
    if (savedSVGCode) {
        document.getElementById('svgCode').value = savedSVGCode;
    }
    
    // 如果之前有活动的SVG壁纸，重新创建
    const svgActive = localStorage.getItem('svgWallpaper');
    if (svgActive === 'active') {
        const savedSVGCode = localStorage.getItem('svgCode');
        if (savedSVGCode) {
            document.getElementById('svgCode').value = savedSVGCode;
            updateSVGWallpaper();
        }
    }
    
    // 初始化自定义颜色混色功能
    initColorMixer();
    
    // 添加SVG代码实时更新功能
    const svgTextarea = document.getElementById('svgCode');
    if (svgTextarea) {
        svgTextarea.addEventListener('input', function() {
            localStorage.setItem('svgCode', this.value);
            updateSVGWallpaper();
        });
    }
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

// 获取所有可用颜色
function getAllColors() {
    return [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4ecdc4', '#44a08d',
        '#ff6b6b', '#45b7d1', '#96c93d', '#feca57', '#ff9ff3',
        '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24',
        '#0abde3', '#006ba6', '#f38ba8', '#a8e6cf', '#ffd93d', '#6c5ce7'
    ];
}

// 获取预定义的渐变颜色对
function getGradientPairs() {
    const colors = getAllColors();
    return [
        [colors[0], colors[1]],   // #667eea, #764ba2
        [colors[2], colors[3]],   // #f093fb, #f5576c
        [colors[4], colors[5]],   // #4ecdc4, #44a08d
        [colors[6], colors[7]],   // #ff6b6b, #45b7d1
        [colors[0], colors[2]]    // #667eea, #f093fb
    ];
}

// 随机生成颜色
function randomColors() {
    const colors = getAllColors();
    
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

// 实时更新SVG壁纸
function updateSVGWallpaper() {
    const svgCode = document.getElementById('svgCode').value;
    
    // 移除现有的SVG壁纸
    const existingSVG = document.getElementById('svgWallpaper');
    if (existingSVG) {
        existingSVG.remove();
    }
    
    // 如果SVG代码为空，恢复默认壁纸
    if (!svgCode || svgCode.trim() === '') {
        const savedWallpaper = localStorage.getItem('customWallpaper');
        if (savedWallpaper) {
            const wallpaperContainer = document.getElementById('wallpaperContainer');
            wallpaperContainer.style.background = savedWallpaper;
        } else {
            setWallpaper('default');
        }
        localStorage.removeItem('svgWallpaper');
        return;
    }
    
    const wallpaperContainer = document.getElementById('wallpaperContainer');
    
    // 创建SVG容器
    const svgContainer = document.createElement('div');
    svgContainer.id = 'svgWallpaper';
    svgContainer.className = 'svg-wallpaper';
    
    try {
        // 解析SVG代码
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgCode, 'image/svg+xml');
        
        // 检查解析错误
        const parserError = svgDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('SVG解析错误：' + parserError.textContent);
        }
        
        // 获取SVG元素
        const svgElement = svgDoc.documentElement;
        if (svgElement.nodeName !== 'svg') {
            throw new Error('请输入有效的SVG代码');
        }
        
        // 设置SVG尺寸为100%
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        
        // 添加到容器
        svgContainer.appendChild(svgElement);
        wallpaperContainer.appendChild(svgContainer);
        
        // 清除现有背景
        wallpaperContainer.style.background = '';
        
        // 保存状态
        localStorage.setItem('svgWallpaper', 'active');
        
    } catch (error) {
        console.error('SVG代码错误：', error.message);
        svgContainer.remove();
    }
}

// 应用自定义渐变
function applyCustomGradient() {
    const color1 = document.getElementById('color1').value;
    const color2 = document.getElementById('color2').value;
    const direction = getCurrentDirection();
    
    const gradient = `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
    
    const wallpaperContainer = document.getElementById('wallpaperContainer');
    wallpaperContainer.style.background = gradient;
    localStorage.setItem('customWallpaper', gradient);
}

// 统一处理焦点状态的 transform 和 transition
function applyFocusTransition(isFocused) {
    if (isFocused) {
        // 应用焦点状态
        document.body.classList.add('search-focused');
    } else {
        // 恢复默认状态
        document.body.classList.remove('search-focused');
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