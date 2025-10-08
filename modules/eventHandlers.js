// 事件处理器模块 - 解决CSP内联事件问题
import { toggleThemeSwitcher, setTheme } from './themeManager.js'
import { openSettings, closeSettings } from './uiManager.js'
import { toggleEngineDropdown } from './engineManager.js'
import { switchMode } from './modeManager.js'
import { handleSearch } from './searchHandler.js'
import { closeConfirmDialog, confirmDeleteLink, closeEditDialog, saveEditedLink, closeEditResourceDialog, saveEditedResource, closeConfirmResourceDialog, confirmDeleteResource, addLink, addResource } from './linkManager.js';
import { setWallpaper, randomColors, applyCustomGradient, setCustomWallpaper } from './wallpaperManager.js';
import { saveDataConfig, applyDataFromURL } from './dataManager.js';
import { selectEngine } from './engineManager.js';

export function initializeEventHandlers() {
    // 主题切换按钮
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleThemeSwitcher);
    }

    // 主题按钮
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
        });
    });

    // 设置按钮
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }

    // 引擎选择器
    const engineSelector = document.getElementById('engineSelector');
    if (engineSelector) {
        engineSelector.addEventListener('click', toggleEngineDropdown);
    }

    // 模式切换按钮
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            switchMode(mode);
        });
    });

    // 关闭设置按钮
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeSettings);
    }

    // 搜索按钮
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // 确认删除书签按钮
    const closeConfirmDialogBtn = document.getElementById('closeConfirmDialogBtn');
    if (closeConfirmDialogBtn) {
        closeConfirmDialogBtn.addEventListener('click', closeConfirmDialog);
    }

    // 确认删除书签按钮
    const confirmDeleteLinkBtn = document.getElementById('confirmDeleteLinkBtn');
    if (confirmDeleteLinkBtn) {
        confirmDeleteLinkBtn.addEventListener('click', confirmDeleteLink);
    }

    // 关闭编辑对话框按钮
    const closeEditDialogBtn = document.getElementById('closeEditDialogBtn');
    if (closeEditDialogBtn) {
        closeEditDialogBtn.addEventListener('click', closeEditDialog);
    }

    // 保存编辑书签按钮
    const saveEditedLinkBtn = document.getElementById('saveEditedLinkBtn');
    if (saveEditedLinkBtn) {
        saveEditedLinkBtn.addEventListener('click', saveEditedLink);
    }

    // 关闭资源编辑对话框按钮
    const closeEditResourceDialogBtn = document.getElementById('closeEditResourceDialogBtn');
    if (closeEditResourceDialogBtn) {
        closeEditResourceDialogBtn.addEventListener('click', closeEditResourceDialog);
    }

    // 保存编辑资源按钮
    const saveEditedResourceBtn = document.getElementById('saveEditedResourceBtn');
    if (saveEditedResourceBtn) {
        saveEditedResourceBtn.addEventListener('click', saveEditedResource);
    }

    // 关闭资源删除确认对话框按钮
    const closeConfirmResourceDialogBtn = document.getElementById('closeConfirmResourceDialogBtn');
    if (closeConfirmResourceDialogBtn) {
        closeConfirmResourceDialogBtn.addEventListener('click', closeConfirmResourceDialog);
    }

    // 确认删除资源按钮
    const confirmDeleteResourceBtn = document.getElementById('confirmDeleteResourceBtn');
    if (confirmDeleteResourceBtn) {
        confirmDeleteResourceBtn.addEventListener('click', confirmDeleteResource);
    }

    // 添加书签按钮
    const addLinkBtn = document.getElementById('addLinkBtn');
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', addLink);
    }

    // 添加资源按钮
    const addResourceBtn = document.getElementById('addResourceBtn');
    if (addResourceBtn) {
        addResourceBtn.addEventListener('click', addResource);
    }

    // 壁纸选项事件监听器
    const defaultWallpaperOption = document.getElementById('defaultWallpaperOption');
    if (defaultWallpaperOption) {
        defaultWallpaperOption.addEventListener('click', () => setWallpaper('default'));
    }
    const gradient1WallpaperOption = document.getElementById('gradient1WallpaperOption');
    if (gradient1WallpaperOption) {
        gradient1WallpaperOption.addEventListener('click', () => setWallpaper('gradient1'));
    }
    const gradient2WallpaperOption = document.getElementById('gradient2WallpaperOption');
    if (gradient2WallpaperOption) {
        gradient2WallpaperOption.addEventListener('click', () => setWallpaper('gradient2'));
    }
    const gradient3WallpaperOption = document.getElementById('gradient3WallpaperOption');
    if (gradient3WallpaperOption) {
        gradient3WallpaperOption.addEventListener('click', () => setWallpaper('gradient3'));
    }
    const gradient4WallpaperOption = document.getElementById('gradient4WallpaperOption');
    if (gradient4WallpaperOption) {
        gradient4WallpaperOption.addEventListener('click', () => setWallpaper('gradient4'));
    }
    const gradient5WallpaperOption = document.getElementById('gradient5WallpaperOption');
  if (gradient5WallpaperOption) {
      gradient5WallpaperOption.addEventListener('click', () => setWallpaper('gradient5'));
  }

  // 随机混色按钮
  const randomColorsBtn = document.getElementById('randomColorsBtn');
  if (randomColorsBtn) {
      randomColorsBtn.addEventListener('click', randomColors);
  }

  // 应用自定义渐变按钮
  const applyCustomGradientBtn = document.getElementById('applyCustomGradientBtn');
  if (applyCustomGradientBtn) {
      applyCustomGradientBtn.addEventListener('click', applyCustomGradient);
  }

  // 设置自定义壁纸按钮
  const setCustomWallpaperBtn = document.getElementById('setCustomWallpaperBtn');
  if (setCustomWallpaperBtn) {
      setCustomWallpaperBtn.addEventListener('click', setCustomWallpaper);
  }

  // 保存配置按钮
  const saveDataConfigBtn = document.getElementById('saveDataConfigBtn');
  if (saveDataConfigBtn) {
      saveDataConfigBtn.addEventListener('click', saveDataConfig);
  }

  // 应用数据URL按钮
  const applyDataFromURLBtn = document.getElementById('applyDataFromURLBtn');
  if (applyDataFromURLBtn) {
      applyDataFromURLBtn.addEventListener('click', applyDataFromURL);
  }

  // 引擎选项事件委托处理
  const engineDropdown = document.getElementById('engineDropdown');
  if (engineDropdown) {
      engineDropdown.addEventListener('click', function(event) {
          // 检查点击的是否是引擎选项
          const engineOption = event.target.closest('.engine-option');
          if (engineOption) {
              // 获取引擎标识符和显示名称
              const engine = engineOption.getAttribute('data-engine');
              const displayName = engineOption.getAttribute('data-display-name');
              
              if (engine && displayName) {
                  selectEngine(engine, displayName);
              }
          }
      });
  }
}