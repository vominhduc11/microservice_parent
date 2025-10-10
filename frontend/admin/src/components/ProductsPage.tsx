import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeBadge } from "@/components/ui/theme-badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Archive,
  RotateCcw,
  Trash,
  RefreshCw,
} from "lucide-react";
import { EnhancedProductForm } from "./EnhancedProductForm";
import { ProductDeleteDialog } from "./ProductDeleteDialog";
import { ProductDetailModal } from "./ProductDetailModal";
import { useToast } from "@/hooks/use-toast";
import { Product, ApiResponse, ApiProductResponse, ApiProductRequest } from "@/types";
import { apiRequest, productApi } from "@/services/api";
import * as XLSX from 'xlsx';
import { DEFAULT_ITEMS_PER_PAGE } from "@/constants/business";
import { useDebounce } from "@/hooks/useDebounce";
import { gridContainerVariants, gridItemVariants, containerVariants, itemVariants } from "@/utils/animations";

const ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE;

export function ProductsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [products, setProducts] = useState<Product[]>([]); // Displayed products (filtered/searched)
  const [allProducts, setAllProducts] = useState<Product[]>([]); // All products for stats calculation
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "deleted">("active");
  const [isHardDeleteOpen, setIsHardDeleteOpen] = useState(false);
  const [productToHardDelete, setProductToHardDelete] = useState<Product | undefined>();

  // Track total products for each mode
  const [totalActiveProducts, setTotalActiveProducts] = useState(0);
  const [totalDeletedProducts, setTotalDeletedProducts] = useState(0);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all', // all, in_stock, out_of_stock, low_stock
    priceRange: { min: 0, max: 100000000 },
    featured: 'all' // all, featured, not_featured
  });

  useEffect(() => {
    fetchProducts();
  }, [viewMode, refreshTrigger]);

  // Trigger search when debounced search term changes
  useEffect(() => {
    if (viewMode === 'active') {
      fetchProducts(debouncedSearchTerm, true); // isSearch = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  // Fetch counts for both modes when component mounts or refreshes
  useEffect(() => {
    const fetchAllCounts = async () => {
      try {
        // Fetch active products count
        const activeResponse = await apiRequest<ApiResponse<ApiProductResponse[]>>('/api/product/products');
        if (activeResponse.success) {
          setTotalActiveProducts(activeResponse.data.length);
        }

        // Fetch deleted products count
        const deletedResponse = await apiRequest<ApiResponse<ApiProductResponse[]>>('/api/product/products/deleted');
        if (deletedResponse.success) {
          setTotalDeletedProducts(deletedResponse.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch product counts:', error);
      }
    };

    fetchAllCounts();
  }, [refreshTrigger]); // Re-fetch counts on refresh

  // Transform API product response to UI format
  const transformApiProductToUI = (product: ApiProductResponse): Product => {
    // Parse JSON strings
    let descriptions = null;
    let specifications = null;
    let videos = null;
    let wholesalePrice = [];
    let parsedImage = '';

    try {
      if (product.descriptions) descriptions = JSON.parse(product.descriptions);
    } catch (e) {
      console.warn('Failed to parse descriptions:', product.descriptions);
    }

    try {
      if (product.specifications) specifications = JSON.parse(product.specifications);
    } catch (e) {
      console.warn('Failed to parse specifications:', product.specifications);
    }

    try {
      if (product.videos) videos = JSON.parse(product.videos);
    } catch (e) {
      console.warn('Failed to parse videos:', product.videos);
    }

    try {
      if (product.wholesalePrice) {
        const parsed = JSON.parse(product.wholesalePrice);
        // API returns array format already
        if (Array.isArray(parsed)) {
          wholesalePrice = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse wholesalePrice:', product.wholesalePrice);
    }

    // Parse image JSON string
    try {
      if (product.image) {
        const imageData = JSON.parse(product.image);
        parsedImage = imageData.imageUrl || imageData.url || '';
      }
    } catch (e) {
      console.warn('Failed to parse image:', product.image);
      parsedImage = product.image || '';
    }

    // Get stock from API response (direct field has priority)
    const stockValue = (product as any).stock !== undefined
      ? (product as any).stock
      : (specifications?.stock ? parseInt(specifications.stock) : 0);

    return {
      id: product.id.toString(),
      name: product.name,
      categoryId: product.categoryId || '',
      sku: product.sku,
      image: parsedImage,
      descriptions,
      specifications,
      createdAt: product.createdAt,
      updatedAt: product.updateAt,
      showOnHomepage: product.showOnHomepage,
      isFeatured: product.isFeatured,
      retailPrice: product.price,
      wholesalePrice,
      videos,
      // New backend fields
      shortDescription: product.shortDescription || '',
      isDeleted: product.isDeleted || false,
      // Stock from API response
      stock: typeof stockValue === 'number' ? stockValue : parseInt(stockValue) || 0,
      // Legacy fields for backward compatibility
      model: specifications?.model || '',
      price: product.price,
      status: product.isDeleted ? 'deleted' : (product.status || 'active'),
      sold: 0,
      images: parsedImage ? [{ url: parsedImage, alt: product.name, type: "main", order: 1 }] : [],
      wholesaleDiscount: specifications?.wholesaleDiscount ? parseInt(specifications.wholesaleDiscount) : 0,
      minWholesaleQty: specifications?.minWholesaleQty ? parseInt(specifications.minWholesaleQty) : 10,
      description: descriptions?.description || product.shortDescription || '',
    };
  };

  const fetchProducts = async (searchQuery: string = '', isSearch: boolean = false) => {
    try {
      // Use searchLoading for search operations, initialLoading for first load
      if (isSearch) {
        setSearchLoading(true);
      } else {
        setInitialLoading(true);
      }

      let response: ApiResponse<ApiProductResponse[]>;

      if (viewMode === "active") {
        // Use search API if query exists, otherwise get all
        if (searchQuery.trim()) {
          console.log('🔍 Searching products with query:', searchQuery);
          response = await productApi.search(searchQuery);
        } else {
          console.log('🔍 Fetching all active products');
          response = await productApi.getAll();
        }
      } else {
        console.log('🔍 Fetching deleted products');
        response = await productApi.getDeleted();
      }

      console.log('📦 API response:', response);

      if (response.success) {
        // Transform API data to match UI interface
        const transformedProducts: Product[] = response.data.map(transformApiProductToUI);
        console.log('✅ Transformed products:', transformedProducts.length, 'items');
        setProducts(transformedProducts);

        // Save all products for stats calculation only when NOT searching
        if (!isSearch || !searchQuery.trim()) {
          setAllProducts(transformedProducts);
        }

        // Update total count for current view mode
        if (viewMode === "active") {
          setTotalActiveProducts(transformedProducts.length);
        } else {
          setTotalDeletedProducts(transformedProducts.length);
        }
      } else {
        console.log('❌ API error:', response.message);
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      if (isSearch) {
        setSearchLoading(false);
      } else {
        setInitialLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string, stock?: number) => {
    if (status === 'active') {
      return <ThemeBadge variant="success">Đang bán</ThemeBadge>;
    }
    if (status === 'inactive') {
      return <ThemeBadge variant="secondary">Ngừng bán</ThemeBadge>;
    }
    return <ThemeBadge variant="info">Khác</ThemeBadge>;
  };

  const filteredProducts = products.filter(product => {
    // Search filter - only for deleted view (active view uses API search)
    let searchMatch = true;
    if (viewMode === 'deleted' && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = product.name?.toLowerCase().includes(searchLower) || false;
      const skuMatch = product.sku?.toLowerCase().includes(searchLower) || false;
      const shortDescMatch = product.shortDescription?.toLowerCase().includes(searchLower) || false;

      // Search in description object
      let descriptionMatch = false;
      if (product.descriptions && typeof product.descriptions === 'object') {
        const desc = product.descriptions as any;
        descriptionMatch =
          (desc.KeyFeatures && desc.KeyFeatures.some((feature: string) =>
            feature?.toLowerCase().includes(searchLower))) ||
          (desc.ProductFeatures && desc.ProductFeatures.some((feature: any) =>
            feature.title?.toLowerCase().includes(searchLower) ||
            feature.subtitle?.toLowerCase().includes(searchLower) ||
            feature.description?.toLowerCase().includes(searchLower)));
      }

      searchMatch = nameMatch || skuMatch || shortDescMatch || descriptionMatch;
    }

    // Status filter
    const stock = product.stock !== undefined ? product.stock : (product.specifications as any)?.stock;
    const stockNum = typeof stock === 'string' ? parseInt(stock) : (stock || 0);

    let statusMatch = true;
    if (filters.status === 'in_stock') {
      statusMatch = stockNum > 0; // Có hàng = stock > 0
    } else if (filters.status === 'low_stock') {
      statusMatch = stockNum > 0 && stockNum <= 10;
    } else if (filters.status === 'out_of_stock') {
      statusMatch = stockNum === 0;
    }

    // Price filter (only apply if price range is set by user, not default)
    let priceMatch = true;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 100000000) {
      const price = typeof product.price === 'number' ? product.price :
                    (typeof product.price === 'string' ? parseFloat(product.price.replace(/[^0-9.-]+/g, '')) : 0);
      priceMatch = price >= filters.priceRange.min && price <= filters.priceRange.max;
    }

    // Featured filter
    let featuredMatch = true;
    if (filters.featured === 'featured') {
      featuredMatch = product.isFeatured === true;
    } else if (filters.featured === 'not_featured') {
      featuredMatch = product.isFeatured === false;
    }

    return searchMatch && statusMatch && priceMatch && featuredMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = showAll 
    ? filteredProducts 
    : filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleEditProduct = async (product: Product) => {
    try {
      // Gọi API để lấy chi tiết đầy đủ của sản phẩm cho edit mode
      const response = await apiRequest<ApiResponse<ApiProductResponse>>(`/api/product/${product.id}`);

      if (response.success) {
        // Parse JSON strings từ API response
        let descriptions = null;
        let specifications = null;
        let videos = null;
        let wholesalePrice = [];
        let parsedImage = '';

        try {
          if (response.data.descriptions) descriptions = JSON.parse(response.data.descriptions);
        } catch (e) {
          console.warn('Failed to parse descriptions:', response.data.descriptions);
        }

        try {
          if (response.data.specifications) specifications = JSON.parse(response.data.specifications);
        } catch (e) {
          console.warn('Failed to parse specifications:', response.data.specifications);
        }

        try {
          if (response.data.videos) videos = JSON.parse(response.data.videos);
        } catch (e) {
          console.warn('Failed to parse videos:', response.data.videos);
        }

        try {
          if (response.data.wholesalePrice) {
            const parsed = JSON.parse(response.data.wholesalePrice);
            if (Array.isArray(parsed)) {
              wholesalePrice = parsed;
            }
          }
        } catch (e) {
          console.warn('Failed to parse wholesalePrice:', response.data.wholesalePrice);
        }

        try {
          if (response.data.image) {
            const imageData = JSON.parse(response.data.image);
            parsedImage = imageData.imageUrl || imageData.url || '';
          }
        } catch (e) {
          console.warn('Failed to parse image:', response.data.image);
          parsedImage = response.data.image || '';
        }

        const fullProductData: Product = {
          id: response.data.id.toString(),
          name: response.data.name,
          sku: response.data.sku,
          price: response.data.price,
          stock: 0,
          status: 'active',
          image: parsedImage,
          descriptions,
          specifications,
          shortDescription: response.data.shortDescription,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updateAt,
          showOnHomepage: response.data.showOnHomepage,
          isFeatured: response.data.isFeatured,
          retailPrice: response.data.price,
          wholesalePrice,
          videos
        };

        setSelectedProduct(fullProductData);
        setFormMode("edit");
        setIsFormOpen(true);
      } else {
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải chi tiết sản phẩm để chỉnh sửa.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch product details for edit:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải chi tiết sản phẩm để chỉnh sửa.",
        variant: "destructive",
      });
    }
  };

  const handleViewProduct = async (product: Product) => {
    try {
      // Call API to get full product details
      const response = await apiRequest<ApiResponse<ApiProductResponse>>(`/api/product/${product.id}`);

      if (response.success) {
        // Parse JSON strings from API response
        let parsedImage = '';
        let parsedDescriptions = [];
        let parsedVideos = [];
        let parsedSpecifications = { general: [], technical: [] };
        let parsedWholesalePrice = [];

        try {
          // Parse image JSON string
          if (response.data.image) {
            const imageData = JSON.parse(response.data.image);
            parsedImage = imageData.imageUrl || imageData.url || '';
          }

          // Parse descriptions JSON string
          if (response.data.descriptions) {
            parsedDescriptions = JSON.parse(response.data.descriptions);
          }

          // Parse videos JSON string
          if (response.data.videos) {
            parsedVideos = JSON.parse(response.data.videos);
          }

          // Parse specifications JSON string
          if (response.data.specifications) {
            parsedSpecifications = JSON.parse(response.data.specifications);
          }

          // Parse wholesale price JSON string
          if (response.data.wholesalePrice) {
            parsedWholesalePrice = JSON.parse(response.data.wholesalePrice);
          }
        } catch (parseError) {
          console.error('Error parsing JSON fields:', parseError);
        }

        // Transform API response to UI format with parsed data
        const detailedProduct: Product = {
          id: response.data.id.toString(),
          name: response.data.name || '',
          sku: response.data.sku || '',
          price: response.data.price || 0,
          image: parsedImage,
          description: '', // Not in API response
          specifications: parsedSpecifications,
          shortDescription: response.data.shortDescription,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updateAt,
          showOnHomepage: response.data.showOnHomepage || false,
          isFeatured: response.data.isFeatured || false,
          retailPrice: response.data.price || 0,
          wholesalePrice: parsedWholesalePrice,
          videos: parsedVideos,
          descriptions: parsedDescriptions
        };

        setSelectedProduct(detailedProduct);
        setIsDetailOpen(true);
      } else {
        throw new Error(response.message || 'Failed to fetch product details');
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      toast({
        title: "Lỗi lấy chi tiết sản phẩm",
        description: "Không thể tải thông tin chi tiết. Vui lòng thử lại.",
        variant: "destructive",
      });

      // Fallback: use current product data
      setSelectedProduct(product);
      setIsDetailOpen(true);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleRestoreProduct = async (product: Product) => {
    try {
      const response = await apiRequest<ApiResponse<any>>(`/api/product/${product.id}/restore`, {
        method: 'PATCH',
      });

      if (response.success) {
        // Remove from deleted products list
        setProducts(prev => prev.filter(p => p.id !== product.id));

        toast({
          title: "Khôi phục thành công",
          description: `Sản phẩm "${product.name}" đã được khôi phục.`,
        });
      } else {
        throw new Error(response.message || 'Failed to restore product');
      }
    } catch (error) {
      console.error('Failed to restore product:', error);
      toast({
        title: "Lỗi khôi phục",
        description: "Không thể khôi phục sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleHardDeleteClick = (product: Product) => {
    setProductToHardDelete(product);
    setIsHardDeleteOpen(true);
  };

  const handleConfirmHardDelete = async () => {
    if (!productToHardDelete) return;

    try {
      const response = await apiRequest<ApiResponse<any>>(`/api/product/${productToHardDelete.id}/hard`, {
        method: 'DELETE',
      });

      if (response.success) {
        // Remove from deleted products list
        setProducts(prev => prev.filter(p => p.id !== productToHardDelete.id));
        setIsHardDeleteOpen(false);
        setProductToHardDelete(undefined);

        toast({
          title: "Xóa vĩnh viễn thành công",
          description: `Sản phẩm "${productToHardDelete.name}" đã được xóa vĩnh viễn khỏi hệ thống.`,
        });
      } else {
        throw new Error(response.message || 'Failed to permanently delete product');
      }
    } catch (error) {
      console.error('Failed to permanently delete product:', error);
      toast({
        title: "Lỗi xóa vĩnh viễn",
        description: "Không thể xóa vĩnh viễn sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };


  const handleExportClick = () => {
    try {
      // Lấy products đã filter
      const productsToExport = viewMode === "deleted" ? displayedProducts : displayedProducts;

      // Prepare data for Excel
      const excelData = productsToExport.map((product, index) => {
        // Get status text
        let statusText = 'Không rõ';
        if (viewMode === "deleted") {
          statusText = 'Đã xóa';
        } else if (product.status) {
          statusText = product.status === 'active' ? 'Đang bán' : 'Ngừng bán';
        } else {
          statusText = 'Đang bán'; // Fallback nếu không có status
        }

        return {
          'STT': index + 1,
          'Mã SP': product.id || '',
          'Tên sản phẩm': product.name || '',
          'SKU': product.sku || '',
          'Giá bán (₫)': typeof product.price === 'number'
            ? product.price
            : (product.price || '').toString().replace(/[^0-9.-]+/g, ''),
          'Tồn kho': product.stock || 0,
          'Trạng thái': statusText,
          'Nổi bật': product.isFeatured ? 'Có' : 'Không',
          'Trang chủ': product.showOnHomepage ? 'Hiển thị' : 'Ẩn',
          'Mô tả ngắn': product.shortDescription || '',
          'Ngày tạo': product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : '',
        };
      });

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sản phẩm');

      // Auto-size columns
      const maxNameWidth = excelData.reduce((w, r) => Math.max(w, (r['Tên sản phẩm'] || '').length), 15);
      ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: 10 }, // Mã SP
        { wch: Math.min(maxNameWidth + 2, 40) }, // Tên SP (max 40)
        { wch: 15 }, // SKU
        { wch: 15 }, // Giá bán
        { wch: 10 }, // Tồn kho
        { wch: 12 }, // Trạng thái
        { wch: 10 }, // Nổi bật
        { wch: 12 }, // Trang chủ
        { wch: 30 }, // Mô tả ngắn
        { wch: 12 }, // Ngày tạo
      ];

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const viewText = viewMode === "deleted" ? "DaXoa" : "HoatDong";
      const filename = `SanPham_${viewText}_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Xuất Excel thành công",
        description: `Đã xuất ${productsToExport.length} sản phẩm ra file ${filename}`,
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

  const handleApplyFilter = (newFilters: any) => {
    const hasActiveFilters = newFilters.status !== 'all' || newFilters.featured !== 'all';

    setFilters({
      status: newFilters.status || 'all',
      priceRange: newFilters.priceRange || { min: 0, max: 100000000 },
      featured: newFilters.featured || 'all'
    });
    setCurrentPage(1); // Reset to first page

    // Only show toast if filters are actually applied
    if (hasActiveFilters) {
      toast({
        title: "Áp dụng bộ lọc",
        description: "Đã lọc sản phẩm theo tiêu chí đã chọn",
      });
    }
  };

  const handleResetFilter = () => {
    setFilters({
      status: 'all',
      priceRange: { min: 0, max: 100000000 },
      featured: 'all'
    });
    setCurrentPage(1);

    toast({
      title: "Đã xóa bộ lọc",
      description: "Hiển thị tất cả sản phẩm",
    });
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {

      // Form data is already in correct API format (JSON strings)
      const apiProductData: ApiProductRequest = {
        sku: productData.sku || `SKU${Date.now()}`,
        name: productData.name || '',
        shortDescription: productData.shortDescription || '',
        image: productData.image || '',
        descriptions: productData.descriptions || '[]',
        videos: productData.videos || '[]',
        specifications: productData.specifications || '[]',
        price: typeof productData.price === 'number' ?
          productData.price :
          (typeof productData.price === 'string' ?
            parseFloat(productData.price.replace(/[^0-9.-]+/g, "")) : 0),
        wholesalePrice: productData.wholesalePrice || '[]',
        showOnHomepage: productData.showOnHomepage || false,
        isFeatured: productData.isFeatured || false
      };

      if (formMode === "add") {


        const response = await apiRequest<ApiResponse<ApiProductResponse>>('/api/product/products', {
          method: 'POST',
          body: JSON.stringify(apiProductData),
        });

        if (response.success) {
          const newProduct = transformApiProductToUI(response.data);
          setProducts(prev => [newProduct, ...prev]);
          setIsFormOpen(false);

          toast({
            title: "Thêm sản phẩm thành công",
            description: `Sản phẩm "${response.data.name}" đã được thêm vào hệ thống.`,
          });
        } else {
          throw new Error(response.message || 'Failed to create product');
        }
      } else if (selectedProduct) {
        // Update existing product with PATCH API
        console.log('=== PATCH API REQUEST DATA ===');
        console.log('Product ID:', selectedProduct.id);
        console.log('Product data (changed fields only):', productData);
        console.log('PATCH Request Body:', JSON.stringify(productData, null, 2));
        console.log('===============================');

        const response = await apiRequest<ApiResponse<ApiProductResponse>>(`/api/product/${selectedProduct.id}`, {
          method: 'PATCH',
          body: JSON.stringify(productData),
        });

        if (response.success) {
          const updatedProduct = transformApiProductToUI(response.data);
          setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
          setIsFormOpen(false);

          toast({
            title: "Cập nhật sản phẩm thành công",
            description: `Sản phẩm "${response.data.name}" đã được cập nhật.`,
          });
        } else {
          throw new Error(response.message || 'Failed to update product');
        }
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      toast({
        title: "Lỗi lưu sản phẩm",
        description: "Không thể lưu sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      try {
        // Use proper soft delete API
        const response = await apiRequest<ApiResponse<any>>(`/api/product/${selectedProduct.id}`, {
          method: 'DELETE',
        });

        if (response.success) {
          // Remove from local state (UI shows it as deleted)
          setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
          setIsDeleteOpen(false);
          setSelectedProduct(undefined);

          toast({
            title: "Xóa sản phẩm thành công",
            description: `Sản phẩm "${selectedProduct.name}" đã được xóa mềm khỏi hệ thống.`,
          });
        } else {
          throw new Error(response.message || 'Failed to soft delete product');
        }
      } catch (error) {
        console.error('Failed to soft delete product:', error);
        toast({
          title: "Lỗi xóa sản phẩm",
          description: "Không thể xóa sản phẩm. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    }
  };

  // Calculate enhanced stats - ALWAYS use allProducts for consistent stats
  const statsProducts = viewMode === "active" ? allProducts : products;
  const totalProducts = statsProducts.length;
  const activeProducts = statsProducts.length;
  const featuredProducts = statsProducts.filter(p => p.isFeatured).length;

  // Calculate stock-based metrics
  const outOfStockProducts = statsProducts.filter(p => {
    const stock = p.stock !== undefined ? p.stock : (p.specifications as any)?.stock;
    const stockNum = typeof stock === 'string' ? parseInt(stock) : (stock || 0);
    return stockNum === 0;
  }).length;

  const lowStockProducts = statsProducts.filter(p => {
    const stock = p.stock !== undefined ? p.stock : (p.specifications as any)?.stock;
    const stockNum = typeof stock === 'string' ? parseInt(stock) : (stock || 0);
    return stockNum > 0 && stockNum <= 10;
  }).length;

  // Calculate total inventory value
  const totalInventoryValue = statsProducts.reduce((sum, p) => {
    const price = typeof p.price === 'number' ? p.price :
                  (typeof p.price === 'string' ? parseFloat(p.price.replace(/[^0-9.-]+/g, '')) : 0);
    const stock = p.stock !== undefined ? p.stock : (p.specifications as any)?.stock;
    const stockNum = typeof stock === 'string' ? parseInt(stock) : (stock || 0);
    return sum + (price * stockNum);
  }, 0);

  const avgProductValue = totalProducts > 0 ? totalInventoryValue / totalProducts : 0;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg text-gray-600">Đang tải danh sách sản phẩm...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý sản phẩm</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {viewMode === "active" ? "Quản lý danh sách sản phẩm từ hệ thống" : "Danh sách sản phẩm đã xóa"}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("active")}
              className="text-xs"
            >
              <Archive className="h-4 w-4 mr-1" />
              Sản phẩm
              {totalActiveProducts > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                  {totalActiveProducts}
                </span>
              )}
            </Button>
            <Button
              variant={viewMode === "deleted" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("deleted")}
              className="text-xs"
            >
              <Trash className="h-4 w-4 mr-1" />
              Đã xóa
              {totalDeletedProducts > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                  {totalDeletedProducts}
                </span>
              )}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setRefreshTrigger(prev => prev + 1)} disabled={initialLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${initialLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          {viewMode === "active" && (
            <Button className="bg-primary hover:bg-primary/90" onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sản phẩm
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      {totalProducts > 0 && viewMode === "active" && (
        <motion.div
          className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
        <motion.div variants={gridItemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProducts}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={gridItemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Đang bán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeProducts}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={gridItemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Nổi bật</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{featuredProducts}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={gridItemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Hết hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{outOfStockProducts}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={gridItemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Sắp hết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{lowStockProducts}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">≤ 10 sản phẩm</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={gridItemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Giá trị kho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', compactDisplay: 'short' }).format(totalInventoryValue)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                TB: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', compactDisplay: 'short' }).format(avgProductValue)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportClick}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel
                </Button>
              </div>
            </div>

            {/* Quick Filter Buttons */}
            {viewMode === "active" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.status === 'all' && filters.featured === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleApplyFilter({ status: 'all', priceRange: filters.priceRange, featured: 'all' })}
                >
                  Tất cả ({totalProducts})
                </Button>
                <Button
                  variant={filters.status === 'in_stock' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleApplyFilter({ ...filters, status: 'in_stock' })}
                  className={filters.status === 'in_stock' ? '' : 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-700 dark:hover:text-green-300'}
                >
                  Còn hàng ({totalProducts - outOfStockProducts})
                </Button>
                <Button
                  variant={filters.status === 'low_stock' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleApplyFilter({ ...filters, status: 'low_stock' })}
                  className={filters.status === 'low_stock' ? '' : 'text-orange-600 dark:text-orange-400 border-orange-600 dark:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-700 dark:hover:text-orange-300'}
                >
                  Sắp hết ({lowStockProducts})
                </Button>
                <Button
                  variant={filters.status === 'out_of_stock' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleApplyFilter({ ...filters, status: 'out_of_stock' })}
                  className={filters.status === 'out_of_stock' ? '' : 'text-red-600 dark:text-red-400 border-red-600 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300'}
                >
                  Hết hàng ({outOfStockProducts})
                </Button>
                <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>
                <Button
                  variant={filters.featured === 'featured' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleApplyFilter({ ...filters, featured: 'featured' })}
                  className={filters.featured === 'featured' ? '' : 'text-yellow-600 dark:text-yellow-400 border-yellow-600 dark:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 hover:text-yellow-700 dark:hover:text-yellow-300'}
                >
                  Nổi bật ({featuredProducts})
                </Button>
                <Button
                  variant={filters.featured === 'not_featured' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleApplyFilter({ ...filters, featured: 'not_featured' })}
                  className={filters.featured === 'not_featured' ? '' : 'text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'}
                >
                  Không nổi bật ({totalProducts - featuredProducts})
                </Button>
                {(filters.status !== 'all' || filters.featured !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilter}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    ✕ Xóa bộ lọc
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        viewMode === "deleted"
                          ? "bg-red-100 dark:bg-red-900/20"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}>
                        {viewMode === "deleted" ? (
                          <Trash className="h-8 w-8 text-red-400" />
                        ) : (
                          <Plus className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {viewMode === "deleted"
                            ? (searchTerm ? 'Không tìm thấy sản phẩm đã xóa' : 'Không có sản phẩm đã xóa')
                            : (searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào')
                          }
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          {viewMode === "deleted"
                            ? (searchTerm
                                ? `Không tìm thấy sản phẩm đã xóa nào khớp với "${searchTerm}".`
                                : 'Tuyệt vời! Bạn chưa xóa sản phẩm nào. Các sản phẩm đã xóa sẽ hiển thị ở đây.'
                              )
                            : (searchTerm
                                ? `Không tìm thấy sản phẩm nào khớp với "${searchTerm}". Hãy thử từ khóa khác.`
                                : 'Bắt đầu bằng cách thêm sản phẩm đầu tiên vào hệ thống của bạn.'
                              )
                          }
                        </p>
                      </div>
                      {viewMode === "active" && !searchTerm && (
                        <Button onClick={handleAddProduct} className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm sản phẩm đầu tiên
                        </Button>
                      )}
                      {searchTerm && (
                        <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2">
                          Xóa bộ lọc tìm kiếm
                        </Button>
                      )}
                      {viewMode === "deleted" && !searchTerm && (
                        <Button variant="outline" onClick={() => setViewMode("active")} className="mt-2">
                          <Archive className="h-4 w-4 mr-2" />
                          Xem sản phẩm đang bán
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedProducts.map((product) => (
                <TableRow key={product.id} className={viewMode === "deleted" ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop"}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop";
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">{product.sku}</Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {typeof product.price === 'number'
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)
                      : product.price
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{product.stock || 0}</span>
                      {viewMode === "deleted" ? (
                        <ThemeBadge variant="destructive">Đã xóa</ThemeBadge>
                      ) : product.stock === 0 ? (
                        <ThemeBadge variant="destructive">Hết hàng</ThemeBadge>
                      ) : product.stock <= 10 ? (
                        <ThemeBadge variant="warning">Sắp hết</ThemeBadge>
                      ) : (
                        <ThemeBadge variant="success">Còn hàng</ThemeBadge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewProduct(product)}
                        title="Xem chi tiết"
                        className="hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {viewMode === "active" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                            title="Chỉnh sửa"
                            className="hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => handleDeleteProduct(product)}
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/20"
                            onClick={() => handleRestoreProduct(product)}
                            title="Khôi phục sản phẩm"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => handleHardDeleteClick(product)}
                            title="Xóa vĩnh viễn"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredProducts.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-gray-500">
                Hiển thị {showAll ? filteredProducts.length : Math.min(displayedProducts.length, filteredProducts.length)} / {filteredProducts.length} sản phẩm
              </div>
              <div className="flex items-center space-x-2">
                {!showAll && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <span className="text-sm">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
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
        </CardContent>
      </Card>

      <EnhancedProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        mode={formMode}
      />

      <ProductDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        product={selectedProduct}
      />

      {/* Hard Delete Confirmation Dialog */}
      <Dialog open={isHardDeleteOpen} onOpenChange={setIsHardDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">⚠️ Xác nhận xóa vĩnh viễn</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">
                Hành động này không thể hoàn tác!
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                Sản phẩm sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu và không thể khôi phục.
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                "{productToHardDelete?.name}"
              </strong>
              ?
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsHardDeleteOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmHardDelete}
              className="flex-1"
            >
              <Trash className="h-4 w-4 mr-2" />
              Xóa vĩnh viễn
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        product={selectedProduct || null}
      />
    </div>
  );
}
