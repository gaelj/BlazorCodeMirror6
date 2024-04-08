import type { EditorState, Extension, Range } from '@codemirror/state'
import { RangeSet, StateField, StateEffect } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { Decoration, EditorView, ViewUpdate, WidgetType, ViewPlugin } from "@codemirror/view"
import { syntaxTree, foldCode, unfoldCode } from "@codemirror/language"
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
    if (!svgElement)
        return { width: 0, height: 0 }
    const width = svgElement.getAttribute("width")
    const height = svgElement.getAttribute("height")
    return { width: parseInt(width), height: parseInt(height) }
}

async function fetchDiagramSvg(view: EditorView, code: string, language: string, krokiUrl: string, node: SyntaxNodeRef): Promise<{ response: string, error: boolean }> {
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
        effects: updateDiagramEffect.of({ code, language, svgContent: svgContent.response, from: node.from, to: node.to, height })
    })
}

export function detectDiagramLanguage(code: string): string | undefined {
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

        if (this.svgContent === null || this.svgContent === undefined) {
            container.innerHTML = `Loading ${this.language} diagram...`
            container.style.fontStyle = 'italic'
            container.style.color = 'gray'
        }
        else {
            container.innerHTML = this.svgContent
            const svgElement = container.getElementsByTagName("svg")[0]
            if (svgElement !== null && svgElement !== undefined) {
                svgElement.setAttribute('aria-hidden', 'true')
                svgElement.style.backgroundColor = 'white'
                svgElement.style.maxHeight = '800px'
                svgElement.style.maxWidth = 'calc(100% - 2em)'
                svgElement.style.objectFit = 'scale-down'
                svgElement.setAttribute('preserveAspectRatio', "xMinYMin meet")
            }
            container.style.fontStyle = ''
            container.style.color = ''
            container.style.backgroundColor = 'transparent'
        }

        container.style.display = 'flex'
        container.style.alignItems = 'center'
        container.style.justifyContent = 'center'
        container.style.maxWidth = '100%'
        container.style.overflow = 'hidden'

        container.style.cursor = 'pointer'
        container.title = this.editMessage
        container.onclick = () => this.onEdit(view, container)
        view.requestMeasure()

        return container
    }

    private readonly editMessage = 'Click to edit diagram'
    private readonly closeMessage = 'Click to close diagram edition'

    private onEdit(view: EditorView, container: HTMLDivElement) {
        container.title = this.editMessage
        view.dispatch(view.state.update({selection: {anchor: this.from}, scrollIntoView: true}))
        unfoldCode(view)
        container.onclick = () => this.onClose(view, container)
    }

    private onClose(view: EditorView, container: HTMLDivElement) {
        container.title = this.closeMessage
        view.dispatch(view.state.update({selection: {anchor: this.from}, scrollIntoView: true}))
        foldCode(view)
        view.dispatch(view.state.update({selection: {anchor: this.to + 1}, scrollIntoView: true}))
        container.onclick = () => this.onEdit(view, container)
    }
    ignoreEvent: () => false

    get estimatedHeight(): number {
        return this.height ?? -1
    }
}

function getLanguageAndCode(state: EditorState, node: SyntaxNodeRef) {
    const { from, to } = node
    const codeAndLanguage = state.doc.sliceString(from, to)
    const diagramLanguage = detectDiagramLanguage(codeAndLanguage)
    const code = codeAndLanguage.split('\n').slice(1, -1).join('\n')
    return { diagramLanguage, code }
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
                this.parseDocumentAndLoadDiagrams(this.view)
            })
        }

        parseDocumentAndLoadDiagrams(view: EditorView) {
            syntaxTree(view.state).iterate({
                enter: (node) => {
                    if (node.type.name === 'FencedCode') {
                        const { diagramLanguage, code } = getLanguageAndCode(view.state, node)
                        if (diagramLanguage) {
                            fetchDiagramSvg(view, code, diagramLanguage, krokiUrl, node)
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

    const diagramWidgetDecoration = (diagramWidgetParams: DiagramWidgetParams) => Decoration.widget({
        widget: new DiagramWidget(diagramWidgetParams),
        side: -1,
        block: true,
        inclusive: false,
    })

    function getDecorationsRange(state: EditorState, node: SyntaxNodeRef, from?: number, to?: number) {
        if (node.type.name !== 'FencedCode') {
            return null
        }
        const { diagramLanguage, code } = getLanguageAndCode(state, node)
        if (diagramLanguage === undefined) {
            return null
        }
        const cursorInRange = isCursorInRange(state, from, to)

        let params: DiagramWidgetParams
        params = { language: diagramLanguage, code, from, to, svgContent: null, height: null }

        return diagramWidgetDecoration(params).range(state.doc.lineAt(from).from)
    }

    const decorate = (state: EditorState) => {
        let decorationsRange: Range<Decoration>[] = []
        if (enabled) {
            syntaxTree(state).iterate({
                enter: (node) => {
                    const { from, to } = node
                    const decorateRange = getDecorationsRange(state, node, from, to)
                    if (decorateRange)
                        decorationsRange.push(decorateRange)
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
            return decorate(transaction.state)
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
