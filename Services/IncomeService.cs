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
            _context.BankTransactions.Add(bankTransaction);

            var income = new Income
            {
                CustomerID = dto.CustomerID,
                BankAccountID = dto.BankAccountID,
                ProjectID = dto.ProjectID,
                Amount = dto.Amount,
                Category = dto.Category,
                Description = dto.Description,
                TransactionDate = DateTime.UtcNow,
                BankTransactionID = bankTransaction.TransactionID,
                CreatedBy = username,
                CreatedAt = DateTime.UtcNow
            };

            bankAccount.Balance += dto.Amount;
            bankAccount.UpdatedAt = DateTime.UtcNow;

            _context.Incomes.Add(income);
            await _context.SaveChangesAsync();

            return MapToDto(income);
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

        public async Task<IncomeDto?> UpdateAsync(Guid id, UpdateIncomeDto dto)
        {
            var income = await _context.Incomes.FindAsync(id);
            if (income == null) return null;

            income.Category = dto.Category;
            income.Description = dto.Description;

            await _context.SaveChangesAsync();
            return MapToDto(income);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var income = await _context.Incomes.FindAsync(id);
            if (income == null) return false;

            var bankAccount = await _context.BankAccounts.FindAsync(income.BankAccountID);
            if (bankAccount != null)
            {
                bankAccount.Balance -= income.Amount;
                bankAccount.UpdatedAt = DateTime.UtcNow;
            }

            if (income.BankTransactionID.HasValue)
            {
                var transaction = await _context.BankTransactions.FindAsync(income.BankTransactionID.Value);
                if (transaction != null)
                {
                    _context.BankTransactions.Remove(transaction);
                }
            }

            _context.Incomes.Remove(income);
            await _context.SaveChangesAsync();
            return true;
        }

        private static IncomeDto MapToDto(Income i)
        {
            return new IncomeDto
            {
                IncomeID = i.IncomeID,
                CustomerID = i.CustomerID,
                BankAccountID = i.BankAccountID,
                ProjectID = i.ProjectID,
                Amount = i.Amount,
                Category = i.Category,
                TransactionDate = i.TransactionDate,
                Description = i.Description
            };
        }
    }
}