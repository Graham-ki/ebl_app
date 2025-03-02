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

//get my orders
export const getMyOrders = () => {
  const { user } = useAuth();

  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }

  const { id } = user;

  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order')
        .select('*')
        .order('created_at', { ascending: false })
        .eq('user', id);

      if (error) {
        alert('Unable to fetch orders!');
        return [];
      }

      return data;
    },
    refetchOnWindowFocus: true,  
    refetchInterval: 5000, 
  });
};
 //get my orders
export const createOrder = () => {
  const { user } = useAuth();

  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }

  const { id } = user;

  const slug = generateOrderSlug();
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({ totalPrice}: { totalPrice: number; }) {
      const { data, error } = await supabase
        .from('order')
        .insert({
          totalPrice,
          slug,
          user: id,
          status: 'Pending',
          receiption_status: 'Pending'
        })
        .select('*')
        .single();

      if (error) {
        alert('Unable to place order!');
        throw new Error(error.message);
      }

      return data;
    },

    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};


//create order item
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

      if (error) {
        alert('Unable to create order item!');
        return;
      }
      return data;
    },
  });
};

//create order item
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
        .eq('user', user.id) // Safe access now
        .single();
      if (error || !data) {
        alert('Unable to fetch data!');
      }
      return data;
    },
  });
};

// Function to retrieve all proofs of payment for a given order
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
