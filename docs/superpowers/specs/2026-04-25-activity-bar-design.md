# Activity Bar Design

## Overview

Replace the toolbar sidebar toggle button with a VS Code-style activity bar on the far left edge. The activity bar provides independent toggles for Files and Outline panels.

## Current State

- Files sidebar toggle: toolbar'daki `◀`/`▶` butonu (kullanıcıya göre kötü görünüyor)
- Outline panel: her zaman açık, toggle butonu yok

## Design

### Activity Bar

- **Konum:** Ana layout'un en solunda, sidebar'in solunda
- **Genislik:** 40px
- **Icerik:** 2 ikon butonu (dikey olarak ortalanmis)
  - Files ikonu (dosya agaci) → sol sidebar'i acar/kapar
  - Outline ikonu (liste/baslik) → sag outline panelini acar/kapar

### Ikonlar

- Files: basit dosya agaci SVG ikonu
- Outline: basit liste/hierarchy SVG ikonu
- Aktif ikon: accent renk ile vurgulanir
- Hover: hafif background degisimi

### Davranis

- Her ikon bagimsiz toggle yapar
- Ikon tiklandiginda:
  - Eger panel aciksa → kapat (ikon inactive olur)
  - Eger panel kapaliysa → ac (ikon active olur)
- Dosya yuklendiginde Outline otomatik guncellenir (mevcut davranis korunur)

### Layout Degisiklikleri

```
+--+--------+--------------------+--------+
|AB| Sidebar |     Workspace      | Outline|
|  | (Files) |                    |        |
+--+--------+--------------------+--------+
```

- Activity bar en solda
- Sidebar activity bar'in saginda
- Workspace ortada
- Outline sagda

### Kaldirilan Elementler

- Toolbar'daki `◀`/`▶` collapse butonu kaldirilir
- `collapseBtn` elementi ve ilgili JS kodu temizlenir

### Focus Mode

- Focus mode aktif oldugunda activity bar da gizlenir

## Files Affected

- `src/renderer/index.html` - Activity bar HTML eklenecek, collapseBtn kaldirilacak
- `src/renderer/styles.css` - Activity bar stilleri, layout guncellemesi
- `src/renderer/renderer.js` - Toggle mantigi guncellenecek, collapseBtn referanslari kaldirilacak
