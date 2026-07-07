using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSF.API.Migrations
{
    /// <inheritdoc />
    public partial class AddContractRenewalTermination : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RenewedFromContractID",
                table: "Contracts",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TerminationReason",
                table: "Contracts",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RenewedFromContractID",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "TerminationReason",
                table: "Contracts");
        }
    }
}
