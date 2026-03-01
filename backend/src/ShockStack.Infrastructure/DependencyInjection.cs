using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ShockStack.Core.Interfaces;
using ShockStack.Infrastructure.Data;

namespace ShockStack.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<AppDbContext>());
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        return services;
    }
}
