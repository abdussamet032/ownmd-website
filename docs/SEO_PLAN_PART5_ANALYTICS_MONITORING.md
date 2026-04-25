# SEO Master Plan - Part 5: Analytics, Monitoring & Maintenance
# OwnMD macOS Markdown Editor - SEO İzleme ve Bakım
# Tarih: 2026-04-25

---

## 1. SEO Analytics Kurulumu

### 1.1 Zorunlu Araçlar

```
ÜCRETSİZ ARAÇLAR:
├── Google Search Console     → Arama performansı
├── Google Analytics 4        → Site trafiği
├── Google PageSpeed Insights  → Performans
├── Ahrefs Webmaster Tools     → Backlink izleme
├── Ubersuggest               → Keyword izleme
└── Google Alerts            → Brand mentions

ÜCRETLİ ARAÇLAR (OPSİYONEL):
├── Ahrefs                    → Kapsamlı backlink analizi
├── SEMrush                    → Rakip analizi
├── Moz Pro                    → Domain authority
└── Screaming Frog           → Site audit
```

### 1.2 Google Search Console Kurulumu

```
KURULUM ADIMLARI:
1. https://search.google.com/search-console adresine git
2. "Start now" tıkla
3. Domain veya URL prefix seç
4. Doğrulama yap (DNS TXT veya HTML file)
5. sitemap.xml gönder
6. "Performance" raporlarını izle

ÖNEMLİ RAPORLAR:
├── Performance → Impressions, clicks, CTR, position
├── Coverage → Index durumu, hatalar
├── Sitemaps → sitemap durumu
├── Links → External ve internal linkler
└── Enhancements → Core Web Vitals, schema
```

### 1.3 Google Analytics 4 Kurulumu

```html
<!-- GA4 Tracking Code -->
<!-- Her sayfanın <head>'ine eklenmeli -->

<!-- Alternative: Google Tag Manager -->
<!-- GTM kullanıyorsan, GA4 tagını GTM üzerinden yönet -->
```

```javascript
// GA4 Event Tracking - Önemli SEO Event'leri

// Page view (otomatik)
// Scroll depth
gtag('event', 'page_view', {
  'page_title': document.title,
  'page_location': window.location.href,
  'page_path': window.location.pathname
});

// Scroll tracking
let lastScrollDepth = 0;
window.addEventListener('scroll', function() {
  let scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  if (scrollPercent > lastScrollDepth && [25, 50, 75, 90].includes(scrollPercent)) {
    gtag('event', 'scroll_depth', {
      'scroll_depth_percent': scrollPercent,
      'page_path': window.location.pathname
    });
    lastScrollDepth = scrollPercent;
  }
});

// PDF/Indir click tracking
document.querySelectorAll('.download-btn, a[href*="download"]').forEach(function(link) {
  link.addEventListener('click', function() {
    gtag('event', 'download_click', {
      'event_category': 'engagement',
      'event_label': link.href
    });
  });
});
```

---

## 2. SEO Metrikleri İzleme

### 2.1 Ana Metrikler ve Hedefler

```
GÜNCEL DURUM (BAŞLANGIÇ NOKTASI):
- Organic Traffic: ~0 (yeni site)
- Keywords: ~0
- Backlinks: ~0
- Domain Rating: ~0

1. AY HEDEFLERİ:
- Organic Traffic: 100+
- Ranking Keywords: 20+
- Backlinks: 10+
- DR: 5+

3. AY HEDEFLERİ:
- Organic Traffic: 500+
- Ranking Keywords: 100+
- Backlinks: 50+
- DR: 15+

6. AY HEDEFLERİ:
- Organic Traffic: 2,000+
- Ranking Keywords: 300+
- Backlinks: 150+
- DR: 25+

12. AY HEDEFLERİ:
- Organic Traffic: 10,000+
- Ranking Keywords: 1000+
- Backlinks: 500+
- DR: 40+
```

### 2.2 Haftalık SEO Dashboard

```
HAFTALIK KONTROL LİSTESİ:

✓ Google Search Console
├── Search Results
│   ├── Top queries (impressions, CTR, position)
│   ├── Pages with most clicks
│   └── New keywords gained
├── Coverage
│   ├── Errors (index hataları)
│   └── Warnings
└── Sitemaps
    └── Status (submitted vs indexed)

✓ Google Analytics
├── Traffic Overview
│   ├── Users, sessions, bounce rate
│   ├── Traffic sources (organic, direct, referral, social)
│   └── Top pages
├── User Flow
│   └── How users navigate the site
└── Events
    └── Download button clicks

✓ Backlinks
├── New backlinks gained
├── Lost backlinks
└── New referring domains

✓ Rankings
├── Position changes for target keywords
├── New keyword rankings
└── Competitor position changes

✓ Technical
├── Page speed (Core Web Vitals)
├── Mobile usability issues
└── Structured data errors
```

---

## 3.排名 İzleme (Ranking Monitoring)

### 3.1 Keyword Position Tracking

```
TAKİP EDİLECEK KEYWORDS:

KRITIK (Günlük izleme):
- "markdown editor mac"
- "best markdown editor mac"
- "ownmd"

ÖNEMLİ (Haftalık izleme):
- "free markdown editor mac"
- "markdown editor with math support"
- "mermaid markdown editor"
- "typora alternative"
- "markdown editörü mac"

LONG-TAIL (Aylık izleme):
- "markdown editor with katex support"
- "best free markdown editor for developers"
- "macos markdown editor with live preview"
- vs. (vscode, vs typora, vs obsidian)
```

### 3.2 Ranking Izleme Araçları

```
ÜCRETSİZ:
├── Google Search Console (kendi keywordlerin)
├── Google Trends (trendler)
├── Ubersuggest (günlük 3 sorgu)
└── Rank Tracker (ücretsiz sürüm)

ÜCRETLİ:
├── Ahrefs (haftalık tüm keywordler)
├── SEMrush (günlük tüm keywordler)
├── Serpstat
└── Accuranker
```

---

## 4. Trafik Analizi

### 4.1 Traffic Segmentasyonu

```
TRAFİK KAYNAKLARI:
├── Organic Search → Google, Bing, Yandex aramaları
├── Direct → URL yazma, bookmark, tanıdığınız
├── Referral → Başka sitelerden linkler
├── Social → Twitter, GitHub, Reddit, LinkedIn
└── Email → Newsletter, direct email links

HER KAYNAK İÇİN HEDEFLER:
Organic: 60%+ (SEO başarısı)
Direct: 20%+ (Brand recognition)
Referral: 10%+ (Backlink etkisi)
Social: 5%+ (Active promotion)
Email: 5%+ (List building)
```

### 4.2 User Behavior Metrics

```
ÖNEMLİ METRİKLER:

| Metrik | Hedef | Kırmızı Alarm |
|--------|-------|---------------|
| Bounce Rate | <60% | >75% |
| Avg. Session Duration | >2 min | <30 sec |
| Pages per Session | >3 | <1.5 |
| Goal Completions | Yükselen trend | Düşüş |

HEDEFLER:
├── Download button tıklaması
├── Feature sayfası görüntülemesi
├── Documentation görüntülemesi
└── Blog okuma (scroll + time)
```

### 4.3 Conversion Tracking

```javascript
// GA4 Conversion Events

// Download butonu tıklaması
gtag('event', 'download', {
  'event_category': 'conversion',
  'event_label': 'mac-download',
  'value': 1
});

// Email signup (varsa newsletter)
gtag('event', 'signup', {
  'event_category': 'conversion',
  'event_label': 'newsletter'
});

// GitHub star
gtag('event', 'github_star', {
  'event_category': 'engagement',
  'event_label': 'header-star'
});
```

---

## 5. Raporlama

### 5.1 Haftalık SEO Raporu (Kısa)

```
HAFTA: [Tarih]

ÖZET:
- Organic Traffic: [X] (+/-% vs geçen hafta)
- Top Keywords: [keyword1], [keyword2], [keyword3]
- New Backlinks: [X]
- Technical Issues: [Yok / Var: listele]

ÖNEMLİ DEĞİŞİKLİKLER:
- [Değişiklik 1]
- [Değişiklik 2]

SONRAKİ HAFTA HEDEFLERİ:
- [Hedef 1]
- [Hedef 2]
```

### 5.2 Aylık SEO Raporu (Detaylı)

```
AYLIK SEO RAPORU - [Ay/Yıl]

1. PERFORMANS ÖZETİ
├── Organic Sessions: [X] (+X% vs geçen ay)
├── Total Keywords Ranking: [X]
├── Average Position: [X]
├── New Backlinks: [X]
├── Lost Backlinks: [X]
└── Domain Rating: [X]

2. ORGANIC TRAFİK GRAFİĞİ
[Buraya grafik ekle]

3. TOP PERFORMING PAGES
| Page | Sessions | Bounce Rate | Avg. Time |
|------|----------|-------------|-----------|
| /    | ...      | ...         | ...       |
| ...  | ...      | ...         | ...       |

4. TOP KEYWORDS
| Keyword | Position | Search Volume | Trafiği |
|---------|----------|---------------|---------|
| ...     | ...      | ...           | ...     |

5. BACKLINK DURUMU
├── New Backlinks: [Liste]
├── Lost Backlinks: [Liste]
└── New Referring Domains: [Liste]

6. RAKİP PERFORMANSI
| Competitor | DA | Backlinks | Top Keyword |
|------------|----|-----------|-------------|
| ...        | ...| ...       | ...         |

7. TECHNICAL SEO DURUMU
├── Core Web Vitals: ✅/❌
├── Index Coverage: ✅/❌
├── Mobile Friendly: ✅/❌
├── HTTPS: ✅/❌
└── Schema Markup: ✅/❌

8. İÇERİK PERFORMANSI
├── New Content Published: [Liste]
├── Top Performing Content: [Liste]
└── Underperforming Content: [Liste]

9. SONRAKI AY HEDEFLERİ
- [Hedef 1]
- [Hedef 2]
- [Hedef 3]
```

---

## 6. Teknik Bakım

### 6.1 Düzenli Kontroller

```
HER GÜN:
□ Google Search Console hata kontrolü
□ Site uptime monitoring (varsa)

HER HAFTA:
□ New backlinks izleme
□ Ranking değişiklikleri
□ Content performance
□ Broken links kontrolü (sitemap ve kritik sayfalar)

HER AY:
□ Full site audit
□ Core Web Vitals kontrolü
□ Backlink profile review
□ Rakip analizi güncelleme
□ Content calendar review

HER ÇEYREK (3 Ay):
□ Full technical SEO audit
□ Yeni fırsatlar değerlendirme
□ Strateji gözden geçirme
□ Yeni araç/tool değerlendirme
```

### 6.2 Hata Yönetimi

```
KRITIK HATALAR (24 saat içinde düzelt):
- Site tamamen down
- Tüm sayfalar 404
- Canonical sorunları
- robots.txt yanlış yapılandırma
- mass-index hatası

ÖNEMLİ HATALAR (72 saat içinde düzelt):
- Schema validation errors
- Core Web Vitals regression
- Mobile usability error
- Sayfa bazlı 404'ler
- Title/description eksiklikleri

ORTA ÖNCELİKLİ (1 hafta içinde düzelt):
- Görsel optimization eksiklikleri
- Internal linking sorunları
- Heading structure bozuklukları
- Yavaş sayfa yükleme (özellikle LCP)
```

---

## 7. Sürekli İyileştirme

### 7.1 A/B Testing Fırsatları

```
TEST EDİLEBİLİR UNSUR:

1. Başlıklar
├── "Best Free Markdown Editor for Mac" vs
├── "OwnMD: Free Markdown Editor for macOS"
└── "Write Beautiful Markdown on Mac - Free"

2. CTA Butonları
├── "Download Free" vs
├── "Get Started Free" vs
├── "Download for Mac" vs
└── "Try OwnMD Free"

3. Hero Görselleri
├── Screenshot vs
├── GIF (animasyonlu) vs
└── Video preview

4. Feature Card Sıralaması
├── KaTeX ilk vs
├── Mermaid ilk vs
└── Themes ilk

5. Fiyatlandırma Sayfası
├── "$0 Forever" vs
├── "100% Free" vs
└── "No Payment Required"
```

### 7.2 Content Refresh Stratejisi

```
MEVCUT İÇERİK GÖZDEN GEÇİRME:

Her 3 Ayda:
1. Tüm blog yazılarını kontrol et
2. Eski bilgi varsa güncelle
3. Yeni keyword eklemeleri yap
4. Görselleri optimize et
5. Internal links güncelle

Her 6 Ayda:
1. "En İyi Markdown Editörleri" güncelle
2. Karşılaştırma sayfalarını güncelle
3. Rakip bilgilerini yenile
4. İstatistikleri tazele

İçerik Güncelleme Checklist:
□ Başlığı güncelle (yeni tarih belirt)
□ Yayın tarihini güncelle
□ Eski screenshot'ları yenile
□ Artık doğru olmayan bilgileri düzelt
□ Yeni bulguları ekle
□ Internal links kontrol et
□ Meta description güncelle
□ Schema güncelle (Article dateModified)
```

---

## 8. SEO Takvim

### 8.1 Yıllık Takvim

```
OCAK:
- Yıllık SEO strateji gözden geçirme
- Geçen yılın performans analizi
- Yeni yıl hedefleri belirleme

ŞUBAT:
- Content calendar planning
- Rakip analizi güncelleme
- Yeni keyword araştırması

MART:
- Q1 backlink campaign
- Yeni içerik serisi başlatma
- Spring cleaning (eski içerik güncelleme)

NİSAN:
- Q1 raporu
- Core Web Vitals optimizasyonu
- Yarıyıl hedef kontrolü

MAYIS:
- Yeni özellik lansmanı (varsa)
- Press outreach
- Webinar veya online etkinlik

HAZİRAN:
- Yarı yıl performansı
- A/B test sonuçları değerlendirme
- Strateji ayarlaması

TEMMUZ:
- Q2 backlink campaign
- Yaz içerikleri (daha hafif konular)
- Tatil teması (opsiyonel)

AĞUSTOS:
- Rakip monitoring (yoğun dönem)
- Backlink recovery
- Teknik SEO audit

EYLÜL:
- Q3 backlink campaign
- Eğitim içerikleri (OKUL dönemi)
- Back to school teması

EKİM:
- Q3 raporu
- Karşılaştırma içerikleri güncelleme
- Yeniden yapılanma hazırlığı

KASIM:
- Black Friday/Cyber Monday (varsa kampanya)
- Yıl sonu hazırlığı
- 2027 stratejisi planlama

ARALIK:
- Yıl sonu raporu
- Başarı hikayeleri paylaşımı
- 2027 hedefleri kesinleştirme
```

### 8.2 Haftalık SEO Zaman Çizelgesi

```
PAZARTESİ:
- Haftalık rapor inceleme
- Google Search Console hata kontrolü
- Hafta hedeflerini belirleme

SALI:
- Yeni içerik yazımı / editing
- Guest post outreach

ÇARŞAMBA:
- İçerik optimizasyonu (mevcut sayfalar)
- Internal linking

PERŞEMBE:
- Outreach takibi
- Sosyal medya paylaşımları
- Community engagement (Reddit, forums)

CUMA:
- Backlink monitoring
- Haftalık wrap-up
- Sonraki hafta hazırlığı
```

---

## 9. Tools ve Otomasyon

### 9.1 Otomasyon Fırsatları

```
OTOMATİK YAPILABİLECEKLER:
1. Google Search Console → Google Sheets'e export (haftalık)
2. Rank tracking → Otomatik spreadsheet güncelleme
3. Backlink monitoring → Otomatik alert
4. Site audit → Aylık scheduled crawl
5. Broken link check → Haftalık otomatik
6. Social sharing → Scheduled posts
7. Email alerts → Critical SEO issues
```

### 9.2 Recommended Tool Stack

```
TAM STACK (SEO):
├── Analytics: GA4 + GTM
├── Search Console: GSC API
├── Backlinks: Ahrefs OR Moz OR SEMrush
├── Technical: Screaming Frog OR Sitebulb
├── Rank Tracking: Ahrefs OR SEMrush
├── Content: Clearscope OR Surfer SEO
└── Reporting: Data Studio OR Looker Studio

BAŞLANGIÇ STACK (Ücretsiz ağırlıklı):
├── Analytics: GA4 (ücretsiz)
├── Search Console: GSC (ücretsiz)
├── Backlinks: Ahrefs WT (ücretsiz) + Google Alerts
├── Technical: PageSpeed Insights + Chrome DevTools
├── Rank Tracking: Ubersuggest (limitli ücretsiz)
└── Reporting: Google Sheets + Data Studio
```

---

## 10. Acil Durum Protokolü

### 10.1 Trafik Düşüşü H Protocolü

```
TRAFİK DÜŞÜŞÜ TESPİT EDİLDİĞİNDE:

1. Hemen (0-2 saat):
□ Google Search Console kontrol et
  - Algorithmic penalty var mı?
  - Manuel action var mı?
  - Index hatası var mı?

2. Aynı gün içinde:
□ Analytics'te segmentasyon kontrol et
  - Sadece organic mi düşüş var?
  - Belirli sayfalar mı etkilenmiş?
  - Coğrafi bir örüntü var mı?

3. 48 saat içinde:
□ Rakip trafiğini kontrol et
  - Genel bir düşüş mü (tüm sektör mü)?
  - Sadece kendi sitemiz mi etkilenmiş?
□ Son değişiklikleri kontrol et
  - Yeni içerik yayınlandı mı?
  - Teknik değişiklik yapıldı mı?
  - URL değişikliği oldu mu?

4. Düzeltme:
□ Sorun tespit edildiyse hemen düzelt
□ Reconsideration request (gerekirse)
□ İçerik kalitesini artır
□ Backlink profile iyileştir
```

### 10.2 Manuel Spam Bildirimi

```
MANUEL SPAM BİLDİRİM ALINIRSA:

1. Durumu değerlendir:
□ Bildirimin geçerli olup olmadığını kontrol et
□ Hangi sayfanın/bağlantının spam olarak işaretlendiğini bul

2. Eğer haklıysa:
□ Spam içeriği kaldır
□ Google'a reconsideration request gönder
□ 30-60 gün bekle

3. Eğer haksızsa:
□ Reddedildiğini kanıtla
□ Documentation hazırla
□ Reconsideration request gönder

4. Önleme:
□ Guest post guidelines oluştur
□ User-generated content moderasyonu
□ Backlink profili düzenli kontrol
```

---

## 11. Sonraki Adımlar

### 11.1 Bu Hafta

1. [ ] Google Search Console kurulumu yap
2. [ ] Google Analytics 4 kurulumu yap
3. [ ] İlk dashboard/report şablonu oluştur
4. [ ] Google Alerts kur (OwnMD, markdown editor mac, vb.)

### 11.2 Bu Ay

1. [ ] Raporlama sistemini otomatikleştir
2. [ ] Core Web Vitals benchmark al
3. [ ] Rakip analizi tamamla
4. [ ] İlk tam site audit yap

### 11.3 Sürekli

1. [ ] Haftalık raporları incele
2. [ ] Aylık kapsamlı analiz yap
3. [ ] Trendleri takip et
4. [ ] Stratejiyi güncelleştir
