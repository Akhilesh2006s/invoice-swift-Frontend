import { Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ChatbotModal from "./ChatbotModal";

export function AppHeader() {
  const [companyName, setCompanyName] = useState("YOUR BUSINESS NAME");
  const [companyLogo, setCompanyLogo] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchCompanyProfile();
    fetchUserInfo();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/company', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const company = await response.json();
        setCompanyName(company.businessName || company.companyName || "YOUR BUSINESS NAME");
        setCompanyLogo(company.companyLogo || "");
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserEmail(user.email || '');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowChatbot(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (searchQuery.trim()) {
        setShowChatbot(true);
      }
    }
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setShowChatbot(true);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        
        {/* Logo and Business Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* Custom Invoice Logo */}
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="2" width="10" height="14" rx="1" fill="white"/>
                <rect x="4.5" y="4" width="7" height="0.8" fill="black"/>
                <rect x="4.5" y="5.5" width="5" height="0.8" fill="black"/>
                <rect x="4.5" y="7" width="6" height="0.8" fill="black"/>
                <rect x="4.5" y="8.5" width="4" height="0.8" fill="black"/>
                <rect x="4.5" y="11" width="7" height="1" fill="black"/>
                <text x="10" y="15" fontFamily="Arial" fontSize="6" fontWeight="bold" textAnchor="middle" fill="black">₹</text>
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">InvoiceSwift</span>
            <div className="w-6 h-1 bg-black rounded-full"></div>
          </div>
          
          <div className="border-l border-border pl-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                {companyLogo ? (
                  <img src={companyLogo} alt="Company Logo" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-yellow-500 text-white text-xs font-medium">
                    {companyName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="text-sm font-medium text-foreground">{companyName}</div>
                <Link to="/company-profile" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  + Add Another Company
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your business..." 
              className="pl-10 bg-muted/50 border-border focus-visible:ring-1"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">ctrl+k</span>
              </kbd>
            </div>
          </div>
        </form>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Link to="/settings/profile">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        
        <Avatar className="w-8 h-8 ml-2">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Chatbot Modal */}
      <ChatbotModal 
        isOpen={showChatbot} 
        onClose={() => setShowChatbot(false)} 
      />
    </header>
  );
}
