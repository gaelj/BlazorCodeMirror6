import { EditorView, ViewUpdate, Decoration, DecorationSet, ViewPlugin } from "@codemirror/view";
import { StateEffectType, Range } from "@codemirror/state";
import { syntaxTree, Language } from "@codemirror/language";
import { StateEffect } from "@codemirror/state";
import { markdownLanguage } from "@codemirror/lang-markdown";
import { Extension } from "@codemirror/state";

/**
 * Return a ViewPlugin that dynamically styles markdown headers based on the header level
 * @param markdownLang
 * @param languageChangeEffect
 * @returns
 */
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
                        const line = doc.lineAt(node.from).text.trimStart();

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

/**
 * Return a ViewPlugin that does nothing
 * @returns
 */
function noMarkdownHeaderStyling() {
    return ViewPlugin.fromClass(class {
        decorations: DecorationSet;
        constructor(view: EditorView) { }
        update(update: ViewUpdate) { }
    }, {
        decorations: v => v.decorations
    });
}

/**
 * StateEffect that is triggered when the language changes
 */
export const languageChangeEffect = StateEffect.define<Language>()

/**
 * Return the header styling Extension matching the supplied parameter
 * @param autoFormatMarkdownHeaders
 * @returns
 */
export function getDynamicHeaderStyling(autoFormatMarkdownHeaders: boolean): Extension {
    if (autoFormatMarkdownHeaders)
        return dynamicMarkdownHeaderStyling(markdownLanguage, languageChangeEffect)

    else
        return noMarkdownHeaderStyling()
}
