namespace CSF.API
{
    public class Expense
    {
        public Guid ExpenseID { get; set; } = Guid.NewGuid();

        public Guid? SupplierID { get; set; }
        public Guid BankAccountID { get; set; }
        public Guid? ProjectID { get; set; }

        public decimal Amount { get; set; }
        public string? Category { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }

        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? BankTransactionID { get; set; }
    }
}