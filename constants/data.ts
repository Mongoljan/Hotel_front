import { 
  IconDashboard, 
  IconClipboardList, 
  IconBed, 
  IconReceipt, 
  IconMessageCircle,
  IconSettings,
  IconBuilding,
  IconCurrencyDollar,
  IconUsers,
  IconUser,
  IconDoor,
  IconSparkles,
  IconUserPlus,
  IconCoins,
  IconScale
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
    title: 'Асуулт хариулт',
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
        title: 'Дотоод журам',
        i18nKey: 'internalRules',
        url: '/admin/internal-rules',
        icon: IconScale,
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
        title: 'Валют, төлбөрийн хэрэгсэл',
        i18nKey: 'currencyPayment',
        url: '/admin/currency',
        icon: IconCoins,
      },
      {
        title: 'Хэрэглэгчийн тохиргоо',
        i18nKey: 'userSettings',
        url: '/admin/users',
        icon: IconUser,
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