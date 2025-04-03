using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchedulingApp.Migrations
{
    /// <inheritdoc />
    public partial class migration16 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StavkaKorpeId",
                table: "Termini",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Termini_StavkaKorpeId",
                table: "Termini",
                column: "StavkaKorpeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Termini_StavkeKorpe_StavkaKorpeId",
                table: "Termini",
                column: "StavkaKorpeId",
                principalTable: "StavkeKorpe",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Termini_StavkeKorpe_StavkaKorpeId",
                table: "Termini");

            migrationBuilder.DropIndex(
                name: "IX_Termini_StavkaKorpeId",
                table: "Termini");

            migrationBuilder.DropColumn(
                name: "StavkaKorpeId",
                table: "Termini");
        }
    }
}
