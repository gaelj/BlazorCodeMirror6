import type { EditorState, Extension, Range } from '@codemirror/state'
import { RangeSet, StateField, StateEffect } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { Decoration, EditorView, ViewUpdate, WidgetType, ViewPlugin } from "@codemirror/view"
import { syntaxTree } from "@codemirror/language"
import { SyntaxNodeRef } from "@lezer/common"
import { isCursorInRange } from "./CmHelpers"

const supportedLanguages = [
    'actdiag',
    'blockdiag',
    'bpmn',
    'bytefield',
    'c4plantuml',
    'd2',
    'dbml',
    'diagramsnet',
    'ditaa',
    'dot',
    'erd',
    'excalidraw',
    'graphviz',
    'mermaid',
    'nomnoml',
    'nwdiag',
    'packetdiag',
    'pikchr',
    'plantuml',
    'rackdiag',
    'seqdiag',
    'structurizr',
    'svgbob',
    'symbolator',
    'tikz',
    'umlet',
    'vega',
    'vegalite',
    'wavedrom',
    'wireviz',
]

const svgCache = new Map<string, { response: string, error: boolean }>()

function fetchSvgFromCache(code: string, language: string): { response: string, error: boolean } {
    const key = `${language}\n${code}`
    const cached = svgCache.get(key)
    if (cached) return cached
    return null
}

function readSvgDimensions(svgContent: string): { width: number, height: number } {
    const parser = new DOMParser()
    const svg = parser.parseFromString(svgContent, "image/svg+xml")
    const svgElement = svg.getElementsByTagName("svg")[0]
    const width = svgElement.getAttribute("width")
    const height = svgElement.getAttribute("height")
    return { width: parseInt(width), height: parseInt(height) }
}

async function fetchDiagramSvg(view: EditorView, code: string, language: string, krokiUrl: string): Promise<{ response: string, error: boolean }> {
    const key = `${language}\n${code}`
    if (svgCache.has(key)) return
    let svgContent: { response: string, error: boolean }

    try {
        const response = await fetch(`${krokiUrl}/${language}/svg`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Accept': 'image/svg+xml',
            },
            body: code
        })
        svgContent = { response: await response.text(), error: response.status !== 200 }
    }
    catch (error) {
        console.error(error)
        svgContent = { response: error.toString(), error: true }
    }
    if (svgCache.has(key)) return

    svgCache.set(key, svgContent)

    const { height } = readSvgDimensions(svgContent.response)

    view.dispatch({
        effects: updateDiagramEffect.of({ code, language, svgContent: svgContent.response, from: null, to: null, height })
    })
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
    from: number,
    height: number,
    to: number,
}

const updateDiagramEffect = StateEffect.define<DiagramWidgetParams>()

class DiagramWidget extends WidgetType {
    readonly language: string
    readonly code: string
    readonly from: number
    readonly to: number
    readonly height: number
    public svgContent: string | null

    constructor({ language, code, svgContent = null, from, to, height }: DiagramWidgetParams) {
        super()

        this.language = language
        this.code = code
        this.from = from
        this.to = to
        this.height = height
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

    toDOM(view: EditorView) {
        const container = document.createElement('div')
        container.setAttribute('aria-hidden', 'true')

        if (this.svgContent === null) {
            container.innerHTML = `Loading ${this.language} diagram...`
            container.style.fontStyle = 'italic'
            container.style.color = 'gray'
        }
        else {
            container.innerHTML = this.svgContent
            const svgElement = container.getElementsByTagName("svg")[0]
            svgElement.setAttribute('aria-hidden', 'true')
            svgElement.style.backgroundColor = 'white'
            svgElement.style.maxHeight = '800px'
            svgElement.style.maxWidth = 'calc(100% - 2em)'
            svgElement.style.objectFit = 'scale-down'
            container.style.fontStyle = ''
            container.style.color = ''
            container.style.backgroundColor = 'transparent'
        }

        container.style.display = 'flex'
        container.style.alignItems = 'center'
        container.style.justifyContent = 'center'
        container.style.maxWidth = '100%'
        container.style.overflow = 'hidden'

        if (this.from !== null) {
            container.style.cursor = 'pointer'
            container.title = 'Click to edit diagram'
            container.onclick = () => {
                container.title = 'Click to close diagram edition'
                const pos = this.from
                const transaction = view.state.update({selection: {anchor: pos}, scrollIntoView: true})
                view.dispatch(transaction)
            }
        }
        else {
            container.style.cursor = 'pointer'
            container.title = 'Click to close diagram edition'
            container.onclick = () => {
                container.title = 'Click to edit diagram'
                const pos = this.to + 1
                const transaction = view.state.update({selection: {anchor: pos}, scrollIntoView: true})
                view.dispatch(transaction)
            }
        }
        view.requestMeasure()

        return container
    }

    ignoreEvent: () => false

    get estimatedHeight(): number {
        return this.height ?? -1
    }
}

function getLanguageAndCode(state: EditorState, node: SyntaxNodeRef) {
    const { from, to } = node
    const codeAndLanguage = state.doc.sliceString(from, to)
    const language = detectDiagramLanguage(codeAndLanguage)
    const code = codeAndLanguage.split('\n').slice(1, -1).join('\n')
    return { language, code }
}

const diagramPlugin = (krokiUrl: string) => ViewPlugin.fromClass(
    class {
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
    },
)

export const dynamicDiagramsExtension = (enabled: boolean = true, krokiUrl: string = "https://kroki.io"): Extension => {
    if (!enabled) {
        return []
    }

    const diagramReplacementDecoration = (diagramWidgetParams: DiagramWidgetParams) => Decoration.replace({
        widget: new DiagramWidget(diagramWidgetParams),
        side: -1,
        block: true,
        inclusive: false,
    })

    const diagramWidgetDecoration = (diagramWidgetParams: DiagramWidgetParams) => Decoration.widget({
        widget: new DiagramWidget(diagramWidgetParams),
        side: -1,
        block: true,
        inclusive: false,
    })

    function getDecorationsRange(state: EditorState, node: SyntaxNodeRef, updatedCode?: string, updatedLanguage?: string, updatedSvgContent?: string, from?: number, to?: number, width?: number, height?: number) {
        const decorationsRange: Range<Decoration>[] = []
        if (node.type.name === 'FencedCode') {
            const { language, code } = getLanguageAndCode(state, node)
            if (language) {
                const cursorInRange = isCursorInRange(state, from, to)

                let params: DiagramWidgetParams
                if (language === updatedLanguage && code === updatedCode && updatedCode && updatedLanguage) {
                    const { height } = updatedSvgContent ? readSvgDimensions(updatedSvgContent) : { height: null }
                    params = { language, code, svgContent: updatedSvgContent, from: cursorInRange ? null : from, to, height }
                } else {
                    const svgContent = fetchSvgFromCache(code, language)
                    const { height } = svgContent?.response ? readSvgDimensions(svgContent?.response) : { height: null }
                    params = { language, code, svgContent: svgContent?.response, from: cursorInRange ? null : from, to, height }
                }

                if (cursorInRange)
                    decorationsRange.push(diagramWidgetDecoration(params).range(state.doc.lineAt(from).from))
                else
                    decorationsRange.push(diagramReplacementDecoration(params).range(from, to))
            }
        }
        return decorationsRange
    }

    const decorate = (state: EditorState, updatedCode?: string, updatedLanguage?: string, updatedSvgContent?: string, width: number = null, height: number = null) => {
        let decorationsRange: Range<Decoration>[] = []
        if (enabled) {
            syntaxTree(state).iterate({
                enter: (node) => {
                    const { from, to } = node
                    decorationsRange.push(...getDecorationsRange(state, node, updatedCode, updatedLanguage, updatedSvgContent, from, to, width, height))
                },
            })
        }
        return decorationsRange.length > 0 ? RangeSet.of(decorationsRange) : Decoration.none
    }

    const decorationStateField = StateField.define<DecorationSet>({
        create(state) {
            return decorate(state)
        },
        update(value, transaction) {
            // Apply the effect to update diagram content
            if (transaction.effects.some(_ => true)) {
                for (const effect of transaction.effects) {
                    if (effect.is(updateDiagramEffect)) {
                        const { code, language, svgContent, height } = effect.value
                        return decorate(transaction.state, code, language, svgContent, height)
                    }
                }
            }
            else {
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
