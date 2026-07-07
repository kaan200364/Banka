using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class IncomeService
    {
        private readonly AppDbContext _context;

        public IncomeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IncomeDto> CreateAsync(CreateIncomeDto dto, string? username)
        {
            var bankAccount = await _context.BankAccounts.FindAsync(dto.BankAccountID);
            if (bankAccount == null)
                throw new InvalidOperationException("Banka hesabı bulunamadı.");

            var income = new Income
            {
                CustomerID = dto.CustomerID,
                BankAccountID = dto.BankAccountID,
                ProjectID = dto.ProjectID,
                Amount = dto.Amount,
                Category = dto.Category,
                Description = dto.Description,
                TransactionDate = DateTime.UtcNow,
                CreatedBy = username,
                CreatedAt = DateTime.UtcNow
            };

            var bankTransaction = new BankTransaction
            {
                BankAccountID = dto.BankAccountID,
                TransactionType = "Income",
                Amount = dto.Amount,
                Description = dto.Description,
                TransactionDate = DateTime.UtcNow,
                CreatedBy = username,
                CreatedAt = DateTime.UtcNow
            };

            bankAccount.Balance += dto.Amount;
            bankAccount.UpdatedAt = DateTime.UtcNow;

            _context.Incomes.Add(income);
            _context.BankTransactions.Add(bankTransaction);

            await _context.SaveChangesAsync();

            return new IncomeDto
            {
                IncomeID = income.IncomeID,
                CustomerID = income.CustomerID,
                BankAccountID = income.BankAccountID,
                ProjectID = income.ProjectID,
                Amount = income.Amount,
                Category = income.Category,
                TransactionDate = income.TransactionDate,
                Description = income.Description
            };
        }

 public async Task<PagedResultDto<IncomeDto>> GetAllAsync(string? search, int page, int pageSize)
{
    var query = _context.Incomes.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(i => i.Category != null && i.Category.Contains(search));
    }

    var totalCount = await query.CountAsync();

    var items = await query
        .OrderByDescending(i => i.TransactionDate)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(i => new IncomeDto
        {
            IncomeID = i.IncomeID,
            CustomerID = i.CustomerID,
            BankAccountID = i.BankAccountID,
            ProjectID = i.ProjectID,
            Amount = i.Amount,
            Category = i.Category,
            TransactionDate = i.TransactionDate,
            Description = i.Description
        })
        .ToListAsync();

    return new PagedResultDto<IncomeDto>
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}
    }
}