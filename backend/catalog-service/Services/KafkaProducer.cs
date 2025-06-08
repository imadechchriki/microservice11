using Confluent.Kafka;
using System.Text.Json;
using CatalogService.Models.Events;

namespace CatalogService.Services
{
    public class KafkaProducer : IKafkaProducer, IDisposable
    {
        private readonly IProducer<string, string> _producer;
        private readonly IConfiguration _configuration;
        private readonly ILogger<KafkaProducer> _logger;

        public KafkaProducer(IConfiguration configuration, ILogger<KafkaProducer> logger)
        {
            _configuration = configuration;
            _logger = logger;

            var config = new ProducerConfig
            {
                BootstrapServers = configuration["Kafka:BootstrapServers"],
                Acks = Acks.Leader,
                RetryBackoffMs = 1000,
                MessageTimeoutMs = 5000
            };

            _producer = new ProducerBuilder<string, string>(config)
                .SetErrorHandler((_, e) => _logger.LogError("Kafka producer error: {Error}", e.Reason))
                .Build();
        }

        public async Task PublishFormationCreatedAsync(FormationCreatedEvent formationEvent)
        {
            var topic = _configuration["Kafka:Topics:FormationEvents"];
            await PublishAsync(topic!, formationEvent, formationEvent.Code);
        }

        public async Task PublishAsync<T>(string topic, T message, string? key = null)
        {
            try
            {
                var json = JsonSerializer.Serialize(message, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var kafkaMessage = new Message<string, string>
                {
                    Key = key ?? Guid.NewGuid().ToString(),
                    Value = json,
                    Timestamp = Timestamp.Default
                };

                var deliveryResult = await _producer.ProduceAsync(topic, kafkaMessage);
                
                _logger.LogInformation(
                    "Message published to topic {Topic}, partition {Partition}, offset {Offset}",
                    deliveryResult.Topic, deliveryResult.Partition, deliveryResult.Offset);
            }
            catch (ProduceException<string, string> ex)
            {
                _logger.LogError(ex, "Failed to publish message to topic {Topic}: {Error}", topic, ex.Error.Reason);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error publishing message to topic {Topic}", topic);
                throw;
            }
        }

        public void Dispose()
        {
            try
            {
                _producer?.Flush(TimeSpan.FromSeconds(10));
                _producer?.Dispose();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disposing Kafka producer");
            }
        }
    }
}