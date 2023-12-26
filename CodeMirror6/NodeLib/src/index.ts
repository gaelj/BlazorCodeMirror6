import {
    EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
    rectangularSelection, crosshairCursor, ViewUpdate,
    lineNumbers, highlightActiveLineGutter, placeholder
} from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import {
    indentWithTab, history, historyKeymap,
    cursorSyntaxLeft, selectSyntaxLeft, selectSyntaxRight, cursorSyntaxRight, deleteLine,
    moveLineDown, moveLineUp, selectParentSyntax, indentLess, indentMore,
    copyLineUp, copyLineDown, indentSelection, cursorMatchingBracket, toggleComment, toggleBlockComment,
    simplifySelection, insertBlankLine, selectLine, undo, redo, redoSelection, undoSelection,
    blockComment, blockUncomment, toggleBlockCommentByLine, lineComment, lineUncomment, toggleLineComment,
} from "@codemirror/commands"
import {
    indentUnit, defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
    foldGutter, foldKeymap,
} from "@codemirror/language"
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { linter, lintKeymap } from "@codemirror/lint"

import { CmInstance, CMInstances } from "./CmInstance"
import { CmConfiguration } from "./CmConfiguration"
import { getDynamicHeaderStyling } from "./CmDynamicMarkdownHeaderStyling"
import { getTheme } from "./CmTheme"
import { languageChangeEffect, getLanguage, getLanguageKeyMaps } from "./CmLanguage"
import {
    toggleMarkdownBold, toggleMarkdownItalic, toggleMarkdownCodeBlock, toggleMarkdownCode,
    toggleMarkdownStrikethrough, toggleMarkdownQuote, toggleMarkdownHeading,
    toggleMarkdownUnorderedList, toggleMarkdownOrderedList, toggleMarkdownTaskList,
    getMarkdownStyleAtSelections,
    insertOrReplaceText,
    insertTextAboveCommand,
} from "./CmCommands"
import { dynamicImagesExtension } from "./CmImages"
import { externalLintSource, getExternalLinterConfig } from "./CmLint"
import { CmSetup } from "./CmSetup"
import { createEmojiExtension, lastOperationWasUndo } from "./CmEmoji"
import { blockquote } from "./CmBlockquote"
import { listsExtension } from "./CmLists"
import { dynamicHrExtension } from "./CmHorizontalRule"
import { mentionExtension } from "./CmMentions"

/**
 * Initialize a new CodeMirror instance
 * @param dotnetHelper
 * @param id
 * @param initialConfig
 */
export function initCodeMirror(
    id: string,
    dotnetHelper: any,
    initialConfig: CmConfiguration,
    setup: CmSetup
) {
    CMInstances[id] = new CmInstance()
    CMInstances[id].dotNetHelper = dotnetHelper
    CMInstances[id].setup = setup

    let extensions = [
        CMInstances[id].keymapCompartment.of(keymap.of(getLanguageKeyMaps(initialConfig.languageName))),
        CMInstances[id].languageCompartment.of(getLanguage(initialConfig.languageName)),
        CMInstances[id].markdownStylingCompartment.of([
            getDynamicHeaderStyling(initialConfig.autoFormatMarkdown),
            dynamicHrExtension(initialConfig.autoFormatMarkdown),
            dynamicImagesExtension(initialConfig.autoFormatMarkdown && setup.previewImages === true),
            mentionExtension(CMInstances[id].dotNetHelper, setup.allowMentions, initialConfig.autoFormatMarkdown),
            listsExtension(initialConfig.autoFormatMarkdown),
        ]),
        CMInstances[id].tabSizeCompartment.of(EditorState.tabSize.of(initialConfig.tabSize)),
        CMInstances[id].indentUnitCompartment.of(indentUnit.of(" ".repeat(initialConfig.tabSize))),
        CMInstances[id].placeholderCompartment.of(placeholder(initialConfig.placeholder)),
        CMInstances[id].themeCompartment.of(getTheme(initialConfig.themeName)),
        CMInstances[id].readonlyCompartment.of(EditorState.readOnly.of(initialConfig.readOnly)),
        CMInstances[id].editableCompartment.of(EditorView.editable.of(initialConfig.editable)),
        CMInstances[id].emojiReplacerCompartment.of(createEmojiExtension(initialConfig.replaceEmojiCodes)),
        lastOperationWasUndo,
        blockquote(),

        EditorView.updateListener.of(async (update) => { await updateListenerExtension(dotnetHelper, update) }),
        keymap.of([
            ...closeBracketsKeymap,

            //...defaultKeymap,
            { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
            { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },

            { key: "Alt-ArrowUp", run: moveLineUp },
            { key: "Shift-Alt-ArrowUp", run: copyLineUp },

            { key: "Alt-ArrowDown", run: moveLineDown },
            { key: "Shift-Alt-ArrowDown", run: copyLineDown },

            { key: "Escape", run: simplifySelection },
            { key: "Mod-Enter", run: insertBlankLine },

            { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
            { key: "Mod-i", run: selectParentSyntax, preventDefault: true },

            { key: "Mod-[", run: indentLess },
            { key: "Mod-]", run: indentMore },
            { key: "Mod-Alt-\\", run: indentSelection },

            { key: "Shift-Mod-k", run: deleteLine },

            { key: "Shift-Mod-\\", run: cursorMatchingBracket },

            { key: "Mod-/", run: toggleComment },
            { key: "Alt-A", run: toggleBlockComment },

            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
            ...lintKeymap,

            indentWithTab,
        ])
    ]

    // Basic Setup
    if (setup.lineNumbers === true) extensions.push(lineNumbers())
    if (setup.highlightActiveLineGutter === true) extensions.push(highlightActiveLineGutter())
    if (setup.highlightSpecialChars === true) extensions.push(highlightSpecialChars())
    if (setup.history === true) extensions.push(history())
    if (setup.foldGutter === true) extensions.push(foldGutter())
    if (setup.drawSelection === true) extensions.push(drawSelection())
    if (setup.dropCursor === true) extensions.push(dropCursor())
    if (setup.indentOnInput === true) extensions.push(indentOnInput())
    if (setup.syntaxHighlighting === true) extensions.push(syntaxHighlighting(defaultHighlightStyle, { fallback: true }))
    if (setup.bracketMatching === true) extensions.push(bracketMatching())
    if (setup.closeBrackets === true) extensions.push(closeBrackets())
    if (setup.autocompletion === true) extensions.push(autocompletion({}))
    if (setup.rectangularSelection === true) extensions.push(rectangularSelection())
    if (setup.crosshairCursor === true) extensions.push(crosshairCursor())
    if (setup.highlightActiveLine === true) extensions.push(highlightActiveLine())
    if (setup.highlightSelectionMatches === true) extensions.push(highlightSelectionMatches())

    extensions.push(linter(async view => await externalLintSource(view, dotnetHelper), getExternalLinterConfig()))
    if (setup.allowMultipleSelections === true) EditorState.allowMultipleSelections.of(true)

    CMInstances[id].state = EditorState.create({
        doc: initialConfig.doc,
        extensions: extensions,
    })

    CMInstances[id].view = new EditorView({
        state: CMInstances[id].state,
        parent: document.getElementById(id),
    })
}

async function updateListenerExtension(dotnetHelper: any, update: ViewUpdate) {
    if (update.docChanged) {
        await dotnetHelper.invokeMethodAsync("DocChangedFromJS", update.state.doc.toString())
    }
    if (update.focusChanged) {
        await dotnetHelper.invokeMethodAsync("FocusChangedFromJS", update.view.hasFocus)
        if (!update.view.hasFocus)
            await dotnetHelper.invokeMethodAsync("DocChangedFromJS", update.state.doc.toString())
    }
    if (update.selectionSet) {
        await dotnetHelper.invokeMethodAsync("MarkdownStyleChangedFromJS", getMarkdownStyleAtSelections(update.state))
        await dotnetHelper.invokeMethodAsync("SelectionSetFromJS", update.state.selection.ranges.map(r => { return { from: r.from, to: r.to } }))
    }
}

export function setTabSize(id: string, size: number) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].tabSizeCompartment.reconfigure(EditorState.tabSize.of(size))
    })
}

export function setIndentUnit(id: string, indentUnitString: string) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].indentUnitCompartment.reconfigure(indentUnit.of(indentUnitString))
    })
}
export function setPlaceholderText(id: string, text: string) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].placeholderCompartment.reconfigure(placeholder(text))
    })
}

export function setTheme(id: string, themeName: string) {
    const theme = getTheme(themeName)
    if (theme !== null) {
        CMInstances[id].view.dispatch({
            effects: CMInstances[id].themeCompartment.reconfigure(theme)
        })
    }
}

export function setReadOnly(id: string, readOnly: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].readonlyCompartment.reconfigure(EditorState.readOnly.of(readOnly))
    })
}

export function setEditable(id: string, editable: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].editableCompartment.reconfigure(EditorView.editable.of(editable))
    })
}

export function setLanguage(id: string, languageName: string) {
    const language = getLanguage(languageName)
    const customKeyMap = getLanguageKeyMaps(languageName)
    CMInstances[id].view.dispatch({
        effects: [
            CMInstances[id].languageCompartment.reconfigure(language),
            CMInstances[id].keymapCompartment.reconfigure(keymap.of(customKeyMap)),
            languageChangeEffect.of(language.language)
        ]
    })
}

export function setAutoFormatMarkdown(id: string, autoFormatMarkdown: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].markdownStylingCompartment.reconfigure([
            getDynamicHeaderStyling(autoFormatMarkdown),
            dynamicHrExtension(autoFormatMarkdown),
            dynamicImagesExtension(autoFormatMarkdown && CMInstances[id].setup.previewImages === true),
            mentionExtension(CMInstances[id].dotNetHelper, CMInstances[id].setup.allowMentions, autoFormatMarkdown),
            listsExtension(autoFormatMarkdown),
        ])
    })
}

export function setReplaceEmojiCodes(id: string, replaceEmojiCodes: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].emojiReplacerCompartment.reconfigure(createEmojiExtension(replaceEmojiCodes))
    });
}

export function setDoc(id: string, text: string) {
    const transaction = CMInstances[id].view.state.update({
        changes: { from: 0, to: CMInstances[id].view.state.doc.length, insert: text }
    })
    CMInstances[id].view.dispatch(transaction)
}

export function dispatchCommand(id: string, functionName: string, ...args: any[]) {
    const view = CMInstances[id].view
    try {
        switch (functionName) {
            case 'ToggleMarkdownBold': toggleMarkdownBold(view); break;
            case 'ToggleMarkdownItalic': toggleMarkdownItalic(view); break;
            case 'ToggleMarkdownStrikethrough': toggleMarkdownStrikethrough(view); break;
            case 'ToggleMarkdownCode': toggleMarkdownCode(view); break;
            case 'ToggleMarkdownCodeBlock': toggleMarkdownCodeBlock(view); break;
            case 'ToggleMarkdownQuote': toggleMarkdownQuote(view); break;
            case 'ToggleMarkdownHeading': toggleMarkdownHeading(args[0] as number)(view); break;
            case 'ToggleMarkdownUnorderedList': toggleMarkdownUnorderedList(view); break;
            case 'ToggleMarkdownOrderedList': toggleMarkdownOrderedList(view); break;
            case 'ToggleMarkdownTaskList': toggleMarkdownTaskList(view); break;
            case 'InsertOrReplaceText': insertOrReplaceText(view, args[0] as string); break;
            case 'InsertTextAbove': insertTextAboveCommand(view, args[0] as string); break;

            case 'Undo': undo(view); break;
            case 'Redo': redo(view); break;
            case 'UndoSelection': undoSelection(view); break;
            case 'RedoSelection': redoSelection(view); break;
            case 'IndentLess': indentLess(view); break;
            case 'IndentMore': indentMore(view); break;
            case 'CopyLineUp': copyLineUp(view); break;
            case 'CopyLineDown': copyLineDown(view); break;
            case 'IndentSelection': indentSelection(view); break;
            case 'CursorMatchingBracket': cursorMatchingBracket(view); break;
            case 'ToggleComment': toggleComment(view); break;
            case 'ToggleBlockComment': toggleBlockComment(view); break;
            case 'SimplifySelection': simplifySelection(view); break;
            case 'InsertBlankLine': insertBlankLine(view); break;
            case 'SelectLine': selectLine(view); break;
            case 'BlockComment': blockComment(view); break;
            case 'BlockUncomment': blockUncomment(view); break;
            case 'ToggleBlockCommentByLine': toggleBlockCommentByLine(view); break;
            case 'LineComment': lineComment(view); break;
            case 'LineUncomment': lineUncomment(view); break;
            case 'ToggleLineComment': toggleLineComment(view); break;

            case 'Focus': view.focus(); break;

            default: throw new Error(`Function ${functionName} does not exist.`);
        }
    }
    catch (error) {
        console.error(`Error in calling the function ${functionName}`, error);
    }
}

/**
 * Dispose of a CodeMirror instance
 * @param id
 */
export function dispose(id: string) {
    CMInstances[id].view.destroy()
    CMInstances[id] = undefined
    delete CMInstances[id]
}
