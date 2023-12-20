import { basicSetup } from "codemirror"
import { EditorView, ViewUpdate, Decoration, DecorationSet, ViewPlugin, keymap, placeholder } from "@codemirror/view"
import { EditorState, StateEffect, StateEffectType, Extension, Range } from "@codemirror/state"
import { indentWithTab } from "@codemirror/commands"
import { indentUnit, LanguageSupport, syntaxTree, Language } from "@codemirror/language"
import { cpp, cppLanguage } from "@codemirror/lang-cpp"
import { css, cssLanguage } from "@codemirror/lang-css"
import { html, htmlLanguage } from "@codemirror/lang-html"
import { java, javaLanguage } from "@codemirror/lang-java"
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript"
import { json, jsonLanguage } from "@codemirror/lang-json"
import { lezer, lezerLanguage } from "@codemirror/lang-lezer"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { python, pythonLanguage } from "@codemirror/lang-python"
import { sql, MSSQL } from "@codemirror/lang-sql"
import { rust, rustLanguage } from "@codemirror/lang-rust"
import { sass, sassLanguage } from "@codemirror/lang-sass"
import { xml, xmlLanguage } from "@codemirror/lang-xml"
import { languages } from "@codemirror/language-data"
import { autocompletion } from "@codemirror/autocomplete"
import { CmInstance } from "./CmInstance"
import { CmConfig } from "./CmConfig"
import { amy, ayuLight, barf, bespin, birdsOfParadise, boysAndGirls, clouds, cobalt, coolGlow, dracula, espresso, noctisLilac, rosePineDawn, smoothy, solarizedLight, tomorrow } from 'thememirror'
import { oneDark } from "@codemirror/theme-one-dark"

let CMInstances: { [id: string]: CmInstance } = {}

function dynamicMarkdownHeaderStyling(markdownLang: Language, languageChangeEffect: StateEffectType<any>) {
    return ViewPlugin.fromClass(class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = this.getDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged || update.transactions.some(tr => tr.effects.some(e => e.is(languageChangeEffect)))) {
                this.decorations = this.getDecorations(update.view);
            }
        }

        getDecorations(view: EditorView): DecorationSet {
            const decorations: Range<Decoration>[] = [];
            const doc = view.state.doc;

            syntaxTree(view.state).iterate({
                from: view.viewport.from,
                to: view.viewport.to,
                enter: (node) => {
                    if (node.name.startsWith('ATXHeading')) {
                        const line = doc.lineAt(node.from).text.trimStart()

                        if (markdownLang.isActiveAt(view.state, node.from) && line.startsWith('#')) {
                            let headerLevel = line.indexOf(' ');
                            if (headerLevel === -1)
                                headerLevel = line.length;
                            const fontSize = `${1 + 0.7 * (7 - headerLevel)}em`;
                            decorations.push(Decoration.line({
                                attributes: { style: `font-size: ${fontSize};` }
                            }).range(node.from, node.from));
                        }
                    }
                }
            });

            return Decoration.set(decorations);
        }
    }, {
        decorations: v => v.decorations
    });
}

function noMarkdownHeaderStyling() {
    return ViewPlugin.fromClass(class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = this.getDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = this.getDecorations(update.view);
            }
        }

        getDecorations(view: EditorView): DecorationSet {
            const decorations: Range<Decoration>[] = [];
            const doc = view.state.doc;

            syntaxTree(view.state).iterate({
                from: view.viewport.from,
                to: view.viewport.to,
                enter: (node) => {}
            });

            return Decoration.set(decorations);
        }
    }, {
        decorations: v => v.decorations
    });
}

const languageChangeEffect = StateEffect.define<Language>();

export function initCodeMirror(
    dotnetHelper: any,
    id: string,
    config: CmConfig
) {
    CMInstances[id] = new CmInstance()
    CMInstances[id].dotNetHelper = dotnetHelper

    let extensions = [
        basicSetup,
        CMInstances[id].languageCompartment.of(getLanguage(config.languageName)),
        CMInstances[id].markdownStylingCompartment.of(getDynamicHeaderStyling(config.autoFormatMarkdownHeaders)),
        CMInstances[id].keymapCompartment.of(keymap.of([indentWithTab])),
        CMInstances[id].tabSizeCompartment.of(EditorState.tabSize.of(config.tabSize)),
        CMInstances[id].indentUnitCompartment.of(indentUnit.of(" ".repeat(config.tabSize))),

        EditorView.updateListener.of(async (update) => {
            if (update.docChanged) {
                await dotnetHelper.invokeMethodAsync("DocChangedFromJS", update.state.doc.toString())
            }
            if (update.focusChanged) {
                await dotnetHelper.invokeMethodAsync("FocusChangedFromJS", update.view.hasFocus)
                if (!update.view.hasFocus)
                    await dotnetHelper.invokeMethodAsync("DocChangedFromJS", update.state.doc.toString())
            }
            if (update.selectionSet) {
                await dotnetHelper.invokeMethodAsync("SelectionSetFromJS", update.state.selection.ranges.map(r => { return { from: r.from, to: r.to } }))
            }
        }),

        CMInstances[id].placeholderCompartment.of(placeholder(config.placeholder)),
        CMInstances[id].themeCompartment.of(getTheme(config.themeName)),
        CMInstances[id].readonlyCompartment.of(EditorState.readOnly.of(config.readOnly)),
        CMInstances[id].editableCompartment.of(EditorView.editable.of(config.editable)),
        autocompletion()
    ]

    CMInstances[id].state = EditorState.create({
        doc: config.doc,
        extensions: extensions
    })

    CMInstances[id].view = new EditorView({
        state: CMInstances[id].state,
        parent: document.getElementById(id),
    })
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
    CMInstances[id].view.dispatch({
        effects: [
            CMInstances[id].languageCompartment.reconfigure(language),
            languageChangeEffect.of(language.language)
        ]
    })
}

export function setAutoFormatMarkdownHeaders(id: string, autoFormatMarkdownHeaders: boolean) {
    CMInstances[id].view.dispatch({
        effects: CMInstances[id].markdownStylingCompartment.reconfigure(getDynamicHeaderStyling(autoFormatMarkdownHeaders))
    })
}

// Return the thememirror theme Extension matching the supplied string
function getTheme(themeName: string): Extension {
    switch (themeName) {
        case "Amy":
            return amy
        case "AyuLight":
            return ayuLight
        case "Barf":
            return barf
        case "Bespin":
            return bespin
        case "BirdsOfParadise":
            return birdsOfParadise
        case "BoysAndGirls":
            return boysAndGirls
        case "Clouds":
            return clouds
        case "Cobalt":
            return cobalt
        case "CoolGlow":
            return coolGlow
        case "Dracula":
            return dracula
        case "Espresso":
            return espresso
        case "NoctisLilac":
            return noctisLilac
        case "RosePineDawn":
            return rosePineDawn
        case "Smoothy":
            return smoothy
        case "SolarizedLight":
            return solarizedLight
        case "Tomorrow":
            return tomorrow
        case "Dracula":
            return dracula
        case "OneDark":
            return oneDark
        default:
            return EditorView.baseTheme({})
    }
}

function getLanguage(languageName: string): LanguageSupport {
    switch (languageName) {
        case "Cpp":
            return cpp()
        case "Css":
            return css()
        case "Html":
            return html()
        case "Java":
            return java()
        case "Javascript":
            return javascript()
        case "Json":
            return json()
        case "Lezer":
            return lezer()
        case "Python":
            return python()
        case "Rust":
            return rust()
        case "Sass":
            return sql()
        case "Sql":
            return sass()
        case "Xml":
            return xml()
        case "Markdown":
        default:
            return markdown({ base: markdownLanguage, codeLanguages: languages, addKeymap: true })
    }
}

function getDynamicHeaderStyling(autoFormatMarkdownHeaders: boolean): Extension {
    if (autoFormatMarkdownHeaders)
        return dynamicMarkdownHeaderStyling(markdownLanguage, languageChangeEffect)
    else
        return noMarkdownHeaderStyling()
}


export function dispose(id: string) {
    CMInstances[id] = undefined
    delete CMInstances[id]
}
