using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatchDb.Backend.Service.Migrations
{
    /// <inheritdoc />
    public partial class CascadeUserPatchOnPatchDeletion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserPatches_Patches_PatchNumber",
                table: "UserPatches");

            migrationBuilder.AddForeignKey(
                name: "FK_UserPatches_Patches_PatchNumber",
                table: "UserPatches",
                column: "PatchNumber",
                principalTable: "Patches",
                principalColumn: "PatchNumber",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserPatches_Patches_PatchNumber",
                table: "UserPatches");

            migrationBuilder.AddForeignKey(
                name: "FK_UserPatches_Patches_PatchNumber",
                table: "UserPatches",
                column: "PatchNumber",
                principalTable: "Patches",
                principalColumn: "PatchNumber",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
