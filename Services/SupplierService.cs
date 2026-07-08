using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class SupplierService
    {
        private readonly AppDbContext _context;

        public SupplierService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResultDto<SupplierDto>> GetAllAsync(string? search, int page, int pageSize)
        {
            var query = _context.Suppliers.Where(s => s.Status == "Active");

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s =>
                    s.CompanyName.Contains(search) ||
                    (s.ContactPerson != null && s.ContactPerson.Contains(search)) ||
                    (s.Email != null && s.Email.Contains(search)));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(s => s.CompanyName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new SupplierDto
                {
                    SupplierID = s.SupplierID,
                    CompanyName = s.CompanyName,
                    ContactPerson = s.ContactPerson,
                    Phone = s.Phone,
                    Email = s.Email,
                    TaxNumber = s.TaxNumber,
                    Address = s.Address,
                    Status = s.Status
                })
                .ToListAsync();

            return new PagedResultDto<SupplierDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<SupplierDto> CreateAsync(CreateSupplierDto dto, string? username)
        {
            var supplier = new Supplier
            {
                CompanyName = dto.CompanyName,
                ContactPerson = dto.ContactPerson,
                Phone = dto.Phone,
                Email = dto.Email,
                TaxNumber = dto.TaxNumber,
                Address = dto.Address,
                Status = "Active",
                CreatedBy = username,
                CreatedAt = DateTime.UtcNow
            };

            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            return MapToDto(supplier);
        }

        public async Task<SupplierDto?> UpdateAsync(Guid id, UpdateSupplierDto dto, string? username)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return null;

            supplier.CompanyName = dto.CompanyName;
            supplier.ContactPerson = dto.ContactPerson;
            supplier.Phone = dto.Phone;
            supplier.Email = dto.Email;
            supplier.TaxNumber = dto.TaxNumber;
            supplier.Address = dto.Address;
            supplier.UpdatedBy = username;
            supplier.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToDto(supplier);
        }

        public async Task<bool> DeactivateAsync(Guid id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return false;

            supplier.Status = "Inactive";
            supplier.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        private static SupplierDto MapToDto(Supplier s)
        {
            return new SupplierDto
            {
                SupplierID = s.SupplierID,
                CompanyName = s.CompanyName,
                ContactPerson = s.ContactPerson,
                Phone = s.Phone,
                Email = s.Email,
                TaxNumber = s.TaxNumber,
                Address = s.Address,
                Status = s.Status
            };
        }
    }
}