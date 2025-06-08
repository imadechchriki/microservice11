using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Http;
using System.Net.Http;
using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;
using Questionnaire.Domain.Entities; // Pour FormationCacheDto
using Questionnaire.Domain.Entities.Events;
using Questionnaire.Infrastructure;
using Microsoft.EntityFrameworkCore;
 // Pour FormationCreatedEvent

namespace Questionnaire.Application.Services
{
    public class FormationCacheService : IFormationCacheService
    {
        // Using in-memory cache for simplicity - you can replace with Redis, Database, etc.
        private readonly ConcurrentDictionary<string, FormationCacheDto> _cache = new();
        private readonly ILogger<FormationCacheService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly QuestionnaireDbContext _dbContext;

        public FormationCacheService(
            QuestionnaireDbContext dbContext,
            ILogger<FormationCacheService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _dbContext = dbContext;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public async Task AddOrUpdateFormationAsync(FormationCreatedEvent formationEvent)
{
    try
    {
        var existing = await _dbContext.Formations
            .FirstOrDefaultAsync(f => f.Code == formationEvent.Code);

        if (existing == null)
        {
            var newEntity = new FormationCache
            {
                Code = formationEvent.Code,
                Title = formationEvent.Title,
                Description = formationEvent.Description,
                Credits = formationEvent.Credits
            };

            await _dbContext.Formations.AddAsync(newEntity);
        }
        else
        {
            existing.Title = formationEvent.Title;
            existing.Description = formationEvent.Description;
            existing.Credits = formationEvent.Credits;
            _dbContext.Formations.Update(existing);
        }

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Formation cache saved to DB for code: {Code}", formationEvent.Code);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error saving formation to DB for code: {Code}", formationEvent.Code);
        throw;
    }
}



        private async Task UpdateCacheViaHttpAsync(FormationCacheDto formation)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var json = JsonSerializer.Serialize(formation, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                var content = new StringContent(json, Encoding.UTF8, new MediaTypeHeaderValue("application/json"));

                var response = await httpClient.PostAsync("http://localhost:5004/api/formation-cache", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Formation cache HTTP endpoint updated successfully for code: {Code}", formation.Code);
                }
                else
                {
                    _logger.LogWarning("Formation cache HTTP endpoint update failed with status: {StatusCode} for code: {Code}", 
                        response.StatusCode, formation.Code);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update formation cache via HTTP for code: {Code}", formation.Code);
            }
        }

        public Task<FormationCacheDto?> GetFormationAsync(string code)
        {
            _cache.TryGetValue(code, out var formation);
            return Task.FromResult(formation);
        }

        public Task<IEnumerable<FormationCacheDto>> GetAllFormationsAsync()
        {
            return Task.FromResult(_cache.Values.AsEnumerable());
        }
    }
}