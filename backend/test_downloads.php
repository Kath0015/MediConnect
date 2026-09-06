<?php
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/bootstrap/app.php';

use App\Models\Document;
use Illuminate\Support\Facades\Storage;

echo "=== Document Download Verification ===\n\n";

$documents = Document::all();

if ($documents->count() === 0) {
    echo "❌ No documents found in database\n";
    exit(1);
}

echo "Total documents: {$documents->count()}\n\n";

foreach ($documents as $doc) {
    echo "Document ID: {$doc->id}\n";
    echo "  Name: {$doc->name}\n";
    echo "  File: {$doc->file_name}\n";
    echo "  Path: {$doc->path}\n";
    echo "  Size: {$doc->size} bytes\n";
    echo "  MIME: {$doc->mime_type}\n";
    echo "  Checksum: {$doc->checksum}\n";
    
    // Check if file exists
    if (Storage::exists($doc->path)) {
        echo "  ✅ File EXISTS and is downloadable\n";
        
        // Verify file size
        $actualSize = Storage::size($doc->path);
        if ($actualSize === $doc->size) {
            echo "  ✅ File size matches database ({$actualSize} bytes)\n";
        } else {
            echo "  ❌ File size mismatch! DB: {$doc->size}, Actual: {$actualSize}\n";
        }
    } else {
        echo "  ❌ File NOT FOUND - Cannot download\n";
    }
    
    echo "\n";
}

echo "=== Summary ===\n";
$downloadable = $documents->filter(function($doc) {
    return Storage::exists($doc->path);
})->count();

echo "Downloadable documents: {$downloadable}/{$documents->count()}\n";

if ($downloadable === $documents->count()) {
    echo "✅ ALL DOCUMENTS ARE DOWNLOADABLE\n";
    exit(0);
} else {
    echo "❌ SOME DOCUMENTS ARE MISSING\n";
    exit(1);
}
?>
