import { LanguageSupport, Language } from "@codemirror/language"
import { lezer, lezerLanguage } from "@codemirror/lang-lezer"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { mermaid, mermaidLanguage, flowchartLanguageDescription, ganttLanguageDescription, journeyLanguageDescription, mermaidLanguageDescription, mindmapLanguageDescription, pieLanguageDescription, requirementLanguageDescription, sequenceLanguageDescription } from "codemirror-lang-mermaid"
import { languages } from "@codemirror/language-data"
import { StateEffect } from "@codemirror/state"
import { customMarkdownKeymap } from "./CmKeymap"

/**
 * StateEffect that is triggered when the language changes
 */
export const languageChangeEffect = StateEffect.define<Language>()

/**
 * Return the LanguageSupport matching the supplied language name string
 * @param languageName
 * @returns
 */
export async function getLanguage(languageName: string): Promise<LanguageSupport> {
    console.log("getLanguage: " + languageName)
    switch (languageName) {
        case "PlainText":
            return null
        case "Lezer":
            return lezer()
        case "Mermaid":
            return mermaid()
        case "Markdown":
            return markdown({
                base: markdownLanguage,
                codeLanguages: [
                    ...languages,
                    mermaidLanguageDescription,
                    mindmapLanguageDescription,
                    pieLanguageDescription,
                    flowchartLanguageDescription,
                    sequenceLanguageDescription,
                    journeyLanguageDescription,
                    requirementLanguageDescription,
                    ganttLanguageDescription],
                addKeymap: true
            })
        default:
            var selectedLanguage = languages.find((language) => language.name === languageName)
            if (selectedLanguage) {
                console.log("loading Language: " + selectedLanguage.name)
                return await selectedLanguage.load()
            }
            console.error("Language not found: " + languageName)
            return null
    }
}

/**
 * Return the custom keymap matching the supplied language name string
 * @param languageName
 * @returns
 */
export function getLanguageKeyMaps(languageName: string) {
    switch (languageName) {
        case "Markdown":
            return customMarkdownKeymap
        default:
            return []
    }
}
