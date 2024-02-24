import { LanguageSupport, Language } from "@codemirror/language"
import { lezer, lezerLanguage } from "@codemirror/lang-lezer"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { mermaid, mermaidLanguage, flowchartLanguageDescription, ganttLanguageDescription, journeyLanguageDescription, mermaidLanguageDescription, mindmapLanguageDescription, pieLanguageDescription, requirementLanguageDescription, sequenceLanguageDescription } from "codemirror-lang-mermaid"
import { languages } from "@codemirror/language-data"
import { StateEffect } from "@codemirror/state"
import { customMarkdownKeymap } from "./CmKeymap"
import { consoleLog } from "./CmLogging"

/**
 * StateEffect that is triggered when the language changes
 */
export const languageChangeEffect = StateEffect.define<Language>()

/**
 * Return the LanguageSupport matching the supplied language name string
 * @param languageName
 * @returns
 */
export async function getLanguage(id: string, languageName: string, fileNameOrExtension: string): Promise<LanguageSupport> {
    if (fileNameOrExtension) {
        var extension = fileNameOrExtension.split('.').pop()
        if (extension) {
            var selectedLanguage = languages.find((language) => language.extensions.includes(extension))
            if (selectedLanguage) {
                consoleLog(id, "loading Language: " + selectedLanguage.name)
                return await selectedLanguage.load()
            }
        }
    }
    consoleLog(id, "getLanguage: " + languageName)
    switch (languageName) {
        case "Plain Text":
        case "CSV":
        case "TSV":
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
                    ganttLanguageDescription,
                ],
                addKeymap: true
            })
        default:
            var selectedLanguage = languages.find((language) => language.name === languageName)
            if (selectedLanguage) {
                consoleLog(id, "loading Language: " + selectedLanguage.name)
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
export function getLanguageKeyMaps(languageName: string, fileNameOrExtension: string) {
    if (fileNameOrExtension) {
        var extension = fileNameOrExtension.split('.').pop()
        if (extension) {
            var selectedLanguage = languages.find((language) => language.extensions.includes(extension))
            languageName = selectedLanguage?.name
        }
    }
    switch (languageName) {
        case "Markdown":
            return customMarkdownKeymap
        default:
            return []
    }
}
