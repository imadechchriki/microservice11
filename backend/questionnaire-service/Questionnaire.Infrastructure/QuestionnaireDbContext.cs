using Microsoft.EntityFrameworkCore;
using Questionnaire.Domain.Entities;

namespace Questionnaire.Infrastructure
{
    public sealed class QuestionnaireDbContext : DbContext
    {
        public QuestionnaireDbContext(DbContextOptions<QuestionnaireDbContext> options) : base(options) { }

        // DbSets for the entities
        public DbSet<FormationCache> Formations => Set<FormationCache>();
        public DbSet<QuestionnaireTemplate> Templates => Set<QuestionnaireTemplate>();
        public DbSet<Section> Sections => Set<Section>();
        public DbSet<Question> Questions => Set<Question>();
        public DbSet<Publication> Publications => Set<Publication>();
        public DbSet<Submission> Submissions => Set<Submission>();
        public DbSet<SubmissionAnswer> SubmissionAnswers => Set<SubmissionAnswer>();
        public DbSet<FakeUser> Users => Set<FakeUser>();  // For testing

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresEnum<TemplateStatus>();
            modelBuilder.HasPostgresEnum<QuestionType>();
            modelBuilder.HasPostgresEnum<SubmissionStatus>();

            #region FormationCache
            modelBuilder.Entity<FormationCache>(e =>
            {
                e.ToTable("formation_cache");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd(); // Automatically generate an integer value
                e.Property(x => x.Code).HasMaxLength(16);
                e.HasIndex(x => x.Code).IsUnique();
            });
            #endregion

            #region QuestionnaireTemplate
            modelBuilder.Entity<QuestionnaireTemplate>(e =>
            {
                e.ToTable("questionnaire_template");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd(); // Automatically generate an integer value
                e.Property(x => x.Status).HasConversion<short>();
                e.Property(x => x.Role).HasMaxLength(32);
                e.HasIndex(x => new { x.TemplateCode, x.Version }).IsUnique();

                e.HasMany(x => x.Sections)
                 .WithOne()  // Section has no navigation property back to Template
                 .HasForeignKey(s => s.TemplateId)
                 .OnDelete(DeleteBehavior.Cascade);  // Cascade delete for Sections
            });
            #endregion

            #region Section
            modelBuilder.Entity<Section>(e =>
            {
                e.ToTable("section");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd(); // Automatically generate an integer value
                e.HasIndex(x => new { x.TemplateId, x.DisplayOrder }).IsUnique();

                // One-to-many relationship with Questions
                e.HasMany(s => s.Questions)
                 .WithOne()
                 .HasForeignKey(q => q.SectionId)  // Question references the Section
                 .OnDelete(DeleteBehavior.Cascade);  // Cascade delete for Questions
            });
            #endregion

            #region Question
            modelBuilder.Entity<Question>(e =>
            {
                e.ToTable("question");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();  // Automatically generate an integer value
                e.Property(x => x.Type).HasConversion<short>();

                // No need for DisplayOrder anymore
            });
            #endregion

            #region Publication
            modelBuilder.Entity<Publication>(e =>
            {
                e.ToTable("publication");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd(); // Automatically generate an integer value
                e.HasIndex(x => new { x.TemplateCode, x.Version }).IsUnique();

                e.HasMany(p => p.Submissions)
                 .WithOne(s => s.Publication)
                 .HasForeignKey(s => s.PublicationId)
                 .OnDelete(DeleteBehavior.Cascade);
            });
            #endregion

            #region Submission
           modelBuilder.Entity<Submission>(e =>
{
    e.ToTable("submission");
    e.HasKey(x => x.Id);
    e.Property(x => x.Id).ValueGeneratedOnAdd();
    e.Property(x => x.Status).HasConversion<short>();

    // UserId is Guid now, ensure no int assumptions are made
    // If you have configurations depending on UserId type, update here

    e.HasIndex(x => new { x.PublicationId, x.UserId }).IsUnique(false);

    e.HasMany(s => s.Answers)
     .WithOne(sa => sa.Submission)
     .HasForeignKey(sa => sa.SubmissionId)
     .OnDelete(DeleteBehavior.Cascade);
});
            #endregion

            #region SubmissionAnswer
            modelBuilder.Entity<SubmissionAnswer>(e =>
            {
                e.ToTable("submission_answer");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd(); // Automatically generate an integer value
                e.HasIndex(x => new { x.SubmissionId, x.QuestionId }).IsUnique();
            });
            #endregion

            #region FakeUser (For testing only)
            modelBuilder.Entity<FakeUser>(e =>
            {
                e.ToTable("users");
                e.HasKey(x => x.UserId);
                e.Property(x => x.UserId).ValueGeneratedOnAdd();  // Automatically generate an integer value
                e.Property(x => x.Role).HasMaxLength(50);
                e.Property(x => x.Email).HasMaxLength(100);
            });
            #endregion
        }
    }
}
