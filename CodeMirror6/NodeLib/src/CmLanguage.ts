import { LanguageSupport } from "@codemirror/language";
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
import { csharp, csharpLanguage } from "@replit/codemirror-lang-csharp"
import { flowchartLanguageDescription, ganttLanguageDescription, journeyLanguageDescription, mermaid, mermaidLanguage, mermaidLanguageDescription, mindmapLanguageDescription, pieLanguageDescription, requirementLanguageDescription, sequenceLanguageDescription } from "codemirror-lang-mermaid"
import { languages } from "@codemirror/language-data"
import { Language } from "@codemirror/language"
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
export function getLanguage(languageName: string): LanguageSupport {
    switch (languageName) {
        case "Csharp":
            return csharp()
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
        case "Mermaid":
            return mermaid()
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
            console.error("Language not found: " + languageName)
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
    }
}

/**
 * Return the custom keymap matching the supplied language name string
 * @param languageName
 * @returns
 */
export function getLanguageKeyMaps(languageName: string) {
    switch (languageName) {
        case "Csharp":
            return []
        case "Cpp":
            return []
        case "Css":
            return []
        case "Html":
            return []
        case "Java":
            return []
        case "Javascript":
            return []
        case "Json":
            return []
        case "Lezer":
            return []
        case "Mermaid":
            return []
        case "Python":
            return []
        case "Rust":
            return []
        case "Sass":
            return []
        case "Sql":
            return []
        case "Xml":
            return []
        case "Markdown":
            default:
            return customMarkdownKeymap
    }
}
