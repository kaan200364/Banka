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
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

[HttpGet]
[Authorize(Roles = "Administrator")]
public async Task<ActionResult<PagedResultDto<UserDto>>> GetAll(
    [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
{
    return Ok(await _userService.GetAllAsync(search, page, pageSize));
}      [HttpGet("managers")]
        public async Task<ActionResult<List<UserDto>>> GetManagers()
        {
            return Ok(await _userService.GetManagersAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<UserDto>> Create(CreateUserDto dto)
        {
            try
            {
                var created = await _userService.CreateAsync(dto);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/role")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<UserDto>> UpdateRole(Guid id, UpdateUserRoleDto dto)
        {
            try
            {
                var updated = await _userService.UpdateRoleAsync(id, dto);
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            try
            {
                await _userService.DeactivateAsync(id, currentUserId!);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}