using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Examples.BlazorWasm;
using Sentry;
using System.Diagnostics;

// Capture blazor bootstrapping errors
using var sdk = SentrySdk.Init(o =>
{
    o.Dsn = "https://d0ab79eee7b999c61d2c01fdf3958eeb@o4505402784546816.ingest.sentry.io/4506525909909504";
    o.Debug = true;
    //IsGlobalModeEnabled will be true for Blazor WASM
    Debug.Assert(o.IsGlobalModeEnabled);
});
try
{
    var builder = WebAssemblyHostBuilder.CreateDefault(args);
    builder.RootComponents.Add<App>("#app");
    builder.RootComponents.Add<HeadOutlet>("head::after");

    builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

    await builder.Build().RunAsync();
}
catch (Exception e)
{
    SentrySdk.CaptureException(e);
    await SentrySdk.FlushAsync();
    throw;
}
