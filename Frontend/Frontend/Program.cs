using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.Repository;
using Backend.Repositories.IRepositories;
using Backend.Applications;
using Backend.Services;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddScoped<IFileEncryptionRepository, FileEncryptionRepository>();
builder.Services.AddScoped<IFileEncryptionApplication, FileEncryptionApplication>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ValidateLink>();
builder.Services.AddHostedService<CheckLinkLifeTimeService>();
builder.Services.AddMemoryCache();

builder.Services.AddDbContext<DBContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 5 * 1024 * 1024;
});

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(policyName: "ValidateLinkPolicy", configureOptions: opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
        opt.AutoReplenishment = true;
    });
    options.OnRejected = async (context, _) =>
    {
        var cache = context.HttpContext.RequestServices.GetRequiredService<IMemoryCache>();
        var ip = context.HttpContext.Connection.RemoteIpAddress?.ToString();
        cache.Set($"RateLimited_{ip}", true, TimeSpan.FromMinutes(5));
        context.HttpContext.Response.Redirect("/error");
        await Task.CompletedTask;
    };
});

var app = builder.Build();
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseRouting();
app.UseRateLimiter();
app.UseAuthorization();
// In Program.cs (maps handler as a pseudo-endpoint)
app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();

app.Run();
