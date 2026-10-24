/* ==================================================
   MOBILE DR
   MAIN APPLICATION
================================================== */

"use strict";


/* ==================================================
   APP INITIALIZATION
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    MobileDR.init();

});


/* ==================================================
   MOBILE DR APP
================================================== */

const MobileDR = {

    init() {

        this.initializeTheme();

        this.initializeLanguage();

        this.initializeNavigation();

        this.initializeGlobalEvents();

    },


    /* ==============================================
       THEME
    ============================================== */

    initializeTheme() {

        const savedTheme =
            localStorage.getItem("mobileDR_theme") || "light";

        if (savedTheme === "dark") {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }

        const themeBtn =
            document.getElementById("themeBtn");

        if (themeBtn) {

            themeBtn.addEventListener("click", () => {

                const isDark =
                    document.body.classList.toggle("dark");

                const theme = isDark ? "dark" : "light";

                localStorage.setItem(
                    "mobileDR_theme",
                    theme
                );

                this.updateThemeIcon();
                this.updateThemeColor(theme);

            });

        }

        this.updateThemeIcon();
        this.updateThemeColor(savedTheme);

    },


    updateThemeIcon() {

        const icon =
            document.getElementById("themeIcon");

        if (!icon) {
            return;
        }

        icon.textContent =
            document.body.classList.contains("dark")
                ? "☀"
                : "☾";

    },


    updateThemeColor(theme) {

        let metaTheme =
            document.querySelector('meta[name="theme-color"]');

        if (!metaTheme) {
            metaTheme = document.createElement("meta");
            metaTheme.setAttribute("name", "theme-color");
            document.head.appendChild(metaTheme);
        }

        metaTheme.setAttribute(
            "content",
            theme === "dark" ? "#111b2d" : "#ffffff"
        );

    },


    /* ==============================================
       LANGUAGE
    ============================================== */

    initializeLanguage() {

        const savedLanguage =
            localStorage.getItem("mobileDR_language") || "hi";

        this.setLanguage(savedLanguage);

        // Header language toggle button
        const langBtn =
            document.getElementById("langBtn");

        if (langBtn) {

            langBtn.addEventListener("click", () => {

                const current =
                    localStorage.getItem("mobileDR_language") || "hi";

                const next = current === "hi" ? "en" : "hi";

                this.setLanguage(next);

                this.toast(
                    next === "hi"
                        ? "भाषा बदलकर हिंदी कर दी गई"
                        : "Language changed to English"
                );

            });

        }

        // Drawer language options
        document
            .querySelectorAll("[data-lang]")
            .forEach(btn => {

                btn.addEventListener("click", event => {

                    const targetLang =
                        event.currentTarget.getAttribute("data-lang");

                    if (!targetLang) {
                        return;
                    }

                    this.setLanguage(targetLang);

                    this.toast(
                        targetLang === "hi"
                            ? "भाषा: हिंदी"
                            : "Language: English"
                    );

                });

            });

    },


    setLanguage(language) {

        if (
            typeof translations === "undefined" ||
            !translations[language]
        ) {
            return;
        }

        document.documentElement.lang = language;

        localStorage.setItem(
            "mobileDR_language",
            language
        );

        const languageData = translations[language];

        document
            .querySelectorAll("[data-i18n]")
            .forEach(element => {

                const key =
                    element.getAttribute("data-i18n");

                if (
                    Object.prototype.hasOwnProperty.call(languageData, key)
                ) {

                    const value = languageData[key];

                    if (typeof value === "string" && value.includes("<")) {
                        element.innerHTML = value;
                    } else {
                        element.textContent = value;
                    }

                }

            });

        // Update drawer language selector active buttons
        document
            .querySelectorAll("[data-lang]")
            .forEach(btn => {

                if (btn.getAttribute("data-lang") === language) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }

            });

        // Update header language button indicator
        const langText =
            document.getElementById("langText");

        if (langText) {
            langText.textContent = language === "hi" ? "EN" : "हि";
        }

    },


    /* ==============================================
       NAVIGATION
    ============================================== */

    initializeNavigation() {

        if (
            typeof Navigation !== "undefined"
        ) {

            Navigation.init();

        }

    },


    /* ==============================================
       GLOBAL EVENTS
    ============================================== */

    initializeGlobalEvents() {

        document.addEventListener("click", event => {

            const link =
                event.target.closest("a");

            if (!link) {
                return;
            }

            const href =
                link.getAttribute("href");

            if (
                !href ||
                href === "#" ||
                href.startsWith("javascript:")
            ) {
                event.preventDefault();
                return;
            }

            // Smooth scroll to top if clicking home on current page
            const path =
                window.location.pathname.replace(/\\/g, "/");

            const isHome =
                !path ||
                path.endsWith("/") ||
                path.endsWith("index.html");

            if (
                isHome &&
                (href === "index.html" || href === "./index.html")
            ) {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }

            // Allow normal navigation to implemented pages.
            // Page-specific code handles its own interactions.

        });

    },


    /* ==============================================
       TOAST
    ============================================== */

    toast(message, duration = 2500) {

        let container =
            document.querySelector(
                ".toast-container"
            );

        if (!container) {

            container =
                document.createElement("div");

            container.className =
                "toast-container";

            document.body.appendChild(
                container
            );

        }


        const toast =
            document.createElement("div");

        toast.className = "toast";

        toast.textContent = message;

        container.appendChild(toast);


        setTimeout(() => {

            toast.remove();

        }, duration);

    }

};


/* ==================================================
   GLOBAL SHORTCUT
================================================== */

window.MobileDR = MobileDR;
