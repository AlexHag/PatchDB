using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatchDb.Backend.Service.Migrations
{
    /// <inheritdoc />
    public partial class FixTypo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "PatchSubmittions",
                newName: "PatchSubmissions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "PatchSubmissions",
                newName: "PatchSubmittions");
        }
    }
}
