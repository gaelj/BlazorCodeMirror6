import {
    EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
    rectangularSelection, crosshairCursor, ViewUpdate,
    lineNumbers, highlightActiveLineGutter, placeholder
} from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import {
    indentWithTab, history, historyKeymap, cursorSyntaxLeft, moveLineDown, moveLineUp,
    selectSyntaxLeft, selectSyntaxRight, cursorSyntaxRight, selectParentSyntax, indentLess, indentMore,
    copyLineUp, copyLineDown, indentSelection, deleteLine, cursorMatchingBracket, toggleComment, toggleBlockComment,
    simplifySelection, insertBlankLine, selectLine, undo, redo, redoSelection, undoSelection,
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
    toggleMarkdownBoldCommand, toggleMarkdownCodeBlockCommand, toggleMarkdownCodeCommand, toggleMarkdownItalicCommand,
    toggleMarkdownStrikethroughCommand, toggleMarkdownQuoteCommand, toggleMarkdownHeading1Command, toggleMarkdownHeading2Command,
    toggleMarkdownHeading3Command, toggleMarkdownHeading4Command, toggleMarkdownHeading5Command, toggleMarkdownHeading6Command,
    toggleMarkdownUnorderedListCommand, toggleMarkdownOrderedListCommand, toggleMarkdownTaskListCommand, getMarkdownStyleAtRange,
    insertOrReplaceTextCommand,
} from "./CmCommands"
import { images } from "./CmImages"
import { externalLintSource, getExternalLinterConfig } from "./CmLint"
import { CmSetup } from "./CmSetup"

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

    let extensions = [
        CMInstances[id].keymapCompartment.of(keymap.of(getLanguageKeyMaps(initialConfig.languageName))),
        CMInstances[id].languageCompartment.of(getLanguage(initialConfig.languageName)),
        CMInstances[id].markdownStylingCompartment.of(getDynamicHeaderStyling(initialConfig.autoFormatMarkdownHeaders)),
        CMInstances[id].tabSizeCompartment.of(EditorState.tabSize.of(initialConfig.tabSize)),
        CMInstances[id].indentUnitCompartment.of(indentUnit.of(" ".repeat(initialConfig.tabSize))),
        CMInstances[id].placeholderCompartment.of(placeholder(initialConfig.placeholder)),
        CMInstances[id].themeCompartment.of(getTheme(initialConfig.themeName)),
        CMInstances[id].readonlyCompartment.of(EditorState.readOnly.of(initialConfig.readOnly)),
        CMInstances[id].editableCompartment.of(EditorView.editable.of(initialConfig.editable)),

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
    if (setup.previewImages === true) extensions.push(images())

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
        await dotnetHelper.invokeMethodAsync("MarkdownStyleChangedFromJS", getMarkdownStyleAtRange(update))
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

export function setDoc(id: string, text: string) {
    const transaction = CMInstances[id].view.state.update({
        changes: { from: 0, to: CMInstances[id].view.state.doc.length, insert: text }
    })
    CMInstances[id].view.dispatch(transaction)
}

export const insertOrReplaceText = (id: string, textToInsert: string) => insertOrReplaceTextCommand(CMInstances[id].view, textToInsert)

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

export function setAutoFormatMarkdownHeaders(id: string, autoFormatMarkdownHeaders: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].markdownStylingCompartment.reconfigure(getDynamicHeaderStyling(autoFormatMarkdownHeaders))
    })
}

export const toggleMarkdownBold = (id: string) => toggleMarkdownBoldCommand(CMInstances[id].view)
export const toggleMarkdownItalic = (id: string) => toggleMarkdownItalicCommand(CMInstances[id].view)
export const toggleMarkdownStrikethrough = (id: string) => toggleMarkdownStrikethroughCommand(CMInstances[id].view)
export const toggleMarkdownCode = (id: string) => toggleMarkdownCodeCommand(CMInstances[id].view)
export const toggleMarkdownCodeBlock = (id: string) => toggleMarkdownCodeBlockCommand(CMInstances[id].view)
export const toggleMarkdownQuote = (id: string) => toggleMarkdownQuoteCommand(CMInstances[id].view)
export const toggleMarkdownHeading1 = (id: string) => toggleMarkdownHeading1Command(CMInstances[id].view)
export const toggleMarkdownHeading2 = (id: string) => toggleMarkdownHeading2Command(CMInstances[id].view)
export const toggleMarkdownHeading3 = (id: string) => toggleMarkdownHeading3Command(CMInstances[id].view)
export const toggleMarkdownHeading4 = (id: string) => toggleMarkdownHeading4Command(CMInstances[id].view)
export const toggleMarkdownHeading5 = (id: string) => toggleMarkdownHeading5Command(CMInstances[id].view)
export const toggleMarkdownHeading6 = (id: string) => toggleMarkdownHeading6Command(CMInstances[id].view)
export const toggleMarkdownUnorderedList = (id: string) => toggleMarkdownUnorderedListCommand(CMInstances[id].view)
export const toggleMarkdownOrderedList = (id: string) => toggleMarkdownOrderedListCommand(CMInstances[id].view)
export const toggleMarkdownTaskList = (id: string) => toggleMarkdownTaskListCommand(CMInstances[id].view)

export const performUndo = (id: string) => undo(CMInstances[id].view)
export const performRedo = (id: string) => redo(CMInstances[id].view)
export const performUndoSelection = (id: string) => undoSelection(CMInstances[id].view)
export const performRedoSelection = (id: string) => redoSelection(CMInstances[id].view)
export const focus = (id: string) => CMInstances[id].view.focus()

/**
 * Dispose of a CodeMirror instance
 * @param id
 */
export function dispose(id: string) {
    CMInstances[id].view.destroy()
    CMInstances[id] = undefined
    delete CMInstances[id]
}
