using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatchDb.Backend.Service.Migrations
{
    /// <inheritdoc />
    public partial class PatchSubmittions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Patches",
                table: "Patches");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Patches");

            migrationBuilder.DropColumn(
                name: "LastUpdatedByUserId",
                table: "Patches");

            migrationBuilder.RenameColumn(
                name: "SubmittedByUserId",
                table: "Patches",
                newName: "PatchSubmittionId");

            migrationBuilder.RenameColumn(
                name: "Active",
                table: "Patches",
                newName: "PatchNumber");

            migrationBuilder.AlterColumn<int>(
                name: "PatchNumber",
                table: "Patches",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Patches",
                table: "Patches",
                column: "PatchNumber");

            migrationBuilder.CreateTable(
                name: "PatchSubmittions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PatchNumber = table.Column<int>(type: "INTEGER", nullable: true),
                    FilePath = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: true),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    PatchMaker = table.Column<string>(type: "TEXT", nullable: true),
                    University = table.Column<string>(type: "TEXT", nullable: true),
                    UniversitySection = table.Column<string>(type: "TEXT", nullable: true),
                    ReleaseDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    UploadedByUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    LastUpdatedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Created = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Updated = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatchSubmittions", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatchSubmittions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Patches",
                table: "Patches");

            migrationBuilder.RenameColumn(
                name: "PatchSubmittionId",
                table: "Patches",
                newName: "SubmittedByUserId");

            migrationBuilder.RenameColumn(
                name: "PatchNumber",
                table: "Patches",
                newName: "Active");

            migrationBuilder.AlterColumn<bool>(
                name: "Active",
                table: "Patches",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "Patches",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "LastUpdatedByUserId",
                table: "Patches",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Patches",
                table: "Patches",
                column: "Id");
        }
    }
}
