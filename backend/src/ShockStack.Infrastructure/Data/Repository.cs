using Microsoft.EntityFrameworkCore;
using ShockStack.Core.Entities;
using ShockStack.Core.Interfaces;

namespace ShockStack.Infrastructure.Data;

public class Repository<T>(AppDbContext context) : IRepository<T> where T : BaseEntity
{
  private readonly DbSet<T> _dbSet = context.Set<T>();

  public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
      => await _dbSet.FindAsync([id], ct);

  public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default)
      => await _dbSet.ToListAsync(ct);

  public async Task<T> AddAsync(T entity, CancellationToken ct = default)
  {
    await _dbSet.AddAsync(entity, ct);
    await context.SaveChangesAsync(ct);
    return entity;
  }

  public async Task UpdateAsync(T entity, CancellationToken ct = default)
  {
    entity.UpdatedAt = DateTime.UtcNow;
    _dbSet.Update(entity);
    await context.SaveChangesAsync(ct);
  }

  public async Task DeleteAsync(T entity, CancellationToken ct = default)
  {
    _dbSet.Remove(entity);
    await context.SaveChangesAsync(ct);
  }
}
