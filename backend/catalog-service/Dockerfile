# Utiliser l'image de base ASP.NET Core Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Utiliser l'image SDK pour la compilation
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copier le fichier de projet et restaurer les dépendances
COPY ["catalog-service.csproj", "./"]
RUN dotnet restore "catalog-service.csproj"

# Copier tout le code source
COPY . .

# Compiler l'application
RUN dotnet build "catalog-service.csproj" -c Release -o /app/build

# Publier l'application
FROM build AS publish
RUN dotnet publish "catalog-service.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Image finale
FROM base AS final
WORKDIR /app

# Copier les fichiers publiés
COPY --from=publish /app/publish .

# Créer un utilisateur non-root pour la sécurité
RUN adduser --disabled-password --home /app --gecos '' appuser && chown -R appuser /app
USER appuser

# Point d'entrée de l'application
ENTRYPOINT ["dotnet", "catalog-service.dll"]