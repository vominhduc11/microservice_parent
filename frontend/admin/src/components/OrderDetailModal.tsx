
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types";
import { Package, Hash, CheckCircle, AlertTriangle } from "lucide-react";
import { serialService } from "@/services/serialService";
import { useState, useEffect } from "react";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

interface OrderItemSerial {
  id: number;
  serial: string;
  productId: number;
  productName: string;
  status: string;
  orderItemId: number;
  dealerId: number | null;
}

export function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  const [itemSerials, setItemSerials] = useState<Map<number, OrderItemSerial[]>>(new Map());
  const [itemAllocatedSerials, setItemAllocatedSerials] = useState<Map<number, OrderItemSerial[]>>(new Map());
  const [loadingSerials, setLoadingSerials] = useState<Set<number>>(new Set());


  // Load serials khi modal mở
  useEffect(() => {
    const loadSerials = async () => {
      if (!isOpen || !order?.items) return;

      // Reset state
      setItemSerials(new Map());
      setItemAllocatedSerials(new Map());
      setLoadingSerials(new Set());

      // Load serials cho tất cả order items
      for (const item of order.items) {
        if (item.id) {
          try {
            setLoadingSerials(prev => new Set([...prev, item.id]));

            // Load assigned serials
            const serials = await serialService.getSerialsByOrderItem(item.id);
            setItemSerials(prev => new Map([...prev, [item.id, serials]]));

            // Load allocated serials
            try {
              const allocatedSerials = await serialService.getAllocatedSerialsByOrderItem(item.id);
              setItemAllocatedSerials(prev => new Map([...prev, [item.id, allocatedSerials]]));
            } catch (allocatedError) {
              console.warn('No allocated serials found for order item:', item.id);
              setItemAllocatedSerials(prev => new Map([...prev, [item.id, []]]));
            }

          } catch (error) {
            console.error('Failed to load serials for order item:', item.id, error);
          } finally {
            setLoadingSerials(prev => {
              const newSet = new Set(prev);
              newSet.delete(item.id);
              return newSet;
            });
          }
        }
      }
    };

    loadSerials();
  }, [isOpen, order]);

  // Helper function to check if item has serials assigned
  const hasSerials = (item: any) => {
    const assignedSerials = item.id && itemSerials.has(item.id) ? itemSerials.get(item.id)!.length : 0;
    const allocatedSerials = item.id && itemAllocatedSerials.has(item.id) ? itemAllocatedSerials.get(item.id)!.length : 0;
    const legacySerials = item.serialNumbers ? item.serialNumbers.length : 0;

    return assignedSerials > 0 || allocatedSerials > 0 || legacySerials > 0;
  };

  // Helper function to get serial assignment status
  const getSerialStatus = (item: any) => {
    // Lấy số lượng serial từ các nguồn khác nhau
    const assignedSerials = item.id && itemSerials.has(item.id) ? itemSerials.get(item.id)!.length : 0;
    const allocatedSerials = item.id && itemAllocatedSerials.has(item.id) ? itemAllocatedSerials.get(item.id)!.length : 0;
    const legacySerials = item.serialNumbers?.length || 0;

    // Ưu tiên status từ API trước
    if (item.status) {
      switch (item.status) {
        case 'COMPLETED':
          // Nếu có allocated serials thì đó là allocated, còn không thì complete
          return allocatedSerials > 0 ? 'allocated' : 'complete';
        case 'PARTIAL':
          return 'partial';
        case 'PENDING':
          return 'missing';
        default:
          break;
      }
    }

    // Logic fallback dựa trên số lượng serial
    const totalAssignedCount = Math.max(assignedSerials, legacySerials);
    const needsSerial = item.quantity > 0;

    if (!needsSerial) return null;

    // Nếu có allocated serials thì đó là trạng thái đã phân bổ
    if (allocatedSerials > 0) {
      return 'allocated';
    }

    // Logic cho assigned serials
    if (totalAssignedCount === item.quantity) return 'complete';
    if (totalAssignedCount > 0) return 'partial';
    return 'missing';
  };

  // Get serials for display
  const getSerialsForDisplay = (item: any) => {
    const allocatedSerials = item.id && itemAllocatedSerials.has(item.id) ? itemAllocatedSerials.get(item.id)!.map(s => s.serial) : [];

    // Nếu có allocated serials, hiển thị chúng thay vì assigned serials
    if (allocatedSerials.length > 0) {
      return allocatedSerials;
    }

    // Fallback về assigned serials hoặc legacy serials
    if (item.id && itemSerials.has(item.id)) {
      return itemSerials.get(item.id)!.map(s => s.serial);
    }
    return item.serialNumbers || [];
  };

  // Early return after all hooks
  if (!order) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-500">Không có thông tin đơn hàng</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold dark:text-gray-100">Đơn hàng #{order.orderCode}</h2>
              <p className="text-gray-600 dark:text-gray-400">Ngày đặt: {order.date}</p>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Thông tin khách hàng</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tên công ty:</span>
                <span className="font-medium dark:text-gray-100">{order.customer}</span>
              </div>
              {order.dealerPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Số điện thoại:</span>
                  <span className="font-medium dark:text-gray-100">{order.dealerPhone}</span>
                </div>
              )}
              {order.dealerEmail && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium dark:text-gray-100">{order.dealerEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Products */}
          <div>
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Sản phẩm đã đặt</h3>
            <div className="border dark:border-gray-600 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-gray-600 dark:text-gray-200">Sản phẩm</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600 dark:text-gray-200">Số lượng</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600 dark:text-gray-200">Serial</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-600 dark:text-gray-200">Đơn giá</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-600 dark:text-gray-200">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, index) => {
                    const serialStatus = getSerialStatus(item);
                    const serialCount = item.serialNumbers?.length || 0;

                    return (
                      <tr key={item.id} className="border-t dark:border-gray-600">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex-shrink-0 overflow-hidden">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full flex items-center justify-center ${item.image ? 'hidden' : ''}`}>
                                <Package className="h-6 w-6 text-gray-400 dark:text-gray-300" />
                              </div>
                            </div>
                            <div>
                              <div className="font-medium dark:text-gray-100">{item.name}</div>
                              {item.sku && (
                                <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center dark:text-gray-100">{item.quantity}</td>
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {/* Loading state */}
                            {item.id && loadingSerials.has(item.id) ? (
                              <Badge variant="outline" className="text-gray-600">
                                Đang tải...
                              </Badge>
                            ) : (
                              <>
                                {/* Serial Status Badge */}
                                {serialStatus === 'allocated' && (
                                  <Badge className="bg-purple-100 text-purple-800">
                                    <Package className="h-3 w-3 mr-1" />
                                    Đã phân phối ({item.id && itemAllocatedSerials.has(item.id) ? itemAllocatedSerials.get(item.id)!.length : 0}/{item.quantity})
                                  </Badge>
                                )}
                                {serialStatus === 'complete' && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Đủ ({item.id && itemSerials.has(item.id) ? itemSerials.get(item.id)!.length : item.serialNumbers?.length || 0}/{item.quantity})
                                  </Badge>
                                )}
                                {serialStatus === 'partial' && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Thiếu ({item.id && itemSerials.has(item.id) ? itemSerials.get(item.id)!.length : item.serialNumbers?.length || 0}/{item.quantity})
                                  </Badge>
                                )}
                                {serialStatus === 'missing' && (
                                  <Badge variant="outline" className="text-gray-600">
                                    <Hash className="h-3 w-3 mr-1" />
                                    Chưa gán (0/{item.quantity})
                                  </Badge>
                                )}

                                {/* Serial Numbers List - chỉ hiển thị khi không phải trạng thái allocated */}
                                {serialStatus !== 'allocated' && hasSerials(item) && (
                                  <div className="mt-1">
                                    <div className="flex flex-wrap gap-1 justify-center">
                                      {getSerialsForDisplay(item).slice(0, 3).map((serial: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs font-mono">
                                          {serial}
                                        </Badge>
                                      ))}
                                      {getSerialsForDisplay(item).length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{getSerialsForDisplay(item).length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Message for allocated items */}
                                {serialStatus === 'allocated' && (
                                  <div className="mt-1">
                                    <p className="text-xs text-purple-600">
                                      Serials đã được phân phối cho đại lý
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right dark:text-gray-100">{item.price?.toLocaleString('vi-VN')} ₫</td>
                        <td className="p-3 text-right font-medium text-blue-600 dark:text-blue-400">
                          {item.total?.toLocaleString('vi-VN')} ₫
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Tổng kết đơn hàng</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Số lượng sản phẩm:</span>
                <span className="font-medium dark:text-gray-100">{order.items?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tạm tính:</span>
                <span className="dark:text-gray-100">{order.subtotal} ₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">VAT (10%):</span>
                <span className="dark:text-gray-100">{order.vat} ₫</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span className="dark:text-gray-100">Tổng cộng:</span>
                <span className="text-blue-600 dark:text-blue-400">{order.total} ₫</span>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
