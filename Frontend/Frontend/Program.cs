using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.Repository;
using Backend.Repositories.IRepositories;
using Backend.Applications;
using Backend.Services;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddScoped<IFileEncryptionRepository, FileEncryptionRepository>();
builder.Services.AddScoped<IFileEncryptionApplication, FileEncryptionApplication>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ValidateLink>();
builder.Services.AddHostedService<CheckLinkLifeTimeService>();


builder.Services.AddDbContext<DBContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 5 * 1024 * 1024;
});
builder.Services.AddSession(options => {
    options.Cookie.HttpOnly = true;
    options.IdleTimeout = TimeSpan.FromMinutes(5);
});

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("ValidateLinkPolicy", opt =>
    {
        opt.PermitLimit = 7;
        opt.Window = TimeSpan.FromMinutes(1); 
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });

    options.OnRejected = async (context, _) =>
    {
        context.HttpContext.Session.SetString("RateLimitRedirect", "true");
        context.HttpContext.Response.Redirect("/error");
        await Task.CompletedTask;
    };
});

var app = builder.Build();
app.UseSession();
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
