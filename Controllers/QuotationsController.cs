using CSF.API.DTOs;
using CSF.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CSF.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Administrator,Employee")]
    public class QuotationsController : ControllerBase
    {
        private readonly QuotationService _quotationService;

        public QuotationsController(QuotationService quotationService)
        {
            _quotationService = quotationService;
        }

[HttpGet]
public async Task<ActionResult<PagedResultDto<QuotationDto>>> GetAll(
    [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
{
    return Ok(await _quotationService.GetAllAsync(search, page, pageSize));
}

        [HttpPost]
        public async Task<ActionResult<QuotationDto>> Create(CreateQuotationDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            try
            {
                var created = await _quotationService.CreateAsync(dto, username);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Onaylama işlemi Controller seviyesindeki [Authorize]'dan DAHA SIKI —
        // sadece Administrator, Employee giremez
        [HttpPatch("{id}/approve")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<QuotationDto>> Approve(Guid id)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            try
            {
                var approved = await _quotationService.ApproveAsync(id, username);
                return Ok(approved);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
public async Task<ActionResult<QuotationDto>> Update(Guid id, UpdateQuotationDto dto)
{
    try
    {
        var updated = await _quotationService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

[HttpPatch("{id}/reject")]
[Authorize(Roles = "Administrator")]
public async Task<ActionResult<QuotationDto>> Reject(Guid id)
{
    var username = User.FindFirstValue(ClaimTypes.Name);
    try
    {
        var rejected = await _quotationService.RejectAsync(id, username);
        return Ok(rejected);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
    }
}