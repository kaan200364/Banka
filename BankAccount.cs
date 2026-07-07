namespace CSF.API
{
    public class BankAccount
    {
        public Guid BankAccountID { get; set; } = Guid.NewGuid();

        public string BankName { get; set; } = string.Empty;
        public string IBAN { get; set; } = string.Empty;
        public string? AccountNumber { get; set; }
        public string Currency { get; set; } = "TRY";
        public decimal Balance { get; set; } = 0;

        public bool OverdraftEnabled { get; set; } = false;
        public decimal OverdraftLimit { get; set; } = 0;

        public string Status { get; set; } = "Active";

        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}