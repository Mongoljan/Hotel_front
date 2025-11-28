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
  IconLogin,
  IconDoor,
  IconSparkles,
  IconUserPlus,
  IconCoins,
  IconHelp
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
    title: 'Ресепшн',
    i18nKey: 'reception',
    url: '/admin/reception',
    icon: IconUsers,
    shortcut: ['r', 'r'],
  },
  {
    title: 'Захиалгууд',
    i18nKey: 'bookings',
    url: '/admin/bookings',
    icon: IconClipboardList,
    shortcut: ['b', 'b'],
  },
  {
    title: 'Цэвэрлэгээ',
    i18nKey: 'housekeeping',
    url: '/admin/housekeeping',
    icon: IconSparkles,
    shortcut: ['h', 'h'],
  },
  {
    title: 'Өрөө блок',
    i18nKey: 'roomBlocks',
    url: '/admin/room-blocks',
    icon: IconDoor,
    shortcut: ['k', 'k'],
  },
  {
    title: 'Төлбөр тооцоо',
    i18nKey: 'billing',
    url: '/admin/billing',
    icon: IconReceipt,
    shortcut: ['p', 'p'],
  },
  {
    title: 'Зочны бүртгэл',
    i18nKey: 'guestRegistration',
    url: '/admin/guest-registration',
    icon: IconUserPlus,
    shortcut: ['g', 'g'],
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
        title: 'Өрөөнүүд',
        i18nKey: 'rooms',
        url: '/admin/room',
        icon: IconBed,
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
        title: 'Нэмэлт үйлчилгээ',
        i18nKey: 'additionalServices',
        url: '/admin/additional-services',
        icon: IconSparkles,
      },
      {
        title: 'Валют',
        i18nKey: 'currency',
        url: '/admin/currency',
        icon: IconCoins,
      },
      {
        title: 'Админ эрх',
        i18nKey: 'adminRights',
        url: '#',
        icon: IconShield,
        items: [
          {
            title: 'Ажилчид',
            i18nKey: 'workers',
            url: '/admin/workers',
            icon: IconUser,
          },
          {
            title: 'Эрх',
            i18nKey: 'permissions',
            url: '/admin/permissions',
            icon: IconShield,
          },
        ],
      },
      {
        title: 'Түгээмэл асуулт',
        i18nKey: 'faq',
        url: '/admin/faq',
        icon: IconHelp,
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