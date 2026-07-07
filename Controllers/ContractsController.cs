using CSF.API.DTOs;
using CSF.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CSF.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Administrator,Manager")]
    public class ContractsController : ControllerBase
    {
        private readonly ContractService _contractService;

        public ContractsController(ContractService contractService)
        {
            _contractService = contractService;
        }

[HttpGet]
public async Task<ActionResult<PagedResultDto<ContractDto>>> GetAll(
    [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
{
    return Ok(await _contractService.GetAllAsync(search, page, pageSize));
}

        [HttpPost]
        public async Task<ActionResult<ContractDto>> Create(CreateContractDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            try
            {
                var created = await _contractService.CreateAsync(dto, username);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPatch("{id}/terminate")]
public async Task<ActionResult<ContractDto>> Terminate(Guid id, TerminateContractDto dto)
{
    var username = User.FindFirstValue(ClaimTypes.Name);
    try
    {
        var terminated = await _contractService.TerminateAsync(id, dto, username);
        return Ok(terminated);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

[HttpPost("{id}/renew")]
public async Task<ActionResult<ContractDto>> Renew(Guid id, [FromBody] RenewContractDto dto)
{
    var username = User.FindFirstValue(ClaimTypes.Name);
    try
    {
        var renewed = await _contractService.RenewAsync(id, dto.NewEndDate, username);
        return Ok(renewed);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
    }
}