using Catalog.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Catalog.API.Data.Configurations
{
    public class ModuleConfiguration : IEntityTypeConfiguration<Module>
    {
        public void Configure(EntityTypeBuilder<Module> builder)
        {
            builder.HasKey(m => m.Id);
            
            builder.Property(m => m.Title)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(m => m.Description)
                .IsRequired()
                .HasMaxLength(500);
                
            builder.Property(m => m.Code)
                .IsRequired()
                .HasMaxLength(20);
                
            builder.Property(m => m.Hours)
                .IsRequired();
                
            builder.Property(m => m.Credits)
                .IsRequired();
        }
    }
}