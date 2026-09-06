<?php
// Script to create sample lab documents for testing downloads

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/bootstrap/app.php';

use App\Models\Document;
use App\Models\DocumentType;
use App\Models\Patient;
use Illuminate\Support\Facades\Storage;

// Get first patient or create one
$patient = Patient::first();
if (!$patient) {
    echo "No patient found in database\n";
    exit(1);
}

echo "Creating sample documents for patient: " . $patient->user->name . "\n";

// Create document types
$labResultType = DocumentType::firstOrCreate(
    ['name' => 'Laboratory Result'],
    ['is_active' => true]
);

echo "Document type created: {$labResultType->name}\n";

// Create sample PDF content (simple PDF for testing)
$pdfContent = <<<'PDF'
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 500 >>
stream
BT
/F1 12 Tf
50 750 Td
(Complete Blood Count Result) Tj
0 -30 Td
(Patient Laboratory Test Report) Tj
0 -50 Td
(Test Date: September 6, 2026) Tj
0 -20 Td
(WBC: 7.5 K/uL) Tj
0 -20 Td
(RBC: 4.8 M/uL) Tj
0 -20 Td
(Hemoglobin: 14.5 g/dL) Tj
0 -20 Td
(Hematocrit: 43.5%) Tj
0 -20 Td
(Platelets: 250 K/uL) Tj
0 -30 Td
(Status: NORMAL) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
0000000303 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
856
%%EOF
PDF;

// Create sample documents
$sampleDocs = [
    'Complete Blood Count Result' => 'Routine annual physical exam panel.',
    'Urinalysis Report' => 'Requested for pre-employment requirements.',
    'Lipid Profile' => 'Cholesterol and lipid screening test.',
];

foreach ($sampleDocs as $name => $description) {
    $path = "patients/{$patient->id}/documents/" . str_replace(' ', '_', strtolower($name)) . '.pdf';
    
    // Create the directory if it doesn't exist
    if (!Storage::exists(dirname($path))) {
        Storage::makeDirectory(dirname($path));
    }
    
    // Store the PDF file
    Storage::put($path, $pdfContent);
    
    // Create document record
    $document = $patient->documents()->create([
        'name' => $name,
        'file_name' => $name . '.pdf',
        'mime_type' => 'application/pdf',
        'size' => strlen($pdfContent),
        'description' => $description,
        'document_type_id' => $labResultType->id,
        'disk' => config('filesystems.default', 'local'),
        'path' => $path,
        'uploaded_by' => $patient->user_id,
        'checksum' => md5($pdfContent),
    ]);
    
    echo "✓ Created document: {$document->name} (ID: {$document->id})\n";
    echo "  Path: {$path}\n";
}

echo "\nDone! Sample documents created successfully.\n";
?>
