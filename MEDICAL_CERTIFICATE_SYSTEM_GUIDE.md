# MediConnect Medical Certificate Request System

## Overview
The medical certificate system is a **request-based workflow** where:
1. **Patients request** medical certificates with specific dates and reasons
2. **Staff approves or rejects** the requests
3. **Staff uploads** the official certificate PDF
4. **Patients download** the certificate

---

## Complete Workflow

### 1. Patient Requests Certificate
**Location:** `Patient Dashboard → Request Certificate`

**Frontend:** `frontend/src/pages/patient/RequestCertificate.jsx`

**What patients provide:**
- Certificate Type (Dropdown - loaded from `/api/medcert/types`)
  - Sick Leave
  - Fitness Clearance
  - Medical Excuse
  - Vaccination
  - Other
- Start Date (Calendar picker)
- End Date (Calendar picker)
- Purpose/Reason (Text field) - Why they need the certificate
- Recommendations (Optional) - Any special notes

**API Call:**
```
POST /api/med-certs
{
  "type": "sick_leave",
  "start_date": "2025-10-20",
  "end_date": "2025-10-25",
  "purpose": "Had severe flu",
  "recommendations": null
}
```

**What happens:**
- System auto-sets `patient_id` to patient's ID
- System auto-sets `requested_by` to patient's user ID
- System generates a unique `certificate_number` (format: MC-2025-000001)
- Status is set to `pending`
- Event `AppointmentCreatedEvent` is triggered
- Audit log entry created: `medcert_requested`

---

### 2. Patient Views Request History
**Same page** shows all their certificate requests with:
- Status badge (Pending, Approved, Rejected, Completed, No-Show)
- Certificate type
- Date range
- Date requested
- Download button (only enabled for approved certificates with PDF uploaded)

**API Call:**
```
GET /api/med-certs?per_page=50
```

---

### 3. Staff Reviews & Approves/Rejects
**Location:** `Staff Dashboard → Medical Certificate Management → Request Management`

**Frontend:** `frontend/src/pages/clinician/RequestManagement.jsx`

**Staff view shows:**
- All pending certificate requests (tabbed by status)
- Patient name, email
- Type, date range, reason
- Action buttons

**To Approve:**
```
POST /api/med-certs/{id}/approve
{
  "pickup_date": "2025-10-26",
  "recommendations": "Please rest for 3 days"
}
```

**To Reject:**
```
POST /api/med-certs/{id}/reject
{
  "reason": "Certificate details don't match medical records"
}
```

**What happens on approval:**
- Status changes to `approved`
- `approved_by` is set to staff member's user ID
- `approved_at` timestamp is recorded
- `verification_hash` is generated (UUID for public verification)
- Patient receives approval email notification
- Audit log: `medcert_approved`

---

### 4. Staff Uploads Certificate PDF
**Location:** `Admin Dashboard → Medical Certificates`

**Frontend:** `frontend/src/pages/admin/MedCerts.jsx`

**Requirements:**
- Certificate status must be: `approved`, `completed`, or `no-show`
- File must be PDF format
- Max file size: 10MB

**API Call:**
```
POST /api/med-certs/{id}/upload
FormData:
  file: <PDF file>
```

**What happens:**
- Old PDF is deleted from storage (if exists)
- New PDF stored at: `storage/med-certs/{id}/medcert-{certificate_number}.pdf`
- `pdf_path` column updated
- Audit log: `medcert_pdf_uploaded`

---

### 5. Patient Downloads Certificate
**Location:** `Patient Dashboard → Request Certificate → [Approved Certificate]`

**API Call:**
```
GET /api/med-certs/{id}/download
```

**What's returned:**
- If custom PDF uploaded: Returns the uploaded file
- If no custom PDF: Dynamically generates PDF from template with patient info

**Audit log:** `medcert_downloaded`

---

## Database Schema

**Table:** `med_certs`

### Core Fields
| Field | Type | Description |
|-------|------|-------------|
| id | ID | Primary key |
| patient_id | Foreign Key | Links to patient |
| requested_by | Foreign Key (users) | Who requested it (usually patient) |
| approved_by | Foreign Key (users) | Staff who approved |
| certificate_number | String (Unique) | MC-YYYY-XXXXXX format |

### Certificate Details
| Field | Type | Description |
|-------|------|-------------|
| type | Enum | sick_leave, fitness_clearance, medical_excuse, vaccination, other |
| start_date | Date | Certificate validity start |
| end_date | Date | Certificate validity end |
| duration_days | Integer | Auto-calculated |
| purpose | Text | Medical reason for certificate |
| recommendations | Text | Staff notes/recommendations |

### Status & Workflow
| Field | Type | Description |
|-------|------|-------------|
| status | Enum | pending, approved, rejected, completed, no-show, revoked |
| rejection_reason | Text | Why rejected |
| approved_at | Timestamp | When approved |
| revoked_at | Timestamp | When revoked |
| pickup_date | Date | Optional pickup date |

### File Storage
| Field | Type | Description |
|-------|------|-------------|
| pdf_path | String | Path to uploaded PDF in storage |
| verification_hash | String (Unique) | UUID for public verification |
| is_verified | Boolean | Verification flag |
| verified_at | Timestamp | When verified |

---

## API Endpoints

### Patient Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/med-certs` | Request new certificate |
| GET | `/api/med-certs` | View my certificate requests |
| GET | `/api/med-certs/{id}` | View specific request details |
| GET | `/api/med-certs/{id}/download` | Download approved certificate PDF |

### Staff Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/med-certs` | View all certificate requests |
| POST | `/api/med-certs/{id}/approve` | Approve request |
| POST | `/api/med-certs/{id}/reject` | Reject request |
| POST | `/api/med-certs/{id}/completed` | Mark as completed |
| POST | `/api/med-certs/{id}/no-show` | Mark as no-show |
| POST | `/api/med-certs/{id}/revoke` | Revoke approved certificate |
| POST | `/api/med-certs/{id}/upload` | Upload certificate PDF |
| GET | `/api/med-certs/{id}/download` | Download certificate PDF |

### Public Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/med-certs/{hash}/verify` | Public verification (no auth needed) |
| GET | `/api/medcert/types` | Get available certificate types |

---

## Status Workflow Diagram

```
PENDING
  ├─ [Staff Approves] → APPROVED
  │    ├─ [Staff Uploads PDF] → APPROVED (with pdf_path)
  │    ├─ [Mark Completed] → COMPLETED
  │    ├─ [Mark No-Show] → NO-SHOW
  │    └─ [Revoke] → REVOKED
  │
  └─ [Staff Rejects] → REJECTED
```

**Patient Download Available:** Only when status = APPROVED AND pdf_path is set

---

## File Locations

### Frontend Components
- **Patient Request Page:** `frontend/src/pages/patient/RequestCertificate.jsx`
- **Staff Management Page:** `frontend/src/pages/clinician/RequestManagement.jsx`
- **Admin Upload Page:** `frontend/src/pages/admin/MedCerts.jsx`

### Backend
- **Model:** `backend/app/Models/MedCert.php`
- **Controller:** `backend/app/Http/Controllers/Api/V1/MedCertController.php`
- **Requests:** 
  - `backend/app/Http/Requests/StoreMedCertRequest.php`
  - `backend/app/Http/Requests/UpdateMedCertRequest.php`
- **Database:** `backend/database/migrations/2025_10_25_093748_create_med_certs_table.php`

### Routes
- **API Routes:** `backend/routes/api.php` (lines 140-148 for med-certs)

### Events & Notifications
- **Events:** `backend/app/Events/MedCertApproved.php`, `MedCertRejected.php`
- **Listeners:** `backend/app/Listeners/SendMedCertApprovedNotification.php`, `SendMedCertRejectedNotification.php`
- **Email Templates:** `backend/resources/views/emails/medcert-approved.blade.php`, `medcert-rejected.blade.php`

### PDF Generation
- **PDF Template:** `backend/resources/views/med-certs/pdf.blade.php`

---

## Key Features

✅ **Request-Based System**
- Patients submit requests
- Staff reviews and approves/rejects
- Clear audit trail

✅ **File Management**
- Staff can upload custom PDFs
- System generates PDF if none uploaded
- All files stored securely

✅ **Download Control**
- Only approved certificates with PDFs can be downloaded
- Audit logs all downloads

✅ **Status Tracking**
- 6 status types: pending, approved, rejected, completed, no-show, revoked
- Clear status badges in UI

✅ **Notifications**
- Automatic emails on approval/rejection
- Event-driven architecture

✅ **Public Verification**
- Anyone can verify certificate using verification hash
- No authentication required

✅ **Audit Logging**
- All actions logged: requested, approved, rejected, uploaded, downloaded, revoked

---

## How to Use

### For Patients

1. **Request Certificate:**
   - Navigate to Patient Dashboard
   - Click "Request Certificate"
   - Select type, dates, and reason
   - Click "Submit Request"
   - See "Request submitted" confirmation

2. **Check Status:**
   - View "My Requests" tab
   - See status badges: Pending, Approved, Rejected

3. **Download Certificate:**
   - Once status is "Approved"
   - Click "Download" button
   - PDF downloads to computer

### For Staff

1. **Review Requests:**
   - Navigate to Medical Certificate Management
   - View pending requests in list
   - Click on request to see details

2. **Approve/Reject:**
   - Click "Approve" or "Reject" button
   - Add optional notes
   - Click confirm
   - Patient gets email notification

3. **Upload Certificate:**
   - Go to Admin Dashboard → Medical Certificates
   - Find the approved request
   - Click "Upload PDF" button
   - Select PDF file from computer
   - Click upload

4. **Track Status:**
   - Use tabs to filter by status
   - See completed, no-show, revoked
   - Download any certificate as needed

---

## Validation Rules

### Creating Request (Patient)
- Type: Required, string
- Start Date: Required, valid date
- End Date: Required, date after/equal start date
- Purpose: Required, max 1000 characters
- Max Duration: 30 days

### Approving Request (Staff)
- Pickup Date: Optional, date after today
- Recommendations: Optional, max 1000 characters

### Uploading PDF (Staff)
- File: Required, PDF only
- Max Size: 10MB

---

## What to Troubleshoot

### Patient Can't Download Certificate
- ✓ Status must be "Approved" (check status badge)
- ✓ Staff must have uploaded a PDF (or system generates it)
- ✓ Check PDF path exists in database

### Certificate Not Showing in List
- ✓ Check patient's patient profile exists
- ✓ Check certificate is linked to patient_id
- ✓ Permissions: Patient can only see their own certificates

### Staff Can't Approve
- ✓ Must have clinician role
- ✓ Certificate status must be "Pending"

### PDF Upload Fails
- ✓ Certificate must be in status: approved, completed, or no-show
- ✓ File must be PDF (not Word, image, etc.)
- ✓ File size must be under 10MB

---

## Summary

Your certificate system is **fully functional** and implements a clean request-based workflow:

1. Patients request → 2. Staff reviews → 3. Staff uploads → 4. Patients download

All endpoints are routed, database is set up, and notifications are configured. ✅
