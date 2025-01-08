// ==UserScript==
// @name         PrivateView
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  隐匿浏览——浏览页面时，将关键信息进行隐匿，以保护个人信息安全。也许你在公共场所办公时，常常想不让其他人看见自己在B站上的用户昵称、头像、关注数、粉丝数、动态数，那就巧了，这个扩展脚本可以很好的解决该问题。目前支持bilibili、csdn、zhihu、linux.do、v2ex网站，后续计划实现让用户可自定义指定网站使用隐匿浏览的功能。
// @author       DD1024z
// @namespace    https://github.com/10D24D/PrivateView/
// @supportURL   https://github.com/10D24D/PrivateView/
// @match        *://www.baidu.com/*
// @match        *://chat.baidu.com/*
// @match        *://image.baidu.com/*
// @match        *://tieba.baidu.com/*
// @match        *://wenku.baidu.com/*
// @match        *://fanyi.baidu.com/*
// @match        *://baike.baidu.com/*
// @match        *://xueshu.baidu.com/*
// @match        *://jingyan.baidu.com/*
// @match        *://zhidao.baidu.com/*
// @match        *://baijiahao.baidu.com/*
// @match        *://mbd.baidu.com/*
// @match        *://news.baidu.com/*
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
// @match        *://*.gitee.com/*
// @match        *://*.github.com/*
// @icon         https://raw.githubusercontent.com/10D24D/PrivateView/main/static/icon_max.png
// @license      Apache License 2.0
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @downloadURL  https://update.greasyfork.org/scripts/520416/PrivateView.user.js
// @updateURL    https://update.greasyfork.org/scripts/520416/PrivateView.meta.js
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
    // CustomStatistics 自定义替换匹已匹配统计数据的元素
    const siteConfig = {
        'www.baidu.com': {
            "BrowserTitle": "百度",
            "ProfileImg": "#s-top-username span.s-top-img-wrapper img, a.username span[class$='top-img-wrapper'] img",
            "ProfileUserName": "#s-top-username span.user-name, a.username span[class$='top-username']",
        },
        'chat.baidu.com': {
            "BrowserTitle": "百度AI助手",
            "ProfileImg": "div.user-info img.cos-avatar-img",
            "ProfileUserName": "div.user-info span.cos-line-clamp-1",
        },
        'image.baidu.com': {
            "BrowserTitle": "百度图片",
            "ProfileImg": "#username_info span.s-top-img-wrapper img",
            "ProfileUserName": "#username_info span.s-top-username",
        },
        'tieba.baidu.com': {
            "BrowserTitle": "百度贴吧",
            "ProfileImg": "#user_info img.head_img",
            "ProfileUserName": "#j_u_username a.u_username_wrap span.u_username_title, #user_info div.user_name a",
            "ProfileStatistics": "div.user_score a.score_num",
        },
        'wenku.baidu.com': {
            "BrowserTitle": "百度文库",
            "ProfileImg": "div.user-icon-content.login div.user-icon",
        },
        'fanyi.baidu.com': {
            "BrowserTitle": "百度翻译",
            "ProfileImg": "img[src^='http://himg.bdimg.com/sys/portrait/item/']",
            "ProfileUserName": "#root > div > div > div:nth-child(4) > div:nth-child(2)"
        },
        'baike.baidu.com': {
            "BrowserTitle": "百度百科",
            "ProfileImg": "#user_info img.head_img",
            "ProfileUserName": `
                div.user-bar.user-login > div:nth-child(2) a:first-of-type:not([href]):not([aria-label]):has(i),
                div.fixedWrapper a[href^='/usercenter']
            `
        },
        'xueshu.baidu.com': {
            "BrowserTitle": "百度学术",
            "ProfileUserName": "#userName, #fixed_user a.username"
        },
        'jingyan.baidu.com': {
            "BrowserTitle": "百度经验",
            "ProfileImg": "li.my-info div.user-avatar img, #wgt-user-info img.avatar-img",
            "ProfileUserName": "li.my-info span.user-name, #wgt-user-info p.u-name",
            "ProfileStatistics": "#activeDays, #wgt-user-info span.level",
        },
        'zhidao.baidu.com': {
            "BrowserTitle": "百度知道",
            "ProfileImg": "#user-name span.avatar-container img, div.login-slogan img.avatar-image",
            "ProfileUserName": "#user-name span.user-name-span, div.login-slogan a.user-name-link",
            "ProfileStatistics": "div.answer-question-section span.item-num",
            "CustomStatistics": {
                "div.user-grade": /LV[0-9]+/,
                "div.help-people-count": /已经帮助了\d+人/
            }
        },
        'baijiahao.baidu.com, mbd.baidu.com': {
            "BrowserTitle": "百家号",
            "ProfileImg": "img[data-testid='user-avatar'], div.xcp-publish div.x-avatar-img",
            "ProfileUserName": "a[href='http://i.baidu.com/']",
        },
        'news.baidu.com': {
            "BrowserTitle": "百度新闻",
            "ProfileUserName": "#usrbar a.mn-lk[href='http://passport.baidu.com/']",
        },
        'so.com': {
            "BrowserTitle": "360搜索",
            "ProfileUserName": "#hd_nav li.login span.uname, div.menu .show-list.user-group.u-logined a.title",
        },
        'bing.com': {
            "BrowserTitle": "必应",
            "ProfileImg": "#id_p, #id_accountp",
            "ProfileUserName": "#id_n, #id_l, #id_currentAccount_primary, #id_currentAccount_secondary",
            "ProfileStatistics": "#id_rfb, span.points-container",
        },
        'google.com': {
            "BrowserTitle": "Google",
            "ProfileImg": "#gb a.gb_A img.gb_O, div.XS2qof img",
            "ProfileUserName": "div.gb_Ac div.gb_g, div.gb_Ac div.gb_g + div, div.eYSAde, div.hCDve",
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
            "ProfileImg": ".Avatar.AppHeader-profileAvatar, div.Comments-container img.Avatar",
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
            "ProfileImg": `
                li.header-avatar-wrap a.header-entry-avatar img,
                li.header-avatar-wrap a.header-entry-mini picture.v-img source,
                li.header-avatar-wrap a.header-entry-mini picture.v-img img,
                div.index-info div.home-head img
            `,
            "ProfileUserName": "div.v-popover-content a.nickname-item, div.index-info span.home-top-msg-name",
            "ProfileStatistics": ".counts-item .count-num, div.coins-item span.coin-item__num, div.home-top-bp span.curren-b-num, span.home-top-level-number i.now-num, span.home-top-level-number i.max-num",
            "CustomStatistics": {
                "div.level-item__text": /当前成长\d+，距离升级Lv\.\d+ 还需要\d+/,
                "span.home-top-level-head": /LV[0-9]/,
                "i.home-level-tips": /LV[0-9]/,
            }
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
            "ProfileStatistics": `
                a[href^='/problems/'] > svg + span, section div.text-center p span, #headlessui-popover-button-:r1: a span.text-brand-orange
            `,
        },
        'juejin.cn': {
            "BrowserTitle": "掘金",
            "ProfileImg": "ul.right-side-nav li.menu .avatar img, div.user-info div.avatar img",
            "ProfileUserName": "div.user-detail a.username",
            "ProfileStatistics": `
                ul.actions-count-list div.item-count, div.user-detail a.ore span
            `,
            "CustomStatistics": {
                "a.progress-bar div.jscore-level span": /JY.[0-9]+/,
                "a.progress-bar div.progress span": /\d+\s*\/\s*\d+/
            }
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
            "ProfileStatistics": `
                div.text-theme-vibrancyFg button div, div.items-center span.tabular-nums span,
                div.items-center span.tabular-nums, div.items-center i.i-mgc-fire-cute-fi + span
            `,
        },
        'gitee.com': {
            "BrowserTitle": "Gitee",
            "ProfileImg": "#git-nav-user img.avatar, header span.ant-avatar img, main div.top-header span.ant-avatar img, img#avatar-change",
            "ProfileUserName": "main div.top-header strong.self-center a span, div.user-info a.username",
            "ProfileStatistics": "main div.top-header li a span.float-right",
        },
        'github.com': {
            "BrowserTitle": "GitHub",
            "ProfileImg": "div[aria-label='User navigation'] img, div.AppHeader-user img.avatar",
            "ProfileUserName": `
                div[aria-label='User navigation'] div.lh-condensed div.text-bold > div,
                div[aria-label='User navigation'] div.lh-condensed div.fgColor-muted > div
            `,
        },
    };

    const IMG_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="; // 隐匿图像资源后替换的内容。空白图片
    const IMG_ALT = ""; // 隐匿图像提示内容后替换的内容
    const USER_NAME = "User"; // 隐匿用户名称后显示的内容
    const USER_STATISTICS = "?"; // 隐匿用户统计数据后显示的内容
    let originalTitle = document.title; // 记录原始页面标题

    // 动态生成 localStorage 键名
    const storageKey = `PrivateViewSettings`;
    const currentHostname = Object.keys(siteConfig).find(keys => keys.split(',').some(host => location.hostname.includes(host.trim())));
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
            // 如果是 input[type="text"]，直接修改 value 属性
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.value = value;
            } else {
                // 遍历子节点，修改文本内容
                Array.from(el.childNodes).forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim() !== "") {
                        // 如果不匹配任何规则，直接修改为指定的值
                        child.nodeValue = value;
                    }
                });
            }
            // 额外：修改 aria-label 属性
            if (el.hasAttribute('aria-label')) {
                el.setAttribute('aria-label', value);
            }
        });
    }

    // 修改图像属性值
    function updateImg(selector) {
        document.querySelectorAll(selector).forEach(el => {
            // 如果是 <img> 标签
            if (el.tagName === "IMG") {
                el.src = IMG_SRC; // 替换 src 属性
                el.srcset = IMG_SRC; // 替换 srcset 属性
                if (el.hasAttribute('data-src')) {
                    el.setAttribute('data-src', IMG_SRC); // 替换 data-src 属性
                }
            }

            // 如果是 <source> 标签（用于 <picture> 元素）
            if (el.tagName === "SOURCE") {
                el.srcset = IMG_SRC; // 替换 srcset 属性
            }

            // 检查并修改 style 中的 background-image
            const backgroundImage = el.style.backgroundImage;
            if (backgroundImage && backgroundImage.includes("url")) {
                el.style.backgroundImage = `url(${IMG_SRC})`; // 替换背景图片
            }

            // 遍历所有属性，替换其他与图片相关的自定义属性
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('data-') && attr.value.includes('url')) {
                    el.setAttribute(attr.name, IMG_SRC); // 替换自定义属性的值
                }
            });
        });

        // 递归处理 <picture> 元素内部的 <source> 和 <img> 标签
        document.querySelectorAll(`${selector} picture`).forEach(picture => {
            picture.querySelectorAll("source, img").forEach(sourceOrImg => {
                updateImgElement(sourceOrImg);
            });
        });
    }

    // 单独处理 <source> 和 <img>
    function updateImgElement(el) {
        if (el.tagName === "IMG") {
            el.src = IMG_SRC;
            el.srcset = IMG_SRC;
        } else if (el.tagName === "SOURCE") {
            el.srcset = IMG_SRC;
        }
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

        // 隐匿浏览器标题
        if (settings.hideBrowserTitle && currentSite.BrowserTitle) {
            updateTextContent("head title", currentSite.BrowserTitle);
        }

        // 隐匿头像
        if (settings.hideProfileImg && currentSite.ProfileImg) {
            updateImg(currentSite.ProfileImg);
        }

        // 隐匿用户名
        if (settings.hideProfileUserName && currentSite.ProfileUserName) {
            updateTextContent(currentSite.ProfileUserName, USER_NAME);
        }

        // 针对 ProfileStatistics 处理
        if (settings.hideProfileStatistics && currentSite.ProfileStatistics) {
            updateTextContent(currentSite.ProfileStatistics, USER_STATISTICS);
        }

        // 针对 CustomStatistics 进行精确处理
        if (settings.hideProfileStatistics && currentSite.CustomStatistics) {
            for (const [selector, regex] of Object.entries(currentSite.CustomStatistics)) {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (!el.dataset.processed && regex.test(el.textContent)) {
                        el.textContent = el.textContent.replace(/\d+/g, USER_STATISTICS); // 替换数字
                        el.dataset.processed = "true";
                    }
                });
            }
        }

        // 隐匿文章标题
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
