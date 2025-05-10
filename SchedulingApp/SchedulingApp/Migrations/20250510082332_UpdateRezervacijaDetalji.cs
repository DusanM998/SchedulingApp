using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchedulingApp.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRezervacijaDetalji : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NazivSportskogObjekta",
                table: "RezervacijaDetalji",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NazivSportskogObjekta",
                table: "RezervacijaDetalji");
        }
    }
}
