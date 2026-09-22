export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  itemCount: number;
}

export interface CommerceProduct {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  imageUrl: string;
  supplierName: string;
  provinceOrigin: string;
  ratingAvg: number;
  soldCount: number;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  itemsCount: number;
  createdAt: string;
}
