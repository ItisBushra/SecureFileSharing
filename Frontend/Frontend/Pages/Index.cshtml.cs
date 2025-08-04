using Backend.Applications;
using Backend.Models;
using Backend.Services;
using Frontend.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Diagnostics.Metrics;
using System.IO;
using System.Net.Mail;
using System.Runtime.Intrinsics.X86;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks.Dataflow;
using System.Web;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Frontend.Pages;

public class IndexModel : PageModel
{
    private readonly IFileEncryptionApplication fileEncryptionApplication;
    private readonly IHttpContextAccessor httpContext;
    private readonly ValidateLink validateLink;
    public IndexModel(IFileEncryptionApplication fileEncryptionApplication, IHttpContextAccessor httpContext, ValidateLink validateLink)
    {
        this.fileEncryptionApplication = fileEncryptionApplication;
        this.httpContext = httpContext;
        this.validateLink = validateLink;
    }

    [BindProperty]
    public string GeneratedLink { get; set; }
    public async Task<IActionResult> OnPostAsync()
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        var fileData = JsonSerializer.Deserialize<EncryptedFileVM>(body);
        
        using var doc = JsonDocument.Parse(body);
        int size = doc.RootElement.GetProperty("Size").GetInt32();
        if (size > 500000)
        {
            TempData["WarningMessage"] = "The selected file is too large. Please upload a file under 5MB";
            return Page();
        }
        try
        {
            fileData.CreatedAt = DateTime.UtcNow;
            var uploadedFile = await fileEncryptionApplication.CreateEncryptedFileAsync(fileData);
            var currentDomain = httpContext.HttpContext.Request;
            var link = $"{currentDomain.Scheme}://{currentDomain.Host}/CipherAsText?id={uploadedFile.Id}";
            GeneratedLink = link;
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
        return new JsonResult(new { link = GeneratedLink });
    }
    public async Task<IActionResult> OnGetTextAsync(Guid id)
    {
        var file = await fileEncryptionApplication.GetEncryptedFileAsync(id);
        if (file == null)
            return NotFound("File not found");

        return Content(file.Ciphertext, "text/plain");
    }
    public async Task<IActionResult> OnGetDownloadAsync(Guid id)
    {
        var file = await fileEncryptionApplication.GetEncryptedFileAsync(id);
        if (file == null)
            return NotFound("File not found");
        var bytes = Encoding.UTF8.GetBytes(file.Ciphertext); 
        var fileName = $"{file.Name}-cipher.txt";

        return File(bytes, "application/octet-stream", fileName); 
    }
    public async Task<IActionResult> OnGetDeleteAsync(Guid id)
    {
        var file = await fileEncryptionApplication.GetEncryptedFileAsync(id);
        if(file == null) return BadRequest("The file Does not Exists or is an Empty Value!");

        try
        {
            await fileEncryptionApplication.RemoveEncryptedFileAsync(id);
            TempData["SuccessMessage"] = "Encrypted file was removed successfully from our database. The link will not work anymore.";
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
        return RedirectToPage("Index");
    }

    public async Task<IActionResult> OnPostValidateLink(string generatedLink)
    {
        var userLinkId = validateLink.ValidateLinkStructure(generatedLink);
        if (string.IsNullOrEmpty(generatedLink) || userLinkId == null)
        {
            TempData["LinkError"] = "Link is Invalid.";
            return Page();
        }
        //once validated
        var cipherFile = await fileEncryptionApplication.GetEncryptedFileAsync(userLinkId.Value);
        await fileEncryptionApplication.UpdateEncryptedFileAccessCountAsync(userLinkId.Value);
        return new JsonResult(new { file = cipherFile }); // for decryption
    }
}