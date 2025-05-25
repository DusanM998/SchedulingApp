using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using SchedulingApp.DbContexts;

public class TerminStatusUpdateService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _interval = TimeSpan.FromHours(24); // Proverava jednom dnevno

    public TerminStatusUpdateService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await UpdateTerminiStatusAsync();

            await Task.Delay(_interval, stoppingToken);
        }
    }

    private async Task UpdateTerminiStatusAsync()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContexts>();

            var danas = DateTime.Today;
            var termini = await dbContext.Termini
                .Where(t => t.DatumTermina.Date < danas && t.Status == "Slobodan")
                .ToListAsync();

            if (termini.Any())
            {
                foreach (var termin in termini)
                {
                    termin.Status = "Istekao";
                }

                await dbContext.SaveChangesAsync();
                Console.WriteLine($"{termini.Count} termina ažurirano na status 'Istekao'.");
            }
            else
            {
                Console.WriteLine("Nema termina za ažuriranje.");
            }
        }
    }
}
