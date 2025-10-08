using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatchDb.Backend.Service.Migrations
{
    /// <inheritdoc />
    public partial class UserPatchesAndPatchUploads : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserPatches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PatchNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    IsFavorite = table.Column<bool>(type: "INTEGER", nullable: false),
                    Created = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Updated = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPatches_Patches_PatchNumber",
                        column: x => x.PatchNumber,
                        principalTable: "Patches",
                        principalColumn: "PatchNumber",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "UserPatchUploads",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    FilePath = table.Column<string>(type: "TEXT", nullable: false),
                    UserPatchId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Created = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UserPatchEntityId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPatchUploads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPatchUploads_UserPatches_UserPatchEntityId",
                        column: x => x.UserPatchEntityId,
                        principalTable: "UserPatches",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserPatchUploads_UserPatches_UserPatchId",
                        column: x => x.UserPatchId,
                        principalTable: "UserPatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserPatches_PatchNumber",
                table: "UserPatches",
                column: "PatchNumber");

            migrationBuilder.CreateIndex(
                name: "IX_UserPatchUploads_UserPatchEntityId",
                table: "UserPatchUploads",
                column: "UserPatchEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPatchUploads_UserPatchId",
                table: "UserPatchUploads",
                column: "UserPatchId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserPatchUploads");

            migrationBuilder.DropTable(
                name: "UserPatches");
        }
    }
}
