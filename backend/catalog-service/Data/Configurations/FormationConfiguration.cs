using Catalog.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Catalog.API.Data.Configurations
{
    public class FormationConfiguration : IEntityTypeConfiguration<Formation>
    {
        public void Configure(EntityTypeBuilder<Formation> builder)
        {
            builder.HasKey(f => f.Id);
            
            builder.Property(f => f.Title)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(f => f.Description)
                .IsRequired()
                .HasMaxLength(500);
                
            builder.Property(f => f.Code)
                .IsRequired()
                .HasMaxLength(20);
                
            builder.Property(f => f.Credits)
                .IsRequired();
                
            builder.HasMany(f => f.Modules)
                .WithOne(m => m.Formation)
                .HasForeignKey(m => m.FormationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}