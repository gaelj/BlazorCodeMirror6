### ✨ Introduce new features

- Allow embedding uploads as data URLs directly in JS (https://github.com/gaelj/BlazorCodeMirror6/issues/118#issuecomment-1947521108)
- Always enable clickable links
- Apply hyperlink decoration to markdown links
- Export code mirror instances and csvToMarkdownTable (#144)

### 🐛 Fix a bug

- Fix broken markdown link decoration when link is bigger than visible range (#145)

### ⚡️ Improve performance

- Hyperlinks: only perform doc.toString() once for all regex matches

### ⬆️ Upgrade dependencies

- Update JS dependencies: @uiw & rollup

### 🔧 Add or update configuration files

- Update actions/checkout@v4.1.1
