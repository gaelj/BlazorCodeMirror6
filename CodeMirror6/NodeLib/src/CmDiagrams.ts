import type { EditorState, Extension, Range } from '@codemirror/state'
import { RangeSet, StateField, StateEffect } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { Decoration, EditorView, ViewUpdate, WidgetType, ViewPlugin } from "@codemirror/view"
import { syntaxTree } from "@codemirror/language"
import { SyntaxNodeRef } from "@lezer/common"

const supportedLanguages = [
    'actdiag', 'blockdiag', 'bpmn', 'graphviz', 'meme', 'nomnoml', 'packetdiag',
    'rackdiag', 'c4plantuml', 'seqdiag', 'svgbob',
    'umlet', 'vega', 'vegalite', 'wavedrom', 'asciimath', 'bytefield', 'ditaa', 'erd',
    'jcckit', 'mathml', 'mermaid', 'plantuml',
    'websequencediagrams', 'excalidraw'
]

const svgCache = new Map<string, { response: string, error: boolean }>()

function fetchSvgFromCache(code: string, language: string): { response: string, error: boolean } {
    const key = `${language}\n${code}`
    const cached = svgCache.get(key)
    if (cached)
        return cached
    return null
}

async function fetchDiagramSvg(view: EditorView, code: string, language: string, krokiUrl: string): Promise<{ response: string, error: boolean }> {
    const key = `${language}\n${code}`
    let svgContent = fetchSvgFromCache(code, language)
    if (svgContent) return svgContent

    const response = await fetch(`${krokiUrl}/${language}/svg`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'Accept': 'image/svg+xml' },
        body: code
    })
    svgContent = { response: await response.text(), error: response.status !== 200 }
    if (!svgCache.has(key))
        svgCache.set(key, svgContent)
    view.dispatch({
        effects: updateDiagramEffect.of({ code, language, svgContent: svgContent.response })
    })
    return svgContent
}

function detectDiagramLanguage(code: string): string | undefined {
    const lines = code.split('\n')
    if (lines.length === 0) {
        return undefined
    }
    const firstLine = lines[0]
    if (firstLine.startsWith('```')) {
        const language = firstLine.substring(3)
        if (supportedLanguages.includes(language)) {
            return language
        }
    }
    return undefined
}

interface DiagramWidgetParams {
    language: string,
    code: string,
    svgContent: string,
}

const updateDiagramEffect = StateEffect.define<{ code: string, language: string, svgContent: string }>()

class DiagramWidget extends WidgetType {
    readonly language: string
    readonly code: string
    public svgContent: string | null

    constructor({ language, code, svgContent = null }: DiagramWidgetParams) {
        super()

        this.language = language
        this.code = code
        this.svgContent = svgContent

        if (!this.svgContent) {
            const cached = fetchSvgFromCache(code, language)
            if (cached)
                this.svgContent = cached.response
        }
    }

    eq(imageWidget: DiagramWidget) {
        return imageWidget.language === this.language && imageWidget.code === this.code && imageWidget.svgContent === this.svgContent
    }

    toDOM() {
        const container = document.createElement('div')
        const backdrop = container.appendChild(document.createElement('div'))
        const figure = backdrop.appendChild(document.createElement('figure'))
        const image = figure.appendChild(document.createElement('div'))

        container.setAttribute('aria-hidden', 'true')
        container.className = 'cm-image-container'
        backdrop.className = 'cm-image-backdrop'
        figure.className = 'cm-image-figure'
        image.className = 'cm-image-img'
        image.innerHTML = this.svgContent ?? `Loading ${this.language} diagram...`

        container.style.paddingBottom = '0.5rem'
        container.style.paddingTop = '0.5rem'

        backdrop.classList.add('cm-image-backdrop')

        backdrop.style.borderRadius = '0px'
        backdrop.style.display = 'flex'
        backdrop.style.alignItems = 'center'
        backdrop.style.justifyContent = 'center'
        backdrop.style.overflow = 'hidden'
        backdrop.style.maxWidth = '100%'

        figure.style.margin = '0'

        image.style.display = 'block'
        image.style.maxHeight = '80vh'
        image.style.maxWidth = '100%'
        image.style.width = '100%'

        return container
    }

    update(update: { svgContent: string }) {
        if (this.svgContent !== update.svgContent) {
            this.svgContent = update.svgContent
            return true
        }
        return false
    }
}

function getLanguageAndCode(state: EditorState, node: SyntaxNodeRef) {
    const { from, to } = node
    const codeAndLanguage = state.doc.sliceString(from, to)
    const language = detectDiagramLanguage(codeAndLanguage)
    const code = codeAndLanguage.split('\n').slice(1, -1).join('\n')
    return { language, code }
}

const diagramPlugin = (krokiUrl: string) => ViewPlugin.fromClass(class {
    view: EditorView

    constructor(view: EditorView) {
        this.view = view
        this.parseDocumentAndLoadDiagrams(this.view)
    }

    update(update: ViewUpdate) {
        update.transactions.forEach(tr => {
            if (tr.docChanged) {
                this.parseDocumentAndLoadDiagrams(this.view)
            }
        })
    }

    parseDocumentAndLoadDiagrams(view: EditorView) {
        syntaxTree(view.state).iterate({
            enter: (node) => {
                if (node.type.name === 'FencedCode') {
                    const { language, code } = getLanguageAndCode(view.state, node)
                    if (language) {
                        fetchDiagramSvg(view, code, language, krokiUrl)
                    }
                }
            },
        })
    }
})

export const dynamicDiagramsExtension = (enabled: boolean = true, krokiUrl: string = "https://kroki.io"): Extension => {
    if (!enabled) {
        return []
    }

    const diagramDecoration = (diagramWidgetParams: DiagramWidgetParams) => Decoration.widget({
        widget: new DiagramWidget(diagramWidgetParams),
        side: -1,
        block: true,
    })

    const decorate = (state: EditorState, updatedCode?: string, updatedLanguage?: string, updatedSvgContent?: string) => {
        const decorations: Range<Decoration>[] = []

        if (enabled) {
            syntaxTree(state).iterate({
                enter: (node) => {
                    const { type, from, to } = node
                    if (type.name === 'FencedCode') {
                        const { language, code } = getLanguageAndCode(state, node)
                        if (language) {
                            if (language === updatedLanguage && code === updatedCode && updatedCode && updatedLanguage) {
                                decorations.push(diagramDecoration({ language, code, svgContent: updatedSvgContent }).range(state.doc.lineAt(from).from))
                            } else {
                                const svgContent = fetchSvgFromCache(code, language)
                                decorations.push(diagramDecoration({ language, code, svgContent: svgContent?.response }).range(state.doc.lineAt(from).from))
                            }
                        }
                    }
                },
            })
        }

        return decorations.length > 0 ? RangeSet.of(decorations) : Decoration.none
    }

    const decorationStateField = StateField.define<DecorationSet>({
        create(state) {
            return decorate(state)
        },
        update(value, transaction) {
            // Apply the effect to update diagram content
            for (const effect of transaction.effects) {
                if (effect.is(updateDiagramEffect)) {
                    const { code, language, svgContent } = effect.value
                    return decorate(transaction.state, code, language, svgContent)
                }
            }

            if (transaction.docChanged) {
                return decorate(transaction.state)
            }

            return value.map(transaction.changes)
        },
        provide(field) {
            return EditorView.decorations.from(field)
        },
    })

    return [
        diagramPlugin(krokiUrl),
        decorationStateField,
    ]
}
