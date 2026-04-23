let currentTheme = 'system';
let sidebarCollapsed = false;
let searchDebounceTimer = null;

let settings = { fontFamily: 'system', fontSize: 16, lineHeight: 1.6 };

let state = {
  focusMode: false,
  sidebarCollapsed: false,
  typewriterMode: false,
  viewMode: 'preview',
  currentMarkdown: '',
  currentFrontMatter: {},
  currentRawMarkdown: ''
};

let content = null;
let fileList = null;
let currentPath = null;
let themeToggle = null;
let collapseBtn = null;
let sidebar = null;
let folderBtn = null;
let searchInput = null;
let searchResults = null;
let bookmarkBtn = null;
let favoritesList = null;
let outlinePanel = null;
let outlineList = null;
let recentFoldersBtn = null;
let recentDropdown = null;
let recentFoldersContainer = null;
let currentFilePath = null;
let exportBtn = null;
let exportDropdown = null;
let toastTimeout = null;
let themeSelect = null;
let settingsBtn = null;
let settingsPanel = null;
let fontFamilySelect = null;
let fontSizeInput = null;
let fontSizeValue = null;
let lineHeightInput = null;
let fullscreenBtn = null;
let dropOverlay = null;

function getOwnmdApi() {
  if (!window.ownmd) {
    const availableOwnGlobals = Object.keys(window)
      .filter(key => key.toLowerCase().includes('own'))
      .sort();

    console.error('OwnMD preload API is unavailable', {
      availableOwnGlobals,
      contextIsolated: typeof window.require !== 'function'
    });

    throw new Error('OwnMD preload API is unavailable');
  }

  return window.ownmd;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function sanitizeHtml(value) {
  if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
    return window.DOMPurify.sanitize(value);
  }

  return escapeHtml(value);
}

// Initialize mermaid
window.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

// Marked extensions for math and diagrams
const blockMathExtension = {
  name: 'blockMath', level: 'block',
  start(src) { return src.indexOf('$$'); },
  tokenizer(src) {
    const m = src.match(/^\$\$(.+?)\$\$$/);
    return m ? { type: 'blockMath', raw: m[0], math: m[1] } : undefined;
  },
  renderer(token) {
    try {
      return window.katex.renderToString(token.math, { displayMode: true });
    } catch (e) {
      return `<div class="math-error">${escapeHtml(e.message)}</div>`;
    }
  }
};

const inlineMathExtension = {
  name: 'inlineMath', level: 'inline',
  start(src) { return src.indexOf('$'); },
  tokenizer(src) {
    const m = src.match(/^\$(.+?)\$/);
    return m ? { type: 'inlineMath', raw: m[0], math: m[1] } : undefined;
  },
  renderer(token) {
    try {
      return window.katex.renderToString(token.math, { displayMode: false });
    } catch (e) {
      return `<span class="math-error">${escapeHtml(e.message)}</span>`;
    }
  }
};

const mermaidExtension = {
  name: 'mermaid', level: 'block',
  start(src) { return src.indexOf('```mermaid'); },
  tokenizer(src) {
    const m = src.match(/^```mermaid\n([\s\S]+?)```/);
    return m ? { type: 'mermaid', raw: m[0], code: m[1] } : undefined;
  },
  renderer(token) {
    const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
    return `<div class="mermaid-source" data-id="${id}"><pre><code>${escapeHtml(token.code)}</code></pre></div>`;
  }
};

window.marked.use({ extensions: [blockMathExtension, inlineMathExtension, mermaidExtension] });

async function renderMermaidDiagrams() {
  const mermaidSources = document.querySelectorAll('.mermaid-source');
  for (const el of mermaidSources) {
    const code = el.querySelector('code').textContent;
    const existingSvg = el.querySelector('svg');
    // Re-render with new id if theme changed (existing SVG present)
    // or first render (no existing SVG)
    const id = existingSvg
      ? 'mermaid-' + Math.random().toString(36).substr(2, 9)
      : el.dataset.id;
    try {
      const { svg } = await window.mermaid.render(id, code);
      const cleanSvg = sanitizeHtml(svg);
      el.innerHTML = cleanSvg;
      el.dataset.id = id;
    } catch (e) {
      el.innerHTML = `<div class="mermaid-error">${escapeHtml(e.message)}</div>`;
    }
  }
}

function renderFrontMatter(data) {
  const panel = document.getElementById('frontMatterPanel');
  const list = document.getElementById('frontMatterList');
  const keys = Object.keys(data);
  if (!keys.length) { panel.classList.add('hidden'); return; }
  panel.classList.remove('hidden');
  list.innerHTML = '';
  keys.forEach(key => {
    const dt = document.createElement('dt');
    dt.textContent = key;
    const dd = document.createElement('dd');
    const value = data[key];
    dd.textContent = Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value);
    list.appendChild(dt);
    list.appendChild(dd);
  });
}

function showError(message) {
  if (content) {
    content.innerHTML = `<div class="error">${sanitizeHtml(message)}</div>`;
  } else {
    console.error(message);
  }
}

function showToast(message, type = 'success') {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  toastTimeout = setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function initTheme() {
  try {
    const result = await getOwnmdApi().getTheme();
    if (!document.body.hasAttribute('data-theme')) {
      currentTheme = result.theme || 'system';
    }
  } catch (err) {
    console.error('Failed to load theme:', err);
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') applyTheme();
  });

  applyTheme();
}

function resolveTheme(theme) {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function applyTheme() {
  const resolvedTheme = resolveTheme(currentTheme);
  document.body.setAttribute('data-theme', resolvedTheme);
}

function applySettings() {
  // Apply font family
  document.body.classList.remove('font-serif', 'font-sans');
  if (settings.fontFamily === 'serif') {
    document.body.classList.add('font-serif');
  } else if (settings.fontFamily === 'sans') {
    document.body.classList.add('font-sans');
  }

  // Apply font size and line height via CSS variables
  document.documentElement.style.setProperty('--reader-font-size', settings.fontSize + 'px');
  document.documentElement.style.setProperty('--reader-line-height', settings.lineHeight);
}

async function selectFolder() {
  let result;

  try {
    result = await getOwnmdApi().selectFolder();
  } catch (err) {
    showError(`Cannot open folder dialog: ${err.message}`);
    return;
  }

  if (!result.success) {
    showError(result.error);
    return;
  }

  currentPath.textContent = result.folderPath;
  renderFileList(result.files);
  await loadBookmarks();
  await updateBookmarkState();
  buildOutline([]);
}

function renderFileList(files) {
  fileList.innerHTML = '';

  files.forEach(file => {
    const el = document.createElement('div');
    el.className = `file-item ${file.isFolder ? 'folder' : 'file'}`;
    el.textContent = file.name;
    el.addEventListener('click', () => {
      if (!file.isFolder) {
        return loadFile(file.path);
      }

      return null;
    });
    fileList.appendChild(el);
  });
}

async function loadFile(filePath, highlightQuery = null) {
  currentFilePath = filePath;

  let result;

  try {
    result = await getOwnmdApi().readFile(filePath);
  } catch (err) {
    showError(`Cannot read file: ${err.message}`);
    return;
  }

  if (!result.success) {
    showError(result.error);
    return;
  }

  // Store raw markdown for split view
  state.currentMarkdown = result.content;
  state.currentRawMarkdown = result.rawContent || result.content;
  state.currentFrontMatter = result.frontMatter || {};
  state.currentFilePath = filePath;

  // Update source editor
  const sourceEditor = document.getElementById('sourceEditor');
  if (sourceEditor) {
    sourceEditor.value = state.currentRawMarkdown;
  }

  // Render front matter
  renderFrontMatter(state.currentFrontMatter);

  const headings = extractHeadings(result.content);
  const html = window.marked.parse(result.content, { gfm: true, breaks: false });
  const cleanHtml = sanitizeHtml(html);

  // Create a temporary container to manipulate headings
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanHtml;

  // Assign IDs to headings
  headings.forEach((heading, i) => {
    const slug = slugify(heading.text);
    const els = tempDiv.querySelectorAll(`h${heading.level}`);
    if (els[i]) {
      els[i].id = slug;
    }
  });

  content.innerHTML = tempDiv.innerHTML;

  // Build outline
  buildOutline(headings);

  // Render mermaid diagrams
  renderMermaidDiagrams();

  // Highlight search term if provided
  if (highlightQuery) {
    highlightSearchTerm(highlightQuery);
  }

  // Update bookmark state
  await updateBookmarkState();

  // Update export button states
  updateExportButtons();
}

function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({ level: match[1].length, text: match[2] });
    }
  }
  return headings;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w]+/g, '-');
}

function buildOutline(headings) {
  outlineList.innerHTML = '';

  if (!headings || headings.length === 0) {
    return;
  }

  headings.forEach((heading, i) => {
    const slug = slugify(heading.text);
    const el = document.createElement('a');
    el.className = `outline-item outline-level-${heading.level}`;
    el.textContent = heading.text;
    el.href = `#${slug}`;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetEl = document.getElementById(slug);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
    outlineList.appendChild(el);
  });

  setupOutlineObserver();
}

let outlineObserver = null;

function setupOutlineObserver() {
  if (outlineObserver) {
    outlineObserver.disconnect();
  }

  const headingElements = content.querySelectorAll('h1, h2, h3');
  if (headingElements.length === 0) return;

  outlineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove active class from all
        outlineList.querySelectorAll('.outline-item').forEach(item => {
          item.classList.remove('active');
        });
        // Add active class to current
        const activeItem = outlineList.querySelector(`a[href="#${entry.target.id}"]`);
        if (activeItem) {
          activeItem.classList.add('active');
        }
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px'
  });

  headingElements.forEach(el => {
    if (el.id) {
      outlineObserver.observe(el);
    }
  });
}

function highlightSearchTerm(query) {
  if (!query || !query.trim()) return;

  const searchText = query.trim().toLowerCase();
  const walker = document.createTreeWalker(
    content,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const nodesToReplace = [];
  let node;

  while (node = walker.nextNode()) {
    if (node.nodeValue.toLowerCase().includes(searchText)) {
      nodesToReplace.push(node);
    }
  }

  nodesToReplace.forEach(originalNode => {
    const parent = originalNode.parentNode;
    if (!parent || parent.classList.contains('search-hit')) return;

    const text = originalNode.nodeValue;
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(searchText);

    if (index !== -1) {
      const before = text.substring(0, index);
      const match = text.substring(index, index + searchText.length);
      const after = text.substring(index + searchText.length);

      const fragment = document.createDocumentFragment();
      if (before) fragment.appendChild(document.createTextNode(before));

      const mark = document.createElement('mark');
      mark.className = 'search-hit';
      mark.textContent = match;
      fragment.appendChild(mark);

      if (after) fragment.appendChild(document.createTextNode(after));

      parent.replaceChild(fragment, originalNode);
    }
  });
}

async function performSearch(query) {
  if (!query || !query.trim()) {
    searchResults.classList.add('hidden');
    return;
  }

  try {
    const result = await getOwnmdApi().searchFiles(query);
    if (!result.success) {
      showError(result.error || 'Search failed');
      return;
    }

    renderSearchResults(result.results || [], query);
  } catch (err) {
    showError(`Search error: ${err.message}`);
  }
}

function renderSearchResults(results, query) {
  searchResults.innerHTML = '';

  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-no-results">No matches found</div>';
    searchResults.classList.remove('hidden');
    return;
  }

  results.forEach(result => {
    const resultEl = document.createElement('div');
    resultEl.className = 'search-result';

    const fileNameEl = document.createElement('div');
    fileNameEl.className = 'search-result-file';
    fileNameEl.textContent = result.fileName;
    resultEl.appendChild(fileNameEl);

    result.matches.forEach(match => {
      const matchEl = document.createElement('div');
      matchEl.className = 'search-match';
      matchEl.innerHTML = `<span class="search-line-num">${match.lineNumber}:</span> ${escapeHtml(match.line)}`;
      matchEl.addEventListener('click', () => {
        loadFile(result.filePath, query);
        searchResults.classList.add('hidden');
      });
      resultEl.appendChild(matchEl);
    });

    searchResults.appendChild(resultEl);
  });

  searchResults.classList.remove('hidden');
}

async function loadBookmarks() {
  try {
    const bookmarks = await getOwnmdApi().getBookmarks();
    renderFavorites(bookmarks || []);
  } catch (err) {
    console.error('Failed to load bookmarks:', err);
  }
}

function renderFavorites(bookmarks) {
  favoritesList.innerHTML = '';

  if (!bookmarks || bookmarks.length === 0) {
    favoritesList.style.display = 'none';
    return;
  }

  favoritesList.style.display = 'block';
  bookmarks.forEach(bookmark => {
    const el = document.createElement('div');
    el.className = 'file-item favorite';
    el.textContent = bookmark.fileName;
    el.addEventListener('click', () => {
      loadFile(bookmark.filePath);
    });
    favoritesList.appendChild(el);
  });
}

async function updateBookmarkState() {
  if (!currentFilePath) {
    bookmarkBtn.textContent = '☆';
    bookmarkBtn.classList.remove('bookmarked');
    return;
  }

  try {
    const bookmarks = await getOwnmdApi().getBookmarks();
    const isBookmarked = bookmarks && bookmarks.some(b => b.filePath === currentFilePath);
    bookmarkBtn.textContent = isBookmarked ? '★' : '☆';
    bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
  } catch (err) {
    console.error('Failed to update bookmark state:', err);
  }
}

async function toggleBookmark() {
  if (!currentFilePath) return;

  try {
    const fileName = currentFilePath.split('/').pop();
    const result = await getOwnmdApi().toggleBookmark(currentFilePath, fileName);
    await updateBookmarkState();
    await loadBookmarks();
  } catch (err) {
    showError(`Cannot toggle bookmark: ${err.message}`);
  }
}

function updateExportButtons() {
  const hasFile = !!currentFilePath;
  const pdfBtn = document.getElementById('exportPdf');
  const htmlBtn = document.getElementById('exportHtml');
  const mdBtn = document.getElementById('exportMd');
  if (pdfBtn) pdfBtn.disabled = !hasFile;
  if (htmlBtn) htmlBtn.disabled = !hasFile;
  if (mdBtn) mdBtn.disabled = !hasFile;
}

async function exportToPdf() {
  if (!currentFilePath) return;

  const fileName = currentFilePath.split('/').pop();
  const html = content.innerHTML;

  try {
    const result = await getOwnmdApi().exportPdf({
      html,
      fileName,
      theme: currentTheme
    });
    if (result.success) {
      showToast('PDF exported successfully');
    } else if (result.error !== 'Canceled') {
      showToast('Failed to export PDF: ' + result.error, 'error');
    }
  } catch (err) {
    showToast('Failed to export PDF', 'error');
  }
}

async function exportToHtml() {
  if (!currentFilePath) return;

  const fileName = currentFilePath.split('/').pop();
  const html = content.innerHTML;

  try {
    const result = await getOwnmdApi().exportHtml({
      html,
      fileName
    });
    if (result.success) {
      showToast('HTML exported successfully');
    }
  } catch (err) {
    showToast('Failed to export HTML', 'error');
  }
}

async function exportToMarkdown() {
  if (!currentFilePath) return;

  try {
    const result = await getOwnmdApi().exportMarkdown(currentFilePath);
    if (result.success) {
      showToast('Markdown exported successfully');
    } else if (result.error !== 'Canceled') {
      showToast('Failed to export Markdown: ' + result.error, 'error');
    }
  } catch (err) {
    showToast('Failed to export Markdown', 'error');
  }
}

async function loadRecentFolders() {
  try {
    const folders = await getOwnmdApi().getRecentFolders();
    renderRecentFolders(folders || []);
  } catch (err) {
    console.error('Failed to load recent folders:', err);
  }
}

function renderRecentFolders(folders) {
  recentDropdown.innerHTML = '';

  if (!folders || folders.length === 0) {
    recentDropdown.innerHTML = '<div class="recent-empty">No recent folders</div>';
    return;
  }

  folders.forEach(folderPath => {
    const folderName = folderPath.split('/').pop();
    const el = document.createElement('div');
    el.className = 'recent-item';
    el.textContent = folderName;
    el.title = folderPath;
    el.addEventListener('click', () => openRecentFolder(folderPath));
    recentDropdown.appendChild(el);
  });
}

async function openRecentFolder(folderPath) {
  try {
    const result = await getOwnmdApi().openRecentFolder(folderPath);
    if (!result.success) {
      showError(result.error || 'Cannot open folder');
      return;
    }

    currentPath.textContent = result.folderPath;
    renderFileList(result.files);
    await loadBookmarks();
    recentDropdown.classList.add('hidden');
  } catch (err) {
    showError(`Cannot open recent folder: ${err.message}`);
  }
}

// Keyboard shortcuts
const SHORTCUTS = {
  'Cmd+O': () => selectFolder(),
  'Cmd+F': () => searchInput?.focus(),
  'Cmd+B': () => toggleSidebar(),
  'Cmd+Shift+F': () => setFocusMode(!state.focusMode),
  'Cmd+1': () => setViewMode('preview'),
  'Cmd+2': () => setViewMode('source'),
  'Cmd+3': () => setViewMode('split'),
  'Cmd+E': () => toggleExportMenu(),
  'Ctrl+Cmd+F': () => getOwnmdApi().toggleFullscreen()
};

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  sidebar.classList.toggle('collapsed', sidebarCollapsed);
  collapseBtn.textContent = sidebarCollapsed ? '▶' : '◀';
}

function toggleExportMenu() {
  exportDropdown.classList.toggle('hidden');
}

// Debounce utility
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Focus Mode
function setFocusMode(enabled) {
  state.focusMode = enabled;
  document.body.classList.toggle('focus-mode', enabled);
  // Hide sidebar and outline
  sidebar.classList.toggle('hidden', enabled);
  const outline = document.getElementById('outlinePanel');
  if (outline) outline.classList.toggle('hidden', enabled);
  // Center content
  const content = document.getElementById('content');
  content.classList.toggle('focused', enabled);

  // Persist to electron-store
  try {
    getOwnmdApi().setFocusMode(enabled);
  } catch (err) {
    console.error('Failed to persist focus mode:', err);
  }
}

// View Mode (Split View)
function setViewMode(mode) {
  state.viewMode = mode;
  const workspace = document.getElementById('workspace');
  const sourceEditor = document.getElementById('sourceEditor');
  const content = document.getElementById('content');

  workspace.classList.remove('preview-only', 'source-only', 'split');
  sourceEditor.classList.remove('hidden');
  content.classList.remove('hidden');

  if (mode === 'preview') {
    workspace.classList.add('preview-only');
    sourceEditor.classList.add('hidden');
  } else if (mode === 'source') {
    workspace.classList.add('source-only');
    content.classList.add('hidden');
  } else {
    workspace.classList.add('split');
  }

  // Update button states
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

// Typewriter Mode - center active line
function centerActiveLine(textarea) {
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
  const cursorPosition = textarea.selectionStart;
  const textBeforeCursor = textarea.value.substring(0, cursorPosition);
  const currentLine = textBeforeCursor.split('\n').length - 1;
  const scrollTop = textarea.scrollTop;
  const visibleHeight = textarea.clientHeight;
  const lineTop = currentLine * lineHeight;
  const targetScroll = lineTop - (visibleHeight / 2) + lineHeight;
  textarea.scrollTop = Math.max(0, targetScroll);
}

function bindEvents() {
  recentFoldersContainer = document.getElementById('recentFoldersContainer');

  folderBtn.addEventListener('click', selectFolder);

  // Theme select
  themeSelect.addEventListener('change', async () => {
    currentTheme = themeSelect.value;
    applyTheme();
    try {
      await getOwnmdApi().setTheme(currentTheme);
    } catch (err) {
      showError(`Cannot save theme: ${err.message}`);
    }
    renderMermaidDiagrams();
  });

  collapseBtn.addEventListener('click', () => {
    sidebarCollapsed = !sidebarCollapsed;
    sidebar.classList.toggle('collapsed', sidebarCollapsed);
    collapseBtn.textContent = sidebarCollapsed ? '▶' : '◀';
  });

  // Search with debounce
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    const query = searchInput.value;
    if (!query.trim()) {
      searchResults.classList.add('hidden');
      return;
    }
    searchDebounceTimer = setTimeout(() => {
      performSearch(query);
    }, 200);
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });

  // Bookmark toggle
  bookmarkBtn.addEventListener('click', toggleBookmark);

  // Recent folders dropdown
  recentFoldersBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    recentDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!recentFoldersContainer.contains(e.target)) {
      recentDropdown.classList.add('hidden');
    }
  });

  // Export dropdown toggle
  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportDropdown.classList.toggle('hidden');
  });

  // Export options
  document.getElementById('exportPdf').addEventListener('click', () => {
    exportDropdown.classList.add('hidden');
    exportToPdf();
  });

  document.getElementById('exportHtml').addEventListener('click', () => {
    exportDropdown.classList.add('hidden');
    exportToHtml();
  });

  document.getElementById('exportMd').addEventListener('click', () => {
    exportDropdown.classList.add('hidden');
    exportToMarkdown();
  });

  // Close export dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!exportBtn.contains(e.target) && !exportDropdown.contains(e.target)) {
      exportDropdown.classList.add('hidden');
    }
  });

  // Focus mode button
  document.getElementById('focusModeBtn').addEventListener('click', () => {
    setFocusMode(!state.focusMode);
  });

  // Typewriter mode button
  document.getElementById('typewriterBtn').addEventListener('click', () => {
    state.typewriterMode = !state.typewriterMode;
    document.body.classList.toggle('typewriter-mode', state.typewriterMode);
    try {
      getOwnmdApi().setTypewriterMode(state.typewriterMode);
    } catch (err) {
      console.error('Failed to persist typewriter mode:', err);
    }
  });

  // View mode buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setViewMode(btn.dataset.mode);
    });
  });

  // Settings panel toggle
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
  });

  // Font family change
  fontFamilySelect.addEventListener('change', async () => {
    settings.fontFamily = fontFamilySelect.value;
    applySettings();
    try {
      await getOwnmdApi().setSettings(settings);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  });

  // Font size change
  fontSizeInput.addEventListener('input', async () => {
    settings.fontSize = parseInt(fontSizeInput.value);
    fontSizeValue.textContent = settings.fontSize + 'px';
    applySettings();
    try {
      await getOwnmdApi().setSettings(settings);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  });

  // Line height change
  lineHeightInput.addEventListener('input', async () => {
    settings.lineHeight = parseFloat(lineHeightInput.value);
    applySettings();
    try {
      await getOwnmdApi().setSettings(settings);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  });

  // Fullscreen button
  fullscreenBtn.addEventListener('click', async () => {
    try {
      await getOwnmdApi().toggleFullscreen();
    } catch (err) {
      console.error('Failed to toggle fullscreen:', err);
    }
  });

  // Drag and drop handlers
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropOverlay.classList.remove('hidden');
  });

  document.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget) dropOverlay.classList.add('hidden');
  });

  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropOverlay.classList.add('hidden');
    const result = await getOwnmdApi().openDroppedPath(e.dataTransfer.files[0].path);
    if (result.success) {
      currentPath.textContent = result.folderPath;
      renderFileList(result.files);
      if (result.fileToOpen) loadFile(result.fileToOpen);
    }
  });

  // Close settings panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsPanel.contains(e.target)) {
      settingsPanel.classList.add('hidden');
    }
  });

  // Source editor input handler for live preview
  const sourceEditor = document.getElementById('sourceEditor');
  sourceEditor.addEventListener('input', debounce(() => {
    if (state.viewMode === 'split' || state.viewMode === 'preview') {
      const markdown = sourceEditor.value;
      state.currentMarkdown = markdown;
      state.currentRawMarkdown = markdown;
      const html = window.marked.parse(markdown, { gfm: true });
      content.innerHTML = sanitizeHtml(html);
      renderMermaidDiagrams();
    }
  }, 150));

  // Typewriter mode cursor tracking
  sourceEditor.addEventListener('input', () => {
    if (state.typewriterMode) centerActiveLine(sourceEditor);
  });
  sourceEditor.addEventListener('selectionchange', () => {
    if (state.typewriterMode) centerActiveLine(sourceEditor);
  });
}

function init() {
  content = document.getElementById('content');
  fileList = document.getElementById('fileList');
  currentPath = document.getElementById('currentPath');
  themeSelect = document.getElementById('themeSelect');
  collapseBtn = document.getElementById('collapseBtn');
  sidebar = document.getElementById('sidebar');
  folderBtn = document.getElementById('folderBtn');
  searchInput = document.getElementById('searchInput');
  searchResults = document.getElementById('searchResults');
  bookmarkBtn = document.getElementById('bookmarkBtn');
  favoritesList = document.getElementById('favoritesList');
  outlinePanel = document.getElementById('outlinePanel');
  outlineList = document.getElementById('outlineList');
  recentFoldersBtn = document.getElementById('recentFoldersBtn');
  recentDropdown = document.getElementById('recentDropdown');
  exportBtn = document.getElementById('exportBtn');
  exportDropdown = document.getElementById('exportDropdown');
  settingsBtn = document.getElementById('settingsBtn');
  settingsPanel = document.getElementById('settingsPanel');
  fontFamilySelect = document.getElementById('fontFamilySelect');
  fontSizeInput = document.getElementById('fontSizeInput');
  fontSizeValue = document.getElementById('fontSizeValue');
  lineHeightInput = document.getElementById('lineHeightInput');
  fullscreenBtn = document.getElementById('fullscreenBtn');
  dropOverlay = document.getElementById('dropOverlay');

  console.log('[OwnMD renderer] DOM elements bound:', {
    content: !!content,
    fileList: !!fileList,
    folderBtn: !!folderBtn,
    themeSelect: !!themeSelect
  });

  console.log('[OwnMD renderer] window.ownmd available:', typeof window.ownmd);

  bindEvents();
  initTheme();
  loadBookmarks();
  loadRecentFolders();
  updateExportButtons();

  // Load persisted focus mode preference
  try {
    const focusResult = getOwnmdApi().getFocusMode();
    if (focusResult && focusResult.focusMode) {
      setFocusMode(true);
    }
  } catch (err) {
    console.error('Failed to load focus mode preference:', err);
  }

  // Load persisted typewriter mode preference
  try {
    const typewriterResult = getOwnmdApi().getTypewriterMode();
    if (typewriterResult && typewriterResult.typewriterMode) {
      state.typewriterMode = true;
      document.body.classList.add('typewriter-mode');
    }
  } catch (err) {
    console.error('Failed to load typewriter mode preference:', err);
  }

  // Load persisted settings
  try {
    const settingsResult = getOwnmdApi().getSettings();
    if (settingsResult) {
      settings = { ...settings, ...settingsResult };
      fontFamilySelect.value = settings.fontFamily;
      fontSizeInput.value = settings.fontSize;
      fontSizeValue.textContent = settings.fontSize + 'px';
      lineHeightInput.value = settings.lineHeight;
      applySettings();
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }

  // Set initial theme select value
  themeSelect.value = currentTheme;

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    const key = ['Cmd', 'Ctrl', 'Shift', e.key].filter(Boolean).join('+');
    if (SHORTCUTS[key]) { e.preventDefault(); SHORTCUTS[key](); }
  });
}

document.addEventListener('DOMContentLoaded', init);