using authentication_system.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace authentication_system.Data
{
    public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<StudentProfile> StudentProfiles { get; set; }
        public DbSet<TeacherProfile> TeacherProfiles { get; set; }
        public DbSet<ProfessionalProfile> ProfessionalProfiles { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } // Ajout de cette ligne

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.HasPostgresExtension("uuid-ossp");

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Id).HasColumnType("uuid");

                entity.HasOne(u => u.Role)
                      .WithMany()
                      .HasForeignKey(u => u.RoleId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(u => u.RefreshTokens)
                      .WithOne(rt => rt.User)
                      .HasForeignKey(rt => rt.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(u => u.Profile)
                      .WithOne(p => p.User)
                      .HasForeignKey<UserProfile>(p => p.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(u => u.StudentProfile)
                      .WithOne(sp => sp.User)
                      .HasForeignKey<StudentProfile>(sp => sp.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(u => u.TeacherProfile)
                      .WithOne(tp => tp.User)
                      .HasForeignKey<TeacherProfile>(tp => tp.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(u => u.ProfessionalProfile)
                      .WithOne(pp => pp.User)
                      .HasForeignKey<ProfessionalProfile>(pp => pp.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.Property(e => e.Id).HasColumnType("uuid");
            });

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.Property(e => e.Id).HasColumnType("uuid");
            });

            modelBuilder.Entity<UserProfile>(entity =>
            {
                entity.Property(e => e.Id).HasColumnType("uuid");
                entity.HasIndex(p => p.UserId).IsUnique();
            });


            modelBuilder.Entity<PasswordResetToken>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.Token)
                    .IsUnique();
            });



            modelBuilder.Entity<StudentProfile>(entity =>
            {
                entity.Property(e => e.Id).HasColumnType("uuid");
                entity.HasIndex(p => p.UserId).IsUnique();
                entity.Property(p => p.Filiere).IsRequired();
            });

            modelBuilder.Entity<TeacherProfile>(entity =>
            {
                entity.Property(e => e.Id).HasColumnType("uuid");
                entity.HasIndex(p => p.UserId).IsUnique();
            });

            modelBuilder.Entity<ProfessionalProfile>(entity =>
            {
                entity.Property(e => e.Id).HasColumnType("uuid");
                entity.HasIndex(p => p.UserId).IsUnique();
            });
        }

        public static async Task SeedAsync(UserDbContext context)
        {
            if (!await context.Roles.AnyAsync())
            {
                var roles = new[]
                {
                    new Role { Id = Guid.NewGuid(), Name = "Admin" },
                    new Role { Id = Guid.NewGuid(), Name = "Enseignant" },
                    new Role { Id = Guid.NewGuid(), Name = "Étudiant" },
                    new Role { Id = Guid.NewGuid(), Name = "Professionnel" }
                };

                await context.Roles.AddRangeAsync(roles);
                await context.SaveChangesAsync();
            }

            if (!await context.Users.AnyAsync())
            {
                var adminUser = new User
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Admin",
                    LastName = "Admin",
                    Email = "admin@adm.uae.ac.ma",
                    CreatedAt = DateTime.UtcNow
                };

                var passwordHasher = new PasswordHasher<User>();
                adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "Admin@123");

                var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");
                adminUser.RoleId = adminRole.Id;

                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}