# Catalog Microservice

Ce microservice fait partie d'un système d'évaluation de formations et gère le catalogue des formations et leurs modules.

## Technologies utilisées

- .NET 8
- Entity Framework Core
- PostgreSQL
- Docker
- Swagger/OpenAPI

## Structure du projet

```
catalog-service/
├── Controllers/         # API Endpoints pour Formations et Modules
├── Data/                # Contexte de base de données et repositories
├── Models/              # Modèles de domaine
├── Services/            # Couche de service avec logique métier
├── DTOs/                # Objets de transfert de données
├── Mapping/             # Profils AutoMapper
├── Dockerfile           # Configuration Docker
├── Program.cs           # Point d'entrée de l'application
└── appsettings.json     # Configuration de l'application
```

## Prérequis

- .NET 8 SDK
- Docker Desktop
- PostgreSQL (ou utiliser l'image Docker PostgreSQL)

## Configuration de la base de données

La chaîne de connexion PostgreSQL est configurée dans `appsettings.json`. Pour une utilisation en développement local, modifiez les paramètres selon votre configuration:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=catalog_db;Username=postgres;Password=your_password"
  }
}
```

Pour une utilisation avec Docker, la chaîne de connexion sera automatiquement configurée pour utiliser le conteneur PostgreSQL.

