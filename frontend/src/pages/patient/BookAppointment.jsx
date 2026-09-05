import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Calendar, Clock, User, FileText, AlertCircle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useBranding } from '../../contexts/BrandingContext';
import { createAppointment } from '../../api/Appointments';
import { getClinicMeta } from '../../api/Clinic';
import api from '../../api/axios';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [physicians, setPhysicians] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedLaboratoryTests, setSelectedLaboratoryTests] = useState([]);

  const [formData, setFormData] = useState({
    preferred_date: '',
    preferred_time: '',
    appointment_type_id: '',
    physician_id: '',
    reason: '',
  });

  // Laboratory test categories
  const laboratoryTests = {
    'CLINICAL CHEMISTRY': [
      'FBS', 'Cholesterol', 'Triglyceride', 'HDL', 'LDL', 
      'Blood Uric Acid (BUA)', 'Blood Urea Nitrogen (BUN)', 
      'Creatinine', 'SGOT', 'SGPT', 'CHEM 10', 'Lipid Profile'
    ],
    'THYROID TEST': ['T3', 'T4', 'TSH', 'FT3', 'FT4'],
    'SEROLOGY': [
      'Serum Pregnancy Test', 'Dengue Duo', 'Typhil Dot', 'HBsAG',
      'Syphilis Screening', 'HCV Screening', 'HIV Screening', 'COVID Antigen Test'
    ],
    'HEMATOLOGY': [
      'CBC w/ Platelets', 'ESR', 'Blood Typing', 'Clotting Time', 'Bleeding Time'
    ],
    'CLINICAL MICROSCOPY': [
      'Urinalysis', 'Fecalysis', 'Urine Pregnancy Test', 'FOBT'
    ],
    'OTHER TESTS': [
      'Serum Electrolytes - Sodium', 'Serum Electrolytes - Potassium',
      'Serum Electrolytes - Chloride', 'Serum Electrolytes - Ionized Calcium',
      'HBA1C', 'CRP', 'PSA', 'Bilirubin', 'ECG'
    ]
  };

  const displayBrand = branding?.brandName || 'MediConnect';

  // Load clinic configuration
  useEffect(() => {
    loadClinicConfig();
  }, []);

  const loadClinicConfig = async () => {
    try {
      setLoadingConfig(true);
      
      // Load appointment types - provide fallback if API fails
      try {
        const metaResponse = await getClinicMeta();
        const types = metaResponse?.data?.data?.appointment_types || [];
        const filteredTypes = types.filter(t => 
          t.is_active && ['consultation', 'laboratory'].includes(t.name?.toLowerCase())
        );
        
        // If no types found from API, use hardcoded defaults
        if (filteredTypes.length === 0) {
          setAppointmentTypes([
            { id: 1, name: 'Consultation', is_active: true },
            { id: 2, name: 'Laboratory', is_active: true }
          ]);
        } else {
          setAppointmentTypes(filteredTypes);
        }
      } catch (error) {
        console.warn('Failed to load appointment types from API, using defaults:', error);
        // Fallback to hardcoded appointment types
        setAppointmentTypes([
          { id: 1, name: 'Consultation', is_active: true },
          { id: 2, name: 'Laboratory', is_active: true }
        ]);
      }

      // Load physicians (doctors and clinicians)
      try {
        const usersResponse = await api.get('/api/users');
        const allUsers = usersResponse?.data?.data || usersResponse?.data || [];
        const staffUsers = allUsers.filter(u => 
          u.roles?.some(r => ['doctor', 'clinician'].includes(r.name?.toLowerCase()))
        );
        setPhysicians(staffUsers);
      } catch (error) {
        console.warn('Failed to load physicians:', error);
        setPhysicians([]);
      }

      // Generate time slots (8 AM to 5 PM, 30-min intervals)
      const slots = generateTimeSlots('08:00', '17:00', 30);
      setTimeSlots(slots);
      
    } catch (error) {
      console.error('Failed to load clinic configuration:', error);
      // Don't show error toast, just use defaults
    } finally {
      setLoadingConfig(false);
    }
  };

  const generateTimeSlots = (start, end, intervalMinutes) => {
    const slots = [];
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    
    let current = new Date(startTime);
    while (current < endTime) {
      const timeStr = current.toTimeString().slice(0, 5);
      const displayTime = current.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      slots.push({ value: timeStr, label: displayTime });
      current = new Date(current.getTime() + intervalMinutes * 60000);
    }
    return slots;
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear laboratory tests if appointment type changes from Laboratory
    if (name === 'appointment_type_id') {
      const selectedType = appointmentTypes.find(t => String(t.id) === value);
      if (selectedType?.name?.toLowerCase() !== 'laboratory') {
        setSelectedLaboratoryTests([]);
      }
    }
  };

  const handleLaboratoryTestToggle = (testName) => {
    setSelectedLaboratoryTests(prev => {
      if (prev.includes(testName)) {
        return prev.filter(t => t !== testName);
      } else {
        return [...prev, testName];
      }
    });
  };

  const isLaboratoryType = () => {
    if (!formData.appointment_type_id) return false;
    const selectedType = appointmentTypes.find(t => String(t.id) === formData.appointment_type_id);
    return selectedType?.name?.toLowerCase() === 'laboratory';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.preferred_date) {
      toast.error('Please select a preferred date');
      return;
    }
    if (!formData.preferred_time) {
      toast.error('Please select a preferred time');
      return;
    }
    if (!formData.appointment_type_id) {
      toast.error('Please select an appointment type');
      return;
    }
    
    // Validate laboratory tests if laboratory type selected
    if (isLaboratoryType() && selectedLaboratoryTests.length === 0) {
      toast.error('Please select at least one laboratory test');
      return;
    }
    
    if (!formData.reason?.trim()) {
      toast.error('Please describe the reason for your visit');
      return;
    }

    setLoading(true);
    try {
      // Prepare appointment data
      const appointmentData = {
        appointment_type_id: parseInt(formData.appointment_type_id),
        date: formData.preferred_date,
        time: formData.preferred_time,
        reason: formData.reason.trim(),
      };

      // Add physician if selected
      if (formData.physician_id) {
        appointmentData.clinician_id = parseInt(formData.physician_id);
      }

      // Add laboratory tests if applicable
      if (isLaboratoryType()) {
        appointmentData.laboratory_tests = selectedLaboratoryTests;
      }

      const response = await createAppointment(appointmentData);
      
      toast.success('Appointment request submitted successfully! You will receive a confirmation once reviewed by clinic staff.');
      
      // Navigate back to My Appointments
      setTimeout(() => {
        navigate('/patient/my-appointments');
      }, 1500);
    } catch (error) {
      console.error('Failed to create appointment:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create appointment. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/patient/my-appointments');
  };

  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#009DD1]" />
          <p className="text-slate-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {branding?.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={displayBrand}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 bg-[#009DD1] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  M
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-[#01377D]">{displayBrand}</h1>
                <p className="text-xs text-slate-500">Pareñas Medical Clinic</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-[#009DD1] hover:text-[#0077A8]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Appointments
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-2xl text-[#01377D]">Book New Appointment</CardTitle>
            <CardDescription>
              Please provide the details below to request your appointment.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Info Alert */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                Your appointment request will be reviewed and confirmed by the clinic staff.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date, Time, Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Preferred Date */}
                <div className="space-y-2">
                  <Label htmlFor="preferred_date" className="text-slate-700 font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    Preferred Date *
                  </Label>
                  <Input
                    id="preferred_date"
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => handleChange('preferred_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="border-slate-300"
                    required
                  />
                </div>

                {/* Preferred Time */}
                <div className="space-y-2">
                  <Label htmlFor="preferred_time" className="text-slate-700 font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Preferred Time *
                  </Label>
                  <Select
                    value={formData.preferred_time}
                    onValueChange={(value) => handleChange('preferred_time', value)}
                  >
                    <SelectTrigger className="border-slate-300 bg-white">
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 max-h-[300px]">
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Appointment Type */}
                <div className="space-y-2">
                  <Label htmlFor="appointment_type" className="text-slate-700 font-medium flex items-center gap-1">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Appointment Type *
                  </Label>
                  <Select
                    value={formData.appointment_type_id}
                    onValueChange={(value) => handleChange('appointment_type_id', value)}
                  >
                    <SelectTrigger className="border-slate-300 bg-white">
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preferred Physician */}
              <div className="space-y-2">
                <Label htmlFor="physician" className="text-slate-700 font-medium flex items-center gap-1">
                  <User className="w-4 h-4 text-slate-500" />
                  Preferred Physician
                </Label>
                <Select
                  value={formData.physician_id}
                  onValueChange={(value) => handleChange('physician_id', value)}
                >
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Select preferred physician" />
                  </SelectTrigger>
                  <SelectContent>
                    {physicians.map((physician) => (
                      <SelectItem key={physician.id} value={String(physician.id)}>
                        {physician.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Laboratory Services Section - Shown only when Laboratory is selected */}
              {isLaboratoryType() && (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-[#009DD1]" />
                    <h3 className="text-lg font-semibold text-[#01377D]">Laboratory Services</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Select one or more laboratory tests you would like to request.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(laboratoryTests).map(([category, tests]) => (
                      <div key={category} className="bg-white p-4 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-bold text-[#009DD1] mb-3 uppercase">
                          {category}
                        </h4>
                        <div className="space-y-2">
                          {tests.map((test) => (
                            <label
                              key={test}
                              className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedLaboratoryTests.includes(test)}
                                onChange={() => handleLaboratoryTestToggle(test)}
                                className="w-4 h-4 text-[#009DD1] border-slate-300 rounded focus:ring-[#009DD1]"
                              />
                              <span className="text-sm text-slate-700">{test}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedLaboratoryTests.length > 0 && (
                    <div className="mt-3 p-3 bg-white rounded border border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Selected Tests ({selectedLaboratoryTests.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedLaboratoryTests.map((test) => (
                          <span
                            key={test}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#009DD1] text-white text-xs rounded"
                          >
                            {test}
                            <button
                              type="button"
                              onClick={() => handleLaboratoryTestToggle(test)}
                              className="hover:bg-[#0077A8] rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reason for Visit */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-slate-700 font-medium flex items-center gap-1">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Reason for Visit *
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe the reason for your appointment..."
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  rows={5}
                  className="border-slate-300 resize-none"
                  required
                />
                <p className="text-xs text-slate-500">
                  {formData.reason.length}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#009DD1] text-white hover:bg-[#0077A8]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Request Appointment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;
