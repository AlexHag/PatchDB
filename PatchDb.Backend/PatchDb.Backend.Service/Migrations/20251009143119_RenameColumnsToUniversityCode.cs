using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatchDb.Backend.Service.Migrations
{
    /// <inheritdoc />
    public partial class RenameColumnsToUniversityCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "University",
                table: "PatchSubmittions",
                newName: "UniversityCode");

            migrationBuilder.RenameColumn(
                name: "University",
                table: "Patches",
                newName: "UniversityCode");

            migrationBuilder.RenameColumn(
                name: "PatchSubmittionId",
                table: "Patches",
                newName: "PatchSubmissionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UniversityCode",
                table: "PatchSubmittions",
                newName: "University");

            migrationBuilder.RenameColumn(
                name: "UniversityCode",
                table: "Patches",
                newName: "University");

            migrationBuilder.RenameColumn(
                name: "PatchSubmissionId",
                table: "Patches",
                newName: "PatchSubmittionId");
        }
    }
}
