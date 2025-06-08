using Confluent.Kafka;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;
using Questionnaire.Domain.Entities.Events;

namespace Questionnaire.Application.Services
{
    public class FormationEventConsumer : BackgroundService
    {
        private readonly ILogger<FormationEventConsumer> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _configuration;
        private readonly IConsumer<string, string> _consumer;

        public FormationEventConsumer(
            IConfiguration configuration,
            IServiceProvider serviceProvider,
            ILogger<FormationEventConsumer> logger)
        {
            _configuration = configuration;
            _serviceProvider = serviceProvider;
            _logger = logger;

            var config = new ConsumerConfig
            {
                GroupId = "questionnaire-service-group",
                BootstrapServers = _configuration["Kafka:BootstrapServers"] ?? "kafka:29092",

                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = true
            };

            _consumer = new ConsumerBuilder<string, string>(config).Build();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    _logger.LogInformation("Kafka consumer starting...");
    _consumer.Subscribe("formation-events");
    _logger.LogInformation("Subscribed to topic 'formation-events'");

    // Let the rest of the app finish starting before blocking loop
    await Task.Yield(); // ✅ Let host startup complete

    try
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var consumeResult = _consumer.Consume(TimeSpan.FromSeconds(1));

                if (consumeResult?.Message?.Value != null)
                {
                    _logger.LogInformation("Received Kafka message — Key: {Key}, Value: {Value}",
                        consumeResult.Message.Key, consumeResult.Message.Value);

                    await ProcessMessageAsync(consumeResult.Message.Value);
                }
            }
            catch (ConsumeException ex)
            {
                _logger.LogError(ex, "Error consuming message from Kafka");
            }
        }
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error in FormationEventConsumer");
    }
    finally
    {
        _consumer.Close();
        _logger.LogInformation("Kafka consumer closed");
    }
}


        private async Task ProcessMessageAsync(string message)
        {
            try
            {
                var formationEvent = JsonSerializer.Deserialize<FormationCreatedEvent>(message, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                if (formationEvent != null)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var formationCacheService = scope.ServiceProvider.GetRequiredService<IFormationCacheService>();

                    await formationCacheService.AddOrUpdateFormationAsync(formationEvent);

                    _logger.LogInformation("Successfully processed formation event for code: {Code}", formationEvent.Code);
                }
                else
                {
                    _logger.LogWarning("Received null formation event from message: {Message}", message);
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialize formation event message: {Message}", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process formation event message: {Message}", message);
            }
        }

        public override void Dispose()
        {
            try
            {
                _consumer?.Dispose();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disposing consumer");
            }
            finally
            {
                base.Dispose();
            }
        }
    }
}
