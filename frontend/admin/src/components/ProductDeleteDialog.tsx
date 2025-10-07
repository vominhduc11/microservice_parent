
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";

interface ProductDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product?: Product;
}

export function ProductDeleteDialog({ isOpen, onClose, onConfirm, product }: ProductDeleteDialogProps) {
  const { toast } = useToast();

  const handleConfirm = () => {
    onConfirm();
    toast({
      title: "Xóa thành công",
      description: `Tai nghe ${product?.name} đã được xóa khỏi hệ thống`,
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa tai nghe <strong>{product?.name}</strong>?
            <br />
            Sản phẩm sẽ được ẩn khỏi danh sách nhưng vẫn được lưu trữ trong hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
