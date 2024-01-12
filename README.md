# Blazor CodeMirror 6

[![NuGet Version](https://img.shields.io/nuget/v/GaelJ.BlazorCodeMirror6.svg)](https://www.nuget.org/packages?q=GaelJ.BlazorCodeMirror6)

> 🚧 This project is still a work-in-progress 🚧

![codemirror.svg](codemirror.svg)

Blazor CodeMirror 6 brings the power of the [CodeMirror 6](https://codemirror.net/) code editor to Blazor, offering a comprehensive .NET 7 / .NET 8 component. It's tailored for both general and specialized use-cases, supporting a range of languages and Markdown editing, extensive support for syntax highlighting, auto-completion, custom linting, themes, Markdown preview, and more.

## Try It Out

Visit the [live demo](https://gaelj.github.io/BlazorCodeMirror6/) to see the component's capabilities.

## Features

### General

- [x] 2-way-binding of the document contents
- [x] setting tab size & indentation unit
- [x] setting a placeholder text
- [x] applying preset themes
- [x] setting ReadOnly and Editable attributes
- [x] applying syntax highlighting and auto-completion for 13 different languages
- [x] manual resizing of the editor (similar to html `textarea`)
- [x] image preview
- [x] custom linting
- [x] insert text at cursor / at position
- [x] allow undo / redo toolbar buttons
- [x] configure which plugins are active at startup
- [x] optionally scroll to the bottom of the document & place the cursor on the last line
- [x] support long line wrapping
- [x] support C# language
- [x] update doc in dotnet either on text changes or on blur
- [ ] search & replace toolbar button
- [ ] toolbar with toolbar button template
- [ ] support read-only paragraphs
- [ ] diff viewer
- [ ] Implement cursor tooltips
- [ ] Implement Copilot/AI style suggestions
- [ ] allow setting the [Starting selection](https://codemirror.net/docs/ref/#state.EditorStateConfig.selection)
- [ ] Retrieve keybindings
- [ ] Highlight edited lines
- [ ] Allow toggling console debug mode
- [ ] collaborative editing
- [ ] voice recognition
- [ ] automatic translation
- [ ] deleting a file link deletes the file from the server
- [ ] button (visible when editor is hovered), to copy raw editor content to clipboard

### Markdown specific

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
- [x] support file uploads
- [x] format links, make them clickable
- [x] support mermaid language highlighting
- [x] format tables
- [x] support toolbar toggling of checklist items even if checked
- [x] Implement kroki / mermaid preview
- [x] support badges
- [x] hide markdown control characters unless the selection is in the line
- [ ] Toggling-off a Markdown style should always select the whole styled text block
- [ ] Apply Markdown style toggles to whole words
- [ ] better highlight markdown inline code and code blocks
- [ ] use latest header
- [ ] customize markdown header sizes
- [ ] add color picker extension

## Screenshots

![image](https://github.com/gaelj/BlazorCodeMirror6/assets/8884632/141f6b9e-82c4-433a-94d9-a02aba6ac336)

## Quick Start

- add the nuget package [GaelJ.BlazorCodeMirror6](https://www.nuget.org/packages/GaelJ.BlazorCodeMirror6/)
- Add `@using using GaelJ.BlazorCodeMirror6`, `@using GaelJ.BlazorCodeMirror6.Commands` and `@using GaelJ.BlazorCodeMirror6.Models.BlazorCodeMirror6` in your `_Imports.razor` or page/component
- Use the `<CodeMirror6Wrapper />` component as demonstrated in `Examples.Common/Example.razor`

## Examples

See `Examples.Common/Example.razor`

JS / CSS resources are loaded automatically (nothing to add in `_Host.cshtml` / `index.html`).

## Contributing

We welcome contributions!

### Local installation

- Clone the repository: `git clone https://github.com/gaelj/BlazorCodeMirror6.git`
- Install [node.js](https://nodejs.org/) and npx: `npm install npx`
- For build issues: `run dotnet clean` followed by `dotnet build`

### Architecture

- The javascript-side initialization is in `CodeMirror6/NodeLib/src/index.ts`
- Interop from .Net to JS is in `CodeMirror6/CodeMirrorJsInterop.cs`
- Interop from JS to .Net is in `CodeMirror6Wrapper.razor.cs`
- The blazor component is in `CodeMirror6Wrapper.razor` and `CodeMirror6Wrapper.razor.cs`
- The example component is in `Examples.Common/Example.razor`

> The Node project is automatically built with the .Net project.

## FAQs / Troubleshooting

- If you have npm / rollup errors when building (for example after pulling recent changes), `dotnet clean` will delete the `node_modules` directory. Then run `dotnet build` again.

## Changelog

See the [Changelog](CHANGELOG.md)

## License

Blazor CodeMirror 6 is released under the MIT License. See the LICENSE for more details.

## Contact

File an [issue](https://github.com/gaelj/BlazorCodeMirror6/issues) or open a [discussion](https://github.com/gaelj/BlazorCodeMirror6/discussions)

## Error reporting

Disclaimer: when a runtime error occurs in one of the demo / example projects, its details are sent to my private account on `Sentry.io`.

This is to help me detect and fix errors occurring on mobile platforms without the need for USB debugging, and to be informed of any errors that other users of the demo / example projects might encounter.

The component itself does not contain any tracking.

If you run the example projects locally and a runtime error occurs, some personal information will be sent to Sentry (OS, browser details, full path of the source file where the error occurred...)

If this makes you feel uncomfortable but you still wish to run the examples locally, you can disable Sentry by deleting:

- in `Program.cs`:

```csharp
builder.WebHost.UseSentry(o => {
    o.Dsn = "https://d0ab79eee7b999c61d2c01fdf3958eeb@o4505402784546816.ingest.sentry.io/4506525909909504";
    // When configuring for the first time, to see what the SDK is doing:
    o.Debug = true;
    // Set TracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    o.TracesSampleRate = 1.0;
});
```

- in `Examples.BlazorWasm/wwwroot/index.html` (WASM example) or in `Examples.BlazorServer/Pages/_Host.cshtml` (Blazor Server example):

```html
<script
    src="https://js.sentry-cdn.com/d0ab79eee7b999c61d2c01fdf3958eeb.min.js"
    crossorigin="anonymous"
></script>
```
