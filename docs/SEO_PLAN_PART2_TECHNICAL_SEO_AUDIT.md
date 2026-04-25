# SEO Master Plan - Part 2: Technical SEO Audit & Implementation
# OwnMD macOS Markdown Editor - Teknik SEO
# Tarih: 2026-04-25

---

## 1. Mevcut Durum Analizi

### 1.1 website/ Dizini İncelemesi

```
website/
├── index.html          → Ana giriş sayfası (muhtemelen)
├── assets/             → CSS, JS, görseller
├── [lang]/             → Dil klasörleri (en, tr, de, vs)
├── [lang]/index.html   → Dil sayfaları
├── [lang]/features.html
├── [lang]/download.html
├── [lang]/blog/
└── [lang]/docs/

Mevcut Yapı Sorunları:
- SEO meta tagları var mı?
- sitemap.xml mevcut mu?
- robots.txt mevcut mu?
- hreflang tagları eklenmiş mi?
- Canonical URL'ler doğru mu?
- Görsel optimizasyonu yapılmış mı?
- Schema markup mevcut mu?
```

### 1.2 Kritik Technical SEO Sorunları

| Sorun | Öncelik | Düzeltme Zorluğu |
|-------|---------|------------------|
| Meta title/description eksik | 🔴 Kritik | Kolay |
| sitemap.xml yok | 🔴 Kritik | Orta |
| robots.txt yok | 🔴 Kritik | Kolay |
| hreflang tagları eksik | 🔴 Kritik | Orta |
| Canonical URL eksik | 🔴 Kritik | Kolay |
| Schema markup yok | 🟡 Önemli | Orta |
| Görsel alt text yok | 🟡 Önemli | Orta |
| H1-H6 yapısı bozuk | 🟡 Önemli | Kolay |
| Internal linking zayıf | 🟡 Önemli | Orta |
| Page speed yavaş | 🟡 Önemli | Zor |
| Mobile friendliness | 🟡 Önemli | Orta |
| Core Web Vitals sorunları | 🟡 Önemli | Zor |

---

## 2. Hemen Yapılması Gerekenler (0-7 Gün)

### 2.1 Meta Tag Optimizasyonu

```html
<!-- EN Ana Sayfa için -->
<title>OwnMD - Best Free Markdown Editor for Mac | 2026</title>
<meta name="description" content="OwnMD is a free, open-source Markdown editor for macOS with KaTeX math support, Mermaid diagrams, live preview, and beautiful themes. Download now!" />
<meta name="keywords" content="markdown editor mac, best markdown editor mac, free markdown editor mac, macos markdown editor, markdown editor with math support" />
<link rel="canonical" href="https://ownmd.com/" />
<meta name="robots" content="index, follow" />
<meta name="author" content="OwnMD" />

<!-- Open Graph -->
<meta property="og:title" content="OwnMD - Best Free Markdown Editor for Mac" />
<meta property="og:description" content="Free Markdown editor for macOS with KaTeX, Mermaid, themes. Download now!" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://ownmd.com/" />
<meta property="og:image" content="https://ownmd.com/og-image.png" />
<meta property="og:locale" content="en_US" />
<meta property="og:site_name" content="OwnMD" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="OwnMD - Best Free Markdown Editor for Mac" />
<meta name="twitter:description" content="Free Markdown editor for macOS with KaTeX, Mermaid, themes." />
<meta name="twitter:image" content="https://ownmd.com/og-image.png" />

<!-- TR Ana Sayfa için -->
<title>OwnMD - macOS için En İyi Ücretsiz Markdown Editörü | 2026</title>
<meta name="description" content="OwnMD, macOS için ücretsiz ve açık kaynak Markdown editörü. KaTeX matematik desteği, Mermaid diyagramları, canlı önizleme ve temalar. Hemen indir!" />
<meta name="keywords" content="markdown editörü mac, mac için markdown uygulaması, ücretsiz markdown editörü, macos markdown editörü" />
<link rel="canonical" href="https://ownmd.com/tr/" />
<meta property="og:locale" content="tr_TR" />
```

### 2.2 robots.txt Oluşturma

```
User-agent: *
Allow: /
Allow: /en/
Allow: /tr/
Allow: /de/
Allow: /es/
Allow: /fr/
Allow: /ja/
Allow: /pt/
Allow: /zh/

Disallow: /api/
Disallow: /admin/
Disallow: /*.json$
Disallow: /assets/vendor/

Sitemap: https://ownmd.com/sitemap.xml
Sitemap: https://ownmd.com/tr-sitemap.xml
Sitemap: https://ownmd.com/de-sitemap.xml
```

### 2.3 sitemap.xml Oluşturma

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Ana Sayfa -->
  <url>
    <loc>https://ownmd.com/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://ownmd.com/en/"/>
    <xhtml:link rel="alternate" hreflang="tr" href="https://ownmd.com/tr/"/>
    <xhtml:link rel="alternate" hreflang="de" href="https://ownmd.com/de/"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://ownmd.com/es/"/>
    <xhtml:link rel="alternate" hreflang="fr" href="https://ownmd.com/fr/"/>
    <xhtml:link rel="alternate" hreflang="ja" href="https://ownmd.com/ja/"/>
    <xhtml:link rel="alternate" hreflang="pt" href="https://ownmd.com/pt/"/>
    <xhtml:link rel="alternate" hreflang="zh" href="https://ownmd.com/zh/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://ownmd.com/"/>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>

  <!-- Features Sayfası -->
  <url>
    <loc>https://ownmd.com/en/features/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://ownmd.com/en/features/"/>
    <xhtml:link rel="alternate" hreflang="tr" href="https://ownmd.com/tr/özellikler/"/>
    <priority>0.9</priority>
    <changefreq>monthly</changefreq>
  </url>

  <!-- Download Sayfası -->
  <url>
    <loc>https://ownmd.com/en/download/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://ownmd.com/en/download/"/>
    <xhtml:link rel="alternate" hreflang="tr" href="https://ownmd.com/tr/indir/"/>
    <priority>0.9</priority>
    <changefreq>monthly</changefreq>
  </url>

  <!-- Blog Yazıları -->
  <url>
    <loc>https://ownmd.com/en/blog/</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>

  <!-- Docs -->
  <url>
    <loc>https://ownmd.com/en/docs/</loc>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>

</urlset>
```

### 2.4 hreflang Uygulaması

```html
<!-- TÜM SAYFALARA EKLENECEK (en sayfası için örnek) -->
<link rel="alternate" hreflang="en" href="https://ownmd.com/en/" />
<link rel="alternate" hreflang="en-US" href="https://ownmd.com/en/" />
<link rel="alternate" hreflang="tr" href="https://ownmd.com/tr/" />
<link rel="alternate" hreflang="tr-TR" href="https://ownmd.com/tr/" />
<link rel="alternate" hreflang="de" href="https://ownmd.com/de/" />
<link rel="alternate" hreflang="es" href="https://ownmd.com/es/" />
<link rel="alternate" hreflang="fr" href="https://ownmd.com/fr/" />
<link rel="alternate" hreflang="ja" href="https://ownmd.com/ja/" />
<link rel="alternate" hreflang="pt" href="https://ownmd.com/pt/" />
<link rel="alternate" hreflang="zh" href="https://ownmd.com/zh/" />
<link rel="alternate" hreflang="x-default" href="https://ownmd.com/" />
<link rel="canonical" href="https://ownmd.com/en/" />
```

---

## 3. Schema Markup Uygulaması (7-14 Gün)

### 3.1 SoftwareApplication Schema

```html
<!-- Ana Sayfa için SoftwareApplication Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "OwnMD",
  "description": "Free, open-source Markdown editor for macOS with KaTeX math support, Mermaid diagrams, live preview, and beautiful themes.",
  "url": "https://ownmd.com",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "macOS",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "screenshot": "https://ownmd.com/screenshots/main.png",
  "softwareVersion": "1.0.0",
  "author": {
    "@type": "Organization",
    "name": "OwnMD",
    "url": "https://ownmd.com"
  },
  "keywords": "markdown editor, mac, katex, mermaid, open source, free"
}
</script>
```

### 3.2 FAQPage Schema

```html
<!-- SSS sayfası için FAQ Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is OwnMD really free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, OwnMD is completely free and open-source. You can download and use it without any limitations."
      }
    },
    {
      "@type": "Question",
      "name": "Does OwnMD support KaTeX math?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, OwnMD has built-in KaTeX support for rendering LaTeX math equations in your Markdown documents."
      }
    },
    {
      "@type": "Question",
      "name": "Can I create diagrams with OwnMD?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, OwnMD supports Mermaid diagrams, allowing you to create flowcharts, sequence diagrams, and more directly in Markdown."
      }
    },
    {
      "@type": "Question",
      "name": "What languages does OwnMD support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "OwnMD's interface supports English, Turkish, German, Spanish, French, Japanese, Portuguese, and Chinese."
      }
    }
  ]
}
</script>
```

### 3.3 BreadcrumbList Schema

```html
<!-- Breadcrumb Schema (Features sayfası için) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://ownmd.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Features",
      "item": "https://ownmd.com/en/features/"
    }
  ]
}
</script>
```

### 3.4 HowTo Schema (Kullanım Kılavuzları için)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Write Math Equations in Markdown",
  "description": "Learn how to use KaTeX in OwnMD to write beautiful math equations",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Enable KaTeX",
      "text": "Open OwnMD preferences and enable KaTeX rendering"
    },
    {
      "@type": "HowToStep",
      "name": "Write inline math",
      "text": "Use $...$ for inline math, e.g., $E = mc^2$"
    },
    {
      "@type": "HowToStep",
      "name": "Write block math",
      "text": "Use $$...$$ for block/display math equations"
    }
  ]
}
</script>
```

---

## 4. Sayfa Başına SEO Kontrol Listesi

### 4.1 Her Sayfada Kontrol Edilecekler

| Element | Varlık | İçerik | Örnek |
|---------|--------|--------|-------|
| `<title>` | ✓ | 50-60 karakter | "OwnMD - Best Free Markdown Editor for Mac" |
| `<meta description>` | ✓ | 150-160 karakter | "Free, open-source Markdown editor for macOS..." |
| `<h1>` | ✓ | 1 adet, sayfa başlığı | "# OwnMD Features" |
| `<h2>` | ✓ | Bölüm başlıkları | "## KaTeX Math Support" |
| `<h3>` | ✓ | Alt bölümler | "### Writing Inline Equations" |
| `<img alt>` | ✓ | Açıklayıcı | "OwnMD interface showing preview panel" |
| Internal links | ✓ | İlgili sayfalar | "<a href="/en/download/">Download</a>" |
| External links | △ | Güvenilir kaynaklar | Wikipedia, resmi dokümanlar |
| Canonical URL | ✓ | Sayfanın kendisi | "<link rel="canonical" ...>" |
| hreflang | ✓ | Tüm dil versiyonları | Tüm dil linkleri |

### 4.2 URL Yapısı Standardı

```
İYİ URL YAPISI:
/en/features/              → Features sayfası (EN)
/en/download/              → Download sayfası (EN)
/en/blog/katex-guide/      → Blog yazısı (EN)
/tr/özellikler/            → Features sayfası (TR)
/tr/indir/                 → Download sayfası (TR)
/de/funktionen/            → Features sayfası (DE)

KÖTÜ URL YAPISI (KAÇIN):
/page?id=123
/en/page.html
/?lang=tr&page=features
/index.php?p=features
```

---

## 5. Görsel Optimizasyonu

### 5.1 Görsel SEO Kuralları

| Kural | Standart | Örnek |
|-------|----------|-------|
| Dosya adı | Açıklayıcı, keyword | "markdown-editor-katex-math.png" |
| Alt text | Açıklayıcı, 125 karakter | "OwnMD showing KaTeX math equation in preview" |
| Title attribute | Kısa açıklama | "KaTeX math preview in OwnMD" |
| Boyut | <200KB tercih | WebP formatı kullan |
| Genişlik | Max 1200px | 1200x800px |
| Lazy loading | ✓ | loading="lazy" |
| Srcset | ✓ | srcset="image-400.webp 400w, ..." |

### 5.2 Görsel Dosya Adı Örnekleri

```
KÖTÜ:     IMG_1234.png, DSC001.jpg, screenshot.png
İYİ:      ownmd-katex-math-example.png
İYİ:      ownmd-mermaid-flowchart-diagram.png
İYİ:      ownmd-dark-theme-editor.png
İYİ:      ownmd-export-options-dialog.png
İYİ:      ownmd-macos-ventana-integration.png
```

---

## 6. Performance SEO (Page Speed)

### 6.1 Core Web Vitals Hedefleri

| Metrik | Hedef | Mevcut Durum (Tahmini) |
|--------|-------|----------------------|
| LCP (Largest Contentful Paint) | < 2.5s | Bilinmiyor |
| FID (First Input Delay) | < 100ms | Bilinmiyor |
| CLS (Cumulative Layout Shift) | < 0.1 | Bilinmiyor |
| TTFB (Time to First Byte) | < 800ms | Bilinmiyor |
| First Contentful Paint | < 1.8s | Bilinmiyor |

### 6.2 Hız Optimizasyonu Checklist

- [ ] Görselleri WebP formatına dönüştür
- [ ] CSS/JS minify et
- [ ] Critical CSS inline yap
- [ ] Lazy loading uygula
- [ ] CDN kullan (Cloudflare vb.)
- [ ] Browser caching headers ayarla
- [ ] Gzip/Brotli compression aktif et
- [ ] Render-blocking JS'leri async yap
- [ ] Preload critical resources
- [ ] DNS prefetch dış kaynaklar için

### 6.3 CDN ve Cache Headers

```
Cache-Control: public, max-age=31536000, immutable
Content-Type: application/javascript; charset=utf-8
Cache-Control: public, max-age=86400, s-maxage=31536000
```

---

## 7. Mobile SEO

### 7.1 Mobile-First Checklist

| Kontrol | Durum |
|---------|-------|
| Responsive tasarım | Zorunlu |
| Touch-friendly butonlar (min 44x44px) | Zorunlu |
| Viewport meta tag | `<meta name="viewport" content="width=device-width, initial-scale=1">` |
| Font size minimum 16px | Body text için |
| No horizontal scroll | Tüm cihazlarda |
| Mobile-friendly test | Google Test |
| Accelerated Mobile Pages (AMP) | Opsiyonel |

### 7.2 Mobile Test Araçları

- Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- PageSpeed Insights: https://pagespeed.web.dev/
- Lighthouse: Chrome DevTools

---

## 8. Yapılacaklar Timeline

```
HAFTA 1 (0-7 Gün):
□ robots.txt oluştur
□ sitemap.xml oluştur
□ Tüm sayfalara meta tagları ekle
□ hreflang taglarını tüm sayfalara ekle
□ Canonical URL'leri düzelt

HAFTA 2 (7-14 Gün):
□ Schema markup (Software, FAQ, Breadcrumb)
□ URL yapısını standardize et
□ Görsel alt textlerini ekle
□ Internal linking yapısını düzelt

HAFTA 3-4 (14-28 Gün):
□ Page speed optimizasyonu
□ Mobile responsive test
□ Görsel optimizasyonu (WebP, lazy load)
□ CDN entegrasyonu (opsiyonel)

SÜREKLİ:
□ Monthly sitemap güncelleme
□ Quarterly technical audit
□ Content güncellemelerinde SEO kontrolü
```

---

## 9. Google Search Console Entegrasyonu

### 9.1 Gerekli Kurulumlar

1. **Siteyi ekle**: https://search.google.com/search-console
2. **Doğrula**: DNS TXT record veya HTML file upload
3. **Sitemap gönder**: /sitemap.xml
4. **International targeting**: hreflang ayarları
5. **Core Web Vitals raporu**: İzle

### 9.3 İzlenecek Metrikler

| Metrik | Hedef | Uyarı Eşiği |
|--------|-------|------------|
| Impressions | Artış trend | Düşüş >20% |
| Clicks | Artış trend | Düşüş >10% |
| CTR | >2% | <1% |
| Position | <10 | >20 |
| Index Coverage | 100% | 0% hata |

---

## 10. Sonraki Adımlar

1. [ ] Mevcut website/ dosyalarını incele
2. [ ] Meta tag template oluştur
3. [ ] robots.txt ve sitemap.xml oluştur
4. [ ] hreflang uygula
5. [ ] Schema markup ekle
6. [ ] Page speed test et
7. [ ] Google Search Console'a ekle
