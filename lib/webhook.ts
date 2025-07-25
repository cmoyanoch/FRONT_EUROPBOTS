import pool from './database'

/**
 * Obtiene la URL del webhook para el tipo especificado desde la tabla webapp.webhook_config.
 * @param type 'automation' | 'search_bot'
 * @param userId UUID del usuario (por defecto el admin)
 * @returns string | null
 */
export async function getWebhookUrl(type: 'automation' | 'search_bot', userId = '4f1c9884-58c2-4a55-8b66-4cb8c2d2578b'): Promise<string | null> {
  const result = await pool.query(`
    SELECT webhook_url
    FROM webapp.webhook_config
    WHERE user_id = $1
      AND webhook_type = $2
      AND is_active = true
    ORDER BY updated_at DESC
    LIMIT 1
  `, [userId, type])
  return result.rows[0]?.webhook_url || null
} 