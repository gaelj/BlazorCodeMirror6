# Blazor CodeMirror 6

![codemirror.svg](codemirror.svg)

[CodeMirror 6](https://codemirror.net/) is a wonderful code editor for the browser.

This project wraps it in a Blazor .Net 7 / .Net 8 component, along with many popular use-cases detailed in the official documentation and the user forum, add-ons and themes.

It can be used as a feature-complete Markdown editor.

## Features

### For all languages

- [x] 2-way-binding of the document contents
- [x] setting tab size & indentation unit
- [x] setting a placeholder text
- [x] applying preset [themes](https://github.com/vadimdemedes/thememirror)
- [x] setting ReadOnly and Editable attributes
- [x] applying syntax highlighting and auto-completion for 13 different languages
- [x] manual resizing of the editor (similar to html `textarea`)
- [x] image preview
- [x] custom linting
- [x] insert text at cursor / at position
- [x] allow undo / redo toolbar buttons
- [x] configure which plugins are active at startup
- [x] Show horizontal rule instead of ------
- [x] style Markdown quote lines and paragraphs
- [ ] better highlight markdown inline code and code blocks
- [ ] add increase / decrease selected header (#) level
- [ ] add a toolbar with toolbar button template
- [x] support user mentions, for example @name
- [ ] support soft line wrapping
- [ ] Add a diff viewer
- [ ] Implement cursor tooltips
- [ ] Implement Copilot/AI style suggestions
- [ ] allow setting the [Starting selection](https://codemirror.net/docs/ref/#state.EditorStateConfig.selection)
- [ ] Retrieve keybindings
- [ ] Implement search & replace
- [ ] Highlight edited lines

~~- [ ] Add C# language~~ needs a backend, see [mirrorsharp](https://github.com/ashmind/mirrorsharp)

### For Markdown language

- [x] apply Markdown syntax
- [x] report Markdown syntax at selection(s)
- [x] Resized header text proportional to header #
- [x] keybindings to set text in **bold** (`Ctrl-B`) or *italic* (`Ctrl-I`)
- [x] support emoji
- [ ] customize markdown header sizes
- [ ] support toolbar toggling of checklist items even if checked
- [ ] Implement @user mentions with dropdown list
- [ ] Apply Markdown style to whole words
- [ ] Toggling-off a Markdown style should always select the whole styled text block
- [ ] Add mermaid language highlighting
- [ ] Implement kroki / mermaid preview

## Installation

Currently there is no Nuget package available, but it is planned.

Clone the repository and reference it in the `csproj` file of your own project:

`<ProjectReference Include="..\CodeMirror6\CodeMirror6.csproj" />`

In addition to the dotnet 7 or 8 SDK & runtime, [node.js](https://nodejs.org/) and `npx` (`npm install npx`) are needed.

## Usage

See `Examples.Common/Example.razor`

JS / CSS resources are loaded automatically (nothing to add in `_Host.cshtml` / `index.html`).

Just add `@using CodeMirror6` in `_Imports.razor` or in your razor page / component and use `<CodeMirror6Wrapper />` as in the examples.

If you have npm / rollup errors when building (for example after pulling recent changes), `dotnet clean` will delete the `node_modules` directory. Then run `dotnet build` again.

## Modification

- The javascript-side initialization is in `CodeMirror6/NodeLib/src/index.ts`
- Interop from .Net to JS is in `CodeMirror6/CodeMirrorJsInterop.cs`
- Interop from JS to .Net is in `CodeMirror6/DotNetHelper.cs`
- The blazor component is in `CodeMirror6Wrapper.razor`
- The example component is in `Examples.Common/Example.razor`

> The Node project is automatically built with the .Net project

## Screenshots

![image](https://github.com/gaelj/BlazorCodeMirror6/assets/8884632/141f6b9e-82c4-433a-94d9-a02aba6ac336)
