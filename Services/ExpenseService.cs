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

            var expense = new Expense
            {
                SupplierID = dto.SupplierID,
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
                TransactionType = "Expense",
                Amount = dto.Amount,
                Description = dto.Description,
                TransactionDate = DateTime.UtcNow,
                CreatedBy = username,
                CreatedAt = DateTime.UtcNow
            };

            bankAccount.Balance = newBalance;
            bankAccount.UpdatedAt = DateTime.UtcNow;

            _context.Expenses.Add(expense);
            _context.BankTransactions.Add(bankTransaction);

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
    }
}