using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StokTakipAPI.Migrations
{
    /// <inheritdoc />
    public partial class Yeni1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Stock",
                table: "Urunler",
                newName: "Stok");

            migrationBuilder.RenameColumn(
                name: "SalesHistory",
                table: "Urunler",
                newName: "UrunAdi");

            migrationBuilder.RenameColumn(
                name: "PriceUsd",
                table: "Urunler",
                newName: "FiyatUsd");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Urunler",
                newName: "SatisGecmisi");

            migrationBuilder.UpdateData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "SatisGecmisi", "UrunAdi" },
                values: new object[] { "2,3,1,4,2,3,2", "Laptop" });

            migrationBuilder.UpdateData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "SatisGecmisi", "UrunAdi" },
                values: new object[] { "1,2,0,1,2,1,1", "Kablosuz Kulaklık" });

            migrationBuilder.UpdateData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "SatisGecmisi", "UrunAdi" },
                values: new object[] { "5,4,6,5,4,5,5", "Akıllı Saat" });

            migrationBuilder.InsertData(
                table: "Urunler",
                columns: new[] { "Id", "FiyatUsd", "SatisGecmisi", "Stok", "UrunAdi" },
                values: new object[,]
                {
                    { 4, 150m, "5,3,10,1,3,2,2", 26, "Klavye" },
                    { 5, 50m, "2,2,3,1,1,1,1", 2, "Kablolu Kulaklık" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.RenameColumn(
                name: "UrunAdi",
                table: "Urunler",
                newName: "SalesHistory");

            migrationBuilder.RenameColumn(
                name: "Stok",
                table: "Urunler",
                newName: "Stock");

            migrationBuilder.RenameColumn(
                name: "SatisGecmisi",
                table: "Urunler",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "FiyatUsd",
                table: "Urunler",
                newName: "PriceUsd");

            migrationBuilder.UpdateData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Name", "SalesHistory" },
                values: new object[] { "Oyuncu Laptopu", "2,3,1,4,2,3,2" });

            migrationBuilder.UpdateData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Name", "SalesHistory" },
                values: new object[] { "Kablosuz Kulaklık", "1,2,0,1,2,1,1" });

            migrationBuilder.UpdateData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Name", "SalesHistory" },
                values: new object[] { "Akıllı Saat", "5,4,6,5,4,5,5" });
        }
    }
}
