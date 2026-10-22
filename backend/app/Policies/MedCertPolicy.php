<?php

namespace App\Policies;

use App\Models\MedCert;
use App\Models\User;

class MedCertPolicy
{
    /**
     * Determine if the user can view the medcert.
     */
    public function view(User $user, MedCert $medCert)
    {
        // Admins and clinicians (staff) can view any medcert
        if ($user->isAdmin() || $user->isClinician()) {
            return true;
        }

        // Patients can view their own medcerts
        if ($user->isPatient() && $medCert->patient?->user_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can download the medcert PDF.
     */
    public function downloadPdf(User $user, MedCert $medCert)
    {
        if ($user->isClinician()) {
            return true;
        }

        if ($user->isPatient() && $medCert->patient?->user_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can upload a medcert PDF.
     */
    public function uploadPdf(User $user, MedCert $medCert)
    {
        return $user->isClinician();
    }

    /**
     * Determine if the user can approve a medcert.
     */
    public function approve(User $user, MedCert $medCert)
    {
        // Only clinical staff can approve
        if (!$user->isClinician()) {
            return false;
        }

        // Only pending medcerts can be approved
        if ($medCert->status !== 'pending') {
            return false;
        }

        return true;
    }

    /**
     * Determine if the user can reject a medcert.
     */
    public function reject(User $user, MedCert $medCert)
    {
        // Only clinical staff can reject
        if (!$user->isClinician()) {
            return false;
        }

        // Only pending medcerts can be rejected
        if ($medCert->status !== 'pending') {
            return false;
        }

        return true;
    }

    /**
     * Determine if the user can update a medcert.
     */
    public function update(User $user, MedCert $medCert)
    {
        // Clinical staff may correct request content before release.
        if ($user->isClinician() && in_array($medCert->status, ['pending', 'approved'], true)) {
            return true;
        }

        // Patients can update their own pending medcerts
        if ($user->isPatient() && $medCert->patient?->user_id === $user->id && $medCert->status === 'pending') {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can delete a medcert.
     */
    public function delete(User $user, MedCert $medCert)
    {
        // Patients can delete their own pending medcerts
        if ($user->isPatient() && $medCert->patient?->user_id === $user->id && $medCert->status === 'pending') {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can mark a medcert as no-show.
     */
    public function markNoShow(User $user, MedCert $medCert)
    {
        // Only clinical staff can mark as no-show
        if (!$user->isClinician()) {
            return false;
        }

        // Only approved medcerts can be marked as no-show
        if ($medCert->status !== 'approved') {
            return false;
        }

        return true;
    }

    /**
     * Determine if the user can mark a medcert as completed.
     */
    public function markCompleted(User $user, MedCert $medCert)
    {
        // Only clinical staff can mark as completed
        if (!$user->isClinician()) {
            return false;
        }

        // Only approved medcerts can be marked as completed
        if ($medCert->status !== 'approved') {
            return false;
        }

        return true;
    }
}
