import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, url }) => {
  const siteTitle = "Obytkem.cz";
  const fullTitle = `${title} | ${siteTitle}`;
  const siteUrl = "https://rezervace.obytkem.cz";
  const defaultImage = "https://obytkem.cz/wp-content/uploads/logo.png";

  useEffect(() => {
    // Aktualizace titulku
    document.title = fullTitle;

    // Aktualizace meta popisku
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Aktualizace Open Graph tagů pro sociální sítě
    const updateMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('og:title', fullTitle);
    updateMeta('og:description', description);
    updateMeta('og:url', url || siteUrl);
    updateMeta('og:image', image || defaultImage);

    // Aktualizace strukturovaných dat (JSON-LD)
    let scriptEl = document.getElementById('json-ld-seo') as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'json-ld-seo';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "AutoRental",
      "name": "Obytkem.cz",
      "description": description,
      "url": siteUrl,
      "logo": defaultImage,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Česká republika"
      },
      "priceRange": "1900-3500 CZK"
    });
  }, [fullTitle, description, url, image]);

  return null; // Komponenta nic nevykresluje do UI, jen mění head
};

export default SEO;
