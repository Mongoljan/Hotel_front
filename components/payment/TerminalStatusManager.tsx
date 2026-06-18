'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  MoreHorizontal,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Activity,
  Settings,
  Eye,
  Trash2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentConfig, TerminalStatus } from '@/types/payment';
import { toast } from 'sonner';

// Terminal status mapping
const terminalStatusConfig = {
  active: {
    icon: CheckCircle,
    label: 'Идэвхтэй',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  inactive: {
    icon: XCircle,
    label: 'Идэвхгүй',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  error: {
    icon: AlertCircle,
    label: 'Алдаа',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
};

interface TerminalStatusManagerProps {
  paymentConfigs: PaymentConfig[];
  onRefresh: () => void;
}

export function TerminalStatusManager({ paymentConfigs, onRefresh }: TerminalStatusManagerProps) {
  const [terminalStatuses, setTerminalStatuses] = useState<TerminalStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<TerminalStatus | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Get POS terminal configs
  const posConfigs = paymentConfigs.filter(config => config.payment_type === 'bank_card');

  // Simulate terminal statuses (in real app, this would fetch from API)
  useEffect(() => {
    const mockStatuses: TerminalStatus[] = posConfigs.map((config, index) => ({
      id: config.terminal_id || `terminal_${config.id}` || `terminal_${Date.now()}_${index}`,
      bank_name: config.bank?.name || 'Unknown Bank',
      terminal_id: config.terminal_id || `T${config.id}` || `T${Date.now()}_${index}`,
      status: index % 3 === 0 ? 'error' : index % 2 === 0 ? 'inactive' : 'active',
      last_transaction: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      created_at: config.created_at || new Date().toISOString()
    }));
    setTerminalStatuses(mockStatuses);
  }, [posConfigs]);

  const handleRefreshStatus = async (terminalId: string) => {
    setLoading(true);
    try {
      // Simulate API call to refresh terminal status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update terminal status randomly for demo
      setTerminalStatuses(prev => prev.map(terminal => 
        terminal.id === terminalId 
          ? { 
              ...terminal, 
              status: Math.random() > 0.7 ? 'error' : Math.random() > 0.3 ? 'active' : 'inactive',
              last_transaction: new Date().toISOString()
            }
          : terminal
      ));
      
      toast.success('Терминалын статус шинэчлэгдлээ');
    } catch (error) {
      console.error('Error refreshing terminal status:', error);
      toast.error('Статус шинэчлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (terminal: TerminalStatus) => {
    setSelectedTerminal(terminal);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status: TerminalStatus['status']) => {
    const config = terminalStatusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge className={cn("gap-1", config.bgColor, config.textColor, config.borderColor)}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatLastTransaction = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} өдрийн өмнө`;
    } else if (diffHours > 0) {
      return `${diffHours} цагийн өмнө`;
    } else {
      return 'Саяхан';
    }
  };

  if (posConfigs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">ПОС терминал байхгүй</h3>
          <p className="text-muted-foreground">
            Эхлээд ПОС терминалын тохиргоо нэмж оруулна уу
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Terminal Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {terminalStatuses.map((terminal) => {
            const statusConfig = terminalStatusConfig[terminal.status];
            const StatusIcon = statusConfig.icon;
            
            return (
              <motion.div
                key={terminal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    statusConfig.borderColor
                  )}
                  onClick={() => handleViewDetails(terminal)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          statusConfig.bgColor
                        )}>
                          <CreditCard className={cn("h-4 w-4", statusConfig.textColor)} />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{terminal.bank_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ПОС Терминал #{terminal.terminal_id}
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(terminal)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Дэлгэрэнгүй
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => terminal.id && handleRefreshStatus(terminal.id)}
                            disabled={loading}
                          >
                            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                            Статус шинэчлэх
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {}}>
                            <Settings className="h-4 w-4 mr-2" />
                            Тохиргоо
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2">
                      {getStatusBadge(terminal.status)}
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Сүүлийн гүйлгээ: {terminal.last_transaction ? formatLastTransaction(terminal.last_transaction) : 'Мэдээлэл байхгүй'}
                      </div>

                      {terminal.status === 'active' && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Wifi className="h-3 w-3" />
                          Холбогдсон
                        </div>
                      )}
                      
                      {terminal.status === 'error' && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <WifiOff className="h-3 w-3" />
                          Холболт алдагдсан
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Detailed Table View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Терминалуудын төлөв
          </CardTitle>
          <CardDescription>
            Бүх ПОС терминалуудын дэлгэрэнгүй мэдээлэл
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {Object.entries(terminalStatusConfig).map(([status, config]) => {
                  const count = terminalStatuses.filter(t => t.status === status).length;
                  const IconComponent = config.icon;
                  
                  return (
                    <Badge
                      key={status}
                      variant="outline"
                      className={cn("gap-1", config.bgColor, config.textColor)}
                    >
                      <IconComponent className="h-3 w-3" />
                      {config.label}: {count}
                    </Badge>
                  );
                })}
              </div>
              
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Бүгдийг шинэчлэх
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Терминал</TableHead>
                  <TableHead>Банк</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead>Сүүлийн гүйлгээ</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terminalStatuses.map((terminal) => (
                  <TableRow key={terminal.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {terminal.terminal_id}
                    </TableCell>
                    <TableCell>{terminal.bank_name}</TableCell>
                    <TableCell>{getStatusBadge(terminal.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {terminal.last_transaction ? formatLastTransaction(terminal.last_transaction) : 'Мэдээлэл байхгүй'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(terminal)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Дэлгэрэнгүй
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => terminal.id && handleRefreshStatus(terminal.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Статус шинэчлэх
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Terminal Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Терминалын дэлгэрэнгүй мэдээлэл
            </DialogTitle>
            <DialogDescription>
              {selectedTerminal?.bank_name} - ПОС Терминал
            </DialogDescription>
          </DialogHeader>

          {selectedTerminal && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Терминалын ID
                  </label>
                  <p className="text-sm font-mono">
                    {selectedTerminal.terminal_id}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Төлөв
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedTerminal.status)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Банк
                </label>
                <p className="text-sm">{selectedTerminal.bank_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Сүүлийн гүйлгээ
                </label>
                <p className="text-sm">
                  {selectedTerminal.last_transaction ? formatLastTransaction(selectedTerminal.last_transaction) : 'Мэдээлэл байхгүй'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Үүсгэсэн огноо
                </label>
                <p className="text-sm">
                  {new Date(selectedTerminal.created_at).toLocaleDateString('mn-MN')}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Хаах
            </Button>
            {selectedTerminal && selectedTerminal.id && (
              <Button onClick={() => handleRefreshStatus(selectedTerminal.id)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Статус шинэчлэх
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TerminalStatusManager;