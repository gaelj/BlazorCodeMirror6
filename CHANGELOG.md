# Changelog

## 0.1.2 - 2024-01-16

### 🐛 Fix a bug

- Fix create github release when not using a tag ref

## 0.1.1 - 2024-01-16

### 👷 Add or update CI build system

- Improvement to make automatic releases

### 🔨 Add or update development scripts

- Add message in make release script
- Include make changelog in make release script

## 0.1.0 - 2024-01-15

### 👷 Add or update CI build system

- Replace github actions with: create tag on merge to main & deploy on tag created

### 🔖 Release / Version tags

- Bump version to 0.1.0
- Adding support for targeting .NET 6

## 0.0.3 - 2024-01-13

### 👷 Add or update CI build system

- Github release: fix tag name, replace Release.txt with NEW_CHANGELOG.md

### 📝 Add or update documentation

- Update changelog for 0.0.3

### 🔖 Release / Version tags

- Bump version to 0.0.3

### 🔧 Add or update configuration files

- Add changelog reference in csproj, include documentation and images in release
- Add date in changelog release titles
- Cleanup csprojs

### 🔨 Add or update development scripts

- Add make-release.sh script
- Improve changelog format

### 🥅 Catch errors

- Improve exception catching on JSInterop Disposal

## 0.0.2 - 2024-01-12

### 🐛 Fix a bug

- Don't deploy examples to nuget
- Include icon in package

### 💄 Add or update the UI and style files

- Use emojis in action names

### 📝 Add or update documentation

- Add initial CHANGELOG.md (0.0.1)
- Add nuget badge in README.ms
- Update Changelog
- Update features in README

### 🔧 Add or update configuration files

- Add a github action to create a release on new semver tags
- Follow best practices for nuget deployment
- Set project URl as github pages demo

## 0.0.1 - 2024-01-12

### ⚡️ Improve performance

- Add browser refresh script in example `index.html`
- Destroy the view on disposal
- Dispose dotNetHelper
- Don't show hidden loading page at all once the component is loaded successfully
- Try early initialization for Blazor WASM
- Use a configuration class instead of individual constructor parameters

### ✏️ Fix typos

- Use real tabs in example
- White space
- White space & example title
- White space / styling

### ✨ Introduce new features

- Add a loading placeholder panel
- Add a second instance in the examples
- Add codemirror-indentation-markers
- Add more commands
- Add SelectionRange & SelectionSet, fix SetText, fix for multiple editors
- Add undo & redo toolbar buttons, ensure editor focus after command dispatched
- Allow binding to selection ranges
- Allow manual resizing of the editor
- Allow reset to default theme
- Allow use of a custom Kroki server
- Bind text updates to dotnet
- Click on a table to edit it
- Clicking on diagram toggles edition mode
- Colorize markdown language code
- Emojis: add auto-complete
- Expose additional built-in commands
- Expose bold & italic command, add child content that can be before or after
- Expose Markdown styles active at the current selected range(s)
- Finish diagrams
- Format image and empty links
- Format inline html
- Format markdown lists
- Format markdown tables
- Hide diagram code unless cursor is in range
- Hide markdown marks unless editing or selecting the containing line
- Hide mentions when details are shown
- Implement additional commands
- Implement clickable links and decorated markdown links
- Implement configuration of which plugins are enabled at startup
- Implement dynamic language-dependent keybindings
- Implement dynamic Markdown Header Styling
- Implement Editable and ReadOnly properties
- Implement emoji decoration
- Implement FocusCodeMirrorEditor
- Implement ForceRedraw(), use it after late update of available mention completions
- Implement hasFocus and placeholderText
- Implement increase / decrease header level
- Implement initial and dynamic setting of placeholder text
- Implement Insert or replace text at position(s)
- Implement InsertTextAbove
- Implement linting
- Implement long line wrapping
- Implement markdown image preview, stolen from `https://github.com/davidmyersdev/ink-mde/blob/c4758965d91d9e2255d8062e4d7aef7f8b837a29/src/vendor/extensions/images.ts#L62`
- Implement SetIndentUnit
- Implement setting other languages
- Implement settings ThemeMirror themes
- Implement various bind value modes; don't call linting callback uselessly
- Make headers auto-formatting optional (opt-in)
- Make mentions drop-down and formatting configurable
- Optionally scroll to the bottom of the document & place the cursor on the last line
- Pass any additional attributes to the container element
- Pass initial text value
- Show code block marks when inside the code block
- Show styled horizontal rule
- Show the diagram code when clicking on the diagram
- Still show the diagram while editing it
- Support any 1-liner html tags instead of only span. Tags must be closed explicitly with the syntax `<mytag>xxx</mytag>`
- Support C# language
- Support custom completions, for example @name
- Support file uploads via drag & drop and copy / paste
- Support mermaid language highlighting
- Support plain text language as requested in #58
- Support undo-able replacing of :emoji_codes: by their unicode character
- Toggle images preview with markdown styling

### ➕ Add a dependency

- Add decorations from code mirror kit
- Add dependency to Microsoft.AspNetCore.Http
- Add ink-mde as a git submodule

### ⬆️ Upgrade dependencies

- Manually update npm dependencies
- Run `npm update`
- Update dotnet-outdated-tool to 4.6.0

### 🌱 Add or update seed files

- Add default library project `dotnet new razorclasslib --name CodeMirror6`
- Add default server example `dotnet new blazorserver --name CodeMirror6.Examples.BlazorServer`
- Add default server example `dotnet new blazorwasm --name CodeMirror6.Examples.BlazorWasm`
- Build examples
- Initial implementation

### 🎨 Improve structure / format of the code

- Add imports
- Cleanup
- Cleanup enums
- Cleanup imports
- Cleanup interop
- Cleanup supported diagram languages list
- Cleanup TS
- Commands: rewrite using enums rather than individual functions
- Diagrams: retrieve height
- Example: move buttons to the top
- Explode basic setup
- Get latest images.ts from https://github.com/davidmyersdev/ink-mde/blob/main/src/vendor/extensions/images.ts
- Hide CmJsInterop, expose Commands directly
- Improve tab size selector in example
- Initial force redraw, which now requests measure
- Show list markup when cursor is in line
- Use DotNet.DotNetObject instead of any
- Use enums instead of strings
- Use icons in the toolbar example
- Use Maths for readability
- Use primary constructor
- Use record for selection range instead of class

### 🐛 Fix a bug

- Add inheritance to ComponentBase
- Add missing preset theme tomorrow
- Add missing property
- Add missing type
- Allow clicking inside a rendered html span to edit it
- Allow different resize strategies for different instances
- Don't decoration @mentions when in a code block
- Don't hide list marks
- Don't select text inserted above the cursor
- Ensure compatibility with Blazor Server (add IsWASM parameter, fix disposal)
- Fix build
- Fix build, clean node_modules directory on clean
- Fix crash when disabling headers auto-formatting
- Fix crash when document is empty
- Fix crash when initial language is plain text (see #58)
- Fix create emojis
- Fix Demo stops reporting selection ranges after change to document #9
- Fix dynamically setting the tab size did not have effect on new tabs, only existing ones
- Fix emoji decorations
- Fix example emoji
- Fix header level always 7
- Fix image height to prevent jumping
- Fix increase nr of header # style: selection get shortened
- Fix inline html viewer: margins and multiple html tags on the same line
- Fix multiple selections was broken
- Fix outline: none non applied
- Fix pre-selected text when clicking on horizontal rule
- Fix replace emojis
- Fix selection changed after header size change if cursor is at the end of the line
- Fix selection not kept after header toggle
- Fix some crashes when toggling a style and the cursor is on the style tag
- Fix tag filter in CI
- Fix toggle style: when toggling bold on the last word of a line, the "to" selection is 2 characters short
- Fix toggling of tasks when checked
- Fix toggling where control string contains spaces
- Fix toolbar appears only after focusing the editor
- Fix toolbar button selection state
- Fix usage of set version in ci
- Keep editor focused when clicking a toolbar button
- Linting example: allow multiple errors on the same line
- Prevent forceRedraw from crashing when the problem is elsewhere
- Prevent loading diagrams on regular code blocks
- Set null string instead of null in dotnet Text
- Use a div instead of a textarea
- Write file link at latest cursor location after uploading

### 👷 Add or update CI build system

- Add publish to nuget github action, add dotnet restore to pages action
- Update deploy.yml

### 💄 Add or update the UI and style files

- Add background to example button
- Add more themes
- Add One Dark theme
- Add themes from @uiw
- Extract style to css files, fix resizing was broken
- Just show line count of bound text in examples
- Show error details in <pre>
- Style Markdown quote lines and paragraphs
- Use small toolbar buttons
- Use smaller markdown title fonts
- Use white background on diagrams, always

### 💚 Fix CI Build

- Deploy to github pages
- Fix build error
- Use latest actions versions and build before deploying

### 📄 Add or update license

- Change license from GPL to MIT in package.json
- Change license from GPL to MIT (closes #6)

### 📝 Add or update documentation

- Add a task list in the README
- Add all header levels in example
- Add image to README
- Add languages to features list in README
- Add MD features to README
- Add name to rollup config
- Add Sentry disclaimer in README.md
- Add tasks in README
- Disable Replace emojis by default; doc
- Doc
- Doc config class
- Doc js state class
- Doc, white space
- Document functions
- Document selection range model
- Document ts
- Dpc: add wasm
- Fix description
- Fix link in readme
- Improve example page
- Improve README
- Improve README.md
- Mermaid on kroki is fixed
- Move markdown sections in README
- README: correct reference to the example component
- Show usage of `a` and `img`html tags in example
- Update features in README
- Update license
- Update README
- Update readme
- Update README feature list
- Update README.md

### 🔒️ Fix security or privacy issues

- Make config internal
- Make config setters internal
- Run `npm audit fix`to address 2 vulnerabilities (1 moderate, 1 critical)

### 🔧 Add or update configuration files

- Add CodeMirror6 library
- Add editorconfig
- Add projects to solution
- Add standard solution file `dotnet new sln`
- Add standard tool manifest file `dotnet new tool-manifest`
- Add SupportedPlatform to project files
- Add tools dotnet-outdated-tool and libman
- Add vs code config
- Ensure C# 12 in csproj
- Github actions: use setup-node v4
- Make it packable
- Restore libman on build
- Run npm install at build
- Run rollup on build
- Set version on all projects
- Target net 7 and net 8
- Use net8 in launch.json

### 🗑️ Deprecate code that needs to be cleaned up

- Cleanup
- Cleanup CSS
- Cleanup example projects
- Cleanup images
- Cleanup mess in gitignore
- Don't persist initial tab size setting
- Examples: remove useless NavMenu
- Examples: remove useless top bar
- Improve disposal of a js CM instance
- Remove libman
- Remove semicolons in ts
- Remove useless button class checking parameter Relates to #53

### 🙈 Add or update a .gitignore file

- Add standard dotnet gitignore `dotnet new gitignore`
- Ignore auto generated files
- Ignore build directory

### 🚚 Move or rename resources (e.g., files, paths)

- Cleanup order of imports
- Extract CmInstance.ts
- Extract DynamicMarkdownHeaderStyling.ts
- Extract language, theme in dedicated ts files
- Extract Markdown example document
- Extract the wrapper code in a cs file, add comments
- Extract updateListenerExtension method
- Move
- Move code block down
- Move duplicated examples in a common project
- Move JS invokable functions into component
- Move the error boundary to an enclosing component
- Move ts config to dedicated file
- Move utilities to CmHelpers, don't auto-complete mentions in code blocks or html blocks
- Prepare deploy to nuget: rename main namespace to GaelJ.BlazorCodeMirror6, add package Id, description, version tag to csproj & cleanup
- Re-organize some classes for clarity
- Rename
- Rename class for clarity
- Rename CommandDispatcher
- Rename component to CodeMirror6Wrapper to prevent collision with project namespace
- Rename examples to prevent namespace collisions
- Rename file
- Rename main component to CodeMirror6WrapperInternal.razor
- Rename mentions completion
- Rename variable
- REname variables for clarity
- Split Get markdown style in 2 functions
- Stick to original names

### 🚧 Work in progress

- First implementation in progress
- Implement kroki diagram extension

### 🚨 Fix compiler / linter warnings

- Fix null ref warning
- Fix warnings, document public functions

### 🥅 Catch errors

- Add sentry integration to examples
- Add Sentry JS reporting to examples
- Catch any JS initialization errors and log them to the browser console
- Catch errors when fetching diagrams
- Catch JSDisconnectedException on disposal (CODEMIRROR-6-WRAPPER-3)
- Move the toolbars inside the ErrorBoundary
- Recover from errors on parameters set
- Show detailed error message
- Use an ErrorBoundary
