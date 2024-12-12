// ==UserScript==
// @name         PrivateView
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  隐匿浏览——浏览页面时，将关键信息进行隐匿，以保护个人信息安全。也许你在公共场所办公时，常常想不让其他人看见自己在B站上的用户昵称、头像、关注数、粉丝数、动态数，那就巧了，这个扩展脚本可以很好的解决该问题。目前支持bilibili、csdn、zhihu、linux.do、v2ex网站，后续计划实现让用户可自定义指定网站使用隐匿浏览的功能。
// @author       DD1024z
// @namespace    https://github.com/10D24D/PrivateView/
// @supportURL   https://github.com/10D24D/PrivateView/
// @match        *://*.v2ex.com/*
// @match        *://*.linux.do/*
// @match        *://*.zhihu.com/*
// @match        *://*.csdn.net/*
// @match        *://*.bilibili.com/*
// @license      Apache License 2.0
// @grant        GM_registerMenuCommand
// @downloadURL https://update.greasyfork.org/scripts/520416/PrivateView.user.js
// @updateURL https://update.greasyfork.org/scripts/520416/PrivateView.meta.js
// ==/UserScript==

(function () {
    'use strict';

    // 网站配置
    // BrowserTitle 浏览器标题
    // ProfileImg 用户头像的样式。多个样式使用, 逗号隔开
    // ProfileUserName 用户名称的样式
    // ArticleTitle 文章标题的样式
    // ProfileStatistics 用户统计数据的样式
    // ProfileAvatarShow 是否显示用户头像
    const siteConfig = {
        'v2ex.com': {
            "BrowserTitle": "V2EX",
            "ProfileImg": "#Rightbar > div.box:nth-of-type(2) .cell a img.avatar",
            "ProfileUserName": "#Top .tools a[href^='/member/'], #Rightbar .cell span.bigger a",
            "ProfileStatistics": "#Rightbar .box a[href^='/my/nodes'] span.bigger, #Rightbar .box a[href^='/my/topics'] span.bigger, #Rightbar .box a[href^='/my/following'] span.bigger, #money a",
        },
        'linux.do': {
            "BrowserTitle": "LINUX DO",
            "ProfileImg": "#current-user img.avatar",
            "ArticleTitle": ".topic-link",
        },
        'zhihu.com': {
            "BrowserTitle": "知乎",
            "ProfileImg": ".Avatar.AppHeader-profileAvatar",
            "ArticleTitle": ".QuestionHeader-title",
        },
        'csdn.net': {
            "BrowserTitle": "CSDN",
            "ProfileImg": ".csdn-profile-avatar img, .hasAvatar img",
            "ProfileUserName": ".csdn-profile-nickName",
            "ProfileStatistics": ".csdn-profile-fansCount, .csdn-profile-followCount, .csdn-profile-likeCount"
        },
        'bilibili.com': {
            "BrowserTitle": "Bilibili",
            "ProfileImg": "li.header-avatar-wrap .bili-avatar img.bili-avatar-img, li.header-avatar-wrap .bili-avatar-img, li.header-avatar-wrap picture img, li.header-avatar-wrap picture source",
            "ProfileUserName": "div.v-popover-content a.nickname-item",
            "ProfileStatistics": ".counts-item .count-num, div.coins-item span.coin-item__num",
            "ProfileAvatarShow": false, // 防止播放视频时头像一直闪烁
        }
    };

    const IMG_SRC = ""; // 隐匿图像资源后替换的内容
    const IMG_ALT = ""; // 隐匿图像提示内容后替换的内容
    const USER_NAME = "User"; // 隐匿用户名称后显示的内容
    const USER_STATISTICS = "?"; // 隐匿用户统计数据后显示的内容

    // 使用 localStorage 缓存开关状态
    let settings = JSON.parse(localStorage.getItem('PrivateViewSettings')) || {
        hiddenModeEnabled: true,
        hideBrowserTitle: true,
        hideProfileInfo: true,
        hideArticleTitle: true,
        hideProfileAvatar: false,
    };

    const currentHostname = Object.keys(siteConfig).find(host => location.hostname.includes(host));
    const currentSite = siteConfig[currentHostname];

    if (!localStorage.getItem('PrivateViewSettings') && currentSite && currentSite.ProfileAvatarShow !== undefined) {
        settings.hideProfileAvatar = !currentSite.ProfileAvatarShow;
        saveSettings();
        location.reload();
    }

    // 保存设置
    function saveSettings() {
        localStorage.setItem('PrivateViewSettings', JSON.stringify(settings));
    }

    // 切换功能开关
    function toggleSetting(settingKey) {
        settings[settingKey] = !settings[settingKey];
        if (settingKey === "hiddenModeEnabled") {
            settings.hideBrowserTitle = settings.hideProfileInfo = settings.hideArticleTitle = settings.hiddenModeEnabled;
        } else {
            settings.hiddenModeEnabled = settings.hideBrowserTitle || settings.hideProfileInfo || settings.hideArticleTitle;
        }
        saveSettings();
        location.reload();
    }

    // 隐藏个人信息的函数
    function hideElements() {
        if (!currentSite) return;

        if (settings.hideProfileAvatar && currentSite.ProfileImg) {
            updateVisibility(currentSite.ProfileImg);
        }

        if (settings.hideProfileInfo) {
            if (currentSite.ProfileImg && !settings.hideProfileAvatar) {
                updateImg(currentSite.ProfileImg);
            }

            if (currentSite.ProfileUserName) {
                updateTextContent(currentSite.ProfileUserName, USER_NAME);
            }

            if (currentSite.ProfileStatistics) {
                updateTextContent(currentSite.ProfileStatistics, USER_STATISTICS);
            }
        }

        if (settings.hideArticleTitle && currentSite.ArticleTitle) {
            updateVisibility(currentSite.ArticleTitle);
        }
    }

    // 替换标题的函数
    function replaceTitles() {
        if (settings.hideBrowserTitle && currentSite.BrowserTitle) {
            document.title = currentSite.BrowserTitle;
            document.querySelectorAll("[title]").forEach(el => {
                el.setAttribute("title", currentSite.BrowserTitle);
            });
        }
    }

    // 更新页面内容
    function updatePage() {
        hideElements();
        replaceTitles();
    }

    // 修改文本内容
    function updateTextContent(selector, value) {
        document.querySelectorAll(selector).forEach(el => {
            el.textContent = value;
        });
    }

    // 修改图像属性值
    function updateImg(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.src = IMG_SRC;
            el.srcset = IMG_SRC;
            el.alt = IMG_ALT;
        });
    }

    // 修改元素可见性
    function updateVisibility(selector, visibility = "hidden") {
        document.querySelectorAll(selector).forEach(el => {
            el.style.visibility = visibility;
        });
    }

    // 注册菜单开关
    GM_registerMenuCommand(settings.hiddenModeEnabled ? "🌐一键关闭隐匿浏览" : "🌐一键开启隐匿浏览", () => toggleSetting('hiddenModeEnabled'));
    GM_registerMenuCommand(settings.hideBrowserTitle ? "🔖隐匿浏览器标签✅" : "🔖隐匿浏览器标签❌", () => toggleSetting('hideBrowserTitle'));
    GM_registerMenuCommand(settings.hideProfileInfo ? "👤隐匿个人信息✅" : "👤隐匿个人信息❌", () => toggleSetting('hideProfileInfo'));
    GM_registerMenuCommand(settings.hideArticleTitle ? "📰隐匿文章标题✅" : "📰隐匿文章标题❌", () => toggleSetting('hideArticleTitle'));
    GM_registerMenuCommand(settings.hideProfileAvatar ? "🖼️隐藏头像✅" : "🖼️隐藏头像❌", () => toggleSetting('hideProfileAvatar'));

    // 页面变化时重新执行
    const observer = new MutationObserver(() => {
        if (settings.hiddenModeEnabled) {
            updatePage();
        }
    });

    // 检测页面变动
    observer.observe(document.body, { childList: true, subtree: true });

    // 初始化页面内容
    updatePage();
})();
