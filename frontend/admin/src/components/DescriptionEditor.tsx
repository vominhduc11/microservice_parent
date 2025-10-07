import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react";
import { BlogIntroductionItem } from "@/types";
import { ImageUpload } from "./ImageUpload";
import { uploadService } from "@/services/uploadService";
import ReactQuill from 'react-quill';

interface DescriptionEditorProps {
  value: BlogIntroductionItem[];
  onChange: (items: BlogIntroductionItem[]) => void;
}

export function DescriptionEditor({ value, onChange }: DescriptionEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addItem = () => {
    const newItem: BlogIntroductionItem = {
      type: 'description',
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

  const updateItem = (index: number, updates: Partial<BlogIntroductionItem>) => {
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

  const renderPreview = (item: BlogIntroductionItem, index: number) => {
    switch (item.type) {
      case 'title':
        return <h3 className="text-lg font-semibold text-gray-900">{item.text || 'Tiêu đề trống'}</h3>;
      case 'description':
        return <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: item.text || 'Mô tả trống' }} />;
      case 'image':
        return (
          <div className="text-sm text-blue-600">
            <span className="font-medium">Hình ảnh</span>
            {item.imageUrl && (
              <>
                <br />
                <img src={item.imageUrl} alt="Preview" className="mt-2 max-w-32 h-20 object-cover rounded" />
                <br />
                <span className="text-gray-500">Public ID: {item.public_id}</span>
              </>
            )}
          </div>
        );
      default:
        return <p className="text-gray-400">Không xác định</p>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Nội dung giới thiệu</h4>
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
                    item.type === 'image' ? 'Hình ảnh' : 'Không xác định'
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
                    className="text-red-600 hover:text-red-700"
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
                      onValueChange={(type: 'title' | 'description' | 'image') => updateItem(index, { type })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Tiêu đề</SelectItem>
                        <SelectItem value="description">Mô tả</SelectItem>
                        <SelectItem value="image">Hình ảnh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {item.type !== 'image' && (
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
                          placeholder="Nhập tiêu đề..."
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
                            updateItem(index, {
                              imageUrl: value.url,
                              public_id: value.public_id
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
                        placeholder="Chọn hoặc kéo thả hình ảnh"
                        maxSizeInMB={5}
                        previewSize="medium"
                        folder="description_blog"
                        useObjectFormat={true}
                      />
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
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có mục nào. Nhấn "Thêm mục" để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}