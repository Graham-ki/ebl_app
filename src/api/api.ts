import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/auth-provider';
import { generateOrderSlug } from '../utils/utils';

export const getProductsAndCategories = () => {
  return useQuery({
    queryKey: ['products', 'categories'],
    queryFn: async () => {
      const [products, categories] = await Promise.all([
        supabase.from('product').select('*'),
        supabase.from('category').select('*'),
      ]);

      if (products.error || categories.error) {
        alert('Unable to fetch data!');
      }

      return { products: products.data, categories: categories.data };
    },
  });
};

export const getProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        alert(
          'Unable to fetch data!' 
        );
      }

      return data;
    },
  });
};

export const getCategoryAndProducts = (categorySlug: string) => {
  return useQuery({
    queryKey: ['categoryAndProducts', categorySlug],
    queryFn: async () => {
      const { data: category, error: categoryError } = await supabase
        .from('category')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (categoryError || !category) {
        alert('Unable to fetch items in this category!');
      }

      const { data: products, error: productsError } = await supabase
        .from('product')
        .select('*')
        .eq('category', category.id);

      if (productsError) {
        alert('Unable to load data at the moment!');
      }

      return { category, products };
    },
  });
};

export const getMyOrders = () => {
  const {
    user: { id },
  } = useAuth();

  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order')
        .select('*')
        .order('created_at', { ascending: false })
        .eq('user', id);

      if (error)
        alert(
          'Unable to fetch orders!' 
        );

      return data;
    },
  });
};

export const createOrder = () => {
  const {
    user: { id },
  } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ totalPrice }: { totalPrice: number }) => {
      const { data, error } = await supabase
        .from('order')
        .insert({
          totalPrice,
          slug: generateOrderSlug(),
          user: id,
          status: 'Pending',
          receiption_status: 'Pending',
        })
        .select('*')
        .single();

      if (error) {
        alert('Unable to place order!');
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (newOrder) => {
      // Invalidate the 'orders' query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['orders', id] });

      // Optional: Optimistically update the orders list
      queryClient.setQueryData(['orders', id], (oldOrders: any) => [
        newOrder,
        ...(oldOrders || []),
      ]);
    },
    onError: (error) => {
      alert('Failed to place order: ' + error.message);
    },
  });
};


export const createOrderItem = () => {
  return useMutation({
    async mutationFn(
      insertData: {
        orderId: number;
        productId: number;
        quantity: number;
      }[]
    ) {
      const { data, error } = await supabase
        .from('order_item')
        .insert(
          insertData.map(({ orderId, quantity, productId }) => ({
            order: orderId,
            product: productId,
            quantity,
          }))
        )
        .select('*');

      const productQuantities = insertData.reduce(
        (acc, { productId, quantity }) => {
          if (!acc[productId]) {
            acc[productId] = 0;
          }
          acc[productId] += quantity;
          return acc;
        },
        {} as Record<number, number>
      );

      await Promise.all(
        Object.entries(productQuantities).map(
          async ([productId, totalQuantity]) =>
            supabase.rpc('decrement_product_quantity', {
              product_id: Number(productId),
              quantity: totalQuantity,
            })
        )
      );

      if (error)
        alert(
          'Unable to create order item!'
        );

      return data;
    },
  });
};

export const getMyOrder = (slug: string) => {
  const { user } = useAuth();

  if (!user || !user.id) {
    return {
      data: [],
      error: 'User not authenticated',
      isLoading: false,
    };
  }

  return useQuery({
    queryKey: ['orders', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order')
        .select('*, order_items:order_item(*, products:product(*))')
        .eq('slug', slug)
        .eq('user', user.id)
        .single();

      if (error || !data) {
        alert('Unable to fetch data!');
      }

      return data;
    },
  });
};
export const getOrderProofs = async (orderId: number) => {
  try {
    const { data, error } = await supabase
      .from('proof_of_payment')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching proofs of payment:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch proofs of payment:', error);
    throw error;
  }
};

export const updateReceiptStatus = async (orderId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('order')
      .update({ receiption_status: status })
      .eq('id', orderId);

    if (error) {
      throw new Error(error.message);
    }

    return data; // Return the updated data if successful
  } catch (error) {
    console.error('Error updating receipt status:', error);
    throw error; // Throw error to handle in the UI
  }
};
