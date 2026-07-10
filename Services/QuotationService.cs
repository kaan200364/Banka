using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class QuotationService
    {
        private readonly AppDbContext _context;

        public QuotationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<QuotationDto> CreateAsync(CreateQuotationDto dto, string? username)
        {
            // Geçerlilik tarihi geçmişte olamaz
            if (dto.ExpiryDate <= DateTime.UtcNow)
                throw new InvalidOperationException("Geçerlilik tarihi gelecekte bir tarih olmalıdır.");

            var customerExists = await _context.Customers.AnyAsync(c => c.CustomerID == dto.CustomerID);
            if (!customerExists)
                throw new InvalidOperationException("Seçilen müşteri bulunamadı.");

            var quotationNumber = await GenerateQuotationNumberAsync();

            var quotation = new Quotation
            {
                CustomerID = dto.CustomerID,
                QuotationNumber = quotationNumber,
                ExpiryDate = dto.ExpiryDate,
                TotalAmount = dto.TotalAmount,
                Currency = dto.Currency,
                Description = dto.Description,
                Status = "Draft",
                IssueDate = DateTime.UtcNow,
                CreatedBy = username,
                CreatedAt = DateTime.UtcNow
            };

            _context.Quotations.Add(quotation);
            await _context.SaveChangesAsync();

            return MapToDto(quotation);
        }

        // Sadece Draft durumundaki bir teklif onaylanabilir
        public async Task<QuotationDto> ApproveAsync(Guid quotationId, string? username)
        {
            var quotation = await _context.Quotations.FindAsync(quotationId);
            if (quotation == null)
                throw new InvalidOperationException("Teklif bulunamadı.");

            if (quotation.Status != "Draft")
                throw new InvalidOperationException(
                    $"Sadece 'Draft' durumundaki teklifler onaylanabilir. Mevcut durum: {quotation.Status}");

            quotation.Status = "Approved";
            quotation.UpdatedBy = username;
            quotation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToDto(quotation);
        }

public async Task<PagedResultDto<QuotationDto>> GetAllAsync(string? search, int page, int pageSize)
{
    var query = _context.Quotations.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(q => q.QuotationNumber.Contains(search));
    }

    var totalCount = await query.CountAsync();

    var items = await query
        .OrderByDescending(q => q.IssueDate)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(q => MapToDto(q))
        .ToListAsync();

    return new PagedResultDto<QuotationDto>
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}
        private async Task<string> GenerateQuotationNumberAsync()
        {
            var year = DateTime.UtcNow.Year;
            var count = await _context.Quotations.CountAsync(q => q.IssueDate.Year == year);
            return $"QUO-{year}-{(count + 1):D4}";
        }

        private static QuotationDto MapToDto(Quotation q)
        {
            return new QuotationDto
            {
                QuotationID = q.QuotationID,
                CustomerID = q.CustomerID,
                QuotationNumber = q.QuotationNumber,
                IssueDate = q.IssueDate,
                ExpiryDate = q.ExpiryDate,
                TotalAmount = q.TotalAmount,
                Currency = q.Currency,
                Status = q.Status,
                RevisionNumber = q.RevisionNumber,
                Description = q.Description
            };
        }

        public async Task<QuotationDto?> UpdateAsync(Guid id, UpdateQuotationDto dto)
{
    var quotation = await _context.Quotations.FindAsync(id);
    if (quotation == null) return null;

    if (quotation.Status != "Draft")
        throw new InvalidOperationException(
            $"Sadece 'Draft' durumundaki teklifler düzenlenebilir. Mevcut durum: {quotation.Status}");

    if (dto.ExpiryDate <= DateTime.UtcNow)
        throw new InvalidOperationException("Geçerlilik tarihi gelecekte bir tarih olmalıdır.");

    quotation.ExpiryDate = dto.ExpiryDate;
    quotation.TotalAmount = dto.TotalAmount;
    quotation.Currency = dto.Currency;
    quotation.Description = dto.Description;
    quotation.RevisionNumber += 1;
    quotation.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();
    return MapToDto(quotation);
}

public async Task<QuotationDto> RejectAsync(Guid quotationId, string? username)
{
    var quotation = await _context.Quotations.FindAsync(quotationId);
    if (quotation == null)
        throw new InvalidOperationException("Teklif bulunamadı.");

    if (quotation.Status != "Draft")
        throw new InvalidOperationException(
            $"Sadece 'Draft' durumundaki teklifler reddedilebilir. Mevcut durum: {quotation.Status}");

    quotation.Status = "Rejected";
    quotation.UpdatedBy = username;
    quotation.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();
    return MapToDto(quotation);
}


public async Task<bool> DeleteAsync(Guid id)
{
    var quotation = await _context.Quotations.FindAsync(id);
    if (quotation == null) return false;

    if (quotation.Status != "Draft")
        throw new InvalidOperationException(
            $"Sadece 'Draft' durumundaki teklifler silinebilir. Mevcut durum: {quotation.Status}");

    var hasContract = await _context.Contracts.AnyAsync(c => c.QuotationID == id);
    if (hasContract)
        throw new InvalidOperationException("Bu teklife bağlı bir sözleşme var, silinemez.");

    _context.Quotations.Remove(quotation);
    await _context.SaveChangesAsync();
    return true;
}
    }
}