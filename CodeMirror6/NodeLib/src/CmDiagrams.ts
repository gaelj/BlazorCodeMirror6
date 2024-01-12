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

    const { width, height } = readSvgDimensions(svgContent.response)

    view.dispatch({
        effects: updateDiagramEffect.of({ code, language, svgContent: svgContent.response, from: null, width, height })
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
}

const updateDiagramEffect = StateEffect.define<DiagramWidgetParams>()

class DiagramWidget extends WidgetType {
    readonly language: string
    readonly code: string
    readonly from: number
    readonly height: number
    public svgContent: string | null

    constructor({ language, code, svgContent = null, from, height }: DiagramWidgetParams) {
        super()

        this.language = language
        this.code = code
        this.from = from
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
        const backdrop = container.appendChild(document.createElement('div'))
        const figure = backdrop.appendChild(document.createElement('figure'))
        const image = figure.appendChild(document.createElement('div'))

        container.setAttribute('aria-hidden', 'true')
        container.className = 'cm-image-container'
        backdrop.className = 'cm-image-backdrop'
        figure.className = 'cm-image-figure'
        image.className = 'cm-image-img'
        if (this.svgContent === null) {
            image.innerHTML = `Loading ${this.language} diagram...`
            image.style.fontStyle = 'italic'
            image.style.color = 'gray'
        }
        else {
            image.innerHTML = this.svgContent
            image.style.fontStyle = ''
            image.style.color = ''
        }

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

        image.style.display = 'flex'
        image.style.maxHeight = '80vh'
        image.style.maxWidth = '100%'
        image.style.width = '100%'

        if (this.from !== null) {
            container.style.cursor = 'pointer'
            container.title = 'Click to edit diagram'
            container.onclick = () => {
                container.style.cursor = 'default'
                container.title = ''
                const pos = this.from
                const transaction = view.state.update({selection: {anchor: pos}})
                view.dispatch(transaction)
            }
        }

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
                    params = { language, code, svgContent: updatedSvgContent, from: cursorInRange ? null : from, height }
                } else {
                    const svgContent = fetchSvgFromCache(code, language)
                    const { height } = svgContent?.response ? readSvgDimensions(svgContent?.response) : { height: null }
                    params = { language, code, svgContent: svgContent?.response, from: cursorInRange ? null : from, height }
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
