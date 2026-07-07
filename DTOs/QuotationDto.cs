using System.ComponentModel.DataAnnotations;

namespace CSF.API.DTOs
{
    public class CreateQuotationDto
    {
        [Required(ErrorMessage = "Müşteri seçilmelidir.")]
        public Guid CustomerID { get; set; }

        [Required(ErrorMessage = "Geçerlilik tarihi zorunludur.")]
        public DateTime ExpiryDate { get; set; }

        [Required(ErrorMessage = "Tutar zorunludur.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Tutar sıfırdan büyük olmalıdır.")]
        public decimal TotalAmount { get; set; }

        public string Currency { get; set; } = "TRY";
        public string? Description { get; set; }
    }

    public class QuotationDto
    {
        public Guid QuotationID { get; set; }
        public Guid CustomerID { get; set; }
        public string QuotationNumber { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int RevisionNumber { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateQuotationDto
{
    [Required(ErrorMessage = "Geçerlilik tarihi zorunludur.")]
    public DateTime ExpiryDate { get; set; }

    [Required(ErrorMessage = "Tutar zorunludur.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Tutar sıfırdan büyük olmalıdır.")]
    public decimal TotalAmount { get; set; }

    public string Currency { get; set; } = "TRY";
    public string? Description { get; set; }
}
}