export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  memberSince: string;
}

export const mockProfile: UserProfile = {
  name: "Nyiko Mnisi",
  email: "nyikodeartkid@gmail.com",
  phone: "+27 82 123 4567",
  role: "Farm Owner",
  memberSince: "Jan 2023",
};

export interface ProfileMenuItem {
  id: string;
  icon: "person-outline" | "notifications-outline" | "location-outline" | "shield-checkmark-outline" | "help-circle-outline" | "document-text-outline" | "log-out-outline";
  label: string;
  danger?: boolean;
}

export const profileMenu: ProfileMenuItem[] = [
  { id: "account", icon: "person-outline", label: "Account Details" },
  { id: "notifications", icon: "notifications-outline", label: "Notification Preferences" },
  { id: "location", icon: "location-outline", label: "Farm Location" },
  { id: "privacy", icon: "shield-checkmark-outline", label: "Privacy & Security" },
  { id: "help", icon: "help-circle-outline", label: "Help & Support" },
  { id: "terms", icon: "document-text-outline", label: "Terms & Policies" },
  { id: "logout", icon: "log-out-outline", label: "Log Out", danger: true },
];
