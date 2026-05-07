import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { UserCircle, Mail, User, Shield, Phone, MapPin, Calendar, AlertCircle, Activity } from 'lucide-react';
import { toast } from 'sonner';

export const Profile = () => {
  const { user, updateProfile, changePassword, isAdmin, isClinician, isPatient } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [patientCategory, setPatientCategory] = useState('none');
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || user.patient?.phone || '');
      setAddress(user.patient?.address || '');
      setEmergencyContactName(user.patient?.emergency_contact?.name || '');
      setEmergencyContactPhone(user.patient?.emergency_contact?.phone || '');
      setPatientCategory(user.patient?.patient_category || 'none');
      
      // Format date to yyyy-MM-dd for date input
      const dateValue = user.date_of_birth || user.patient?.date_of_birth || '';
      if (dateValue) {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          setDob(`${year}-${month}-${day}`);
        } else {
          setDob('');
        }
      } else {
        setDob('');
      }
    }
  }, [user]);

  const age = React.useMemo(() => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years -= 1;
    }
    return years >= 0 ? String(years) : '';
  }, [dob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone: phone || null,
        date_of_birth: dob || null,
      };

      if (isPatient) {
        payload.patient_date_of_birth = dob || null;
        payload.patient_category = patientCategory || 'none';
        payload.address = address || null;
        payload.emergency_contact_name = emergencyContactName || null;
        payload.emergency_contact_phone = emergencyContactPhone || null;
      }

      await updateProfile(payload);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangingPassword(false);
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Safe user data access with fallbacks
  const getUserInitial = () => {
    return user?.name?.charAt(0)?.toUpperCase() || 'U';
  };

  const getUserRole = () => {
    if (isAdmin) return 'admin';
    if (isClinician) return 'clinician';
    if (isPatient) return 'patient';
    return 'user';
  };

  const getUserId = () => {
    return user?.id || 'N/A';
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-[#01377D] text-white border-[#01377D]',
      clinician: 'bg-[#009DD1] text-white border-[#009DD1]',
      patient: 'bg-[#26B170] text-white border-[#26B170]',
      default: 'bg-[#97E7F5] text-[#01377D] border-[#97E7F5]'
    };
    return colors[role] || colors.default;
  };

  const inputClass =
    'h-10 rounded-lg border border-[#97E7F5] bg-white text-[#01377D] shadow-none outline-none transition-all duration-200 focus-visible:border-[#009DD1] focus-visible:ring-2 focus-visible:ring-[#97E7F5] focus-visible:ring-offset-0';

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <UserCircle className="w-20 h-20 text-[#97E7F5] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[#01377D] mb-2">Please log in</h2>
          <p className="text-[#009DD1]">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 pb-6 sm:px-4 sm:pb-8 lg:px-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header Section */}
        <div className="mb-5 sm:mb-7">
          <h1 className="text-2xl font-bold text-[#01377D] sm:text-3xl">Profile Settings</h1>
          <p className="mt-1 text-sm text-[#009DD1] sm:text-base">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="border-0 bg-gradient-to-br from-[#01377D] to-[#009DD1] text-white shadow-xl">
              <CardContent className="pt-5 text-center sm:pt-6">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-[#26B170] text-white text-3xl font-bold">
                    {getUserInitial()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{user.name || 'Unknown User'}</h2>
                <p className="text-[#97E7F5] mb-4 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email || 'No email'}
                </p>
                <Badge className={`${getRoleBadgeColor(getUserRole())} capitalize px-4 py-1 text-sm font-semibold`}>
                  {getUserRole()}
                </Badge>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-[#97E7F5] shadow-lg">
              <CardHeader className="bg-[#97E7F5]/20 border-b border-[#97E7F5]">
                <CardTitle className="flex items-center gap-2 text-[#01377D]">
                  <Activity className="w-5 h-5 text-[#009DD1]" />
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 sm:pt-6">
                {/* User ID hidden for privacy */}
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#97E7F5]/10">
                  <span className="text-[#01377D] font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#26B170]" />
                    Status
                  </span>
                  <Badge className="bg-[#7ED348] text-white border-0">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#97E7F5]/10">
                  <span className="text-[#01377D] font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#009DD1]" />
                    Joined
                  </span>
                  <span className="text-[#01377D] text-sm">
                    {new Date(user.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Editable Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile Form */}
            <Card className="border-[#97E7F5] shadow-lg">
              <CardHeader className="bg-[#97E7F5]/20 border-b border-[#97E7F5]">
                <CardTitle className="flex items-center gap-2 text-[#01377D]">
                  <User className="w-5 h-5 text-[#009DD1]" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-[#009DD1]">
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-[#01377D] font-semibold">
                        <User className="w-4 h-4 text-[#009DD1]" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        disabled={loading}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-[#01377D] font-semibold">
                        <Mail className="w-4 h-4 text-[#009DD1]" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        disabled={loading}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-[#01377D] font-semibold">
                        <Phone className="w-4 h-4 text-[#009DD1]" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        disabled={loading}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob" className="flex items-center gap-2 text-[#01377D] font-semibold">
                        <Calendar className="w-4 h-4 text-[#009DD1]" />
                        Date of Birth
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        disabled={loading}
                        className={inputClass}
                      />
                    </div>

                    {isPatient && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="age" className="flex items-center gap-2 text-[#01377D] font-semibold">
                            <Calendar className="w-4 h-4 text-[#009DD1]" />
                            Age
                          </Label>
                          <Input
                            id="age"
                            type="text"
                            value={age}
                            disabled
                            placeholder="Age auto-computed from date of birth"
                            className="h-10 rounded-lg border border-[#97E7F5] bg-slate-50 text-slate-600 shadow-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-[#01377D] font-semibold">
                            <Activity className="w-4 h-4 text-[#009DD1]" />
                            PWD / Senior Status
                          </Label>
                          <div className="space-y-2 rounded-lg border border-[#97E7F5] bg-[#97E7F5]/10 p-3">
                            {[
                              { value: 'none', label: 'No special status' },
                              { value: 'pwd', label: 'PWD' },
                              { value: 'senior', label: 'Senior Citizen' },
                            ].map((option) => (
                              <label key={option.value} className="flex cursor-pointer items-center gap-2">
                                <Checkbox
                                  className="border-[#97E7F5] data-[state=checked]:border-[#009DD1] data-[state=checked]:bg-[#009DD1]"
                                  checked={patientCategory === option.value}
                                  onCheckedChange={(checked) => {
                                    if (checked) setPatientCategory(option.value);
                                  }}
                                  disabled={loading}
                                />
                                <span className="text-sm text-[#01377D]">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address" className="flex items-center gap-2 text-[#01377D] font-semibold">
                            <MapPin className="w-4 h-4 text-[#009DD1]" />
                            Address
                          </Label>
                          <Input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your current address"
                            disabled={loading}
                            className={inputClass}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactName" className="flex items-center gap-2 text-[#01377D] font-semibold">
                            <User className="w-4 h-4 text-[#009DD1]" />
                            Emergency Contact Name
                          </Label>
                          <Input
                            id="emergencyContactName"
                            type="text"
                            value={emergencyContactName}
                            onChange={(e) => setEmergencyContactName(e.target.value)}
                            placeholder="Who should we contact in emergencies?"
                            disabled={loading}
                            className={inputClass}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactPhone" className="flex items-center gap-2 text-[#01377D] font-semibold">
                            <Phone className="w-4 h-4 text-[#009DD1]" />
                            Emergency Contact Number
                          </Label>
                          <Input
                            id="emergencyContactPhone"
                            type="tel"
                            value={emergencyContactPhone}
                            onChange={(e) => setEmergencyContactPhone(e.target.value)}
                            placeholder="Emergency contact phone number"
                            disabled={loading}
                            className={inputClass}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end pt-2 sm:pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="h-10 w-full bg-[#26B170] px-8 py-2 font-semibold text-white transition-all duration-300 hover:bg-[#7ED348] sm:w-auto sm:hover:scale-105"
                    >
                      {loading ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card className="border-[#97E7F5] shadow-lg">
              <CardHeader className="bg-[#97E7F5]/20 border-b border-[#97E7F5]">
                <CardTitle className="flex items-center gap-2 text-[#01377D]">
                  <Shield className="w-5 h-5 text-[#009DD1]" />
                  Security
                </CardTitle>
                <CardDescription className="text-[#009DD1]">
                  Change your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                {!changingPassword ? (
                  <div className="flex justify-end">
                    <Button onClick={() => setChangingPassword(true)} className="h-10 w-full bg-[#009DD1] text-white hover:bg-[#0284c7] sm:w-auto">Change Password</Button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label className="text-[#01377D]">Current Password</Label>
                      <Input className={inputClass} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={loading} />
                    </div>
                    <div>
                      <Label className="text-[#01377D]">New Password</Label>
                      <Input className={inputClass} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
                    </div>
                    <div>
                      <Label className="text-[#01377D]">Confirm New Password</Label>
                      <Input className={inputClass} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
                    </div>
                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setChangingPassword(false)}
                        className="h-10 w-full border-[#97E7F5] text-[#01377D] hover:bg-[#97E7F5]/20 sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="h-10 w-full bg-[#26B170] text-white hover:bg-[#7ED348] sm:w-auto">{loading ? 'Updating...' : 'Update Password'}</Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Role-Specific Information */}
            {isClinician && (
              <Card className="border-[#009DD1] shadow-lg">
                <CardHeader className="bg-[#009DD1]/10 border-b border-[#009DD1]">
                  <CardTitle className="flex items-center gap-2 text-[#01377D]">
                    <Shield className="w-5 h-5 text-[#009DD1]" />
                    Professional Information
                  </CardTitle>
                  <CardDescription className="text-[#009DD1]">
                    Staff and administrative details
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-[#009DD1]" />
                        <span className="text-sm font-semibold text-[#01377D]">Department</span>
                      </div>
                      <p className="text-[#01377D] bg-[#97E7F5]/20 rounded-lg p-3">
                        {user.department || 'University Clinic'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-[#009DD1]" />
                        <span className="text-sm font-semibold text-[#01377D]">Access Level</span>
                      </div>
                      <Badge className={`${getRoleBadgeColor(getUserRole())} capitalize text-base px-4 py-2`}>
                        {getUserRole()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;