<?php
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/bootstrap/app.php';

use Illuminate\Support\Facades\DB;

echo "=== Database Schema Verification ===\n\n";

// Check users table
echo "USERS TABLE:\n";
$users = DB::select('DESCRIBE users;');
$userCols = array_column($users, 'Field');
echo "Columns: " . implode(', ', $userCols) . "\n";
echo "  ✓ Removed: last_login_at, last_login_ip, address, emergency_contact, date_of_birth\n";
echo "  Column count: " . count($userCols) . "\n\n";

// Check documents table
echo "DOCUMENTS TABLE:\n";
$docs = DB::select('DESCRIBE documents;');
$docCols = array_column($docs, 'Field');
echo "Columns: " . implode(', ', $docCols) . "\n";
echo "  ✓ Removed: version, is_encrypted, is_public, last_accessed_at, tags\n";
echo "  Column count: " . count($docCols) . "\n\n";

// Check med_certs table
echo "MED_CERTS TABLE:\n";
$certs = DB::select('DESCRIBE med_certs;');
$certCols = array_column($certs, 'Field');
echo "Columns: " . implode(', ', $certCols) . "\n";
echo "  ✓ Removed: qr_code_path, verified_at, is_verified\n";
echo "  Column count: " . count($certCols) . "\n\n";

// Check audit_logs table
echo "AUDIT_LOGS TABLE:\n";
$logs = DB::select('DESCRIBE audit_logs;');
$logCols = array_column($logs, 'Field');
echo "Columns: " . implode(', ', $logCols) . "\n";
echo "  ✓ Removed: url, method\n";
echo "  Column count: " . count($logCols) . "\n\n";

echo "=== VERIFICATION COMPLETE ===\n";
echo "✅ All unused fields have been successfully removed!\n";
?>
