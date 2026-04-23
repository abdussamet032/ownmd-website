let currentTheme = 'light';
let sidebarCollapsed = false;
let searchDebounceTimer = null;

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
let currentFilePath = null;

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

function showError(message) {
  if (content) {
    content.innerHTML = `<div class="error">${sanitizeHtml(message)}</div>`;
  } else {
    console.error(message);
  }
}

async function initTheme() {
  try {
    const result = await getOwnmdApi().getTheme();
    if (!document.body.hasAttribute('data-theme')) {
      currentTheme = result.theme || 'light';
    }
  } catch (err) {
    console.error('Failed to load theme:', err);
  }

  applyTheme();
}

function applyTheme() {
  document.body.setAttribute('data-theme', currentTheme);
  themeToggle.textContent = currentTheme === 'light' ? '☀️' : '🌙';
  themeToggle.setAttribute(
    'aria-label',
    currentTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
  );
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

  // Highlight search term if provided
  if (highlightQuery) {
    highlightSearchTerm(highlightQuery);
  }

  // Update bookmark state
  await updateBookmarkState();
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

    renderSearchResults(result.results || []);
  } catch (err) {
    showError(`Search error: ${err.message}`);
  }
}

function renderSearchResults(results) {
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

function bindEvents() {
  folderBtn.addEventListener('click', selectFolder);

  themeToggle.addEventListener('click', async () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();

    try {
      await getOwnmdApi().setTheme(currentTheme);
    } catch (err) {
      showError(`Cannot save theme: ${err.message}`);
    }
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
}

function init() {
  content = document.getElementById('content');
  fileList = document.getElementById('fileList');
  currentPath = document.getElementById('currentPath');
  themeToggle = document.getElementById('themeToggle');
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
  recentFoldersContainer = document.getElementById('recentFoldersContainer');

  console.log('[OwnMD renderer] DOM elements bound:', {
    content: !!content,
    fileList: !!fileList,
    folderBtn: !!folderBtn,
    themeToggle: !!themeToggle
  });

  console.log('[OwnMD renderer] window.ownmd available:', typeof window.ownmd);

  bindEvents();
  initTheme();
  loadBookmarks();
  loadRecentFolders();
}

document.addEventListener('DOMContentLoaded', init);