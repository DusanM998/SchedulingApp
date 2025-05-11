using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchedulingApp.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTerminDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Termini",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Termini");
        }
    }
}
