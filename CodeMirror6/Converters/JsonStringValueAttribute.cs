namespace GaelJ.BlazorCodeMirror6.Converters;

[AttributeUsage(AttributeTargets.Field)]
public class JsonStringValueAttribute : Attribute
{
    public string Value { get; }

    public JsonStringValueAttribute(string value)
    {
        Value = value;
    }
}
