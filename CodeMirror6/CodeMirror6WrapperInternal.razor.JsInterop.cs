using GaelJ.BlazorCodeMirror6.Commands;
using GaelJ.BlazorCodeMirror6.Models;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace GaelJ.BlazorCodeMirror6;

public partial class CodeMirror6WrapperInternal : ComponentBase, IAsyncDisposable
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
        CodeMirror6WrapperInternal cm6WrapperComponent
    ) : IAsyncDisposable
    {
        private static string LibraryName => typeof(CodeMirrorJsInterop).Assembly.GetName().Name!;
        private readonly Lazy<Task<IJSObjectReference>> _moduleTask =
            new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
                "import", $"./_content/{LibraryName}/index.js").AsTask()
            );
        private readonly DotNetObjectReference<CodeMirror6WrapperInternal> _dotnetHelperRef = DotNetObjectReference.Create(cm6WrapperComponent);
        private CMSetters _setters = null!;
        private CMCommandDispatcher _commands = null!;
        public bool IsJSReady => _moduleTask.IsValueCreated && _moduleTask.Value.IsCompletedSuccessfully;

        internal async Task<bool> ModuleInvokeVoidAsync(string method, params object?[] args)
        {
#pragma warning disable CS0168 // Variable is declared but never used
            try {
                var module = await _moduleTask.Value;
                if (module is null) return false;
                args = args.Prepend(cm6WrapperComponent.SetupId).ToArray();
                await module.InvokeVoidAsync(method, args);
                return true;
            }
            catch (ObjectDisposedException) {}
            catch (OperationCanceledException) {}
            catch (JSDisconnectedException) {}
            catch (Exception ex)
            {
                #if NET8_0_OR_GREATER
                if (cm6WrapperComponent is not null)
                    await cm6WrapperComponent.DispatchExceptionAsync(ex);
                #else
                throw;
                #endif
            }
            return false;
#pragma warning restore CS0168 // Variable is declared but never used
        }

        internal async Task<T?> ModuleInvokeAsync<T>(string method, params object?[] args)
        {
#pragma warning disable CS0168 // Variable is declared but never used
            try {
                var module = await _moduleTask.Value;
                if (module is null) return default;
                args = args.Prepend(cm6WrapperComponent.SetupId).ToArray();
                return await module.InvokeAsync<T?>(method, args);
            }
            catch (ObjectDisposedException) {
                return default;
            }
            catch (OperationCanceledException) {
                return default;
            }
            catch (JSDisconnectedException) {
                return default;
            }
            catch (Exception ex)
            {
                #if NET8_0_OR_GREATER
                if (cm6WrapperComponent is not null)
                    await cm6WrapperComponent.DispatchExceptionAsync(ex);
                return default;
                #else
                throw;
                #endif
            }
            finally {
            }
#pragma warning restore CS0168 // Variable is declared but never used
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
        internal CMCommandDispatcher CommandDispatcher => _commands ??= new(this);

        /// <summary>
        /// Dispose Javascript modules
        /// </summary>
        /// <returns></returns>
        public async ValueTask DisposeAsync()
        {
            if (IsJSReady) {
                var module = await _moduleTask.Value;
                try {
                    await ModuleInvokeVoidAsync("dispose");
                }
                catch (ObjectDisposedException) { }
                catch (JSDisconnectedException) { }
                catch (Exception) { }

                try {
                    await module.DisposeAsync();
                }
                catch (ObjectDisposedException) { }
                catch (JSDisconnectedException) { }
                catch (AggregateException ex) {
                    if (ex.InnerException is JSDisconnectedException) { }
                    else if (ex.InnerExceptions.All(e => e is ObjectDisposedException)) { }
                    else if (ex.InnerExceptions.All(e => e is JSDisconnectedException)) { }
                    else throw;
                }
            }
            GC.SuppressFinalize(this);
        }
    }
}
