import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconSettings,
  IconChevronDown,
  IconChevronRight,
  IconUserCheck,
  IconClipboardCheck,
  IconFileText,
} from "@tabler/icons-react";

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Хяналтын самбар",
    href: "/superadmin/dashboard",
    icon: <IconDashboard className="h-5 w-5" />,
  },
  {
    label: "Зөвшөөрлийн удирдлага",
    href: "/superadmin/approvals",
    icon: <IconClipboardCheck className="h-5 w-5" />,
  },
  {
    label: "Эзэдийн удирдлага",
    href: "/superadmin/owners",
    icon: <IconUserCheck className="h-5 w-5" />,
  },
  {
    label: "Зочид буудлууд",
    href: "/superadmin/hotels",
    icon: <IconBuilding className="h-5 w-5" />,
  },
  {
    label: "Гэрээний үнэ",
    href: "/superadmin/commissions",
    icon: <IconFileText className="h-5 w-5" />,
  },
  {
    label: "Хэрэглэгчид",
    href: "/superadmin/users",
    icon: <IconUsers className="h-5 w-5" />,
  },
  {
    label: "Тохиргоо",
    href: "/superadmin/settings",
    icon: <IconSettings className="h-5 w-5" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isActive(item.href);

    return (
      <div key={item.label}>
        {item.href && !hasChildren ? (
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
              "hover:bg-primary/10 hover:text-primary",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground",
              depth > 0 && "ml-6"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ) : (
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
              "hover:bg-primary/10 hover:text-primary",
              "text-muted-foreground",
              depth > 0 && "ml-6"
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {hasChildren &&
              (isExpanded ? (
                <IconChevronDown className="h-4 w-4" />
              ) : (
                <IconChevronRight className="h-4 w-4" />
              ))}
          </button>
        )}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col p-4">
      {/* Logo/Brand */}
      <div className="mb-8 flex items-center gap-3 px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <IconBuilding className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">SuperAdmin</h2>
          <p className="text-xs text-muted-foreground">Удирдлагын систем</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t pt-4">
        <p className="px-4 text-xs text-muted-foreground">
          © 2026 Hotel System
        </p>
      </div>
    </div>
  );
}
