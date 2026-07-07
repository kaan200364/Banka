using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class CustomerService
    {
        private readonly AppDbContext _context;

        public CustomerService(AppDbContext context)
        {
            _context = context;
        }

    public async Task<PagedResultDto<CustomerDto>> GetAllAsync(string? search, int page, int pageSize)
{
    var query = _context.Customers.Where(c => c.Status == "Active");

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(c =>
            c.CompanyName.Contains(search) ||
            (c.ContactPerson != null && c.ContactPerson.Contains(search)) ||
            (c.Email != null && c.Email.Contains(search)));
    }

    var totalCount = await query.CountAsync();

    var items = await query
        .OrderBy(c => c.CompanyName)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(c => new CustomerDto
        {
            CustomerID = c.CustomerID,
            CompanyName = c.CompanyName,
            ContactPerson = c.ContactPerson,
            Phone = c.Phone,
            Email = c.Email,
            TaxNumber = c.TaxNumber,
            Address = c.Address,
            Status = c.Status
        })
        .ToListAsync();

    return new PagedResultDto<CustomerDto>
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}
        public async Task<CustomerDto?> GetByIdAsync(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return null;

            return new CustomerDto
            {
                CustomerID = customer.CustomerID,
                CompanyName = customer.CompanyName,
                ContactPerson = customer.ContactPerson,
                Phone = customer.Phone,
                Email = customer.Email,
                TaxNumber = customer.TaxNumber,
                Address = customer.Address,
                Status = customer.Status
            };
        }

        public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto)
        {
            var customer = new Customer
            {
                CompanyName = dto.CompanyName,
                ContactPerson = dto.ContactPerson,
                Phone = dto.Phone,
                Email = dto.Email,
                TaxNumber = dto.TaxNumber,
                Address = dto.Address,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return new CustomerDto
            {
                CustomerID = customer.CustomerID,
                CompanyName = customer.CompanyName,
                ContactPerson = customer.ContactPerson,
                Phone = customer.Phone,
                Email = customer.Email,
                TaxNumber = customer.TaxNumber,
                Address = customer.Address,
                Status = customer.Status
            };
        }

        public async Task<CustomerDto?> UpdateAsync(Guid id, UpdateCustomerDto dto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return null;

            customer.CompanyName = dto.CompanyName;
            customer.ContactPerson = dto.ContactPerson;
            customer.Phone = dto.Phone;
            customer.Email = dto.Email;
            customer.TaxNumber = dto.TaxNumber;
            customer.Address = dto.Address;
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new CustomerDto
            {
                CustomerID = customer.CustomerID,
                CompanyName = customer.CompanyName,
                ContactPerson = customer.ContactPerson,
                Phone = customer.Phone,
                Email = customer.Email,
                TaxNumber = customer.TaxNumber,
                Address = customer.Address,
                Status = customer.Status
            };
        }

        public async Task<bool> DeactivateAsync(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return false;

            customer.Status = "Inactive";
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}