# OwnMD Markdown Editor for macOS

OwnMD is an Electron-based desktop markdown editor focused on fast writing, live preview, and practical publishing workflows. It combines file management, split-pane editing, KaTeX math rendering, Mermaid diagram support, front matter parsing, and export tools for writers, developers, students, and technical teams working with Markdown.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-macOS-111827)
![Languages](https://img.shields.io/badge/interface-8%20languages-2563EB)

## Why OwnMD

OwnMD is built for people who want a clean desktop markdown editor without giving up modern markdown extensions or developer-friendly workflows. It supports structured note-taking, technical writing, developer documentation, and diagram-rich documents in a compact Electron app.

## Features

- Desktop markdown editor with file management for creating, opening, saving, renaming, and deleting Markdown files
- Split-pane markdown editor and live preview layout for writing and reviewing documents side by side
- KaTeX and LaTeX math support for inline and block equations in Markdown
- Mermaid diagram support for flowcharts, sequence diagrams, and other technical diagrams
- Front Matter YAML parsing for metadata-driven Markdown documents
- Export Markdown documents to HTML, PDF, DOCX, and ODT formats
- Syntax highlighting for JavaScript, Python, C, C++, Java, Rust, Go, and TypeScript
- Activity bar, tabs, toolbar, and sidebar navigation for faster desktop editing workflows
- 5 themes: Light, Dark, Sepia, High Contrast, and System
- Multi-language interface: English, Turkish, German, Spanish, French, Japanese, Portuguese, Chinese
- Built with Electron for a native-feeling macOS Markdown editor experience

## Supported Languages

### Interface Languages
OwnMD supports 8 interface languages:
English, Turkish, German, Spanish, French, Japanese, Portuguese, Chinese

### Programming Languages (Syntax Highlighting)
JavaScript, Python, C, C++, Java, Rust, Go, TypeScript

## Markdown Extensions

| Extension | Support |
| --- | --- |
| Standard Markdown | Yes |
| KaTeX / LaTeX Math | Yes |
| Mermaid Diagrams | Yes |
| Front Matter YAML | Yes |
| Live Preview | Yes |
| Split Editor / Preview | Yes |
| Syntax Highlighting | Yes |

## Comparison

| Editor | Best For | File Management | Math / LaTeX | Diagrams | Export Options | Price |
| --- | --- | --- | --- | --- | --- | --- |
| **OwnMD** | Desktop Markdown editing with math, diagrams, and export | Built-in | Built-in KaTeX | Built-in Mermaid | HTML, PDF, DOCX, ODT | Free & Open Source |
| Typora | Minimal writing-first editing | Good | Good | Limited | Strong export | $89 |
| Obsidian | Knowledge base and graph-style notes | Strong vault | Plugin-based | Plugin-based | Plugin-dependent | Free/$8/mo |
| VS Code + extensions | Developer-centric editing | Strong | Extension-based | Extension-based | Extension-based | Free |
| MacDown | Lightweight basic editing | Basic | Limited | No | Basic | Free |

## Installation

### macOS

```bash
git clone https://github.com/kendikralligim/ownmd.git
cd ownmd
npm install
npm start
```

To build the packaged macOS app:

```bash
npm run build
```

### From Download

Download the latest macOS release from our website: https://ownmd.com/download

## Tech Stack

- Electron
- Marked (Markdown parsing)
- KaTeX (Math rendering)
- Mermaid (Diagrams)
- gray-matter (Front matter)
- DOMPurify (HTML sanitization)

## Project Structure

```
src/
├── main/           # Electron main process
├── renderer/       # Renderer process (UI)
└── renderer/vendor/ # Third-party libraries
website/           # Landing page
docs/              # Documentation
```

## Contributing

Contributions are welcome for editor improvements, export enhancements, UI polish, bug fixes, and documentation.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm start`
5. Open a pull request with a clear summary

## License

MIT License - see LICENSE file for details.

## Links

- [Website](https://ownmd.com)
- [Download](https://ownmd.com/download)
- [Documentation](https://ownmd.com/docs)
- [GitHub Repository](https://github.com/kendikralligim/ownmd)
- [Report a Bug](https://github.com/kendikralligim/ownmd/issues)
