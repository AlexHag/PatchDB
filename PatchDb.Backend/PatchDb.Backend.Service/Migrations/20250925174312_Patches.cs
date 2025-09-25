using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatchDb.Backend.Service.Migrations
{
    /// <inheritdoc />
    public partial class Patches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Patches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    FilePath = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: true),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    PatchMaker = table.Column<string>(type: "TEXT", nullable: true),
                    University = table.Column<string>(type: "TEXT", nullable: true),
                    UniversitySection = table.Column<string>(type: "TEXT", nullable: true),
                    ReleaseDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Active = table.Column<bool>(type: "INTEGER", nullable: false),
                    SubmittedByUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    LastUpdatedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Created = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Updated = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patches", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Patches");
        }
    }
}
