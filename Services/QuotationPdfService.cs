using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CSF.API.Services
{
    public class QuotationPdfService
    {
        public byte[] GeneratePdf(Quotation quotation, string customerName)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header().Column(col =>
                    {
                        col.Item().Text("TEKLİF").FontSize(20).Bold();
                        col.Item().Text($"Teklif No: {quotation.QuotationNumber}");
                    });

                    page.Content().Column(col =>
                    {
                        col.Spacing(10);

                        col.Item().Text($"Müşteri: {customerName}");
                        col.Item().Text($"Düzenleme Tarihi: {quotation.IssueDate:dd.MM.yyyy}");
                        col.Item().Text($"Geçerlilik Tarihi: {quotation.ExpiryDate:dd.MM.yyyy}");
                        col.Item().Text($"Durum: {quotation.Status}");

                        col.Item().PaddingTop(20).LineHorizontal(1);

                        col.Item().PaddingTop(10).Text($"Toplam Tutar: {quotation.TotalAmount:N2} {quotation.Currency}")
                            .FontSize(14).Bold();

                        if (!string.IsNullOrWhiteSpace(quotation.Description))
                        {
                            col.Item().PaddingTop(20).Text("Açıklama:").Bold();
                            col.Item().Text(quotation.Description);
                        }
                    });

                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("Bu belge CSF Yönetim Sistemi tarafından oluşturulmuştur.");
                    });
                });
            });

            return document.GeneratePdf();
        }
    }
}