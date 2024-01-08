using System.Text.Json.Serialization;

namespace CodeMirror6.Models;

/// <summary>
/// Preset themes by ThemeMirror:
/// amy, ayuLight, barf, bespin, birdsOfParadise, boysAndGirls, clouds, cobalt, coolGlow, dracula, espresso, noctisLilac, rosePineDawn, smoothy, solarizedLight, tomorrow
/// </summary>
/// <remarks>
/// See https://github.com/vadimdemedes/thememirror
/// </remarks>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ThemeMirrorTheme
{
    /// <summary>
    /// Default theme
    /// </summary>
    Default,

    /// <summary>
    /// Preset theme: amy
    /// </summary>
    Amy,

    /// <summary>
    /// Preset theme: ayuLight
    /// </summary>
    AyuLight,

    /// <summary>
    /// Preset theme: barf
    /// </summary>
    Barf,

    /// <summary>
    /// Preset theme: bespin
    /// </summary>
    Bespin,

    /// <summary>
    /// Preset theme: birdsOfParadise
    /// </summary>
    BirdsOfParadise,

    /// <summary>
    /// Preset theme: boysAndGirls
    /// </summary>
    BoysAndGirls,

    /// <summary>
    /// Preset theme: clouds
    /// </summary>
    Clouds,

    /// <summary>
    /// Preset theme: cobalt
    /// </summary>
    Cobalt,

    /// <summary>
    /// Preset theme: coolGlow
    /// </summary>
    CoolGlow,

    /// <summary>
    /// Preset theme: dracula
    /// </summary>
    Dracula,

    /// <summary>
    /// Preset theme: espresso
    /// </summary>
    Espresso,

    /// <summary>
    /// Preset theme: noctisLilac
    /// </summary>
    NoctisLilac,

    /// <summary>
    /// Preset theme: oneDark
    /// </summary>
    OneDark,

    /// <summary>
    /// Preset theme: rosePineDawn
    /// </summary>
    RosePineDawn,

    /// <summary>
    /// Preset theme: smoothy
    /// </summary>
    Smoothy,

    /// <summary>
    /// Preset theme: solarizedLight
    /// </summary>
    SolarizedLight,

    /// <summary>
    /// Preset theme: tomorrow
    /// </summary>
    Tomorrow,

    /// <summary>
    /// @uiw's Abcdef theme
    /// </summary>
    Abcdef,

    /// <summary>
    /// @uiw's Abyss theme
    /// </summary>
    Abyss,

    /// <summary>
    /// @uiw's AndroidStudio theme
    /// </summary>
    AndroidStudio,

    /// <summary>
    /// @uiw's Andromeda theme
    /// </summary>
    Andromeda,

    /// <summary>
    /// @uiw's AtomOne theme
    /// </summary>
    AtomOne,

    /// <summary>
    /// @uiw's Aura theme
    /// </summary>
    Aura,

    /// <summary>
    /// @uiw's Bbedit theme
    /// </summary>
    Bbedit,

    /// <summary>
    /// @uiw's Basic Light theme
    /// </summary>
    BasicLight,

    /// <summary>
    /// @uiw's Basic Dark theme
    /// </summary>
    BasicDark,

    /// <summary>
    /// @uiw's Copilot theme
    /// </summary>
    Copilot,

    /// <summary>
    /// @uiw's Darcula theme
    /// </summary>
    Darcula,

    /// <summary>
    /// @uiw's Duotone Dark theme
    /// </summary>
    DuotoneDark,

    /// <summary>
    /// @uiw's Duotone Light theme
    /// </summary>
    DuotoneLight,

    /// <summary>
    /// @uiw's Eclipse theme
    /// </summary>
    Eclipse,

    /// <summary>
    /// Preset theme: Github Dark
    /// </summary>
    GithubDark,

    /// <summary>
    /// Preset theme: Github Light
    /// </summary>
    GithubLight,

    /// <summary>
    /// @uiw's Gruvbox Dark theme
    /// </summary>
    GruvboxDark,

    /// <summary>
    /// @uiw's Gruvbox Light theme
    /// </summary>
    GruvboxLight,

    /// <summary>
    /// @uiw's MaterialDark theme
    /// </summary>
    MaterialDark,

    /// <summary>
    /// @uiw's MaterialLight theme
    /// </summary>
    MaterialLight,

    /// <summary>
    /// Preset theme: Monokai
    /// </summary>
    Monokai,

    /// <summary>
    /// @uiw's Monokai Dimmed theme
    /// </summary>
    MonokaiDimmed,

    /// <summary>
    /// @uiw's Kimbie theme
    /// </summary>
    Kimbie,

    /// <summary>
    /// Preset theme: Nord
    /// </summary>
    Nord,

    /// <summary>
    /// @uiw's Okaidia theme
    /// </summary>
    Okaidia,

    /// <summary>
    /// Preset theme: One Light
    /// </summary>
    SolarizedDark,

    /// <summary>
    /// @uiw's Quiet Light theme
    /// </summary>
    QuietLight,

    /// <summary>
    /// @uiw's Red theme
    /// </summary>
    Red,

    /// <summary>
    /// @uiw's Sublime theme
    /// </summary>
    Sublime,

    /// <summary>
    /// Preset theme: Tokyo Night
    /// </summary>
    TokyoNight,

    /// <summary>
    /// @uiw's Tokyo Night Day theme
    /// </summary>
    TokyoNightDay,

    /// <summary>
    /// Preset theme: Tokyo Night Storm
    /// </summary>
    TokyoNightStorm,

    /// <summary>
    /// Preset theme: VS Code
    /// </summary>
    VSCode,

    /// <summary>
    /// @uiw's White Light theme
    /// </summary>
    WhiteLight,

    /// <summary>
    /// @uiw's White Dark theme
    /// </summary>
    WhiteDark,

    /// <summary>
    /// @uiw's XCode Dark theme
    /// </summary>
    XCodeDark,

    /// <summary>
    /// @uiw's XCode Light theme
    /// </summary>
    XCodeLight,
}
