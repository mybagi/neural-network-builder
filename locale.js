// OpenCC JS 1.4.2 supplies the standard Traditional Chinese conversion.
(() => {
  const preferencesKey = 'mybian-language';
  const locales = {
    en: { tag: 'en', label: 'Language' },
    zh: { tag: 'zh-CN', label: '语言' },
    'zh-Hant': { tag: 'zh-Hant', label: '語言' },
  };
  const dictionaryUrl = new URL('./vendor/opencc-cn2t.js', document.currentScript.src);
  let loadingDictionary;
  let convert;

  function loadTraditional() {
    if (window.OpenCC) return Promise.resolve();
    loadingDictionary ??= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = dictionaryUrl.href;
      script.onload = resolve;
      script.onerror = () => {
        script.remove();
        reject(new Error('Unable to load Traditional Chinese conversion.'));
      };
      document.head.append(script);
    }).catch(error => {
      loadingDictionary = undefined;
      throw error;
    });
    return loadingDictionary;
  }

  function traditional(simplified) {
    convert ??= OpenCC.Converter({ from: 'cn', to: 't' });
    return convert(simplified);
  }

  function read(fallback) {
    try {
      const selected = localStorage.getItem(preferencesKey);
      if (Object.hasOwn(locales, selected)) return selected;
    } catch {}
    return fallback;
  }

  function bind(select, fallback, render) {
    const preferred = read(fallback);
    let active;
    let revision = 0;

    function show(language) {
      active = language;
      const { tag, label } = locales[language];
      document.documentElement.lang = tag;
      select.value = language;
      select.setAttribute('aria-label', label);
      render(language);
    }

    async function choose(language, remember) {
      const request = ++revision;
      select.value = language;
      if (language === 'zh-Hant' && !window.OpenCC) {
        select.setAttribute('aria-busy', 'true');
        try {
          await loadTraditional();
        } catch {
          if (request === revision) {
            select.value = active;
            select.removeAttribute('aria-busy');
          }
          return;
        }
      }
      if (request !== revision) return;
      select.removeAttribute('aria-busy');
      show(language);
      if (remember) {
        try { localStorage.setItem(preferencesKey, language); } catch {}
      }
    }

    show(preferred === 'zh-Hant' && !window.OpenCC ? 'zh' : preferred);
    select.addEventListener('change', () => choose(select.value, true));
    if (preferred !== active) choose(preferred, false);
  }

  window.siteLocale = {
    bind,
    text(language, simplified, english) {
      if (language === 'en') return english;
      return language === 'zh-Hant' ? traditional(simplified) : simplified;
    },
    loadTraditional,
    traditional,
  };
})();
