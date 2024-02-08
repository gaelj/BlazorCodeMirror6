namespace GaelJ.BlazorCodeMirror6.Converters;

/// <summary>
/// Specifies the string value of a field when serialized to JSON.
/// </summary>
/// <param name="value"></param>
[AttributeUsage(AttributeTargets.Field)]
public class JsonStringValueAttribute(string value) : Attribute
{
    /// <summary>
    /// The string value of the field when serialized to JSON.
    /// </summary>
    public string Value { get; } = value;
}
