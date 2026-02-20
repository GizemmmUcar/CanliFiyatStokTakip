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

            modelBuilder.Entity<Urun>().HasData(

                new Urun { Id = 1, UrunAdi = "Laptop", Stok = 5, FiyatUsd = 1200m, SatisGecmisi = new int[] { 2, 3, 1, 4, 2, 3, 2 } },
                new Urun { Id = 2, UrunAdi = "Kablosuz Kulaklık", Stok = 100, FiyatUsd = 150m, SatisGecmisi = new int[] { 1, 2, 0, 1, 2, 1, 1 } },
                new Urun { Id = 3, UrunAdi = "Akıllı Saat", Stok = 8, FiyatUsd = 250m, SatisGecmisi = new int[] { 5, 4, 6, 5, 4, 5, 5 } },
                new Urun { Id = 4, UrunAdi = "Klavye", Stok = 26, FiyatUsd = 150m, SatisGecmisi = new int[] { 5, 3, 10, 1, 3, 2, 2 } },
                new Urun { Id = 5, UrunAdi = "Kablolu Kulaklık", Stok = 2, FiyatUsd = 50m, SatisGecmisi = new int[] { 2, 2, 3, 1, 1, 1, 1 } }
            );
        }
    }
}