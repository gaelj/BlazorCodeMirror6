using System.Text.Json.Serialization;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Built-in parameterless CodeMirror commands
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CodeMirrorSimpleCommand
{
    /// <summary>
    /// Toggle markdown bold formatting around the selected text
    /// </summary>
    ToggleMarkdownBold,

    /// <summary>
    /// Toggle markdown italic formatting around the selected text
    /// </summary>
    ToggleMarkdownItalic,

    /// <summary>
    /// Toggle markdown strikethrough formatting around the selected text
    /// </summary>
    ToggleMarkdownStrikethrough,

    /// <summary>
    /// Toggle markdown code formatting around the selected text
    /// </summary>
    ToggleMarkdownCode,

    /// <summary>
    /// Toggle markdown code block formatting around the selected text
    /// </summary>
    ToggleMarkdownCodeBlock,

    /// <summary>
    /// Toggle markdown quote formatting around the selected text
    /// </summary>
    ToggleMarkdownQuote,

    /// <summary>
    /// Increase markdown header formatting for the selected line
    /// </summary>
    IncreaseMarkdownHeadingLevel,

    /// <summary>
    /// Decrease markdown header formatting for the selected line
    /// </summary>
    DecreaseMarkdownHeadingLevel,

    /// <summary>
    /// Toggle markdown unordered list formatting for the selected line
    /// </summary>
    ToggleMarkdownUnorderedList,

    /// <summary>
    /// Toggle markdown ordered list formatting for the selected line
    /// </summary>
    ToggleMarkdownOrderedList,

    /// <summary>
    /// Toggle markdown task list formatting for the selected line
    /// </summary>
    ToggleMarkdownTaskList,

    /// <summary>
    /// Insert a markdown horizontal rule above the current cursor position
    /// </summary>
    InsertMarkdownHorizontalRule,

    /// <summary>
    /// Undo the last change
    /// </summary>
    Undo,

    /// <summary>
    /// Redo the last change
    /// </summary>
    Redo,

    /// <summary>
    /// Undo the last selection change
    /// </summary>
    UndoSelection,

    /// <summary>
    /// Redo the last selection change
    /// </summary>
    RedoSelection,

    /// <summary>
    /// Decreases the indentation level of the selected lines.
    /// </summary>
    IndentLess,

    /// <summary>
    /// Increases the indentation level of the selected lines.
    /// </summary>
    IndentMore,

    /// <summary>
    /// Copies the selected line and inserts it above the current line.
    /// </summary>
    CopyLineUp,

    /// <summary>
    /// Copies the selected line and inserts it below the current line.
    /// </summary>
    CopyLineDown,

    /// <summary>
    /// Indents the selected lines.
    /// </summary>
    IndentSelection,

    /// <summary>
    /// Moves the cursor to the matching bracket.
    /// </summary>
    CursorMatchingBracket,

    /// <summary>
    /// Toggles the comment on the selected lines.
    /// </summary>
    ToggleComment,

    /// <summary>
    /// Toggles the block comment on the selected lines.
    /// </summary>
    ToggleBlockComment,

    /// <summary>
    /// Simplifies the selection by removing leading and trailing whitespace.
    /// </summary>
    SimplifySelection,

    /// <summary>
    /// Inserts a blank line at the current cursor position.
    /// </summary>
    InsertBlankLine,

    /// <summary>
    /// Selects the current line.
    /// </summary>
    SelectLine,

    /// <summary>
    /// Comments out the selected lines as a block.
    /// </summary>
    BlockComment,

    /// <summary>
    /// Uncomments the selected lines as a block.
    /// </summary>
    BlockUncomment,

    /// <summary>
    /// Toggles the block comment on each line of the selection.
    /// </summary>
    ToggleBlockCommentByLine,

    /// <summary>
    /// Comments out the current line.
    /// </summary>
    LineComment,

    /// <summary>
    /// Uncomments the current line.
    /// </summary>
    LineUncomment,

    /// <summary>
    /// Toggles the comment on the current line.
    /// </summary>
    ToggleLineComment,

    /// <summary>
    /// Focus the CodeMirror editor
    /// </summary>
    Focus,

    /// <summary>
    /// Cut the current selection
    /// </summary>
    Cut,

    /// <summary>
    /// Copy the current selection
    /// </summary>
    Copy,

    /// <summary>
    /// Paste the current selection
    /// </summary>
    Paste,
    /// <summary>
    /// Clear the local storage document persistency
    /// </summary>
    ClearLocalStorage,
    /// <summary>
    /// Scroll the current selection into view
    /// </summary>
    ScrollIntoView,
}
