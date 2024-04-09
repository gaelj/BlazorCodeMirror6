import { syntaxTree } from '@codemirror/language'
import type { EditorState, Extension, Range } from '@codemirror/state'
import { RangeSet, StateField } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { Decoration, EditorView, WidgetType, ViewUpdate } from '@codemirror/view'
import { buildWidget } from './lib/codemirror-kit'


const imageWidget = (basePathForLinks: string, src: string, from: number) => buildWidget({
    src: src,
    basePathForLinks: basePathForLinks,
    eq(other) {
        return other.src === src && basePathForLinks === other.basePathForLinks
    },

    toDOM(view: EditorView) {
        basePathForLinks = basePathForLinks
            ? basePathForLinks.replace(/\/+$/, '') + "/"
            : '';
        const container = document.createElement('div')
        container.setAttribute('aria-hidden', 'true')
        const image = container.appendChild(document.createElement('img'))

        image.setAttribute('aria-hidden', 'true')
        if (src.includes('://') || src.startsWith('data:'))
            image.src = src;
        else
            image.src = `${basePathForLinks}${src}`
        image.style.maxHeight = '320px'
        image.style.maxWidth = 'calc(100% - 2em)'
        image.style.objectFit = 'scale-down'

        container.style.display = 'flex'
        container.style.alignItems = 'center'
        container.style.justifyContent = 'center'
        container.style.maxWidth = '100%'
        container.style.overflow = 'hidden'

        container.style.cursor = 'pointer'
        container.title = 'Click to edit image link'
        container.onclick = () => {
            if (from) {
                const transaction = view.state.update({selection: {anchor: from}, scrollIntoView: true})
                view.dispatch(transaction)
            }
        }

        view.requestMeasure()

        return container
    },

    ignoreEvent: () => false,

    get estimatedHeight(): number {
        return 320
    },
})

export const dynamicImagesExtension = (basePathForLinks: string, enabled: boolean = true): Extension => {
    if (!enabled) {
        return []
    }

    const imageRegex = /!\[.*?\]\((?<src>.*?)\)/

    const imageDecoration = (src: string, from: number) => Decoration.widget({
        widget: imageWidget(basePathForLinks, src, from),
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
                        if (result && result.groups && result.groups.src) {
                            decorations.push(imageDecoration(
                                result.groups.src,
                                to
                            ).range(state.doc.lineAt(from).from))
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
