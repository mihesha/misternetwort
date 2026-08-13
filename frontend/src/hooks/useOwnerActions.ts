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
          categories: n.card_categories?.filter((c: any) => c.status !== 'inactive').map((c: any) => ({
            value: String(c.price),
            remaining: c.stock
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
