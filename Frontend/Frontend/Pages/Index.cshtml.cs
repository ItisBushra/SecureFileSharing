using Backend.Applications;
using Backend.Models;
using Frontend.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.Json;

namespace Frontend.Pages;

public class IndexModel : PageModel
{
    private readonly IFileEncryptionApplication fileEncryptionApplication;
    public IndexModel(IFileEncryptionApplication fileEncryptionApplication)
    {
        this.fileEncryptionApplication = fileEncryptionApplication;
    }
    public void OnGet()
    {
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        var fileData = JsonSerializer.Deserialize<EncryptedFileVM>(body);
        try
        {
            fileData.CreatedAt = DateTime.UtcNow;
            await fileEncryptionApplication.CreateEncryptedFileAsync(fileData);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
        return Page();
    }
}
