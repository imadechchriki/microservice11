# Dockerfile pour service ASP.NET Core avec .NET 9.0

# Étape 1: Image de base pour le runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# Étape 2: Image SDK pour la compilation
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copier le fichier projet et restaurer les dépendances
COPY ["*.csproj", "./"]
RUN dotnet restore

# Copier tout le code source
COPY . .

# Compiler l'application
RUN dotnet build -c $BUILD_CONFIGURATION -o /app/build

# Étape 3: Publication
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Étape 4: Image finale
FROM base AS final
WORKDIR /app

# Créer les dossiers nécessaires pour les uploads
RUN mkdir -p /app/wwwroot/uploads/profiles

# Copier les fichiers publiés
COPY --from=publish /app/publish .

# Définir les variables d'environnement par défaut
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Point d'entrée de l'application
ENTRYPOINT ["dotnet", "authentication_system.dll"]