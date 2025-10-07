import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  Filter,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  RotateCcw,
  Archive,
  Hash,
  Settings,
  AlertTriangle,
  Download,
  Printer,
  CheckSquare,
  Square,
} from "lucide-react";
import { OrderDeleteDialog } from "./OrderDeleteDialog";
import { FilterModal } from "./FilterModal";
import { OrderDetailModal } from "./OrderDetailModal";
import { SerialAssignmentModal } from "./SerialAssignmentModal";
import { useToast } from "@/hooks/use-toast";
import { Order, OrderItem } from "@/types";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { serialService } from "@/services/serialService";
import * as XLSX from 'xlsx';
import { VAT_RATE } from "@/constants/business";
import { useDebounce } from "@/hooks/useDebounce";

const ITEMS_PER_PAGE = 10;

// Product info cache to avoid repeated API calls
const productInfoCache = new Map<number, {name: string, image: string}>();

// Dealer info cache to avoid repeated API calls
const dealerInfoCache = new Map<number, {companyName: string, phone: string, email: string, accountId: number}>();

const getProductInfo = async (productId: number): Promise<{name: string, image: string}> => {
  if (productInfoCache.has(productId)) {
    return productInfoCache.get(productId)!;
  }

  try {
    const result = await productService.getProductInfo(productId);

    if (!result.success) {
      throw new Error(result.message || 'API call failed');
    }

    // Parse image data (it's a JSON string)
    let imageUrl = '';
    if (result.data.image) {
      try {
        const imageData = JSON.parse(result.data.image);
        imageUrl = imageData.imageUrl || '';
      } catch (e) {
        console.warn('Failed to parse image data:', result.data.image);
      }
    }

    const productInfo = {
      name: result.data.name || `Sản phẩm #${productId}`,
      image: imageUrl
    };

    productInfoCache.set(productId, productInfo);
    return productInfo;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    const fallbackInfo = {
      name: `Sản phẩm #${productId}`,
      image: ''
    };
    productInfoCache.set(productId, fallbackInfo);
    return fallbackInfo;
  }
};

const getDealerInfo = async (dealerId: number): Promise<{companyName: string, phone: string, email: string, accountId: number}> => {
  if (dealerInfoCache.has(dealerId)) {
    return dealerInfoCache.get(dealerId)!;
  }

  try {
    const response = await orderService.getDealerInfo(dealerId);
    console.log(`📡 Dealer ${dealerId} API response:`, response);

    if (response.success && response.data) {
      const dealerInfo = {
        companyName: response.data.companyName || `Dealer #${dealerId}`,
        phone: response.data.phone || '',
        email: response.data.email || '',
        accountId: response.data.accountId || dealerId
      };

      dealerInfoCache.set(dealerId, dealerInfo);
      return dealerInfo;
    } else {
      throw new Error(response.message || 'API call failed');
    }
  } catch (error) {
    console.error(`Error fetching dealer ${dealerId}:`, error);
    const fallbackInfo = {
      companyName: `Dealer #${dealerId}`,
      phone: '',
      email: '',
      accountId: dealerId
    };
    dealerInfoCache.set(dealerId, fallbackInfo);
    return fallbackInfo;
  }
};

const getPaymentStatusDisplay = (status: 'PAID' | 'UNPAID') => {
  if (status === 'PAID') {
    return {
      text: 'Đã trả',
      icon: CheckCircle,
      className: 'text-green-600 dark:text-green-400'
    };
  } else {
    return {
      text: 'Chưa trả',
      icon: XCircle,
      className: 'text-red-600 dark:text-red-400'
    };
  }
};

// Helper function to transform API data for display
const transformOrderForDisplay = async (apiOrder: Order): Promise<Order> => {
  // Get dealer information
  const dealerInfo = await getDealerInfo(apiOrder.idDealer);

  // Transform order items from API format to display format with product info
  const transformedItems = await Promise.all(
    (apiOrder.orderItems || []).map(async (item) => {
      console.log('🔍 Transforming order item:', {
        id: item.id,
        idProduct: item.idProduct,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        status: item.status // Debug status
      });

      const productInfo = await getProductInfo(item.idProduct);

      // Thành tiền = Đơn giá × Số lượng (chưa có VAT)
      const itemTotalBeforeVAT = item.unitPrice * item.quantity;

      return {
        id: item.id,
        name: productInfo.name,
        image: productInfo.image,
        quantity: item.quantity,
        price: item.unitPrice,
        total: itemTotalBeforeVAT, // Thành tiền (chưa bao gồm VAT)
        status: item.status, // Copy status từ API response
        productId: item.idProduct, // Thêm productId để có thể gán serial
        serialNumbers: [] // Initialize empty serial numbers array
      };
    })
  );

  // Tính tổng từ các items (chưa VAT)
  const subtotal = transformedItems.reduce((sum, item) => sum + item.total, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  return {
    ...apiOrder,
    customer: dealerInfo.companyName,
    dealerPhone: dealerInfo.phone,
    dealerEmail: dealerInfo.email,
    date: apiOrder.createdAt ? new Date(apiOrder.createdAt).toLocaleDateString('vi-VN') : 'N/A',
    items: transformedItems,
    subtotal: subtotal.toLocaleString('vi-VN'),
    vat: vat.toLocaleString('vi-VN'),
    total: total.toLocaleString('vi-VN'),
  };
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHardDeleteDialogOpen, setIsHardDeleteDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [showDeletedOrders, setShowDeletedOrders] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});

  // Serial Assignment Modal states
  const [isSerialAssignmentOpen, setIsSerialAssignmentOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedDealerAccountId, setSelectedDealerAccountId] = useState<number | null>(null);

  // Bulk actions states
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const { toast } = useToast();

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = showDeletedOrders
        ? await orderService.getDeletedOrders()
        : await orderService.getOrders();
      console.log('📡 Raw API response:', response);

      if (response.success) {
        const transformedOrders = await Promise.all(
          response.data.map(transformOrderForDisplay)
        );
        console.log('✅ Transformed orders:', transformedOrders);
        setOrders(transformedOrders);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [showDeletedOrders]);

  const handleDeleteOrder = (order: any, type: 'soft' | 'hard' = 'soft') => {
    // Check if soft delete is allowed (only for PAID orders)
    if (type === 'soft' && order.paymentStatus !== 'PAID') {
      toast({
        title: "Không thể xóa đơn hàng",
        description: "Chỉ có thể xóa đơn hàng đã thanh toán",
        variant: "destructive",
      });
      return;
    }

    setSelectedOrder(order);
    setDeleteType(type);
    if (type === 'hard') {
      setIsHardDeleteDialogOpen(true);
    } else {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;

    try {
      const response = deleteType === 'hard'
        ? await orderService.hardDeleteOrder(selectedOrder.id)
        : await orderService.softDeleteOrder(selectedOrder.id);

      if (response.success) {
        setOrders(prev => prev.filter(order => order.id !== selectedOrder.id));
        toast({
          title: deleteType === 'hard' ? "Xóa vĩnh viễn thành công" : "Xóa đơn hàng thành công",
          description: `Đơn hàng #${selectedOrder.orderCode} đã được ${deleteType === 'hard' ? 'xóa vĩnh viễn' : 'xóa'}`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể xóa đơn hàng",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
      console.error('Error deleting order:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setIsHardDeleteDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleRestoreOrder = async (order: any) => {
    try {
      const response = await orderService.restoreOrder(order.id);

      if (response.success) {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        toast({
          title: "Khôi phục thành công",
          description: `Đơn hàng #${order.orderCode} đã được khôi phục`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể khôi phục đơn hàng",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
      console.error('Error restoring order:', error);
    }
  };

  const handleViewOrder = async (order: any) => {
    try {
      setLoadingDetail(true);

      if (showDeletedOrders) {
        // For deleted orders, use the existing data instead of API call
        // since the detail API might not return deleted orders
        console.log('🔍 Deleted order data for modal:', order);
        setSelectedOrder(order);
        setIsDetailOpen(true);
      } else {
        // For active orders, fetch fresh detail from API
        const response = await orderService.getOrderById(order.id);

        if (response.success) {
          // Transform the detailed order data for display
          const detailedOrder = await transformOrderForDisplay(response.data);
          setSelectedOrder(detailedOrder);
          setIsDetailOpen(true);
        } else {
          toast({
            title: "Lỗi",
            description: response.message || "Không thể tải chi tiết đơn hàng",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
      console.error('Error fetching order detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  // Serial Assignment handlers
  const handleSerialAssignment = async (orderItem: OrderItem, orderId: number) => {
    if (!orderItem.productId) {
      toast({
        title: "Không thể gán serial",
        description: "Sản phẩm này không có Product ID",
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra nếu order item đã COMPLETED
    if (orderItem.status === 'COMPLETED') {
      toast({
        title: "Không thể thay đổi",
        description: "Order item này đã được phân phối cho đại lý và không thể thay đổi serial",
        variant: "destructive",
      });
      return;
    }

    // Tìm order để lấy dealerId
    const currentOrder = orders.find(order => order.id === orderId);
    if (!currentOrder) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin order",
        variant: "destructive",
      });
      return;
    }

    // Lấy dealer info để có accountId
    try {
      const dealerInfo = await getDealerInfo(currentOrder.idDealer);

      setSelectedOrderItem({
        ...orderItem,
        productId: orderItem.productId
      });
      setSelectedOrderId(orderId);
      setSelectedDealerAccountId(dealerInfo.accountId);
      setIsSerialAssignmentOpen(true);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lấy thông tin đại lý",
        variant: "destructive",
      });
    }
  };

  const handleSerialAssignmentComplete = async (orderItemId: number, serialNumbers: string[]) => {
    try {
      console.log('🔄 Assignment complete:', {
        orderItemId,
        serialCount: serialNumbers.length,
        isAllocation: serialNumbers.length === 0
      });

      // Hiển thị toast thông báo trước
      toast({
        title: serialNumbers.length === 0 ? "Phân phối thành công" : "Gán serial thành công",
        description: serialNumbers.length === 0
          ? "Serial đã được phân phối cho đại lý, order item đã chuyển trạng thái COMPLETED"
          : `Đã gán ${serialNumbers.length} serial numbers cho order item`,
      });

      // Nếu là allocation (serialNumbers = []), refresh data để cập nhật UI
      if (serialNumbers.length === 0) {
        console.log('🔄 Refreshing orders after allocation...');
        await fetchOrders();
        console.log('✅ Orders refreshed successfully');
      } else {
        // Nếu chỉ là assignment, cập nhật local state
        setOrders(prevOrders =>
          prevOrders.map(order => ({
            ...order,
            items: order.items?.map(item =>
              item.id === orderItemId
                ? {
                    ...item,
                    serialNumbers,
                    status: serialNumbers.length > 0 ? 'ASSIGNED' : item.status
                  }
                : item
            ) || []
          }))
        );
        console.log('✅ Order state updated successfully');
      }

    } catch (error) {
      console.error('❌ Failed to update order state:', error);

      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật trạng thái order item",
        variant: "destructive",
      });
    }
  };


  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleApplyFilter = (filters: any) => {
    console.log("Applied filters:", filters);
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when applying filters

    // Show toast to confirm filters applied
    const filterCount = Object.keys(filters).filter(key => filters[key] && filters[key] !== '').length;
    if (filterCount > 0) {
      toast({
        title: "Đã áp dụng bộ lọc",
        description: `${filterCount} tiêu chí lọc đã được áp dụng`,
      });
    }
  };

  // Export orders to Excel
  const handleExportExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredOrders.map((order, index) => ({
        'STT': index + 1,
        'Mã đơn hàng': order.orderCode,
        'Khách hàng': order.customer,
        'Số điện thoại': order.dealerPhone || '',
        'Email': order.dealerEmail || '',
        'Số sản phẩm': order.orderItems?.length || 0,
        'Tạm tính (₫)': order.subtotal,
        'VAT (₫)': order.vat,
        'Tổng tiền (₫)': order.total,
        'Trạng thái TT': order.paymentStatus === 'PAID' ? 'Đã trả' : 'Chưa trả',
        'Ngày tạo': order.date,
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Đơn hàng');

      // Auto-size columns
      const maxWidth = excelData.reduce((w, r) => Math.max(w, r['Mã đơn hàng']?.length || 0), 10);
      ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: maxWidth + 2 }, // Mã đơn hàng
        { wch: 25 }, // Khách hàng
        { wch: 15 }, // SĐT
        { wch: 25 }, // Email
        { wch: 12 }, // Số SP
        { wch: 15 }, // Tạm tính
        { wch: 12 }, // VAT
        { wch: 15 }, // Tổng
        { wch: 12 }, // TT TT
        { wch: 12 }, // Ngày
      ];

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `DonHang_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Xuất Excel thành công",
        description: `Đã xuất ${filteredOrders.length} đơn hàng ra file ${filename}`,
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        title: "Lỗi xuất Excel",
        description: "Không thể xuất file Excel. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Print invoice for specific order
  const handlePrintInvoice = (order: Order) => {
    try {
      // Create print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Lỗi",
          description: "Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.",
          variant: "destructive",
        });
        return;
      }

      // Generate invoice HTML
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Hóa đơn #${order.orderCode}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              max-width: 800px;
              margin: 20px auto;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0 0 10px 0;
            }
            .company-info {
              font-size: 14px;
              color: #666;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .invoice-info div {
              flex: 1;
            }
            .invoice-info h3 {
              color: #2563eb;
              margin-bottom: 10px;
            }
            .invoice-info p {
              margin: 5px 0;
              line-height: 1.6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #2563eb;
              color: white;
              padding: 12px;
              text-align: left;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #ddd;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .total-section {
              margin-top: 20px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin: 8px 0;
              font-size: 16px;
            }
            .total-row.grand-total {
              font-size: 20px;
              font-weight: bold;
              color: #2563eb;
              border-top: 2px solid #2563eb;
              padding-top: 10px;
              margin-top: 15px;
            }
            .total-row span:first-child {
              margin-right: 50px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .payment-status {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
            }
            .payment-status.paid {
              background-color: #d1fae5;
              color: #065f46;
            }
            .payment-status.unpaid {
              background-color: #fee2e2;
              color: #991b1b;
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HÓA ĐƠN BÁN HÀNG</h1>
            <div class="company-info">
              <p><strong>Công ty Phân phối</strong></p>
              <p>Địa chỉ: [Địa chỉ công ty]</p>
              <p>Điện thoại: [Số điện thoại] | Email: [Email]</p>
            </div>
          </div>

          <div class="invoice-info">
            <div>
              <h3>Thông tin đơn hàng</h3>
              <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
              <p><strong>Ngày tạo:</strong> ${order.date}</p>
              <p><strong>Trạng thái:</strong>
                <span class="payment-status ${order.paymentStatus === 'PAID' ? 'paid' : 'unpaid'}">
                  ${order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </p>
            </div>
            <div>
              <h3>Thông tin khách hàng</h3>
              <p><strong>Tên:</strong> ${order.customer}</p>
              ${order.dealerPhone ? `<p><strong>Điện thoại:</strong> ${order.dealerPhone}</p>` : ''}
              ${order.dealerEmail ? `<p><strong>Email:</strong> ${order.dealerEmail}</p>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-center">STT</th>
                <th>Sản phẩm</th>
                <th class="text-center">Số lượng</th>
                <th class="text-right">Đơn giá</th>
                <th class="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((item, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.name}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${item.price?.toLocaleString('vi-VN') || 0} ₫</td>
                  <td class="text-right">${item.total?.toLocaleString('vi-VN') || 0} ₫</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Tạm tính:</span>
              <span>${order.subtotal} ₫</span>
            </div>
            <div class="total-row">
              <span>VAT (10%):</span>
              <span>${order.vat} ₫</span>
            </div>
            <div class="total-row grand-total">
              <span>TỔNG CỘNG:</span>
              <span>${order.total} ₫</span>
            </div>
          </div>

          <div class="footer">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
            <p>Hóa đơn được tạo tự động bởi hệ thống - ${new Date().toLocaleString('vi-VN')}</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(invoiceHTML);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

      toast({
        title: "Chuẩn bị in",
        description: `Đang mở cửa sổ in hóa đơn #${order.orderCode}`,
      });
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast({
        title: "Lỗi in hóa đơn",
        description: "Không thể in hóa đơn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Bulk actions handlers
  const handleSelectAll = () => {
    if (selectedOrderIds.length === displayedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(displayedOrders.map(order => order.id));
    }
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedOrderIds.length === 0) return;

    const deleteAction = showDeletedOrders ? 'xóa vĩnh viễn' : 'xóa';

    if (!confirm(`Bạn có chắc muốn ${deleteAction} ${selectedOrderIds.length} đơn hàng đã chọn?`)) {
      return;
    }

    try {
      setIsDeletingBulk(true);

      // Call bulk delete API
      const response = showDeletedOrders
        ? await orderService.bulkHardDeleteOrders(selectedOrderIds)
        : await orderService.bulkSoftDeleteOrders(selectedOrderIds);

      if (response.success) {
        const successCount = response.data?.successCount || 0;
        const failCount = response.data?.failCount || 0;
        const failedOrders = response.data?.failedOrders || [];

        // Remove successfully deleted orders from list
        setOrders(prev => prev.filter(order => !selectedOrderIds.includes(order.id) || failedOrders.includes(order.id)));
        setSelectedOrderIds([]);

        if (successCount > 0) {
          toast({
            title: `Đã ${deleteAction} ${successCount} đơn hàng`,
            description: failCount > 0
              ? `${failCount} đơn hàng không thể xóa${showDeletedOrders ? '' : ' (chỉ xóa được đơn hàng đã thanh toán)'}`
              : undefined,
          });
        }

        if (failCount > 0 && successCount === 0) {
          toast({
            title: "Không thể xóa",
            description: showDeletedOrders
              ? `Không thể ${deleteAction} các đơn hàng đã chọn`
              : `Chỉ có thể xóa đơn hàng đã thanh toán (PAID)`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Lỗi",
          description: response.message || `Không thể ${deleteAction} đơn hàng`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
      toast({
        title: "Lỗi",
        description: `Không thể ${deleteAction} đơn hàng. Vui lòng thử lại.`,
        variant: "destructive",
      });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleBulkExport = () => {
    if (selectedOrderIds.length === 0) return;

    try {
      // Get selected orders
      const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));

      // Prepare data for Excel
      const excelData = selectedOrders.map((order, index) => ({
        'STT': index + 1,
        'Mã đơn hàng': order.orderCode,
        'Khách hàng': order.customer,
        'Số điện thoại': order.dealerPhone || '',
        'Email': order.dealerEmail || '',
        'Số sản phẩm': order.orderItems?.length || 0,
        'Tạm tính (₫)': order.subtotal,
        'VAT (₫)': order.vat,
        'Tổng tiền (₫)': order.total,
        'Trạng thái TT': order.paymentStatus === 'PAID' ? 'Đã trả' : 'Chưa trả',
        'Ngày tạo': order.date,
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Đơn hàng đã chọn');

      // Auto-size columns
      const maxWidth = excelData.reduce((w, r) => Math.max(w, r['Mã đơn hàng']?.length || 0), 10);
      ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: maxWidth + 2 }, // Mã đơn hàng
        { wch: 25 }, // Khách hàng
        { wch: 15 }, // SĐT
        { wch: 25 }, // Email
        { wch: 12 }, // Số SP
        { wch: 15 }, // Tạm tính
        { wch: 12 }, // VAT
        { wch: 15 }, // Tổng
        { wch: 12 }, // TT TT
        { wch: 12 }, // Ngày
      ];

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `DonHang_DaChon_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Xuất Excel thành công",
        description: `Đã xuất ${selectedOrders.length} đơn hàng đã chọn ra file ${filename}`,
      });
    } catch (error) {
      console.error('Error exporting selected orders:', error);
      toast({
        title: "Lỗi xuất Excel",
        description: "Không thể xuất file Excel. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const togglePaymentStatus = async (orderId: number) => {
    try {
      const currentOrder = orders.find(order => order.id === orderId);
      if (!currentOrder) return;

      const newStatus = currentOrder.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID';

      const response = await orderService.updatePaymentStatus(orderId, newStatus);

      if (response.success) {
        setOrders(prev => prev.map(order => {
          if (order.id === orderId) {
            const statusText = newStatus === 'PAID' ? 'đã trả' : 'chưa trả';

            toast({
              title: "Cập nhật trạng thái thanh toán",
              description: `Đơn hàng #${order.orderCode} đã được cập nhật thành "${statusText}"`,
            });

            return { ...order, paymentStatus: newStatus };
          }
          return order;
        }));
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể cập nhật trạng thái thanh toán",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
      console.error('Error updating payment status:', error);
    }
  };




  const getActionButtons = (order: any) => {
    if (showDeletedOrders) {
      // For deleted orders, show restore and hard delete buttons
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRestoreOrder(order)}
            title="Khôi phục đơn hàng"
            className="hover:bg-green-50 dark:hover:bg-green-950"
          >
            <RotateCcw className="h-4 w-4 text-green-600 dark:text-green-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteOrder(order, 'hard')}
            title="Xóa vĩnh viễn"
            className="hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      );
    } else {
      // For active orders, show soft delete button only if payment is PAID
      const canDelete = order.paymentStatus === 'PAID';
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteOrder(order, 'soft')}
          disabled={!canDelete}
          title={canDelete ? "Xóa đơn hàng" : "Chỉ có thể xóa đơn hàng đã thanh toán"}
          className={canDelete ? "hover:bg-orange-50 dark:hover:bg-orange-950" : ""}
        >
          <Archive className={`h-4 w-4 ${canDelete ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
        </Button>
      );
    }
  };

  // Apply search and filters
  const filteredOrders = orders.filter(order => {
    // Search filter - sử dụng debouncedSearchTerm để tối ưu hiệu năng
    const matchesSearch = !debouncedSearchTerm ||
      (order.orderCode && order.orderCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (order.customer && order.customer.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (order.dealerPhone && order.dealerPhone.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (order.dealerEmail && order.dealerEmail.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

    // Payment status filter
    const matchesPaymentStatus = !appliedFilters.paymentStatus ||
      order.paymentStatus === appliedFilters.paymentStatus;

    // Amount range filter
    const matchesAmountRange = (!appliedFilters.amountFrom || order.totalPrice >= parseInt(appliedFilters.amountFrom)) &&
      (!appliedFilters.amountTo || order.totalPrice <= parseInt(appliedFilters.amountTo));

    // Date range filter
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date(0);
    const matchesDateRange = (!appliedFilters.dateFrom || orderDate >= new Date(appliedFilters.dateFrom)) &&
      (!appliedFilters.dateTo || orderDate <= new Date(appliedFilters.dateTo + 'T23:59:59'));

    // Customer filter
    const matchesCustomer = !appliedFilters.customer ||
      (order.customer && order.customer.toLowerCase().includes(appliedFilters.customer.toLowerCase())) ||
      (order.idDealer && order.idDealer.toString().includes(appliedFilters.customer));

    // Items count filter
    const itemsCount = order.orderItems?.length || 0;
    const matchesItemsRange = (!appliedFilters.itemsFrom || itemsCount >= parseInt(appliedFilters.itemsFrom)) &&
      (!appliedFilters.itemsTo || itemsCount <= parseInt(appliedFilters.itemsTo));

    return matchesSearch && matchesPaymentStatus && matchesAmountRange &&
           matchesDateRange && matchesCustomer && matchesItemsRange;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const displayedOrders = showAll 
    ? filteredOrders 
    : filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {showDeletedOrders ? "Đơn hàng đã xóa" : "Quản lý đơn hàng"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            {showDeletedOrders
              ? "Xem và quản lý các đơn hàng đã xóa - có thể khôi phục hoặc xóa vĩnh viễn"
              : "Xử lý và theo dõi tất cả đơn hàng từ khách hàng"
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 3xl:grid-cols-8 5xl:grid-cols-10 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Tổng đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                orders.length.toLocaleString('vi-VN')
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Doanh thu tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : orders.length === 0 ? (
                "0 ₫"
              ) : (
                `${Math.round(orders.reduce((sum, order) => sum + order.totalPrice, 0) / 1000000)}M ₫`
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Đại lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {loading ? (
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                new Set(orders.map(order => order.idDealer)).size
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Trung bình/đơn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : orders.length === 0 ? (
                "0 ₫"
              ) : (
                `${(orders.reduce((sum, order) => sum + order.totalPrice, 0) / orders.length / 1000000).toFixed(2)}M ₫`
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant={showDeletedOrders ? "default" : "outline"}
                onClick={() => setShowDeletedOrders(!showDeletedOrders)}
                className="flex-1 sm:flex-none"
              >
                <Archive className="h-4 w-4 mr-2" />
                {showDeletedOrders ? "Đơn hàng hoạt động" : "Đơn hàng đã xóa"}
              </Button>
              <Button
                variant={Object.keys(appliedFilters).length > 0 ? "default" : "outline"}
                onClick={handleFilterClick}
                className="flex-1 sm:flex-none"
              >
                <Filter className="h-4 w-4 mr-2" />
                Lọc {Object.keys(appliedFilters).filter(key => appliedFilters[key] && appliedFilters[key] !== '').length > 0 &&
                  `(${Object.keys(appliedFilters).filter(key => appliedFilters[key] && appliedFilters[key] !== '').length})`}
              </Button>
              {!showDeletedOrders && filteredOrders.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleExportExcel}
                  className="flex-1 sm:flex-none bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel ({filteredOrders.length})
                </Button>
              )}
              {selectedOrderIds.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleBulkExport}
                    className="flex-1 sm:flex-none bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Xuất đã chọn ({selectedOrderIds.length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={isDeletingBulk}
                    className="flex-1 sm:flex-none"
                  >
                    {isDeletingBulk ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {showDeletedOrders ? 'Xóa vĩnh viễn' : 'Xóa'} ({selectedOrderIds.length})
                      </>
                    )}
                  </Button>
                </>
              )}
              {Object.keys(appliedFilters).filter(key => appliedFilters[key] && appliedFilters[key] !== '').length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAppliedFilters({});
                    toast({
                      title: "Đã xóa bộ lọc",
                      description: "Tất cả bộ lọc đã được xóa",
                    });
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Xóa lọc
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Đang tải danh sách đơn hàng...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          )}

          {/* Orders Content */}
          {!loading && !error && (
            <>
              {/* Empty State */}
              {displayedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {showDeletedOrders ? "Không có đơn hàng đã xóa" : "Chưa có đơn hàng nào"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                    {showDeletedOrders
                      ? "Tất cả đơn hàng đang hoạt động bình thường. Không có đơn hàng nào bị xóa."
                      : filteredOrders.length === 0 && orders.length > 0
                      ? "Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc."
                      : "Khi có đơn hàng mới từ đại lý, chúng sẽ xuất hiện tại đây. Bạn có thể xử lý thanh toán, gán serial và theo dõi trạng thái."
                    }
                  </p>
                  {filteredOrders.length === 0 && orders.length > 0 ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setAppliedFilters({});
                        }}
                      >
                        Xóa bộ lọc
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeletedOrders(false)}
                      >
                        Xem đơn hàng hoạt động
                      </Button>
                    </div>
                  ) : !showDeletedOrders ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Làm mới
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeletedOrders(true)}
                      >
                        Xem đơn hàng đã xóa
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowDeletedOrders(false)}
                    >
                      Quay lại đơn hàng hoạt động
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Mobile Card View - Hidden on desktop */}
                  <div className="block sm:hidden space-y-4">
            {displayedOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderCode}</p>
                      <p className="text-sm text-gray-500">{order.customer}</p>
                      {order.dealerPhone && (
                        <p className="text-xs text-gray-400">📞 {order.dealerPhone}</p>
                      )}
                      {order.dealerEmail && (
                        <p className="text-xs text-gray-400">✉️ {order.dealerEmail}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Sản phẩm:</span> {order.orderItems?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Tổng tiền:</span> {order.total} ₫
                    </div>
                    <div>
                      <span className="font-medium">Ngày:</span> {order.date}
                    </div>
                    {!showDeletedOrders && (
                      <div>
                        <span className="font-medium">Thanh toán:</span>
                        <button
                          onClick={() => togglePaymentStatus(order.id)}
                          className={`ml-1 hover:opacity-75 transition-opacity cursor-pointer ${getPaymentStatusDisplay(order.paymentStatus).className}`}
                        >
                          {getPaymentStatusDisplay(order.paymentStatus).text}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        disabled={loadingDetail}
                      >
                        {loadingDetail ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1" />
                        )}
                        Xem
                      </Button>
                      {!showDeletedOrders && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintInvoice(order)}
                          className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          In
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleOrderExpansion(order.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {expandedOrders.has(order.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {getActionButtons(order)}
                  </div>
                </div>

                {/* Order Items - Mobile */}
                {expandedOrders.has(order.id) && (
                  <div className="border-t bg-gray-50 dark:bg-gray-800 p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Sản phẩm trong đơn hàng
                    </h4>
                    <div className="space-y-3">
                      {(order.items || []).map((item: any) => (
                        <div key={item.id} className="flex gap-3 bg-white dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
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
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SL: {item.quantity} × {item.price?.toLocaleString('vi-VN') || 0} ₫</p>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{item.total?.toLocaleString('vi-VN') || 0} ₫</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden sm:block space-y-4">
            {displayedOrders.length > 0 && (
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="gap-2"
                >
                  {selectedOrderIds.length === displayedOrders.length ? (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      Bỏ chọn tất cả
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" />
                      Chọn tất cả ({displayedOrders.length})
                    </>
                  )}
                </Button>
                {selectedOrderIds.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Đã chọn {selectedOrderIds.length} đơn hàng
                  </span>
                )}
              </div>
            )}
            {displayedOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                {/* Order Header */}
                <div className="p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSelectOrder(order.id)}
                        className="h-8 w-8"
                        title={selectedOrderIds.includes(order.id) ? "Bỏ chọn" : "Chọn đơn hàng"}
                      >
                        {selectedOrderIds.includes(order.id) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="p-1"
                      >
                        {expandedOrders.has(order.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{order.orderCode}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer}</p>
                        {order.dealerPhone && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">📞 {order.dealerPhone}</p>
                        )}
                        {order.dealerEmail && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">✉️ {order.dealerEmail}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.orderItems?.length || 0} sản phẩm</p>
                        <p className="font-medium dark:text-gray-100">{order.total} ₫</p>
                      </div>
                      <div className="text-right hidden lg:block">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.date}</p>
                      </div>
                      {!showDeletedOrders && (
                        <div className="text-right">
                          <button
                            onClick={() => togglePaymentStatus(order.id)}
                            className={`flex items-center gap-1 hover:opacity-75 transition-opacity cursor-pointer ${getPaymentStatusDisplay(order.paymentStatus).className}`}
                          >
                            {(() => {
                              const StatusIcon = getPaymentStatusDisplay(order.paymentStatus).icon;
                              return <StatusIcon className="h-4 w-4" />;
                            })()}
                            <span className="text-sm font-medium">
                              {getPaymentStatusDisplay(order.paymentStatus).text}
                            </span>
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewOrder(order)}
                          disabled={loadingDetail}
                          title="Xem chi tiết"
                          className="hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {loadingDetail ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        {!showDeletedOrders && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrintInvoice(order)}
                            title="In hóa đơn"
                            className="hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:text-purple-600 dark:hover:text-purple-400"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        )}
                        {getActionButtons(order)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items - Desktop */}
                {expandedOrders.has(order.id) && (
                  <div className="bg-gray-50 dark:bg-gray-900">
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Sản phẩm trong đơn hàng
                      </h4>
                      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                              <TableHead className="w-16 dark:text-gray-200">#</TableHead>
                              <TableHead className="dark:text-gray-200">Sản phẩm</TableHead>
                              <TableHead className="text-center dark:text-gray-200">Số lượng</TableHead>
                              <TableHead className="text-center dark:text-gray-200">Serial</TableHead>
                              <TableHead className="text-center dark:text-gray-200">Trạng thái</TableHead>
                              <TableHead className="text-right dark:text-gray-200">Đơn giá</TableHead>
                              <TableHead className="text-right dark:text-gray-200">Thành tiền</TableHead>
                              <TableHead className="text-center dark:text-gray-200">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(order.items || []).map((item: any, index: number) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium dark:text-gray-100">{index + 1}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex-shrink-0 overflow-hidden">
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
                                        <Package className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                                      </div>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center dark:text-gray-100">{item.quantity}</TableCell>
                                <TableCell className="text-center">
                                  {/* Hiển thị dựa trên status từ API */}
                                  {item.status === 'COMPLETED' ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <div className="flex items-center gap-1">
                                        <Package className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm text-purple-600">Đã phân phối</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {item.quantity}/{item.quantity}
                                      </div>
                                    </div>
                                  ) : item.serialNumbers && item.serialNumbers.length > 0 ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <div className="flex items-center gap-1">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-600">{item.serialNumbers.length}/{item.quantity}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {item.serialNumbers.slice(0, 2).join(', ')}
                                        {item.serialNumbers.length > 2 && ` +${item.serialNumbers.length - 2}`}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1">
                                      <Hash className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm text-gray-500">Chưa gán</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {item.status === 'COMPLETED' && (
                                    <div className="flex items-center justify-center gap-1">
                                      <Package className="h-4 w-4 text-purple-600" />
                                      <span className="text-sm text-purple-600 font-medium">Đã phân phối</span>
                                    </div>
                                  )}
                                  {item.status === 'PARTIAL' && (
                                    <div className="flex items-center justify-center gap-1">
                                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                      <span className="text-sm text-yellow-600 font-medium">Thiếu serial</span>
                                    </div>
                                  )}
                                  {(item.status === 'PENDING' || !item.status) && (
                                    <div className="flex items-center justify-center gap-1">
                                      <XCircle className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm text-gray-500">Chờ xử lý</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right dark:text-gray-100">{item.price?.toLocaleString('vi-VN') || 0} ₫</TableCell>
                                <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">{item.total?.toLocaleString('vi-VN') || 0} ₫</TableCell>
                                <TableCell className="text-center">
                                  {item.status === 'COMPLETED' ? (
                                    <div className="flex items-center justify-center gap-1 text-purple-600">
                                      <Package className="h-3 w-3" />
                                      <span className="text-xs">Đã hoàn tất</span>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSerialAssignment(item, order.id)}
                                      className="h-8"
                                      title="Gán serial numbers"
                                    >
                                      <Settings className="h-3 w-3 mr-1" />
                                      <span className="text-xs">Serial</span>
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-gray-50 dark:bg-gray-700 font-medium">
                              <TableCell colSpan={6} className="text-right dark:text-gray-100">Tạm tính:</TableCell>
                              <TableCell className="text-right font-medium text-gray-900 dark:text-gray-100">{order.subtotal} ₫</TableCell>
                            </TableRow>
                            <TableRow className="bg-gray-50 dark:bg-gray-700 font-medium">
                              <TableCell colSpan={6} className="text-right dark:text-gray-100">VAT (10%):</TableCell>
                              <TableCell className="text-right font-medium text-gray-900 dark:text-gray-100">{order.vat} ₫</TableCell>
                            </TableRow>
                            <TableRow className="bg-gray-50 dark:bg-gray-700 font-medium">
                              <TableCell colSpan={6} className="text-right dark:text-gray-100">Tổng cộng:</TableCell>
                              <TableCell className="text-right text-lg font-bold text-blue-600 dark:text-blue-400">{order.total} ₫</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {filteredOrders.length > ITEMS_PER_PAGE && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
              <div className="text-sm text-gray-500 text-center sm:text-left">
                Hiển thị {showAll ? filteredOrders.length : Math.min(displayedOrders.length, filteredOrders.length)} / {filteredOrders.length} đơn hàng
              </div>
              <div className="flex items-center space-x-2">
                {!showAll && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-4"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Trước</span>
                    </Button>
                    <span className="text-sm px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-4"
                    >
                      <span className="hidden sm:inline mr-1">Sau</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAll(!showAll);
                    setCurrentPage(1);
                  }}
                >
                  {showAll ? "Thu gọn" : "Xem tất cả"}
                </Button>
              </div>
            </div>
          )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <OrderDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        order={selectedOrder}
      />

      {/* Hard Delete Confirmation Dialog */}
      <div className={`fixed inset-0 z-50 ${isHardDeleteDialogOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/80" onClick={() => setIsHardDeleteDialogOpen(false)} />
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Xóa vĩnh viễn đơn hàng
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng #{selectedOrder?.orderCode}?
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsHardDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Xóa vĩnh viễn
            </Button>
          </div>
        </div>
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        type="orders"
        onApplyFilter={handleApplyFilter}
      />

      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
      />

      {/* Serial Assignment Modal */}
      {selectedOrderItem && selectedOrderId && selectedDealerAccountId && (
        <SerialAssignmentModal
          isOpen={isSerialAssignmentOpen}
          onClose={() => {
            setIsSerialAssignmentOpen(false);
            setSelectedOrderItem(null);
            setSelectedOrderId(null);
            setSelectedDealerAccountId(null);
          }}
          orderItem={selectedOrderItem}
          orderId={selectedOrderId}
          dealerAccountId={selectedDealerAccountId}
          onAssignmentComplete={handleSerialAssignmentComplete}
        />
      )}
    </div>
  );
}
