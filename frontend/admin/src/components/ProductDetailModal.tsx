
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/types";
import { ProductSerialManager } from "./ProductSerialManager";
import { productService } from "@/services/productService";
import { useEffect, useState } from "react";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const [inventoryData, setInventoryData] = useState<{
    availableCount: number;
    soldCount: number;
    damagedCount: number;
    totalCount: number;
  } | null>(null);
  const [loadingInventory, setLoadingInventory] = useState(false);

  useEffect(() => {
    if (product?.id && isOpen) {
      const fetchInventory = async () => {
        setLoadingInventory(true);
        try {
          const response = await productService.getProductInventory(product.id.toString());
          if (response.success) {
            setInventoryData(response.data);
          }
        } catch (error) {
          console.error('Error fetching inventory:', error);
        } finally {
          setLoadingInventory(false);
        }
      };

      fetchInventory();
    }
  }, [product?.id, isOpen]);

  if (!product) return null;

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Hết hàng</Badge>;
    }
    if (stock < 20) {
      return <Badge className="bg-yellow-100 text-yellow-800">Sắp hết</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Còn hàng</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết sản phẩm</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image and Basic Info */}
          <div className="flex gap-6">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
              className="w-32 h-32 rounded-lg object-cover border"
            />
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600">SKU: {product.sku}</p>
              {product.shortDescription && (
                <p className="text-gray-600 text-sm italic">{product.shortDescription}</p>
              )}
              {product.model && (
                <div className="flex items-center gap-2">
                  <span>Mẫu:</span>
                  <Badge variant="outline">{product.model}</Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Pricing and Inventory */}
          <div>
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Thông tin giá và kho</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Giá bán</div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 break-words">
                  {typeof product.price === 'number'
                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)
                    : product.price + ' ₫'
                  }
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Tồn kho</div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {loadingInventory ? "..." : (inventoryData?.availableCount ?? product.stock ?? 0)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Đã bán</div>
                <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {loadingInventory ? "..." : (inventoryData?.soldCount ?? product.sold ?? 0)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Nổi bật</div>
                <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                  {product.isFeatured ? 'Có' : 'Không'}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Trang chủ</div>
                <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                  {product.showOnHomepage ? 'Có' : 'Không'}
                </div>
              </div>
            </div>
          </div>

          {/* Wholesale Information */}
          {(() => {
            let parsedWholesale = [];
            if (product.wholesalePrice) {
              if (typeof product.wholesalePrice === 'string') {
                try {
                  parsedWholesale = JSON.parse(product.wholesalePrice);
                } catch (e) {
                  console.error('Error parsing wholesalePrice JSON:', e);
                }
              } else if (Array.isArray(product.wholesalePrice)) {
                parsedWholesale = product.wholesalePrice;
              }
            }

            return parsedWholesale && Array.isArray(parsedWholesale) && parsedWholesale.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Chính sách bán sỉ</h3>
                  <div className="space-y-3">
                    {parsedWholesale.map((tier, index) => (
                      <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Số lượng tối thiểu</div>
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{tier.quantity}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Giá sỉ</div>
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tier.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}

          {/* Description */}
          {product.descriptions && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Mô tả sản phẩm</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg product-description">
                  {Array.isArray(product.descriptions) ? (
                    <div className="space-y-4">
                      {product.descriptions.map((item, index) => (
                        <div key={index}>
                          {item.type === 'title' && (
                            <h4 className="font-semibold text-lg dark:text-gray-200">{item.text}</h4>
                          )}
                          {item.type === 'description' && (
                            <div className="description-content" dangerouslySetInnerHTML={{ __html: item.text || '' }} />
                          )}
                          {item.type === 'image' && (
                            <img
                              src={item.imageUrl || ''}
                              alt="Product description"
                              className="max-w-full rounded"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{product.descriptions}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Specifications */}
          {(() => {
            let parsedSpecs = null;
            if (product.specifications) {
              if (typeof product.specifications === 'string') {
                try {
                  parsedSpecs = JSON.parse(product.specifications);
                } catch (e) {
                  console.error('Error parsing specifications JSON:', e);
                }
              } else if (Array.isArray(product.specifications)) {
                parsedSpecs = product.specifications;
              } else if (typeof product.specifications === 'object') {
                // Handle old format with general/technical groups
                parsedSpecs = product.specifications;
              }
            }

            return parsedSpecs && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Thông số kỹ thuật</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                    {Array.isArray(parsedSpecs) ? (
                      // New format: simple array
                      parsedSpecs.map((spec, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{spec.label}:</span>
                          <span className="font-medium dark:text-gray-200">{spec.value}</span>
                        </div>
                      ))
                    ) : (
                      // Old format: grouped by general/technical
                      <div className="space-y-4">
                        {parsedSpecs.general && parsedSpecs.general.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 dark:text-gray-200">Thông số chung</h4>
                            <div className="space-y-2">
                              {parsedSpecs.general.map((spec, index) => (
                                <div key={index} className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">{spec.label}:</span>
                                  <span className="font-medium dark:text-gray-200">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {parsedSpecs.technical && parsedSpecs.technical.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 dark:text-gray-200">Thông số kỹ thuật</h4>
                            <div className="space-y-2">
                              {parsedSpecs.technical.map((spec, index) => (
                                <div key={index} className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">{spec.label}:</span>
                                  <span className="font-medium dark:text-gray-200">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}

          {/* Videos */}
          {(() => {
            let parsedVideos = [];
            if (product.videos) {
              if (typeof product.videos === 'string') {
                try {
                  parsedVideos = JSON.parse(product.videos);
                } catch (e) {
                  console.error('Error parsing videos JSON:', e);
                }
              } else if (Array.isArray(product.videos)) {
                parsedVideos = product.videos;
              }
            }

            // Helper function to extract YouTube video ID from URL
            const getYouTubeVideoId = (url: string): string | null => {
              if (!url) return null;
              const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
              const match = url.match(regex);
              return match ? match[1] : null;
            };

            // Helper function to get YouTube embed URL
            const getYouTubeEmbedUrl = (url: string): string => {
              const videoId = getYouTubeVideoId(url);
              return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
            };

            return parsedVideos && Array.isArray(parsedVideos) && parsedVideos.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-4 dark:text-gray-100">
                    {parsedVideos.length === 1 ? 'Video sản phẩm' : 'Videos sản phẩm'}
                  </h3>
                  {parsedVideos.length === 1 ? (
                    /* Single video layout - more prominent display */
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <h5 className="font-medium text-lg mb-2 dark:text-gray-200">{parsedVideos[0].title}</h5>
                          {parsedVideos[0].description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{parsedVideos[0].description}</p>
                          )}
                        </div>
                        {parsedVideos[0].videoUrl && getYouTubeVideoId(parsedVideos[0].videoUrl) && (
                          <div className="flex-1">
                            <iframe
                              src={getYouTubeEmbedUrl(parsedVideos[0].videoUrl)}
                              className="w-full h-64 lg:h-80 rounded-lg shadow-sm"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={parsedVideos[0].title}
                            ></iframe>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Multiple videos layout - compact list */
                    <div className="space-y-4">
                      {parsedVideos.map((video, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h5 className="font-medium mb-2 dark:text-gray-200">{video.title}</h5>
                          {video.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{video.description}</p>
                          )}
                          {video.videoUrl && getYouTubeVideoId(video.videoUrl) && (
                            <iframe
                              src={getYouTubeEmbedUrl(video.videoUrl)}
                              className="w-full h-64 rounded-lg shadow-sm"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={video.title}
                            ></iframe>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* Serial Numbers Management */}
          <Separator />
          <ProductSerialManager 
            productId={product.id!} 
            productName={product.name} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
