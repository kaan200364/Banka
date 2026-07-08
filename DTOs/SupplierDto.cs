using System.ComponentModel.DataAnnotations;

namespace CSF.API.DTOs
{
    public class SupplierDto
    {
        public Guid SupplierID { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? TaxNumber { get; set; }
        public string? Address { get; set; }
        public string Status { get; set; } = "Active";
    }

    public class CreateSupplierDto
    {
        [Required(ErrorMessage = "Şirket adı zorunludur.")]
        [MaxLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }

        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
        public string? Email { get; set; }

        public string? TaxNumber { get; set; }
        public string? Address { get; set; }
    }

    public class UpdateSupplierDto
    {
        [Required(ErrorMessage = "Şirket adı zorunludur.")]
        [MaxLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }

        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
        public string? Email { get; set; }

        public string? TaxNumber { get; set; }
        public string? Address { get; set; }
    }
}