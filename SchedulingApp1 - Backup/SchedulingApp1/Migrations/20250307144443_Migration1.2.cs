using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchedulingApp1.Migrations
{
    /// <inheritdoc />
    public partial class Migration12 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StavkeKorpe_Korpa_KorpaId",
                table: "StavkeKorpe");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Korpa",
                table: "Korpa");

            migrationBuilder.RenameTable(
                name: "Korpa",
                newName: "Korpe");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Korpe",
                table: "Korpe",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StavkeKorpe_Korpe_KorpaId",
                table: "StavkeKorpe",
                column: "KorpaId",
                principalTable: "Korpe",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StavkeKorpe_Korpe_KorpaId",
                table: "StavkeKorpe");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Korpe",
                table: "Korpe");

            migrationBuilder.RenameTable(
                name: "Korpe",
                newName: "Korpa");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Korpa",
                table: "Korpa",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StavkeKorpe_Korpa_KorpaId",
                table: "StavkeKorpe",
                column: "KorpaId",
                principalTable: "Korpa",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
