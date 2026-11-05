import React from 'react';
import { Bell } from 'lucide-react';
import NotificationFeed from '../../components/NotificationFeed';

const Notifications = () => {
  return <NotificationFeed colorClass="bg-[#009DD1]/10" icon={Bell} />;
};

export default Notifications;
