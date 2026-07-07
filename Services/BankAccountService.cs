using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class BankAccountService
    {
        private readonly AppDbContext _context;

        public BankAccountService(AppDbContext context)
        {
            _context = context;
        }

 public async Task<PagedResultDto<BankAccountDto>> GetAllAsync(string? search, int page, int pageSize)
{
    var query = _context.BankAccounts.Where(b => b.Status == "Active");

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(b => b.BankName.Contains(search) || b.IBAN.Contains(search));
    }

    var totalCount = await query.CountAsync();

    var items = await query
        .OrderBy(b => b.BankName)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(b => new BankAccountDto
        {
            BankAccountID = b.BankAccountID,
            BankName = b.BankName,
            IBAN = b.IBAN,
            AccountNumber = b.AccountNumber,
            Currency = b.Currency,
            Balance = b.Balance,
            OverdraftEnabled = b.OverdraftEnabled,
            OverdraftLimit = b.OverdraftLimit,
            Status = b.Status
        })
        .ToListAsync();

    return new PagedResultDto<BankAccountDto>
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}
        public async Task<BankAccountDto> CreateAsync(CreateBankAccountDto dto)
        {
            var account = new BankAccount
            {
                BankName = dto.BankName,
                IBAN = dto.IBAN,
                AccountNumber = dto.AccountNumber,
                Currency = dto.Currency,
                OverdraftEnabled = dto.OverdraftEnabled,
                OverdraftLimit = dto.OverdraftLimit,
                Balance = 0,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.BankAccounts.Add(account);
            await _context.SaveChangesAsync();

            return new BankAccountDto
            {
                BankAccountID = account.BankAccountID,
                BankName = account.BankName,
                IBAN = account.IBAN,
                AccountNumber = account.AccountNumber,
                Currency = account.Currency,
                Balance = account.Balance,
                OverdraftEnabled = account.OverdraftEnabled,
                OverdraftLimit = account.OverdraftLimit,
                Status = account.Status
            };
        }

        // Bu hesabın hareket dökümünü getir
        public async Task<List<BankTransactionDto>> GetTransactionsAsync(Guid bankAccountId)
        {
            return await _context.BankTransactions
                .Where(t => t.BankAccountID == bankAccountId)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new BankTransactionDto
                {
                    TransactionID = t.TransactionID,
                    BankAccountID = t.BankAccountID,
                    TransactionType = t.TransactionType,
                    Amount = t.Amount,
                    TransactionDate = t.TransactionDate,
                    Description = t.Description
                })
                .ToListAsync();
        }

        public async Task<BankAccountDto?> UpdateAsync(Guid id, UpdateBankAccountDto dto)
{
    var account = await _context.BankAccounts.FindAsync(id);
    if (account == null) return null;

    account.BankName = dto.BankName;
    account.AccountNumber = dto.AccountNumber;
    account.OverdraftEnabled = dto.OverdraftEnabled;
    account.OverdraftLimit = dto.OverdraftLimit;
    account.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return new BankAccountDto
    {
        BankAccountID = account.BankAccountID,
        BankName = account.BankName,
        IBAN = account.IBAN,
        AccountNumber = account.AccountNumber,
        Currency = account.Currency,
        Balance = account.Balance,
        OverdraftEnabled = account.OverdraftEnabled,
        OverdraftLimit = account.OverdraftLimit,
        Status = account.Status
    };
}

public async Task<bool> DeactivateAsync(Guid id)
{
    var account = await _context.BankAccounts.FindAsync(id);
    if (account == null) return false;

    if (account.Balance != 0)
        throw new InvalidOperationException("Bakiyesi sıfır olmayan bir hesap pasif hale getirilemez.");

    var hasTransactions = await _context.BankTransactions.AnyAsync(t => t.BankAccountID == id);
    if (hasTransactions)
        throw new InvalidOperationException("Hareketi olan bir hesap pasif hale getirilemez.");

    account.Status = "Inactive";
    account.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    return true;
}
    }
}