using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class TaskService
    {
        private readonly AppDbContext _context;

        public TaskService(AppDbContext context)
        {
            _context = context;
        }

   public async Task<TaskDto> CreateAsync(CreateTaskDto dto, string? username)
{
    var project = await _context.Projects.FindAsync(dto.ProjectID);
    if (project == null)
        throw new InvalidOperationException("Proje bulunamadı.");

    var assignedUser = await _context.Users.FindAsync(dto.AssignedUserID);
    if (assignedUser == null)
        throw new InvalidOperationException("Atanan kullanıcı bulunamadı.");

    if (dto.ParentTaskID.HasValue)
    {
        var parentTask = await _context.ProjectTasks.FindAsync(dto.ParentTaskID.Value);
        if (parentTask == null)
            throw new InvalidOperationException("Belirtilen ana görev bulunamadı.");

        if (parentTask.ProjectID != dto.ProjectID)
            throw new InvalidOperationException("Alt görev, ana görevle aynı projede olmalıdır.");
    }

    var task = new ProjectTask
    {
        ProjectID = dto.ProjectID,
        AssignedUserID = dto.AssignedUserID,
        ParentTaskID = dto.ParentTaskID,
        Title = dto.Title,
        Priority = dto.Priority,
        DueDate = dto.DueDate,
        Status = "Pending",
        CreatedBy = username,
        CreatedAt = DateTime.UtcNow
    };

    _context.ProjectTasks.Add(task);
    await _context.SaveChangesAsync();

    return MapToDto(task);
}

        // Employee SADECE kendine atanan görevin durumunu değiştirebilir
        public async Task<TaskDto> UpdateStatusAsync(
            Guid taskId, UpdateTaskStatusDto dto, string currentUserId, string currentUserRole)
        {
            var task = await _context.ProjectTasks.FindAsync(taskId);
            if (task == null)
                throw new InvalidOperationException("Görev bulunamadı.");

            bool isManagerOrAdmin = currentUserRole == "Manager" || currentUserRole == "Administrator";
            bool isOwnTask = task.AssignedUserID.ToString() == currentUserId;

            if (!isManagerOrAdmin && !isOwnTask)
                throw new UnauthorizedAccessException("Sadece size atanan görevleri güncelleyebilirsiniz.");

            var validStatuses = new[] { "Pending", "InProgress", "Completed" };
            if (!validStatuses.Contains(dto.Status))
                throw new InvalidOperationException("Geçersiz durum değeri.");

            task.Status = dto.Status;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToDto(task);
        }

public async Task<PagedResultDto<TaskDto>> GetAllAsync(string? search, int page, int pageSize)
{
    var query = _context.ProjectTasks.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(t => t.Title.Contains(search));
    }

    var totalCount = await query.CountAsync();

    var items = await query
        .OrderByDescending(t => t.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(t => MapToDto(t))
        .ToListAsync();

    return new PagedResultDto<TaskDto>
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}
private static TaskDto MapToDto(ProjectTask t)
{
    return new TaskDto
    {
        TaskID = t.TaskID,
        ProjectID = t.ProjectID,
        AssignedUserID = t.AssignedUserID,
        ParentTaskID = t.ParentTaskID,
        Title = t.Title,
        Priority = t.Priority,
        DueDate = t.DueDate,
        Status = t.Status
    };
}

public async Task<TaskDto?> UpdateAsync(Guid id, UpdateTaskDto dto)
{
    var task = await _context.ProjectTasks.FindAsync(id);
    if (task == null) return null;

    var assignedUser = await _context.Users.FindAsync(dto.AssignedUserID);
    if (assignedUser == null)
        throw new InvalidOperationException("Atanan kullanıcı bulunamadı.");

    task.Title = dto.Title;
    task.AssignedUserID = dto.AssignedUserID;
    task.Priority = dto.Priority;
    task.DueDate = dto.DueDate;
    task.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();
    return MapToDto(task);
}


public async Task<bool> DeleteAsync(Guid id)
{
    var task = await _context.ProjectTasks.FindAsync(id);
    if (task == null) return false;

    var hasSubtasks = await _context.ProjectTasks.AnyAsync(t => t.ParentTaskID == id);
    if (hasSubtasks)
        throw new InvalidOperationException(
            "Bu görevin alt görevleri var. Önce alt görevleri silin veya başka bir göreve taşıyın.");

    _context.ProjectTasks.Remove(task);
    await _context.SaveChangesAsync();
    return true;
}

public async Task<TaskCommentDto> AddCommentAsync(Guid taskId, CreateCommentDto dto, Guid userId)
{
    var task = await _context.ProjectTasks.FindAsync(taskId);
    if (task == null)
        throw new InvalidOperationException("Görev bulunamadı.");

    var comment = new TaskComment
    {
        TaskID = taskId,
        UserID = userId,
        Content = dto.Content,
        CreatedAt = DateTime.UtcNow
    };

    _context.TaskComments.Add(comment);
    await _context.SaveChangesAsync();

    var user = await _context.Users.FindAsync(userId);

    return new TaskCommentDto
    {
        CommentID = comment.CommentID,
        UserID = comment.UserID,
        UserFullName = user?.FullName ?? "Bilinmeyen",
        Content = comment.Content,
        CreatedAt = comment.CreatedAt
    };
}

public async Task<List<TaskCommentDto>> GetCommentsAsync(Guid taskId)
{
    var comments = await _context.TaskComments
        .Where(c => c.TaskID == taskId)
        .OrderBy(c => c.CreatedAt)
        .ToListAsync();

    var result = new List<TaskCommentDto>();
    foreach (var comment in comments)
    {
        var user = await _context.Users.FindAsync(comment.UserID);
        result.Add(new TaskCommentDto
        {
            CommentID = comment.CommentID,
            UserID = comment.UserID,
            UserFullName = user?.FullName ?? "Bilinmeyen",
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        });
    }
    return result;
}

public async Task<TaskAttachmentDto> AddAttachmentAsync(Guid taskId, IFormFile file, string? username)
{
    var task = await _context.ProjectTasks.FindAsync(taskId);
    if (task == null)
        throw new InvalidOperationException("Görev bulunamadı.");

    var uploadsFolder = Path.Combine("wwwroot", "uploads", "tasks");
    Directory.CreateDirectory(uploadsFolder);

    var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    var attachment = new TaskAttachment
    {
        TaskID = taskId,
        FileName = file.FileName,
        FilePath = $"/uploads/tasks/{uniqueFileName}",
        UploadedBy = username,
        UploadedAt = DateTime.UtcNow
    };

    _context.TaskAttachments.Add(attachment);
    await _context.SaveChangesAsync();

    return new TaskAttachmentDto
    {
        AttachmentID = attachment.AttachmentID,
        FileName = attachment.FileName,
        UploadedBy = attachment.UploadedBy,
        UploadedAt = attachment.UploadedAt
    };
}

public async Task<List<TaskAttachmentDto>> GetAttachmentsAsync(Guid taskId)
{
    return await _context.TaskAttachments
        .Where(a => a.TaskID == taskId)
        .OrderByDescending(a => a.UploadedAt)
        .Select(a => new TaskAttachmentDto
        {
            AttachmentID = a.AttachmentID,
            FileName = a.FileName,
            UploadedBy = a.UploadedBy,
            UploadedAt = a.UploadedAt
        })
        .ToListAsync();
}
        
    }
}