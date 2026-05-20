window.appConfigPromise = fetch('config.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Could not load config.json');
    }
    return response.json();
  })
  .then(config => {
    window.appConfig = config;
    applyConfig(config);
    return config;
  })
  .catch(error => {
    console.error('Error loading config:', error);
    // Fallback config if fetch fails
    window.appConfig = {
      siteName: "DTECH",
      siteDescription: "The Student Marketplace",
      logoUrl: "logo.png",
      themeColor: "#00D2FF",
      themeHoverColor: "#00B4D8",
      adminWhatsAppNumber: "27686620552",
      footerText: "empowering the youth through digital innovation",
      workerUrl: "https://mute-snowflake-4d2a.dtech2services.workers.dev/"
    };
    applyConfig(window.appConfig);
    return window.appConfig;
  });

function applyConfig(config) {
  // Apply CSS Variables
  const root = document.documentElement;
  if (config.themeColor) root.style.setProperty('--primary-color', config.themeColor);
  if (config.themeHoverColor) root.style.setProperty('--primary-hover', config.themeHoverColor);

  // Set Document Title gracefully
  if (config.siteName) {
    const titleParts = document.title.split(' - ');
    if (titleParts.length > 1) {
       document.title = `${titleParts[0]} - ${config.siteName}`;
    } else if (document.title === 'Student Marketplace') { // Index page
       document.title = `${config.siteName} - ${config.siteDescription || 'Student Marketplace'}`;
    } else {
       document.title = `${document.title} - ${config.siteName}`;
    }
  }

  // Define update logic
  const updateDom = () => {
    // Brand Name Elements
    document.querySelectorAll('.brand-name').forEach(el => {
      el.textContent = config.siteName;
    });

    // Brand Description Elements
    document.querySelectorAll('.brand-description').forEach(el => {
      el.textContent = config.siteDescription;
    });

    // Logo Image
    document.querySelectorAll('.brand-logo').forEach(el => {
      if (el.tagName === 'IMG') {
        el.src = config.logoUrl;
        el.alt = `${config.siteName} Logo`;
      }
    });

    // Footer Text
    document.querySelectorAll('.footer-text').forEach(el => {
      el.innerHTML = `${config.siteName} ${config.footerText}<br><span>&copy; ${new Date().getFullYear()} ${config.siteName}</span>`;
    });
  };

  // If document is already loaded, update immediately. Otherwise, wait for DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDom);
  } else {
    updateDom();
  }
}
