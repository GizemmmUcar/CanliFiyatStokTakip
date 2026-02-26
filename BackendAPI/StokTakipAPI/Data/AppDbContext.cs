using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using StokTakipAPI.Models;

namespace StokTakipAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Urun> Urunler { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Urun>()
                .Property(p => p.FiyatUsd)
                .HasColumnType("decimal(18,2)");

            var valueComparer = new ValueComparer<int[]>(
                (c1, c2) => c1.SequenceEqual(c2),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToArray());

            modelBuilder.Entity<Urun>()
                .Property(e => e.SatisGecmisi)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray())
                .Metadata.SetValueComparer(valueComparer);


        }
    }
}

// Add-Migration InitialCreate: Bu komut Entity Framework'e "C# kodlarıma bak ve bunları SQL komutlarına çevir" der.
// Update-Database:EF Core o hazırladığı SQL kodlarını alır, bilgisayarındaki SQL Server'a gönderir ve veritabanını saniyeler içinde sıfırdan inşa eder.