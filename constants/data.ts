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
  i18nKey?: string;
};

export const navItems: NavItem[] = [
  {
    title: 'Хяналтын самбар',
    i18nKey: 'dashboard',
    url: '/admin/dashboard',
    icon: IconDashboard,
    shortcut: ['d', 'd'],
  },
  {
    title: 'Захиалгууд',
    i18nKey: 'bookings',
    url: '/admin/bookings',
    icon: IconClipboardList,
    shortcut: ['b', 'b'],
  },
  {
    title: 'Өрөөнүүд',
    i18nKey: 'rooms',
    url: '/admin/room',
    icon: IconBed,
    shortcut: ['r', 'r'],
  },
  {
    title: 'Төлбөр тооцоо',
    i18nKey: 'billing',
    url: '/admin/billing',
    icon: IconReceipt,
    shortcut: ['p', 'p'],
  },
  {
    title: 'Дэмжлэг',
    i18nKey: 'support',
    url: '/admin/support',
    icon: IconMessageCircle,
    shortcut: ['s', 's'],
  },
  {
    title: 'Тохиргоо',
    i18nKey: 'settings',
    url: '#',
    icon: IconSettings,
    isActive: false,
    items: [
      {
        title: 'Буудлын мэдээлэл',
        i18nKey: 'hotelInfo',
        url: '/admin/hotel',
        icon: IconBuilding,
      },
      {
        title: 'Өрөөний үнэ',
        i18nKey: 'roomPrice',
        url: '/admin/room/price',
        icon: IconCurrencyDollar,
      },
      {
        title: 'Үнийн тохиргоо',
        i18nKey: 'priceSettings',
        url: '/admin/room/price-settings',
        icon: IconCurrencyDollar,
      },
      {
        title: 'Бодлого',
        i18nKey: 'policies',
        url: '/admin/policies',
        icon: IconFileText,
      },
      {
        title: 'Байгууллага',
        i18nKey: 'corporate',
        url: '/admin/corporate',
        icon: IconUsers,
      },
      {
        title: 'Эрх',
        i18nKey: 'permissions',
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