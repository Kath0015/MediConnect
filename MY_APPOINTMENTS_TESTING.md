# My Appointments Page - Testing & Integration Verification

**Status:** ✅ Complete - Ready for Testing  
**Date:** September 5, 2026  
**Component:** `frontend/src/pages/patient/MyAppointments.jsx`  
**Route:** `/patient/my-appointments`

---

## Overview

The redesigned **My Appointments** page provides patients with:
- Modern card-based appointment layout
- Real-time appointment status filtering
- Search functionality
- Staff communication/messaging integration
- Appointment management (view, cancel)
- Professional UI matching provided design specifications

---

## Features Implemented

### ✅ 1. Card-Based Appointment Layout
- **Location:** `frontend/src/pages/patient/MyAppointments.jsx` (lines 220-280)
- **Component:** `AppointmentCard`
- **Features:**
  - Appointment type with icon
  - Status badge (color-coded)
  - Date & time display
  - Doctor/clinician name and title
  - Location information
  - Reason for visit
  - Hover effects and transitions

**Verification:**
- [ ] Cards render with correct styling
- [ ] Icons display properly (Calendar, Clock, MapPin, Stethoscope)
- [ ] Status badges show correct colors (yellow=Pending, green=Confirmed, etc.)
- [ ] Card hover shadow appears on hover
- [ ] Responsive on mobile (single column), tablet (2 columns), desktop (3 columns)

---

### ✅ 2. Staff Messaging Connection
- **Location:** `frontend/src/pages/patient/MyAppointments.jsx` (lines 103-128)
- **Function:** `handleSendMessage`
- **Integration:** Uses `sendMessage` API from `frontend/src/api/Messages.jsx`
- **Features:**
  - "Contact Staff" button on each appointment card
  - Message modal dialog
  - Character count tracker (max 500)
  - Loading state during send
  - Error handling with toast notifications

**API Integration:**
```javascript
await sendMessage({
  receiver_id: staffId,
  message: messageModal.message.trim(),
});
```

**Verification:**
- [ ] "Contact Staff" button visible on upcoming appointments (scheduled/confirmed)
- [ ] Button hidden on completed/cancelled appointments
- [ ] Message modal opens on button click
- [ ] Message modal displays staff member name in header
- [ ] Character counter shows correctly (updates as user types)
- [ ] Send button disabled when message is empty
- [ ] Loading spinner shows during send
- [ ] Success toast appears after message sent
- [ ] Message modal closes after successful send
- [ ] Error toast shows if message fails to send
- [ ] Staff member receives message in their Messages page

**Test Scenario:**
1. Navigate to `/patient/my-appointments`
2. Find an upcoming appointment card
3. Click "Contact Staff" button
4. Type a test message: "Hello, I have a question about my appointment"
5. Click "Send Message"
6. Verify success toast: "Message sent to staff"
7. Log in as staff member (doctor/clinician)
8. Go to Messages page
9. Verify message appears in conversation with patient

---

### ✅ 3. Appointment Details Modal
- **Location:** `frontend/src/pages/patient/MyAppointments.jsx` (lines 291-360)
- **State:** `detailsModal`
- **Component:** Dialog with full appointment information
- **Features:**
  - View Details button on each card
  - Modal shows all appointment fields
  - Message Staff button in modal
  - Cancel Appointment button in modal
  - Professional layout with labeled sections

**Verification:**
- [ ] "View Details" button present on all appointment cards
- [ ] Button click opens modal without page navigation
- [ ] Modal title shows "Appointment Details"
- [ ] Modal displays appointment ID
- [ ] All fields visible: Status, Type, Date, Time, Healthcare Provider, Location, Reason, Notes
- [ ] Date formatted correctly (e.g., "Aug 12, 2026")
- [ ] Time formatted correctly (e.g., "2:30 PM")
- [ ] Clinician name and title displayed
- [ ] Modal has Close, Message Staff, and Cancel buttons
- [ ] Close button closes modal without action
- [ ] Modal scrollable if content exceeds viewport height
- [ ] Modal responsive on mobile

**Test Scenario:**
1. Click "View Details" on any appointment
2. Verify modal opens with all information
3. Check date format: should be "Aug 12, 2026" style
4. Check time format: should be "N/A" or time in 12-hour format
5. Close modal and try another appointment
6. Verify no data carryover between modals

---

### ✅ 4. Status Filtering & Search
- **Location:** `frontend/src/pages/patient/MyAppointments.jsx` (lines 55-100)
- **Functions:**
  - `upcomingAppointments` filter (upcoming, confirmed, in_progress)
  - `completedAppointments` filter (completed)
  - `cancelledAppointments` filter (cancelled, no_show, rejected)
  - `getFilteredAppointments` search function

**Tab Filtering:**
```javascript
const tabData = {
  upcoming: { label: 'Upcoming', count: X, appointments: [...] },
  completed: { label: 'Completed', count: X, appointments: [...] },
  cancelled: { label: 'Cancelled', count: X, appointments: [...] },
};
```

**Search Filtering:**
```javascript
getFilteredAppointments(list) // Filters by:
  - Appointment type name
  - Clinician name
  - Location
```

**Verification - Tab Filtering:**
- [ ] "Upcoming" tab shows only scheduled, confirmed, and in_progress appointments
- [ ] "Upcoming" tab shows appointments sorted by date (earliest first)
- [ ] "Completed" tab shows only completed appointments
- [ ] "Completed" tab sorted by date (most recent first)
- [ ] "Cancelled" tab shows cancelled, no_show, and rejected appointments
- [ ] Tab badge shows correct count
- [ ] Tab count updates when appointments change
- [ ] Active tab highlighted with blue background
- [ ] Inactive tabs have gray background

**Verification - Search:**
- [ ] Search box visible in filter bar
- [ ] Typing in search filters appointments in real-time
- [ ] Search works case-insensitively
- [ ] Search by appointment type (e.g., "laboratory")
- [ ] Search by doctor name (e.g., "Juan")
- [ ] Search by location (e.g., "Clinic")
- [ ] Clearing search shows all appointments again
- [ ] Empty state shows when no appointments match search

**Test Scenarios:**
1. **Tab Switching:**
   - Click "Upcoming" tab → shows only future appointments
   - Click "Completed" tab → shows past completed appointments
   - Click "Cancelled" tab → shows cancelled/no-show appointments

2. **Search:**
   - Type "laboratory" → filters to lab appointments only
   - Type "Dr. Juan" → filters to appointments with that doctor
   - Type "Clinic" → filters to clinic location appointments
   - Type "xyz" → shows no appointments
   - Clear search → shows all appointments again

---

### ✅ 5. Book Appointment Button
- **Location:** `frontend/src/pages/patient/MyAppointments.jsx` (lines 169-177)
- **Navigation:** Button in header and empty state
- **Action:** `navigate('/patient/appointment')`
- **Features:**
  - Plus icon button in header
  - Also shown in empty state section
  - Links to existing booking flow

**Verification:**
- [ ] Button visible in top-right of page header
- [ ] Button has blue background (#009DD1)
- [ ] Button text: "Book Appointment"
- [ ] Plus icon displays before text
- [ ] Clicking button navigates to `/patient/appointment`
- [ ] Appointment booking form loads
- [ ] When no appointments exist, empty state shows "Book Your First Appointment" button
- [ ] Empty state button also navigates to booking page

**Test Scenario:**
1. Navigate to `/patient/my-appointments`
2. Click "Book Appointment" button in header
3. Verify redirected to `/patient/appointment` booking form
4. Create a test appointment
5. Verify new appointment appears in upcoming tab

---

### ✅ 6. Action Buttons
- **Location:** `frontend/src/pages/patient/MyAppointments.jsx` (lines 250-275)
- **Buttons:**
  1. **View Details** - Opens details modal
  2. **Contact Staff** - Opens message modal (conditional)
  3. **Cancel** - Opens cancel confirmation dialog (conditional)

**Conditions:**
- View Details: Always shown
- Contact Staff: Only on scheduled/confirmed appointments
- Cancel (X): Only on scheduled/confirmed appointments

**Verification - View Details Button:**
- [ ] Present on all appointment cards
- [ ] Label shows "View Details"
- [ ] Eye icon displays
- [ ] Clicking opens details modal
- [ ] Modal shows full appointment information

**Verification - Contact Staff Button:**
- [ ] Only visible on scheduled/confirmed appointments
- [ ] Hidden on completed/cancelled appointments
- [ ] Label shows "Contact Staff"
- [ ] MessageCircle icon displays
- [ ] Clicking opens message modal
- [ ] Staff name shown in message modal header

**Verification - Cancel Button (X):**
- [ ] Only visible on scheduled/confirmed appointments
- [ ] Hidden on completed/cancelled appointments
- [ ] Red text color
- [ ] Clicking opens cancel confirmation dialog
- [ ] Dialog asks for cancellation reason
- [ ] Cancel and confirmation buttons available
- [ ] Cancellation successful → appointment moves to Cancelled tab

**Test Scenario:**
1. Find an upcoming (scheduled/confirmed) appointment
2. Verify all three buttons visible: View Details, Contact Staff, Cancel
3. Click View Details → modal opens
4. Close modal
5. Click Contact Staff → message modal opens
6. Type test message and send
7. Verify success toast
8. Click Cancel button → cancel dialog opens
9. Enter cancellation reason
10. Click "Cancel Appointment"
11. Verify appointment moved to Cancelled tab

---

### ✅ 7. Cancel Appointment Flow
- **Location:** `frontend/src/pages/patient/MyAppointments.jsx` (lines 90-102)
- **Function:** `handleCancelAppointment`
- **Integration:** Uses `cancelAppointment` API

**Process:**
1. User clicks Cancel button
2. Cancel dialog opens
3. User can enter optional reason
4. User confirms cancellation
5. API call to cancel appointment
6. Appointments reload
7. Cancelled appointment moves to Cancelled tab

**Verification:**
- [ ] Cancel button visible on scheduled/confirmed appointments
- [ ] Clicking opens dialog with title "Cancel Appointment"
- [ ] Dialog shows warning: "This action cannot be undone"
- [ ] Text area for optional cancellation reason
- [ ] Character counter shows (max 500)
- [ ] "Keep Appointment" button closes dialog without cancelling
- [ ] "Cancel Appointment" button sends cancellation
- [ ] Loading spinner shows during cancellation
- [ ] Success toast: "Appointment cancelled successfully"
- [ ] Error toast shows if cancellation fails
- [ ] Appointments list refreshes after cancellation
- [ ] Cancelled appointment now appears in Cancelled tab
- [ ] Status changed to "Cancelled"

**Test Scenario:**
1. Find an upcoming appointment
2. Click Cancel (X) button
3. Type reason: "Schedule conflict"
4. Click "Cancel Appointment"
5. Verify success toast
6. Check that appointment moved to Cancelled tab
7. Verify status badge shows "Cancelled"

---

## Integration Points

### Backend API Endpoints Used

1. **Get Appointments**
   - Endpoint: `GET /api/appointments`
   - Import: `getAppointments` from `frontend/src/api/Appointments.jsx`
   - Called in: `useEffect` on component mount
   - Data structure: Returns array of appointment objects

2. **Cancel Appointment**
   - Endpoint: `POST /api/appointments/{id}/cancel`
   - Import: `cancelAppointment` from `frontend/src/api/Appointments.jsx`
   - Called in: `handleCancelAppointment`
   - Parameters: `appointment.id`, `reason` (optional)

3. **Send Message**
   - Endpoint: `POST /api/messages`
   - Import: `sendMessage` from `frontend/src/api/Messages.jsx`
   - Called in: `handleSendMessage`
   - Parameters: `receiver_id` (staff member), `message` (text)

### Data Flow

```
MyAppointments Component
├── State:
│   ├── appointments (array)
│   ├── loading (boolean)
│   ├── selectedTab (string)
│   ├── searchQuery (string)
│   ├── cancelDialog (object)
│   ├── detailsModal (object)
│   └── messageModal (object)
│
├── Load Appointments:
│   └── getAppointments() → appointments state
│
├── Filter & Sort:
│   ├── upcomingAppointments (useMemo)
│   ├── completedAppointments (useMemo)
│   └── cancelledAppointments (useMemo)
│
├── Actions:
│   ├── Cancel → cancelAppointment() API → reload
│   ├── Message → sendMessage() API → toast
│   └── Details → Show modal with appointment data
│
└── Render:
    ├── Header (search + tabs)
    ├── Appointment Cards
    │   ├── AppointmentCard component
    │   └── Action buttons
    ├── Details Modal
    ├── Cancel Dialog
    └── Message Modal
```

---

## Testing Checklist

### Setup
- [ ] Backend API running (Laravel development server)
- [ ] Frontend running (React development server)
- [ ] Logged in as patient user
- [ ] Patient has at least one appointment in database

### Visual & Navigation
- [ ] Page loads without errors
- [ ] Header displays correctly with search and tabs
- [ ] Appointment cards render properly
- [ ] All icons display correctly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Tab switching works smoothly
- [ ] Search updates in real-time

### Core Functionality
- [ ] View Details button opens modal
- [ ] Details modal shows all appointment info
- [ ] Contact Staff button opens message modal
- [ ] Message sends successfully to staff
- [ ] Cancel button opens confirmation dialog
- [ ] Appointment cancellation works
- [ ] Book Appointment button navigates to booking page
- [ ] Empty state displays when no appointments exist

### Staff Communication
- [ ] Patient can send message to staff
- [ ] Message appears in staff's Messages page
- [ ] Staff can reply to message
- [ ] Reply appears in patient's message thread
- [ ] Message timestamps display correctly
- [ ] Unread badge appears for new messages

### Error Handling
- [ ] Network error shows toast notification
- [ ] Invalid appointment ID handled gracefully
- [ ] Message send failure shows error
- [ ] Cancel appointment failure shows error
- [ ] Empty search results show "No appointments found"
- [ ] Loading states show spinner

### Data Accuracy
- [ ] Upcoming tab shows only future appointments
- [ ] Completed tab shows only past appointments
- [ ] Cancelled tab shows only cancelled/rejected appointments
- [ ] Status badges match appointment status
- [ ] Date/time formatting is correct
- [ ] Doctor/clinician information displays correctly
- [ ] Appointment type displays correctly

---

## Manual Testing Steps

### Test 1: View Appointments
1. Log in as patient
2. Navigate to `/patient/my-appointments`
3. Verify appointments load
4. Check upcoming tab shows future appointments
5. Click completed tab
6. Click cancelled tab
7. Return to upcoming tab

**Expected Result:** All tabs show correct filtered appointments

---

### Test 2: Search Functionality
1. In upcoming tab, type "laboratory" in search
2. Verify only lab appointments shown
3. Clear search box
4. Verify all appointments reappear
5. Type doctor name in search
6. Verify filtered correctly
7. Type location name
8. Verify filtered correctly

**Expected Result:** Search filters appointments in real-time

---

### Test 3: View Appointment Details
1. Click "View Details" on any appointment
2. Verify modal opens with appointment title
3. Check all fields display: Status, Type, Date, Time, Doctor, Location, Reason
4. Close modal by clicking Close button
5. Click View Details on another appointment
6. Verify different appointment details shown

**Expected Result:** Modal displays correct appointment information

---

### Test 4: Message Staff
1. Find an upcoming (scheduled/confirmed) appointment
2. Click "Contact Staff" button
3. Verify message modal opens with staff name
4. Type test message: "Can I reschedule this appointment?"
5. Click "Send Message"
6. Verify success toast appears
7. Modal closes automatically
8. Log in as staff member (doctor/clinician)
9. Go to Messages page
10. Verify message appears from patient

**Expected Result:** Message sent successfully and visible to staff

---

### Test 5: Cancel Appointment
1. Find an upcoming appointment
2. Click Cancel (red X) button
3. Verify cancel dialog opens
4. Type reason: "Cannot make it"
5. Click "Cancel Appointment"
6. Verify success toast
7. Check appointment moved to "Cancelled" tab
8. Verify status badge shows "Cancelled"

**Expected Result:** Appointment cancelled and moved to cancelled tab

---

### Test 6: Book New Appointment
1. Click "Book Appointment" button in header
2. Verify redirected to appointment booking form
3. Fill out form and submit
4. Verify new appointment created
5. Return to My Appointments page
6. Verify new appointment appears in upcoming tab

**Expected Result:** New appointment appears in list

---

### Test 7: Contact Staff from Details Modal
1. Click "View Details" on an upcoming appointment
2. Verify "Message Staff" button in modal footer
3. Click "Message Staff" button
4. Verify message modal opens
5. Send test message
6. Verify success toast

**Expected Result:** Can message staff from details modal

---

### Test 8: Responsive Design
1. Open page on desktop (1920px wide)
2. Check layout looks good
3. Resize browser to tablet size (768px)
4. Verify layout adapts (2 columns)
5. Resize to mobile size (375px)
6. Verify layout adapts (1 column)
7. Test all buttons clickable on mobile
8. Test scrolling through appointments

**Expected Result:** Page responsive and functional on all sizes

---

## Troubleshooting

### Issue: "Unable to load appointments" error
**Solution:**
- Check backend API is running
- Verify `/api/appointments` endpoint is working
- Check patient has appointments in database
- Check authentication token is valid

### Issue: Message doesn't send
**Solution:**
- Verify staff member ID is correct
- Check MessageRoutingService permissions
- Verify patient has permission to message that staff member
- Check backend `/api/messages` endpoint

### Issue: Search not working
**Solution:**
- Clear browser cache
- Refresh page
- Check search query is not empty
- Verify appointment data has searchable fields

### Issue: Cancel button doesn't work
**Solution:**
- Verify appointment status is 'scheduled' or 'confirmed'
- Check backend `/api/appointments/{id}/cancel` endpoint
- Verify patient has permission to cancel
- Check for network errors in console

### Issue: Modal doesn't close
**Solution:**
- Click outside modal to close
- Click Close button
- Press Escape key
- Refresh page

---

## Performance Considerations

### Optimizations Implemented
- Usememo for filtered appointment lists (prevents unnecessary recalculations)
- Lazy loading of component via React.lazy
- Toast notifications for user feedback
- Loading states to prevent duplicate submissions
- Efficient search filtering (real-time)

### Performance Testing
- [ ] Page loads in < 2 seconds
- [ ] Search filters in < 500ms
- [ ] Modals open instantly
- [ ] Message sends without lag
- [ ] No console errors or warnings

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Accessibility

- [ ] Tab navigation works
- [ ] Buttons have focus states
- [ ] Icons have alt text / aria labels
- [ ] Color contrast meets WCAG AA
- [ ] Modal can be closed with Escape
- [ ] Screen reader friendly

---

## Final Verification

- [ ] All 7 tasks completed
- [ ] All tests passed
- [ ] No console errors
- [ ] No network errors
- [ ] Staff can receive and reply to messages
- [ ] Appointments update in real-time
- [ ] Ready for production deployment

---

## Sign-Off

**Tested By:** ___________________  
**Date:** ___________________  
**Status:** ✅ **PASSED** / ⏳ **IN PROGRESS** / ❌ **FAILED**

**Comments:**

---

**Component is production-ready!** 🚀
