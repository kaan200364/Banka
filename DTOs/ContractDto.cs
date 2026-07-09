using System.ComponentModel.DataAnnotations;

namespace CSF.API.DTOs
{
    public class CreateContractDto
    {
        [Required(ErrorMessage = "Teklif seçilmelidir.")]
        public Guid QuotationID { get; set; }

        [Required(ErrorMessage = "Başlangıç tarihi zorunludur.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Bitiş tarihi zorunludur.")]
        public DateTime EndDate { get; set; }
    }

    public class ContractDto
    {
        public Guid ContractID { get; set; }
        public Guid QuotationID { get; set; }
        public string ContractNumber { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? TerminationReason { get; set; }
public Guid? RenewedFromContractID { get; set; }
    }

    public class TerminateContractDto
{
    [Required(ErrorMessage = "Fesih sebebi zorunludur.")]
    public string Reason { get; set; } = string.Empty;
}

public class RenewContractDto
{
    [Required(ErrorMessage = "Yeni bitiş tarihi zorunludur.")]
    public DateTime NewEndDate
    
     { get; set; }
}

public class ContractAttachmentDto
{
    public Guid AttachmentID { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string? UploadedBy { get; set; }
    public DateTime UploadedAt { get; set; }
}
}