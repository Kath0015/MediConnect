<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $password = env('ADMIN_PASSWORD');
        $admin = User::where('email', 'parenasadmin@gmail.com')->first();

        if (!$password && !$admin) {
            throw new \RuntimeException('ADMIN_PASSWORD must be set before running AdminSeeder.');
        }

        Role::firstOrCreate(['name' => 'admin']);

        $admin ??= new User(['email' => 'parenasadmin@gmail.com']);
        $admin->name = $admin->name ?: 'Parenas Admin';
        if ($password) {
            $admin->password = Hash::make($password);
        }
        $admin->email_verified_at = $admin->email_verified_at ?? now();
        $admin->is_active = true;
        $admin->save();
        
        $admin->assignRole('admin');

        $this->command->info($password
            ? 'Admin account created or password updated successfully.'
            : 'Existing Admin account preserved; password was not changed.');
        $this->command->info('Email: parenasadmin@gmail.com');
    }
}
