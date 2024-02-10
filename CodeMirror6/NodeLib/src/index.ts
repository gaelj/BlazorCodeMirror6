import {
    EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
    rectangularSelection, crosshairCursor, ViewUpdate, lineNumbers, highlightActiveLineGutter,
    placeholder, scrollPastEnd, highlightTrailingWhitespace, highlightWhitespace
} from "@codemirror/view"
import { EditorState, SelectionRange, Text, StateEffect, ChangeSpec } from "@codemirror/state"
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
import { languages } from "@codemirror/language-data"
import { unifiedMergeView } from "@codemirror/merge"
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap, Completion } from "@codemirror/autocomplete"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { linter, lintGutter, lintKeymap } from "@codemirror/lint"

import { DotNet } from "@microsoft/dotnet-js-interop"
import { indentationMarkers } from '@replit/codemirror-indentation-markers'
import { hyperLink, hyperLinkStyle } from '@uiw/codemirror-extensions-hyper-link'

import { CmInstance, CMInstances } from "./CmInstance"
import { CmConfiguration, UnifiedMergeConfig } from "./CmConfiguration"
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
    insertTableAboveCommand,
    insertHorizontalRuleAboveCommand,
    cut,
    copy,
    paste,
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
import { markdownLinkExtension } from "./CmMarkdownLink"
import { htmlViewPlugin } from "./CmHtml"
import { getFileUploadExtensions, uploadFiles } from "./CmFileUpload"
import { markdownTableExtension } from "./CmMarkdownTable"
import { dynamicDiagramsExtension } from "./CmDiagrams"
import { hideMarksExtension } from "./CmHideMarkdownMarks"
import { getColumnStylingKeymap, columnStylingPlugin, columnLintSource, getSeparator } from "./CmColumns"
import { consoleLog } from "./CmLogging"

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
    if (CMInstances[id] !== undefined) {
        consoleLog(id, `CodeMirror instance ${id} already exists`)
        return
    }

    await loadCss("_content/GaelJ.BlazorCodeMirror6/GaelJ.BlazorCodeMirror6.bundle.scp.css")

    if (setup.debugLogs === true) {
        console.log(`Initializing CodeMirror instance ${id}`)
    }
    try {
        const minDelay = new Promise(res => setTimeout(res, 100))

        CMInstances[id] = new CmInstance()
        CMInstances[id].dotNetHelper = dotnetHelper
        CMInstances[id].setup = setup
        CMInstances[id].config = initialConfig
        CMInstances[id].localStorageKey = initialConfig.localStorageKey
        const customKeyMap = getLanguageKeyMaps(initialConfig.languageName, initialConfig.fileNameOrExtension)
        if (initialConfig.languageName !== "CSV" && initialConfig.languageName !== "TSV")
            customKeyMap.push(indentWithTab)

        let extensions = [
            CMInstances[id].keymapCompartment.of(keymap.of(customKeyMap)),
            CMInstances[id].languageCompartment.of(await getLanguage(id, initialConfig.languageName, initialConfig.fileNameOrExtension) ?? []),
            CMInstances[id].markdownStylingCompartment.of(initialConfig.languageName !== "Markdown" ? [] : autoFormatMarkdownExtensions(id, initialConfig.autoFormatMarkdown)),
            CMInstances[id].tabSizeCompartment.of(EditorState.tabSize.of(initialConfig.tabSize)),
            CMInstances[id].indentUnitCompartment.of(indentUnit.of(" ".repeat(initialConfig.indentationUnit))),
            CMInstances[id].placeholderCompartment.of(placeholder(initialConfig.placeholder)),
            CMInstances[id].themeCompartment.of(getTheme(initialConfig.themeName)),
            CMInstances[id].readonlyCompartment.of(EditorState.readOnly.of(initialConfig.readOnly)),
            CMInstances[id].editableCompartment.of(EditorView.editable.of(initialConfig.editable)),
            CMInstances[id].emojiReplacerCompartment.of(replaceEmojiExtension(initialConfig.replaceEmojiCodes)),
            lastOperationWasUndo,
            indentationMarkers(),
            CMInstances[id].lineWrappingCompartment.of(initialConfig.lineWrapping && initialConfig.languageName !== "CSV" && initialConfig.languageName !== "TSV" ? EditorView.lineWrapping : []),
            CMInstances[id].unifiedMergeViewCompartment.of(initialConfig.mergeViewConfiguration ? unifiedMergeView(initialConfig.mergeViewConfiguration) : []),
            CMInstances[id].highlightTrailingWhitespaceCompartment.of(initialConfig.highlightTrailingWhitespace ? highlightTrailingWhitespace() : []),
            CMInstances[id].highlightWhitespaceCompartment.of(initialConfig.highlightWhitespace ? highlightWhitespace() : []),
            CMInstances[id].columnsStylingCompartment.of(
                initialConfig.languageName === "CSV" || initialConfig.languageName === "TSV"
                    ? [
                        columnStylingPlugin(getSeparator(initialConfig.languageName)),
                        keymap.of(getColumnStylingKeymap(getSeparator(initialConfig.languageName))),
                        linter(async view => columnLintSource(id, view, getSeparator(initialConfig.languageName))),
                    ]
                    : []
            ),

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
        if (setup.autocompletion === true) extensions.push(autocompletion())
        if (setup.rectangularSelection === true) extensions.push(rectangularSelection())
        if (setup.crossHairSelection === true) extensions.push(crosshairCursor())
        if (setup.highlightActiveLine === true) extensions.push(highlightActiveLine())
        if (setup.highlightSelectionMatches === true) extensions.push(highlightSelectionMatches())
        if (setup.scrollPastEnd === true) extensions.push(scrollPastEnd())
        if (setup.allowMultipleSelections === true) extensions.push(EditorState.allowMultipleSelections.of(true))

        if (initialConfig.lintingEnabled === true || setup.bindValueMode == "OnDelayedInput") {
            extensions.push(linter(async view => await externalLintSource(id, view, dotnetHelper), getExternalLinterConfig()))
        }
        if (initialConfig.lintingEnabled === true)
            extensions.push(lintGutter())

        extensions.push(...getFileUploadExtensions(id, setup))

        const pasteHandler = EditorView.domEventHandlers({
            paste(event, view) {
                const transfer = event.clipboardData

                consoleLog(id, "Pasting", transfer.files, transfer.types, transfer.items)
                for (let i = 0; i < transfer.items.length; i++) {
                    const item = transfer.items[i]
                    consoleLog(id, "Item", item.kind, item.type)
                }
                if (transfer?.files && transfer.files.length > 0 && !transfer.types.includes('text/plain')) {
                    uploadFiles(id, transfer.files, view)
                    event.preventDefault()
                }
                else if (paste(view))
                    event.preventDefault()
            },
        })
        extensions.push(pasteHandler)

        await minDelay

        const textInLocalStorage = localStorage.getItem(initialConfig.localStorageKey)
        const initialDoc = textInLocalStorage ? textInLocalStorage : initialConfig.doc

        const scrollToEndEffect = EditorView.scrollIntoView(initialDoc ? initialDoc.length : 0, { y: 'end' })
        const docLines = initialDoc?.split(/\r\n|\r|\n/) ?? [initialDoc]
        const text = Text.of(docLines)
        const textLength = text?.length ?? 0

        CMInstances[id].state = EditorState.create({
            doc: initialDoc,
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

        if (setup.scrollToEnd === true) {
            CMInstances[id].view.focus()
        }

        // Hide the placeholder once the editor is initialized
        const loadingPlaceholder: HTMLElement = document.getElementById(`${id}_Loading`)
        if (loadingPlaceholder) {
            loadingPlaceholder.style.display = 'none'
        }

        // add a class to allow resizing of the editor
        setResize(id, initialConfig.resize)

        adjustEditorHeight(id)

        forceRedraw(id)

    } catch (error) {
        console.error(`Error in initializing CodeMirror`, error)
    }
}

export function getAllSupportedLanguageNames() {
    return languages.map((language) => language.name)
}

async function updateListenerExtension(id: string, update: ViewUpdate) {
    const dotnetHelper = CMInstances[id].dotNetHelper
    if (dotnetHelper === undefined) {
        consoleLog(id, `DotNetHelper is undefined`)
        return
    }
    const setup = CMInstances[id].setup
    if (update.docChanged) {
        if (setup.bindValueMode === 'OnInput')
            await dotnetHelper.invokeMethodAsync("DocChangedFromJS", update.state.doc.toString())
        saveToLocalStorage(id)
    }
    if (update.focusChanged) {
        await dotnetHelper.invokeMethodAsync("FocusChangedFromJS", update.view.hasFocus)
        if (!update.view.hasFocus && (setup.bindValueMode === 'OnLostFocus' || setup.bindValueMode === 'OnDelayedInput'))
            await dotnetHelper.invokeMethodAsync("DocChangedFromJS", update.state.doc.toString())
    }
    if (update.selectionSet) {
        await dotnetHelper.invokeMethodAsync("MarkdownStyleChangedFromJS", getMarkdownStyleAtSelections(id, update.state))
        await dotnetHelper.invokeMethodAsync("SelectionSetFromJS", update.state.selection.ranges.map(r => { return { from: r.from, to: r.to } }))
    }
    if (update.geometryChanged) {
        adjustEditorHeight(id)
    }
}

function adjustEditorHeight(id: string) {
    const toolbarTopHeight = document.getElementById(`${id}_TopBar`).offsetHeight;
    const toolbarBottomHeight = document.getElementById(`${id}_BottomBar`).offsetHeight;
    const container = document.getElementById(`${id}_Container`)
    const viewportHeight = container.offsetHeight;
    const editorHeight = viewportHeight - toolbarTopHeight - toolbarBottomHeight;

    document.getElementById(id).style.height = `${editorHeight}px`;
}

function setResize(id: string, resize: string) {
    setClassToParent(id, `resize-${resize}`, ['resize-horizontal', 'resize-both', 'resize-none', 'resize-vertical'])
}

function setClassToParent(id: string, className: string, classNamesToRemove: string[]) {
    const dom = CMInstances[id].view.dom.parentElement
    classNamesToRemove.forEach(c => dom.classList.remove(c))
    if (dom?.classList)
        dom.classList.add(className)
}

export async function setConfiguration(id: string, newConfig: CmConfiguration) {
    const view = CMInstances[id].view
    const oldConfig = CMInstances[id].config
    const effects: StateEffect<any>[] = []
    const changes: ChangeSpec[] = []
    if (oldConfig.resize === newConfig.resize)
        setResize(id, newConfig.resize)

    if (view.state.doc.toString() !== newConfig.doc) {
        changes.push({ from: 0, to: view.state.doc.length, insert: newConfig.doc })
    }
    if (oldConfig.placeholder !== newConfig.placeholder) effects.push(CMInstances[id].placeholderCompartment.reconfigure(placeholder(newConfig.placeholder)))
    const theme = getTheme(newConfig.themeName)
    if (theme !== null && oldConfig.themeName !== newConfig.themeName) effects.push(CMInstances[id].themeCompartment.reconfigure(theme))
    if (oldConfig.tabSize !== newConfig.tabSize) effects.push(CMInstances[id].tabSizeCompartment.reconfigure(EditorState.tabSize.of(newConfig.tabSize)))
    if (oldConfig.indentationUnit !== newConfig.indentationUnit) effects.push(CMInstances[id].indentUnitCompartment.reconfigure(indentUnit.of(' '.repeat(newConfig.indentationUnit))))
    if (oldConfig.readOnly !== newConfig.readOnly) effects.push(CMInstances[id].readonlyCompartment.reconfigure(EditorState.readOnly.of(newConfig.readOnly)))
    if (oldConfig.editable !== newConfig.editable) effects.push(CMInstances[id].editableCompartment.reconfigure(EditorView.editable.of(newConfig.editable)))
    if (oldConfig.languageName !== newConfig.languageName || oldConfig.fileNameOrExtension !== newConfig.fileNameOrExtension) {
        const language = await getLanguage(id, newConfig.languageName, newConfig.fileNameOrExtension)
        const customKeyMap = getLanguageKeyMaps(newConfig.languageName, newConfig.fileNameOrExtension)
        if (newConfig.languageName !== "CSV" && newConfig.languageName !== "TSV")
            customKeyMap.push(indentWithTab)
        const separator = getSeparator(newConfig.languageName)
        effects.push(
            CMInstances[id].languageCompartment.reconfigure(language ?? []),
            CMInstances[id].keymapCompartment.reconfigure(keymap.of(customKeyMap)),
            languageChangeEffect.of(language?.language),
            CMInstances[id].markdownStylingCompartment.reconfigure(autoFormatMarkdownExtensions(id, newConfig.languageName === 'Markdown')),
            CMInstances[id].columnsStylingCompartment.reconfigure(
                newConfig.languageName === "CSV" || newConfig.languageName === "TSV"
                    ? [
                        columnStylingPlugin(separator),
                        keymap.of(getColumnStylingKeymap(separator)),
                        linter(async view => columnLintSource(id, view, separator)),
                    ]
                    : []
            ),
        )
    }
    if (oldConfig.autoFormatMarkdown !== newConfig.autoFormatMarkdown) effects.push(CMInstances[id].markdownStylingCompartment.reconfigure(autoFormatMarkdownExtensions(id, newConfig.autoFormatMarkdown)))
    if (oldConfig.replaceEmojiCodes !== newConfig.replaceEmojiCodes) effects.push(CMInstances[id].emojiReplacerCompartment.reconfigure(replaceEmojiExtension(newConfig.replaceEmojiCodes)))
    if (oldConfig.lineWrapping !== newConfig.lineWrapping) effects.push(CMInstances[id].lineWrappingCompartment.reconfigure(newConfig.lineWrapping ? EditorView.lineWrapping : []))
    if (oldConfig.mergeViewConfiguration !== newConfig.mergeViewConfiguration) effects.push(CMInstances[id].unifiedMergeViewCompartment.reconfigure(newConfig.mergeViewConfiguration ? unifiedMergeView(newConfig.mergeViewConfiguration) : []))
    if (oldConfig.highlightTrailingWhitespace !== newConfig.highlightTrailingWhitespace) effects.push(CMInstances[id].highlightTrailingWhitespaceCompartment.reconfigure(newConfig.highlightTrailingWhitespace ? highlightTrailingWhitespace() : []))
    if (oldConfig.highlightWhitespace !== newConfig.highlightWhitespace) effects.push(CMInstances[id].highlightWhitespaceCompartment.reconfigure(newConfig.highlightWhitespace ? highlightWhitespace() : []))
    if (oldConfig.localStorageKey !== newConfig.localStorageKey) setLocalStorageKey(id, newConfig.localStorageKey)

    CMInstances[id].config = newConfig
    view.dispatch({ effects: effects, changes: changes })
}

export function setMentionCompletions(id: string, mentionCompletions: Completion[]) {
    setCachedCompletions(mentionCompletions)
    forceRedraw(id)
}

export function forceRedraw(id: string) {
    const view = CMInstances[id].view
    if (!view) {
        consoleLog(id, `View is undefined`)
        return
    }

    view.requestMeasure()
    view.update([])

    const changes = view.state.changeByRange((range: SelectionRange) => {
        return { range }
    })
    view.dispatch(view.state.update(changes))
}

function setDoc(id: string, text: string) {
    const transaction = CMInstances[id].view.state.update({
        changes: { from: 0, to: CMInstances[id].view.state.doc.length, insert: text }
    })
    CMInstances[id].view.dispatch(transaction)
}

function setLocalStorageKey(id: string, value: string) {
    saveToLocalStorage(id)
    CMInstances[id].localStorageKey = value
    if (value)
        loadFromLocalStorage(id)
    else
        clearLocalStorage(id)
}

export function clearLocalStorage(id: string) {
    localStorage.removeItem(CMInstances[id].localStorageKey)
}

function loadFromLocalStorage(id: string) {
    const localStorageKey = CMInstances[id].localStorageKey
    if (localStorageKey) {
        const value = localStorage.getItem(localStorageKey)
        setDoc(id, value)
    }
}

function saveToLocalStorage(id: string) {
    const localStorageKey = CMInstances[id].localStorageKey
    if (localStorageKey) {
        const value = CMInstances[id].view.state.doc.toString()
        if (value)
            localStorage.setItem(localStorageKey, value)
        else
            localStorage.removeItem(localStorageKey)
    }
}

const autoFormatMarkdownExtensions = (id: string, autoFormatMarkdown: boolean = true) => [
    getDynamicHeaderStyling(autoFormatMarkdown),
    dynamicHrExtension(autoFormatMarkdown),
    dynamicImagesExtension(autoFormatMarkdown && CMInstances[id].setup.previewImages === true),
    dynamicDiagramsExtension(autoFormatMarkdown, CMInstances[id].setup.krokiUrl.replace(/\/$/, '')),
    autocompletion({
        override: [
            ...mentionCompletionExtension(CMInstances[id].setup.allowMentions),
            ...emojiCompletionExtension(true)
        ]
    }),
    mentionDecorationExtension(autoFormatMarkdown),
    listsExtension(autoFormatMarkdown),
    blockquote(),
    viewEmojiExtension(autoFormatMarkdown),
    htmlViewPlugin(autoFormatMarkdown),
    hyperLink, hyperLinkStyle,
    markdownLinkExtension(autoFormatMarkdown),
    markdownTableExtension(autoFormatMarkdown),
    hideMarksExtension(autoFormatMarkdown),
]

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

            case 'InsertTable': insertTableAboveCommand(view, args[0] as number, args[1] as number); break;
            case 'InsertMarkdownHorizontalRule': insertHorizontalRuleAboveCommand(view); break;

            case 'Cut': cut(view); break;
            case 'Copy': copy(view); break;
            case 'Paste': paste(view); break;

            case 'Focus': break;
            case 'ClearLocalStorage': clearLocalStorage(id); break;

            default: throw new Error(`Function ${functionName} does not exist.`);
        }
        view.focus()
    }
    catch (error) {
        console.error(`Error in calling the function ${functionName}`, error);
    }
}

function loadCss(url: string, cacheBust: boolean = true): Promise<void> {
    const versionedUrl = cacheBust ? `${url}?v=${new Date().getTime()}` : url;

    return new Promise((resolve, reject) => {
        if (document.querySelector(`link[href^="${url}"]`)) {
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = versionedUrl;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load CSS: ${versionedUrl}`));

        document.head.appendChild(link);
    });
}

/**
 * Dispose of a CodeMirror instance
 * @param id
 */
export function dispose(id: string) {
    consoleLog(id, `Disposing of CodeMirror instance ${id}`)
    CMInstances[id].dotNetHelper.dispose()
    CMInstances[id].dotNetHelper = undefined
    CMInstances[id].view.destroy()
    CMInstances[id] = undefined
    delete CMInstances[id]
}
