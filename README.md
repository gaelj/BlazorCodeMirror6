# Blazor CodeMirror 6

> 🚧 This project is still a work-in-progress 🚧

![codemirror.svg](codemirror.svg)

Blazor CodeMirror 6 brings the power of the [CodeMirror 6](https://codemirror.net/) code editor to Blazor, offering a comprehensive .NET 7 / .NET 8 component. It's tailored for both general and specialized use-cases, supporting a range of languages and Markdown editing.

## Why Blazor CodeMirror 6?

- Seamless Integration: Easily embeddable within Blazor applications.
- Feature-Rich: Extensive support for syntax highlighting, auto-completion, custom linting, themes, and more.
- Versatile: From Markdown editing to collaborative features (*to be implemented*), it's a one-stop solution for various editing needs.

## Features

### General

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
- [ ] add a toolbar with toolbar button template
- [ ] support soft line wrapping
- [ ] support read-only paragraphs
- [ ] Add a diff viewer
- [ ] Implement cursor tooltips
- [ ] Implement Copilot/AI style suggestions
- [ ] allow setting the [Starting selection](https://codemirror.net/docs/ref/#state.EditorStateConfig.selection)
- [ ] Retrieve keybindings
- [ ] Implement search & replace
- [ ] Highlight edited lines
- [ ] Allow toggling console debug mode
- [ ] collaborative editing
- [ ] Add C# language needs a backend, see [mirrorsharp](https://github.com/ashmind/mirrorsharp)
- [ ] voice recognition
- [ ] automatic translation
- [ ] update doc in dotnet either on text changes or on blur / add GetText()
- [ ] deleting a file link deletes the file from the server

### For Markdown language

- [x] apply Markdown syntax
- [x] report Markdown syntax at selection(s)
- [x] Resized header text proportional to header #
- [x] keybindings to set text in **bold** (`Ctrl-B`) or *italic* (`Ctrl-I`)
- [x] support emoji: replace on type
- [x] format lists
- [x] Implement @user mentions with dropdown list
- [x] emojis: view :emoji_codes: in the raw text as the emoji
- [x] emojis: add auto-complete
- [x] Show horizontal rule instead of ------
- [x] style Markdown quote lines and paragraphs
- [x] add increase / decrease selected header (#) level
- [x] format inline html
- [ ] better highlight markdown inline code and code blocks
- [ ] format links, make them clickable
- [ ] use latest header
- [ ] format tables
- [ ] customize markdown header sizes
- [ ] support toolbar toggling of checklist items even if checked
- [ ] Apply Markdown style toggles to whole words
- [ ] Toggling-off a Markdown style should always select the whole styled text block
- [ ] Add mermaid language highlighting
- [ ] Implement kroki / mermaid preview
- [ ] support file upload
- [ ] add color picker extension

## Screenshots

![image](https://github.com/gaelj/BlazorCodeMirror6/assets/8884632/141f6b9e-82c4-433a-94d9-a02aba6ac336)

## Quick Start

Currently there is no Nuget package available, but it is planned.

To get started with Blazor CodeMirror 6:

- Clone the repository: `git clone https://github.com/gaelj/BlazorCodeMirror6.git`
- Reference in your project: `<ProjectReference Include="..\CodeMirror6\CodeMirror6.csproj" />`
- Install [node.js](https://nodejs.org/) and npx: `npm install npx`
- Add `@using CodeMirror6` in your `_Imports.razor` or page/component.
- Use the `<CodeMirror6Wrapper />` component as demonstrated in `Examples.Common/Example.razor`.
- For build issues: `run dotnet clean` followed by `dotnet build`.

## Examples

See `Examples.Common/Example.razor`

JS / CSS resources are loaded automatically (nothing to add in `_Host.cshtml` / `index.html`).

Just add `@using CodeMirror6` in `_Imports.razor` or in your razor page / component and use `<CodeMirror6Wrapper />` as in the examples.

## Modification

- The javascript-side initialization is in `CodeMirror6/NodeLib/src/index.ts`
- Interop from .Net to JS is in `CodeMirror6/CodeMirrorJsInterop.cs`
- Interop from JS to .Net is in `CodeMirror6Wrapper.razor.cs`
- The blazor component is in `CodeMirror6Wrapper.razor` and `CodeMirror6Wrapper.razor.cs`
- The example component is in `Examples.Common/Example.razor`

> The Node project is automatically built with the .Net project.

## FAQs / Troubleshooting

- If you have npm / rollup errors when building (for example after pulling recent changes), `dotnet clean` will delete the `node_modules` directory. Then run `dotnet build` again.

## Changelog

- initial development 🚧

## License

Blazor CodeMirror 6 is released under the MIT License. See the LICENSE for more details.

## Contact

File an [issue](https://github.com/gaelj/BlazorCodeMirror6/issues) or open a [discussion](https://github.com/gaelj/BlazorCodeMirror6/discussions)
