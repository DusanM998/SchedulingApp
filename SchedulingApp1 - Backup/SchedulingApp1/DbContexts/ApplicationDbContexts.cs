using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SchedulingApp1.Models;

namespace SchedulingApp1.DbContexts
{
    public class ApplicationDbContexts : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContexts(DbContextOptions<ApplicationDbContexts> options) : base(options)
        {

        }

        public DbSet<ApplicationUser> ApplicationUsers { get; set; } //Odgovara tabeli ApplicationUsers u b. p.
        public DbSet<SportskiObjekat> SportskiObjekti { get; set; }
        public DbSet<RezervacijaDetalji> RezervacijaDetalji { get; set; }
        public DbSet<RezervacijaHeader> RezervacijaHeader { get; set; }
        public DbSet<Termin> Termini { get; set; }
        public DbSet<Korpa> Korpe { get; set; }
        public DbSet<StavkaKorpe> StavkeKorpe { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<RezervacijaHeader>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<SportskiObjekat>().HasData(
                new SportskiObjekat
                {
                    Id = 1,
                    Naziv = "Hala Cair",
                    Lokacija = "Nis",
                    VrstaSporta = "Sve",
                    Opis = "Primer opisa",
                    RadnoVreme = "09:00 - 21:00",
                    CenaPoSatu = 200.50,
                    Kapacitet = 20,
                });
        }
    }
}
