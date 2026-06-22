import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ewerfpxniciegagnretb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZXJmcHhuaWNpZWdhZ25yZXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY5MzQ0MCwiZXhwIjoxNzM0MzQ1NDQwfQ.KWCrL8LNB6vHQwYKPWfH3G3QcO5s_nWx0rIvvRtUVbc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertTestAccount() {
  try {
    // Verificar se há clientes
    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    const clientId = clients?.[0]?.id || '00000000-0000-0000-0000-000000000001';

    // Inserir conta
    const { data, error } = await supabase
      .from('instagram_connections')
      .insert([
        {
          client_id: clientId,
          ig_user_id: '123456789',
          ig_username: '@agencia.gamastudio',
          page_id: 'page_123',
          access_token: 'mock-token-teste',
          token_expires_at: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
          status: 'connected',
          is_monitored: true,
          insights_period: '7days'
        }
      ])
      .select('id, ig_username');

    if (error) {
      console.error('❌ Erro:', error.message);
      return;
    }

    console.log('✅ Conta criada:', data[0]);
  } catch (err) {
    console.error('Exception:', err.message);
  }
}

insertTestAccount();
