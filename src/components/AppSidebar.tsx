import { NavLink, useLocation } from "react-router-dom";
import { 
  ChevronDown, 
  Receipt, 
  CreditCard, 
  Mail, 
  RotateCcw,
  ShoppingCart,
  FileText,
  TrendingUp,
  Package,
  Warehouse,
  DollarSign,
  Users,
  Building2,
  BarChart3,
  FileBarChart,
  Store,
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  FileImage,
  Truck,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Sales",
    icon: TrendingUp,
    children: [
      { title: "Invoices", url: "/invoices", icon: Receipt },
      { title: "Credit Notes", url: "/credit-notes", icon: CreditCard },
      { title: "E-Invoices", url: "/e-invoices", icon: Mail },
    ]
  },
  {
    title: "Purchases",
    icon: ShoppingCart,
    children: [
      { title: "Purchases", url: "/purchases", icon: ShoppingCart },
      { title: "Purchase Orders", url: "/purchase-orders", icon: FileText },
      { title: "Debit Notes", url: "/debit-notes", icon: RotateCcw },
    ]
  },
  {
    title: "Quotations",
    icon: FileText,
    children: [
      { title: "Quotations", url: "/quotations", icon: FileText },
      { title: "Proforma", url: "/proformas", icon: FileText },
      { title: "Delivery Challans", url: "/delivery-challans", icon: Truck },
    ]
  },
  {
    title: "Expenses",
    icon: DollarSign,
    children: [
      { title: "Expenses", url: "/expenses", icon: DollarSign },
    ]
  },
  { title: "Products & Services", url: "/products", icon: Package },
  {
    title: "Inventory",
    icon: Warehouse,
    children: [
      { title: "Inventory", url: "/inventory", icon: Warehouse },
    ]
  },
  {
    title: "Payments",
    icon: DollarSign,
    children: [
      { title: "Payments", url: "/payments", icon: DollarSign },
      { title: "Customer Statements", url: "/customer-statements", icon: FileText },
    ]
  },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Vendors", url: "/vendors", icon: Building2 },
  { title: "Insights", url: "/insights", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileBarChart },
  { title: "OnlineStore", url: "/store", icon: Store },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "Profile", url: "/settings/profile", icon: User },
      { title: "Company", url: "/company-profile", icon: Building2 },
      { title: "Bank Accounts", url: "/settings/bank-accounts", icon: CreditCard },
      { title: "Signature", url: "/settings/signature", icon: FileImage },
      { title: "Invoice", url: "/settings/invoice", icon: Receipt },
      { title: "Notifications", url: "/settings/notifications", icon: Bell },
      { title: "Security", url: "/settings/security", icon: Shield },
      { title: "Appearance", url: "/settings/appearance", icon: Palette },
    ]
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={cn("border-r border-border", collapsed ? "w-14" : "w-64")} collapsible="icon">
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                if (item.children && item.children.length > 0) {
                  return (
                    <Collapsible key={item.title} defaultOpen={item.title === "Sales"}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between hover:bg-accent/50">
                            <div className="flex items-center">
                              <item.icon className="mr-3 h-4 w-4" />
                              {!collapsed && <span className="text-sm">{item.title}</span>}
                            </div>
                            {!collapsed && <ChevronDown className="h-4 w-4" />}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton asChild size="sm" isActive={isActive(child.url)}>
                                    <NavLink 
                                      to={child.url}
                                      className={cn(
                                        "flex items-center",
                                        getNavCls({ isActive: isActive(child.url) })
                                      )}
                                    >
                                      <child.icon className="mr-2 h-3 w-3" />
                                      <span>{child.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url!} 
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                          getNavCls({ isActive: isActive(item.url!) })
                        )}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile & Actions */}
        {!collapsed && user && (
          <div className="mt-auto border-t border-border pt-4">
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.name || user.email || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex-1"
                >
                  {theme === 'light' ? (
                    <Moon className="w-4 h-4 mr-2" />
                  ) : (
                    <Sun className="w-4 h-4 mr-2" />
                  )}
                  {theme === 'light' ? 'Dark' : 'Light'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed mode actions */}
        {collapsed && (
          <div className="mt-auto border-t border-border pt-4">
            <div className="flex flex-col gap-2 px-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-center"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
