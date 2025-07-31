using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class CheckLinkLifeTimeService : BackgroundService
    {
        private readonly IServiceProvider serviceProvider;

        public CheckLinkLifeTimeService(IServiceProvider serviceProvider)
        {
            this.serviceProvider = serviceProvider;
        }
        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = serviceProvider.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<DBContext>();
                        var now = DateTime.UtcNow;
                        var expiredLinks = await dbContext.FileEncryption
                            .Where(f => f.ExperationDate != null && f.ExperationDate <= now)
                            .ToListAsync(stoppingToken);
                        foreach (var file in expiredLinks)
                        {
                            if (file.onDelete)
                            {
                                dbContext.FileEncryption.Remove(file);
                            }
                            else
                            {
                                file.isExpired = true;
                                file.Ciphertext = "file has expired.";
                                file.IV = "";
                            }
                        }

                        await dbContext.SaveChangesAsync(stoppingToken);
                    }
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

                }
                catch (Exception ex)
                {
                    new Exception(ex.Message, ex);
                }         
            }
        }
    }
}