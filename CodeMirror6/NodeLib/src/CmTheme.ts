import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { amy, ayuLight, barf, bespin, birdsOfParadise, boysAndGirls, clouds, cobalt, coolGlow, dracula, espresso, noctisLilac, rosePineDawn, smoothy, solarizedLight, tomorrow } from 'thememirror';
import { oneDark } from "@codemirror/theme-one-dark";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github"
import { monokai } from "@uiw/codemirror-theme-monokai"
import { nord } from "@uiw/codemirror-theme-nord"
import { solarizedDark } from "@uiw/codemirror-theme-solarized"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"

/**
 * Return the thememirror theme Extension matching the supplied string
 * @param themeName
 * @returns
 */
export function getTheme(themeName: string): Extension {
    switch (themeName) {
        case "Amy":
            return amy;
        case "AyuLight":
            return ayuLight;
        case "Barf":
            return barf;
        case "Bespin":
            return bespin;
        case "BirdsOfParadise":
            return birdsOfParadise;
        case "BoysAndGirls":
            return boysAndGirls;
        case "Clouds":
            return clouds;
        case "Cobalt":
            return cobalt;
        case "CoolGlow":
            return coolGlow;
        case "Dracula":
            return dracula;
        case "Espresso":
            return espresso;
        case "NoctisLilac":
            return noctisLilac;
        case "RosePineDawn":
            return rosePineDawn;
        case "Smoothy":
            return smoothy;
        case "SolarizedLight":
            return solarizedLight;
        case "Tomorrow":
            return tomorrow;
        case "Dracula":
            return dracula;
        case "OneDark":
            return oneDark;
        case "GithubDark":
            return githubDark
        case "GithubLight":
            return githubLight
        case "Monokai":
            return monokai
        case "Nord":
            return nord
        case "SolarizedDark":
            return solarizedDark
        case "TokyoNight":
            return tokyoNight
        case "TokyoNightStorm":
            return tokyoNightStorm
        case "VSCode":
            return vscodeDark
        default:
            return EditorView.baseTheme({});
    }
}
