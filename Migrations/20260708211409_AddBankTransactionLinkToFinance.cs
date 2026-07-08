using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSF.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBankTransactionLinkToFinance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BankTransactionID",
                table: "Incomes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BankTransactionID",
                table: "Expenses",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BankTransactionID",
                table: "Incomes");

            migrationBuilder.DropColumn(
                name: "BankTransactionID",
                table: "Expenses");
        }
    }
}
