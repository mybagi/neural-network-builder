// OpenCC JS 1.4.2 supplies the standard Traditional Chinese conversion.
(() => {
  const preferencesKey = 'mybian-language';
  const locales = {
    en: { tag: 'en', label: 'Language' },
    zh: { tag: 'zh-CN', label: '语言' },
    'zh-Hant': { tag: 'zh-Hant', label: '語言' },
  };
  let convert;

  function traditional(simplified) {
    convert ??= OpenCC.Converter({ from: 'cn', to: 't' });
    return convert(simplified);
  }

  window.siteLocale = {
    read(fallback) {
      try {
        const selected = localStorage.getItem(preferencesKey);
        if (Object.hasOwn(locales, selected)) return selected;
      } catch {}
      return fallback;
    },
    save(language) {
      try { localStorage.setItem(preferencesKey, language); } catch {}
    },
    apply(select, language) {
      const { tag, label } = locales[language];
      document.documentElement.lang = tag;
      select.value = language;
      select.setAttribute('aria-label', label);
    },
    text(language, simplified, english) {
      if (language === 'en') return english;
      return language === 'zh-Hant' ? traditional(simplified) : simplified;
    },
    traditional,
  };
})();
