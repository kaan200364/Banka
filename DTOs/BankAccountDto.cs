using System.ComponentModel.DataAnnotations;

namespace CSF.API.DTOs
{
    public class BankAccountDto
    {
        public Guid BankAccountID { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string IBAN { get; set; } = string.Empty;
        public string? AccountNumber { get; set; }
        public string Currency { get; set; } = "TRY";
        public decimal Balance { get; set; }
        public bool OverdraftEnabled { get; set; }
        public decimal OverdraftLimit { get; set; }
        public string Status { get; set; } = "Active";
    }

    public class CreateBankAccountDto
    {
        [Required(ErrorMessage = "Banka adı zorunludur.")]
        [MaxLength(150)]
        public string BankName { get; set; } = string.Empty;

        [Required(ErrorMessage = "IBAN zorunludur.")]
        [MaxLength(34)]
        public string IBAN { get; set; } = string.Empty;

        public string? AccountNumber { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "TRY";

        public bool OverdraftEnabled { get; set; } = false;
        public decimal OverdraftLimit { get; set; } = 0;
    }

    public class BankTransactionDto
    {
        public Guid TransactionID { get; set; }
        public Guid BankAccountID { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateBankAccountDto
{
    [Required(ErrorMessage = "Banka adı zorunludur.")]
    [MaxLength(150)]
    public string BankName { get; set; } = string.Empty;

    public string? AccountNumber { get; set; }

    public bool OverdraftEnabled { get; set; }
    public decimal OverdraftLimit { get; set; }
}
}