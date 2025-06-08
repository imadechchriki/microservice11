# Utiliser l'image SDK .NET 8 pour la phase de build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copier les fichiers de projet (.csproj) pour la restauration des packages
COPY Questionnaire.API/*.csproj ./Questionnaire.API/
COPY Questionnaire.Application/*.csproj ./Questionnaire.Application/
COPY Questionnaire.Domain/*.csproj ./Questionnaire.Domain/
COPY Questionnaire.Infrastructure/*.csproj ./Questionnaire.Infrastructure/
COPY Questionnaire.Worker/*.csproj ./Questionnaire.Worker/

# Restaurer les dépendances
RUN dotnet restore Questionnaire.API/Questionnaire.API.csproj

# Copier tout le code source
COPY . ./

# Construire et publier l'application
RUN dotnet publish Questionnaire.API/Questionnaire.API.csproj -c Release -o out --no-restore

# Phase d'exécution - utiliser l'image runtime plus légère
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Installer les certificats CA et nettoyer le cache
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copier les fichiers publiés depuis la phase de build
COPY --from=build-env /app/out .

# Créer un utilisateur non-root pour la sécurité
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Exposer le port 8080 (port interne du conteneur)
EXPOSE 8080

# Variables d'environnement par défaut
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Point d'entrée de l'application
ENTRYPOINT ["dotnet", "Questionnaire.API.dll"]