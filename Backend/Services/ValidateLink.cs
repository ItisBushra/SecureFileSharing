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
            if (!Uri.TryCreate(generatedLink, UriKind.Absolute, out var uri) || string.IsNullOrEmpty(generatedLink))
                return null;

            if (!uri.AbsolutePath.Equals("/CipherAsText")) 
                return null;

            var query = uri.Query.TrimStart('?');
            int idStart = query.IndexOf("id=", StringComparison.Ordinal);

            if (idStart == -1) // "id=" not found
                return null;

            string idValue = query.Substring(idStart + 3); 
            int keySeparatorPos = idValue.IndexOf("/key=", StringComparison.Ordinal);
            string guidPart = keySeparatorPos >= 0
                ? idValue.Substring(0, keySeparatorPos)
                : idValue;

            return Guid.TryParse(guidPart, out var fileId) ? fileId : null;
        }
    }
}