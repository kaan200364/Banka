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
    public class SuppliersController : ControllerBase
    {
        private readonly SupplierService _supplierService;

        public SuppliersController(SupplierService supplierService)
        {
            _supplierService = supplierService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResultDto<SupplierDto>>> GetAll(
            [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            return Ok(await _supplierService.GetAllAsync(search, page, pageSize));
        }

        [HttpPost]
        public async Task<ActionResult<SupplierDto>> Create(CreateSupplierDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var created = await _supplierService.CreateAsync(dto, username);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SupplierDto>> Update(Guid id, UpdateSupplierDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var updated = await _supplierService.UpdateAsync(id, dto, username);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            var success = await _supplierService.DeactivateAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}