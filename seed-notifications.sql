-- Seed sample notifications for testing
-- First, get the user ID (replace with actual user email or ID)

-- Insert sample notifications
INSERT INTO notifications (user_id, message, type, is_read, created_at, related_entity, related_id)
VALUES
  (
    (SELECT id FROM users WHERE email = 'dingiswayochapomba@gmail.com' LIMIT 1),
    'Vehicle maintenance overdue: Toyota Hilux (TJ 20 DJ) - Last serviced 90 days ago',
    'alert',
    false,
    now() - interval '2 hours',
    'vehicle',
    '1'
  ),
  (
    (SELECT id FROM users WHERE email = 'dingiswayochapomba@gmail.com' LIMIT 1),
    'Insurance policy expiring soon: Toyota Hilux - Expires in 15 days',
    'warning',
    false,
    now() - interval '5 hours',
    'insurance',
    '1'
  ),
  (
    (SELECT id FROM users WHERE email = 'dingiswayochapomba@gmail.com' LIMIT 1),
    'Fuel consumption anomaly detected: Mercedes Benz Sprinter - 3.2 km/L (unusual)',
    'warning',
    false,
    now() - interval '1 day',
    'vehicle',
    '2'
  ),
  (
    (SELECT id FROM users WHERE email = 'dingiswayochapomba@gmail.com' LIMIT 1),
    'New fuel log recorded: Vehicle TJ 20 DJ refueled 50L at Caltex',
    'info',
    true,
    now() - interval '2 days',
    'fuel',
    '1'
  ),
  (
    (SELECT id FROM users WHERE email = 'dingiswayochapomba@gmail.com' LIMIT 1),
    'Maintenance completed: Oil change service finished for Nissan Patrol',
    'success',
    true,
    now() - interval '3 days',
    'maintenance',
    '1'
  ),
  (
    (SELECT id FROM users WHERE email = 'dingiswayochapomba@gmail.com' LIMIT 1),
    'Driver license expiring: James Banda - Expires in 30 days',
    'warning',
    false,
    now() - interval '4 days',
    'driver',
    '1'
  ),
  (
    (SELECT id FROM users WHERE email = 'dingiswayochapomba@gmail.com' LIMIT 1),
    'Vehicle inspection passed: BMW X5 passed annual inspection',
    'success',
    true,
    now() - interval '5 days',
    'vehicle',
    '3'
  );

SELECT COUNT(*) as notification_count FROM notifications 
WHERE user_id = (SELECT id FROM users WHERE email = 'dingiswayochapomba@gmail.com' LIMIT 1);
