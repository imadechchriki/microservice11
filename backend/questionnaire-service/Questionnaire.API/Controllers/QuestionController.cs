using Microsoft.AspNetCore.Mvc;
using Questionnaire.Application.Services;
using Questionnaire.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace Questionnaire.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/template/{templateId}/section/{sectionId}/question")]
    [ApiController]
    public class QuestionController : ControllerBase
    {
        private readonly QuestionService _questionService;

        public QuestionController(QuestionService questionService)
        {
            _questionService = questionService;
        }

        // POST api/template/{templateId}/section/{sectionId}/question/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateQuestion(int templateId, int sectionId, [FromBody] CreateQuestionRequest request)
        {
            try
            {
                var question = await _questionService.CreateQuestionAsync(templateId, sectionId, request.Wording, request.Type, request.MaxLength);
                return Ok(question);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);  // Return 404 if Section or Template not found
            }
        }

        // GET api/template/{templateId}/section/{sectionId}/questions
        [HttpGet("questions")]
        public async Task<IActionResult> GetQuestions(int templateId, int sectionId)
        {
            try
            {
                var questions = await _questionService.GetQuestionsBySectionIdAsync(templateId, sectionId);
                return Ok(questions);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET api/template/{templateId}/section/{sectionId}/question/{questionId}
        [HttpGet("{questionId}")]
        public async Task<IActionResult> GetQuestion(int templateId, int sectionId, int questionId)
        {
            try
            {
                var question = await _questionService.GetQuestionByIdAsync(templateId, sectionId, questionId);
                return Ok(question);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // PUT api/template/{templateId}/section/{sectionId}/question/{questionId}/update
        [HttpPut("{questionId}/update")]
        public async Task<IActionResult> UpdateQuestion(int templateId, int sectionId, int questionId, [FromBody] UpdateQuestionRequest request)
        {
            try
            {
                var updatedQuestion = await _questionService.UpdateQuestionAsync(templateId, sectionId, questionId, request.Wording, request.Type, request.MaxLength);
                return Ok(updatedQuestion);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // DELETE api/template/{templateId}/section/{sectionId}/question/{questionId}/delete
        [HttpDelete("{questionId}/delete")]
        public async Task<IActionResult> DeleteQuestion(int templateId, int sectionId, int questionId)
        {
            try
            {
                await _questionService.DeleteQuestionAsync(templateId, sectionId, questionId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}