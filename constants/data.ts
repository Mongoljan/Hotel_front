import { 
  IconDashboard, 
  IconClipboardList, 
  IconBed, 
  IconReceipt, 
  IconMessageCircle,
  IconSettings,
  IconBuilding,
  IconCurrencyDollar,
  IconFileText,
  IconUsers,
  IconShield,
  IconUser,
  IconLogin
} from '@tabler/icons-react';

export type NavItem = {
  title: string;
  url: string;
  icon: any;
  isActive?: boolean;
  shortcut?: string[];
  items?: NavItem[];
};

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: IconDashboard,
    shortcut: ['d', 'd'],
  },
  {
    title: 'Захиалгууд',
    url: '/admin/bookings',
    icon: IconClipboardList,
    shortcut: ['b', 'b'],
  },
  {
    title: 'Өрөөнүүд',
    url: '/admin/room',
    icon: IconBed,
    shortcut: ['r', 'r'],
  },
  {
    title: 'Төлбөр тооцоо',
    url: '/admin/billing',
    icon: IconReceipt,
    shortcut: ['p', 'p'],
  },
  {
    title: 'Дэмжлэг',
    url: '/admin/support',
    icon: IconMessageCircle,
    shortcut: ['s', 's'],
  },
  {
    title: 'Тохиргоо',
    url: '#',
    icon: IconSettings,
    isActive: false,
    items: [
      {
        title: 'Буудлын мэдээлэл',
        url: '/admin/hotel',
        icon: IconBuilding,
      },
      {
        title: 'Өрөөний үнэ',
        url: '/admin/room/price',
        icon: IconCurrencyDollar,
      },
      {
        title: 'Бодлого',
        url: '/admin/policies',
        icon: IconFileText,
      },
      {
        title: 'Байгууллага',
        url: '/admin/corporate',
        icon: IconUsers,
      },
      {
        title: 'Эрх',
        url: '/admin/permissions',
        icon: IconShield,
      },
    ],
  },
];

export type Company = {
  name: string;
  logo: any;
  plan: string;
};

export const company: Company = {
  name: 'Hotel Admin',
  logo: IconBuilding,
  plan: 'Professional',
};