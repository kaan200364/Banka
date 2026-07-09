using Microsoft.EntityFrameworkCore;

namespace CSF.API
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<User> Users => Set<User>();
        public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
        public DbSet<Income> Incomes => Set<Income>();
public DbSet<Expense> Expenses => Set<Expense>();
public DbSet<BankTransaction> BankTransactions => Set<BankTransaction>();
public DbSet<Quotation> Quotations => Set<Quotation>();
public DbSet<Contract> Contracts => Set<Contract>();
public DbSet<Project> Projects => Set<Project>();
public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();
public DbSet<Supplier> Suppliers => Set<Supplier>();
public DbSet<TaskComment> TaskComments => Set<TaskComment>();
public DbSet<TaskAttachment> TaskAttachments => Set<TaskAttachment>();
public DbSet<ContractAttachment> ContractAttachments => Set<ContractAttachment>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(c => c.CustomerID);
                entity.Property(c => c.CompanyName).IsRequired().HasMaxLength(200);
                entity.Property(c => c.Email).HasMaxLength(150);
                entity.Property(c => c.TaxNumber).HasMaxLength(50);
                entity.Property(c => c.Status).HasMaxLength(20);

                modelBuilder.Entity<User>(entity =>
{
    entity.HasKey(u => u.UserID);
    entity.Property(u => u.Username).IsRequired().HasMaxLength(50);
    entity.HasIndex(u => u.Username).IsUnique();
    entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
    entity.Property(u => u.Role).IsRequired().HasMaxLength(20);
});
            });
            modelBuilder.Entity<BankAccount>(entity =>
{
    entity.HasKey(b => b.BankAccountID);
    entity.Property(b => b.BankName).IsRequired().HasMaxLength(150);
    entity.Property(b => b.IBAN).IsRequired().HasMaxLength(34);
    entity.Property(b => b.Currency).HasMaxLength(3);
    entity.Property(b => b.Balance).HasColumnType("decimal(18,2)");
    entity.Property(b => b.OverdraftLimit).HasColumnType("decimal(18,2)");
});

modelBuilder.Entity<BankTransaction>(entity =>
{
    entity.HasKey(t => t.TransactionID);
    entity.Property(t => t.TransactionType).IsRequired().HasMaxLength(20);
    entity.Property(t => t.Amount).HasColumnType("decimal(18,2)");

    entity.HasOne(t => t.BankAccount)
          .WithMany()
          .HasForeignKey(t => t.BankAccountID)
          .OnDelete(DeleteBehavior.Restrict);
});
modelBuilder.Entity<Income>(entity =>
{
    entity.HasKey(i => i.IncomeID);
    entity.Property(i => i.Amount).HasColumnType("decimal(18,2)");
});

modelBuilder.Entity<Expense>(entity =>
{
    entity.HasKey(e => e.ExpenseID);
    entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
});
modelBuilder.Entity<Quotation>(entity =>
{
    entity.HasKey(q => q.QuotationID);
    entity.Property(q => q.QuotationNumber).IsRequired().HasMaxLength(30);
    entity.HasIndex(q => q.QuotationNumber).IsUnique();
    entity.Property(q => q.TotalAmount).HasColumnType("decimal(18,2)");
    entity.Property(q => q.Status).HasMaxLength(20);
});
modelBuilder.Entity<Contract>(entity =>
{
    entity.HasKey(c => c.ContractID);
    entity.Property(c => c.ContractNumber).IsRequired().HasMaxLength(30);
    entity.HasIndex(c => c.ContractNumber).IsUnique();
    entity.Property(c => c.Status).HasMaxLength(20);
});
modelBuilder.Entity<Project>(entity =>
{
    entity.HasKey(p => p.ProjectID);
    entity.Property(p => p.ProjectName).IsRequired().HasMaxLength(200);
    entity.Property(p => p.Status).HasMaxLength(20);
});
modelBuilder.Entity<ProjectTask>(entity =>
{
    entity.HasKey(t => t.TaskID);
    entity.Property(t => t.Title).IsRequired().HasMaxLength(200);
    entity.Property(t => t.Priority).HasMaxLength(20);
    entity.Property(t => t.Status).HasMaxLength(20);

    entity.HasOne<ProjectTask>()
          .WithMany()
          .HasForeignKey(t => t.ParentTaskID)
          .OnDelete(DeleteBehavior.Restrict);
});

modelBuilder.Entity<Supplier>(entity =>
{
    entity.HasKey(s => s.SupplierID);
    entity.Property(s => s.CompanyName).IsRequired().HasMaxLength(200);
    entity.Property(s => s.Email).HasMaxLength(150);
    entity.Property(s => s.TaxNumber).HasMaxLength(50);
    entity.Property(s => s.Status).HasMaxLength(20);
    entity.HasIndex(s => s.TaxNumber);
});

modelBuilder.Entity<TaskComment>(entity =>
{
    entity.HasKey(c => c.CommentID);
    entity.Property(c => c.Content).IsRequired().HasMaxLength(1000);
});

modelBuilder.Entity<TaskAttachment>(entity =>
{
    entity.HasKey(a => a.AttachmentID);
    entity.Property(a => a.FileName).IsRequired().HasMaxLength(255);
    entity.Property(a => a.FilePath).IsRequired();
});

modelBuilder.Entity<ContractAttachment>(entity =>
{
    entity.HasKey(a => a.AttachmentID);
    entity.Property(a => a.FileName).IsRequired().HasMaxLength(255);
    entity.Property(a => a.FilePath).IsRequired();
});
        }
    }
}