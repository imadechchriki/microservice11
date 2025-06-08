using System.Text;
using iTextSharp.text;
using iTextSharp.text.pdf;
using OfficeOpenXml;
using Statistics.API.Models;

namespace Statistics.API.Services
{
    public class ExportService : IExportService
    {
        public async Task<byte[]> ExportOverallStatisticsToPdfAsync(OverallStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                using var memoryStream = new MemoryStream();
                var document = new Document(PageSize.A4, 50, 50, 50, 50);
                var writer = PdfWriter.GetInstance(document, memoryStream);
                
                document.Open();

                // Title with enhanced styling
                var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(0, 102, 153)); // Blue title
                var title = new Paragraph("📊 Rapport Statistiques Générales", titleFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 15
                };
                document.Add(title);

                // Generation date with improved styling
                var dateFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, new BaseColor(128, 128, 128));
                var date = new Paragraph($"Généré le: {DateTime.Now:dd/MM/yyyy HH:mm}", dateFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 25
                };
                document.Add(date);

                // Metrics section with colored background
                var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14, new BaseColor(255, 255, 255));
                var headerBg = new Paragraph("Métriques Générales", headerFont) { SpacingAfter = 15 };
                var headerTable = new PdfPTable(1) { WidthPercentage = 100 };
                headerTable.AddCell(CreateCell("Métriques Générales", headerFont, new BaseColor(70, 130, 180))); // Steel blue
                document.Add(headerTable);

                // Enhanced metrics display
                var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11);
                var metricsTable = new PdfPTable(2) { WidthPercentage = 100, SpacingAfter = 20 };
                metricsTable.SetWidths(new float[] { 60f, 40f });
                
                var labelFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, new BaseColor(51, 51, 51));
                var valueFont = FontFactory.GetFont(FontFactory.HELVETICA, 11, new BaseColor(0, 102, 153));
                
                metricsTable.AddCell(CreateCell("Total des questionnaires", labelFont, new BaseColor(248, 249, 250)));
                metricsTable.AddCell(CreateCell(stats.TotalQuestionnaires.ToString(), valueFont, new BaseColor(248, 249, 250)));
                metricsTable.AddCell(CreateCell("Total des soumissions", labelFont, new BaseColor(255, 255, 255)));
                metricsTable.AddCell(CreateCell(stats.TotalSubmissions.ToString(), valueFont, new BaseColor(255, 255, 255)));
                metricsTable.AddCell(CreateCell("Taux de completion", labelFont, new BaseColor(248, 249, 250)));
                metricsTable.AddCell(CreateCell($"{stats.OverallCompletionRate:F1}%", valueFont, new BaseColor(248, 249, 250)));
                metricsTable.AddCell(CreateCell("Formations actives", labelFont, new BaseColor(255, 255, 255)));
                metricsTable.AddCell(CreateCell($"{stats.FormationStatistics?.Count ?? 0}", valueFont, new BaseColor(255, 255, 255)));
                
                document.Add(metricsTable);

                // Scoring system explanation with enhanced visuals
                var scoringHeader = new PdfPTable(1) { WidthPercentage = 100 };
                scoringHeader.AddCell(CreateCell("Système de Notation", headerFont, new BaseColor(70, 130, 180)));
                document.Add(scoringHeader);

                var scoringTable = new PdfPTable(2) { WidthPercentage = 100, SpacingAfter = 20 };
                scoringTable.SetWidths(new float[] { 40f, 60f });
                
                var scoringLabelFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(51, 51, 51));
                var scoringValueFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, new BaseColor(0, 102, 153));
                
                scoringTable.AddCell(CreateCell("Questions Likert (1-5)", scoringLabelFont, new BaseColor(230, 245, 255)));
                scoringTable.AddCell(CreateCell("Score = Moyenne des réponses (Σ(réponses) ÷ N)", scoringValueFont, new BaseColor(230, 245, 255)));
                scoringTable.AddCell(CreateCell("Questions Oui/Non", scoringLabelFont, new BaseColor(248, 249, 250)));
                scoringTable.AddCell(CreateCell("Score = (% de Oui) × 5", scoringValueFont, new BaseColor(248, 249, 250)));
                scoringTable.AddCell(CreateCell("Questions Texte", scoringLabelFont, new BaseColor(230, 245, 255)));
                scoringTable.AddCell(CreateCell("Pas de score numérique (analyse qualitative)", scoringValueFont, new BaseColor(230, 245, 255)));
                
                document.Add(scoringTable);

                // Score interpretation legend
                var legendHeader = new PdfPTable(1) { WidthPercentage = 100 };
                legendHeader.AddCell(CreateCell("Interprétation des Scores", headerFont, new BaseColor(70, 130, 180)));
                document.Add(legendHeader);

                var legendTable = new PdfPTable(2) { WidthPercentage = 100, SpacingAfter = 25 };
                legendTable.SetWidths(new float[] { 30f, 70f });
                
                legendTable.AddCell(CreateCell("0.0 - 1.0", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(255, 255, 255)), new BaseColor(220, 53, 69))); // Red
                legendTable.AddCell(CreateCell("Très Faible", normalFont, new BaseColor(248, 215, 218)));
                legendTable.AddCell(CreateCell("1.1 - 2.0", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(255, 255, 255)), new BaseColor(253, 126, 20))); // Orange
                legendTable.AddCell(CreateCell("Faible", normalFont, new BaseColor(254, 230, 206)));
                legendTable.AddCell(CreateCell("2.1 - 3.0", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(0, 0, 0)), new BaseColor(255, 193, 7))); // Yellow
                legendTable.AddCell(CreateCell("Moyen", normalFont, new BaseColor(255, 243, 205)));
                legendTable.AddCell(CreateCell("3.1 - 4.0", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(255, 255, 255)), new BaseColor(0, 123, 255))); // Blue
                legendTable.AddCell(CreateCell("Bon", normalFont, new BaseColor(204, 229, 255)));
                legendTable.AddCell(CreateCell("4.1 - 5.0", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(255, 255, 255)), new BaseColor(40, 167, 69))); // Green
                legendTable.AddCell(CreateCell("Excellent", normalFont, new BaseColor(212, 237, 218)));
                
                document.Add(legendTable);

                // Enhanced Formation Statistics Table
                if (stats.FormationStatistics?.Any() == true)
                {
                    var formHeaderTable = new PdfPTable(1) { WidthPercentage = 100 };
                    formHeaderTable.AddCell(CreateCell("Statistiques par Formation", headerFont, new BaseColor(70, 130, 180)));
                    document.Add(formHeaderTable);

                    var table = new PdfPTable(5) { WidthPercentage = 100, SpacingAfter = 20 };
                    table.SetWidths(new float[] { 15f, 35f, 15f, 15f, 20f });

                    // Enhanced headers
                    var headerCellFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(255, 255, 255));
                    table.AddCell(CreateCell("Code", headerCellFont, new BaseColor(52, 58, 64)));
                    table.AddCell(CreateCell("Formation", headerCellFont, new BaseColor(52, 58, 64)));
                    table.AddCell(CreateCell("Soumissions", headerCellFont, new BaseColor(52, 58, 64)));
                    table.AddCell(CreateCell("Note/5", headerCellFont, new BaseColor(52, 58, 64)));
                    table.AddCell(CreateCell("Interprétation", headerCellFont, new BaseColor(52, 58, 64)));

                    // Enhanced data rows with color coding
                    var cellFont = FontFactory.GetFont(FontFactory.HELVETICA, 9);
                    var cellFontBold = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9);
                    
                    foreach (var formation in stats.FormationStatistics)
                    {
                        // Determine colors based on score
                        BaseColor scoreColor, textColor, bgColor;
                        string interpretation;
                        
                        if (formation.AverageRating >= 4.0)
                        {
                            scoreColor = new BaseColor(40, 167, 69); // Green
                            bgColor = new BaseColor(212, 237, 218);
                            textColor = new BaseColor(21, 87, 36);
                            interpretation = "Excellent";
                        }
                        else if (formation.AverageRating >= 3.0)
                        {
                            scoreColor = new BaseColor(0, 123, 255); // Blue
                            bgColor = new BaseColor(204, 229, 255);
                            textColor = new BaseColor(0, 86, 179);
                            interpretation = "Bon";
                        }
                        else if (formation.AverageRating >= 2.0)
                        {
                            scoreColor = new BaseColor(255, 193, 7); // Yellow
                            bgColor = new BaseColor(255, 243, 205);
                            textColor = new BaseColor(133, 100, 4);
                            interpretation = "Moyen";
                        }
                        else if (formation.AverageRating >= 1.0)
                        {
                            scoreColor = new BaseColor(253, 126, 20); // Orange
                            bgColor = new BaseColor(254, 230, 206);
                            textColor = new BaseColor(138, 69, 11);
                            interpretation = "Faible";
                        }
                        else
                        {
                            scoreColor = new BaseColor(220, 53, 69); // Red
                            bgColor = new BaseColor(248, 215, 218);
                            textColor = new BaseColor(114, 28, 36);
                            interpretation = "Très Faible";
                        }

                        table.AddCell(CreateCell(formation.FormationCode ?? "", cellFont, new BaseColor(255, 255, 255)));
                        table.AddCell(CreateCell(formation.FormationTitle ?? "", cellFont, new BaseColor(255, 255, 255)));
                        table.AddCell(CreateCell(formation.SubmissionCount.ToString(), cellFont, new BaseColor(255, 255, 255)));
                        table.AddCell(CreateCell($"{formation.AverageRating:F1}", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9, textColor), bgColor));
                        table.AddCell(CreateCell(interpretation, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9, textColor), bgColor));
                    }

                    document.Add(table);
                }

                document.Close();
                return memoryStream.ToArray();
            });
        }

        public async Task<byte[]> ExportOverallStatisticsToExcelAsync(OverallStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using var package = new ExcelPackage();
                
                // Overview Sheet
                var overviewSheet = package.Workbook.Worksheets.Add("Vue d'ensemble");
                
                // Title and header styling
                overviewSheet.Cells["A1"].Value = "📊 Rapport Statistiques Générales";
                overviewSheet.Cells["A1"].Style.Font.Size = 16;
                overviewSheet.Cells["A1"].Style.Font.Bold = true;
                
                overviewSheet.Cells["A2"].Value = $"Généré le: {DateTime.Now:dd/MM/yyyy HH:mm}";
                overviewSheet.Cells["A2"].Style.Font.Size = 10;
                
                // Overall statistics
                overviewSheet.Cells["A4"].Value = "Métriques Générales";
                overviewSheet.Cells["A4"].Style.Font.Bold = true;
                overviewSheet.Cells["A4"].Style.Font.Size = 14;
                
                overviewSheet.Cells["A5"].Value = "Total des questionnaires";
                overviewSheet.Cells["B5"].Value = stats.TotalQuestionnaires;
                
                overviewSheet.Cells["A6"].Value = "Total des soumissions";
                overviewSheet.Cells["B6"].Value = stats.TotalSubmissions;
                
                overviewSheet.Cells["A7"].Value = "Taux de completion";
                overviewSheet.Cells["B7"].Value = $"{stats.OverallCompletionRate:F1}%";
                
                overviewSheet.Cells["A8"].Value = "Formations actives";
                overviewSheet.Cells["B8"].Value = stats.FormationStatistics?.Count ?? 0;

                // Add scoring system explanation
                overviewSheet.Cells["A10"].Value = "Système de Notation";
                overviewSheet.Cells["A10"].Style.Font.Bold = true;
                overviewSheet.Cells["A10"].Style.Font.Size = 14;
                
                overviewSheet.Cells["A11"].Value = "Questions Likert";
                overviewSheet.Cells["B11"].Value = "Score = Moyenne des réponses (1-5)";
                
                overviewSheet.Cells["A12"].Value = "Questions Oui/Non";
                overviewSheet.Cells["B12"].Value = "Score = (% Oui) × 5";
                
                overviewSheet.Cells["A13"].Value = "Questions Texte";
                overviewSheet.Cells["B13"].Value = "Pas de score numérique (analyse qualitative)";

                // Add professional message directing to other sheets
                overviewSheet.Cells["A15"].Value = "ℹ️ Pour une analyse détaillée par formation, consultez l'onglet 'Statistiques Formations'";
                overviewSheet.Cells["A15"].Style.Font.Size = 14;
                overviewSheet.Cells["A15"].Style.Font.Bold = true;
                overviewSheet.Cells["A15"].Style.Font.Color.SetColor(System.Drawing.Color.Red);
                overviewSheet.Cells["A15:B15"].Merge = true;
                overviewSheet.Cells["A15"].Style.WrapText = true;
                
                overviewSheet.Cells["A16"].Value = "• Statistiques Formations : Vue détaillée avec scores colorés et interprétations";
                overviewSheet.Cells["A16"].Style.Font.Size = 11;
                overviewSheet.Cells["A16"].Style.Font.Color.SetColor(System.Drawing.Color.DarkBlue);
                overviewSheet.Cells["A16"].Style.WrapText = true;

                // Formation statistics
                if (stats.FormationStatistics?.Any() == true)
                {
                    var formSheet = package.Workbook.Worksheets.Add("Statistiques Formations");
                    
                    // Headers
                    formSheet.Cells["A1"].Value = "Code Formation";
                    formSheet.Cells["B1"].Value = "Nom de la Formation";
                    formSheet.Cells["C1"].Value = "Nombre de Soumissions";
                    formSheet.Cells["D1"].Value = "Note Moyenne";
                    formSheet.Cells["E1"].Value = "Interprétation";
                    
                    // Header styling
                    using var headerRange = formSheet.Cells["A1:E1"];
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                    
                    // Data
                    for (int i = 0; i < stats.FormationStatistics.Count; i++)
                    {
                        var formation = stats.FormationStatistics[i];
                        var row = i + 2;
                        
                        formSheet.Cells[$"A{row}"].Value = formation.FormationCode;
                        formSheet.Cells[$"B{row}"].Value = formation.FormationTitle;
                        formSheet.Cells[$"C{row}"].Value = formation.SubmissionCount;
                        formSheet.Cells[$"D{row}"].Value = formation.AverageRating;
                        
                        // Add score interpretation
                        string interpretation = formation.AverageRating switch
                        {
                            >= 0.0 and <= 1.0 => "Très Faible",
                            > 1.0 and <= 2.0 => "Faible",
                            > 2.0 and <= 3.0 => "Moyen",
                            > 3.0 and <= 4.0 => "Bon",
                            > 4.0 and <= 5.0 => "Excellent",
                            _ => "N/A"
                        };
                        formSheet.Cells[$"E{row}"].Value = interpretation;
                        
                        // Color coding based on score
                        var scoreCell = formSheet.Cells[$"D{row}"];
                        var interpretationCell = formSheet.Cells[$"E{row}"];
                        
                        if (formation.AverageRating >= 4.0)
                        {
                            scoreCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            scoreCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGreen);
                            interpretationCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            interpretationCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGreen);
                        }
                        else if (formation.AverageRating >= 3.0)
                        {
                            scoreCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            scoreCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                            interpretationCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            interpretationCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                        }
                        else if (formation.AverageRating >= 2.0)
                        {
                            scoreCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            scoreCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);
                            interpretationCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            interpretationCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);
                        }
                        else
                        {
                            scoreCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            scoreCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightCoral);
                            interpretationCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            interpretationCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightCoral);
                        }
                    }
                    
                    formSheet.Cells[formSheet.Dimension.Address].AutoFitColumns();
                }

                overviewSheet.Cells[overviewSheet.Dimension.Address].AutoFitColumns();
                
                return package.GetAsByteArray();
            });
        }

        public async Task<byte[]> ExportOverallStatisticsToCsvAsync(OverallStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                var csv = new StringBuilder();
                
                // Header
                csv.AppendLine("📊 Rapport Statistiques Générales");
                csv.AppendLine($"Généré le,{DateTime.Now:dd/MM/yyyy HH:mm}");
                csv.AppendLine();
                
                // Overall stats
                csv.AppendLine("=== MÉTRIQUES GÉNÉRALES ===");
                csv.AppendLine("Métriques,Valeur");
                csv.AppendLine($"Total des questionnaires,{stats.TotalQuestionnaires}");
                csv.AppendLine($"Total des soumissions,{stats.TotalSubmissions}");
                csv.AppendLine($"Taux de completion,{stats.OverallCompletionRate:F1}%");
                csv.AppendLine($"Formations actives,{stats.FormationStatistics?.Count ?? 0}");
                csv.AppendLine();
                
                // Scoring system explanation
                csv.AppendLine("=== SYSTÈME DE NOTATION ===");
                csv.AppendLine("Type de Question,Formule de Calcul");
                csv.AppendLine("\"Questions Likert (1-5)\",\"Score = Moyenne des réponses (Σ(réponses) ÷ N)\"");
                csv.AppendLine("\"Questions Oui/Non\",\"Score = (% de Oui) × 5\"");
                csv.AppendLine("\"Questions Texte\",\"Pas de score numérique (analyse qualitative)\"");
                csv.AppendLine();
                
                csv.AppendLine("=== INTERPRÉTATION DES SCORES ===");
                csv.AppendLine("Plage,Interprétation");
                csv.AppendLine("\"0.0 - 1.0\",\"Très Faible\"");
                csv.AppendLine("\"1.1 - 2.0\",\"Faible\"");
                csv.AppendLine("\"2.1 - 3.0\",\"Moyen\"");
                csv.AppendLine("\"3.1 - 4.0\",\"Bon\"");
                csv.AppendLine("\"4.1 - 5.0\",\"Excellent\"");
                csv.AppendLine();
                
                // Formation statistics
                if (stats.FormationStatistics?.Any() == true)
                {
                    csv.AppendLine("=== STATISTIQUES PAR FORMATION ===");
                    csv.AppendLine("Code Formation,Nom de la Formation,Nombre de Soumissions,Note Moyenne,Interprétation");
                    
                    foreach (var formation in stats.FormationStatistics)
                    {
                        var formationTitle = formation.FormationTitle?.Replace(",", ";").Replace("\"", "\"\"");
                        string interpretation = formation.AverageRating switch
                        {
                            >= 0.0 and <= 1.0 => "Très Faible",
                            > 1.0 and <= 2.0 => "Faible",
                            > 2.0 and <= 3.0 => "Moyen",
                            > 3.0 and <= 4.0 => "Bon",
                            > 4.0 and <= 5.0 => "Excellent",
                            _ => "N/A"
                        };
                        
                        csv.AppendLine($"{formation.FormationCode},\"{formationTitle}\",{formation.SubmissionCount},{formation.AverageRating:F1},{interpretation}");
                    }
                }
                
                return Encoding.UTF8.GetBytes(csv.ToString());
            });
        }

        public async Task<byte[]> ExportQuestionnaireStatisticsToPdfAsync(QuestionnaireStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                using var memoryStream = new MemoryStream();
                var document = new Document(PageSize.A4, 50, 50, 50, 50);
                var writer = PdfWriter.GetInstance(document, memoryStream);
                
                document.Open();

                // Enhanced title with color
                var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(0, 102, 153)); // Blue title
                var title = new Paragraph($"📋 Analyse Détaillée: {stats.Title}", titleFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 15
                };
                document.Add(title);

                // Generation date
                var dateFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, new BaseColor(128, 128, 128));
                var date = new Paragraph($"Généré le: {DateTime.Now:dd/MM/yyyy HH:mm}", dateFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 20
                };
                document.Add(date);

                // Enhanced basic info section
                var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14, new BaseColor(255, 255, 255));
                var infoHeaderTable = new PdfPTable(1) { WidthPercentage = 100 };
                infoHeaderTable.AddCell(CreateCell("Informations Générales", headerFont, new BaseColor(70, 130, 180)));
                document.Add(infoHeaderTable);

                var infoTable = new PdfPTable(2) { WidthPercentage = 100, SpacingAfter = 20 };
                infoTable.SetWidths(new float[] { 40f, 60f });
                
                var labelFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, new BaseColor(51, 51, 51));
                var valueFont = FontFactory.GetFont(FontFactory.HELVETICA, 11, new BaseColor(0, 102, 153));
                
                infoTable.AddCell(CreateCell("ID Publication", labelFont, new BaseColor(248, 249, 250)));
                infoTable.AddCell(CreateCell(stats.PublicationId.ToString(), valueFont, new BaseColor(248, 249, 250)));
                infoTable.AddCell(CreateCell("Total soumissions", labelFont, new BaseColor(255, 255, 255)));
                infoTable.AddCell(CreateCell(stats.TotalSubmissions.ToString(), valueFont, new BaseColor(255, 255, 255)));
                infoTable.AddCell(CreateCell("Taux de completion", labelFont, new BaseColor(248, 249, 250)));
                infoTable.AddCell(CreateCell($"{stats.CompletionRate:F1}%", valueFont, new BaseColor(248, 249, 250)));
                infoTable.AddCell(CreateCell("Période d'analyse", labelFont, new BaseColor(255, 255, 255)));
                infoTable.AddCell(CreateCell($"{stats.StartDate:dd/MM/yyyy} - {stats.EndDate:dd/MM/yyyy}", valueFont, new BaseColor(255, 255, 255)));
                
                document.Add(infoTable);

                // Scoring system explanation
                var scoringHeader = new PdfPTable(1) { WidthPercentage = 100 };
                scoringHeader.AddCell(CreateCell("Système de Notation", headerFont, new BaseColor(70, 130, 180)));
                document.Add(scoringHeader);

                var scoringTable = new PdfPTable(2) { WidthPercentage = 100, SpacingAfter = 15 };
                scoringTable.SetWidths(new float[] { 40f, 60f });
                
                var scoringLabelFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(51, 51, 51));
                var scoringValueFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, new BaseColor(0, 102, 153));
                
                scoringTable.AddCell(CreateCell("Questions Likert (1-5)", scoringLabelFont, new BaseColor(230, 245, 255)));
                scoringTable.AddCell(CreateCell("Score = Moyenne des réponses", scoringValueFont, new BaseColor(230, 245, 255)));
                scoringTable.AddCell(CreateCell("Questions Oui/Non", scoringLabelFont, new BaseColor(248, 249, 250)));
                scoringTable.AddCell(CreateCell("Score = (% de Oui) × 5", scoringValueFont, new BaseColor(248, 249, 250)));
                scoringTable.AddCell(CreateCell("Questions Texte", scoringLabelFont, new BaseColor(230, 245, 255)));
                scoringTable.AddCell(CreateCell("Analyse qualitative uniquement", scoringValueFont, new BaseColor(230, 245, 255)));
                
                document.Add(scoringTable);

                // Enhanced section statistics
                if (stats.SectionStatistics?.Any() == true)
                {
                    var sectionHeaderTable = new PdfPTable(1) { WidthPercentage = 100 };
                    sectionHeaderTable.AddCell(CreateCell("Analyse Détaillée par Section", headerFont, new BaseColor(70, 130, 180)));
                    document.Add(sectionHeaderTable);
                    document.Add(new Paragraph(" ", FontFactory.GetFont(FontFactory.HELVETICA, 8)) { SpacingAfter = 10 });

                    foreach (var section in stats.SectionStatistics)
                    {
                        // Enhanced section header with background
                        var sectionHeaderBg = new PdfPTable(1) { WidthPercentage = 100, SpacingAfter = 10 };
                        var sectionFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, new BaseColor(255, 255, 255));
                        sectionHeaderBg.AddCell(CreateCell(section.SectionTitle, sectionFont, new BaseColor(108, 117, 125)));
                        document.Add(sectionHeaderBg);

                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                // Question text with enhanced styling
                                var questionFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, new BaseColor(33, 37, 41));
                                var questionPara = new Paragraph($"Q: {question.QuestionText}", questionFont) { SpacingAfter = 5 };
                                document.Add(questionPara);
                                
                                // Question details table
                                var detailsTable = new PdfPTable(3) { WidthPercentage = 100, SpacingAfter = 10 };
                                detailsTable.SetWidths(new float[] { 25f, 25f, 50f });
                                
                                var detailFont = FontFactory.GetFont(FontFactory.HELVETICA, 10);
                                var detailLabelFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(73, 80, 87));
                                
                                detailsTable.AddCell(CreateCell($"Type: {question.QuestionType}", detailLabelFont, new BaseColor(248, 249, 250)));
                                detailsTable.AddCell(CreateCell($"Réponses: {question.TotalAnswers}", detailLabelFont, new BaseColor(248, 249, 250)));
                                
                                if (question.AverageScore.HasValue)
                                {
                                    // Color-coded score display
                                    BaseColor scoreColor, scoreBgColor;
                                    string interpretation;
                                    
                                    if (question.AverageScore >= 4.0)
                                    {
                                        scoreColor = new BaseColor(21, 87, 36);
                                        scoreBgColor = new BaseColor(212, 237, 218);
                                        interpretation = "Excellent";
                                    }
                                    else if (question.AverageScore >= 3.0)
                                    {
                                        scoreColor = new BaseColor(0, 86, 179);
                                        scoreBgColor = new BaseColor(204, 229, 255);
                                        interpretation = "Bon";
                                    }
                                    else if (question.AverageScore >= 2.0)
                                    {
                                        scoreColor = new BaseColor(133, 100, 4);
                                        scoreBgColor = new BaseColor(255, 243, 205);
                                        interpretation = "Moyen";
                                    }
                                    else if (question.AverageScore >= 1.0)
                                    {
                                        scoreColor = new BaseColor(138, 69, 11);
                                        scoreBgColor = new BaseColor(254, 230, 206);
                                        interpretation = "Faible";
                                    }
                                    else
                                    {
                                        scoreColor = new BaseColor(114, 28, 36);
                                        scoreBgColor = new BaseColor(248, 215, 218);
                                        interpretation = "Très Faible";
                                    }
                                    
                                    var scoreFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, scoreColor);
                                    detailsTable.AddCell(CreateCell($"Score: {question.AverageScore:F2}/5 ({interpretation})", scoreFont, scoreBgColor));
                                }
                                else
                                {
                                    var noScoreFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, Font.ITALIC, new BaseColor(108, 117, 125));
                                    detailsTable.AddCell(CreateCell("Pas de score (Question texte)", noScoreFont, new BaseColor(233, 236, 239)));
                                }
                                
                                document.Add(detailsTable);
                                
                                // Add some space between questions
                                document.Add(new Paragraph(" ", FontFactory.GetFont(FontFactory.HELVETICA, 6)) { SpacingAfter = 8 });
                            }
                        }
                        
                        // Section separator
                        document.Add(new Paragraph(" ", FontFactory.GetFont(FontFactory.HELVETICA, 8)) { SpacingAfter = 15 });
                    }
                }

                document.Close();
                return memoryStream.ToArray();
            });
        }

        public async Task<byte[]> ExportQuestionnaireStatisticsToExcelAsync(QuestionnaireStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using var package = new ExcelPackage();
                
                // Summary Sheet
                var summarySheet = package.Workbook.Worksheets.Add("Résumé");
                
                summarySheet.Cells["A1"].Value = $"📋 Analyse: {stats.Title}";
                summarySheet.Cells["A1"].Style.Font.Size = 16;
                summarySheet.Cells["A1"].Style.Font.Bold = true;
                
                summarySheet.Cells["A3"].Value = "ID Publication";
                summarySheet.Cells["B3"].Value = stats.PublicationId;
                summarySheet.Cells["A4"].Value = "Total soumissions";
                summarySheet.Cells["B4"].Value = stats.TotalSubmissions;
                summarySheet.Cells["A5"].Value = "Taux de completion";
                summarySheet.Cells["B5"].Value = $"{stats.CompletionRate:F1}%";
                summarySheet.Cells["A6"].Value = "Date début";
                summarySheet.Cells["B6"].Value = stats.StartDate.ToString("dd/MM/yyyy");
                summarySheet.Cells["A7"].Value = "Date fin";
                summarySheet.Cells["B7"].Value = stats.EndDate.ToString("dd/MM/yyyy");

                // Add professional message directing to other sheets
                summarySheet.Cells["A9"].Value = "ℹ️ Pour une analyse complète et détaillée, consultez les autres onglets de ce fichier Excel";
                summarySheet.Cells["A9"].Style.Font.Size = 14;
                summarySheet.Cells["A9"].Style.Font.Bold = true;
                summarySheet.Cells["A9"].Style.Font.Color.SetColor(System.Drawing.Color.Red);
                summarySheet.Cells["A9:B9"].Merge = true;
                summarySheet.Cells["A9"].Style.WrapText = true;
                
                summarySheet.Cells["A10"].Value = "• Analyse par Section : Vue détaillée par section avec scores colorés";
                summarySheet.Cells["A11"].Value = "• Vue d'ensemble Questions : Tableau récapitulatif de toutes les questions";
                summarySheet.Cells["A12"].Value = "• Distribution des Réponses : Détail complet des réponses pour chaque question";
                summarySheet.Cells["A13"].Value = "• Réponses Texte : Compilation des réponses aux questions ouvertes";
                
                // Style the bullet points
                var bulletRange = summarySheet.Cells["A10:A13"];
                bulletRange.Style.Font.Size = 11;
                bulletRange.Style.Font.Color.SetColor(System.Drawing.Color.DarkBlue);
                bulletRange.Style.WrapText = true;

                // Detailed Section Analysis Sheet (matches PDF structure exactly)
                if (stats.SectionStatistics?.Any() == true)
                {
                    var analysisSheet = package.Workbook.Worksheets.Add("Analyse par Section");
                    
                    analysisSheet.Cells["A1"].Value = "📊 Statistiques par Section";
                    analysisSheet.Cells["A1"].Style.Font.Size = 16;
                    analysisSheet.Cells["A1"].Style.Font.Bold = true;
                    
                    var currentRow = 3;
                    
                    foreach (var section in stats.SectionStatistics)
                    {
                        // Section Title (matches PDF structure)
                        analysisSheet.Cells[$"A{currentRow}"].Value = section.SectionTitle;
                        analysisSheet.Cells[$"A{currentRow}"].Style.Font.Size = 14;
                        analysisSheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
                        analysisSheet.Cells[$"A{currentRow}"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                        analysisSheet.Cells[$"A{currentRow}"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                        
                        // Merge cells for section title
                        analysisSheet.Cells[$"A{currentRow}:E{currentRow}"].Merge = true;
                        currentRow += 2;
                        
                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                // Question text (matches PDF: "Q: question text")
                                analysisSheet.Cells[$"A{currentRow}"].Value = $"Q: {question.QuestionText}";
                                analysisSheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
                                analysisSheet.Cells[$"A{currentRow}:E{currentRow}"].Merge = true;
                                analysisSheet.Cells[$"A{currentRow}"].Style.WrapText = true;
                                currentRow++;
                                
                                // Question details (matches PDF: "   Type: X | Réponses: Y")
                                analysisSheet.Cells[$"B{currentRow}"].Value = $"Type: {question.QuestionType}";
                                analysisSheet.Cells[$"C{currentRow}"].Value = $"Réponses: {question.TotalAnswers}";
                                
                                if (question.AverageScore.HasValue)
                                {
                                    analysisSheet.Cells[$"D{currentRow}"].Value = $"Score moyen: {question.AverageScore:F2}/5";
                                    
                                    // Color code the score
                                    var scoreCell = analysisSheet.Cells[$"D{currentRow}"];
                                    if (question.AverageScore >= 4.0)
                                    {
                                        scoreCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                                        scoreCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGreen);
                                    }
                                    else if (question.AverageScore >= 3.0)
                                    {
                                        scoreCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                                        scoreCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                                    }
                                    else if (question.AverageScore >= 2.0)
                                    {
                                        scoreCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                                        scoreCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);
                                    }
                                    else
                                    {
                                        scoreCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                                        scoreCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightCoral);
                                    }
                                }
                                else
                                {
                                    analysisSheet.Cells[$"D{currentRow}"].Value = "Pas de score (Question texte)";
                                }
                                
                                currentRow += 2; // Space between questions (matches PDF)
                            }
                        }
                        
                        currentRow += 1; // Extra space between sections (matches PDF)
                    }
                    
                    analysisSheet.Cells[analysisSheet.Dimension.Address].AutoFitColumns();
                    // Set reasonable column widths
                    analysisSheet.Column(1).Width = 60; // For question text
                    analysisSheet.Column(2).Width = 20;
                    analysisSheet.Column(3).Width = 20;
                    analysisSheet.Column(4).Width = 25;
                    analysisSheet.Column(5).Width = 20;

                    // Quick Overview Sheet (tabular format)
                    var questionsSheet = package.Workbook.Worksheets.Add("Vue d'ensemble Questions");
                    
                    // Headers
                    questionsSheet.Cells["A1"].Value = "Section";
                    questionsSheet.Cells["B1"].Value = "Question";
                    questionsSheet.Cells["C1"].Value = "Type";
                    questionsSheet.Cells["D1"].Value = "Total Réponses";
                    questionsSheet.Cells["E1"].Value = "Score Moyen";
                    
                    // Header styling
                    using var headerRange = questionsSheet.Cells["A1:E1"];
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGreen);
                    
                    var row = 2;
                    foreach (var section in stats.SectionStatistics)
                    {
                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                questionsSheet.Cells[$"A{row}"].Value = section.SectionTitle;
                                questionsSheet.Cells[$"B{row}"].Value = question.QuestionText;
                                questionsSheet.Cells[$"C{row}"].Value = question.QuestionType;
                                questionsSheet.Cells[$"D{row}"].Value = question.TotalAnswers;
                                questionsSheet.Cells[$"E{row}"].Value = question.AverageScore?.ToString("F2") ?? "N/A";
                                row++;
                            }
                        }
                    }
                    
                    questionsSheet.Cells[questionsSheet.Dimension.Address].AutoFitColumns();

                    // Answer Distribution Sheet
                    var distributionSheet = package.Workbook.Worksheets.Add("Distribution des Réponses");
                    
                    distributionSheet.Cells["A1"].Value = "Distribution des Réponses par Question";
                    distributionSheet.Cells["A1"].Style.Font.Size = 14;
                    distributionSheet.Cells["A1"].Style.Font.Bold = true;
                    
                    // Headers for distribution
                    distributionSheet.Cells["A3"].Value = "Section";
                    distributionSheet.Cells["B3"].Value = "Question";
                    distributionSheet.Cells["C3"].Value = "Type";
                    distributionSheet.Cells["D3"].Value = "Réponse";
                    distributionSheet.Cells["E3"].Value = "Nombre";
                    distributionSheet.Cells["F3"].Value = "Pourcentage";
                    
                    // Header styling for distribution
                    using var distHeaderRange = distributionSheet.Cells["A3:F3"];
                    distHeaderRange.Style.Font.Bold = true;
                    distHeaderRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    distHeaderRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                    
                    var distRow = 4;
                    foreach (var section in stats.SectionStatistics)
                    {
                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                if (question.AnswerDistribution?.Any() == true)
                                {
                                    foreach (var answer in question.AnswerDistribution)
                                    {
                                        distributionSheet.Cells[$"A{distRow}"].Value = section.SectionTitle;
                                        distributionSheet.Cells[$"B{distRow}"].Value = question.QuestionText;
                                        distributionSheet.Cells[$"C{distRow}"].Value = question.QuestionType;
                                        distributionSheet.Cells[$"D{distRow}"].Value = answer.AnswerValue;
                                        distributionSheet.Cells[$"E{distRow}"].Value = answer.Count;
                                        distributionSheet.Cells[$"F{distRow}"].Value = $"{answer.Percentage:F1}%";
                                        distRow++;
                                    }
                                }
                            }
                        }
                    }
                    
                    distributionSheet.Cells[distributionSheet.Dimension.Address].AutoFitColumns();

                    // Text Answers Sheet
                    var textSheet = package.Workbook.Worksheets.Add("Réponses Texte");
                    
                    textSheet.Cells["A1"].Value = "Réponses aux Questions Ouvertes";
                    textSheet.Cells["A1"].Style.Font.Size = 14;
                    textSheet.Cells["A1"].Style.Font.Bold = true;
                    
                    // Headers for text answers
                    textSheet.Cells["A3"].Value = "Section";
                    textSheet.Cells["B3"].Value = "Question";
                    textSheet.Cells["C3"].Value = "Réponse";
                    
                    // Header styling for text
                    using var textHeaderRange = textSheet.Cells["A3:C3"];
                    textHeaderRange.Style.Font.Bold = true;
                    textHeaderRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    textHeaderRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightYellow);
                    
                    var textRow = 4;
                    foreach (var section in stats.SectionStatistics)
                    {
                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                if (question.TextAnswers?.Any() == true)
                                {
                                    foreach (var textAnswer in question.TextAnswers)
                                    {
                                        textSheet.Cells[$"A{textRow}"].Value = section.SectionTitle;
                                        textSheet.Cells[$"B{textRow}"].Value = question.QuestionText;
                                        textSheet.Cells[$"C{textRow}"].Value = textAnswer;
                                        textSheet.Cells[$"C{textRow}"].Style.WrapText = true;
                                        textRow++;
                                    }
                                }
                            }
                        }
                    }
                    
                    textSheet.Cells[textSheet.Dimension.Address].AutoFitColumns();
                    // Set max width for text column to make it readable
                    textSheet.Column(3).Width = Math.Min(textSheet.Column(3).Width, 50);
                }

                summarySheet.Cells[summarySheet.Dimension.Address].AutoFitColumns();
                
                return package.GetAsByteArray();
            });
        }

        public async Task<byte[]> ExportQuestionnaireStatisticsToCsvAsync(QuestionnaireStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                var csv = new StringBuilder();
                
                // Header
                csv.AppendLine($"Analyse Détaillée: {stats.Title}");
                csv.AppendLine($"Généré le,{DateTime.Now:dd/MM/yyyy HH:mm}");
                csv.AppendLine();
                
                // Summary
                csv.AppendLine("=== RÉSUMÉ ===");
                csv.AppendLine($"ID Publication,{stats.PublicationId}");
                csv.AppendLine($"Total soumissions,{stats.TotalSubmissions}");
                csv.AppendLine($"Taux de completion,{stats.CompletionRate:F1}%");
                csv.AppendLine($"Date début,{stats.StartDate:dd/MM/yyyy}");
                csv.AppendLine($"Date fin,{stats.EndDate:dd/MM/yyyy}");
                csv.AppendLine();
                
                // Detailed Section Analysis (matches PDF structure)
                csv.AppendLine("=== ANALYSE DÉTAILLÉE PAR SECTION ===");
                
                if (stats.SectionStatistics?.Any() == true)
                {
                    foreach (var section in stats.SectionStatistics)
                    {
                        csv.AppendLine();
                        csv.AppendLine($"SECTION: {section.SectionTitle}");
                        csv.AppendLine("=" + new string('=', section.SectionTitle.Length + 9));
                        
                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                var questionText = question.QuestionText?.Replace(",", ";").Replace("\"", "\"\"");
                                csv.AppendLine($"Q: {questionText}");
                                csv.AppendLine($"   Type: {question.QuestionType} | Réponses: {question.TotalAnswers}");
                                
                                if (question.AverageScore.HasValue)
                                {
                                    string scoreInterpretation = question.AverageScore switch
                                    {
                                        >= 4.0 => "Excellent",
                                        >= 3.0 => "Bon", 
                                        >= 2.0 => "Moyen",
                                        >= 1.0 => "Faible",
                                        _ => "Très Faible"
                                    };
                                    csv.AppendLine($"   Score moyen: {question.AverageScore:F2}/5 ({scoreInterpretation})");
                                }
                                else
                                {
                                    csv.AppendLine("   Pas de score (Question texte)");
                                }
                                
                                csv.AppendLine(); // Space between questions
                            }
                        }
                    }
                }
                
                csv.AppendLine();
                
                // Quick Overview Table
                csv.AppendLine("=== VUE D'ENSEMBLE DES QUESTIONS ===");
                csv.AppendLine("Section,Question,Type,Total Réponses,Score Moyen");
                
                if (stats.SectionStatistics?.Any() == true)
                {
                    foreach (var section in stats.SectionStatistics)
                    {
                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                var questionText = question.QuestionText?.Replace(",", ";").Replace("\"", "\"\"");
                                csv.AppendLine($"\"{section.SectionTitle}\",\"{questionText}\",{question.QuestionType},{question.TotalAnswers},{question.AverageScore?.ToString("F2") ?? "N/A"}");
                            }
                        }
                    }
                }
                
                csv.AppendLine();
                
                // Answer Distribution
                csv.AppendLine("=== DISTRIBUTION DES RÉPONSES ===");
                csv.AppendLine("Section,Question,Type,Réponse,Nombre,Pourcentage");
                
                if (stats.SectionStatistics?.Any() == true)
                {
                    foreach (var section in stats.SectionStatistics)
                    {
                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                if (question.AnswerDistribution?.Any() == true)
                                {
                                    foreach (var answer in question.AnswerDistribution)
                                    {
                                        var questionText = question.QuestionText?.Replace(",", ";").Replace("\"", "\"\"");
                                        var answerValue = answer.AnswerValue?.Replace(",", ";").Replace("\"", "\"\"");
                                        csv.AppendLine($"\"{section.SectionTitle}\",\"{questionText}\",{question.QuestionType},\"{answerValue}\",{answer.Count},{answer.Percentage:F1}%");
                                    }
                                }
                            }
                        }
                    }
                }
                
                csv.AppendLine();
                
                // Text Answers
                csv.AppendLine("=== RÉPONSES TEXTE ===");
                csv.AppendLine("Section,Question,Réponse");
                
                if (stats.SectionStatistics?.Any() == true)
                {
                    foreach (var section in stats.SectionStatistics)
                    {
                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                if (question.TextAnswers?.Any() == true)
                                {
                                    foreach (var textAnswer in question.TextAnswers)
                                    {
                                        var questionText = question.QuestionText?.Replace(",", ";").Replace("\"", "\"\"");
                                        var cleanTextAnswer = textAnswer?.Replace(",", ";").Replace("\"", "\"\"");
                                        csv.AppendLine($"\"{section.SectionTitle}\",\"{questionText}\",\"{cleanTextAnswer}\"");
                                    }
                                }
                            }
                        }
                    }
                }
                
                return Encoding.UTF8.GetBytes(csv.ToString());
            });
        }

        public async Task<byte[]> ExportSubmissionsToExcelAsync(List<SubmissionExportDto> submissions, string title)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using var package = new ExcelPackage();
                var sheet = package.Workbook.Worksheets.Add("Données Brutes");
                
                sheet.Cells["A1"].Value = $"📊 Données Brutes: {title}";
                sheet.Cells["A1"].Style.Font.Size = 16;
                sheet.Cells["A1"].Style.Font.Bold = true;
                
                if (submissions.Any())
                {
                    // Headers
                    sheet.Cells["A3"].Value = "ID Utilisateur";
                    sheet.Cells["B3"].Value = "Date Soumission";
                    sheet.Cells["C3"].Value = "Section";
                    sheet.Cells["D3"].Value = "Question";
                    sheet.Cells["E3"].Value = "Type";
                    sheet.Cells["F3"].Value = "Réponse Numérique";
                    sheet.Cells["G3"].Value = "Réponse Texte";
                    
                    // Header styling
                    using var headerRange = sheet.Cells["A3:G3"];
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                    
                    var row = 4;
                    foreach (var submission in submissions)
                    {
                        foreach (var section in submission.Sections)
                        {
                            foreach (var answer in section.Answers)
                            {
                                sheet.Cells[$"A{row}"].Value = submission.UserId;
                                sheet.Cells[$"B{row}"].Value = submission.SubmittedAt.ToString("dd/MM/yyyy HH:mm");
                                sheet.Cells[$"C{row}"].Value = section.Title;
                                sheet.Cells[$"D{row}"].Value = answer.Wording;
                                sheet.Cells[$"E{row}"].Value = GetQuestionTypeName(answer.Type);
                                sheet.Cells[$"F{row}"].Value = answer.ValueNumber?.ToString() ?? "";
                                sheet.Cells[$"G{row}"].Value = answer.ValueText ?? "";
                                row++;
                            }
                        }
                    }
                    
                    sheet.Cells[sheet.Dimension.Address].AutoFitColumns();
                }
                
                return package.GetAsByteArray();
            });
        }

        public async Task<byte[]> ExportSubmissionsToCsvAsync(List<SubmissionExportDto> submissions)
        {
            return await Task.Run(() =>
            {
                var csv = new StringBuilder();
                
                csv.AppendLine("Données Brutes des Soumissions");
                csv.AppendLine($"Généré le,{DateTime.Now:dd/MM/yyyy HH:mm}");
                csv.AppendLine();
                
                csv.AppendLine("ID Utilisateur,Date Soumission,Section,Question,Type,Réponse Numérique,Réponse Texte");
                
                foreach (var submission in submissions)
                {
                    foreach (var section in submission.Sections)
                    {
                        foreach (var answer in section.Answers)
                        {
                            csv.AppendLine($"{submission.UserId},{submission.SubmittedAt:dd/MM/yyyy HH:mm},{section.Title},{answer.Wording},{GetQuestionTypeName(answer.Type)},{answer.ValueNumber?.ToString() ?? ""},{answer.ValueText ?? ""}");
                        }
                    }
                }
                
                return Encoding.UTF8.GetBytes(csv.ToString());
            });
        }

        private PdfPCell CreateCell(string text, Font font, BaseColor backgroundColor)
        {
            var cell = new PdfPCell(new Phrase(text, font))
            {
                BackgroundColor = backgroundColor,
                Padding = 8,
                HorizontalAlignment = Element.ALIGN_LEFT
            };
            return cell;
        }

        private string GetQuestionTypeName(int type)
        {
            return type switch
            {
                1 => "Échelle",
                2 => "Oui/Non",
                3 => "Texte",
                _ => "Inconnu"
            };
        }
    }
} 