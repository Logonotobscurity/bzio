import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserProfile, getNotificationPreferences } from '../_actions/settings';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/settings');
  }

  // Fetch full profile data and notification preferences
  const [profile, notificationPrefs] = await Promise.all([
    getUserProfile(),
    getNotificationPreferences(),
  ]);

  return <SettingsClient profile={profile} notificationPrefs={notificationPrefs} />;
}
