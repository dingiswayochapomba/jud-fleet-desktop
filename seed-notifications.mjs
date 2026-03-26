import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vrrcwpyhchpewatjwfpe.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmN3cHloY2hwZXdhdGp3ZnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE0MTk0MzcsImV4cCI6MTk4Njk5OTQzN30.RvAG3vvf3AQBT3N6QLlLHCdVf-vCnZN3l4JwDnJvmBY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedNotifications() {
  try {
    console.log('🔍 Finding user...');
    
    // Get the user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'dingiswayochapomba@gmail.com')
      .single();

    if (userError) {
      console.error('❌ Error finding user:', userError);
      return;
    }

    const userId = users.id;
    console.log(`✅ Found user: ${users.email} (${userId})`);

    // Sample notifications data
    const notifications = [
      {
        user_id: userId,
        message: 'Vehicle maintenance overdue: Toyota Hilux (TJ 20 DJ) - Last serviced 90 days ago',
        type: 'alert',
        is_read: false,
        related_entity: 'vehicle',
        related_id: '1',
      },
      {
        user_id: userId,
        message: 'Insurance policy expiring soon: Toyota Hilux - Expires in 15 days',
        type: 'warning',
        is_read: false,
        related_entity: 'insurance',
        related_id: '1',
      },
      {
        user_id: userId,
        message: 'Fuel consumption anomaly detected: Mercedes Benz Sprinter - 3.2 km/L (unusual)',
        type: 'warning',
        is_read: false,
        related_entity: 'vehicle',
        related_id: '2',
      },
      {
        user_id: userId,
        message: 'New fuel log recorded: Vehicle TJ 20 DJ refueled 50L at Caltex',
        type: 'info',
        is_read: true,
        related_entity: 'fuel',
        related_id: '1',
      },
      {
        user_id: userId,
        message: 'Maintenance completed: Oil change service finished for Nissan Patrol',
        type: 'success',
        is_read: true,
        related_entity: 'maintenance',
        related_id: '1',
      },
      {
        user_id: userId,
        message: 'Driver license expiring: James Banda - Expires in 30 days',
        type: 'warning',
        is_read: false,
        related_entity: 'driver',
        related_id: '1',
      },
      {
        user_id: userId,
        message: 'Vehicle inspection passed: BMW X5 passed annual inspection',
        type: 'success',
        is_read: true,
        related_entity: 'vehicle',
        related_id: '3',
      },
    ];

    console.log(`📝 Inserting ${notifications.length} sample notifications...`);

    const { data, error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('❌ Error inserting notifications:', insertError);
      return;
    }

    console.log(`✅ Successfully inserted ${data.length} notifications!`);
    console.log('📊 Notifications created:');
    data.forEach((n, i) => {
      console.log(`  ${i + 1}. [${n.type.toUpperCase()}] ${n.message.substring(0, 50)}...`);
    });

    // Verify
    const { data: verify, error: verifyError } = await supabase
      .from('notifications')
      .select('id, type, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
      return;
    }

    console.log(`\n✅ Verification: ${verify.length} total notifications found for this user`);
    console.log('   Unread:', verify.filter(n => !n.is_read).length);
    console.log('   Read:', verify.filter(n => n.is_read).length);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

seedNotifications();
