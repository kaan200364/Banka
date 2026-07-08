using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class ProjectService
    {
        private readonly AppDbContext _context;

        public ProjectService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ProjectDto> CreateAsync(CreateProjectDto dto, string? username)
        {
            var contract = await _context.Contracts.FindAsync(dto.ContractID);
            if (contract == null)
                throw new InvalidOperationException("Sözleşme bulunamadı.");

            // SRS kuralı: proje, aktif bir sözleşmeye bağlı olmalı
            if (contract.Status != "Active")
                throw new InvalidOperationException(
                    $"Proje sadece 'Active' durumundaki bir sözleşmeye bağlanabilir. Sözleşmenin mevcut durumu: {contract.Status}");

            var manager = await _context.Users.FindAsync(dto.ProjectManagerID);
            if (manager == null)
                throw new InvalidOperationException("Seçilen proje yöneticisi bulunamadı.");

            // Sadece Manager veya Administrator rolündeki biri proje yöneticisi olabilir
            if (manager.Role != "Manager" && manager.Role != "Administrator")
                throw new InvalidOperationException("Seçilen kullanıcı proje yöneticisi rolüne sahip değil.");

            if (dto.EndDate.HasValue && dto.EndDate <= dto.StartDate)
                throw new InvalidOperationException("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");

            var project = new Project
            {
                ContractID = dto.ContractID,
                ProjectName = dto.ProjectName,
                ProjectManagerID = dto.ProjectManagerID,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = "Active",
                CreatedBy = username,
                CreatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return MapToDto(project);
        }

public async Task<PagedResultDto<ProjectDto>> GetAllAsync(string? search, int page, int pageSize)
{
    var query = _context.Projects.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(p => p.ProjectName.Contains(search));
    }

    var totalCount = await query.CountAsync();

    var items = await query
        .OrderByDescending(p => p.StartDate)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(p => MapToDto(p))
        .ToListAsync();

    return new PagedResultDto<ProjectDto>
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}

public async Task<bool> DeactivateAsync(Guid id)
{
    var project = await _context.Projects.FindAsync(id);
    if (project == null) return false;

    var hasActiveTasks = await _context.ProjectTasks
        .AnyAsync(t => t.ProjectID == id && t.Status != "Completed");

    if (hasActiveTasks)
        throw new InvalidOperationException(
            "Bu projenin tamamlanmamış görevleri var. Önce tüm görevleri tamamlayın veya silin.");

    project.Status = "Cancelled";
    project.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    return true;
}
        private static ProjectDto MapToDto(Project p)
        {
            return new ProjectDto
            {
                ProjectID = p.ProjectID,
                ContractID = p.ContractID,
                ProjectName = p.ProjectName,
                ProjectManagerID = p.ProjectManagerID,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Status = p.Status
            };
        }

        public async Task<ProjectDto?> UpdateAsync(Guid id, UpdateProjectDto dto)
{
    var project = await _context.Projects.FindAsync(id);
    if (project == null) return null;

    var validStatuses = new[] { "Active", "Completed", "OnHold" };
    if (!validStatuses.Contains(dto.Status))
        throw new InvalidOperationException("Geçersiz durum değeri.");

    if (dto.EndDate.HasValue && dto.EndDate <= project.StartDate)
        throw new InvalidOperationException("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");

    project.ProjectName = dto.ProjectName;
    project.EndDate = dto.EndDate;
    project.Status = dto.Status;
    project.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();
    return MapToDto(project);
}
    }
}