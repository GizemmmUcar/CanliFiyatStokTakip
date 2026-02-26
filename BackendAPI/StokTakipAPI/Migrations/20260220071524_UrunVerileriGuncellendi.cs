using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StokTakipAPI.Migrations
{
    /// <inheritdoc />
    public partial class UrunVerileriGuncellendi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 1,
                column: "Stok",
                value: 10);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Urunler",
                keyColumn: "Id",
                keyValue: 1,
                column: "Stok",
                value: 5);
        }
    }
}
