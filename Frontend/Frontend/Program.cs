using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.Repository;
using Backend.Repositories.IRepositories;
using Backend.Applications;
using Backend.Services;

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

app.UseAuthorization();

app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();

app.Run();
