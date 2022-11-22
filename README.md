# Blazor CodeMirror 6

A CodeMirror 6 component for Blazor in .Net 7.

## Install

Fork / clone the repository and reference it in your `csproj` file:

`<ProjectReference Include="..\CodeMirror6\CodeMirror6.csproj" />`

## Usage

See `Index.razor` in the Example projects.

Resources are loaded automatically (nothing to add in `_Host.cshtml`).

Just add `@using CodeMirror6` in `_Imports.razor` or in your razor page / component and use `<CodeMirror6 />` as in the examples.

## Modification

The javascript-side initialization is in `CodeMirror6/NodeLib/src/index.ts`

Interop from .Net to JS is in `CodeMirror6/CodeMirrorJsInterop.cs`

Interop from JS to .Net is in `CodeMirror6/DotNetHelper.cs`

The blazor component is in `CodeMirror6.razor`

> The Node project is automatically built with the .Net project
