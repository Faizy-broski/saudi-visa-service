-- Deactivate Hajj Visa so it no longer appears on any public page or booking dropdown
UPDATE visa_services
SET active = false
WHERE slug = 'hajj';
