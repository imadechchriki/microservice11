namespace CatalogService.Services;
using CatalogService.Models.Events;

     public interface IKafkaProducer
    {
        Task PublishFormationCreatedAsync(FormationCreatedEvent formationEvent);
        Task PublishAsync<T>(string topic, T message, string? key = null);
    }
