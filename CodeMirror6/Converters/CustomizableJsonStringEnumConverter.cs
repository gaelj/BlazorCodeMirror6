using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace GaelJ.BlazorCodeMirror6.Converters;

/// <summary>
/// A JsonConverter that allows the string values of an enum to be customized with the JsonStringValueAttribute
/// </summary>
/// <typeparam name="T"></typeparam>
public class CustomizableJsonStringEnumConverter<T> : JsonConverter<T> where T : struct, Enum
{
    /// <inheritdoc/>
    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var stringValue = reader.GetString();
        foreach (var field in typeToConvert.GetFields()) {
            var attribute = field.GetCustomAttribute<JsonStringValueAttribute>();
            if (attribute?.Value == stringValue) {
                var v = field.GetValue(null);
                return v is null ? default : (T)v;
            }
        }
        throw new JsonException($"Unknown value: {stringValue}");
    }

    /// <inheritdoc/>
    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        var field = value.GetType().GetField(value.ToString());
        var attribute = field?.GetCustomAttribute<JsonStringValueAttribute>();
        if (attribute is not null) {
            writer.WriteStringValue(attribute.Value);
        }
        else {
            writer.WriteStringValue(value.ToString());
        }
    }
}
