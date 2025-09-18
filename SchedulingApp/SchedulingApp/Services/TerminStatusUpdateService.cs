using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using SchedulingApp.DbContexts;
using SchedulingApp.Utility;

// Nasledjuje BackgroundService jer je to klasa za dugotrajne pozadinske procese u .NETu
// BackgroundService implementira IHostedService
// TerminStatusUpdateService je Hosted service koji se startuje zajedno sa aplikacijom i radi u pozadini
// HostedService je mehanizam za rad sa dugotrajnim ili pozadinskim procesima u ASP .NET ekosistemu
public class TerminStatusUpdateService : BackgroundService
{
    // Ovaj servis jednom dnevno proverava bazu i svim terminima ciji je datum pre danasnjeg
    // menja status termina u "Istekao"
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _interval = TimeSpan.FromHours(1); // Proverava na 1h

    public TerminStatusUpdateService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) // Glavna petlja servisa
    {
        while (!stoppingToken.IsCancellationRequested) // Dok god stoppingToken nije otkazan
        {
            await UpdateTerminiStatusAsync(); //...poziva se UpdateTerminStatusAsync()
            
            await Task.Delay(_interval, stoppingToken); // ...Zatim ceka 24h 
        }
    }

    private async Task UpdateTerminiStatusAsync()
    {
        using (var scope = _serviceProvider.CreateScope()) // CreateScope kreira novi DI(dependency injection
                                                           // scope pri svakom prolazu i iz njega se uzimaju
                                                           // svi scoped servisi (ApplicationDbContext u ovom slucaju)
                                                           // posto sam napisao using, isto je kao da sam napisao try-finally
                                                           // using u ovom slucaju obezbedjuje da se scope i svi servisi unutar njega pravilno oslobode nakon koriscenja
                                                           // using je ovde skracenica za Dispose (oslobadja resurse koje .NET GC ne zna da pocisti sam)
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContexts>();

            var danas = DateTime.Today; // Uzima samo danasnji datum bez vremena
            var termini = await dbContext.Termini 
                .Where(t => t.DatumTermina.Date < danas 
                    && t.Status == "Slobodan" ||
                    t.Status == "Zauzet")
                .ToListAsync(); // Cita termine iz baze strogo pre danasnjeg datuma i proverava da li im je status "Slobodan"

            if (!termini.Any())
            {
                Console.WriteLine("Nema termina za azuriranje.");
                return;
            }

            int updatedCount = 0;

            foreach (var termin in termini)
            {
                try
                {
                    Console.WriteLine($"Obrada termina {termin.TerminId}: Datum={termin.DatumTermina}, Status={termin.Status}, StavkaKorpeId={termin.StavkaKorpeId}");

                    if (termin.Status == SD.StatusTermina_Slobodan)
                    {
                        termin.Status = SD.StatusTermina_Istekao;
                        updatedCount++;
                    }
                    else if (termin.Status == SD.StatusTermina_Zauzet)
                    {
                        // Skip if termin has an active reservation
                        if (termin.StavkaKorpeId != null)
                        {
                            var stavkaKorpe = await dbContext.StavkeKorpe
                                .FirstOrDefaultAsync(s => s.Id == termin.StavkaKorpeId);

                            if (stavkaKorpe != null)
                            {
                                Console.WriteLine($"Preskakanje termina {termin.TerminId}: Zauzet sa aktivnom rezervacijom (StavkaKorpeId={termin.StavkaKorpeId}).");
                                continue;
                            }
                        }

                        termin.Status = SD.StatusTermina_Zavrsen;
                        updatedCount++;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Greška prilikom ažuriranja termina {termin.TerminId}: {ex.Message}");
                }
            }

            if (updatedCount > 0)
            {
                await dbContext.SaveChangesAsync();
                Console.WriteLine($"{updatedCount} termina ažurirano (Slobodni → Istekao, Zauzeti → Završen).");
            }
            else
            {
                Console.WriteLine("Nijedan termin nije ažuriran.");
            }
        }
    }
}
