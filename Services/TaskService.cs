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

            var task = new ProjectTask
            {
                ProjectID = dto.ProjectID,
                AssignedUserID = dto.AssignedUserID,
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
                Title = t.Title,
                Priority = t.Priority,
                DueDate = t.DueDate,
                Status = t.Status
            };
        }
    }
}