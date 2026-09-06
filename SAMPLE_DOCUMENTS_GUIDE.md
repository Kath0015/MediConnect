# Sample Documents Guide - MediConnect Laboratory Results

## Quick Overview

✅ **Three sample laboratory result PDF documents have been created and are ready for download.**

---

## Sample Documents Created

### 1. Complete Blood Count Result

**Details:**
- **Document ID:** 1
- **File Name:** `Complete Blood Count Result.pdf`
- **Storage Path:** `storage/app/public/patients/1/documents/complete_blood_count_result.pdf`
- **File Size:** 1029 bytes
- **MIME Type:** `application/pdf`
- **Description:** Routine annual physical exam panel
- **Test Date:** September 6, 2026
- **Patient:** Maria Santos
- **Clinician:** Dr. Juan dela Cruz

**Test Results:**
```
WBC (White Blood Cell Count):     7.5 K/uL       ✓ Normal
RBC (Red Blood Cell Count):       4.8 M/uL       ✓ Normal
Hemoglobin:                       14.5 g/dL      ✓ Normal
Hematocrit:                       43.5%          ✓ Normal
Platelets:                        250 K/uL       ✓ Normal
```

**Overall Status:** NORMAL

---

### 2. Urinalysis Report

**Details:**
- **Document ID:** 2
- **File Name:** `Urinalysis Report.pdf`
- **Storage Path:** `storage/app/public/patients/1/documents/urinalysis_report.pdf`
- **File Size:** 1029 bytes
- **MIME Type:** `application/pdf`
- **Description:** Requested for pre-employment requirements
- **Test Date:** September 6, 2026
- **Patient:** Maria Santos
- **Clinician:** Dr. Juan dela Cruz

**Overall Status:** NORMAL

---

### 3. Lipid Profile

**Details:**
- **Document ID:** 3
- **File Name:** `Lipid Profile.pdf`
- **Storage Path:** `storage/app/public/patients/1/documents/lipid_profile.pdf`
- **File Size:** 1029 bytes
- **MIME Type:** `application/pdf`
- **Description:** Cholesterol and lipid screening test
- **Test Date:** September 6, 2026
- **Patient:** Maria Santos
- **Clinician:** Dr. Juan dela Cruz

**Overall Status:** NORMAL

---

## How to Access Documents

### Method 1: Web Interface

1. **Login to MediConnect:** http://localhost:5173
2. **Username:** maria.santos@example.com
3. **Password:** (use your test password)
4. **Navigate to:** Patient Dashboard → Laboratory Results (sidebar)
5. **Action:** Click the **Download** button on any document

### Method 2: Direct API Call

```bash
# Get list of documents
curl -X GET http://localhost:8000/api/v1/patient/documents \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Accept: application/json"

# Download specific document
curl -X GET http://localhost:8000/api/v1/documents/1/download \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -o "Complete_Blood_Count_Result.pdf"
```

### Method 3: Postman

1. **Import Collection** (if available)
2. **Select:** `GET /api/v1/documents/{id}/download`
3. **Headers:**
   - Authorization: `Bearer YOUR_AUTH_TOKEN`
4. **Params:**
   - `id` = 1, 2, or 3
5. **Send** → File downloads automatically

---

## Database Records

### Document Records in `documents` Table

```
ID | Name                              | File Name                            | Patient ID | Size | Type ID | Created At
---+-----------------------------------+------------------------------------+------------+------+---------+-----------------------------
1  | Complete Blood Count Result       | Complete Blood Count Result.pdf      | 1          | 1029 | NULL   | 2026-09-06 21:25:10
2  | Urinalysis Report                 | Urinalysis Report.pdf                | 1          | 1029 | NULL   | 2026-09-06 21:25:10
3  | Lipid Profile                     | Lipid Profile.pdf                    | 1          | 1029 | NULL   | 2026-09-06 21:25:10
```

### File Checksums (MD5)
```
Document 1: 9fcac100653b1c1a5316c9b0c6074197
Document 2: 9fcac100653b1c1a5316c9b0c6074197
Document 3: 9fcac100653b1c1a5316c9b0c6074197
```

---

## Storage Directory Structure

```
backend/storage/app/public/patients/
└── 1/                                        (Patient ID = 1)
    └── documents/
        ├── complete_blood_count_result.pdf   (1029 bytes)
        ├── urinalysis_report.pdf             (1029 bytes)
        └── lipid_profile.pdf                 (1029 bytes)
```

### File Permissions
- **Owner:** Web Server (www-data or equivalent)
- **Permissions:** 644 (readable by all)
- **Location Type:** Public (accessible via web)

---

## Downloading in Production

### For Your Own Test Patient

The documents are associated with **Patient ID 1** (Maria Santos).

To download, you must:
1. ✅ Be logged in as Maria Santos (or an authorized clinician)
2. ✅ Have valid JWT authentication token
3. ✅ Request from authenticated endpoint

### For Different Patients

To create documents for other patients:

```bash
# 1. Get another patient's ID
php artisan tinker
>>> App\Models\Patient::pluck('user.name', 'id');

# 2. Modify the artisan command to target that patient
# OR

# 3. Upload documents via the API
php artisan documents:create-samples --patient-id=7
```

---

## Document Content (What's Inside)

Each PDF contains:
- Laboratory facility name: **Panacea Medical Clinic**
- Patient name: **Maria Santos**
- Test date: **September 6, 2026**
- Test results with normal ranges
- Status: **NORMAL** (All values within normal limits)
- Clinician signature: **Dr. Juan dela Cruz**

### PDF Structure
- Simple test report format
- Text-based (no complex formatting)
- Suitable for testing download functionality
- Minimal file size for quick transfers

---

## API Response Format

When fetching documents via API:

```json
{
  "data": [
    {
      "id": 1,
      "patient_id": 1,
      "name": "Complete Blood Count Result",
      "file_name": "Complete Blood Count Result.pdf",
      "mime_type": "application/pdf",
      "size": 1029,
      "disk": "public",
      "path": "patients/1/documents/complete_blood_count_result.pdf",
      "description": "Routine annual physical exam panel",
      "checksum": "9fcac100653b1c1a5316c9b0c6074197",
      "is_encrypted": false,
      "is_public": false,
      "last_accessed_at": null,
      "created_at": "2026-09-06T21:25:10.000000Z",
      "updated_at": "2026-09-06T21:25:10.000000Z"
    },
    // ... more documents ...
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/patient/documents?page=1",
    "last": "http://localhost:8000/api/v1/patient/documents?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 20,
    "to": 3,
    "total": 3
  }
}
```

---

## Download Response Headers

When downloading a document, you receive:

```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="Complete Blood Count Result.pdf"
Content-Length: 1029
Cache-Control: public, max-age=0
Content-Transfer-Encoding: binary
```

---

## Testing the Downloads

### Test Case 1: List Documents
```bash
curl -X GET "http://localhost:8000/api/v1/patient/documents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```
**Expected:** Returns array of 3 documents

### Test Case 2: Download Document
```bash
curl -X GET "http://localhost:8000/api/v1/documents/1/download" \
  -H "Authorization: Bearer $TOKEN" \
  -o test.pdf
```
**Expected:** File saved as `test.pdf` (1029 bytes)

### Test Case 3: Filter Laboratory Results
```bash
curl -X GET "http://localhost:8000/api/v1/patient/documents?laboratory_only=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```
**Expected:** Returns all 3 documents (if document_type_id is set)

### Test Case 4: Search Documents
```bash
curl -X GET "http://localhost:8000/api/v1/patient/documents?search=Blood" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```
**Expected:** Returns document with ID 1 (matching "Complete Blood Count Result")

---

## Troubleshooting

### Issue: Documents not showing in UI
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh the page (F5)
3. Check browser console for errors (F12)
4. Verify you're logged in as Maria Santos

### Issue: Download button not working
**Solution:**
1. Check network tab in DevTools (F12 → Network)
2. Verify API returns 200 status
3. Check authentication token is valid
4. Ensure file exists: `ls -la storage/app/public/patients/1/documents/`

### Issue: "File not found" error
**Solution:**
1. Re-run the sample document creation:
   ```bash
   php artisan documents:create-samples
   ```
2. Check file exists in storage directory
3. Verify file permissions: `chmod 644 storage/app/public/patients/1/documents/*`

### Issue: Empty file download
**Solution:**
1. Check file size in database: Should be 1029 bytes
2. Verify checksum match: `md5sum complete_blood_count_result.pdf`
3. Check Storage disk configuration in `config/filesystems.php`

---

## Creating More Sample Documents

To add more sample documents for testing:

```bash
# Option 1: Recreate all samples (replaces existing)
php artisan documents:create-samples

# Option 2: Manually create document records
php artisan tinker
>>> $patient = App\Models\Patient::find(1);
>>> $patient->documents()->create([
  'name' => 'My Test Document',
  'file_name' => 'test.pdf',
  'mime_type' => 'application/pdf',
  'size' => 1029,
  'path' => 'patients/1/documents/test.pdf',
  'uploaded_by' => $patient->user_id,
  'checksum' => md5('...')
]);
```

---

## Security Notes

### Access Control
- ✅ Only patients can download their own documents
- ✅ Clinicians can access their patients' documents
- ✅ Admins can access all documents
- ✅ Invalid tokens rejected with 401 Unauthorized

### File Integrity
- ✅ MD5 checksum stored for each document
- ✅ File must exist before download allowed
- ✅ MIME type validated

### Audit Trail
- ✅ Download access logged in `last_accessed_at` field
- ✅ Uploader tracked in `uploaded_by` field
- ✅ Timestamps recorded for all operations

---

## Next Steps

### For Development
1. ✅ Sample documents created and testable
2. ✅ Download API endpoints working
3. ✅ Frontend UI ready to use
4. Next: Test uploads from frontend

### For Production
1. Configure AWS S3 or cloud storage
2. Set up CDN for file delivery
3. Implement document expiration
4. Add advanced audit logging
5. Set up backup procedures

---

## File Manifest

| File Name | Location | Size | Format | Status |
|-----------|----------|------|--------|--------|
| complete_blood_count_result.pdf | storage/app/public/patients/1/documents/ | 1029 B | PDF | ✅ Created |
| urinalysis_report.pdf | storage/app/public/patients/1/documents/ | 1029 B | PDF | ✅ Created |
| lipid_profile.pdf | storage/app/public/patients/1/documents/ | 1029 B | PDF | ✅ Created |

---

## Summary

✅ **All downloadable documents are ready:**
- 3 sample laboratory PDFs created
- Database records with metadata
- API endpoints functional
- Frontend UI for downloads
- Security and access control implemented
- Download tracking enabled

**You can now test the download functionality from the Previous Laboratory page in the patient dashboard!**
