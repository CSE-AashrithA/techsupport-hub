-- demo accounts to use until sign up and login exist
insert into users (name, email, role) values
  ('Demo Employee', 'employee@techsupport.local', 'employee'),
  ('Demo Admin',    'admin@techsupport.local',    'admin')
on conflict ((lower(email))) do nothing;
