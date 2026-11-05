import React from 'react';
import { Bell } from 'lucide-react';
import NotificationFeed from '../../components/NotificationFeed';

const DoctorNotifications = () => {
  return <NotificationFeed colorClass="bg-[#7C3AED]/10" icon={Bell} />;
};

export default DoctorNotifications;
