using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SchedulingApp.Models;

namespace SchedulingApp.DbContexts
{
    //Glavna klasa koja omogucava komunikaciju izmedju aplikacije i bp.
    //DbSet property predstavljaju tabele u bazi podataka
    // DbContext predstavlja sesiju sa bazom podataka (tj. on je posrednik ili most
    // izmedju C# objekata i baze podataka tj. tabela)
    // Omogucava: upite, cuvanje podataka, pracenje promena(change tracking)

    // Nasledjuje IdentityDbContext sto znaci da imam sve funkcionalnosti DbContext klase i dodatnu podrsku za
    // .NET Identity (koristim ga jer je gotov sistem za Autentifikaciju i Autorizaciju)
    public class ApplicationDbContexts : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContexts(DbContextOptions options) : base(options) 
        {
            
        }

        public DbSet<ApplicationUser> ApplicationUsers { get; set; } //Odgovara tabeli ApplicationUsers u b. p.
        public DbSet<SportskiObjekat> SportskiObjekti { get; set; }
        public DbSet<RezervacijaDetalji> RezervacijaDetalji { get; set; }
        public DbSet<RezervacijaHeader> RezervacijaHeader { get; set; }
        public DbSet<Termin> Termini { get; set; }
        public DbSet<Korpa> Korpe { get; set; }
        public DbSet<StavkaKorpe> StavkeKorpe { get; set; }
        //public DbSet<Rezervacija> Rezervacije { get; set; }

        // Moze se koristiti da rucno definisem odnose izmedju tabela
        // ili da popunim b.p. inicijalnim podacima
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            /*builder.Entity<StavkaKorpe>()
                .HasOne(s => s.Termin)
                .WithMany() // Ako ne želiš da Termin zna za StavkaKorpe
                .HasForeignKey(s => s.TerminId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<SportskiObjekat>().HasData(
                new SportskiObjekat
                {
                    SportskiObjekatId = 1,
                    Naziv = "Hala Cair",
                    Lokacija = "Nis",
                    VrstaSporta = "Sve",
                    Opis = "Primer opisa",
                    RadnoVreme = "09:00 - 21:00",
                    CenaPoSatu = 200.50,
                    Kapacitet = 20,
                    Image = ""
                });*/

            /*builder.Entity<RezervacijaDetalji>()
                .HasOne(rd => rd.SportskiObjekat)
                .WithMany()
                .HasForeignKey(rd => rd.SportskiObjekatId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Termin>()
                .HasOne(t => t.SportskiObjekat)
                .WithMany(so => so.Termini)
                .HasForeignKey(t => t.SportskiObjekatId)
                .OnDelete(DeleteBehavior.Cascade);*/
        }
    }
}
