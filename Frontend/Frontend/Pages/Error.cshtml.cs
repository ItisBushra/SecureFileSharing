using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Frontend.Pages
{
    public class ErrorModel : PageModel
    {
        public IActionResult OnGet()
        {
            if (HttpContext.Session.GetString("RateLimitRedirect") != "true")
            {
                return RedirectToPage("Index");
            }
            //lock user
            HttpContext.Session.Remove("RateLimitRedirect");
            return Page();
        }
    }
}
