import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = "Dave Techs Academy — Practical Technology Training Online & Physical";
const DEFAULT_DESC =
  "Learn practical technology skills from experienced instructors through flexible online training or hands-on physical classes in Nigeria. Courses in Full-Stack, AI, Cybersecurity, Data Analysis, and more.";
const DEFAULT_IMAGE = "/img/file_0000000044488243bc68f0e3a2f0c1cd.png";
const SITE_NAME = "Dave Techs Academy";

export const useSEO = ({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  schema,
}: SEOProps = {}) => {
  useEffect(() => {
    // 1. Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to set meta tag
    const setMeta = (nameOrProp: "name" | "property", key: string, content: string) => {
      let el = document.querySelector(`meta[${nameOrProp}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(nameOrProp, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // 2. Standard Meta
    setMeta("name", "description", description);

    // 3. Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", SITE_NAME);
    if (ogImage) {
      setMeta("property", "og:image", ogImage);
    }
    const currentUrl = canonical || window.location.href;
    setMeta("property", "og:url", currentUrl);

    // 4. Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    if (ogImage) {
      setMeta("name", "twitter:image", ogImage);
    }

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // 6. JSON-LD Structured Data
    let scriptTag = document.getElementById("seo-schema-jsonld") as HTMLScriptElement | null;
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "seo-schema-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Optional cleanup on unmount
    };
  }, [title, description, canonical, ogType, ogImage, schema]);
};
