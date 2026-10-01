<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// CSRF cookie endpoint for SPA
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['success' => true]);
})->middleware(['web']);
