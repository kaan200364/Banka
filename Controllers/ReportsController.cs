using CSF.API.DTOs;
using CSF.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CSF.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Administrator,Manager")]
    public class ReportsController : ControllerBase
    {
        private readonly ReportService _reportService;

        public ReportsController(ReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("financial-summary")]
        public async Task<ActionResult<FinancialSummaryDto>> GetFinancialSummary(
            [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            return Ok(await _reportService.GetFinancialSummaryAsync(from, to));
        }

        [HttpGet("project-summary")]
        public async Task<ActionResult<List<ProjectSummaryDto>>> GetProjectSummary()
        {
            return Ok(await _reportService.GetProjectSummaryAsync());
        }

        [HttpGet("quotation-summary")]
        public async Task<ActionResult<QuotationSummaryDto>> GetQuotationSummary()
        {
            return Ok(await _reportService.GetQuotationSummaryAsync());
        }
    }
}