using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Questionnaire.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:question_type", "likert,binary,text")
                .Annotation("Npgsql:Enum:submission_status", "pending,completed")
                .Annotation("Npgsql:Enum:template_status", "draft,published");

            migrationBuilder.CreateTable(
                name: "formation_cache",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Credits = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_formation_cache", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "publication",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TemplateCode = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    FiliereId = table.Column<int>(type: "integer", nullable: false),
                    StartAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_publication", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "questionnaire_template",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TemplateCode = table.Column<string>(type: "text", nullable: true),
                    FiliereId = table.Column<int>(type: "integer", nullable: false),
                    Role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<short>(type: "smallint", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_questionnaire_template", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "submission",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PublicationId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<short>(type: "smallint", nullable: false),
                    SubmittedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_submission", x => x.Id);
                    table.ForeignKey(
                        name: "FK_submission_publication_PublicationId",
                        column: x => x.PublicationId,
                        principalTable: "publication",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "section",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TemplateId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_section", x => x.Id);
                    table.ForeignKey(
                        name: "FK_section_questionnaire_template_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "questionnaire_template",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "question",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SectionId = table.Column<int>(type: "integer", nullable: false),
                    Wording = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<short>(type: "smallint", nullable: false),
                    Mandatory = table.Column<bool>(type: "boolean", nullable: false),
                    MaxLength = table.Column<int>(type: "integer", nullable: true),
                    Options = table.Column<List<string>>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_question", x => x.Id);
                    table.ForeignKey(
                        name: "FK_question_section_SectionId",
                        column: x => x.SectionId,
                        principalTable: "section",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "submission_answer",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubmissionId = table.Column<int>(type: "integer", nullable: false),
                    QuestionId = table.Column<int>(type: "integer", nullable: false),
                    ValueNumber = table.Column<decimal>(type: "numeric", nullable: true),
                    ValueText = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_submission_answer", x => x.Id);
                    table.ForeignKey(
                        name: "FK_submission_answer_question_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "question",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_submission_answer_submission_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "submission",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_formation_cache_Code",
                table: "formation_cache",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_publication_TemplateCode_Version",
                table: "publication",
                columns: new[] { "TemplateCode", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_question_SectionId",
                table: "question",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_questionnaire_template_TemplateCode_Version",
                table: "questionnaire_template",
                columns: new[] { "TemplateCode", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_section_TemplateId_DisplayOrder",
                table: "section",
                columns: new[] { "TemplateId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_submission_PublicationId_UserId",
                table: "submission",
                columns: new[] { "PublicationId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_submission_answer_QuestionId",
                table: "submission_answer",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_submission_answer_SubmissionId_QuestionId",
                table: "submission_answer",
                columns: new[] { "SubmissionId", "QuestionId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "formation_cache");

            migrationBuilder.DropTable(
                name: "submission_answer");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "question");

            migrationBuilder.DropTable(
                name: "submission");

            migrationBuilder.DropTable(
                name: "section");

            migrationBuilder.DropTable(
                name: "publication");

            migrationBuilder.DropTable(
                name: "questionnaire_template");
        }
    }
}
