using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Caching.Memory;

namespace Frontend.Pages
{
    public class ErrorModel : PageModel
    {
        private readonly IMemoryCache cache;

        public ErrorModel(IMemoryCache cache)
        {
            this.cache = cache;
        }

        public IActionResult OnGet()
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            
            if (!cache.TryGetValue($"RateLimited_{ip}", out _))
            {
                return RedirectToPage("/Index");
            }

            return Page();
        }
    }
}
