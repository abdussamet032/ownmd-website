const fs = require('fs');
const path = require('path');

const MAX_DEPTH = 10;
const MAX_FILES = 10000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_SEARCH_RESULTS = 250;
const MAX_MATCHES_PER_FILE = 10;

function scanMarkdownFiles(folderPath, depth = 0) {
  const files = [];

  if (depth > MAX_DEPTH) return files;
  if (files.length >= MAX_FILES) return files;

  try {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      if (files.length >= MAX_FILES) break;

      const fullPath = path.join(folderPath, entry.name);

      // Skip symlinks
      if (entry.isSymbolicLink()) continue;

      if (entry.isDirectory()) {
        files.push({
          name: entry.name,
          path: fullPath,
          isFolder: true
        });
        const subFiles = scanMarkdownFiles(fullPath, depth + 1);
        files.push(...subFiles);
      } else if (entry.name.endsWith('.md')) {
        files.push({
          name: entry.name,
          path: fullPath,
          isFolder: false
        });
      }
    }
  } catch (err) {
    console.error(`Cannot read directory: ${folderPath}`, err);
  }

  return files;
}

function readMarkdownFile(filePath, selectedFolder) {
  // Path validation - file must be inside selected folder
  const resolvedPath = path.resolve(filePath);
  const resolvedFolder = path.resolve(selectedFolder);

  if (!resolvedPath.startsWith(resolvedFolder)) {
    return { success: false, error: 'Access denied: file outside selected folder' };
  }

  // Check file size
  try {
    const stats = fs.statSync(resolvedPath);
    if (stats.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File too large (>10MB)' };
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');
    return { success: true, content };
  } catch (err) {
    return { success: false, error: `Cannot read file: ${err.message}` };
  }
}

function searchMarkdownFiles(query, folderPath) {
  if (!query || !query.trim()) return [];

  const files = scanMarkdownFiles(folderPath);
  const results = [];
  const searchTerm = query.toLowerCase().trim();

  for (const file of files) {
    if (file.isFolder) continue;
    if (results.length >= MAX_SEARCH_RESULTS) break;

    try {
      const resolvedPath = path.resolve(file.path);
      const resolvedFolder = path.resolve(folderPath);

      if (!resolvedPath.startsWith(resolvedFolder)) continue;

      const stats = fs.statSync(resolvedPath);
      if (stats.size > MAX_FILE_SIZE) continue;

      const content = fs.readFileSync(resolvedPath, 'utf-8');
      const lines = content.split('\n');
      const fileMatches = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(searchTerm)) {
          fileMatches.push({
            lineNumber: i + 1,
            line: lines[i].trim()
          });
          if (fileMatches.length >= MAX_MATCHES_PER_FILE) break;
        }
      }

      if (fileMatches.length > 0) {
        results.push({
          filePath: file.path,
          fileName: file.name,
          relativePath: path.relative(folderPath, file.path),
          matches: fileMatches
        });
      }
    } catch (err) {
      // Skip files that can't be read
    }
  }

  return results;
}

module.exports = { scanMarkdownFiles, readMarkdownFile, searchMarkdownFiles };