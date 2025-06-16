import { Completion, CompletionContext, CompletionSource, autocompletion } from "@codemirror/autocomplete"
import { cssCompletionSource } from "@codemirror/lang-css";
import { syntaxTree } from "@codemirror/language";

let cachedCssVariableCompletions: Completion[] = []
let cachedCssClassNameCompletions: Completion[] = []

function createCssCompletionsSource(): CompletionSource {
    return async (context: CompletionContext) => {


        let defaultResult = await cssCompletionSource(context);
        let res;
        let from;
        let match;

        var node = syntaxTree(context.state).resolveInner(context.pos, -1);
        console.log("Node type: ", node.type.name, " at pos: ", context.pos, " from: ", node.from, " to: ", node.to);

        if (node.type.name == "VariableName"  ) {
            res = cachedCssVariableCompletions;
            from = node.from; 
        } else if (node.type.name == "ClassSelector") {
            res = cachedCssClassNameCompletions;
            from = context.pos - 1;//node.from;
        } else if (node.type.name == "ClassName") {
            res = cachedCssClassNameCompletions;
            from = node.from-1;
        }
        else if (match = context.matchBefore(/(?<=var\(\s*)-(-)?\w*/)) //this one was necessary because it sometimes bugs out and doesn't report VariableName when typing var(-
        {
            res = cachedCssVariableCompletions;
            from = match.from;
        }
        else {
            return defaultResult;
        }

        if (defaultResult && defaultResult.options) {
            res = [...res, ...defaultResult.options];
        }

        return {
            from: from,
            to: context.pos,
            options: res,
            filter: true,
            validFor: defaultResult ? defaultResult.validFor : undefined
        };
    };
}

export function setCachedCssCompletions(completions: Completion[]) {
    cachedCssVariableCompletions = completions.filter(c => c.label.startsWith('--'));
    cachedCssClassNameCompletions = completions.filter(c => c.label.startsWith('.')); // filter for class names
}

export const cssCompletionExtension = (enabled: boolean) => {
    if (!enabled) return []
    return [createCssCompletionsSource()]
}
