### ⚡️ Improve performance

- Persist style tag created by CM6 after reloads, without needing any HeadOutlet in Blazor Server interactive (#187), as described in https://learn.microsoft.com/en-us/aspnet/core/blazor/javascript-interoperability/static-server-rendering?view=aspnetcore-8.0
- Dispose the JS object if the parent div does not exist ; robustify dispose method

### 🐛 Fix a bug

- Fix example 3 in server interactive mode
- Fix null refs

### 💥 Introduce breaking changes

- Make parameter IsWASM obsolete: it can be automatically inferred from `OperatingSystem.IsBrowser()`

### 📝 Add or update documentation

- Add missing example3 page
