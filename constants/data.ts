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
  IconScale,
  IconCalendar,
  IconChecklist,
  IconFileText,
  IconWorld,
  IconHeadset
} from '@tabler/icons-react';

export type NavItem = {
  title: string;
  url: string;
  icon: any;
  isActive?: boolean;
  shortcut?: string[];
  items?: NavItem[];
  i18nKey?: string;
  badge?: number;
};

export type NavSection = {
  title: string;
  i18nKey: string;
  items: NavItem[];
};

// Dashboard - standalone item at top
export const dashboardItem: NavItem = {
  title: 'Хянах самбар',
  i18nKey: 'dashboard',
  url: '/admin/dashboard',
  icon: IconDashboard,
  shortcut: ['d', 'd'],
};

// Navigation sections based on new design
export const navSections: NavSection[] = [
  {
    title: 'Өдөр тутмын үйл ажиллагаа',
    i18nKey: 'dailyOperations',
    items: [
      {
        title: 'Front desk',
        i18nKey: 'frontDesk',
        url: '/admin/reception',
        icon: IconUsers,
        shortcut: ['f', 'f'],
      },
      {
        title: 'Захиалгууд',
        i18nKey: 'bookings',
        url: '/admin/bookings',
        icon: IconClipboardList,
        shortcut: ['b', 'b'],
      },
      {
        title: 'Зочид',
        i18nKey: 'guests',
        url: '/admin/guest-registration',
        icon: IconUserPlus,
        shortcut: ['g', 'g'],
      },
      {
        title: 'Өрөө цэвэрлэгээ',
        i18nKey: 'housekeeping',
        url: '/admin/housekeeping',
        icon: IconSparkles,
        shortcut: ['h', 'h'],
      },
      {
        title: 'Ажлын жагсаалт',
        i18nKey: 'taskList',
        url: '/admin/tasks',
        icon: IconChecklist,
        shortcut: ['t', 't'],
      },
    ],
  },
  {
    title: 'Бичиг баримт',
    i18nKey: 'documents',
    items: [
      {
        title: 'Онлайн захиалга',
        i18nKey: 'onlineBookings',
        url: '/admin/online-bookings',
        icon: IconWorld,
        shortcut: ['o', 'o'],
      },
      {
        title: 'Төлбөр тооцоо',
        i18nKey: 'billing',
        url: '/admin/billing',
        icon: IconReceipt,
        shortcut: ['p', 'p'],
      },
      {
        title: 'Шууд захиалга',
        i18nKey: 'directBooking',
        url: '/admin/direct-booking',
        icon: IconCalendar,
        shortcut: ['r', 'r'],
      },
      {
        title: 'Тайлан',
        i18nKey: 'reports',
        url: '/admin/reports',
        icon: IconFileText,
        shortcut: ['l', 'l'],
      },
    ],
  },
  {
    title: 'Бусад',
    i18nKey: 'others',
    items: [
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
            title: 'Өрөө блок',
            i18nKey: 'roomBlocks',
            url: '/admin/room-blocks',
            icon: IconDoor,
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
      {
        title: 'Дэмжлэг',
        i18nKey: 'support',
        url: '/admin/support',
        icon: IconHeadset,
        shortcut: ['s', 's'],
      },
    ],
  },
];

// Legacy navItems for backward compatibility (flattened version)
export const navItems: NavItem[] = [
  dashboardItem,
  ...navSections.flatMap(section => section.items),
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