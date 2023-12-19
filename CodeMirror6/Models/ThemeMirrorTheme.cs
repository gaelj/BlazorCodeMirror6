using System.Text.Json.Serialization;

namespace CodeMirror6.Models;

/// <summary>
/// Preset themes by ThemeMirror:
/// amy, ayuLight, barf, bespin, birdsOfParadise, boysAndGirls, clouds, cobalt, coolGlow, dracula, espresso, noctisLilac, rosePineDawn, smoothy, solarizedLight, tomorrow
/// </summary>
/// <remarks>
/// See https://github.com/vadimdemedes/thememirror
/// </remarks>
public enum ThemeMirrorTheme
{
    /// <summary>
    /// Preset theme: default (none)
    /// </summary>
    [JsonPropertyName("default")] Default,

    /// <summary>
    /// Preset theme: amy
    /// </summary>
    [JsonPropertyName("amy")] Amy,

    /// <summary>
    /// Preset theme: ayuLight
    /// </summary>
    [JsonPropertyName("ayuLight")] AyuLight,

    /// <summary>
    /// Preset theme: barf
    /// </summary>
    [JsonPropertyName("barf")] Barf,

    /// <summary>
    /// Preset theme: bespin
    /// </summary>
    [JsonPropertyName("bespin")] Bespin,

    /// <summary>
    /// Preset theme: birdsOfParadise
    /// </summary>
    [JsonPropertyName("birdsOfParadise")] BirdsOfParadise,

    /// <summary>
    /// Preset theme: boysAndGirls
    /// </summary>
    [JsonPropertyName("boysAndGirls")] BoysAndGirls,

    /// <summary>
    /// Preset theme: clouds
    /// </summary>
    [JsonPropertyName("clouds")] Clouds,

    /// <summary>
    /// Preset theme: cobalt
    /// </summary>
    [JsonPropertyName("cobalt")] Cobalt,

    /// <summary>
    /// Preset theme: coolGlow
    /// </summary>
    [JsonPropertyName("coolGlow")] CoolGlow,

    /// <summary>
    /// Preset theme: dracula
    /// </summary>
    [JsonPropertyName("dracula")] Dracula,

    /// <summary>
    /// Preset theme: espresso
    /// </summary>
    [JsonPropertyName("espresso")] Espresso,

    /// <summary>
    /// Preset theme: noctisLilac
    /// </summary>
    [JsonPropertyName("noctisLilac")] NoctisLilac,

    /// <summary>
    /// Preset theme: rosePineDawn
    /// </summary>
    [JsonPropertyName("rosePineDawn")] RosePineDawn,

    /// <summary>
    /// Preset theme: smoothy
    /// </summary>
    [JsonPropertyName("smoothy")] Smoothy,

    /// <summary>
    /// Preset theme: solarizedLight
    /// </summary>
    [JsonPropertyName("solarizedLight")] SolarizedLight,

    /// <summary>
    /// Preset theme: tomorrow
    /// </summary>
    [JsonPropertyName("tomorrow")] Tomorrow
}
