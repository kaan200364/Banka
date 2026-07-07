using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class ReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<FinancialSummaryDto> GetFinancialSummaryAsync(DateTime? from, DateTime? to)
        {
            var incomesQuery = _context.Incomes.AsQueryable();
            var expensesQuery = _context.Expenses.AsQueryable();

            if (from.HasValue)
            {
                incomesQuery = incomesQuery.Where(i => i.TransactionDate >= from.Value);
                expensesQuery = expensesQuery.Where(e => e.TransactionDate >= from.Value);
            }
            if (to.HasValue)
            {
                incomesQuery = incomesQuery.Where(i => i.TransactionDate <= to.Value);
                expensesQuery = expensesQuery.Where(e => e.TransactionDate <= to.Value);
            }

            var totalIncome = await incomesQuery.SumAsync(i => (decimal?)i.Amount) ?? 0;
            var totalExpense = await expensesQuery.SumAsync(e => (decimal?)e.Amount) ?? 0;
            var incomeCount = await incomesQuery.CountAsync();
            var expenseCount = await expensesQuery.CountAsync();

            return new FinancialSummaryDto
            {
                TotalIncome = totalIncome,
                TotalExpense = totalExpense,
                NetBalance = totalIncome - totalExpense,
                IncomeCount = incomeCount,
                ExpenseCount = expenseCount
            };
        }

        public async Task<List<ProjectSummaryDto>> GetProjectSummaryAsync()
        {
            var projects = await _context.Projects.ToListAsync();
            var result = new List<ProjectSummaryDto>();

            foreach (var project in projects)
            {
                var tasks = await _context.ProjectTasks
                    .Where(t => t.ProjectID == project.ProjectID)
                    .ToListAsync();

                result.Add(new ProjectSummaryDto
                {
                    ProjectID = project.ProjectID,
                    ProjectName = project.ProjectName,
                    Status = project.Status,
                    TotalTasks = tasks.Count,
                    CompletedTasks = tasks.Count(t => t.Status == "Completed")
                });
            }

            return result;
        }

        public async Task<QuotationSummaryDto> GetQuotationSummaryAsync()
        {
            var quotations = await _context.Quotations.ToListAsync();

            return new QuotationSummaryDto
            {
                TotalQuotations = quotations.Count,
                DraftCount = quotations.Count(q => q.Status == "Draft"),
                ApprovedCount = quotations.Count(q => q.Status == "Approved"),
                RejectedCount = quotations.Count(q => q.Status == "Rejected"),
                TotalApprovedAmount = quotations.Where(q => q.Status == "Approved").Sum(q => q.TotalAmount)
            };
        }
    }
}