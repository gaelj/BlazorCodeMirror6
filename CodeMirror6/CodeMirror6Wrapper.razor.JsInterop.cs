using CodeMirror6.Commands;
using CodeMirror6.Models;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace CodeMirror6;

public partial class CodeMirror6Wrapper : ComponentBase, IAsyncDisposable
{
    /// <summary>
    /// Wraps JavaScript functionality in a .NET class for easy consumption.
    /// The associated JavaScript module is loaded on demand when first needed.
    /// This class can be registered as scoped DI service and then injected into Blazor
    /// components for use.
    /// </summary>
    /// <remarks>
    /// Loads the Javascript modules
    /// </remarks>
    /// <param name="jsRuntime"></param>
    /// <param name="cm6WrapperComponent"></param>
    internal class CodeMirrorJsInterop(
        IJSRuntime jsRuntime,
        CodeMirror6Wrapper cm6WrapperComponent
    ) : IAsyncDisposable
    {
        private readonly Lazy<Task<IJSObjectReference>> _moduleTask =
            new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
                "import", "./_content/CodeMirror6/index.js").AsTask()
            );
        private readonly DotNetObjectReference<CodeMirror6Wrapper> _dotnetHelperRef = DotNetObjectReference.Create(cm6WrapperComponent);
        private CMSetters _setters = null!;
        private CMCommandDispatcher _commands = null!;

        internal async Task ModuleInvokeVoidAsync(string method, params object?[] args)
        {
                var module = await _moduleTask.Value;
                if (module is null) return;
                args = args.Prepend(cm6WrapperComponent.Id).ToArray();
                await module.InvokeVoidAsync(method, args);
        }

        /// <summary>
        /// Methods to set JS CodeMirror properties to reflect the values of the blazor wrapper parameters. Internal use only.
        /// </summary>
        /// <returns></returns>
        internal CMSetters PropertySetters => _setters ??= new(
            _dotnetHelperRef,
            cm6WrapperComponent.Config,
            cm6WrapperComponent.Setup,
            this
        );

        /// <summary>
        /// Methods to invoke JS CodeMirror commands.
        /// </summary>
        /// <returns></returns>
        internal CMCommandDispatcher Commands => _commands ??= new(this);

        /// <summary>
        /// Dispose Javascript modules
        /// </summary>
        /// <returns></returns>
        public async ValueTask DisposeAsync()
        {
            if (_moduleTask.IsValueCreated) {
                var module = await _moduleTask.Value;
                await module.DisposeAsync();
            }
            GC.SuppressFinalize(this);
        }
    }
}
