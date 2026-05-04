# AI Symptom Checker - Feature Implementation Summary

## Overview
The AI Symptom Checker is a new patient-facing feature that enables users to input symptoms and receive preliminary health insights including possible conditions, severity assessments, and actionable next steps (home care, lab tests, consultation).

## Features Implemented

### 1. Backend API (`/api/symptom-check`)
- **File**: `backend/app/Http/Controllers/Api/V1/SymptomCheckerController.php`
- **Route**: `POST /api/v1/symptom-check` (authenticated, patient-accessible)
- **Request Parameters**:
  - `symptoms[]` - Array of symptom strings (required, min 1)
  - `duration` - Duration of symptoms (optional): `less_than_24h`, `1_to_3_days`, `4_to_7_days`, `more_than_7_days`
  - `severity` - Severity level (optional): `mild`, `moderate`, `severe`
  - `age` - Patient age (optional): integer 1-150

- **Response Structure**:
  ```json
  {
    "success": true,
    "message": "Symptom analysis completed",
    "data": {
      "symptoms_analyzed": ["fever", "cough"],
      "symptom_count": 2,
      "possible_conditions": [
        {
          "name": "Influenza (Flu)",
          "estimated_severity": "moderate",
          "confidence_level": 85,
          "matched_symptoms": ["fever", "cough"]
        }
      ],
      "severity_assessment": "Moderate",
      "duration_assessment": "4 To 7 Days",
      "requires_urgent_care": false,
      "recommendations": [
        {
          "type": "home_care",
          "action": "Home Care Management",
          "description": "Rest, stay hydrated, and monitor your symptoms...",
          "priority": "HIGH"
        },
        {
          "type": "laboratory",
          "action": "Request Laboratory Tests",
          "description": "Based on your symptoms, consider scheduling laboratory tests...",
          "tests": ["Complete Blood Count (CBC)", "Rapid Diagnostic Test"],
          "priority": "MEDIUM"
        },
        {
          "type": "consultation",
          "action": "Schedule a Consultation",
          "description": "Consult with a healthcare professional...",
          "specialist": "General Practitioner",
          "priority": "MEDIUM"
        }
      ],
      "disclaimer": "This is a preliminary assessment based on symptoms provided..."
    }
  }
  ```

### 2. Frontend Components

#### SymptomChecker Page (`frontend/src/pages/patient/SymptomChecker.jsx`)
- Displays two views: input form and results display
- **Input Form Features**:
  - Quick-select buttons for common symptoms (Cough, Sore throat, Fever, etc.)
  - Custom symptom input with autocomplete
  - Selected symptoms display with remove capability
  - Duration dropdown (optional)
  - Severity selector (mild/moderate/severe)
  - Age input (optional)
  - Submit button with loading state

- **Results Display**:
  - Urgent care alert if needed
  - Summary of analyzed symptoms
  - List of possible conditions with confidence levels
  - Matched symptoms for each condition
  - Actionable recommendations (home care, lab tests, consultation)
  - Specialist suggestions based on condition
  - Medical disclaimer
  - "Start Over" and "Schedule Appointment" buttons

#### API Client (`frontend/src/api/SymptomChecker.jsx`)
- `checkSymptoms(data)` - POST to `/api/symptom-check` with symptom analysis payload
- Error handling with descriptive messages
- Structured response parsing

#### Dashboard Integration
- Added "AI Symptom Checker" quick-access card on patient dashboard
- Links directly to `/patient/symptom-checker`
- Placed alongside other quick-access cards (Book Appointment, Request Certificate)
- Visual indicator with Activity icon and emerald color theme

#### Navigation Menu
- Added "Symptom Checker" menu item in patient sidebar navigation
- Uses Activity icon for visual identification
- Accessible via `/patient/symptom-checker` route

### 3. API Routes
- **File**: `backend/routes/api.php`
- Added SymptomCheckerController import
- Added protected route: `POST /api/symptom-check` with auth:sanctum middleware

### 4. Application Routing
- **File**: `frontend/src/App.jsx`
- Added lazy-loaded SymptomChecker component
- Added patient-protected route: `/patient/symptom-checker`
- Uses PatientPageSkeleton for loading state

### 5. UI/Layout Components
- **File**: `frontend/src/components/Layout.jsx`
- Added Symptom Checker navigation item to patient menu
- Positioned after Appointments in navigation

## Symptom-to-Condition Mapping

The backend includes a comprehensive symptom database organized by symptom groups:

### Cold & Flu
- **Symptoms**: cough, sore throat, runny nose, sneezing, congestion
- **Conditions**: Common Cold, Allergies
- **Confidence**: 70-90%

### Gastrointestinal
- **Symptoms**: nausea, vomiting, diarrhea, stomach pain, abdominal pain, indigestion
- **Conditions**: Gastroenteritis, Food Poisoning, Acid Reflux
- **Confidence**: 65-80%

### Headache & Migraine
- **Symptoms**: headache, migraine, light sensitivity
- **Conditions**: Tension Headache, Migraine, Dehydration
- **Confidence**: 60-80%

### Respiratory
- **Symptoms**: shortness of breath, difficulty breathing, chest pain, wheezing, asthma
- **Conditions**: Asthma, Bronchitis, Pneumonia
- **Confidence**: 65-75%

### Allergies
- **Symptoms**: itchy eyes, watery eyes, itchy nose, rash, skin rash, hives
- **Conditions**: Allergic Reaction, Hay Fever, Dermatitis
- **Confidence**: 70-85%

### General Symptoms
- **Symptoms**: fatigue, tiredness, weakness, fever, chills, sweating
- **Conditions**: General Illness, Infection
- **Confidence**: 60-65%

## Recommendation Generation Logic

### Home Care (Always Provided)
- Rest and hydration guidance
- OTC pain relief suggestions

### Laboratory Tests (Medium Priority)
- Suggested only when confidence level ≥ 70%
- Recommendations include: Complete Blood Count (CBC), Rapid Diagnostic Test, Blood Culture

### Consultation (Medium Priority)
- Specialist suggestions based on condition:
  - GI conditions → Gastroenterologist
  - Migraines → Neurologist
  - Respiratory → Pulmonologist
  - Allergies → Allergist
  - Skin issues → Dermatologist
  - Others → General Practitioner

### Urgent Care Assessment
- Triggered by severe emergency symptoms (chest pain, difficulty breathing, etc.) or severe severity level
- Overrides other recommendations
- Advises immediate ER/ambulance visit

## File Structure

```
backend/
  app/Http/Controllers/Api/V1/
    SymptomCheckerController.php       (NEW)
  
  routes/
    api.php                             (MODIFIED - added route import & endpoint)

frontend/
  src/
    api/
      SymptomChecker.jsx                (NEW)
    pages/patient/
      SymptomChecker.jsx                (NEW)
      Dashboard.jsx                     (MODIFIED - added quick-access card)
    components/
      Layout.jsx                        (MODIFIED - added nav item & Pulse import)
    App.jsx                             (MODIFIED - added route & component import)
```

## Testing Instructions

### 1. Backend API Test (via cURL or Postman)
```bash
POST http://localhost:3000/api/v1/symptom-check
Content-Type: application/json
Authorization: Bearer {token}

{
  "symptoms": ["fever", "cough", "body aches"],
  "duration": "4_to_7_days",
  "severity": "moderate",
  "age": 28
}
```

### 2. Frontend Manual Tests
1. **Navigation**: Click "Symptom Checker" in patient sidebar
2. **Quick Select**: Click "Fever" and "Cough" buttons
3. **Custom Input**: Type "headache" and press Enter
4. **Submit**: Click "Analyze Symptoms"
5. **Results**: Verify possible conditions display with confidence levels
6. **Recommendations**: Check home care, lab tests, and consultation suggestions appear
7. **Reset**: Click "Start Over" to restart

### 3. Edge Cases
- Single symptom submission
- Multiple symptoms (5+)
- Severe duration + severe severity (should show urgent care alert)
- Empty form submission (should show validation error)
- Chest pain symptom (should trigger urgent care)

### 4. Integration Tests
- Login as patient
- Navigate to dashboard
- Verify "AI Symptom Checker" quick-access card appears
- Click card and verify routing works
- Submit symptoms and verify API response
- Schedule appointment from results page

## User Benefits

✅ **Early Detection**: Identifies potential health conditions before clinic visit
✅ **Informed Decision-Making**: Guidance on whether to seek lab tests or immediate consultation
✅ **Engagement**: Encourages patient participation in health management
✅ **Reduced Wait Times**: Patients can identify non-urgent vs urgent conditions
✅ **Educational**: Helps patients understand symptom-condition relationships

## Technical Details

- **Authentication**: Requires `auth:sanctum` middleware (patient login required)
- **Validation**: Request validation with descriptive error messages
- **Response Format**: Consistent JSON response with success/message/data structure
- **Error Handling**: Try-catch blocks with meaningful error messages
- **Performance**: Analyzer uses in-memory symptom database (no DB queries)
- **Frontend Build**: Verified with npm run build (no syntax errors)
- **Routes**: POST /api/v1/symptom-check properly registered

## Future Enhancements

1. **Database Storage**: Store symptom analysis history for each patient
2. **AI Integration**: Replace rule-based engine with actual ML model
3. **Condition Details**: Expand with more detailed condition information and statistics
4. **Appointments**: Auto-suggest specific appointment types based on analysis
5. **Notifications**: Send follow-up notifications based on recommended actions
6. **Analytics**: Track most common symptoms and conditions for clinic insights
7. **Multilingual**: Support multiple languages for symptom input and recommendations

## Security & Compliance

✓ Requires authentication (no public access)
✓ CSRF protection via Sanctum middleware
✓ Input validation on all parameters
✓ Medical disclaimer in results
✓ No PII stored (results are computed, not persisted)
✓ Accessible only to authenticated patients

## Deployment Checklist

- [x] Backend controller created and tested
- [x] API routes registered
- [x] Frontend components built successfully
- [x] Navigation integrated
- [x] Dashboard integration complete
- [x] Frontend build passes (no errors)
- [x] Routes verified in `php artisan route:list`
- [ ] Database migration (if needed for history tracking)
- [ ] Environment variables configured
- [ ] Testing in development environment
- [ ] QA validation
- [ ] Production deployment
