using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Backend.Data
{
    public class DBContextFactory : IDesignTimeDbContextFactory<DBContext>
    {
        public DBContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DBContext>();
            optionsBuilder.UseNpgsql("Server=localhost;Port=5432;User Id=postgres; Password=admin;Database=FileShare;Pooling=true;Search Path=public");

            return new DBContext(optionsBuilder.Options);
        }
    }
}
