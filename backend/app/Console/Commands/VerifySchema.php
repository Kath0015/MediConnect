<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class VerifySchema extends Command
{
    protected $signature = 'schema:verify';
    protected $description = 'Verify that unused database fields have been removed';

    public function handle()
    {
        $this->info('=== Database Schema Verification ===');
        $this->newLine();

        // Check users table
        $this->info('USERS TABLE:');
        $users = DB::select('DESCRIBE users;');
        $userCols = array_column($users, 'Field');
        $this->line('Columns: ' . implode(', ', $userCols));
        $this->line('  ✓ Removed: last_login_at, last_login_ip, address, emergency_contact, date_of_birth');
        $this->line('  Column count: ' . count($userCols));
        $this->newLine();

        // Check documents table
        $this->info('DOCUMENTS TABLE:');
        $docs = DB::select('DESCRIBE documents;');
        $docCols = array_column($docs, 'Field');
        $this->line('Columns: ' . implode(', ', $docCols));
        $this->line('  ✓ Removed: version, is_encrypted, is_public, last_accessed_at, tags');
        $this->line('  Column count: ' . count($docCols));
        $this->newLine();

        // Check med_certs table
        $this->info('MED_CERTS TABLE:');
        $certs = DB::select('DESCRIBE med_certs;');
        $certCols = array_column($certs, 'Field');
        $this->line('Columns: ' . implode(', ', $certCols));
        $this->line('  ✓ Removed: qr_code_path, verified_at, is_verified');
        $this->line('  Column count: ' . count($certCols));
        $this->newLine();

        // Check audit_logs table
        $this->info('AUDIT_LOGS TABLE:');
        $logs = DB::select('DESCRIBE audit_logs;');
        $logCols = array_column($logs, 'Field');
        $this->line('Columns: ' . implode(', ', $logCols));
        $this->line('  ✓ Removed: url, method');
        $this->line('  Column count: ' . count($logCols));
        $this->newLine();

        // Verify specific fields don't exist
        $this->info('FIELD REMOVAL VERIFICATION:');
        
        $missingFields = [];
        
        // Check users table
        if ($this->columnExists('users', 'last_login_at')) {
            $missingFields[] = 'users.last_login_at';
        }
        if ($this->columnExists('users', 'last_login_ip')) {
            $missingFields[] = 'users.last_login_ip';
        }
        if ($this->columnExists('users', 'address')) {
            $missingFields[] = 'users.address';
        }
        if ($this->columnExists('users', 'emergency_contact')) {
            $missingFields[] = 'users.emergency_contact';
        }
        if ($this->columnExists('users', 'date_of_birth')) {
            $missingFields[] = 'users.date_of_birth';
        }

        // Check documents table
        if ($this->columnExists('documents', 'version')) {
            $missingFields[] = 'documents.version';
        }
        if ($this->columnExists('documents', 'is_encrypted')) {
            $missingFields[] = 'documents.is_encrypted';
        }
        if ($this->columnExists('documents', 'is_public')) {
            $missingFields[] = 'documents.is_public';
        }
        if ($this->columnExists('documents', 'last_accessed_at')) {
            $missingFields[] = 'documents.last_accessed_at';
        }
        if ($this->columnExists('documents', 'tags')) {
            $missingFields[] = 'documents.tags';
        }

        // Check med_certs table
        if ($this->columnExists('med_certs', 'qr_code_path')) {
            $missingFields[] = 'med_certs.qr_code_path';
        }
        if ($this->columnExists('med_certs', 'verified_at')) {
            $missingFields[] = 'med_certs.verified_at';
        }
        if ($this->columnExists('med_certs', 'is_verified')) {
            $missingFields[] = 'med_certs.is_verified';
        }

        // Check audit_logs table
        if ($this->columnExists('audit_logs', 'url')) {
            $missingFields[] = 'audit_logs.url';
        }
        if ($this->columnExists('audit_logs', 'method')) {
            $missingFields[] = 'audit_logs.method';
        }

        if (count($missingFields) > 0) {
            $this->error('❌ ERROR: The following fields still exist:');
            foreach ($missingFields as $field) {
                $this->error('  - ' . $field);
            }
            return 1;
        }

        $this->newLine();
        $this->info('=== VERIFICATION COMPLETE ===');
        $this->info('✅ All unused fields have been successfully removed!');
        return 0;
    }

    private function columnExists($table, $column)
    {
        return DB::getSchemaBuilder()->hasColumn($table, $column);
    }
}
