// Shared internationalization (i18n) module for wedding website
// Supports: English (en), German (de), Turkish (tr)

const i18n = (function() {
    // Base translations shared across all pages
    const sharedTranslations = {
        en: {
            coupleNames: "Cansu & Mark's<br>Wedding",
            weddingDate: '12 September 2026 • Berlin',
        },
        de: {
            coupleNames: 'Cansu & Marks<br>Hochzeit',
            weddingDate: '12. September 2026 • Berlin',
        },
        tr: {
            coupleNames: "Cansu & Mark'ın<br>Düğünü",
            weddingDate: '12 Eylül 2026 • Berlin',
        }
    };

    // Page-specific translations that can be extended
    let pageTranslations = {};

    // Supported languages
    const supportedLanguages = ['en', 'de', 'tr'];

    // Current language
    let currentLanguage = 'en';

    /**
     * Detect browser language and map to supported languages
     */
    function detectLanguage() {
        const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
        
        for (const lang of browserLanguages) {
            const primaryLang = lang.split('-')[0].toLowerCase();
            if (supportedLanguages.includes(primaryLang)) {
                return primaryLang;
            }
        }
        
        return 'en'; // Default fallback
    }

    /**
     * Get merged translations (shared + page-specific)
     */
    function getTranslations(lang) {
        return {
            ...sharedTranslations[lang],
            ...(pageTranslations[lang] || {})
        };
    }

    /**
     * Set page-specific translations
     */
    function setPageTranslations(translations) {
        pageTranslations = translations;
    }

    /**
     * Apply translations to elements with data-i18n attribute
     */
    function setLanguage(lang) {
        if (!supportedLanguages.includes(lang)) {
            console.warn(`Language "${lang}" not supported. Falling back to English.`);
            lang = 'en';
        }

        currentLanguage = lang;
        const translations = getTranslations(lang);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations && translations[key]) {
                el.innerHTML = translations[key];
            }
        });

        // Update placeholders for inputs
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations && translations[key]) {
                el.placeholder = translations[key];
            }
        });
        
        // Update page title
        if (translations && translations.pageTitle) {
            document.title = translations.pageTitle;
        }
        
        // Update active button state
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // Save preference
        localStorage.setItem('wedding-lang', lang);
        
        // Update html lang attribute
        document.documentElement.lang = lang;

        // Dispatch event for any page-specific handlers
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    /**
     * Get the current language
     */
    function getCurrentLanguage() {
        return currentLanguage;
    }

    /**
     * Initialize the i18n system
     */
    function init(pageSpecificTranslations) {
        // Set page-specific translations if provided
        if (pageSpecificTranslations) {
            setPageTranslations(pageSpecificTranslations);
        }

        // Initialize language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
        });

        // Load saved language, or detect from browser, or default to English
        const savedLang = localStorage.getItem('wedding-lang') || detectLanguage();
        setLanguage(savedLang);
    }

    // Public API
    return {
        init,
        setLanguage,
        getCurrentLanguage,
        detectLanguage,
        setPageTranslations
    };
})();
