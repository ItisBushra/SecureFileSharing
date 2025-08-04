using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Backend.Services
{
    public class ValidateLink
    {
        private readonly IHttpContextAccessor httpContext;
        public ValidateLink(IHttpContextAccessor httpContext)
        {
            this.httpContext = httpContext;           
        }
        public Guid? ValidateLinkStructure(string generatedLink)
        {
            if (!Uri.TryCreate(generatedLink, UriKind.Absolute, out var uri))
                return null;

            var currentDomain = $"{httpContext.HttpContext?.Request.Scheme}://{httpContext.HttpContext?.Request.Host}";
            if (!uri.AbsolutePath.Equals("/CipherAsText")) 
                return null;

            //case sensitive comparison
            var query = uri.Query.TrimStart('?');
            var queryParams = query.Split('&')
                .Select(p => p.Split('='))
                .ToDictionary(p => p[0], p => p.Length > 1 ? p[1] : null);

            if (!queryParams.TryGetValue("id", out var idValue)) 
                return null;
           
            return Guid.TryParse(idValue, out var fileId) ? fileId : null;
        }
    }
}