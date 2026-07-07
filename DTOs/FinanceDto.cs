using System.ComponentModel.DataAnnotations;

namespace CSF.API.DTOs
{
    public class CreateIncomeDto
    {
        public Guid? CustomerID { get; set; }

        [Required(ErrorMessage = "Banka hesabı seçilmelidir.")]
        public Guid BankAccountID { get; set; }

        public Guid? ProjectID { get; set; }

        [Required(ErrorMessage = "Tutar zorunludur.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Tutar sıfırdan büyük olmalıdır.")]
        public decimal Amount { get; set; }

        public string? Category { get; set; }
        public string? Description { get; set; }
    }

    public class CreateExpenseDto
    {
        public Guid? SupplierID { get; set; }

        [Required(ErrorMessage = "Banka hesabı seçilmelidir.")]
        public Guid BankAccountID { get; set; }

        public Guid? ProjectID { get; set; }

        [Required(ErrorMessage = "Tutar zorunludur.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Tutar sıfırdan büyük olmalıdır.")]
        public decimal Amount { get; set; }

        public string? Category { get; set; }
        public string? Description { get; set; }
    }

    public class IncomeDto
    {
        public Guid IncomeID { get; set; }
        public Guid? CustomerID { get; set; }
        public Guid BankAccountID { get; set; }
        public Guid? ProjectID { get; set; }
        public decimal Amount { get; set; }
        public string? Category { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Description { get; set; }
    }

    public class ExpenseDto
    {
        public Guid ExpenseID { get; set; }
        public Guid? SupplierID { get; set; }
        public Guid BankAccountID { get; set; }
        public Guid? ProjectID { get; set; }
        public decimal Amount { get; set; }
        public string? Category { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Description { get; set; }
    }
}