import { useOwnerContext } from '../context/OwnerContext';

export const useOwnerActions = () => {
  const { setNetworks } = useOwnerContext();

  const fetchOwnerNetworks = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) return; // Prevent polling if not logged in as owner
      
      const res = await fetch('/api/networks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mappedNetworks = data.map((n: any) => ({
          id: n.id,
          name: n.name,
          code: n.network_code,
          balance: n.balance,
          total_sales: n.total_sales || 0,
          status: n.status,
          notif_out_of_stock: n.notif_out_of_stock ?? true,
          notif_low_stock: n.notif_low_stock ?? true,
          categories: n.card_categories?.filter((c: any) => c.status !== 'inactive').map((c: any) => ({
            id: c.id,
            value: String(c.price),
            remaining: c.stock,
            min_threshold: c.min_threshold ?? 10
          })) || []
        }));
        setNetworks(mappedNetworks);
      }
    } catch (err) {
      console.error("Failed to fetch owner networks", err);
    }
  };

  return {
    fetchOwnerNetworks
  };
};
