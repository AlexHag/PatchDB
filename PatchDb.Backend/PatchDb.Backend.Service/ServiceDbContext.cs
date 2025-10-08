using Microsoft.EntityFrameworkCore;
using PatchDb.Backend.Service.Patches.Models.Entities;
using PatchDb.Backend.Service.PatchSubmittion.Models.Entities;
using PatchDb.Backend.Service.User.Models.Entities;

namespace PatchDb.Backend.Service;

public class ServiceDbContext : DbContext
{
    public DbSet<UserEntity> Users { get; set; }
    public DbSet<PatchSubmittionEntity> PatchSubmittions { get; set; }
    public DbSet<PatchEntity> Patches { get; set; }

    public ServiceDbContext(DbContextOptions<ServiceDbContext> options) : base(options)
    { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PatchEntity>()
            .HasKey(p => p.PatchNumber);

        modelBuilder.Entity<PatchEntity>()
            .Property(e => e.PatchNumber)
            .ValueGeneratedOnAdd();
    }
}