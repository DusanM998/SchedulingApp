using Microsoft.EntityFrameworkCore;
using SchedulingApp.DbContexts;
using System.Linq;
using System.Linq.Expressions;

namespace SchedulingApp.Repository
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly ApplicationDbContexts _db;
        internal DbSet<T> dbSet;

        public Repository(ApplicationDbContexts db)
        {
            _db = db;
            dbSet = _db.Set<T>();
        }

        public async Task<T?> GetAsync(Expression<Func<T, bool>> filter, string? includeProperties = null)
        {
            IQueryable<T> query = dbSet.Where(filter);

            if (includeProperties != null)
            {
                foreach (var prop in includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(prop);
                }
            }

            return await query.FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null, string? includeProperties = null)
        {
            IQueryable<T> query = dbSet;

            if (filter != null)
                query = query.Where(filter);

            if (includeProperties != null)
            {
                foreach (var prop in includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(prop);
                }
            }

            return await query.ToListAsync();
        }

        public void Update(T entity) => dbSet.Update(entity);

        public async Task AddAsync(T entity) => await dbSet.AddAsync(entity);

        public void Remove(T entity) => dbSet.Remove(entity);

        public void RemoveRange(IEnumerable<T> entities) => dbSet.RemoveRange(entities);
    }
}
