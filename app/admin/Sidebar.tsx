import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  ClipboardList, 
  DoorClosed, 
  Receipt, 
  MessageSquare, 
  Settings, 
  Building2, 
  BedDouble, 
  DollarSign,
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  Shield
} from "lucide-react";

export default function Sidebar({ isApproved, userApproved }: { isApproved: boolean, userApproved: boolean }) {
  const t = useTranslations('Sidebar');
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();

  const hotelRegistrationItem = {
    href: "/admin/hotel",
    icon: Building2,
    label: "Буудлын мэдээлэл",
  };

  const navItems = (isApproved && userApproved)
    ? [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Хяналтын самбар" },
        { href: "/admin/bookings", icon: ClipboardList, label: "Захиалгын жагсаалт" },
        { href: "/admin/room-blocks", icon: DoorClosed, label: "Өрөө блок" },
        { href: "/admin/billing", icon: Receipt, label: "Төлбөр тооцоо" },
        { href: "/admin/support", icon: MessageSquare, label: "Асуулт хариулт" },
      ]
    : [];

  const settingsItems = (isApproved && userApproved)
    ? [
        hotelRegistrationItem,
        { href: "/admin/room", icon: BedDouble, label: "Өрөө бүртгэл" },
        { href: "/admin/room/price", icon: DollarSign, label: "Өрөөний үнэ" },
        { href: "/admin/room/price-settings", icon: DollarSign, label: "Үнийн тохиргоо" },
        { href: "/admin/pricing", icon: DollarSign, label: "Үнийн тохируулга" },
        { href: "/admin/policies", icon: FileText, label: "Нөхцөл бодлого" },
        { href: "/admin/corporate", icon: Users, label: "Гэрээт байгууллага" },
        { href: "/admin/permissions", icon: Shield, label: "Админ эрх" },
      ]
    : [hotelRegistrationItem];

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">Hotel Admin</span>
            <span className="text-xs text-muted-foreground">Management</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {/* Main Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start h-10 font-medium transition-colors ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-3 h-4 w-4" />
                  <span className="text-cyrillic">{item.label}</span>
                </Link>
              </Button>
            );
          })}

          {navItems.length > 0 && <Separator className="my-3 bg-sidebar-border" />}

          {/* Settings Section */}
          <Collapsible open={isSettingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium"
              >
                <div className="flex items-center">
                  <Settings className="mr-3 h-4 w-4" />
                  <span className="text-cyrillic">Тохиргоо</span>
                </div>
                {isSettingsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1 mt-1">
              {settingsItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={`w-full justify-start h-9 pl-10 font-medium transition-colors ${
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                    asChild
                  >
                    <Link href={item.href}>
                      <Icon className="mr-3 h-3.5 w-3.5" />
                      <span className="text-cyrillic text-sm">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Status Badge */}
          <div className="mt-6 pt-4 border-t border-sidebar-border">
            <div className="rounded-md bg-sidebar-accent/50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-sidebar-foreground">Status</span>
                <Badge 
                  variant={isApproved && userApproved ? "default" : "secondary"} 
                  className={`text-xs ${
                    isApproved && userApproved 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }`}
                >
                  {isApproved && userApproved ? "Active" : "Setup Required"}
                </Badge>
              </div>
            </div>
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
}
