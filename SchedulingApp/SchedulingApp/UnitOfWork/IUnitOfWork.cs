using SchedulingApp.Models;
using SchedulingApp.Repository;

namespace SchedulingApp.UnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<ApplicationUser> ApplicationUser { get; }
        IRepository<SportskiObjekat> SportskiObjekat { get; }
        IRepository<RezervacijaDetalji> RezervacijaDetalji { get; }
        IRepository<RezervacijaHeader> RezervacijaHeader { get; }
        IRepository<Termin> Termin { get; }
        IRepository<Korpa> Korpa { get; }
        IRepository<StavkaKorpe> StavkaKorpe { get; }
        Task<int> SaveAsync();
    }
}
