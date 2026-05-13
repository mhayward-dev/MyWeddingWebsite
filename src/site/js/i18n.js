// Shared internationalization (i18n) module for civil ceremony website
// Supports: English (en), German (de), Turkish (tr)

const i18n = (function() {
    // Base translations shared across all pages
    const sharedTranslations = {
        en: {
            ceremonyTitle: 'Civil Ceremony ♥ Celebration<br>12th September 2026',
            loveFrom: 'Love from',
            coupleNames: 'Cansu & Mark',
        },
        de: {
            ceremonyTitle: 'Standesamtliche Trauung ♥ Feier<br>12. September 2026',
            loveFrom: 'Alles Liebe',
            coupleNames: 'Cansu & Mark',
        },
        tr: {
            ceremonyTitle: 'Resmi Nikah ♥ Kutlama<br>12 Eylül 2026',
            loveFrom: 'Sevgilerimizle',
            coupleNames: 'Cansu & Mark',
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
        // Gather all possible language sources
        const sources = [];
        
        // navigator.languages is the preferred source (ordered by user preference)
        if (navigator.languages && navigator.languages.length) {
            sources.push(...navigator.languages);
        }
        
        // Fallback to single language properties
        if (navigator.language) sources.push(navigator.language);
        if (navigator.userLanguage) sources.push(navigator.userLanguage);
        if (navigator.browserLanguage) sources.push(navigator.browserLanguage);
        if (navigator.systemLanguage) sources.push(navigator.systemLanguage);
        
        for (const lang of sources) {
            if (!lang) continue;
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
    function setLanguage(lang, userSelected = false) {
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
        
        // Save preference (mark as user-selected if explicitly chosen)
        localStorage.setItem('wedding-lang', lang);
        if (userSelected) {
            localStorage.setItem('wedding-lang-selected', 'true');
        }
        
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

        // Initialize language buttons (mark as user-selected when clicked)
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => setLanguage(btn.dataset.lang, true));
        });

        // Only use saved language if user explicitly selected it, otherwise detect
        const userSelected = localStorage.getItem('wedding-lang-selected') === 'true';
        const savedLang = localStorage.getItem('wedding-lang');
        
        const langToUse = (userSelected && savedLang) ? savedLang : detectLanguage();
        setLanguage(langToUse);
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
