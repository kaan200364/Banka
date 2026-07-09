using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class ContractService
    {
        private readonly AppDbContext _context;

        public ContractService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ContractDto> CreateAsync(CreateContractDto dto, string? username)
        {
            var quotation = await _context.Quotations.FindAsync(dto.QuotationID);
            if (quotation == null)
                throw new InvalidOperationException("Teklif bulunamadı.");

            // EN KRİTİK KURAL: sadece Approved teklif sözleşmeye çevrilebilir
            if (quotation.Status != "Approved")
                throw new InvalidOperationException(
                    $"Sadece 'Approved' durumundaki teklifler sözleşmeye çevrilebilir. Teklifin mevcut durumu: {quotation.Status}");

            if (dto.EndDate <= dto.StartDate)
                throw new InvalidOperationException("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");

            var alreadyConverted = await _context.Contracts.AnyAsync(c => c.QuotationID == dto.QuotationID);
            if (alreadyConverted)
                throw new InvalidOperationException("Bu teklif zaten bir sözleşmeye dönüştürülmüş.");

            var contractNumber = await GenerateContractNumberAsync();

            var contract = new Contract
            {
                QuotationID = dto.QuotationID,
                ContractNumber = contractNumber,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = "Active",
                CreatedBy = username,
                CreatedAt = DateTime.UtcNow
            };

            _context.Contracts.Add(contract);
            await _context.SaveChangesAsync();

            return MapToDto(contract);
        }

public async Task<PagedResultDto<ContractDto>> GetAllAsync(string? search, int page, int pageSize)
{
    var query = _context.Contracts.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(c => c.ContractNumber.Contains(search));
    }

    var totalCount = await query.CountAsync();

    var items = await query
        .OrderByDescending(c => c.StartDate)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(c => MapToDto(c))
        .ToListAsync();

    return new PagedResultDto<ContractDto>
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}

        private async Task<string> GenerateContractNumberAsync()
        {
            var year = DateTime.UtcNow.Year;
            var count = await _context.Contracts.CountAsync(c => c.CreatedAt.Year == year);
            return $"CON-{year}-{(count + 1):D4}";
        }

        private static ContractDto MapToDto(Contract c)
        {
            return new ContractDto
    {
        ContractID = c.ContractID,
        QuotationID = c.QuotationID,
        ContractNumber = c.ContractNumber,
        StartDate = c.StartDate,
        EndDate = c.EndDate,
        Status = c.Status,
        TerminationReason = c.TerminationReason,
        RenewedFromContractID = c.RenewedFromContractID
    };
        }

        public async Task<ContractDto> TerminateAsync(Guid contractId, TerminateContractDto dto, string? username)
{
    var contract = await _context.Contracts.FindAsync(contractId);
    if (contract == null)
        throw new InvalidOperationException("Sözleşme bulunamadı.");

    if (contract.Status != "Active")
        throw new InvalidOperationException(
            $"Sadece 'Active' durumundaki sözleşmeler feshedilebilir. Mevcut durum: {contract.Status}");

    contract.Status = "Terminated";
    contract.TerminationReason = dto.Reason;
    contract.UpdatedBy = username;
    contract.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();
    return MapToDto(contract);
}

public async Task<ContractDto> RenewAsync(Guid contractId, DateTime newEndDate, string? username)
{
    var oldContract = await _context.Contracts.FindAsync(contractId);
    if (oldContract == null)
        throw new InvalidOperationException("Sözleşme bulunamadı.");

    if (oldContract.Status != "Active")
        throw new InvalidOperationException(
            $"Sadece 'Active' durumundaki sözleşmeler yenilenebilir. Mevcut durum: {oldContract.Status}");

    if (newEndDate <= oldContract.EndDate)
        throw new InvalidOperationException("Yeni bitiş tarihi, mevcut bitiş tarihinden sonra olmalıdır.");

    // Eski sözleşmeyi kapat
    oldContract.Status = "Renewed";
    oldContract.UpdatedBy = username;
    oldContract.UpdatedAt = DateTime.UtcNow;

    // Yeni sözleşme oluştur
    var newContract = new Contract
    {
        QuotationID = oldContract.QuotationID,
        ContractNumber = await GenerateContractNumberAsync(),
        StartDate = oldContract.EndDate,
        EndDate = newEndDate,
        Status = "Active",
        RenewedFromContractID = oldContract.ContractID,
        CreatedBy = username,
        CreatedAt = DateTime.UtcNow
    };

    _context.Contracts.Add(newContract);
    await _context.SaveChangesAsync();

    return MapToDto(newContract);
}

public async Task<ContractAttachmentDto> AddAttachmentAsync(Guid contractId, IFormFile file, string? username)
{
    var contract = await _context.Contracts.FindAsync(contractId);
    if (contract == null)
        throw new InvalidOperationException("Sözleşme bulunamadı.");

    var uploadsFolder = Path.Combine("wwwroot", "uploads", "contracts");
    Directory.CreateDirectory(uploadsFolder);

    var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    var attachment = new ContractAttachment
    {
        ContractID = contractId,
        FileName = file.FileName,
        FilePath = $"/uploads/contracts/{uniqueFileName}",
        UploadedBy = username,
        UploadedAt = DateTime.UtcNow
    };

    _context.ContractAttachments.Add(attachment);
    await _context.SaveChangesAsync();

    return new ContractAttachmentDto
    {
        AttachmentID = attachment.AttachmentID,
        FileName = attachment.FileName,
        UploadedBy = attachment.UploadedBy,
        UploadedAt = attachment.UploadedAt
    };
}

public async Task<List<ContractAttachmentDto>> GetAttachmentsAsync(Guid contractId)
{
    return await _context.ContractAttachments
        .Where(a => a.ContractID == contractId)
        .OrderByDescending(a => a.UploadedAt)
        .Select(a => new ContractAttachmentDto
        {
            AttachmentID = a.AttachmentID,
            FileName = a.FileName,
            UploadedBy = a.UploadedBy,
            UploadedAt = a.UploadedAt
        })
        .ToListAsync();
}
    }
}