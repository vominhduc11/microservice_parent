import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react";
import { WholesalePriceTier } from "@/types";

interface WholesalePriceEditorProps {
  value: WholesalePriceTier[];
  onChange: (tiers: WholesalePriceTier[]) => void;
}

export function WholesalePriceEditor({ value, onChange }: WholesalePriceEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addTier = () => {
    const newTier: WholesalePriceTier = {
      id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quantity: 10,
      price: 0
    };
    onChange([...value, newTier]);
    setEditingIndex(value.length);
  };

  const removeTier = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  const updateTier = (index: number, updates: Partial<WholesalePriceTier>) => {
    const updatedTiers = value.map((tier, i) =>
      i === index ? { ...tier, ...updates } : tier
    );
    onChange(updatedTiers);
  };

  const moveTier = (index: number, direction: 'up' | 'down') => {
    const newTiers = [...value];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newTiers.length) {
      [newTiers[index], newTiers[targetIndex]] = [newTiers[targetIndex], newTiers[index]];
      onChange(newTiers);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Bảng giá sỉ theo số lượng</h4>
        <Button
          type="button"
          onClick={addTier}
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Thêm bậc giá
        </Button>
      </div>

      <div className="space-y-3">
        {value.map((tier, index) => (
          <Card key={tier.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Bậc {index + 1}: Từ {tier.quantity} sản phẩm - {formatPrice(tier.price)}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveTier(index, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveTier(index, 'down')}
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
                    onClick={() => removeTier(index)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingIndex === index ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Số lượng tối thiểu</label>
                    <Input
                      type="number"
                      min="1"
                      value={tier.quantity}
                      onChange={(e) => updateTier(index, { quantity: parseInt(e.target.value) || 0 })}
                      placeholder="Số lượng..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Giá sỉ (VND)</label>
                    <Input
                      type="number"
                      min="0"
                      value={tier.price}
                      onChange={(e) => updateTier(index, { price: parseInt(e.target.value) || 0 })}
                      placeholder="Giá sỉ..."
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 p-3 rounded">
                  <div className="text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-foreground">Từ:</span> <span className="text-muted-foreground">{tier.quantity} sản phẩm</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Giá:</span> <span className="text-muted-foreground">{formatPrice(tier.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {value.length === 0 && (
          <div className="text-center py-6 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <p>Chưa có bậc giá nào. Nhấn "Thêm bậc giá" để bắt đầu.</p>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <div className="text-sm text-foreground">
            <p className="font-medium mb-1">💡 Lưu ý:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Các bậc giá được sắp xếp theo số lượng tăng dần</li>
              <li>• Giá sỉ nên thấp hơn giá lẻ để khuyến khích mua số lượng lớn</li>
              <li>• Khách hàng sẽ được áp dụng giá tốt nhất phù hợp với số lượng đặt</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}