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
    public class ProjectsController : ControllerBase
    {
        private readonly ProjectService _projectService;

        public ProjectsController(ProjectService projectService)
        {
            _projectService = projectService;
        }

[HttpGet]
public async Task<ActionResult<PagedResultDto<ProjectDto>>> GetAll(
    [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
{
    return Ok(await _projectService.GetAllAsync(search, page, pageSize));
}

        [HttpPost]
        public async Task<ActionResult<ProjectDto>> Create(CreateProjectDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            try
            {
                var created = await _projectService.CreateAsync(dto, username);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
public async Task<ActionResult<ProjectDto>> Update(Guid id, UpdateProjectDto dto)
{
    try
    {
        var updated = await _projectService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

[HttpDelete("{id}")]
[Authorize(Roles = "Administrator,Manager")]
public async Task<IActionResult> Deactivate(Guid id)
{
    try
    {
        var success = await _projectService.DeactivateAsync(id);
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