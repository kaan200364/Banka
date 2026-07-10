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
        private readonly ReportExportService _exportService;

        public ReportsController(ReportService reportService, ReportExportService exportService)
        {
            _reportService = reportService;
            _exportService = exportService;
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

        [HttpGet("export/pdf")]
        public async Task<IActionResult> ExportPdf([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var financial = await _reportService.GetFinancialSummaryAsync(from, to);
            var quotations = await _reportService.GetQuotationSummaryAsync();
            var projects = await _reportService.GetProjectSummaryAsync();

            var pdfBytes = _exportService.GeneratePdf(financial, quotations, projects);
            return File(pdfBytes, "application/pdf", "rapor.pdf");
        }

        [HttpGet("export/excel")]
        public async Task<IActionResult> ExportExcel([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var financial = await _reportService.GetFinancialSummaryAsync(from, to);
            var quotations = await _reportService.GetQuotationSummaryAsync();
            var projects = await _reportService.GetProjectSummaryAsync();

            var excelBytes = _exportService.GenerateExcel(financial, quotations, projects);
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "rapor.xlsx");
        }

        [HttpGet("dashboard-summary")]
public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
{
    return Ok(await _reportService.GetDashboardSummaryAsync());
}

[HttpGet("customer-summary")]
public async Task<ActionResult<List<CustomerReportItemDto>>> GetCustomerReport()
{
    return Ok(await _reportService.GetCustomerReportAsync());
}

[HttpGet("supplier-summary")]
public async Task<ActionResult<List<SupplierReportItemDto>>> GetSupplierReport()
{
    return Ok(await _reportService.GetSupplierReportAsync());
}

[HttpGet("bank-summary")]
public async Task<ActionResult<List<BankReportItemDto>>> GetBankReport()
{
    return Ok(await _reportService.GetBankReportAsync());
}

[HttpGet("contract-summary")]
public async Task<ActionResult<ContractReportDto>> GetContractReport()
{
    return Ok(await _reportService.GetContractReportAsync());
}

[HttpGet("task-summary")]
public async Task<ActionResult<TaskReportDto>> GetTaskReport()
{
    return Ok(await _reportService.GetTaskReportAsync());
}
    }
}