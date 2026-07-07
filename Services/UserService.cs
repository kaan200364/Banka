using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

public async Task<PagedResultDto<UserDto>> GetAllAsync(string? search, int page, int pageSize)
{
    var query = _context.Users.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(u => u.FullName.Contains(search) || u.Username.Contains(search) || u.Email.Contains(search));
    }

    var totalCount = await query.CountAsync();

    var items = await query
        .OrderBy(u => u.FullName)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(u => MapToDto(u))
        .ToListAsync();

    return new PagedResultDto<UserDto>
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}

        public async Task<List<UserDto>> GetManagersAsync()
        {
            return await _context.Users
                .Where(u => u.Role == "Manager" || u.Role == "Administrator")
                .Select(u => MapToDto(u))
                .ToListAsync();
        }

        public async Task<UserDto> CreateAsync(CreateUserDto dto)
        {
            var exists = await _context.Users.AnyAsync(u => u.Username == dto.Username);
            if (exists)
                throw new InvalidOperationException("Bu kullanıcı adı zaten kullanılıyor.");

            var validRoles = new[] { "Administrator", "Manager", "Employee" };
            if (!validRoles.Contains(dto.Role))
                throw new InvalidOperationException("Geçersiz rol.");

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                Email = dto.Email,
                Role = dto.Role,
                Status = "Active"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return MapToDto(user);
        }

        public async Task<UserDto> UpdateRoleAsync(Guid userId, UpdateUserRoleDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new InvalidOperationException("Kullanıcı bulunamadı.");

            var validRoles = new[] { "Administrator", "Manager", "Employee" };
            if (!validRoles.Contains(dto.Role))
                throw new InvalidOperationException("Geçersiz rol.");

            user.Role = dto.Role;
            await _context.SaveChangesAsync();

            return MapToDto(user);
        }

        public async Task DeactivateAsync(Guid userId, string currentUserId)
        {
            if (userId.ToString() == currentUserId)
                throw new InvalidOperationException("Kendi hesabınızı pasif hale getiremezsiniz.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new InvalidOperationException("Kullanıcı bulunamadı.");

            user.Status = "Inactive";
            await _context.SaveChangesAsync();
        }

        private static UserDto MapToDto(User u)
        {
            return new UserDto
            {
                UserID = u.UserID,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
                Status = u.Status
            };
        }
    }
}