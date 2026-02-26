using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StokTakipAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialDataRemoved : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 5);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Urunler",
                columns: new[] { "Id", "FiyatUsd", "SatisGecmisi", "Stok", "UrunAdi" },
                values: new object[,]
                {
                    { 1, 1200m, "2,3,1,4,2,3,2", 10, "Laptop" },
                    { 2, 150m, "1,2,0,1,2,1,1", 100, "Kablosuz Kulaklık" },
                    { 3, 250m, "5,4,6,5,4,5,5", 8, "Akıllı Saat" },
                    { 4, 150m, "5,3,10,1,3,2,2", 26, "Klavye" },
                    { 5, 50m, "2,2,3,1,1,1,1", 2, "Kablolu Kulaklık" }
                });
        }
    }
}
