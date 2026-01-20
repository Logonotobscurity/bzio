'use client';

import { useState, useTransition, useCallback, useOptimistic } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toggleProductStatus, updateStock, deleteProduct, createProduct, updateProduct } from '../_actions/products';
import { toast } from 'sonner';
import ProductSearch, { ProductFilters } from './_components/ProductSearch';
import ProductTable, { ProductRow } from './_components/ProductTable';

interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description?: string | null;
  detailedDescription?: string | null;
  imageUrl?: string | null;
  price: number;
  stock: number;
  unit: string;
  isActive: boolean;
  isFeatured?: boolean;
  category: string | null;
  categoryId: number | null;
  brand: string | null;
  brandId: number | null;
  views: number;
  quotes: number;
  specifications?: Record<string, unknown>;
  createdAt: Date | string;
}

interface Brand { id: number; name: string; }
interface Category { id: number; name: string; }

interface ProductsClientProps {
  products: Product[];
  brands?: Brand[];
  categories?: Category[];
}

export default function ProductsClient({ products: initialProducts, brands = [], categories = [] }: ProductsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    status: 'all',
    stock: 'all',
  });
  
  // Optimistic state for products
  const [optimisticProducts, setOptimisticProducts] = useOptimistic(
    initialProducts,
    (state, update: { type: 'toggle' | 'delete'; id: string }) => {
      if (update.type === 'toggle') {
        return state.map(p => 
          p.id === update.id ? { ...p, isActive: !p.isActive } : p
        );
      }
      if (update.type === 'delete') {
        return state.map(p => 
          p.id === update.id ? { ...p, isActive: false } : p
        );
      }
      return state;
    }
  );
  
  // Modal states
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState('');
  const [stockReason, setStockReason] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '', sku: '', slug: '', description: '', detailedDescription: '', price: '', stockQuantity: '',
    unit: 'Unit', brandId: '', categoryId: '', isActive: true, isFeatured: false,
  });

  // Filter products based on current filters
  const filteredProducts = optimisticProducts.filter((product) => {
    // Search filter - matches SKU, name, description (case-insensitive)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        product.sku.toLowerCase().includes(searchLower) ||
        product.name.toLowerCase().includes(searchLower) ||
        (product.description?.toLowerCase().includes(searchLower) ?? false);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status === 'active' && !product.isActive) return false;
    if (filters.status === 'inactive' && product.isActive) return false;
    
    // Stock filter
    if (filters.stock === 'in-stock' && product.stock <= 10) return false;
    if (filters.stock === 'low-stock' && (product.stock === 0 || product.stock > 10)) return false;
    if (filters.stock === 'out-of-stock' && product.stock !== 0) return false;

    // Price range filter
    if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;

    // Category filter
    if (filters.category && product.categoryId?.toString() !== filters.category) return false;
    
    return true;
  });

  // Convert to ProductRow format for the table
  const productRows: ProductRow[] = filteredProducts.map(p => ({
    id: p.id,
    imageUrl: p.imageUrl || null,
    sku: p.sku,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category: p.category,
    isActive: p.isActive,
    createdAt: p.createdAt,
  }));

  const stats = {
    total: optimisticProducts.length,
    active: optimisticProducts.filter(p => p.isActive).length,
    lowStock: optimisticProducts.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: optimisticProducts.filter(p => p.stock === 0).length,
  };

  const handleFiltersChange = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
  }, []);

  const handleToggleStatus = async (productId: string) => {
    startTransition(async () => {
      // Optimistic update
      setOptimisticProducts({ type: 'toggle', id: productId });
      
      const result = await toggleProductStatus(parseInt(productId));
      if (result.success) {
        toast.success('Product status updated');
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    });
  };

  const handleDelete = async (productId: string) => {
    startTransition(async () => {
      // Optimistic update
      setOptimisticProducts({ type: 'delete', id: productId });
      
      const result = await deleteProduct(parseInt(productId), false);
      if (result.success) {
        toast.success('Product deactivated');
      } else {
        toast.error(result.error || 'Failed to delete product');
      }
    });
  };

  const handleEdit = (productId: string) => {
    const product = optimisticProducts.find(p => p.id === productId);
    if (product) {
      openEditModal(product);
    }
  };

  const handleUpdateStock = () => {
    if (!stockProduct || !newStock) return;
    startTransition(async () => {
      const result = await updateStock(parseInt(stockProduct.id), parseInt(newStock), stockReason);
      if (result.success) {
        toast.success('Stock updated');
        setStockProduct(null);
        setNewStock('');
        setStockReason('');
      } else {
        toast.error(result.error || 'Failed to update stock');
      }
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.sku || !formData.price || !formData.brandId || !formData.categoryId) {
      toast.error('Please fill all required fields');
      return;
    }
    startTransition(async () => {
      const result = await createProduct({
        name: formData.name,
        sku: formData.sku,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        detailedDescription: formData.detailedDescription || undefined,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        unit: formData.unit || 'Unit',
        brandId: parseInt(formData.brandId),
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      });
      if (result.success) {
        toast.success('Product created');
        setShowCreateModal(false);
        resetForm();
      } else {
        toast.error(result.error || 'Failed to create product');
      }
    });
  };

  const handleUpdate = () => {
    if (!editProduct) return;
    startTransition(async () => {
      const result = await updateProduct(parseInt(editProduct.id), {
        name: formData.name,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        detailedDescription: formData.detailedDescription || undefined,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        unit: formData.unit || 'Unit',
        brandId: parseInt(formData.brandId),
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      });
      if (result.success) {
        toast.success('Product updated');
        setEditProduct(null);
        resetForm();
      } else {
        toast.error(result.error || 'Failed to update product');
      }
    });
  };

  const resetForm = () => {
    setFormData({ name: '', sku: '', slug: '', description: '', detailedDescription: '', price: '', stockQuantity: '', unit: 'Unit', brandId: '', categoryId: '', isActive: true, isFeatured: false });
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      description: product.description || '',
      detailedDescription: product.detailedDescription || '',
      price: product.price.toString(),
      stockQuantity: product.stock.toString(),
      unit: product.unit || 'Unit',
      brandId: product.brandId?.toString() || '',
      categoryId: product.categoryId?.toString() || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured || false,
    });
    setEditProduct(product);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Products</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{stats.active}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p><p className="text-xs text-muted-foreground">Low Stock</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p><p className="text-xs text-muted-foreground">Out of Stock</p></CardContent></Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <ProductSearch 
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
            categories={categories}
          />
        </CardHeader>
        <CardContent>
          <ProductTable
            products={productRows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            isLoading={isPending}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Product Modal */}
      <Dialog open={showCreateModal || !!editProduct} onOpenChange={(open) => { if (!open) { setShowCreateModal(false); setEditProduct(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
            <DialogDescription>{editProduct ? 'Update product details' : 'Add a new product to your catalog'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              {!editProduct && (
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input id="sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                </div>
              )}
              {editProduct && (
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" value={formData.sku} disabled className="bg-muted" />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated-from-name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="detailedDescription">Detailed Description</Label>
              <Textarea id="detailedDescription" value={formData.detailedDescription} onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })} rows={4} placeholder="Full product description with features, benefits, etc." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="e.g., Bottle, Pack, Kg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Brand *</Label>
                <Select value={formData.brandId} onValueChange={(v) => setFormData({ ...formData, brandId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Category *</Label>
                <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); setEditProduct(null); resetForm(); }}>Cancel</Button>
            <Button onClick={editProduct ? handleUpdate : handleCreate} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editProduct ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Update Modal */}
      <Dialog open={!!stockProduct} onOpenChange={(open) => { if (!open) { setStockProduct(null); setNewStock(''); setStockReason(''); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>Update stock for {stockProduct?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Current Stock: {stockProduct?.stock}</Label>
              <Input type="number" placeholder="New stock quantity" value={newStock} onChange={(e) => setNewStock(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Reason (optional)</Label>
              <Input placeholder="e.g., Restock, Inventory adjustment" value={stockReason} onChange={(e) => setStockReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockProduct(null)}>Cancel</Button>
            <Button onClick={handleUpdateStock} disabled={isPending || !newStock}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
