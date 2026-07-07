using CSF.API.DTOs;
using CSF.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CSF.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Administrator,Manager")]
    public class BankAccountsController : ControllerBase
    {
        private readonly BankAccountService _bankAccountService;

        public BankAccountsController(BankAccountService bankAccountService)
        {
            _bankAccountService = bankAccountService;
        }

[HttpGet]
public async Task<ActionResult<PagedResultDto<BankAccountDto>>> GetAll(
    [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
{
    return Ok(await _bankAccountService.GetAllAsync(search, page, pageSize));
}

        [HttpPost]
        public async Task<ActionResult<BankAccountDto>> Create(CreateBankAccountDto dto)
        {
            var created = await _bankAccountService.CreateAsync(dto);
            return Ok(created);
        }

        [HttpGet("{id}/transactions")]
        public async Task<ActionResult<List<BankTransactionDto>>> GetTransactions(Guid id)
        {
            var transactions = await _bankAccountService.GetTransactionsAsync(id);
            return Ok(transactions);
        }

        [HttpPut("{id}")]
public async Task<ActionResult<BankAccountDto>> Update(Guid id, UpdateBankAccountDto dto)
{
    var updated = await _bankAccountService.UpdateAsync(id, dto);
    if (updated == null) return NotFound();
    return Ok(updated);
}

[HttpDelete("{id}")]
public async Task<IActionResult> Deactivate(Guid id)
{
    try
    {
        var success = await _bankAccountService.DeactivateAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
    }
}