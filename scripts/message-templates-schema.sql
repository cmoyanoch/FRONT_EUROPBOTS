-- =====================================================
-- ESQUEMA PARA TEMPLATES DE MENSAJES
-- =====================================================

-- Crear tabla de templates de mensajes
CREATE TABLE IF NOT EXISTS message_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sector VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_message_templates_sector ON message_templates(sector);
CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(type);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar templates iniciales para cada sector según lógica Phantombuster
INSERT INTO message_templates (name, content, sector, type) VALUES
-- Technologie
('Visitor - Technologie', 'Visite du profil pour les dirigeants du secteur Technologie utilisant des solutions d''automatisation avancées.', 'Technologie', 'visitor'),
('Auto Connect - Technologie', 'Bonjour [FirstName], je contacte les dirigeants du secteur Technologie utilisant des solutions d''automatisation avancées. Ravi de nous connecter!', 'Technologie', 'auto_connect'),
('Messenger - Technologie', 'Merci pour la connexion! Chez Europbots, nous fournissons des robots intelligents capables d''optimiser vos processus technologiques. Avez-vous déjà envisagé une telle solution?', 'Technologie', 'messenger'),

-- Finance
('Visitor - Finance', 'Visite du profil pour les dirigeants du secteur Finance utilisant des solutions d''automatisation sécurisées.', 'Finance', 'visitor'),
('Auto Connect - Finance', 'Bonjour [FirstName], je contacte les dirigeants du secteur Finance utilisant des solutions d''automatisation sécurisées. Ravi de nous connecter!', 'Finance', 'auto_connect'),
('Messenger - Finance', 'Merci pour la connexion! Chez Europbots, nous fournissons des robots sécurisés capables d''optimiser vos processus financiers. Avez-vous déjà envisagé une telle solution?', 'Finance', 'messenger'),

-- Commerce
('Visitor - Commerce', 'Visite du profil pour les dirigeants du secteur Commerce utilisant des solutions d''automatisation commerciales.', 'Commerce', 'visitor'),
('Auto Connect - Commerce', 'Bonjour [FirstName], je contacte les dirigeants du secteur Commerce utilisant des solutions d''automatisation commerciales. Ravi de nous connecter!', 'Commerce', 'auto_connect'),
('Messenger - Commerce', 'Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d''optimiser vos processus commerciaux. Avez-vous déjà envisagé une telle solution?', 'Commerce', 'messenger'),

-- Consulting
('Visitor - Consulting', 'Visite du profil pour les dirigeants du secteur Consulting utilisant des solutions d''automatisation stratégiques.', 'Consulting', 'visitor'),
('Auto Connect - Consulting', 'Bonjour [FirstName], je contacte les dirigeants du secteur Consulting utilisant des solutions d''automatisation stratégiques. Ravi de nous connecter!', 'Consulting', 'auto_connect'),
('Messenger - Consulting', 'Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d''optimiser vos processus de conseil. Avez-vous déjà envisagé une telle solution?', 'Consulting', 'messenger'),

-- Real Estate
('Visitor - Real Estate', 'Visite du profil pour les dirigeants du secteur Immobilier utilisant des solutions d''automatisation immobilières.', 'Real Estate', 'visitor'),
('Auto Connect - Real Estate', 'Bonjour [FirstName], je contacte les dirigeants du secteur Immobilier utilisant des solutions d''automatisation immobilières. Ravi de nous connecter!', 'Real Estate', 'auto_connect'),
('Messenger - Real Estate', 'Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d''optimiser vos processus immobiliers. Avez-vous déjà envisagé une telle solution?', 'Real Estate', 'messenger'),

-- Santé
('Visitor - Santé', 'Visite du profil pour les dirigeants du secteur Santé utilisant des solutions d''automatisation médicales.', 'Santé', 'visitor'),
('Auto Connect - Santé', 'Bonjour [FirstName], je contacte les dirigeants du secteur Santé utilisant des solutions d''automatisation médicales. Ravi de nous connecter!', 'Santé', 'auto_connect'),
('Messenger - Santé', 'Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d''optimiser vos processus médicaux. Avez-vous déjà envisagé une telle solution?', 'Santé', 'messenger'),

-- Éducation
('Visitor - Éducation', 'Visite du profil pour les dirigeants du secteur Éducation utilisant des solutions d''automatisation éducatives.', 'Éducation', 'visitor'),
('Auto Connect - Éducation', 'Bonjour [FirstName], je contacte les dirigeants du secteur Éducation utilisant des solutions d''automatisation éducatives. Ravi de nous connecter!', 'Éducation', 'auto_connect'),
('Messenger - Éducation', 'Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d''optimiser vos processus éducatifs. Avez-vous déjà envisagé une telle solution?', 'Éducation', 'messenger'),

-- Manufacturing
('Visitor - Manufacturing', 'Visite du profil pour les dirigeants du secteur Manufacturing utilisant des solutions d''automatisation industrielles.', 'Manufacturing', 'visitor'),
('Auto Connect - Manufacturing', 'Bonjour [FirstName], je contacte les dirigeants du secteur Manufacturing utilisant des solutions d''automatisation industrielles. Ravi de nous connecter!', 'Manufacturing', 'auto_connect'),
('Messenger - Manufacturing', 'Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d''optimiser vos processus manufacturiers. Avez-vous déjà envisagé une telle solution?', 'Manufacturing', 'messenger'),

-- Media
('Visitor - Media', 'Visite du profil pour les dirigeants du secteur Media utilisant des solutions d''automatisation médiatiques.', 'Media', 'visitor'),
('Auto Connect - Media', 'Bonjour [FirstName], je contacte les dirigeants du secteur Media utilisant des solutions d''automatisation médiatiques. Ravi de nous connecter!', 'Media', 'auto_connect'),
('Messenger - Media', 'Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d''optimiser vos processus médiatiques. Avez-vous déjà envisagé une telle solution?', 'Media', 'messenger'),

-- Government
('Visitor - Government', 'Visite du profil pour les dirigeants du secteur Government utilisant des solutions d''automatisation gouvernementales.', 'Government', 'visitor'),
('Auto Connect - Government', 'Bonjour [FirstName], je contacte les dirigeants du secteur Government utilisant des solutions d''automatisation gouvernementales. Ravi de nous connecter!', 'Government', 'auto_connect'),
('Messenger - Government', 'Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d''optimiser vos processus gouvernementaux. Avez-vous déjà envisagé une telle solution?', 'Government', 'messenger')

ON CONFLICT DO NOTHING;

-- Verificar la inserción
SELECT COUNT(*) as total_templates FROM message_templates;
SELECT sector, COUNT(*) as templates_count FROM message_templates GROUP BY sector ORDER BY sector;
