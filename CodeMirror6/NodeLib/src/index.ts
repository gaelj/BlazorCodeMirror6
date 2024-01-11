import {
    EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
    rectangularSelection, crosshairCursor, ViewUpdate,
    lineNumbers, highlightActiveLineGutter, placeholder
} from "@codemirror/view"
import { EditorState, SelectionRange, Text } from "@codemirror/state"
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
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap, Completion } from "@codemirror/autocomplete"
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
    increaseMarkdownHeadingLevel,
    decreaseMarkdownHeadingLevel,
} from "./CmCommands"
import { dynamicImagesExtension } from "./CmImages"
import { externalLintSource, getExternalLinterConfig } from "./CmLint"
import { CmSetup } from "./CmSetup"
import { replaceEmojiExtension, lastOperationWasUndo } from "./CmEmojiReplace"
import { blockquote } from "./CmBlockquote"
import { listsExtension } from "./CmLists"
import { dynamicHrExtension } from "./CmHorizontalRule"
import { mentionCompletionExtension, setCachedCompletions } from "./CmMentionsCompletion"
import { mentionDecorationExtension } from "./CmMentionsView"
import { viewEmojiExtension } from "./CmEmojiView"
import { emojiCompletionExtension } from "./CmEmojiCompletion"
import { indentationMarkers } from '@replit/codemirror-indentation-markers'
import { hyperLink, hyperLinkStyle } from '@uiw/codemirror-extensions-hyper-link'
import { markdownLinkExtension } from "./CmMarkdownLink"
import { htmlViewPlugin } from "./CmHtml"
import { getFileUploadExtensions } from "./CmFileUpload"
import { DotNet } from "@microsoft/dotnet-js-interop"
import { markdownTableExtension } from "./CmMarkdownTable"
import { dynamicDiagramsExtension } from "./CmDiagrams"

/**
 * Initialize a new CodeMirror instance
 * @param dotnetHelper
 * @param id
 * @param initialConfig
 */
export async function initCodeMirror(
    id: string,
    dotnetHelper: DotNet.DotNetObject,
    initialConfig: CmConfiguration,
    setup: CmSetup
) {
    try {
        const minDelay = new Promise(res => setTimeout(res, 100))

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
                dynamicDiagramsExtension(),
                autocompletion({
                    override: [
                        ...mentionCompletionExtension(setup.allowMentions),
                        ...emojiCompletionExtension(true)
                    ]
                }),
                mentionDecorationExtension(initialConfig.autoFormatMarkdown),
                listsExtension(initialConfig.autoFormatMarkdown),
                blockquote(),
                viewEmojiExtension(initialConfig.autoFormatMarkdown),
                markdownLinkExtension(initialConfig.autoFormatMarkdown),
                hyperLink, hyperLinkStyle,
                htmlViewPlugin(initialConfig.autoFormatMarkdown),
                markdownTableExtension(initialConfig.autoFormatMarkdown),
            ]),
            CMInstances[id].tabSizeCompartment.of(EditorState.tabSize.of(initialConfig.tabSize)),
            CMInstances[id].indentUnitCompartment.of(indentUnit.of(" ".repeat(initialConfig.tabSize))),
            CMInstances[id].placeholderCompartment.of(placeholder(initialConfig.placeholder)),
            CMInstances[id].themeCompartment.of(getTheme(initialConfig.themeName)),
            CMInstances[id].readonlyCompartment.of(EditorState.readOnly.of(initialConfig.readOnly)),
            CMInstances[id].editableCompartment.of(EditorView.editable.of(initialConfig.editable)),
            CMInstances[id].emojiReplacerCompartment.of(replaceEmojiExtension(initialConfig.replaceEmojiCodes)),
            lastOperationWasUndo,
            indentationMarkers(),
            CMInstances[id].lineWrappingCompartment.of(initialConfig.lineWrapping ? EditorView.lineWrapping : []),

            EditorView.updateListener.of(async (update) => { await updateListenerExtension(id, update) }),
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
        if (setup.crossHairSelection === true) extensions.push(crosshairCursor())
        if (setup.highlightActiveLine === true) extensions.push(highlightActiveLine())
        if (setup.highlightSelectionMatches === true) extensions.push(highlightSelectionMatches())

        if (initialConfig.lintingEnabled === true || setup.bindValueMode == "OnDelayedInput")
            extensions.push(linter(async view => await externalLintSource(view, dotnetHelper), getExternalLinterConfig()))
        if (setup.allowMultipleSelections === true) extensions.push(EditorState.allowMultipleSelections.of(true))

        extensions.push(...getFileUploadExtensions(id, setup))

        await minDelay

        const scrollToEndEffect = EditorView.scrollIntoView(initialConfig.doc ? initialConfig.doc.length : 0, { y: 'end' })
        const docLines = initialConfig.doc?.split(/\r\n|\r|\n/) ?? [initialConfig.doc]
        const text = Text.of(docLines)
        const textLength = text?.length ?? 0

        CMInstances[id].state = EditorState.create({
            doc: initialConfig.doc,
            extensions: extensions,
            selection: {
                anchor: setup.scrollToEnd === true ? textLength : 0,
            },
        })

        CMInstances[id].view = new EditorView({
            state: CMInstances[id].state,
            parent: document.getElementById(id),
            scrollTo: setup.scrollToEnd === true ? scrollToEndEffect : null,
        })

        if (setup.scrollToEnd === true ) {
            CMInstances[id].view.focus()
        }

        // Hide the placeholder once the editor is initialized
        const loadingPlaceholder: HTMLElement = document.getElementById(`${id}_Loading`)
        if (loadingPlaceholder) {
            loadingPlaceholder.style.display = 'none'
        }

        // add a class to allow resizing of the editor
        setResize(id, initialConfig.resize)

        forceRedraw(id)

    } catch (error) {
        console.error(`Error in initializing CodeMirror`, error)
    }
}

async function updateListenerExtension(id: string, update: ViewUpdate) {
    const dotnetHelper = CMInstances[id].dotNetHelper
    const setup = CMInstances[id].setup
    if (update.docChanged) {
        if (setup.bindValueMode === 'OnInput')
            await dotnetHelper.invokeMethodAsync("DocChangedFromJS", update.state.doc.toString())
    }
    if (update.focusChanged) {
        await dotnetHelper.invokeMethodAsync("FocusChangedFromJS", update.view.hasFocus)
        if (!update.view.hasFocus && (setup.bindValueMode === 'OnLostFocus' || setup.bindValueMode === 'OnDelayedInput'))
            await dotnetHelper.invokeMethodAsync("DocChangedFromJS", update.state.doc.toString())
    }
    if (update.selectionSet) {
        await dotnetHelper.invokeMethodAsync("MarkdownStyleChangedFromJS", getMarkdownStyleAtSelections(update.state))
        await dotnetHelper.invokeMethodAsync("SelectionSetFromJS", update.state.selection.ranges.map(r => { return { from: r.from, to: r.to } }))
    }
}

export function setResize(id: string, resize: string) {
    setClassToParent(id, `resize-${resize}`, ['resize-horizontal', 'resize-both', 'resize-none', 'resize-vertical'])
}

export function setClassToParent(id: string, className: string, classNamesToRemove: string[]) {
    const dom = CMInstances[id].view.dom.parentElement
    classNamesToRemove.forEach(c => dom.classList.remove(c))
    dom.classList.add(className)
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

export function setLineWrapping(id: string, lineWrapping: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].lineWrappingCompartment.reconfigure(lineWrapping ? EditorView.lineWrapping : [])
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

export function setMentionCompletions(id: string, mentionCompletions: Completion[]) {
    setCachedCompletions(mentionCompletions)
    forceRedraw(id)
}

export function forceRedraw(id: string) {
    const view = CMInstances[id].view
    if (!view) return

    view.requestMeasure()
    view.update([])

    const changes = view.state.changeByRange((range: SelectionRange) => {
        return { range }
    })
    view.dispatch(view.state.update(changes))
}

export function setAutoFormatMarkdown(id: string, autoFormatMarkdown: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].markdownStylingCompartment.reconfigure([
            getDynamicHeaderStyling(autoFormatMarkdown),
            dynamicHrExtension(autoFormatMarkdown),
            dynamicImagesExtension(autoFormatMarkdown && CMInstances[id].setup.previewImages === true),
            autocompletion({
                override: [...mentionCompletionExtension(CMInstances[id].setup.allowMentions)]
            }),
            mentionDecorationExtension(autoFormatMarkdown),
            listsExtension(autoFormatMarkdown),
            blockquote(),
            viewEmojiExtension(autoFormatMarkdown),
            htmlViewPlugin(autoFormatMarkdown),
            hyperLink, hyperLinkStyle,
            markdownLinkExtension(autoFormatMarkdown),
            markdownTableExtension(autoFormatMarkdown),
        ])
    })
}

export function setReplaceEmojiCodes(id: string, replaceEmojiCodes: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].emojiReplacerCompartment.reconfigure(replaceEmojiExtension(replaceEmojiCodes))
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
            case 'IncreaseMarkdownHeadingLevel': increaseMarkdownHeadingLevel(view); break;
            case 'DecreaseMarkdownHeadingLevel': decreaseMarkdownHeadingLevel(view); break;
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

            case 'Focus': break;

            default: throw new Error(`Function ${functionName} does not exist.`);
        }
        view.focus()
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
    CMInstances[id].dotNetHelper.dispose()
    CMInstances[id].dotNetHelper = undefined
    CMInstances[id].view.destroy()
    CMInstances[id] = undefined
    delete CMInstances[id]
}
