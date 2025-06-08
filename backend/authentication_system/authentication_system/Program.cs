using System.Text;
using authentication_system.Data;
using authentication_system.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using DotNetEnv;
using authentication_system.Services.Interfaces;
using authentication_system.Services.Auth;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Charger les variables d'environnement depuis le fichier .env
Env.Load();

// Add controllers
builder.Services.AddControllers();

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<StudentUpdateDTOValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<TeacherUpdateDTOValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<ProfessionalUpdateDTOValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<UserProfileCreateDTOValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<UserProfileUpdateDTOValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<TeacherCreateDTOValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<StudentCreateDTOValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<ProfessionalCreateDTOValidator>();

// Add Swagger and configure JWT security for Swagger UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new OpenApiInfo { Title = "JwtAuthDotNet9 API", Version = "v1" });
    var jwtScheme = new OpenApiSecurityScheme
    {
        Scheme = "bearer",
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };
    o.AddSecurityDefinition(jwtScheme.Reference.Id, jwtScheme);
    o.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtScheme, Array.Empty<string>() }
    });
});

// Configuration de la base de données avec les variables d'environnement
var connectionString = $"Host={Environment.GetEnvironmentVariable("DB_HOST")};" +
                       $"Port={Environment.GetEnvironmentVariable("DB_PORT")};" +
                       $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
                       $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
                       $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};";

// Configure PostgreSQL database context
builder.Services.AddDbContext<UserDbContext>(opt =>
    opt.UseNpgsql(connectionString));

// Dependency injection
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IErrorHandler, ErrorHandler>();
builder.Services.AddScoped<StudentAdminService>();
builder.Services.AddScoped<TeacherAdminService>();
builder.Services.AddScoped<ProfessionalAdminService>();
builder.Services.AddHostedService<RefreshTokenCleanupService>();

builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Récupérer les variables d'environnement pour JWT
var jwtKey = Environment.GetEnvironmentVariable("JWT_TOKEN");
var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");

// Vérifier que la clé JWT est définie
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("La variable d'environnement JWT_TOKEN n'est pas définie. Vérifiez votre fichier .env.");
}

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendDev", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // utile si tu utilises des cookies ou des requêtes auth
    });
});

var app = builder.Build();

// Migration automatique et initialisation de la base de données
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try
    {
        var dbContext = services.GetRequiredService<UserDbContext>();
        
        // Vérifier si la base de données peut être connectée
        logger.LogInformation("Vérification de la connexion à la base de données...");
        await dbContext.Database.CanConnectAsync();
        logger.LogInformation("Connexion à la base de données réussie.");
        
        // Appliquer automatiquement les migrations
        logger.LogInformation("Application des migrations...");
        var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
        
        if (pendingMigrations.Any())
        {
            logger.LogInformation($"Migrations en attente détectées: {string.Join(", ", pendingMigrations)}");
            await dbContext.Database.MigrateAsync();
            logger.LogInformation("Migrations appliquées avec succès.");
        }
        else
        {
            logger.LogInformation("Aucune migration en attente.");
        }
        
        // Seed database (if needed)
        logger.LogInformation("Initialisation des données de base...");
        await UserDbContext.SeedAsync(dbContext);
        logger.LogInformation("Initialisation des données terminée.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erreur lors de l'initialisation de la base de données: {Message}", ex.Message);
        
        // En développement, on peut choisir de continuer malgré l'erreur
        // En production, il vaut mieux arrêter l'application
        if (!app.Environment.IsDevelopment())
        {
            throw;
        }
        
        logger.LogWarning("L'application continue malgré l'erreur de base de données (mode développement).");
    }
}

// Swagger middleware (docs only in dev)
// Swagger middleware (enabled always, including production)
app.UseSwagger();
app.UseSwaggerUI(o =>
{
    o.SwaggerEndpoint("/swagger/v1/swagger.json", "JwtAuthDotNet9 API v1");
    o.RoutePrefix = "docs"; // accessible via /docs
});


// Middleware order is important
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowFrontendDev");
app.UseAuthentication(); // <- Must come before Authorization
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => "Service is running").AllowAnonymous();

app.Run();