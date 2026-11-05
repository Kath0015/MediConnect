import React from 'react';
import { Bell } from 'lucide-react';
import NotificationFeed from '../../components/NotificationFeed';

const ClinicianNotifications = () => {
  return <NotificationFeed colorClass="bg-[#26B170]/10" icon={Bell} />;
};

export default ClinicianNotifications;
