import { EditorView } from "@codemirror/view"
import { Extension } from "@codemirror/state"
import { amy, ayuLight, barf, bespin, birdsOfParadise, boysAndGirls, clouds, cobalt, coolGlow, dracula, espresso, noctisLilac, rosePineDawn, smoothy, solarizedLight, tomorrow } from 'thememirror'
import { oneDark } from "@codemirror/theme-one-dark"
import { githubDark, githubLight } from "@uiw/codemirror-theme-github"
import { monokai } from "@uiw/codemirror-theme-monokai"
import { nord } from "@uiw/codemirror-theme-nord"
import { solarizedDark } from "@uiw/codemirror-theme-solarized"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { abcdef } from "@uiw/codemirror-theme-abcdef"
import { abyss } from "@uiw/codemirror-theme-abyss"
import { androidstudio } from "@uiw/codemirror-theme-androidstudio"
import { andromeda } from "@uiw/codemirror-theme-andromeda"
import { atomone } from "@uiw/codemirror-theme-atomone"
import { aura } from "@uiw/codemirror-theme-aura"
import { bbedit } from "@uiw/codemirror-theme-bbedit"
import { basicDark, basicLight } from "@uiw/codemirror-theme-basic"
import { copilot } from "@uiw/codemirror-theme-copilot"
import { darcula } from "@uiw/codemirror-theme-darcula"
import { duotoneDark, duotoneLight } from "@uiw/codemirror-theme-duotone"
import { eclipse } from "@uiw/codemirror-theme-eclipse"
import { gruvboxDark, gruvboxLight } from "@uiw/codemirror-theme-gruvbox-dark"
import { materialDark, materialLight } from "@uiw/codemirror-theme-material"
import { monokaiDimmed } from "@uiw/codemirror-theme-monokai-dimmed"
import { kimbie } from "@uiw/codemirror-theme-kimbie"
import { okaidia } from "@uiw/codemirror-theme-okaidia"
import { quietlight } from "@uiw/codemirror-theme-quietlight"
import { red } from "@uiw/codemirror-theme-red"
import { sublime } from "@uiw/codemirror-theme-sublime"
import { tokyoNightDay } from "@uiw/codemirror-theme-tokyo-night-day"
import { whiteDark, whiteLight } from "@uiw/codemirror-theme-white"
import { xcodeDark, xcodeLight } from "@uiw/codemirror-theme-xcode"

/**
 * Return the thememirror theme Extension matching the supplied string
 * @param themeName
 * @returns
 */
export function getTheme(themeName: string): Extension {
    switch (themeName) {
        case "Amy":
            return amy
        case "AyuLight":
            return ayuLight
        case "Barf":
            return barf
        case "Bespin":
            return bespin
        case "BirdsOfParadise":
            return birdsOfParadise
        case "BoysAndGirls":
            return boysAndGirls
        case "Clouds":
            return clouds
        case "Cobalt":
            return cobalt
        case "CoolGlow":
            return coolGlow
        case "Dracula":
            return dracula
        case "Espresso":
            return espresso
        case "NoctisLilac":
            return noctisLilac
        case "RosePineDawn":
            return rosePineDawn
        case "Smoothy":
            return smoothy
        case "SolarizedLight":
            return solarizedLight
        case "Tomorrow":
            return tomorrow
        case "Dracula":
            return dracula
        case "OneDark":
            return oneDark
        case "Abcdef":
            return abcdef
        case "Abyss":
            return abyss
        case "AndroidStudio":
            return androidstudio
        case "Andromeda":
            return andromeda
        case "AtomOne":
            return atomone
        case "Aura":
            return aura
        case "Bbedit":
            return bbedit
        case "BasicLight":
            return basicLight
        case "BasicDark":
            return basicDark
        case "copilot":
            return copilot
        case "Darcula":
            return darcula
        case "DuotoneDark":
            return duotoneDark
        case "DuotoneLight":
            return duotoneLight
        case "Eclipse":
            return eclipse
        case "GithubDark":
            return githubDark
        case "GithubLight":
            return githubLight
        case "GruvboxDark":
            return gruvboxDark
        case "GruvboxLight":
            return gruvboxLight
        case "MaterialDark":
            return materialDark
        case "MaterialLight":
            return materialLight
        case "Monokai":
            return monokai
        case "Nord":
            return nord
        case "MonokaiDimmed":
            return monokaiDimmed
        case "Kimbie":
            return kimbie
        case "Okaidia":
            return okaidia
        case "SolarizedDark":
            return solarizedDark
        case "QuietLight":
            return quietlight
        case "Red":
            return red
        case "Sublime":
            return sublime
        case "TokyoNight":
            return tokyoNight
        case "TokyoNightDay":
            return tokyoNightDay
        case "TokyoNightStorm":
            return tokyoNightStorm
        case "VSCode":
            return vscodeDark
        case "WhiteLight":
            return whiteLight
        case "WhiteDark":
            return whiteDark
        case "XCodeDark":
           return xcodeDark
        case "XCodeLight":
           return xcodeLight
        default:
            return EditorView.baseTheme({})
    }
}
