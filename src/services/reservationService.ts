import { supabase } from './supabaseClient';

export const ReservationService = {
  getReservations: async () => {
    // Intentaremos hacer join con clientes y usuario si las relaciones están configuradas.
    // Si falla por foreign key no explicita en supabase-js, usaremos un select simple por ahora.
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        clientes ( razon_social, documento ),
        usuario ( nombre )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching reservations, trying simple select:", error);
      const fallback = await supabase.from('reservas').select('*').order('created_at', { ascending: false });
      if (fallback.error) throw fallback.error;
      return fallback.data || [];
    }
    
    return data || [];
  },

  createReservation: async (reservationData: any) => {
    const { data, error } = await supabase.from('reservas').insert([reservationData]);
    if (error) throw error;
    return data;
  },

  getClientsList: async () => {
    // Obtenemos todos los clientes para el dropdown. 
    // Nota: en producción con miles de clientes, esto debería ser un buscador/paginado.
    const { data, error } = await supabase
      .from('clientes')
      .select('id_cliente, razon_social, documento')
      .order('razon_social', { ascending: true });
      
    if (error) throw error;
    return data || [];
  }
};
