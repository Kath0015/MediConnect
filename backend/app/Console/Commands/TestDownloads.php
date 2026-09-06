<?php

namespace App\Console\Commands;

use App\Models\Document;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class TestDownloads extends Command
{
    protected $signature = 'downloads:test';
    protected $description = 'Test if all documents can be downloaded';

    public function handle()
    {
        $this->info('=== Document Download Verification ===');
        $this->newLine();

        $documents = Document::all();

        if ($documents->count() === 0) {
            $this->error('❌ No documents found in database');
            return 1;
        }

        $this->info("Total documents: {$documents->count()}");
        $this->newLine();

        $downloadableCount = 0;

        foreach ($documents as $doc) {
            $this->line("Document ID: {$doc->id}");
            $this->line("  Name: {$doc->name}");
            $this->line("  File: {$doc->file_name}");
            $this->line("  Path: {$doc->path}");
            $this->line("  Size: {$doc->size} bytes");
            $this->line("  MIME: {$doc->mime_type}");
            $this->line("  Checksum: {$doc->checksum}");

            // Check if file exists
            if (Storage::exists($doc->path)) {
                $this->line('  ✅ File EXISTS and is downloadable');
                $downloadableCount++;

                // Verify file size
                $actualSize = Storage::size($doc->path);
                if ($actualSize === $doc->size) {
                    $this->line("  ✅ File size matches database ({$actualSize} bytes)");
                } else {
                    $this->line("  ❌ File size mismatch! DB: {$doc->size}, Actual: {$actualSize}");
                }
            } else {
                $this->line('  ❌ File NOT FOUND - Cannot download');
            }

            $this->newLine();
        }

        $this->info('=== Summary ===');
        $this->info("Downloadable documents: {$downloadableCount}/{$documents->count()}");

        if ($downloadableCount === $documents->count()) {
            $this->info('✅ ALL DOCUMENTS ARE DOWNLOADABLE');
            return 0;
        } else {
            $this->error('❌ SOME DOCUMENTS ARE MISSING');
            return 1;
        }
    }
}
