
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

interface Order {
  id: string;
  customer: string;
  email: string;
  products: number;
  amount: string;
  status: string;
  date: string;
  shipping: string;
  address: string;
}

interface OrderDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order?: Order;
}

export function OrderDeleteDialog({ isOpen, onClose, onConfirm, order }: OrderDeleteDialogProps) {
  const { toast } = useToast();

  const handleConfirm = () => {
    onConfirm();
    toast({
      title: "Xóa thành công",
      description: `Đơn hàng ${order?.id} đã được xóa khỏi hệ thống`,
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa đơn hàng <strong>{order?.id}</strong> của khách hàng <strong>{order?.customer}</strong>?
            <br />
            Hành động này không thể hoàn tác.
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
