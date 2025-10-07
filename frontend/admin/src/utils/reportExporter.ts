import { format } from "date-fns";

export interface ExportData {
  type: 'overview' | 'revenue' | 'customers' | 'products';
  dateRange: { from: Date; to: Date };
  format: 'pdf' | 'excel' | 'csv';
  data: any;
}

export class ReportExporter {
  static async exportToPDF(data: ExportData): Promise<void> {
    const { type, dateRange, data: reportData } = data;

    // Tạo nội dung HTML cho PDF
    const htmlContent = this.generateHTMLContent(type, dateRange, reportData);

    // Sử dụng window.print() để người dùng có thể chọn in hoặc lưu PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  static async exportToExcel(data: ExportData): Promise<void> {
    const { type, dateRange, data: reportData } = data;

    // Tạo CSV data và download như Excel
    const csvContent = this.generateCSVContent(type, reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bao-cao-${type}-${format(dateRange.from, 'dd-MM-yyyy')}-${format(dateRange.to, 'dd-MM-yyyy')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static async exportToCSV(data: ExportData): Promise<void> {
    // Tương tự như Excel nhưng với extension .csv
    return this.exportToExcel(data);
  }

  private static generateHTMLContent(type: string, dateRange: { from: Date; to: Date }, data: any): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Báo cáo ${type} - ${format(dateRange.from, 'dd/MM/yyyy')} đến ${format(dateRange.to, 'dd/MM/yyyy')}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin-bottom: 10px; }
          .header p { color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
          .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .metric-value { font-size: 24px; font-weight: bold; color: #333; }
          .metric-label { color: #666; font-size: 14px; }
          .section { margin: 30px 0; }
          .section h2 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BÁO CÁO ${type.toUpperCase()}</h1>
          <p>Kỳ báo cáo: ${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}</p>
          <p>Thời gian xuất: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
        </div>

        ${this.generateContentByType(type, data, formatCurrency)}
      </body>
      </html>
    `;
  }

  private static generateContentByType(type: string, data: any, formatCurrency: (amount: number) => string): string {
    switch (type) {
      case 'overview':
        return `
          <div class="section">
            <h2>Chỉ số chính</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Tổng doanh thu</div>
                <div class="metric-value">${formatCurrency(data.metrics?.monthRevenue || 0)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Tổng đơn hàng</div>
                <div class="metric-value">${data.metrics?.monthOrders || 0}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Tổng khách hàng</div>
                <div class="metric-value">${data.metrics?.monthCustomers || 0}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Giá trị đơn hàng TB</div>
                <div class="metric-value">${formatCurrency((data.metrics?.monthRevenue || 0) / (data.metrics?.monthOrders || 1))}</div>
              </div>
            </div>
          </div>
        `;

      case 'revenue':
        return `
          <div class="section">
            <h2>Phân tích doanh thu</h2>
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng bán</th>
                  <th>Doanh thu</th>
                  <th>Tăng trưởng (%)</th>
                </tr>
              </thead>
              <tbody>
                ${data.topSellingProducts?.map((product: any) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.soldQuantity}</td>
                    <td>${formatCurrency(product.revenue)}</td>
                    <td style="color: ${product.growth > 0 ? 'green' : 'red'}">${product.growth}%</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
          </div>
        `;

      case 'customers':
        return `
          <div class="section">
            <h2>Top khách hàng</h2>
            <table>
              <thead>
                <tr>
                  <th>Hạng</th>
                  <th>Tên khách hàng</th>
                  <th>Tổng chi tiêu</th>
                  <th>Số đơn hàng</th>
                  <th>Đơn hàng cuối</th>
                </tr>
              </thead>
              <tbody>
                ${data.topCustomers?.map((customer: any) => `
                  <tr>
                    <td>${customer.rank}</td>
                    <td>${customer.name}</td>
                    <td>${formatCurrency(customer.totalSpent)}</td>
                    <td>${customer.totalOrders}</td>
                    <td>${customer.lastOrder}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
          </div>
        `;

      case 'products':
        return `
          <div class="section">
            <h2>Phân tích sản phẩm</h2>
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Tồn kho hiện tại</th>
                  <th>Tồn kho tối thiểu</th>
                  <th>Đã bán trong tháng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                ${data.inventoryProducts?.map((product: any) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.currentStock}</td>
                    <td>${product.minStock}</td>
                    <td>${product.soldThisMonth}</td>
                    <td style="color: ${product.status === 'low_stock' ? 'red' : product.status === 'overstock' ? 'orange' : 'green'}">
                      ${product.status === 'low_stock' ? 'Sắp hết' : product.status === 'overstock' ? 'Tồn dư' : 'Bình thường'}
                    </td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
          </div>
        `;

      default:
        return '<div>Không có dữ liệu để xuất</div>';
    }
  }

  private static generateCSVContent(type: string, data: any): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    switch (type) {
      case 'overview':
        return `Chỉ số,Giá trị
Tổng doanh thu,${formatCurrency(data.metrics?.monthRevenue || 0)}
Tổng đơn hàng,${data.metrics?.monthOrders || 0}
Tổng khách hàng,${data.metrics?.monthCustomers || 0}
Giá trị đơn hàng TB,${formatCurrency((data.metrics?.monthRevenue || 0) / (data.metrics?.monthOrders || 1))}`;

      case 'revenue':
        const revenueHeader = 'Sản phẩm,Số lượng bán,Doanh thu,Tăng trưởng (%)';
        const revenueRows = data.topSellingProducts?.map((product: any) =>
          `"${product.name}",${product.soldQuantity},"${formatCurrency(product.revenue)}",${product.growth}%`
        ).join('\n') || '';
        return `${revenueHeader}\n${revenueRows}`;

      case 'customers':
        const customerHeader = 'Hạng,Tên khách hàng,Tổng chi tiêu,Số đơn hàng,Đơn hàng cuối';
        const customerRows = data.topCustomers?.map((customer: any) =>
          `${customer.rank},"${customer.name}","${formatCurrency(customer.totalSpent)}",${customer.totalOrders},${customer.lastOrder}`
        ).join('\n') || '';
        return `${customerHeader}\n${customerRows}`;

      case 'products':
        const productHeader = 'Sản phẩm,Tồn kho hiện tại,Tồn kho tối thiểu,Đã bán trong tháng,Trạng thái';
        const productRows = data.inventoryProducts?.map((product: any) =>
          `"${product.name}",${product.currentStock},${product.minStock},${product.soldThisMonth},"${product.status === 'low_stock' ? 'Sắp hết' : product.status === 'overstock' ? 'Tồn dư' : 'Bình thường'}"`
        ).join('\n') || '';
        return `${productHeader}\n${productRows}`;

      default:
        return 'Không có dữ liệu để xuất';
    }
  }

  static async exportReport(data: ExportData): Promise<void> {
    switch (data.format) {
      case 'pdf':
        return this.exportToPDF(data);
      case 'excel':
        return this.exportToExcel(data);
      case 'csv':
        return this.exportToCSV(data);
      default:
        throw new Error(`Unsupported export format: ${data.format}`);
    }
  }
}