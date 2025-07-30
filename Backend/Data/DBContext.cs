using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Data
{
    public class DBContext: DbContext
    {
        public DBContext(DbContextOptions<DBContext> options) : base(options) { }

        public DbSet<FileEncryption> FileEncryption { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<FileEncryption>()
                .Property(f => f.DownloadCount).HasDefaultValue(0);

            modelBuilder.Entity<FileEncryption>()
                .Property(f => f.isExpired).HasDefaultValue(false);

            modelBuilder.Entity<FileEncryption>()
                 .Property(f => f.onDelete).HasDefaultValue(false);
        }
    }
}