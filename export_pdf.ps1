$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $docxPath = "c:\Users\PUSHKAR\Desktop\Neighborly\Neighborly_Project_Report.docx"
    $pdfPath = "c:\Users\PUSHKAR\Desktop\Neighborly\Neighborly_Project_Report.pdf"
    $doc = $word.Documents.Open($docxPath)
    $wdFormatPDF = 17
    $doc.SaveAs([ref]$pdfPath, [ref]$wdFormatPDF)
    $doc.Close()
    Write-Output "PDF_EXPORTED_SUCCESSFULLY"
} catch {
    Write-Error $_.Exception.Message
} finally {
    $word.Quit()
}
