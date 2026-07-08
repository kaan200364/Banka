using CSF.API.DTOs;
using CSF.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CSF.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Administrator,Employee,Manager")]
    public class ExpenseController : ControllerBase
    {
        private readonly ExpenseService _expenseService;

        public ExpenseController(ExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

[HttpGet]
public async Task<ActionResult<PagedResultDto<ExpenseDto>>> GetAll(
    [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
{
    return Ok(await _expenseService.GetAllAsync(search, page, pageSize));
}

        [HttpPost]
        public async Task<ActionResult<ExpenseDto>> Create(CreateExpenseDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            try
            {
                var created = await _expenseService.CreateAsync(dto, username);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
public async Task<ActionResult<ExpenseDto>> Update(Guid id, UpdateExpenseDto dto)
{
    var updated = await _expenseService.UpdateAsync(id, dto);
    if (updated == null) return NotFound();
    return Ok(updated);
}

[HttpDelete("{id}")]
[Authorize(Roles = "Administrator")]
public async Task<IActionResult> Delete(Guid id)
{
    var success = await _expenseService.DeleteAsync(id);
    if (!success) return NotFound();
    return NoContent();
}
    }
}