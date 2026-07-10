using CSF.API.DTOs;
using CSF.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CSF.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TasksController(TaskService taskService)
        {
            _taskService = taskService;
        }

[HttpGet]
public async Task<ActionResult<PagedResultDto<TaskDto>>> GetAll(
    [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
{
    return Ok(await _taskService.GetAllAsync(search, page, pageSize));
}

        // Sadece Manager (+Administrator) görev oluşturabilir
        [HttpPost]
        [Authorize(Roles = "Administrator,Manager")]
        public async Task<ActionResult<TaskDto>> Create(CreateTaskDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            try
            {
                var created = await _taskService.CreateAsync(dto, username);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Herkes girebilir, ama Service içinde "kendi görevi mi" kontrolü var
        [HttpPatch("{id}/status")]
        public async Task<ActionResult<TaskDto>> UpdateStatus(Guid id, UpdateTaskStatusDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            try
            {
                var updated = await _taskService.UpdateStatusAsync(id, dto, userId!, userRole!);
                return Ok(updated);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
[Authorize(Roles = "Administrator,Manager")]
public async Task<ActionResult<TaskDto>> Update(Guid id, UpdateTaskDto dto)
{
    try
    {
        var updated = await _taskService.UpdateAsync(id, dto);
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
public async Task<IActionResult> Delete(Guid id)
{
    try
    {
        var success = await _taskService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

[HttpPost("{id}/comments")]
public async Task<ActionResult<TaskCommentDto>> AddComment(Guid id, CreateCommentDto dto)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    try
    {
        var comment = await _taskService.AddCommentAsync(id, dto, Guid.Parse(userId!));
        return Ok(comment);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

[HttpGet("{id}/comments")]
public async Task<ActionResult<List<TaskCommentDto>>> GetComments(Guid id)
{
    return Ok(await _taskService.GetCommentsAsync(id));
}

[HttpPost("{id}/attachments")]
public async Task<ActionResult<TaskAttachmentDto>> UploadAttachment(Guid id, IFormFile file)
{
    var username = User.FindFirstValue(ClaimTypes.Name);
    try
    {
        var attachment = await _taskService.AddAttachmentAsync(id, file, username);
        return Ok(attachment);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

[HttpGet("{id}/attachments")]
public async Task<ActionResult<List<TaskAttachmentDto>>> GetAttachments(Guid id)
{
    return Ok(await _taskService.GetAttachmentsAsync(id));
}


[HttpPost("{id}/dependencies")]
[Authorize(Roles = "Administrator,Manager")]
public async Task<ActionResult<TaskDependencyDto>> AddDependency(Guid id, AddDependencyDto dto)
{
    try
    {
        var dependency = await _taskService.AddDependencyAsync(id, dto);
        return Ok(dependency);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

[HttpGet("{id}/dependencies")]
public async Task<ActionResult<List<TaskDependencyDto>>> GetDependencies(Guid id)
{
    return Ok(await _taskService.GetDependenciesAsync(id));
}

[HttpDelete("dependencies/{dependencyId}")]
[Authorize(Roles = "Administrator,Manager")]
public async Task<IActionResult> RemoveDependency(Guid dependencyId)
{
    await _taskService.RemoveDependencyAsync(dependencyId);
    return NoContent();
}

[HttpGet("{id}/activity")]
public async Task<ActionResult<List<TaskActivityDto>>> GetActivity(Guid id)
{
    return Ok(await _taskService.GetActivityAsync(id));
}
    }
}