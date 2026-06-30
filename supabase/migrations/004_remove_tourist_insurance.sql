-- Remove 'Travel insurance' from Tourist Visa requirements
UPDATE visa_services
SET requirements = array_remove(requirements, 'Travel insurance')
WHERE slug = 'tourist';
