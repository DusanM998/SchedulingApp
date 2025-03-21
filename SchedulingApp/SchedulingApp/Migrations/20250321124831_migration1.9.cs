﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchedulingApp.Migrations
{
    /// <inheritdoc />
    public partial class migration19 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SportskiObjekatId",
                table: "RezervacijaDetalji",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_RezervacijaDetalji_SportskiObjekatId",
                table: "RezervacijaDetalji",
                column: "SportskiObjekatId");

            migrationBuilder.AddForeignKey(
                name: "FK_RezervacijaDetalji_SportskiObjekti_SportskiObjekatId",
                table: "RezervacijaDetalji",
                column: "SportskiObjekatId",
                principalTable: "SportskiObjekti",
                principalColumn: "SportskiObjekatId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RezervacijaDetalji_SportskiObjekti_SportskiObjekatId",
                table: "RezervacijaDetalji");

            migrationBuilder.DropIndex(
                name: "IX_RezervacijaDetalji_SportskiObjekatId",
                table: "RezervacijaDetalji");

            migrationBuilder.DropColumn(
                name: "SportskiObjekatId",
                table: "RezervacijaDetalji");
        }
    }
}
