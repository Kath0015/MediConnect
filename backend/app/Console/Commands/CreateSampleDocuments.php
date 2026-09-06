<?php

namespace App\Console\Commands;

use App\Models\Document;
use App\Models\DocumentType;
use App\Models\Patient;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CreateSampleDocuments extends Command
{
    protected $signature = 'documents:create-samples';
    protected $description = 'Create sample lab documents for testing downloads';

    public function handle()
    {
        $patient = Patient::first();
        if (!$patient) {
            $this->error('No patient found in database');
            return 1;
        }

        $this->info('Creating sample documents for patient: ' . $patient->user->name);

        // Create document type
        $labResultType = DocumentType::firstOrCreate(
            ['name' => 'Laboratory Result'],
            ['is_active' => true]
        );

        $this->info("Document type: {$labResultType->name}");

        // Create sample PDF content
        $pdfContent = $this->generateSamplePdf();

        // Sample documents
        $sampleDocs = [
            'Complete Blood Count Result' => 'Routine annual physical exam panel.',
            'Urinalysis Report' => 'Requested for pre-employment requirements.',
            'Lipid Profile' => 'Cholesterol and lipid screening test.',
        ];

        foreach ($sampleDocs as $name => $description) {
            $filename = str_replace(' ', '_', strtolower($name)) . '.pdf';
            $path = "patients/{$patient->id}/documents/{$filename}";

            // Create directory if needed
            if (!Storage::exists(dirname($path))) {
                Storage::makeDirectory(dirname($path));
            }

            // Store file
            Storage::put($path, $pdfContent);

            // Create document record
            $document = $patient->documents()->create([
                'name' => $name,
                'file_name' => $name . '.pdf',
                'mime_type' => 'application/pdf',
                'size' => strlen($pdfContent),
                'description' => $description,
                'disk' => config('filesystems.default', 'local'),
                'path' => $path,
                'uploaded_by' => $patient->user_id,
                'checksum' => md5($pdfContent),
            ]);

            $this->info("✓ Created: {$document->name} (ID: {$document->id})");
            $this->line("  Path: {$path}");
        }

        $this->info('Sample documents created successfully!');
        return 0;
    }

    private function generateSamplePdf()
    {
        return <<<'PDF'
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
(Laboratory Test Report) Tj
0 -30 Td
(Panacea Medical Clinic) Tj
0 -50 Td
(Test Date: September 6, 2026) Tj
0 -20 Td
(Patient: Maria Santos) Tj
0 -40 Td
(Test Results:) Tj
0 -20 Td
(WBC: 7.5 K/uL - Normal) Tj
0 -20 Td
(RBC: 4.8 M/uL - Normal) Tj
0 -20 Td
(Hemoglobin: 14.5 g/dL - Normal) Tj
0 -20 Td
(Hematocrit: 43.5% - Normal) Tj
0 -20 Td
(Platelets: 250 K/uL - Normal) Tj
0 -30 Td
(Overall Status: NORMAL) Tj
0 -20 Td
(Clinician Signature: Dr. Juan dela Cruz) Tj
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
    }
}
