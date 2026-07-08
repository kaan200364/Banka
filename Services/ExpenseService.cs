using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class ExpenseService
    {
        private readonly AppDbContext _context;

        public ExpenseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ExpenseDto> CreateAsync(CreateExpenseDto dto, string? username)
        {
            var bankAccount = await _context.BankAccounts.FindAsync(dto.BankAccountID);
            if (bankAccount == null)
                throw new InvalidOperationException("Banka hesabı bulunamadı.");

            // OVERDRAFT KONTROLÜ — SRS'teki kritik iş kuralı
            var newBalance = bankAccount.Balance - dto.Amount;
            if (!bankAccount.OverdraftEnabled && newBalance < 0)
            {
                throw new InvalidOperationException(
                    "Bu işlem hesap bakiyesini negatife düşürüyor ve bu hesapta eksi bakiyeye izin verilmiyor.");
            }
            if (bankAccount.OverdraftEnabled && newBalance < -bankAccount.OverdraftLimit)
            {
                throw new InvalidOperationException(
                    "Bu işlem, hesabın izin verilen overdraft limitini aşıyor.");
            }

            var bankTransaction = new BankTransaction
            {
                BankAccountID = dto.BankAccountID,
                TransactionType = "Expense",
                Amount = dto.Amount,
                Description = dto.Description,
                TransactionDate = DateTime.UtcNow,
                CreatedBy = username,
                CreatedAt = DateTime.UtcNow
            };
            _context.BankTransactions.Add(bankTransaction);

            var expense = new Expense
            {
                SupplierID = dto.SupplierID,
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

            bankAccount.Balance = newBalance;
            bankAccount.UpdatedAt = DateTime.UtcNow;

            _context.Expenses.Add(expense);

            await _context.SaveChangesAsync();

            return new ExpenseDto
            {
                ExpenseID = expense.ExpenseID,
                SupplierID = expense.SupplierID,
                BankAccountID = expense.BankAccountID,
                ProjectID = expense.ProjectID,
                Amount = expense.Amount,
                Category = expense.Category,
                TransactionDate = expense.TransactionDate,
                Description = expense.Description
            };
        }

        public async Task<PagedResultDto<ExpenseDto>> GetAllAsync(string? search, int page, int pageSize)
        {
            var query = _context.Expenses.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(e => e.Category != null && e.Category.Contains(search));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(e => e.TransactionDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new ExpenseDto
                {
                    ExpenseID = e.ExpenseID,
                    SupplierID = e.SupplierID,
                    BankAccountID = e.BankAccountID,
                    ProjectID = e.ProjectID,
                    Amount = e.Amount,
                    Category = e.Category,
                    TransactionDate = e.TransactionDate,
                    Description = e.Description
                })
                .ToListAsync();

            return new PagedResultDto<ExpenseDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<ExpenseDto?> UpdateAsync(Guid id, UpdateExpenseDto dto)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return null;

            expense.Category = dto.Category;
            expense.Description = dto.Description;

            await _context.SaveChangesAsync();

            return new ExpenseDto
            {
                ExpenseID = expense.ExpenseID,
                SupplierID = expense.SupplierID,
                BankAccountID = expense.BankAccountID,
                ProjectID = expense.ProjectID,
                Amount = expense.Amount,
                Category = expense.Category,
                TransactionDate = expense.TransactionDate,
                Description = expense.Description
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return false;

            var bankAccount = await _context.BankAccounts.FindAsync(expense.BankAccountID);
            if (bankAccount != null)
            {
                bankAccount.Balance += expense.Amount;
                bankAccount.UpdatedAt = DateTime.UtcNow;
            }

            if (expense.BankTransactionID.HasValue)
            {
                var transaction = await _context.BankTransactions.FindAsync(expense.BankTransactionID.Value);
                if (transaction != null)
                {
                    _context.BankTransactions.Remove(transaction);
                }
            }

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}