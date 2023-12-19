# Blazor CodeMirror 6

![codemirror.svg](codemirror.svg)

A CodeMirror 6 component for Blazor in .Net 7 and .Net 8.

## Features

- 2-way-binding of the document contents
- event handling
- applying preset [themes](https://github.com/vadimdemedes/thememirror)

## Installation

Fork / clone the repository and reference it in your `csproj` file:

`<ProjectReference Include="..\CodeMirror6\CodeMirror6.csproj" />`

## Usage

See `Examples.Common/Example.razor`

Resources are loaded automatically (nothing to add in `_Host.cshtml` / `index.html`).

Just add `@using CodeMirror6` in `_Imports.razor` or in your razor page / component and use `<CodeMirror6Wrapper />` as in the examples.

## Modification

The javascript-side initialization is in `CodeMirror6/NodeLib/src/index.ts`

Interop from .Net to JS is in `CodeMirror6/CodeMirrorJsInterop.cs`

Interop from JS to .Net is in `CodeMirror6/DotNetHelper.cs`

The blazor component is in `CodeMirror6Wrapper.razor`

The example component is in `Examples.Common/Example.razor`

> The Node project is automatically built with the .Net project

## Task list

- [ ] [Starting selection](https://codemirror.net/docs/ref/#state.EditorStateConfig.selection)
