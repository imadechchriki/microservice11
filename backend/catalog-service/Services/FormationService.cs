using AutoMapper;
using Catalog.API.Data.Repositories.Interfaces;
using Catalog.API.DTOs;
using Catalog.API.Models;
using Catalog.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CatalogService.Services;
using CatalogService.Models.Events;

namespace Catalog.API.Services
{
    public class FormationService : IFormationService
    {
        private readonly IFormationRepository _formationRepository;
        private readonly IMapper _mapper;
        private readonly IKafkaProducer _kafkaProducer;
        private readonly ILogger<FormationService> _logger;

        public FormationService(
            IFormationRepository formationRepository, 
            IMapper mapper,
            IKafkaProducer kafkaProducer,
            ILogger<FormationService> logger)
        {
            _formationRepository = formationRepository;
            _mapper = mapper;
            _kafkaProducer = kafkaProducer;
            _logger = logger;
        }

        public async Task<IEnumerable<FormationDto>> GetAllFormationsAsync()
        {
            var formations = await _formationRepository.GetAllFormationsWithModulesAsync();
            return _mapper.Map<IEnumerable<FormationDto>>(formations);
        }

        public async Task<FormationDto> GetFormationByIdAsync(int id)
        {
            var formation = await _formationRepository.GetFormationWithModulesAsync(id);
            if (formation == null)
                return null;

            return _mapper.Map<FormationDto>(formation);
        }

        public async Task<FormationDto> CreateFormationAsync(CreateFormationDto formationDto)
        {
            var formation = _mapper.Map<Formation>(formationDto);
            formation.CreatedAt = DateTime.UtcNow;
            formation.UpdatedAt = DateTime.UtcNow;

            await _formationRepository.AddAsync(formation);
            await _formationRepository.SaveChangesAsync();

            var result = _mapper.Map<FormationDto>(formation);

            // Publish event to Kafka
            try
            {
                var formationEvent = new FormationCreatedEvent
                {
                    Title = result.Title,
                    Description = result.Description,
                    Code = result.Code,
                    Credits = result.Credits,
                    CreatedAt = DateTime.UtcNow
                };

                await _kafkaProducer.PublishFormationCreatedAsync(formationEvent);
                _logger.LogInformation("Formation created event published for formation {Code}", result.Code);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to publish formation created event for formation {Code}", result.Code);
                // Don't fail the operation if event publishing fails
            }

            return result;
        }

        public async Task<FormationDto> UpdateFormationAsync(int id, UpdateFormationDto formationDto)
        {
            var formation = await _formationRepository.GetByIdAsync(id);
            if (formation == null)
                return null;

            _mapper.Map(formationDto, formation);
            formation.UpdatedAt = DateTime.UtcNow;

            await _formationRepository.UpdateAsync(formation);
            await _formationRepository.SaveChangesAsync();

            return _mapper.Map<FormationDto>(formation);
        }

        public async Task DeleteFormationAsync(int id)
        {
            var formation = await _formationRepository.GetByIdAsync(id);
            if (formation == null)
                return;

            await _formationRepository.DeleteAsync(formation);
            await _formationRepository.SaveChangesAsync();
        }
    }
}