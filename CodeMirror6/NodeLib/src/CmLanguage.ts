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
import { languages } from "@codemirror/language-data";

/**
 * Return the LanguageSupport matching the supplied language name string
 * @param languageName
 * @returns
 */
export function getLanguage(languageName: string): LanguageSupport {
    switch (languageName) {
        case "Cpp":
            return cpp();
        case "Css":
            return css();
        case "Html":
            return html();
        case "Java":
            return java();
        case "Javascript":
            return javascript();
        case "Json":
            return json();
        case "Lezer":
            return lezer();
        case "Python":
            return python();
        case "Rust":
            return rust();
        case "Sass":
            return sql();
        case "Sql":
            return sass();
        case "Xml":
            return xml();
        case "Markdown":
        default:
            return markdown({ base: markdownLanguage, codeLanguages: languages, addKeymap: true });
    }
}
