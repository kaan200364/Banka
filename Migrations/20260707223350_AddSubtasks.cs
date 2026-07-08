using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSF.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSubtasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ParentTaskID",
                table: "ProjectTasks",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTasks_ParentTaskID",
                table: "ProjectTasks",
                column: "ParentTaskID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectTasks_ProjectTasks_ParentTaskID",
                table: "ProjectTasks",
                column: "ParentTaskID",
                principalTable: "ProjectTasks",
                principalColumn: "TaskID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectTasks_ProjectTasks_ParentTaskID",
                table: "ProjectTasks");

            migrationBuilder.DropIndex(
                name: "IX_ProjectTasks_ParentTaskID",
                table: "ProjectTasks");

            migrationBuilder.DropColumn(
                name: "ParentTaskID",
                table: "ProjectTasks");
        }
    }
}
