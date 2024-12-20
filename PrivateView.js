// ==UserScript==
// @name         PrivateView
// @namespace    http://tampermonkey.net/
// @version      1.0.8
// @description  隐匿浏览——浏览页面时，将关键信息进行隐匿，以保护个人信息安全。也许你在公共场所办公时，常常想不让其他人看见自己在B站上的用户昵称、头像、关注数、粉丝数、动态数，那就巧了，这个扩展脚本可以很好的解决该问题。目前支持bilibili、csdn、zhihu、linux.do、v2ex网站，后续计划实现让用户可自定义指定网站使用隐匿浏览的功能。
// @author       DD1024z
// @namespace    https://github.com/10D24D/PrivateView/
// @supportURL   https://github.com/10D24D/PrivateView/
// @match        *://*.baidu.com/*
// @match        *://*.so.com/*
// @match        *://*.bing.com/*
// @match        *://*.google.com/*
// @match        *://*.v2ex.com/*
// @match        *://*.linux.do/*
// @match        *://*.zhihu.com/*
// @match        *://*.csdn.net/*
// @match        *://*.bilibili.com/*
// @match        *://*.jianshu.com/*
// @match        *://*.leetcode.cn/*
// @match        *://*.juejin.cn/*
// @match        *://*.52pojie.cn/*
// @match        *://*.itsk.com/*
// @match        *://*.hifini.com/*
// @match        *://*.oschina.net/*
// @match        *://*.51cto.com/*
// @match        *://app.follow.is/*
// @license      Apache License 2.0
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @downloadURL https://update.greasyfork.org/scripts/520416/PrivateView.user.js
// @updateURL https://update.greasyfork.org/scripts/520416/PrivateView.meta.js
// ==/UserScript==

(function () {
    'use strict';

    if (window.top !== window.self) return; // 不在顶层页面时直接退出脚本

    // 网站配置
    // BrowserTitle 浏览器标题
    // ProfileImg 用户头像的样式。多个样式使用, 逗号隔开
    // ProfileUserName 用户名称的元素
    // ArticleTitle 文章标题的元素
    // ProfileStatistics 用户统计数据的元素
    const siteConfig = {
        'baidu.com': {
            "BrowserTitle": "百度",
            "ProfileImg": "span.s-top-img-wrapper img",
            "ProfileUserName": "#s-top-username span.user-name,#u span.s-top-username",
        },
        'so.com': {
            "BrowserTitle": "360搜索",
            "ProfileUserName": "#hd_nav li.login span.uname, div.menu .show-list.user-group.u-logined a.title",
        },
        'bing.com': {
            "BrowserTitle": "必应",
            "ProfileImg": "#id_p",
            "ProfileUserName": "#id_n",
            "ProfileStatistics": "#id_rfb, span.points-container",
        },
        'google.com': {
            "BrowserTitle": "Google",
            "ProfileImg": "#gb a.gb_A img.gb_O, div.XS2qof img",
            "ProfileUserName": "div.gb_Ac div.gb_g, div.gb_Ac div.gb_g + div, div.eYSAde, div.hCDve",
            "ProfileStatistics": "#id_rfb, span.points-container",
        },
        'v2ex.com': {
            "BrowserTitle": "V2EX",
            "ProfileImg": "#Rightbar > div.box:nth-of-type(2) .cell a img.avatar",
            "ProfileUserName": "#Top .tools a[href^='/member/'], #Rightbar .cell span.bigger a",
            "ProfileStatistics": "#Rightbar .box a span.bigger, #money a",
        },
        'linux.do': {
            "BrowserTitle": "LINUX DO",
            "ProfileImg": "#current-user img.avatar",
            "ArticleTitle": "div.title-wrapper",
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
            "ProfileImg": "li.header-avatar-wrap a.header-entry-avatar img, li.header-avatar-wrap a.header-entry-mini picture source",
            "ProfileUserName": "div.v-popover-content a.nickname-item",
            "ProfileStatistics": ".counts-item .count-num, div.coins-item span.coin-item__num",
        },
        'jianshu.com': {
            "BrowserTitle": "简书",
            "ProfileImg": "div.user a[href^='/u/'].avatar img",
            "ArticleTitle": "h1[title^='简书']",
        },
        'leetcode.cn': {
            "BrowserTitle": "力扣",
            "ProfileImg": "#navbar_user_avatar img, #web-user-menu a[href^='/u/'] img.object-cover",
            "ProfileUserName": "#web-user-menu div.pl-3 a[href^='/u/']",
            "ProfileStatistics": "a[href^='/problems/'] > svg + span, section div.text-center p span, #headlessui-popover-button-:r1: a span.text-brand-orange",
        },
        'juejin.cn': {
            "BrowserTitle": "掘金",
            "ProfileImg": "ul.right-side-nav li.menu .avatar img, div.user-info div.avatar img",
            "ProfileUserName": "div.user-detail a.username",
            "ProfileStatistics": "ul.actions-count-list div.item-count, div.user-detail a.ore span, a.progress-bar div.jscore-level span, a.progress-bar div.progress span",
        },
        '52pojie.cn': {
            "BrowserTitle": "吾爱破解",
            "ProfileImg": "#um a[href^='home.php?mod=space&uid='] img",
            "ProfileUserName": "a[href^='home.php?mod=space&uid=']",
            "ProfileStatistics": "#extcreditmenu_menu li span",
        },
        'itsk.com': {
            "BrowserTitle": "IT天空",
            "ProfileImg": "div.navbar-container a[href^='/space/'].avatar-box img",
            "ProfileUserName": "#el-popper-container-1024 span.user-name",
        },
        'hifini.com': {
            "BrowserTitle": "HiFiNi",
            "ProfileImg": "li.nav-item.username a.nav-link img.avatar-1",
            "ProfileUserName": "li.nav-item.username a.nav-link",
        },
        'oschina.net': {
            "BrowserTitle": "OSCHINA",
            "ProfileImg": "div.current-user-avatar img",
            "ProfileUserName": "#userSidebar h3.centered.header",
            "ProfileStatistics": "#userSidebar a.statistic div.value",
        },
        '51cto.com': {
            "BrowserTitle": "51CTO技术家园",
            "ProfileImg": "div.item-rt.loginbox img, div.mainindex_r.right a.position_r img",
            "ProfileUserName": "div.mainindex_r.right div.port_m_box.position_r a[href^='/space?uid=']",
            "ProfileStatistics": "div.mainindex_r.right div.datas.clearfix a span",
        },
        'app.follow.is': {
            "BrowserTitle": "Follow",
            "ArticleTitle": "main div.items-end.text-theme-foreground",
            "ProfileImg": "img:not(main img)",
            "ProfileUserName": "[id^='radix-'] span.block.mx-auto",
            "ProfileStatistics": "div.text-theme-vibrancyFg button div, div.items-center span.tabular-nums span, div.items-center span.tabular-nums, div.items-center i.i-mgc-fire-cute-fi + span",
        },
    };

    const IMG_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="; // 隐匿图像资源后替换的内容。空白图片
    const IMG_ALT = ""; // 隐匿图像提示内容后替换的内容
    const USER_NAME = "User"; // 隐匿用户名称后显示的内容
    const USER_STATISTICS = "?"; // 隐匿用户统计数据后显示的内容
    let originalTitle = document.title; // 记录原始页面标题

    // 动态生成 localStorage 键名
    const storageKey = `PrivateViewSettings`;
    const currentHostname = Object.keys(siteConfig).find(host => location.hostname.includes(host));
    const currentSite = siteConfig[currentHostname];

    // 使用 localStorage 缓存开关状态
    let settings = JSON.parse(localStorage.getItem(storageKey)) || {
        hiddenModeEnabled: true,
        hideBrowserTitle: true,
        hideArticleTitle: true,
        hideProfileImg: true,
        hideProfileUserName: true,
        hideProfileStatistics: true,
    };

    if (!localStorage.getItem(storageKey) && currentSite) {
        saveSettings();
        location.reload();
    }

    // 保存设置到 localStorage
    function saveSettings() {
        localStorage.setItem(storageKey, JSON.stringify(settings));
    }

    // 修改文本内容
    function updateTextContent(selector, value) {
        const elements = document.querySelectorAll(selector);
        if (!elements.length) return; // 无匹配时直接返回
        elements.forEach(el => {
            Array.from(el.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    child.nodeValue = value;
                }
            });
        });
    }

    // 修改图像属性值
    function updateImg(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.src = IMG_SRC;
            el.srcset = IMG_SRC;
            el.alt = IMG_ALT;
            //el.style.cssText = `border: 1px solid #e8e8ed !important;`; // 移除图像边框，保持原网站样式，防止占位
        });
    }

    // 修改元素可见性
    function updateVisibility(selector, visibility = "hidden") {
        document.querySelectorAll(selector).forEach(el => {
            el.style.visibility = visibility;
        });
    }

    // 切换页面标题
    function toggleBrowserTitle() {
        if (settings.hideBrowserTitle) {
            const currentSite = siteConfig[currentHostname];
            if (currentSite && currentSite.BrowserTitle) {
                document.title = currentSite.BrowserTitle; // 设置为指定标题
            }
        } else {
            document.title = originalTitle; // 恢复原始标题
        }
    }

    // 切换文章标题显示/隐藏
    function toggleArticleTitleVisibility() {
        const currentSite = siteConfig[currentHostname];
        if (!currentSite || !currentSite.ArticleTitle) return;

        const visibility = settings.hideArticleTitle ? "hidden" : "visible";

        document.querySelectorAll(currentSite.ArticleTitle).forEach(el => {
            el.style.visibility = visibility;
            el.style.opacity = settings.hideArticleTitle ? "0" : "1";
            el.style.pointerEvents = settings.hideArticleTitle ? "none" : "auto";
        });
    }

    // 隐匿浏览的函数
    function hideElements() {
        if (!currentSite) return;

        if (settings.hideBrowserTitle && currentSite.BrowserTitle) {
            updateTextContent("head title", currentSite.BrowserTitle);
        }

        if (settings.hideProfileImg && currentSite.ProfileImg) {
            updateImg(currentSite.ProfileImg);
        }

        if (settings.hideProfileUserName && currentSite.ProfileUserName) {
            updateTextContent(currentSite.ProfileUserName, USER_NAME);
        }

        if (settings.hideProfileStatistics && currentSite.ProfileStatistics) {
            updateTextContent(currentSite.ProfileStatistics, USER_STATISTICS);
        }

        if (settings.hideArticleTitle && currentSite.ArticleTitle) {
            updateVisibility(currentSite.ArticleTitle);
        }
    }

    // 切换功能开关
    function toggleSetting(settingKey) {
        // 先保存当前的设置状态，用于可能的回滚
        const oldSettings = JSON.parse(JSON.stringify(settings));

        settings[settingKey] = !settings[settingKey];

        // 当 hiddenModeEnabled 被切换时，统一控制其他开关
        if (settingKey === "hiddenModeEnabled") {
            settings.hideBrowserTitle = settings.hideArticleTitle = settings.hideProfileImg = settings.hideProfileUserName = settings.hideProfileStatistics = settings.hiddenModeEnabled;
        } else {
            // 如果只切换单个设置，则根据各开关状态更新 hiddenModeEnabled
            settings.hiddenModeEnabled = (
                settings.hideBrowserTitle ||
                settings.hideArticleTitle ||
                settings.hideProfileImg ||
                settings.hideProfileUserName ||
                settings.hideProfileStatistics
            );
        }

        saveSettings();

        // 根据不同的设置项决定是否需要即时操作或刷新页面
        if (settingKey === "hideBrowserTitle") {
            toggleBrowserTitle();
        } else if (settingKey === "hideArticleTitle") {
            toggleArticleTitleVisibility();
        } else {
            // 对于头像、昵称、统计数据更改后，需要刷新页面生效
            // 弹出确认框，如果用户确认则刷新，否则回滚设置
            if (confirm("本次操作需要刷新页面才生效，是否继续？")) {
                location.reload();
            } else {
                // 用户取消了刷新，则回滚到修改前的状态
                settings = oldSettings;
                saveSettings();
            }
        }

        updateMenuCommands();
    }

    // 存储菜单项的引用
    let menuItems = {};

    function updateMenuCommands() {
        // 如果菜单项已经存在，先移除旧菜单
        if (menuItems.hiddenModeEnabled) GM_unregisterMenuCommand(menuItems.hiddenModeEnabled);
        if (menuItems.hideBrowserTitle) GM_unregisterMenuCommand(menuItems.hideBrowserTitle);
        if (menuItems.hideArticleTitle) GM_unregisterMenuCommand(menuItems.hideArticleTitle);
        if (menuItems.hideProfileImg) GM_unregisterMenuCommand(menuItems.hideProfileImg);
        if (menuItems.hideProfileUserName) GM_unregisterMenuCommand(menuItems.hideProfileUserName);
        if (menuItems.hideProfileStatistics) GM_unregisterMenuCommand(menuItems.hideProfileStatistics);

        menuItems.hiddenModeEnabled = GM_registerMenuCommand(
            settings.hiddenModeEnabled ? "🌐一键关闭隐匿浏览" : "🌐一键开启隐匿浏览",
            () => toggleSetting('hiddenModeEnabled')
        );

        menuItems.hideBrowserTitle = GM_registerMenuCommand(
            settings.hideBrowserTitle ? "🔖隐匿网页标题✅" : "🔖隐匿网页标题❌",
            () => toggleSetting('hideBrowserTitle')
        );

        menuItems.hideArticleTitle = GM_registerMenuCommand(
            settings.hideArticleTitle ? "📰隐匿文章标题✅" : "📰隐匿文章标题❌",
            () => toggleSetting('hideArticleTitle')
        );

        menuItems.hideProfileImg = GM_registerMenuCommand(
            settings.hideProfileImg ? "🧢隐匿个人头像✅" : "🧢隐匿个人头像❌",
            () => toggleSetting('hideProfileImg')
        );

        menuItems.hideProfileUserName = GM_registerMenuCommand(
            settings.hideProfileUserName ? "👤隐匿个人昵称✅" : "👤隐匿个人昵称❌",
            () => toggleSetting('hideProfileUserName')
        );

        menuItems.hideProfileStatistics = GM_registerMenuCommand(
            settings.hideProfileStatistics ? "🏅隐匿个人数据✅" : "🏅隐匿个人数据❌",
            () => toggleSetting('hideProfileStatistics')
        );
    }

    // 注册菜单开关
    updateMenuCommands();

    // 页面变化时重新执行
    const observer = new MutationObserver(() => {
        if (settings.hiddenModeEnabled) {
            hideElements();
        }
    });

    // 检测页面变动
    observer.observe(document.body, { childList: true, subtree: true });

    // 初始化页面时内容
    if (settings.hiddenModeEnabled) {
        setTimeout(() => {
            hideElements();
        }, 100);
    }

})();
