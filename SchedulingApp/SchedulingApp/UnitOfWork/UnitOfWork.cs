using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Repository;

namespace SchedulingApp.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork 
    {
        private readonly ApplicationDbContexts _db;
        public IRepository<ApplicationUser> ApplicationUser { get; private set; }
        public IRepository<SportskiObjekat> SportskiObjekat { get; private set; }
        public IRepository<RezervacijaDetalji> RezervacijaDetalji { get; private set; }
        public IRepository<RezervacijaHeader> RezervacijaHeader { get; private set; }
        public IRepository<Termin> Termin { get; private set; }
        public IRepository<Korpa> Korpa { get; private set; }
        public IRepository<StavkaKorpe> StavkaKorpe { get; private set; }
        public UnitOfWork(ApplicationDbContexts db)
        {
            _db = db;
            ApplicationUser = new Repository<ApplicationUser>(_db);
            SportskiObjekat = new Repository<SportskiObjekat>(_db);
            RezervacijaDetalji = new Repository<RezervacijaDetalji>(_db);
            RezervacijaHeader = new Repository<RezervacijaHeader>(_db);
            Termin = new Repository<Termin>(_db);
            Korpa = new Repository<Korpa>(_db);
            StavkaKorpe = new Repository<StavkaKorpe>(_db);
        }

        public async Task<int> SaveAsync() => await _db.SaveChangesAsync();
        private bool disposed = false;
        protected virtual void Dispose(bool disposing)
        {
            if (!disposed)
            {
                if (disposing)
                {
                    _db.Dispose();
                }
                disposed = true;
            }
        }
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
