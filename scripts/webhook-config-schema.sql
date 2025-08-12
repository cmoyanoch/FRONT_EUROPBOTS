-- Tabla para configurar webhooks de n8n
CREATE TABLE IF NOT EXISTS webhook_config (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL UNIQUE, -- 'search' o 'campaign'
    webhook_url TEXT NOT NULL,
    description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuraciones por defecto
INSERT INTO webhook_config (type, webhook_url, description) VALUES 
    ('search', 'https://n8n.localhost/webhook/search-launcher', 'Webhook para búsqueda de leads'),
    ('campaign', 'https://n8n.localhost/webhook/campaign-launcher', 'Webhook para creación de campañas')
ON CONFLICT (type) DO UPDATE SET 
        webhook_url = EXCLUDED.webhook_url,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_webhook_config_type ON webhook_config(type);
CREATE INDEX IF NOT EXISTS idx_webhook_config_active ON webhook_config(is_active); 