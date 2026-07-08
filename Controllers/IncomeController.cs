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
    public class IncomeController : ControllerBase
    {
        private readonly IncomeService _incomeService;

        public IncomeController(IncomeService incomeService)
        {
            _incomeService = incomeService;
        }

      [HttpGet]
public async Task<ActionResult<PagedResultDto<IncomeDto>>> GetAll(
    [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
{
    return Ok(await _incomeService.GetAllAsync(search, page, pageSize));
}

        [HttpPost]
        public async Task<ActionResult<IncomeDto>> Create(CreateIncomeDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            try
            {
                var created = await _incomeService.CreateAsync(dto, username);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
public async Task<ActionResult<IncomeDto>> Update(Guid id, UpdateIncomeDto dto)
{
    var updated = await _incomeService.UpdateAsync(id, dto);
    if (updated == null) return NotFound();
    return Ok(updated);
}

[HttpDelete("{id}")]
[Authorize(Roles = "Administrator")]
public async Task<IActionResult> Delete(Guid id)
{
    var success = await _incomeService.DeleteAsync(id);
    if (!success) return NotFound();
    return NoContent();
}
    }
}