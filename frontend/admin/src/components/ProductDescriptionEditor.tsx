import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react";
import { ProductOverviewItem } from "@/types";
import { ImageUpload } from "./ImageUpload";
import { uploadService } from "@/services/uploadService";

// Suppress ReactQuill findDOMNode deprecation warning (if not already suppressed)
if (typeof window !== 'undefined' && !(window as any)._reactQuillWarningSuppressed) {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
      return;
    }
    originalConsoleWarn(...args);
  };
  (window as any)._reactQuillWarningSuppressed = true;
}
import ReactQuill from 'react-quill';

interface ProductDescriptionEditorProps {
  value: ProductOverviewItem[];
  onChange: (items: ProductOverviewItem[]) => void;
}

export function ProductDescriptionEditor({ value, onChange }: ProductDescriptionEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

  const addItem = () => {
    const newItem: ProductOverviewItem = {
      type: 'title',
      text: ''
    };
    onChange([...value, newItem]);
    setEditingIndex(value.length);
  };

  const removeItem = (index: number) => {
    const newItems = value.filter((_, i) => i !== index);
    onChange(newItems);
    setEditingIndex(null);
  };

  const updateItem = (index: number, updates: Partial<ProductOverviewItem>) => {
    const newItems = value.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onChange(newItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...value];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      onChange(newItems);
    }
  };

  const renderPreview = (item: ProductOverviewItem, index: number) => {
    switch (item.type) {
      case 'title':
        return <h3 className="text-lg font-semibold text-foreground">{item.text || 'Tiêu đề trống'}</h3>;
      case 'description':
        return <div className="text-muted-foreground text-sm" dangerouslySetInnerHTML={{ __html: item.text || 'Mô tả trống' }} />;
      case 'image':
        return (
          <div className="text-sm text-primary">
            <span className="font-medium">Hình ảnh sản phẩm</span>
            {item.imageUrl && (
              <>
                <br />
                <img src={item.imageUrl} alt="Preview" className="mt-2 max-w-32 h-20 object-cover rounded" />
                <br />
                <span className="text-muted-foreground">Public ID: {item.public_id || 'N/A'}</span>
              </>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="text-sm text-primary">
            <span className="font-medium">Video YouTube</span>
            {item.videoUrl && getYouTubeVideoId(item.videoUrl) && (
              <>
                <br />
                <div className="mt-2">
                  <iframe
                    src={getYouTubeEmbedUrl(item.videoUrl)}
                    className="w-full max-w-64 h-36 rounded border"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`Video ${index + 1}`}
                  ></iframe>
                </div>
              </>
            )}
            {item.videoUrl && !getYouTubeVideoId(item.videoUrl) && (
              <>
                <br />
                <span className="text-amber-600 text-xs">⚠️ URL không hợp lệ</span>
              </>
            )}
            {!item.videoUrl && (
              <>
                <br />
                <span className="text-muted-foreground text-xs">Chưa có URL</span>
              </>
            )}
          </div>
        );
      default:
        return <p className="text-muted-foreground">Không xác định</p>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Mô tả sản phẩm chi tiết</h4>
        <Button type="button" onClick={addItem} size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Thêm mục
        </Button>
      </div>

      <div className="space-y-3">
        {value.map((item, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Mục {index + 1}: {
                    item.type === 'title' ? 'Tiêu đề' :
                    item.type === 'description' ? 'Mô tả' :
                    item.type === 'image' ? 'Hình ảnh' :
                    item.type === 'video' ? 'Video' :
                    item.type === 'list' ? 'Danh sách' : 'Không xác định'
                  }
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === value.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  >
                    {editingIndex === index ? 'Xong' : 'Sửa'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingIndex === index ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Loại</label>
                    <Select
                      value={item.type}
                      onValueChange={(type: 'title' | 'description' | 'image' | 'video') => {
                        if (type === 'image') {
                          const { text, videoUrl, videoTitle, videoDescription, ...itemWithoutText } = item;
                          updateItem(index, { ...itemWithoutText, type });
                        } else if (type === 'video') {
                          const { text, public_id, imageUrl, videoTitle, videoDescription, ...itemWithoutImage } = item;
                          updateItem(index, { ...itemWithoutImage, type });
                        } else {
                          updateItem(index, { type });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Tiêu đề</SelectItem>
                        <SelectItem value="description">Mô tả</SelectItem>
                        <SelectItem value="image">Hình ảnh</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {item.type !== 'image' && item.type !== 'video' && (
                    <div>
                      <label className="text-sm font-medium">Nội dung</label>
                      {item.type === 'description' ? (
                        <ReactQuill
                          theme="snow"
                          value={item.text || ''}
                          onChange={(value) => updateItem(index, { text: value })}
                          placeholder="Nhập mô tả..."
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              [{ 'color': [] }, { 'background': [] }],
                              ['link'],
                              ['clean']
                            ],
                          }}
                          formats={[
                            'header', 'bold', 'italic', 'underline', 'strike',
                            'list', 'bullet', 'color', 'background', 'link'
                          ]}
                        />
                      ) : (
                        <Input
                          value={item.text || ''}
                          onChange={(e) => updateItem(index, { text: e.target.value })}
                          placeholder={
                            item.type === 'title' ? 'Nhập tiêu đề...' : 'Nhập nội dung...'
                          }
                        />
                      )}
                    </div>
                  )}


                  {item.type === 'image' && (
                    <div>
                      <label className="text-sm font-medium">Chọn hình ảnh</label>
                      <ImageUpload
                        value={item.imageUrl || ''}
                        onChange={(value) => {
                          if (typeof value === 'string') {
                            updateItem(index, { imageUrl: value });
                          } else {
                            const { text, ...itemWithoutText } = item;
                            updateItem(index, {
                              ...itemWithoutText,
                              public_id: value.public_id,
                              imageUrl: value.url
                            });
                          }
                        }}
                        onRemove={async (data) => {
                          try {
                            if (typeof data === 'string') {
                              await uploadService.deleteFile(data);
                            } else {
                              await uploadService.deleteFile(data.public_id, 'image');
                            }
                          } catch (error) {
                            console.error('Failed to delete file:', error);
                          }
                        }}
                        placeholder="Chọn hoặc kéo thả hình ảnh sản phẩm"
                        maxSizeInMB={5}
                        previewSize="medium"
                        folder="products"
                        useObjectFormat={true}
                      />
                    </div>
                  )}

                  {item.type === 'video' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">URL Video YouTube *</label>
                        <Input
                          value={item.videoUrl || ''}
                          onChange={(e) => updateItem(index, { videoUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Hỗ trợ URL từ YouTube (youtube.com hoặc youtu.be)
                        </p>
                      </div>

                      {/* YouTube Preview */}
                      {item.videoUrl && getYouTubeVideoId(item.videoUrl) && (
                        <div>
                          <label className="text-sm font-medium">Preview</label>
                          <div className="mt-2">
                            <iframe
                              src={getYouTubeEmbedUrl(item.videoUrl)}
                              className="w-full h-64 rounded-lg border"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={`Video ${index + 1}`}
                            ></iframe>
                          </div>
                        </div>
                      )}

                      {/* Invalid URL Warning */}
                      {item.videoUrl && !getYouTubeVideoId(item.videoUrl) && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            ⚠️ URL không hợp lệ. Vui lòng nhập URL YouTube hợp lệ.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-muted/50 p-3 rounded">
                  {renderPreview(item, index)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {value.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Chưa có mục nào. Nhấn "Thêm mục" để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}