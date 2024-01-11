using Microsoft.AspNetCore.Components;

namespace Examples.Common;

public partial class Example : ComponentBase
{
    private const string tab = "\t";
    private const string code = $@"# Demo

## Markdown editor for Blazor
### Title 3
#### Title 4
##### Title 5
###### Title 6

### Code

Code blocks in a variety of languages with syntax highlighting. For example:

```csharp
public class Demo
{{
{tab}public string Name {{ get; set; }}
}}
```

```css
body {{
{tab}background-color: red;
}}
```

```html
<div>demo</div>
```

```javascript
function Demo() {{
{tab}return <div>demo</div>
}}
```

```jsx
function Demo() {{
{tab}return <div>demo</div>
}}
```

```go
package main
import ""fmt""
func main() {{
{tab}fmt.Println(""Hello, 世界"")
}}
```

```bash
# Not dependent on uiw.
npm install @codemirror/lang-markdown --save
npm install @codemirror/language-data --save
```

### Quoted text decoration

> fjhd
> kjvhfdkjv
> khjvfjkd

### Customizable @user mentions with decoration and autocomplete

Click on a user mention or move the cursor / selection next to it to see the user name.

Type '@' to trigger the user mention autocomplete.

@abc @def @fff

### Emojis

Click on an emoji or move the cursor / selection next to it to see the emoji code.

Type ':' to trigger the emoji autocomplete.

:smile: :smile::smile:
:writing_hand:
:yellow_heart:
:clock1:

### Rendering of inline HTML in markdown

<span style=""color: red"">red</span> <span style=""color: blue"">blue</span> <span style=""color: green"">green</span>

### Links

https://www.google.com

[Google](https://www.google.com)

<a href=""https://www.google.com"">Google</a>

#### Badges preview (shields.io)

<img src=""https://img.shields.io/badge/any_text-you_like-blue""></img>

### Images preview

![an image](https://thumbs.dreamstime.com/b/moma-cat-cute-random-218934899.jpg)

### Wrapping

Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line, Long line

### Diagrams preview

> Mermaid preview by [kroki.io](https://kroki.io) is currently broken

Click on a diagram or move the cursor / selection next to it to see the diagram code.

```mermaid
flowchart TB
{tab}A & B--> C & D
```

```graphviz
digraph G {{
  Hello->World
}}
```

### Horizontal rules decoration

Some text before

---

Some text after

### Markdown tables rendering

| header 1 | header 2 |
| -------- | -------- |
| cell 1   | cell 2   |
| cell 1   | cell 2   |
| cell 1   | cell 2   |
| cell 1   | cell 2   |
| cell 1   | cell 2   |
| cell 1   | cell 2   |

### Customizable Linting

there is an error here. Error error error !

### Standard Markdown features

**bold text** *italic text*
~~strikethrough text~~ `inline code` ***bold italic text***
***~~bold italic strikethrough text~~***
~~***bold italic strikethrough text***~~

- [ ] task 1
- [x] task 2

1. item 1
2. item 2

- item 1
- item 2

1. item 1
   - item 1.1
   - item 1.2

The editor can be configured to initially scroll to the bottom line.
";
}
