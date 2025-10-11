# React Query Usage Guide

Complete guide for using React Query in the Dealer Frontend application.

## Table of Contents
- [Introduction](#introduction)
- [Setup](#setup)
- [Custom Hooks](#custom-hooks)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Advanced Patterns](#advanced-patterns)

---

## Introduction

React Query (TanStack Query) is used for:
- **Server State Management** - Fetching, caching, and updating server data
- **Automatic Background Refetching** - Keep data fresh automatically
- **Request Deduplication** - Avoid duplicate requests
- **Optimistic Updates** - Update UI before server responds
- **Infinite Scrolling & Pagination** - Built-in support

### Benefits
✅ Eliminates boilerplate code for data fetching
✅ Automatic caching and cache invalidation
✅ Loading and error states handled automatically
✅ Background refetching keeps data fresh
✅ DevTools for debugging

---

## Setup

React Query is already configured in `App.jsx`:

```jsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  )
}
```

### Configuration

Query client configuration is in `src/lib/queryClient.js`:

```js
{
  queries: {
    staleTime: 5 * 60 * 1000,      // Data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,         // Cache for 10 minutes
    refetchOnWindowFocus: true,     // Refetch on window focus
    refetchOnReconnect: true,       // Refetch on reconnect
    retry: 2,                       // Retry failed requests 2 times
  }
}
```

---

## Custom Hooks

### Products Hooks

Located in `src/hooks/useProducts.js`:

#### `useProducts(filters, options)`
Fetch all products with optional filters.

```js
import { useProducts } from '../hooks/useProducts'

function ProductList() {
  const { data, isLoading, error } = useProducts({ category: 'guitar' })

  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />

  return <div>{/* Render products */}</div>
}
```

#### `useProduct(id, options)`
Fetch a single product by ID.

```js
import { useProduct } from '../hooks/useProducts'

function ProductDetail({ productId }) {
  const { data: product, isLoading } = useProduct(productId)

  if (isLoading) return <Loading />

  return <div>{product.name}</div>
}
```

#### `useProductSearch(searchTerm, options)`
Search products (only triggers if searchTerm has 2+ characters).

```js
import { useProductSearch } from '../hooks/useProducts'

function SearchBar() {
  const [search, setSearch] = useState('')
  const { data: results, isLoading } = useProductSearch(search)

  return (
    <>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      {isLoading && <Loading />}
      {results?.map(product => <ProductCard key={product.id} {...product} />)}
    </>
  )
}
```

#### `useAddToCart()`
Mutation hook for adding products to cart.

```js
import { useAddToCart } from '../hooks/useProducts'

function AddToCartButton({ productId }) {
  const addToCart = useAddToCart()

  const handleClick = () => {
    addToCart.mutate({ productId, quantity: 1 })
  }

  return (
    <button
      onClick={handleClick}
      disabled={addToCart.isPending}
    >
      {addToCart.isPending ? 'Đang thêm...' : 'Thêm vào giỏ'}
    </button>
  )
}
```

### Orders Hooks

Located in `src/hooks/useOrders.js`:

#### `useOrders(filters, options)`
Fetch all orders.

```js
import { useOrders } from '../hooks/useOrders'

function OrderList() {
  const { data: orders, isLoading } = useOrders({ status: 'PENDING' })

  if (isLoading) return <Loading />

  return orders.map(order => <OrderCard key={order.id} {...order} />)
}
```

#### `useOrder(id, options)`
Fetch a single order.

```js
import { useOrder } from '../hooks/useOrders'

function OrderDetail({ orderId }) {
  const { data: order, isLoading, error } = useOrder(orderId)

  if (isLoading) return <Loading />
  if (error) return <Error />

  return <OrderDetails order={order} />
}
```

#### `useCreateOrder()`
Create a new order.

```js
import { useCreateOrder } from '../hooks/useOrders'
import { useNavigate } from 'react-router-dom'

function CheckoutButton() {
  const createOrder = useCreateOrder()
  const navigate = useNavigate()

  const handleCheckout = async () => {
    try {
      const order = await createOrder.mutateAsync(orderData)
      navigate(`/order-success?id=${order.id}`)
    } catch (error) {
      // Error handled by React Query + toast
    }
  }

  return (
    <button onClick={handleCheckout} disabled={createOrder.isPending}>
      {createOrder.isPending ? 'Đang xử lý...' : 'Đặt hàng'}
    </button>
  )
}
```

#### `useOrderTracking(orderId, options)`
Real-time order tracking (auto-refetches every 30 seconds for in-progress orders).

```js
import { useOrderTracking } from '../hooks/useOrders'

function OrderTracking({ orderId }) {
  const { data: order } = useOrderTracking(orderId)

  return (
    <div>
      <h3>Trạng thái: {order?.status}</h3>
      <p>Cập nhật lúc: {new Date(order?.updatedAt).toLocaleString()}</p>
    </div>
  )
}
```

---

## Usage Examples

### Example 1: Product List with Loading & Error States

```jsx
import { useProducts } from '../hooks/useProducts'
import { Loader, ErrorMessage } from '../components/UI'

function ProductsPage() {
  const {
    data: products = [],
    isLoading,
    error,
    refetch
  } = useProducts()

  if (isLoading) {
    return <Loader message="Đang tải sản phẩm..." />
  }

  if (error) {
    return (
      <ErrorMessage
        message="Không thể tải sản phẩm"
        retry={refetch}
      />
    )
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Example 2: Optimistic Updates

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productAPI } from '../services/api'
import { queryKeys } from '../lib/queryClient'

function QuantityControl({ productId, currentQuantity }) {
  const queryClient = useQueryClient()

  const updateQuantity = useMutation({
    mutationFn: (newQuantity) =>
      productAPI.updateCartQuantity(productId, newQuantity),

    // Optimistic update: update UI immediately
    onMutate: async (newQuantity) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() })

      // Snapshot previous value
      const previousCart = queryClient.getQueryData(queryKeys.cart.items())

      // Optimistically update
      queryClient.setQueryData(queryKeys.cart.items(), (old) => {
        return old.map(item =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      })

      // Return context with snapshot
      return { previousCart }
    },

    // Rollback on error
    onError: (err, newQuantity, context) => {
      queryClient.setQueryData(
        queryKeys.cart.items(),
        context.previousCart
      )
    },

    // Refetch after success/error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() })
    },
  })

  return (
    <div>
      <button onClick={() => updateQuantity.mutate(currentQuantity - 1)}>-</button>
      <span>{currentQuantity}</span>
      <button onClick={() => updateQuantity.mutate(currentQuantity + 1)}>+</button>
    </div>
  )
}
```

### Example 3: Dependent Queries

```jsx
import { useProduct } from '../hooks/useProducts'
import { useQuery } from '@tanstack/react-query'

function ProductWithReviews({ productId }) {
  // First, fetch product
  const { data: product } = useProduct(productId)

  // Then, fetch reviews (only if product is loaded)
  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewAPI.getReviews(productId),
    enabled: !!product, // Only run if product exists
  })

  return (
    <div>
      <h1>{product?.name}</h1>
      {reviews?.map(review => <ReviewCard key={review.id} {...review} />)}
    </div>
  )
}
```

### Example 4: Pagination

```jsx
import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'

function ProductsPaginated() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isPreviousData } = useProducts(
    { page, limit: 20 },
    { keepPreviousData: true } // Keep old data while fetching new page
  )

  return (
    <div>
      {isLoading && <Loading />}

      <div className={isPreviousData ? 'opacity-50' : ''}>
        {data?.products.map(product => <ProductCard key={product.id} {...product} />)}
      </div>

      <div>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Trang trước
        </button>
        <span>Trang {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.hasMore}
        >
          Trang sau
        </button>
      </div>
    </div>
  )
}
```

### Example 5: Prefetching on Hover

```jsx
import { usePrefetchProduct } from '../hooks/useProducts'
import { Link } from 'react-router-dom'

function ProductCard({ product }) {
  const prefetchProduct = usePrefetchProduct()

  return (
    <Link
      to={`/products/${product.id}`}
      onMouseEnter={() => prefetchProduct(product.id)}
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
    </Link>
  )
}
```

---

## Best Practices

### ✅ Do's

1. **Use Query Keys Consistently**
   ```js
   // Good - Use queryKeys factory
   import { queryKeys } from '../lib/queryClient'
   useQuery({ queryKey: queryKeys.products.detail(id), ... })

   // Bad - Hardcoded keys
   useQuery({ queryKey: ['product', id], ... })
   ```

2. **Handle Loading & Error States**
   ```jsx
   const { data, isLoading, error } = useProducts()

   if (isLoading) return <Loading />
   if (error) return <Error message={error.message} />
   return <ProductList products={data} />
   ```

3. **Use Custom Hooks**
   ```js
   // Good - Use provided custom hooks
   const { data } = useProducts()

   // Bad - Direct useQuery in component
   const { data } = useQuery({ queryKey: ['products'], queryFn: ... })
   ```

4. **Invalidate Related Queries After Mutations**
   ```js
   onSuccess: () => {
     invalidateQueries.products()  // Refresh products list
     invalidateQueries.cart()      // Refresh cart
   }
   ```

5. **Use Optimistic Updates for Better UX**
   ```js
   onMutate: async (newData) => {
     await queryClient.cancelQueries({ queryKey })
     const previous = queryClient.getQueryData(queryKey)
     queryClient.setQueryData(queryKey, newData)
     return { previous }
   },
   onError: (err, vars, context) => {
     queryClient.setQueryData(queryKey, context.previous)
   }
   ```

### ❌ Don'ts

1. **Don't use useState for server data**
   ```js
   // Bad
   const [products, setProducts] = useState([])
   useEffect(() => {
     fetch('/api/products').then(r => r.json()).then(setProducts)
   }, [])

   // Good
   const { data: products } = useProducts()
   ```

2. **Don't fetch in useEffect**
   ```js
   // Bad
   useEffect(() => {
     fetchProducts()
   }, [])

   // Good
   useQuery({ queryKey: ['products'], queryFn: fetchProducts })
   ```

3. **Don't forget to handle loading states**
   ```jsx
   // Bad - Can cause errors if data is undefined
   return <div>{data.map(...)}</div>

   // Good
   if (isLoading) return <Loading />
   return <div>{data?.map(...) ?? []}</div>
   ```

4. **Don't mix server state with local state**
   ```js
   // Bad - Syncing server and local state is error-prone
   const [products, setProducts] = useState([])
   const { data } = useProducts()
   useEffect(() => setProducts(data), [data])

   // Good - Use server state directly
   const { data: products } = useProducts()
   ```

---

## Advanced Patterns

### Infinite Scrolling

```jsx
import { useInfiniteQuery } from '@tanstack/react-query'

function InfiniteProductList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', 'infinite'],
    queryFn: ({ pageParam = 1 }) => productAPI.getProducts({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  })

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ))}

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
      </button>
    </div>
  )
}
```

### Parallel Queries

```jsx
import { useQueries } from '@tanstack/react-query'

function Dashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ['products'], queryFn: productAPI.getProducts },
      { queryKey: ['orders'], queryFn: orderAPI.getOrders },
      { queryKey: ['stats'], queryFn: statsAPI.getStats },
    ]
  })

  const [products, orders, stats] = results

  if (results.some(r => r.isLoading)) return <Loading />

  return (
    <div>
      <ProductStats data={products.data} />
      <OrderStats data={orders.data} />
      <OverallStats data={stats.data} />
    </div>
  )
}
```

---

## React Query DevTools

DevTools are enabled in development mode (press `Ctrl + Shift + D` to toggle):

- View all queries and their states
- Manually refetch queries
- Inspect query data and errors
- See cache timers
- Monitor network requests

---

## API Reference

### Query Result Object

```js
{
  data,              // Query data
  error,             // Error object
  isLoading,         // Initial loading
  isFetching,        // Any fetching (including background)
  isSuccess,         // Query succeeded
  isError,           // Query failed
  isPaused,          // Query paused (offline)
  refetch,           // Manual refetch function
  status,            // 'pending' | 'error' | 'success'
}
```

### Mutation Result Object

```js
{
  mutate,            // Trigger mutation
  mutateAsync,       // Trigger mutation (returns promise)
  data,              // Mutation data
  error,             // Mutation error
  isPending,         // Mutation in progress
  isSuccess,         // Mutation succeeded
  isError,           // Mutation failed
  reset,             // Reset mutation state
}
```

---

## Troubleshooting

### Query not refetching?

Check:
1. `staleTime` - Query might still be fresh
2. `enabled` - Query might be disabled
3. `refetchOnWindowFocus` - Might be disabled

### Data not updating after mutation?

Ensure you're invalidating queries:
```js
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['products'] })
}
```

### Too many requests?

Increase `staleTime` or disable `refetchOnWindowFocus`:
```js
useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
})
```

---

## Resources

- [Official Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Query Keys Guide](https://tkdodo.eu/blog/effective-react-query-keys)
- [Common Mistakes](https://tkdodo.eu/blog/react-query-common-mistakes)

---

**Happy Querying! 🚀**
