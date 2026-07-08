using ClosedXML.Excel;
using CSF.API.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;

namespace CSF.API.Services
{
    public class ReportExportService
    {
        public byte[] GeneratePdf(FinancialSummaryDto financial, QuotationSummaryDto quotations, List<ProjectSummaryDto> projects)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header().Text("Genel Rapor Özeti").FontSize(18).Bold();

                    page.Content().Column(col =>
                    {
                        col.Spacing(15);

                        col.Item().Text("Finansal Özet").FontSize(14).Bold();
                        col.Item().Text($"Toplam Gelir: {financial.TotalIncome:N2} TRY ({financial.IncomeCount} işlem)");
                        col.Item().Text($"Toplam Gider: {financial.TotalExpense:N2} TRY ({financial.ExpenseCount} işlem)");
                        col.Item().Text($"Net Bakiye: {financial.NetBalance:N2} TRY");

                        col.Item().PaddingTop(10).Text("Teklif Özeti").FontSize(14).Bold();
                        col.Item().Text($"Toplam Teklif: {quotations.TotalQuotations}");
                        col.Item().Text($"Onaylı: {quotations.ApprovedCount} | Taslak: {quotations.DraftCount} | Reddedilen: {quotations.RejectedCount}");
                        col.Item().Text($"Onaylı Toplam Tutar: {quotations.TotalApprovedAmount:N2} TRY");

                        col.Item().PaddingTop(10).Text("Proje İlerlemesi").FontSize(14).Bold();
                        foreach (var project in projects)
                        {
                            col.Item().Text($"{project.ProjectName} — {project.CompletedTasks}/{project.TotalTasks} görev tamamlandı ({project.Status})");
                        }
                    });

                    page.Footer().AlignCenter().Text($"Oluşturulma Tarihi: {DateTime.Now:dd.MM.yyyy HH:mm}");
                });
            });

            return document.GeneratePdf();
        }

        public byte[] GenerateExcel(FinancialSummaryDto financial, QuotationSummaryDto quotations, List<ProjectSummaryDto> projects)
        {
            using var workbook = new XLWorkbook();

            var finSheet = workbook.Worksheets.Add("Finansal Özet");
            finSheet.Cell(1, 1).Value = "Kalem";
            finSheet.Cell(1, 2).Value = "Değer";
            finSheet.Cell(2, 1).Value = "Toplam Gelir";
            finSheet.Cell(2, 2).Value = financial.TotalIncome;
            finSheet.Cell(3, 1).Value = "Toplam Gider";
            finSheet.Cell(3, 2).Value = financial.TotalExpense;
            finSheet.Cell(4, 1).Value = "Net Bakiye";
            finSheet.Cell(4, 2).Value = financial.NetBalance;
            finSheet.Row(1).Style.Font.Bold = true;

            var projSheet = workbook.Worksheets.Add("Proje İlerlemesi");
            projSheet.Cell(1, 1).Value = "Proje Adı";
            projSheet.Cell(1, 2).Value = "Durum";
            projSheet.Cell(1, 3).Value = "Tamamlanan Görev";
            projSheet.Cell(1, 4).Value = "Toplam Görev";
            projSheet.Row(1).Style.Font.Bold = true;

            for (int i = 0; i < projects.Count; i++)
            {
                var row = i + 2;
                projSheet.Cell(row, 1).Value = projects[i].ProjectName;
                projSheet.Cell(row, 2).Value = projects[i].Status;
                projSheet.Cell(row, 3).Value = projects[i].CompletedTasks;
                projSheet.Cell(row, 4).Value = projects[i].TotalTasks;
            }

            finSheet.Columns().AdjustToContents();
            projSheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }
}