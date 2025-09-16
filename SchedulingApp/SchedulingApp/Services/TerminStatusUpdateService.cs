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

            if (termini.Any()) // Ako postoje takvi termini
            {
                foreach (var termin in termini)
                {
                    if(termin.Status == SD.StatusTermina_Slobodan)
                    {
                        termin.Status = SD.StatusTermina_Istekao; //...menja im se status u "Istekao"
                    }
                    else if(termin.Status == SD.StatusTermina_Zauzet)
                    {
                        termin.Status = SD.StatusTermina_Zavrsen; //...ili zavrsen
                    }
                }

                await dbContext.SaveChangesAsync(); //Cuvaju se promene u bazi
                Console.WriteLine($"{termini.Count} termina azurirano (Slobodni → Istekao, Zauzeti → Zavrsen).");
            }
            else
            {
                Console.WriteLine("Nema termina za azuriranje.");
            }
        }
    }
}
