using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchedulingApp.Migrations
{
    /// <inheritdoc />
    public partial class migration18 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "UkupnoCena",
                table: "RezervacijaHeader",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UkupnoCena",
                table: "RezervacijaHeader");
        }
    }
}
