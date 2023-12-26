using Microsoft.AspNetCore.Components;

namespace Examples.Common;

public partial class Example : ComponentBase
{
    private const string tab = "\t";
    private const string code = $@"## Title

```jsx
function Demo() {{
{tab}return <div>demo</div>
}}
```

> fjhd
> kjvhfdkjv
> khjvfjkd

@abc

---

there is an error here

**bold text** *italic text*
~~strikethrough text~~ `inline code` ***bold italic text***
***~~bold italic strikethrough text~~***
~~***bold italic strikethrough text***~~

![an image](https://thumbs.dreamstime.com/b/moma-cat-cute-random-218934899.jpg)

```bash
# Not dependent on uiw.
npm install @codemirror/lang-markdown --save
npm install @codemirror/language-data --save
```

[website ulr](https://github.com/gaelj/BlazorCodeMirror6)

```go
package main
import ""fmt""
func main() {{
{tab}fmt.Println(""Hello, 世界"")
}}
```
";
}
