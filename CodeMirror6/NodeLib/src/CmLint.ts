import { Diagnostic } from "@codemirror/lint"
import { ViewUpdate } from "@codemirror/view"
import { DotNet } from "@microsoft/dotnet-js-interop"
import { EditorView } from "codemirror"

import { consoleLog } from "./CmLogging"
import { CMInstances } from './CmInstance'

/**
 * Fetch diagnostics from the Blazor component
 */
export async function externalLintSource(id: string, view: EditorView, dotnetHelper: DotNet.DotNetObject): Promise<readonly Diagnostic[]> {
    try {
        const code = view.state.doc.toString()
        const errors: Diagnostic[] = await dotnetHelper.invokeMethodAsync("LintingRequestedFromJS", code)
        if (errors.length > 0)
            consoleLog(id, 'Linter found:', errors)
        return errors
    } catch (error) {
        console.error('Linter error:', error)
        return
    }
}

/**
 * Request a linter refresh. Linting is always re-done on document changes.
 */
export function requestLinterRefresh(id: string) {
    consoleLog(id, `Linter refresh requested for Id ${id}`)
    CMInstances[id].lintRefreshRequested = true
}

/**
 * A function that fetches the linter configuration
 */
export function getExternalLinterConfig(id: string): any {
    return {
        /**
        Time to wait (in milliseconds) after a change before running
        the linter. Defaults to 750ms.
        */
        delay: 750,
        /**
        Optional predicate that can be used to indicate when diagnostics
        need to be recomputed. Linting is always re-done on document
        changes.
        */
        needsRefresh: (update: ViewUpdate) => {
            const lintRefreshRequested = CMInstances[id].lintRefreshRequested
            CMInstances[id].lintRefreshRequested = false
            return lintRefreshRequested
        },
        /**
        Optional filter to determine which diagnostics produce markers
        in the content.
        */
        markerFilter: null, // | DiagnosticFilter,
        /**
        Filter applied to a set of diagnostics shown in a tooltip. No
        tooltip will appear if the empty set is returned.
        */
        tooltipFilter: null, // | DiagnosticFilter,
    }
}
