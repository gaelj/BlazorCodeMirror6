import { syntaxTree } from '@codemirror/language'
import type { EditorState, Extension, Range } from '@codemirror/state'
import { RangeSet, StateField } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { Decoration, EditorView, WidgetType } from '@codemirror/view'

interface ImageWidgetParams {
    url: string,
}

class ImageWidget extends WidgetType {
    readonly url

    constructor({ url }: ImageWidgetParams) {
        super()

        this.url = url
    }

    eq(imageWidget: ImageWidget) {
        return imageWidget.url === this.url
    }

    toDOM() {
        const container = document.createElement('div')
        const backdrop = container.appendChild(document.createElement('div'))
        const figure = backdrop.appendChild(document.createElement('figure'))
        const image = figure.appendChild(document.createElement('img'))

        container.setAttribute('aria-hidden', 'true')
        container.className = 'cm-image-container'
        backdrop.className = 'cm-image-backdrop'
        figure.className = 'cm-image-figure'
        image.className = 'cm-image-img'
        image.src = this.url

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
}

export const dynamicImagesExtension = (enabled: boolean = true): Extension => {
    if (!enabled) {
        // If the extension is disabled, return an empty extension
        return []
    }

    const imageRegex = /!\[.*?\]\((?<url>.*?)\)/

    const imageDecoration = (imageWidgetParams: ImageWidgetParams) => Decoration.widget({
        widget: new ImageWidget(imageWidgetParams),
        side: -1,
        block: true,
    })

    const decorate = (state: EditorState) => {
        const decorations: Range<Decoration>[] = []

        if (enabled) {
            syntaxTree(state).iterate({
                enter: ({ type, from, to }) => {
                    if (type.name === 'Image') {
                        const result = imageRegex.exec(state.doc.sliceString(from, to))

                        if (result && result.groups && result.groups.url)
                            decorations.push(imageDecoration({ url: result.groups.url }).range(state.doc.lineAt(from).from))
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
            if (transaction.docChanged)
                return decorate(transaction.state)

            return value.map(transaction.changes)
        },
        provide(field) {
            return EditorView.decorations.from(field)
        },
    })

    return [
        decorationStateField,
    ]
}
