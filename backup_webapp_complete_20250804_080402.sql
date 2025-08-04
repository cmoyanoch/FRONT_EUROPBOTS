--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Debian 15.4-2.pgdg120+1)
-- Dumped by pg_dump version 15.4 (Debian 15.4-2.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: webapp; Type: SCHEMA; Schema: -; Owner: n8n_user
--

CREATE SCHEMA webapp;


ALTER SCHEMA webapp OWNER TO n8n_user;

--
-- Name: SCHEMA webapp; Type: COMMENT; Schema: -; Owner: n8n_user
--

COMMENT ON SCHEMA webapp IS 'Esquema para la aplicación web de autenticación EUROPBOTS';


--
-- Name: cleanup_expired_reset_tokens(); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.cleanup_expired_reset_tokens() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM webapp.password_reset_tokens 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION webapp.cleanup_expired_reset_tokens() OWNER TO n8n_user;

--
-- Name: FUNCTION cleanup_expired_reset_tokens(); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.cleanup_expired_reset_tokens() IS 'Limpia tokens de reset expirados y retorna el número eliminado';


--
-- Name: cleanup_expired_sessions(); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.cleanup_expired_sessions() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM webapp.sessions 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION webapp.cleanup_expired_sessions() OWNER TO n8n_user;

--
-- Name: FUNCTION cleanup_expired_sessions(); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.cleanup_expired_sessions() IS 'Limpia sesiones expiradas y retorna el número de sesiones eliminadas';


--
-- Name: fn_registrar_cambio_process_lead(); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.fn_registrar_cambio_process_lead() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Verificar que el campo 'process' haya cambiado
    IF OLD.process IS DISTINCT FROM NEW.process THEN
        -- Insertar el nuevo proceso en la tabla de historial
        INSERT INTO webapp.leads_process_history (
            lead_id,
            process,
            created_at
        ) VALUES (
            NEW.id,                    -- ID del lead modificado
            NEW.process,               -- Proceso nuevo
            CURRENT_TIMESTAMP          -- Fecha y hora actual
        );
        
        -- Log opcional para debugging (puedes comentar esta línea)
        RAISE NOTICE 'Process del lead % cambió a %', NEW.id, NEW.process;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION webapp.fn_registrar_cambio_process_lead() OWNER TO n8n_user;

--
-- Name: get_active_search_filters(); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.get_active_search_filters() RETURNS TABLE(filter_type character varying, code character varying, name character varying, linkedin_code character varying, keywords jsonb, description text, order_index integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Industrias
    RETURN QUERY
    SELECT 
        'industry'::VARCHAR(20) as filter_type,
        si.code,
        si.name,
        si.linkedin_code,
        '[]'::JSONB as keywords,
        si.description,
        si.order_index
    FROM webapp.search_industries si
    WHERE si.is_active = true
    ORDER BY si.order_index;
    
    -- Job Titles
    RETURN QUERY
    SELECT 
        'job_title'::VARCHAR(20) as filter_type,
        sjt.code,
        sjt.name,
        ''::VARCHAR(20) as linkedin_code,
        sjt.keywords,
        sjt.description,
        sjt.order_index
    FROM webapp.search_job_titles sjt
    WHERE sjt.is_active = true
    ORDER BY sjt.order_index;
    
    -- Locations
    RETURN QUERY
    SELECT 
        'location'::VARCHAR(20) as filter_type,
        sl.code,
        sl.name,
        sl.linkedin_code,
        '[]'::JSONB as keywords,
        sl.description,
        sl.order_index
    FROM webapp.search_locations sl
    WHERE sl.is_active = true
    ORDER BY sl.order_index;
    
    -- Company Sizes
    RETURN QUERY
    SELECT 
        'company_size'::VARCHAR(20) as filter_type,
        scs.code,
        scs.name,
        scs.linkedin_code,
        '[]'::JSONB as keywords,
        scs.description,
        scs.order_index
    FROM webapp.search_company_sizes scs
    WHERE scs.is_active = true
    ORDER BY scs.order_index;
END;
$$;


ALTER FUNCTION webapp.get_active_search_filters() OWNER TO n8n_user;

--
-- Name: FUNCTION get_active_search_filters(); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.get_active_search_filters() IS 'Obtiene todos los filtros de búsqueda activos organizados por tipo';


--
-- Name: get_lead_statistics(integer); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.get_lead_statistics(p_days integer DEFAULT 30) RETURNS TABLE(total_leads bigint, active_leads bigint, contacted_leads bigint, qualified_leads bigint, converted_leads bigint, unique_companies bigint, unique_locations bigint, avg_connection_degree numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_leads,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::BIGINT as active_leads,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END)::BIGINT as contacted_leads,
        COUNT(CASE WHEN status = 'qualified' THEN 1 END)::BIGINT as qualified_leads,
        COUNT(CASE WHEN status = 'converted' THEN 1 END)::BIGINT as converted_leads,
        COUNT(DISTINCT company)::BIGINT as unique_companies,
        COUNT(DISTINCT location)::BIGINT as unique_locations,
        AVG(CASE 
            WHEN connection_degree = '1st' THEN 1 
            WHEN connection_degree = '2nd' THEN 2 
            ELSE 3 
        END) as avg_connection_degree
    FROM webapp.leads 
    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days;
END;
$$;


ALTER FUNCTION webapp.get_lead_statistics(p_days integer) OWNER TO n8n_user;

--
-- Name: FUNCTION get_lead_statistics(p_days integer); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.get_lead_statistics(p_days integer) IS 'Obtiene estadísticas de leads para un período específico';


--
-- Name: get_linkedin_urls_by_priority(integer); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.get_linkedin_urls_by_priority(p_priority integer DEFAULT NULL::integer) RETURNS TABLE(id uuid, profile_title character varying, profile_keyword character varying, linkedin_url text, description text, priority integer, created_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF p_priority IS NULL THEN
        RETURN QUERY
        SELECT 
            lu.id,
            lu.profile_title,
            lu.profile_keyword,
            lu.linkedin_url,
            lu.description,
            lu.priority,
            lu.created_at
        FROM webapp.linkedin_urls lu
        WHERE lu.is_active = true
        ORDER BY lu.priority ASC, lu.profile_title ASC;
    ELSE
        RETURN QUERY
        SELECT 
            lu.id,
            lu.profile_title,
            lu.profile_keyword,
            lu.linkedin_url,
            lu.description,
            lu.priority,
            lu.created_at
        FROM webapp.linkedin_urls lu
        WHERE lu.is_active = true AND lu.priority = p_priority
        ORDER BY lu.profile_title ASC;
    END IF;
END;
$$;


ALTER FUNCTION webapp.get_linkedin_urls_by_priority(p_priority integer) OWNER TO n8n_user;

--
-- Name: get_menu_permissions(character varying); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.get_menu_permissions(p_role character varying) RETURNS TABLE(menu_option_id uuid, name character varying, label character varying, href character varying, icon character varying, badge character varying, order_index integer, can_access boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mo.id,
        mo.name,
        mo.label,
        mo.href,
        mo.icon,
        mo.badge,
        mo.order_index,
        COALESCE(rp.can_access, false) as can_access
    FROM webapp.menu_options mo
    LEFT JOIN webapp.role_permissions rp ON mo.id = rp.menu_option_id AND rp.role = p_role
    WHERE mo.is_active = true
    ORDER BY mo.order_index;
END;
$$;


ALTER FUNCTION webapp.get_menu_permissions(p_role character varying) OWNER TO n8n_user;

--
-- Name: FUNCTION get_menu_permissions(p_role character varying); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.get_menu_permissions(p_role character varying) IS 'Obtiene los permisos del menú para un rol específico';


--
-- Name: get_webhook_config(uuid, character varying); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.get_webhook_config(p_user_id uuid, p_webhook_type character varying DEFAULT 'search_bot'::character varying) RETURNS TABLE(id uuid, webhook_url character varying, is_active boolean, last_test_at timestamp without time zone, last_test_status character varying, test_response_time_ms integer, created_at timestamp without time zone, updated_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wc.id,
        wc.webhook_url,
        wc.is_active,
        wc.last_test_at,
        wc.last_test_status,
        wc.test_response_time_ms,
        wc.created_at,
        wc.updated_at
    FROM webapp.webhook_config wc
    WHERE wc.user_id = p_user_id 
    AND wc.webhook_type = p_webhook_type
    AND wc.is_active = true;
END;
$$;


ALTER FUNCTION webapp.get_webhook_config(p_user_id uuid, p_webhook_type character varying) OWNER TO n8n_user;

--
-- Name: FUNCTION get_webhook_config(p_user_id uuid, p_webhook_type character varying); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.get_webhook_config(p_user_id uuid, p_webhook_type character varying) IS 'Obtiene la configuración de webhook de un usuario';


--
-- Name: insert_lead(character varying, character varying, character varying, character varying, character varying, text, character varying, character varying, text, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, uuid); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.insert_lead(p_profile_url character varying, p_full_name character varying, p_first_name character varying DEFAULT NULL::character varying, p_last_name character varying DEFAULT NULL::character varying, p_job_title character varying DEFAULT NULL::character varying, p_additional_info text DEFAULT NULL::text, p_location character varying DEFAULT NULL::character varying, p_connection_degree character varying DEFAULT '2nd'::character varying, p_profile_image_url text DEFAULT NULL::text, p_vmid character varying DEFAULT NULL::character varying, p_search_query character varying DEFAULT NULL::character varying, p_category character varying DEFAULT 'People'::character varying, p_shared_connections character varying DEFAULT NULL::character varying, p_company character varying DEFAULT NULL::character varying, p_company_url character varying DEFAULT NULL::character varying, p_industry character varying DEFAULT NULL::character varying, p_company2 character varying DEFAULT NULL::character varying, p_company_url2 character varying DEFAULT NULL::character varying, p_job_title2 character varying DEFAULT NULL::character varying, p_job_date_range character varying DEFAULT NULL::character varying, p_job_date_range2 character varying DEFAULT NULL::character varying, p_school character varying DEFAULT NULL::character varying, p_school_degree character varying DEFAULT NULL::character varying, p_school_date_range character varying DEFAULT NULL::character varying, p_school2 character varying DEFAULT NULL::character varying, p_school_degree2 character varying DEFAULT NULL::character varying, p_school_date_range2 character varying DEFAULT NULL::character varying, p_search_id character varying DEFAULT NULL::character varying, p_user_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    lead_id UUID;
BEGIN
    -- Insertar o actualizar el lead
    INSERT INTO webapp.leads (
        profile_url, full_name, first_name, last_name, job_title, 
        additional_info, location, connection_degree, profile_image_url, 
        vmid, search_query, category, shared_connections, company, 
        company_url, industry, company2, company_url2, job_title2, 
        job_date_range, job_date_range2, school, school_degree, 
        school_date_range, school2, school_degree2, school_date_range2,
        user_id, id_crm, status
    ) VALUES (
        p_profile_url, p_full_name, p_first_name, p_last_name, p_job_title,
        p_additional_info, p_location, p_connection_degree, p_profile_image_url,
        p_vmid, p_search_query, p_category, p_shared_connections, p_company,
        p_company_url, p_industry, p_company2, p_company_url2, p_job_title2,
        p_job_date_range, p_job_date_range2, p_school, p_school_degree,
        p_school_date_range, p_school2, p_school_degree2, p_school_date_range2,
        p_user_id, p_id_crm, p_status,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'active', 'phantombuster',
        p_user_id, p_assigned_to, '[]', '[]', '[]'
    ) ON CONFLICT (profile_url) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        job_title = EXCLUDED.job_title,
        additional_info = EXCLUDED.additional_info,
        location = EXCLUDED.location,
        company = EXCLUDED.company,
        industry = EXCLUDED.industry,
        updated_at = CURRENT_TIMESTAMP,
        id_crm = EXCLUDED.id_crm,
        status = EXCLUDED.status
    RETURNING id INTO lead_id;
    
    -- Asociar con la búsqueda si se proporciona
    IF p_search_id IS NOT NULL THEN
        INSERT INTO webapp.lead_search_mapping (lead_id, search_id) 
        VALUES (lead_id, p_search_id)
        ON CONFLICT (lead_id, search_id) DO NOTHING;
    END IF;
    
    RETURN lead_id;
END;
$$;


ALTER FUNCTION webapp.insert_lead(p_profile_url character varying, p_full_name character varying, p_first_name character varying, p_last_name character varying, p_job_title character varying, p_additional_info text, p_location character varying, p_connection_degree character varying, p_profile_image_url text, p_vmid character varying, p_search_query character varying, p_category character varying, p_shared_connections character varying, p_company character varying, p_company_url character varying, p_industry character varying, p_company2 character varying, p_company_url2 character varying, p_job_title2 character varying, p_job_date_range character varying, p_job_date_range2 character varying, p_school character varying, p_school_degree character varying, p_school_date_range character varying, p_school2 character varying, p_school_degree2 character varying, p_school_date_range2 character varying, p_search_id character varying, p_user_id uuid) OWNER TO n8n_user;

--
-- Name: FUNCTION insert_lead(p_profile_url character varying, p_full_name character varying, p_first_name character varying, p_last_name character varying, p_job_title character varying, p_additional_info text, p_location character varying, p_connection_degree character varying, p_profile_image_url text, p_vmid character varying, p_search_query character varying, p_category character varying, p_shared_connections character varying, p_company character varying, p_company_url character varying, p_industry character varying, p_company2 character varying, p_company_url2 character varying, p_job_title2 character varying, p_job_date_range character varying, p_job_date_range2 character varying, p_school character varying, p_school_degree character varying, p_school_date_range character varying, p_school2 character varying, p_school_degree2 character varying, p_school_date_range2 character varying, p_search_id character varying, p_user_id uuid); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.insert_lead(p_profile_url character varying, p_full_name character varying, p_first_name character varying, p_last_name character varying, p_job_title character varying, p_additional_info text, p_location character varying, p_connection_degree character varying, p_profile_image_url text, p_vmid character varying, p_search_query character varying, p_category character varying, p_shared_connections character varying, p_company character varying, p_company_url character varying, p_industry character varying, p_company2 character varying, p_company_url2 character varying, p_job_title2 character varying, p_job_date_range character varying, p_job_date_range2 character varying, p_school character varying, p_school_degree character varying, p_school_date_range character varying, p_school2 character varying, p_school_degree2 character varying, p_school_date_range2 character varying, p_search_id character varying, p_user_id uuid) IS 'Inserta o actualiza un lead con toda su información';


--
-- Name: log_user_activity(uuid, character varying, jsonb, inet, text); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.log_user_activity(p_user_id uuid, p_action character varying, p_details jsonb DEFAULT NULL::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO webapp.user_activity_log (user_id, action, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;


ALTER FUNCTION webapp.log_user_activity(p_user_id uuid, p_action character varying, p_details jsonb, p_ip_address inet, p_user_agent text) OWNER TO n8n_user;

--
-- Name: FUNCTION log_user_activity(p_user_id uuid, p_action character varying, p_details jsonb, p_ip_address inet, p_user_agent text); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.log_user_activity(p_user_id uuid, p_action character varying, p_details jsonb, p_ip_address inet, p_user_agent text) IS 'Registra una actividad de usuario en el log';


--
-- Name: log_webhook_event(uuid, character varying, jsonb, integer, text, integer, text); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.log_webhook_event(p_webhook_config_id uuid, p_event_type character varying, p_payload jsonb DEFAULT NULL::jsonb, p_response_status integer DEFAULT NULL::integer, p_response_body text DEFAULT NULL::text, p_response_time_ms integer DEFAULT NULL::integer, p_error_message text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO webapp.webhook_logs (
        webhook_config_id, 
        event_type, 
        payload, 
        response_status, 
        response_body, 
        response_time_ms, 
        error_message
    )
    VALUES (
        p_webhook_config_id,
        p_event_type,
        p_payload,
        p_response_status,
        p_response_body,
        p_response_time_ms,
        p_error_message
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;


ALTER FUNCTION webapp.log_webhook_event(p_webhook_config_id uuid, p_event_type character varying, p_payload jsonb, p_response_status integer, p_response_body text, p_response_time_ms integer, p_error_message text) OWNER TO n8n_user;

--
-- Name: FUNCTION log_webhook_event(p_webhook_config_id uuid, p_event_type character varying, p_payload jsonb, p_response_status integer, p_response_body text, p_response_time_ms integer, p_error_message text); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.log_webhook_event(p_webhook_config_id uuid, p_event_type character varying, p_payload jsonb, p_response_status integer, p_response_body text, p_response_time_ms integer, p_error_message text) IS 'Registra un evento de webhook en el log';


--
-- Name: map_company_size_by_name(character varying); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.map_company_size_by_name(p_size_name character varying) RETURNS TABLE(code character varying, linkedin_code character varying, name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        scs.code,
        scs.linkedin_code,
        scs.name
    FROM webapp.search_company_sizes scs
    WHERE LOWER(scs.name) = LOWER(p_size_name)
    AND scs.is_active = true;
END;
$$;


ALTER FUNCTION webapp.map_company_size_by_name(p_size_name character varying) OWNER TO n8n_user;

--
-- Name: FUNCTION map_company_size_by_name(p_size_name character varying); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.map_company_size_by_name(p_size_name character varying) IS 'Mapea un tamaño de empresa por nombre a su código LinkedIn';


--
-- Name: map_industry_by_name(character varying); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.map_industry_by_name(p_industry_name character varying) RETURNS TABLE(code character varying, linkedin_code character varying, name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        si.code,
        si.linkedin_code,
        si.name
    FROM webapp.search_industries si
    WHERE LOWER(si.name) = LOWER(p_industry_name)
    AND si.is_active = true;
END;
$$;


ALTER FUNCTION webapp.map_industry_by_name(p_industry_name character varying) OWNER TO n8n_user;

--
-- Name: FUNCTION map_industry_by_name(p_industry_name character varying); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.map_industry_by_name(p_industry_name character varying) IS 'Mapea una industria por nombre a su código LinkedIn';


--
-- Name: map_job_title_by_name(character varying); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.map_job_title_by_name(p_job_title_name character varying) RETURNS TABLE(code character varying, keywords jsonb, name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sjt.code,
        sjt.keywords,
        sjt.name
    FROM webapp.search_job_titles sjt
    WHERE LOWER(sjt.name) = LOWER(p_job_title_name)
    AND sjt.is_active = true;
END;
$$;


ALTER FUNCTION webapp.map_job_title_by_name(p_job_title_name character varying) OWNER TO n8n_user;

--
-- Name: FUNCTION map_job_title_by_name(p_job_title_name character varying); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.map_job_title_by_name(p_job_title_name character varying) IS 'Mapea un job title por nombre a sus palabras clave';


--
-- Name: map_location_by_name(character varying); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.map_location_by_name(p_location_name character varying) RETURNS TABLE(code character varying, linkedin_code character varying, name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.code,
        sl.linkedin_code,
        sl.name
    FROM webapp.search_locations sl
    WHERE LOWER(sl.name) = LOWER(p_location_name)
    AND sl.is_active = true;
END;
$$;


ALTER FUNCTION webapp.map_location_by_name(p_location_name character varying) OWNER TO n8n_user;

--
-- Name: FUNCTION map_location_by_name(p_location_name character varying); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.map_location_by_name(p_location_name character varying) IS 'Mapea una ubicación por nombre a su código LinkedIn';


--
-- Name: save_webhook_config(uuid, character varying, character varying); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.save_webhook_config(p_user_id uuid, p_webhook_url character varying, p_webhook_type character varying DEFAULT 'search_bot'::character varying) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    config_id UUID;
BEGIN
    INSERT INTO webapp.webhook_config (user_id, webhook_url, webhook_type)
    VALUES (p_user_id, p_webhook_url, p_webhook_type)
    ON CONFLICT (user_id, webhook_type) DO UPDATE SET
        webhook_url = EXCLUDED.webhook_url,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO config_id;
    
    RETURN config_id;
END;
$$;


ALTER FUNCTION webapp.save_webhook_config(p_user_id uuid, p_webhook_url character varying, p_webhook_type character varying) OWNER TO n8n_user;

--
-- Name: FUNCTION save_webhook_config(p_user_id uuid, p_webhook_url character varying, p_webhook_type character varying); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.save_webhook_config(p_user_id uuid, p_webhook_url character varying, p_webhook_type character varying) IS 'Guarda o actualiza la configuración de webhook de un usuario';


--
-- Name: update_lead_statistics(); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.update_lead_statistics() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO webapp.lead_statistics (date, total_leads, new_leads)
    VALUES (DATE(NEW.created_at), 1, 1)
    ON CONFLICT (date) DO UPDATE SET
        total_leads = webapp.lead_statistics.total_leads + 1,
        new_leads = webapp.lead_statistics.new_leads + 1;
    RETURN NEW;
END;
$$;


ALTER FUNCTION webapp.update_lead_statistics() OWNER TO n8n_user;

--
-- Name: update_leads_updated_at(); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.update_leads_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION webapp.update_leads_updated_at() OWNER TO n8n_user;

--
-- Name: update_role_permissions(character varying, jsonb); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.update_role_permissions(p_role character varying, p_permissions jsonb) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    permission_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Eliminar permisos existentes para el rol
    DELETE FROM webapp.role_permissions WHERE role = p_role;
    
    -- Insertar nuevos permisos
    FOR permission_record IN 
        SELECT * FROM jsonb_array_elements(p_permissions)
    LOOP
        INSERT INTO webapp.role_permissions (role, menu_option_id, can_access)
        VALUES (
            p_role,
            (permission_record->>'menu_option_id')::UUID,
            (permission_record->>'can_access')::BOOLEAN
        );
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$;


ALTER FUNCTION webapp.update_role_permissions(p_role character varying, p_permissions jsonb) OWNER TO n8n_user;

--
-- Name: FUNCTION update_role_permissions(p_role character varying, p_permissions jsonb); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.update_role_permissions(p_role character varying, p_permissions jsonb) IS 'Actualiza los permisos de un rol para las opciones del menú';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION webapp.update_updated_at_column() OWNER TO n8n_user;

--
-- Name: update_webhook_test_status(uuid, character varying, integer); Type: FUNCTION; Schema: webapp; Owner: n8n_user
--

CREATE FUNCTION webapp.update_webhook_test_status(p_webhook_config_id uuid, p_test_status character varying, p_response_time_ms integer DEFAULT NULL::integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE webapp.webhook_config 
    SET 
        last_test_at = CURRENT_TIMESTAMP,
        last_test_status = p_test_status,
        test_response_time_ms = p_response_time_ms,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_webhook_config_id;
    
    RETURN FOUND;
END;
$$;


ALTER FUNCTION webapp.update_webhook_test_status(p_webhook_config_id uuid, p_test_status character varying, p_response_time_ms integer) OWNER TO n8n_user;

--
-- Name: FUNCTION update_webhook_test_status(p_webhook_config_id uuid, p_test_status character varying, p_response_time_ms integer); Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON FUNCTION webapp.update_webhook_test_status(p_webhook_config_id uuid, p_test_status character varying, p_response_time_ms integer) IS 'Actualiza el estado de la última prueba de webhook';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: linkedin_urls; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.linkedin_urls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_title character varying(255) NOT NULL,
    profile_keyword character varying(255) NOT NULL,
    linkedin_url text NOT NULL,
    description text,
    priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT linkedin_urls_priority_check CHECK (((priority >= 1) AND (priority <= 5)))
);


ALTER TABLE webapp.linkedin_urls OWNER TO n8n_user;

--
-- Name: active_linkedin_urls; Type: VIEW; Schema: webapp; Owner: n8n_user
--

CREATE VIEW webapp.active_linkedin_urls AS
 SELECT linkedin_urls.id,
    linkedin_urls.profile_title,
    linkedin_urls.profile_keyword,
    linkedin_urls.linkedin_url,
    linkedin_urls.description,
    linkedin_urls.priority,
    linkedin_urls.created_at,
    linkedin_urls.updated_at
   FROM webapp.linkedin_urls
  WHERE (linkedin_urls.is_active = true)
  ORDER BY linkedin_urls.priority, linkedin_urls.profile_title;


ALTER TABLE webapp.active_linkedin_urls OWNER TO n8n_user;

--
-- Name: sessions; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    token character varying(500) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.sessions OWNER TO n8n_user;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.sessions IS 'Tabla para manejar sesiones y tokens JWT';


--
-- Name: users; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255),
    avatar_url text,
    role character varying(50) DEFAULT 'user'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('user'::character varying)::text, ('admin'::character varying)::text])))
);


ALTER TABLE webapp.users OWNER TO n8n_user;

--
-- Name: TABLE users; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.users IS 'Tabla principal de usuarios del sistema';


--
-- Name: active_sessions; Type: VIEW; Schema: webapp; Owner: n8n_user
--

CREATE VIEW webapp.active_sessions AS
 SELECT s.id AS session_id,
    s.token,
    s.expires_at,
    s.created_at AS session_created_at,
    u.id AS user_id,
    u.email,
    u.full_name,
    u.role
   FROM (webapp.sessions s
     JOIN webapp.users u ON ((s.user_id = u.id)))
  WHERE (s.expires_at > CURRENT_TIMESTAMP);


ALTER TABLE webapp.active_sessions OWNER TO n8n_user;

--
-- Name: webhook_config; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.webhook_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    webhook_url character varying(500) NOT NULL,
    webhook_type character varying(50) DEFAULT 'search_bot'::character varying,
    is_active boolean DEFAULT true,
    last_test_at timestamp without time zone,
    last_test_status character varying(20),
    test_response_time_ms integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT webhook_config_last_test_status_check CHECK (((last_test_status)::text = ANY (ARRAY[('success'::character varying)::text, ('failed'::character varying)::text, ('timeout'::character varying)::text, ('error'::character varying)::text]))),
    CONSTRAINT webhook_config_webhook_type_check CHECK (((webhook_type)::text = ANY (ARRAY[('search_bot'::character varying)::text, ('lead_notification'::character varying)::text, ('automation'::character varying)::text, ('general'::character varying)::text])))
);


ALTER TABLE webapp.webhook_config OWNER TO n8n_user;

--
-- Name: TABLE webhook_config; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.webhook_config IS 'Configuración de webhooks por usuario y tipo';


--
-- Name: active_webhook_configs; Type: VIEW; Schema: webapp; Owner: n8n_user
--

CREATE VIEW webapp.active_webhook_configs AS
 SELECT wc.id,
    wc.user_id,
    u.email AS user_email,
    u.full_name AS user_name,
    wc.webhook_url,
    wc.webhook_type,
    wc.is_active,
    wc.last_test_at,
    wc.last_test_status,
    wc.test_response_time_ms,
    wc.created_at,
    wc.updated_at
   FROM (webapp.webhook_config wc
     JOIN webapp.users u ON ((wc.user_id = u.id)))
  WHERE (wc.is_active = true);


ALTER TABLE webapp.active_webhook_configs OWNER TO n8n_user;

--
-- Name: campaigns; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.campaigns (
    campaign_id character varying(50) NOT NULL,
    campaign_name character varying(200) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    started_at timestamp without time zone,
    ended_at timestamp without time zone,
    duration_days integer,
    status character varying(20) DEFAULT 'active'::character varying,
    sectors character varying(500) DEFAULT NULL::character varying,
    roles character varying(500) DEFAULT NULL::character varying,
    CONSTRAINT campaigns_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('active'::character varying)::text, ('paused'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


ALTER TABLE webapp.campaigns OWNER TO n8n_user;

--
-- Name: company_leads; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.company_leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    linkedin_id character varying(50),
    linkedin_url character varying(500),
    linkedin_handle character varying(100),
    name character varying(255) NOT NULL,
    description text,
    website character varying(500),
    domain character varying(255),
    industry character varying(100),
    year_founded integer DEFAULT 0,
    headcount integer DEFAULT 0,
    headcount_range character varying(50),
    headquarters_region character varying(100),
    headquarters_city character varying(100),
    headquarters_country character varying(100),
    headquarters_country_code character(2),
    headquarters_postal_code character varying(20),
    headquarters_address_line_1 character varying(255),
    headquarters_address_line_2 character varying(255),
    axonaut_company_id character varying(50),
    sync_status character varying(20) DEFAULT 'pending'::character varying,
    last_sync_at timestamp without time zone,
    status character varying(20) DEFAULT 'active'::character varying,
    lead_source character varying(100) DEFAULT 'linkedin'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.company_leads OWNER TO n8n_user;

--
-- Name: TABLE company_leads; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.company_leads IS 'Tabla de empresas prospect/leads extraídas de LinkedIn y otras fuentes';


--
-- Name: leads; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_url character varying(500) NOT NULL,
    full_name character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    job_title character varying(255),
    additional_info text,
    location character varying(255),
    connection_degree character varying(10) DEFAULT '2nd'::character varying,
    profile_image_url text,
    vmid character varying(255),
    search_query character varying(1000),
    category character varying(100) DEFAULT 'People'::character varying,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    shared_connections character varying(255),
    company character varying(255),
    company_url character varying(500),
    industry character varying(255),
    company2 character varying(255),
    company_url2 character varying(500),
    job_title2 character varying(255),
    job_date_range character varying(100),
    job_date_range2 character varying(100),
    school character varying(255),
    school_degree character varying(255),
    school_date_range character varying(100),
    school2 character varying(255),
    school_degree2 character varying(255),
    school_date_range2 character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    source character varying(100) DEFAULT 'phantombuster'::character varying,
    user_id uuid,
    assigned_to uuid,
    tags jsonb DEFAULT '[]'::jsonb,
    notes jsonb DEFAULT '[]'::jsonb,
    contact_history jsonb DEFAULT '[]'::jsonb,
    process character varying(255),
    phone character varying(20),
    email character varying(255),
    containerid character varying(20),
    search_id character varying(20),
    id_crm integer,
    sector character varying(50),
    role character varying(50),
    campaigns character varying(60),
    company_lead_id uuid,
    axonaut_contact_id integer,
    axonaut_employee_id integer,
    lead_score integer DEFAULT 0,
    qualified_date timestamp without time zone,
    converted_date timestamp without time zone,
    last_contact_date timestamp without time zone,
    axonaut_company_id integer,
    CONSTRAINT leads_connection_degree_check CHECK (((connection_degree)::text = ANY (ARRAY[('1st'::character varying)::text, ('2nd'::character varying)::text, ('3rd+'::character varying)::text]))),
    CONSTRAINT leads_lead_score_check CHECK (((lead_score >= 0) AND (lead_score <= 100))),
    CONSTRAINT leads_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text, ('contacted'::character varying)::text, ('qualified'::character varying)::text, ('converted'::character varying)::text])))
);


ALTER TABLE webapp.leads OWNER TO n8n_user;

--
-- Name: TABLE leads; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.leads IS 'Tabla principal de leads de LinkedIn obtenidos de Phantombuster';


--
-- Name: COLUMN leads.axonaut_company_id; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON COLUMN webapp.leads.axonaut_company_id IS 'ID de la empresa en Axonaut CRM';


--
-- Name: daily_lead_statistics; Type: VIEW; Schema: webapp; Owner: n8n_user
--

CREATE VIEW webapp.daily_lead_statistics AS
 SELECT date(leads.created_at) AS date,
    count(*) AS total_leads,
    count(
        CASE
            WHEN ((leads.status)::text = 'contacted'::text) THEN 1
            ELSE NULL::integer
        END) AS contacted_leads,
    count(
        CASE
            WHEN ((leads.status)::text = 'qualified'::text) THEN 1
            ELSE NULL::integer
        END) AS qualified_leads,
    count(
        CASE
            WHEN ((leads.status)::text = 'converted'::text) THEN 1
            ELSE NULL::integer
        END) AS converted_leads,
    count(DISTINCT leads.company) AS unique_companies,
    count(DISTINCT leads.location) AS unique_locations
   FROM webapp.leads
  GROUP BY (date(leads.created_at))
  ORDER BY (date(leads.created_at)) DESC;


ALTER TABLE webapp.daily_lead_statistics OWNER TO n8n_user;

--
-- Name: lead_notes; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.lead_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid NOT NULL,
    user_id uuid,
    note_type character varying(20) DEFAULT 'general'::character varying,
    note_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lead_notes_note_type_check CHECK (((note_type)::text = ANY (ARRAY[('general'::character varying)::text, ('contact'::character varying)::text, ('qualification'::character varying)::text, ('follow_up'::character varying)::text])))
);


ALTER TABLE webapp.lead_notes OWNER TO n8n_user;

--
-- Name: TABLE lead_notes; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.lead_notes IS 'Notas y comentarios sobre leads';


--
-- Name: lead_statistics; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.lead_statistics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    total_leads integer DEFAULT 0,
    new_leads integer DEFAULT 0,
    contacted_leads integer DEFAULT 0,
    qualified_leads integer DEFAULT 0,
    converted_leads integer DEFAULT 0,
    search_queries_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.lead_statistics OWNER TO n8n_user;

--
-- Name: TABLE lead_statistics; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.lead_statistics IS 'Estadísticas diarias de leads';


--
-- Name: leads_process_history; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.leads_process_history (
    id integer NOT NULL,
    lead_id uuid NOT NULL,
    process character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.leads_process_history OWNER TO n8n_user;

--
-- Name: leads_process_history_id_seq; Type: SEQUENCE; Schema: webapp; Owner: n8n_user
--

CREATE SEQUENCE webapp.leads_process_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE webapp.leads_process_history_id_seq OWNER TO n8n_user;

--
-- Name: leads_process_history_id_seq; Type: SEQUENCE OWNED BY; Schema: webapp; Owner: n8n_user
--

ALTER SEQUENCE webapp.leads_process_history_id_seq OWNED BY webapp.leads_process_history.id;


--
-- Name: menu_options; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.menu_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    label character varying(255) NOT NULL,
    href character varying(255) NOT NULL,
    icon character varying(100),
    badge character varying(50),
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.menu_options OWNER TO n8n_user;

--
-- Name: TABLE menu_options; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.menu_options IS 'Opciones disponibles en el menú de navegación';


--
-- Name: role_permissions; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role character varying(50) NOT NULL,
    menu_option_id uuid,
    can_access boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.role_permissions OWNER TO n8n_user;

--
-- Name: TABLE role_permissions; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.role_permissions IS 'Permisos de cada rol para las opciones del menú';


--
-- Name: menu_permissions_view; Type: VIEW; Schema: webapp; Owner: n8n_user
--

CREATE VIEW webapp.menu_permissions_view AS
 SELECT rp.role,
    mo.name,
    mo.label,
    mo.href,
    mo.icon,
    mo.badge,
    mo.order_index,
    rp.can_access
   FROM (webapp.menu_options mo
     JOIN webapp.role_permissions rp ON ((mo.id = rp.menu_option_id)))
  WHERE (mo.is_active = true)
  ORDER BY mo.order_index, rp.role;


ALTER TABLE webapp.menu_permissions_view OWNER TO n8n_user;

--
-- Name: message_templates; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.message_templates (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content text NOT NULL,
    sector character varying(100) NOT NULL,
    type character varying(50) DEFAULT 'general'::character varying NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.message_templates OWNER TO n8n_user;

--
-- Name: message_templates_id_seq; Type: SEQUENCE; Schema: webapp; Owner: n8n_user
--

CREATE SEQUENCE webapp.message_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE webapp.message_templates_id_seq OWNER TO n8n_user;

--
-- Name: message_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: webapp; Owner: n8n_user
--

ALTER SEQUENCE webapp.message_templates_id_seq OWNED BY webapp.message_templates.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.password_reset_tokens OWNER TO n8n_user;

--
-- Name: TABLE password_reset_tokens; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.password_reset_tokens IS 'Tokens para restablecimiento de contraseñas';


--
-- Name: profiles; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.profiles (
    id uuid NOT NULL,
    bio text,
    website character varying(255),
    location character varying(255),
    company character varying(255),
    role character varying(255),
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.profiles OWNER TO n8n_user;

--
-- Name: TABLE profiles; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.profiles IS 'Tabla para información extendida de perfiles de usuario';


--
-- Name: webhook_logs; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.webhook_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webhook_config_id uuid,
    event_type character varying(50) NOT NULL,
    payload jsonb,
    response_status integer,
    response_body text,
    response_time_ms integer,
    error_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.webhook_logs OWNER TO n8n_user;

--
-- Name: TABLE webhook_logs; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.webhook_logs IS 'Log de eventos de webhooks para auditoría';


--
-- Name: recent_webhook_logs; Type: VIEW; Schema: webapp; Owner: n8n_user
--

CREATE VIEW webapp.recent_webhook_logs AS
 SELECT wl.id,
    wl.webhook_config_id,
    wc.webhook_url,
    wc.webhook_type,
    u.email AS user_email,
    wl.event_type,
    wl.response_status,
    wl.response_time_ms,
    wl.error_message,
    wl.created_at
   FROM ((webapp.webhook_logs wl
     JOIN webapp.webhook_config wc ON ((wl.webhook_config_id = wc.id)))
     JOIN webapp.users u ON ((wc.user_id = u.id)))
  WHERE (wl.created_at >= (CURRENT_TIMESTAMP - '24:00:00'::interval))
  ORDER BY wl.created_at DESC;


ALTER TABLE webapp.recent_webhook_logs OWNER TO n8n_user;

--
-- Name: search_company_sizes; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.search_company_sizes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    linkedin_code character varying(10) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.search_company_sizes OWNER TO n8n_user;

--
-- Name: TABLE search_company_sizes; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.search_company_sizes IS 'Mapeo de tamaños de empresa para búsquedas de LinkedIn en Phantombuster';


--
-- Name: search_history; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.search_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    search_query character varying(500) NOT NULL,
    search_type character varying(20) DEFAULT 'simple'::character varying,
    total_results integer DEFAULT 0,
    status character varying(20) DEFAULT 'running'::character varying,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    container_id character varying(25),
    CONSTRAINT search_history_search_type_check CHECK (((search_type)::text = ANY (ARRAY[('simple'::character varying)::text, ('advanced'::character varying)::text]))),
    CONSTRAINT search_history_status_check CHECK (((status)::text = ANY (ARRAY[('running'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text, ('cancelled'::character varying)::text, ('finished'::character varying)::text])))
);


ALTER TABLE webapp.search_history OWNER TO n8n_user;

--
-- Name: TABLE search_history; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.search_history IS 'Historial de búsquedas realizadas en Phantombuster (versión simplificada)';


--
-- Name: search_industries; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.search_industries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    linkedin_code character varying(20) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.search_industries OWNER TO n8n_user;

--
-- Name: TABLE search_industries; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.search_industries IS 'Mapeo de industrias para búsquedas de LinkedIn en Phantombuster';


--
-- Name: search_job_titles; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.search_job_titles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    keywords jsonb DEFAULT '[]'::jsonb NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.search_job_titles OWNER TO n8n_user;

--
-- Name: TABLE search_job_titles; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.search_job_titles IS 'Mapeo de títulos de trabajo para búsquedas de LinkedIn en Phantombuster';


--
-- Name: search_locations; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.search_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    linkedin_code character varying(20) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.search_locations OWNER TO n8n_user;

--
-- Name: TABLE search_locations; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.search_locations IS 'Mapeo de ubicaciones para búsquedas de LinkedIn en Phantombuster';


--
-- Name: user_activity_log; Type: TABLE; Schema: webapp; Owner: n8n_user
--

CREATE TABLE webapp.user_activity_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE webapp.user_activity_log OWNER TO n8n_user;

--
-- Name: TABLE user_activity_log; Type: COMMENT; Schema: webapp; Owner: n8n_user
--

COMMENT ON TABLE webapp.user_activity_log IS 'Log de actividades de usuarios para auditoría';


--
-- Name: leads_process_history id; Type: DEFAULT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.leads_process_history ALTER COLUMN id SET DEFAULT nextval('webapp.leads_process_history_id_seq'::regclass);


--
-- Name: message_templates id; Type: DEFAULT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.message_templates ALTER COLUMN id SET DEFAULT nextval('webapp.message_templates_id_seq'::regclass);


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.campaigns (campaign_id, campaign_name, created_at, started_at, ended_at, duration_days, status, sectors, roles) FROM stdin;
CAMP_TECHNO_CEO_W30_348712	 &  Leaders-lundi au vendredi Semaine 30 2025	2025-07-25 09:39:08.712	2025-07-28 09:39:08.712	2025-08-02 09:39:08.712	5	cancelled	'Technologie','Santé','Finance'	'CEO','CTO','Director de Operaciones','VP de Ventas','Manager'
CAMP_TECHNO_CEO_W30_834152	 &  Leaders-lundi au vendredi Semaine 30 2025	2025-07-25 09:47:14.152	2025-07-28 09:47:14.152	2025-08-02 09:47:14.152	5	cancelled	'Technologie','Santé','Éducation'	'CEO','CTO','Director de Operaciones','VP de Ventas','Manager'
CAMP_TECHNO_CEO_W30_855237	 &  Leaders-lundi au vendredi Semaine 30 2025	2025-07-25 09:47:35.237	2025-07-28 09:47:35.237	2025-08-02 09:47:35.237	5	cancelled	'Technologie','Santé'	'CEO','CTO','Director de Operaciones','VP de Ventas','Manager'
CAMP_TECHNO_CEO_W30_060034	 &  Leaders-lundi au vendredi Semaine 30 2025	2025-07-25 09:51:00.034	2025-07-28 09:51:00.034	2025-08-02 09:51:00.034	5	cancelled	'Technologie','Santé','Finance'	'CEO','CTO','Director de Operaciones','VP de Ventas','Manager'
CAMP_TECHNO_CTO_W31_163960	 &  Leaders-lundi au vendredi Semaine 31 2025	2025-07-31 21:26:03.96	2025-08-04 21:26:03.96	2025-08-09 21:26:03.96	5	cancelled	'Technologie','Finance','Commerce','Consulting','Real Estate','Government','Media','Manufacturing','Éducation','Santé'	'CTO','CMO','Sales Directors','Directors','Founders','Presidents','VPs','Managers','CFO','Operations Directors','CEO'
CAMP_CONSUL_SAL_W31_217401	undefined undefined-lundi au vendredi Semaine 31 2025	2025-07-31 21:26:57.401	2025-08-04 21:26:57.401	2025-08-09 21:26:57.401	5	cancelled	'Consulting'	'Sales Directors'
\.


--
-- Data for Name: company_leads; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.company_leads (id, linkedin_id, linkedin_url, linkedin_handle, name, description, website, domain, industry, year_founded, headcount, headcount_range, headquarters_region, headquarters_city, headquarters_country, headquarters_country_code, headquarters_postal_code, headquarters_address_line_1, headquarters_address_line_2, axonaut_company_id, sync_status, last_sync_at, status, lead_source, priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: lead_notes; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.lead_notes (id, lead_id, user_id, note_type, note_text, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: lead_statistics; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.lead_statistics (id, date, total_leads, new_leads, contacted_leads, qualified_leads, converted_leads, search_queries_count, created_at) FROM stdin;
e46dfddb-2e86-4068-b5db-77e2e0d34c9f	2025-07-21	219	219	0	0	0	0	2025-07-21 05:58:34.414044
f2a4e8f4-d08d-47cd-a0f1-387c5011d5d0	2025-07-22	3	3	0	0	0	0	2025-07-22 09:03:13.108923
37dab800-b0a9-4d0f-8d48-237d196196b1	2025-07-24	1317	1317	0	0	0	0	2025-07-24 04:09:31.567941
88ab26b1-a549-48f5-a16e-f094465f0054	2025-08-03	1640	1640	0	0	0	0	2025-08-03 11:06:15.239948
117cf893-ba3c-4d79-be13-770182acdfdd	2025-08-04	1579	1579	0	0	0	0	2025-08-04 00:33:35.666296
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.leads (id, profile_url, full_name, first_name, last_name, job_title, additional_info, location, connection_degree, profile_image_url, vmid, search_query, category, "timestamp", shared_connections, company, company_url, industry, company2, company_url2, job_title2, job_date_range, job_date_range2, school, school_degree, school_date_range, school2, school_degree2, school_date_range2, created_at, updated_at, status, source, user_id, assigned_to, tags, notes, contact_history, process, phone, email, containerid, search_id, id_crm, sector, role, campaigns, company_lead_id, axonaut_contact_id, axonaut_employee_id, lead_score, qualified_date, converted_date, last_contact_date, axonaut_company_id) FROM stdin;
\.


--
-- Data for Name: leads_process_history; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.leads_process_history (id, lead_id, process, created_at) FROM stdin;
\.


--
-- Data for Name: linkedin_urls; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.linkedin_urls (id, profile_title, profile_keyword, linkedin_url, description, priority, is_active, created_at, updated_at) FROM stdin;
d37c03c6-b462-4dc9-92f9-16dd0a9c1965	CEO	CEO	https://www.linkedin.com/search/results/people/?keywords=CEO&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%5D	CEO - Francia + Alemania (Tecnología)	1	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
c261c088-c308-495d-981c-851e41dc79f0	Founder	Founder	https://www.linkedin.com/search/results/people/?keywords=Founder&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22103350119%22%5D&industryUrn=%5B%22107%22%2C%22108%22%2C%22109%22%5D&companySize=%5B%22A%22%2C%22B%22%5D	Founder - Francia + Reino Unido (Finanzas)	1	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
32506f93-d5fc-409b-b9b6-225d9e95f32b	Sales Director	Sales Director	https://www.linkedin.com/search/results/people/?keywords=%22Sales%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22101282230%22%5D&industryUrn=%5B%22110%22%2C%22111%22%2C%22112%22%5D&companySize=%5B%22C%22%2C%22D%22%2C%22E%22%5D	Sales Director - Francia + España (Ventas)	2	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
484a3e77-9516-49d4-963f-dd98aa2eb6c5	Technical Director	Technical Director	https://www.linkedin.com/search/results/people/?keywords=%22Technical%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22102257491%22%5D&industryUrn=%5B%22104%22%2C%22105%22%2C%22106%22%5D&companySize=%5B%22B%22%2C%22C%22%2C%22D%22%5D	Technical Director - Francia + Italia (Tecnología)	2	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
43848dd6-6320-47d2-a01c-81657568667e	Operations Director	Operations Director	https://www.linkedin.com/search/results/people/?keywords=%22Operations%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22100364837%22%5D&industryUrn=%5B%22113%22%2C%22114%22%2C%22115%22%5D&companySize=%5B%22D%22%2C%22E%22%2C%22F%22%5D	Operations Director - Francia + Países Bajos (Manufactura)	2	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
e9084512-740c-4746-8307-8381b907ca29	Business Development Director	Business Development Director	https://www.linkedin.com/search/results/people/?keywords=%22Business%20Development%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22100565514%22%5D&industryUrn=%5B%22116%22%2C%22117%22%2C%22118%22%5D&companySize=%5B%22A%22%2C%22B%22%2C%22C%22%5D	Business Development Director - Francia + Bélgica (Consultoría)	2	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
da4d55f3-d283-4d07-8894-fda87bee8937	Managing Director	Managing Director	https://www.linkedin.com/search/results/people/?keywords=%22Managing%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105646813%22%5D&industryUrn=%5B%22119%22%2C%22120%22%2C%22121%22%5D&companySize=%5B%22C%22%2C%22D%22%2C%22E%22%5D	Managing Director - Francia + Suiza (Servicios)	1	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
fa917ed6-64b4-4b53-9a1b-23e74cbc1768	General Manager	General Manager	https://www.linkedin.com/search/results/people/?keywords=%22General%20Manager%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%5D&industryUrn=%5B%22107%22%2C%22108%22%2C%22109%22%5D&companySize=%5B%22E%22%2C%22F%22%2C%22G%22%5D	General Manager - Francia + Suecia (Banca)	1	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
2cb3febd-a190-4438-a381-402dcac494e9	Innovation Director	Innovation Director	https://www.linkedin.com/search/results/people/?keywords=%22Innovation%20Director%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%5D&industryUrn=%5B%22122%22%2C%22123%22%2C%22124%22%5D&companySize=%5B%22A%22%2C%22B%22%5D	Innovation Director - Francia + Dinamarca (Investigación)	3	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
8f36e194-11c2-4eba-886f-5aa3db14ac19	Facility Manager	Facility Manager	https://www.linkedin.com/search/results/people/?keywords=%22Facility%20Manager%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22105015875%22%5D&industryUrn=%5B%22125%22%2C%22126%22%2C%22127%22%5D&companySize=%5B%22D%22%2C%22E%22%2C%22F%22%5D	Facility Manager - Francia + Noruega (Logística)	3	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
3add1a0d-e7fb-4b57-8d19-62485d3c1bb2	Purchasing Manager	Purchasing Manager	https://www.linkedin.com/search/results/people/?keywords=%22Purchasing%20Manager%22&origin=FACETED_SEARCH&geoUrn=%5B%22102890719%22%2C%22103350119%22%5D&industryUrn=%5B%22128%22%2C%22129%22%2C%22130%22%5D&companySize=%5B%22C%22%2C%22D%22%2C%22E%22%5D	Purchasing Manager - Francia + Finlandia (Compras)	3	t	2025-08-04 01:43:24.197064	2025-08-04 01:43:24.197064
\.


--
-- Data for Name: menu_options; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.menu_options (id, name, label, href, icon, badge, order_index, is_active, created_at, updated_at) FROM stdin;
9b2d681e-6c8f-4696-9cc0-8a0564c769df	dashboard	Dashboard	/dashboard	LayoutDashboard	\N	1	t	2025-07-21 01:00:08.173232	2025-07-21 01:00:08.173232
9fb3b40e-8b1e-4966-b5c7-d03ff0c8c802	search	Recherche	/search	Search	\N	2	t	2025-07-21 01:00:08.173232	2025-07-21 12:47:26.681434
0133ded5-1d52-46f8-89e3-962bc13f140a	leads	Leads	/leads	Users	12	4	t	2025-07-21 01:00:08.173232	2025-07-25 04:58:34.68385
4d0a6e33-2a34-47b6-8b9e-a847f0439104	messages	Mensajes	/messages	MessageSquare	5	5	t	2025-07-21 01:00:08.173232	2025-07-25 04:58:34.685089
14c4c8c1-ff21-41ae-9016-61bb4e0037c8	automation	Automatización	/automation	Zap	\N	6	t	2025-07-21 01:00:08.173232	2025-07-25 04:58:34.685361
34b644d5-f3f7-4d39-a817-d72aab6acec3	analytics	Analytics	/analytics	BarChart3	\N	7	t	2025-07-21 01:00:08.173232	2025-07-25 04:58:34.685631
e06eb8d5-be7c-445c-97dd-5f956c9b677f	alerts	Alertas	/alerts	Bell	3	8	t	2025-07-21 01:00:08.173232	2025-07-25 04:58:34.685879
8071a75a-b495-423b-af06-c3fa535e66ed	config	Configuración	/config	Settings	\N	9	t	2025-07-21 01:00:08.173232	2025-07-25 04:58:34.68613
4a8a8b82-a6a0-4219-b0bd-10ad58353c9e	campaign	Campagnes	/campaign	Target	\N	3	t	2025-07-25 04:58:34.683021	2025-07-25 05:01:15.257392
\.


--
-- Data for Name: message_templates; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.message_templates (id, name, content, sector, type, is_active, created_at, updated_at) FROM stdin;
62	Auto Connect - Technologie	Bonjour [FirstName], je contacte les dirigeants du secteur Technologie utilisant des solutions d'automatisation avancées. Ravi de nous connecter!	Technologie	auto_connect	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
64	Visitor - Finance	Visite du profil pour les dirigeants du secteur Finance utilisant des solutions d'automatisation sécurisées.	Finance	visitor	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
65	Auto Connect - Finance	Bonjour [FirstName], je contacte les dirigeants du secteur Finance utilisant des solutions d'automatisation sécurisées. Ravi de nous connecter!	Finance	auto_connect	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
66	Messenger - Finance	Merci pour la connexion! Chez Europbots, nous fournissons des robots sécurisés capables d'optimiser vos processus financiers. Avez-vous déjà envisagé une telle solution?	Finance	messenger	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
74	Auto Connect - Real Estate	Bonjour [FirstName], je contacte les dirigeants du secteur Immobilier utilisant des solutions d'automatisation immobilières. Ravi de nous connecter!	Real Estate	auto_connect	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
75	Messenger - Real Estate	Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d'optimiser vos processus immobiliers. Avez-vous déjà envisagé une telle solution?	Real Estate	messenger	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
77	Auto Connect - Santé	Bonjour [FirstName], je contacte les dirigeants du secteur Santé utilisant des solutions d'automatisation médicales. Ravi de nous connecter!	Santé	auto_connect	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
78	Messenger - Santé	Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d'optimiser vos processus médicaux. Avez-vous déjà envisagé une telle solution?	Santé	messenger	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
79	Visitor - Éducation	Visite du profil pour les dirigeants du secteur Éducation utilisant des solutions d'automatisation éducatives.	Éducation	visitor	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
80	Auto Connect - Éducation	Bonjour [FirstName], je contacte les dirigeants du secteur Éducation utilisant des solutions d'automatisation éducatives. Ravi de nous connecter!	Éducation	auto_connect	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
81	Messenger - Éducation	Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d'optimiser vos processus éducatifs. Avez-vous déjà envisagé une telle solution?	Éducation	messenger	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
82	Visitor - Manufacturing	Visite du profil pour les dirigeants du secteur Manufacturing utilisant des solutions d'automatisation industrielles.	Manufacturing	visitor	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
83	Auto Connect - Manufacturing	Bonjour [FirstName], je contacte les dirigeants du secteur Manufacturing utilisant des solutions d'automatisation industrielles. Ravi de nous connecter!	Manufacturing	auto_connect	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
84	Messenger - Manufacturing	Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d'optimiser vos processus manufacturiers. Avez-vous déjà envisagé une telle solution?	Manufacturing	messenger	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
85	Visitor - Media	Visite du profil pour les dirigeants du secteur Media utilisant des solutions d'automatisation médiatiques.	Media	visitor	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
86	Auto Connect - Media	Bonjour [FirstName], je contacte les dirigeants du secteur Media utilisant des solutions d'automatisation médiatiques. Ravi de nous connecter!	Media	auto_connect	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
87	Messenger - Media	Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d'optimiser vos processus médiatiques. Avez-vous déjà envisagé une telle solution?	Media	messenger	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
88	Visitor - Government	Visite du profil pour les dirigeants du secteur Government utilisant des solutions d'automatisation gouvernementales.	Government	visitor	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
89	Auto Connect - Government	Bonjour [FirstName], je contacte les dirigeants du secteur Government utilisant des solutions d'automatisation gouvernementales. Ravi de nous connecter!	Government	auto_connect	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
90	Messenger - Government	Merci pour la connexion! Chez Europbots, nous fournissons des robots capables d'optimiser vos processus gouvernementaux. Avez-vous déjà envisagé une telle solution?	Government	messenger	t	2025-08-04 10:39:24.691245	2025-08-04 10:39:24.691245
33	Messenger - Technologie	Merci pour la connexion! Chez Europbots, nous fournissons des robots intelligents capables d'optimiser vos processus technologiques. Avez-vous déjà envisagé une telle solution?	Technologie	messenger	t	2025-08-04 07:33:41.765084	2025-08-04 07:33:41.765084
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.password_reset_tokens (id, user_id, token, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.profiles (id, bio, website, location, company, role, preferences, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.role_permissions (id, role, menu_option_id, can_access, created_at, updated_at) FROM stdin;
c3480001-3f70-40d3-879a-8ab50f8d16d2	admin	9b2d681e-6c8f-4696-9cc0-8a0564c769df	t	2025-07-21 01:24:04.695587	2025-07-21 01:24:04.695587
c653ffed-a72e-4275-8809-ada1f5125322	admin	9fb3b40e-8b1e-4966-b5c7-d03ff0c8c802	t	2025-07-21 01:24:04.695587	2025-07-21 01:24:04.695587
13dbc598-b10b-4f2c-a23a-ad8d856f646c	admin	0133ded5-1d52-46f8-89e3-962bc13f140a	t	2025-07-21 01:24:04.695587	2025-07-21 01:24:04.695587
429aee10-1787-4daf-ab6f-6951ba40bd41	admin	4d0a6e33-2a34-47b6-8b9e-a847f0439104	t	2025-07-21 01:24:04.695587	2025-07-21 01:24:04.695587
6c0c9fcc-ad6f-45fb-8ad8-01f4792d5f81	admin	14c4c8c1-ff21-41ae-9016-61bb4e0037c8	t	2025-07-21 01:24:04.695587	2025-07-21 01:24:04.695587
249ccb9d-2fc0-48aa-96ad-d4cc5bdd405a	admin	34b644d5-f3f7-4d39-a817-d72aab6acec3	t	2025-07-21 01:24:04.695587	2025-07-21 01:24:04.695587
1cbed723-3b73-4738-810f-0a213a2ade54	admin	e06eb8d5-be7c-445c-97dd-5f956c9b677f	t	2025-07-21 01:24:04.695587	2025-07-21 01:24:04.695587
0d41a0f3-1063-4d2e-b1f6-73d188d19c9c	admin	8071a75a-b495-423b-af06-c3fa535e66ed	t	2025-07-21 01:24:04.695587	2025-07-21 01:24:04.695587
0be4428d-dd42-437c-8ba6-315d94eb48d5	admin	4a8a8b82-a6a0-4219-b0bd-10ad58353c9e	t	2025-07-25 04:58:34.686977	2025-07-25 04:58:34.686977
b7574267-093a-4d81-81b3-543b76f4da2a	user	9b2d681e-6c8f-4696-9cc0-8a0564c769df	f	2025-07-25 10:22:29.199663	2025-07-25 10:22:29.199663
e0feb09f-7393-4c26-8a74-2ac34a3adf96	user	9fb3b40e-8b1e-4966-b5c7-d03ff0c8c802	f	2025-07-25 10:22:29.199663	2025-07-25 10:22:29.199663
c6743713-88c4-4c25-9236-7d0803b7b5f7	user	4a8a8b82-a6a0-4219-b0bd-10ad58353c9e	t	2025-07-25 10:22:29.199663	2025-07-25 10:22:29.199663
db7ade50-ab1d-4933-8671-c789422a5b4d	user	0133ded5-1d52-46f8-89e3-962bc13f140a	f	2025-07-25 10:22:29.199663	2025-07-25 10:22:29.199663
288d0dbb-9a60-4697-a3f6-3822212c46cc	user	4d0a6e33-2a34-47b6-8b9e-a847f0439104	f	2025-07-25 10:22:29.199663	2025-07-25 10:22:29.199663
e832d665-9a77-431d-8760-3b916c4625bd	user	14c4c8c1-ff21-41ae-9016-61bb4e0037c8	f	2025-07-25 10:22:29.199663	2025-07-25 10:22:29.199663
9c3f7ad1-0ecf-48b5-a48d-5562fdbc638b	user	34b644d5-f3f7-4d39-a817-d72aab6acec3	f	2025-07-25 10:22:29.199663	2025-07-25 10:22:29.199663
c2f5c4d8-1b62-4c5e-94b8-253ec89c36c0	user	e06eb8d5-be7c-445c-97dd-5f956c9b677f	f	2025-07-25 10:22:29.199663	2025-07-25 10:22:29.199663
6f7405fc-a4f2-44b4-9a3a-252465b06bcd	user	8071a75a-b495-423b-af06-c3fa535e66ed	f	2025-07-25 10:22:29.199663	2025-07-25 10:22:29.199663
\.


--
-- Data for Name: search_company_sizes; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.search_company_sizes (id, code, name, linkedin_code, description, is_active, order_index, created_at, updated_at) FROM stdin;
897522b4-12a4-44aa-ac24-60101341975f	SMALL_11_50	11-50 empleados	A	Pequeña empresa (11-50 empleados)	t	1	2025-07-21 01:00:08.195963	2025-07-21 01:00:08.195963
311e23de-4fd0-4c21-8b82-d812526ab3b5	MEDIUM_51_200	51-200 empleados	B	Empresa mediana (51-200 empleados)	t	2	2025-07-21 01:00:08.195963	2025-07-21 01:00:08.195963
91228f3c-8eae-4f7c-ba45-423b9f3792b8	MEDIUM_LARGE_201_500	201-500 empleados	C	Empresa mediana-grande (201-500 empleados)	t	3	2025-07-21 01:00:08.195963	2025-07-21 01:00:08.195963
c136ab4b-8994-4384-b616-cbac83046346	LARGE_501_1000	501-1000 empleados	D	Empresa grande (501-1000 empleados)	t	4	2025-07-21 01:00:08.195963	2025-07-21 01:00:08.195963
e4fdf2bd-8b15-4e74-bc9f-015d7c587b02	ENTERPRISE_1000_PLUS	1000+ empleados	E	Empresa enterprise (1000+ empleados)	t	5	2025-07-21 01:00:08.195963	2025-07-21 01:00:08.195963
\.


--
-- Data for Name: search_history; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.search_history (id, search_query, search_type, total_results, status, started_at, completed_at, created_at, container_id) FROM stdin;
44ecc0c7-bf02-4be6-acbb-0070f6f408fa	https://www.linkedin.com/search/results/people/?keywords=CEO&connectionOf=2%2C3%2B%2C1	simple	155	completed	2025-08-04 07:05:09.88686	2025-08-04 07:05:09.865	2025-08-04 07:05:09.865	6044109218150082
\.


--
-- Data for Name: search_industries; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.search_industries (id, code, name, linkedin_code, description, is_active, order_index, created_at, updated_at) FROM stdin;
828a0de2-6d0b-432b-a31d-197989f870ad	HORECA	HoReCa (Hoteles/Restaurantes)	4	Hoteles, Restaurantes y Cafeterías	t	1	2025-07-21 01:00:08.184942	2025-07-21 01:00:08.184942
ecbbca8b-d1d3-46d0-871e-d14bd79c5787	LOGISTICS_WAREHOUSING	Logistics & Warehousing	47	Logística y Almacenamiento	t	2	2025-07-21 01:00:08.184942	2025-07-21 01:00:08.184942
86474f7d-5d49-4e8f-8135-4f8ee4087f44	CLEANING_SERVICES	Cleaning Services	48	Servicios de Limpieza	t	3	2025-07-21 01:00:08.184942	2025-07-21 01:00:08.184942
2dbbb41c-7c4a-4ee3-821f-510c0c1455a0	HEALTHCARE_INSTITUTIONS	Healthcare Institutions	4	Instituciones de Salud	t	4	2025-07-21 01:00:08.184942	2025-07-21 01:00:08.184942
e5251fe9-04b1-4fa3-8e21-7017465d1d97	COMMERCIAL_REAL_ESTATE	Commercial Real Estate	47	Bienes Raíces Comerciales	t	5	2025-07-21 01:00:08.184942	2025-07-21 01:00:08.184942
9cd9c522-27aa-4a1a-a54a-55d1bc3c634e	EVENTS_EXHIBITIONS	Events & Exhibitions	49	Eventos y Exposiciones	t	6	2025-07-21 01:00:08.184942	2025-07-21 01:00:08.184942
9692a87f-6337-4296-ab93-b75b17e1770d	CONSTRUCTION	Construction	6	Construcción	t	7	2025-07-21 01:00:08.184942	2025-07-21 01:00:08.184942
\.


--
-- Data for Name: search_job_titles; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.search_job_titles (id, code, name, keywords, description, is_active, order_index, created_at, updated_at) FROM stdin;
61aa993f-949f-49bc-bb27-360cfbb1761b	C_LEVEL	C-Level (CEO, COO, CTO, CMO)	["CEO", "COO", "CTO", "CMO", "CFO", "Chief Executive Officer", "Chief Operating Officer", "Chief Technology Officer", "Chief Marketing Officer", "Chief Financial Officer"]	Nivel Ejecutivo C-Level	t	1	2025-07-21 01:00:08.188533	2025-07-21 01:00:08.188533
ee460424-9a2a-4f4a-b9eb-c42f49d8edda	VP_DIRECTOR	VP/Director Level	["VP", "Vice President", "Director", "Vicepresidente", "Director General"]	Nivel Vicepresidente/Director	t	2	2025-07-21 01:00:08.188533	2025-07-21 01:00:08.188533
7f7a7469-db5b-463c-b84f-9fc8ba40e450	OPERATIONS_MANAGER	Operations Manager	["Operations Manager", "Gerente de Operaciones", "Operations Director"]	Gerente de Operaciones	t	3	2025-07-21 01:00:08.188533	2025-07-21 01:00:08.188533
f87bd787-8c64-4963-9550-5818c958359e	FACILITIES_MANAGER	Facilities Manager	["Facilities Manager", "Gerente de Instalaciones", "Facility Manager"]	Gerente de Instalaciones	t	4	2025-07-21 01:00:08.188533	2025-07-21 01:00:08.188533
63b4194e-21cd-477a-b629-9e5d87e89dd1	PROCUREMENT_MANAGER	Procurement Manager	["Procurement Manager", "Gerente de Compras", "Purchasing Manager", "Supply Chain Manager"]	Gerente de Compras	t	5	2025-07-21 01:00:08.188533	2025-07-21 01:00:08.188533
a7e7410b-ab44-47ef-8690-8da9871f1dc1	INNOVATION_MANAGER	Innovation Manager	["Innovation Manager", "Gerente de Innovación", "Innovation Director"]	Gerente de Innovación	t	6	2025-07-21 01:00:08.188533	2025-07-21 01:00:08.188533
fb1df477-da7f-49eb-9463-ba044b3d5f13	GENERAL_MANAGER	General Manager	["General Manager", "Gerente General", "Managing Director"]	Gerente General	t	7	2025-07-21 01:00:08.188533	2025-07-21 01:00:08.188533
\.


--
-- Data for Name: search_locations; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.search_locations (id, code, name, linkedin_code, description, is_active, order_index, created_at, updated_at) FROM stdin;
564c0506-0f6e-4093-9918-1e15ed7128a5	FRANCE	Francia	105015875	France	t	1	2025-07-21 01:00:08.192576	2025-07-21 01:00:08.192576
e28f112e-1906-4d3b-9e21-b50f1a55f291	GERMANY	Alemania	101282230	Germany	t	2	2025-07-21 01:00:08.192576	2025-07-21 01:00:08.192576
40a894c2-6c9c-486b-8011-e4d2525e3042	UK	Reino Unido	101165590	United Kingdom	t	3	2025-07-21 01:00:08.192576	2025-07-21 01:00:08.192576
debe8124-c49e-4624-a518-45e2f29cecf4	SPAIN	España	105646813	Spain	t	4	2025-07-21 01:00:08.192576	2025-07-21 01:00:08.192576
92fd3261-43c0-458e-a651-9e9aac9462a8	ITALY	Italia	103350119	Italy	t	5	2025-07-21 01:00:08.192576	2025-07-21 01:00:08.192576
51443fb7-b796-41cf-8aa2-fb3d222495f4	NETHERLANDS	Países Bajos	102890719	Netherlands	t	6	2025-07-21 01:00:08.192576	2025-07-21 01:00:08.192576
4abbbda8-637a-467c-9f4b-2e1847f33817	BELGIUM	Bélgica	100565514	Belgium	t	7	2025-07-21 01:00:08.192576	2025-07-21 01:00:08.192576
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.sessions (id, user_id, token, expires_at, created_at) FROM stdin;
995ed20a-3e47-4613-bffc-c003d1653a14	ade4818a-1965-4008-94d4-860bcf3047eb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGU0ODE4YS0xOTY1LTQwMDgtOTRkNC04NjBiY2YzMDQ3ZWIiLCJpYXQiOjE3NTI0NTA4NTksImV4cCI6MTc1MzA1NTY1OX0.ZjblGzunnnRUzs6F-pvr1SmCOESsqO1Ct3Dk4L8Ig10	2025-07-20 23:54:19.458	2025-07-13 23:54:19.459581
7b1b67d0-0273-47d1-8872-2365e35fe99c	ade4818a-1965-4008-94d4-860bcf3047eb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGU0ODE4YS0xOTY1LTQwMDgtOTRkNC04NjBiY2YzMDQ3ZWIiLCJpYXQiOjE3NTI3NTI2MDYsImV4cCI6MTc1MzM1NzQwNn0.tFiRP1_xwDoUZ2Mu6ypD_j2BIqEjL8QufhwPA53YZAU	2025-07-24 11:43:26.815	2025-07-17 11:43:26.817061
9558de4a-08fc-4b4a-9fac-3ef38c94ecbd	ade4818a-1965-4008-94d4-860bcf3047eb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGU0ODE4YS0xOTY1LTQwMDgtOTRkNC04NjBiY2YzMDQ3ZWIiLCJpYXQiOjE3NTMwNjEwMTQsImV4cCI6MTc1MzY2NTgxNH0.lIuTdmWHTWRIm6X_i6g4Eqmjoj5sNoq6hUqK1C6G5pE	2025-07-28 01:23:34.13	2025-07-21 01:23:34.130647
f7c75fad-c463-44dc-9d82-02b77a4af41a	852c6d5c-6b11-4a04-8f71-deabe9d111a6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NTJjNmQ1Yy02YjExLTRhMDQtOGY3MS1kZWFiZTlkMTExYTYiLCJpYXQiOjE3NTMwNjExMTIsImV4cCI6MTc1MzY2NTkxMn0.NPCNMstBp-iWVwqZrGFq6gDTa4XCg0Bp25IFWoSnjOA	2025-07-28 01:25:12.907	2025-07-21 01:25:12.907827
d407e1de-adae-469d-8d1c-d1a21f5d3678	ade4818a-1965-4008-94d4-860bcf3047eb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGU0ODE4YS0xOTY1LTQwMDgtOTRkNC04NjBiY2YzMDQ3ZWIiLCJpYXQiOjE3NTMwODEyNzUsImV4cCI6MTc1MzY4NjA3NX0.nEroX5kbjTfIpFmDBzOG7bOGls4O22eZgthsh7DME3U	2025-07-28 07:01:15.463	2025-07-21 07:01:15.463678
12f871c3-c735-4b78-bcb2-643a482bd785	852c6d5c-6b11-4a04-8f71-deabe9d111a6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NTJjNmQ1Yy02YjExLTRhMDQtOGY3MS1kZWFiZTlkMTExYTYiLCJpYXQiOjE3NTMxMDYzMTYsImV4cCI6MTc1MzcxMTExNn0.dePOtL5qh3MAlfztl2GwObUOBVKdjbT8sDNL7H5g7J4	2025-07-28 13:58:36.69	2025-07-21 13:58:36.690536
5693912e-66b2-40e5-ae57-9d8e315d7a19	852c6d5c-6b11-4a04-8f71-deabe9d111a6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NTJjNmQ1Yy02YjExLTRhMDQtOGY3MS1kZWFiZTlkMTExYTYiLCJpYXQiOjE3NTMxNTUxNjksImV4cCI6MTc1Mzc1OTk2OX0.5dMh-vsBqfuuhaVtz-CM6ExG4CUuZ7KtVudlaGkYOFo	2025-07-29 03:32:49.19	2025-07-22 03:32:49.190885
dac38459-5ab3-4f94-b18a-de67cb2c473e	852c6d5c-6b11-4a04-8f71-deabe9d111a6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NTJjNmQ1Yy02YjExLTRhMDQtOGY3MS1kZWFiZTlkMTExYTYiLCJpYXQiOjE3NTMyMjY2MzAsImV4cCI6MTc1MzgzMTQzMH0.GjdyhHUUPVMh9lRWA_Ri5v6V-I0dQmKuXUk2HywrxB8	2025-07-29 23:23:50.422	2025-07-22 23:23:50.422702
fa6c81e2-e532-4c79-8732-0b1121cc782b	852c6d5c-6b11-4a04-8f71-deabe9d111a6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NTJjNmQ1Yy02YjExLTRhMDQtOGY3MS1kZWFiZTlkMTExYTYiLCJpYXQiOjE3NTMzNTkwMzIsImV4cCI6MTc1Mzk2MzgzMn0.qOzMn6K0wsMMOIFegfnNCrFCkT2QHjOCF4qVwXuqZZ0	2025-07-31 12:10:32.633	2025-07-24 12:10:32.634686
0e21a172-4abe-4224-a569-6a935906555b	ade4818a-1965-4008-94d4-860bcf3047eb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGU0ODE4YS0xOTY1LTQwMDgtOTRkNC04NjBiY2YzMDQ3ZWIiLCJpYXQiOjE3NTM0MTI1ODMsImV4cCI6MTc1NDAxNzM4M30.6gsqWNovqGfrNZV_N0c5ZJgtnXxeC6eJ_ydv6jxlpOQ	2025-08-01 03:03:03.478	2025-07-25 03:03:03.479805
4ab4aee8-f7ac-4a11-86c7-1a94421f7cca	852c6d5c-6b11-4a04-8f71-deabe9d111a6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NTJjNmQ1Yy02YjExLTRhMDQtOGY3MS1kZWFiZTlkMTExYTYiLCJpYXQiOjE3NTM0NDIwNDMsImV4cCI6MTc1NDA0Njg0M30.GYnHTt4n-U5Kwoec6MSBE_XnzE6iRpv5BFjZVENnhnU	2025-08-01 11:14:03.029	2025-07-25 11:14:03.030202
1ec1381a-8953-4d7b-82c0-163449548081	852c6d5c-6b11-4a04-8f71-deabe9d111a6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NTJjNmQ1Yy02YjExLTRhMDQtOGY3MS1kZWFiZTlkMTExYTYiLCJpYXQiOjE3NTM0NDIxMTQsImV4cCI6MTc1NDA0NjkxNH0.syKS7CShSylM1WvQAZ2jKyX4cmtvn7V_ISlJv2atsbI	2025-08-01 11:15:14.282	2025-07-25 11:15:14.282741
1bb2d97f-d05f-4c6f-b3fc-0081997b1641	ade4818a-1965-4008-94d4-860bcf3047eb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGU0ODE4YS0xOTY1LTQwMDgtOTRkNC04NjBiY2YzMDQ3ZWIiLCJpYXQiOjE3NTM5OTcyNDAsImV4cCI6MTc1NDYwMjA0MH0.jOrH49AMOVn5TKr6LOnj1diRc_tmg1j2LKn3n9k7Yg4	2025-08-07 21:27:20.352	2025-07-31 21:27:20.353165
\.


--
-- Data for Name: user_activity_log; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.user_activity_log (id, user_id, action, details, ip_address, user_agent, created_at) FROM stdin;
3d54efe9-fa2c-461b-b970-effa2dad5bb2	ade4818a-1965-4008-94d4-860bcf3047eb	update_menu_permissions	{"role": "user", "permissions_count": 8}	\N	\N	2025-07-21 01:24:01.031996
d511f27a-b932-4254-a40f-2228498f0ed9	ade4818a-1965-4008-94d4-860bcf3047eb	update_menu_permissions	{"role": "user", "permissions_count": 8}	\N	\N	2025-07-21 01:24:04.387974
0ee4c466-8b6e-4e8e-a995-b58c5b89b0d5	ade4818a-1965-4008-94d4-860bcf3047eb	update_menu_permissions	{"role": "admin", "permissions_count": 8}	\N	\N	2025-07-21 01:24:04.700667
e9a323ec-a1f2-48dc-b538-96fea773706d	ade4818a-1965-4008-94d4-860bcf3047eb	update_menu_permissions	{"role": "user", "permissions_count": 9}	\N	\N	2025-07-25 10:22:29.202582
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.users (id, email, password_hash, full_name, avatar_url, role, is_active, created_at, updated_at) FROM stdin;
4f1c9884-58c2-4a55-8b66-4cb8c2d2578b	admin@europbots.com	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ8Kj1G	Administrador Europbots	\N	admin	t	2025-07-12 14:44:33.141642	2025-07-12 14:44:33.141642
ade4818a-1965-4008-94d4-860bcf3047eb	cmoyanoch@gmail.com	$2a$12$1jffJbSG5.r5dgIqGrjStuHNej3wHHOHkLRAhbsM9Ca/50FDkDIeu	cristian moyano	\N	admin	t	2025-07-12 14:45:16.620676	2025-07-21 01:23:23.717362
852c6d5c-6b11-4a04-8f71-deabe9d111a6	usuario@europbot.com	$2a$12$oirPMH/jnBh0gPK0pdVb/Ojqm/O1EnARgLBi/.LhVmiCerNk1rfqO	usuario	\N	user	t	2025-07-21 01:25:12.598603	2025-07-21 01:25:12.598603
\.


--
-- Data for Name: webhook_config; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.webhook_config (id, user_id, webhook_url, webhook_type, is_active, last_test_at, last_test_status, test_response_time_ms, created_at, updated_at) FROM stdin;
05f550dd-c2f3-4ad2-ad6b-7bc88985d538	4f1c9884-58c2-4a55-8b66-4cb8c2d2578b	https://n8n.localhost/webhook/search-launcher	search_bot	t	\N	\N	\N	2025-07-25 07:20:31.409331	2025-07-25 07:20:31.409331
45d8d0e2-efb2-4009-9a2c-696d2885d028	4f1c9884-58c2-4a55-8b66-4cb8c2d2578b	https://n8n.localhost/webhook/campaign-launcher	automation	t	\N	\N	\N	2025-07-25 07:20:31.409331	2025-07-25 07:20:31.409331
\.


--
-- Data for Name: webhook_logs; Type: TABLE DATA; Schema: webapp; Owner: n8n_user
--

COPY webapp.webhook_logs (id, webhook_config_id, event_type, payload, response_status, response_body, response_time_ms, error_message, created_at) FROM stdin;
\.


--
-- Name: leads_process_history_id_seq; Type: SEQUENCE SET; Schema: webapp; Owner: n8n_user
--

SELECT pg_catalog.setval('webapp.leads_process_history_id_seq', 43, true);


--
-- Name: message_templates_id_seq; Type: SEQUENCE SET; Schema: webapp; Owner: n8n_user
--

SELECT pg_catalog.setval('webapp.message_templates_id_seq', 90, true);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (campaign_id);


--
-- Name: company_leads company_leads_linkedin_id_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.company_leads
    ADD CONSTRAINT company_leads_linkedin_id_key UNIQUE (linkedin_id);


--
-- Name: company_leads company_leads_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.company_leads
    ADD CONSTRAINT company_leads_pkey PRIMARY KEY (id);


--
-- Name: lead_notes lead_notes_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.lead_notes
    ADD CONSTRAINT lead_notes_pkey PRIMARY KEY (id);


--
-- Name: lead_statistics lead_statistics_date_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.lead_statistics
    ADD CONSTRAINT lead_statistics_date_key UNIQUE (date);


--
-- Name: lead_statistics lead_statistics_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.lead_statistics
    ADD CONSTRAINT lead_statistics_pkey PRIMARY KEY (id);


--
-- Name: leads leads_containerid_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.leads
    ADD CONSTRAINT leads_containerid_key UNIQUE (containerid);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: leads_process_history leads_process_history_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.leads_process_history
    ADD CONSTRAINT leads_process_history_pkey PRIMARY KEY (id);


--
-- Name: leads leads_profile_url_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.leads
    ADD CONSTRAINT leads_profile_url_key UNIQUE (profile_url);


--
-- Name: leads leads_vmid_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.leads
    ADD CONSTRAINT leads_vmid_key UNIQUE (vmid);


--
-- Name: linkedin_urls linkedin_urls_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.linkedin_urls
    ADD CONSTRAINT linkedin_urls_pkey PRIMARY KEY (id);


--
-- Name: menu_options menu_options_name_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.menu_options
    ADD CONSTRAINT menu_options_name_key UNIQUE (name);


--
-- Name: menu_options menu_options_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.menu_options
    ADD CONSTRAINT menu_options_pkey PRIMARY KEY (id);


--
-- Name: message_templates message_templates_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.message_templates
    ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_menu_option_id_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.role_permissions
    ADD CONSTRAINT role_permissions_role_menu_option_id_key UNIQUE (role, menu_option_id);


--
-- Name: search_company_sizes search_company_sizes_code_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.search_company_sizes
    ADD CONSTRAINT search_company_sizes_code_key UNIQUE (code);


--
-- Name: search_company_sizes search_company_sizes_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.search_company_sizes
    ADD CONSTRAINT search_company_sizes_pkey PRIMARY KEY (id);


--
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (id);


--
-- Name: search_industries search_industries_code_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.search_industries
    ADD CONSTRAINT search_industries_code_key UNIQUE (code);


--
-- Name: search_industries search_industries_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.search_industries
    ADD CONSTRAINT search_industries_pkey PRIMARY KEY (id);


--
-- Name: search_job_titles search_job_titles_code_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.search_job_titles
    ADD CONSTRAINT search_job_titles_code_key UNIQUE (code);


--
-- Name: search_job_titles search_job_titles_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.search_job_titles
    ADD CONSTRAINT search_job_titles_pkey PRIMARY KEY (id);


--
-- Name: search_locations search_locations_code_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.search_locations
    ADD CONSTRAINT search_locations_code_key UNIQUE (code);


--
-- Name: search_locations search_locations_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.search_locations
    ADD CONSTRAINT search_locations_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.sessions
    ADD CONSTRAINT sessions_token_key UNIQUE (token);


--
-- Name: user_activity_log user_activity_log_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.user_activity_log
    ADD CONSTRAINT user_activity_log_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webhook_config webhook_config_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.webhook_config
    ADD CONSTRAINT webhook_config_pkey PRIMARY KEY (id);


--
-- Name: webhook_config webhook_config_user_id_webhook_type_key; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.webhook_config
    ADD CONSTRAINT webhook_config_user_id_webhook_type_key UNIQUE (user_id, webhook_type);


--
-- Name: webhook_logs webhook_logs_pkey; Type: CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.webhook_logs
    ADD CONSTRAINT webhook_logs_pkey PRIMARY KEY (id);


--
-- Name: idx_company_leads_country_code; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_company_leads_country_code ON webapp.company_leads USING btree (headquarters_country_code);


--
-- Name: idx_company_leads_created_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_company_leads_created_at ON webapp.company_leads USING btree (created_at);


--
-- Name: idx_company_leads_domain; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_company_leads_domain ON webapp.company_leads USING btree (domain);


--
-- Name: idx_company_leads_industry; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_company_leads_industry ON webapp.company_leads USING btree (industry);


--
-- Name: idx_company_leads_linkedin_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_company_leads_linkedin_id ON webapp.company_leads USING btree (linkedin_id);


--
-- Name: idx_company_leads_name; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_company_leads_name ON webapp.company_leads USING btree (name);


--
-- Name: idx_company_leads_status; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_company_leads_status ON webapp.company_leads USING btree (status);


--
-- Name: idx_lead_notes_created_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_lead_notes_created_at ON webapp.lead_notes USING btree (created_at);


--
-- Name: idx_lead_notes_lead_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_lead_notes_lead_id ON webapp.lead_notes USING btree (lead_id);


--
-- Name: idx_lead_notes_note_type; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_lead_notes_note_type ON webapp.lead_notes USING btree (note_type);


--
-- Name: idx_lead_notes_user_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_lead_notes_user_id ON webapp.lead_notes USING btree (user_id);


--
-- Name: idx_lead_statistics_date; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_lead_statistics_date ON webapp.lead_statistics USING btree (date);


--
-- Name: idx_leads_assigned_to; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_assigned_to ON webapp.leads USING btree (assigned_to);


--
-- Name: idx_leads_axonaut_company_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_axonaut_company_id ON webapp.leads USING btree (axonaut_company_id);


--
-- Name: idx_leads_axonaut_contact_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_axonaut_contact_id ON webapp.leads USING btree (axonaut_contact_id);


--
-- Name: idx_leads_axonaut_employee_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_axonaut_employee_id ON webapp.leads USING btree (axonaut_employee_id);


--
-- Name: idx_leads_company; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_company ON webapp.leads USING btree (company);


--
-- Name: idx_leads_company_lead_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_company_lead_id ON webapp.leads USING btree (company_lead_id);


--
-- Name: idx_leads_company_location; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_company_location ON webapp.leads USING btree (company, location);


--
-- Name: idx_leads_connection_degree; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_connection_degree ON webapp.leads USING btree (connection_degree);


--
-- Name: idx_leads_created_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_created_at ON webapp.leads USING btree (created_at);


--
-- Name: idx_leads_full_name; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_full_name ON webapp.leads USING btree (full_name);


--
-- Name: idx_leads_fulltext; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_fulltext ON webapp.leads USING gin (to_tsvector('english'::regconfig, (((((((((full_name)::text || ' '::text) || (COALESCE(job_title, ''::character varying))::text) || ' '::text) || (COALESCE(company, ''::character varying))::text) || ' '::text) || (COALESCE(location, ''::character varying))::text) || ' '::text) || COALESCE(additional_info, ''::text))));


--
-- Name: idx_leads_job_title; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_job_title ON webapp.leads USING btree (job_title);


--
-- Name: idx_leads_job_title_location; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_job_title_location ON webapp.leads USING btree (job_title, location);


--
-- Name: idx_leads_location; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_location ON webapp.leads USING btree (location);


--
-- Name: idx_leads_process_history_created_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_process_history_created_at ON webapp.leads_process_history USING btree (created_at);


--
-- Name: idx_leads_process_history_lead_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_process_history_lead_id ON webapp.leads_process_history USING btree (lead_id);


--
-- Name: idx_leads_process_history_process; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_process_history_process ON webapp.leads_process_history USING btree (process);


--
-- Name: idx_leads_profile_url; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_profile_url ON webapp.leads USING btree (profile_url);


--
-- Name: idx_leads_search_query; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_search_query ON webapp.leads USING btree (search_query);


--
-- Name: idx_leads_status; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_status ON webapp.leads USING btree (status);


--
-- Name: idx_leads_status_created_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_status_created_at ON webapp.leads USING btree (status, created_at);


--
-- Name: idx_leads_user_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_user_id ON webapp.leads USING btree (user_id);


--
-- Name: idx_leads_vmid; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_leads_vmid ON webapp.leads USING btree (vmid);


--
-- Name: idx_linkedin_urls_created_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_linkedin_urls_created_at ON webapp.linkedin_urls USING btree (created_at);


--
-- Name: idx_linkedin_urls_is_active; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_linkedin_urls_is_active ON webapp.linkedin_urls USING btree (is_active);


--
-- Name: idx_linkedin_urls_priority; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_linkedin_urls_priority ON webapp.linkedin_urls USING btree (priority);


--
-- Name: idx_linkedin_urls_profile_keyword; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_linkedin_urls_profile_keyword ON webapp.linkedin_urls USING btree (profile_keyword);


--
-- Name: idx_linkedin_urls_profile_title; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_linkedin_urls_profile_title ON webapp.linkedin_urls USING btree (profile_title);


--
-- Name: idx_menu_options_is_active; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_menu_options_is_active ON webapp.menu_options USING btree (is_active);


--
-- Name: idx_menu_options_name; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_menu_options_name ON webapp.menu_options USING btree (name);


--
-- Name: idx_menu_options_order_index; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_menu_options_order_index ON webapp.menu_options USING btree (order_index);


--
-- Name: idx_message_templates_active; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_message_templates_active ON webapp.message_templates USING btree (is_active);


--
-- Name: idx_message_templates_sector; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_message_templates_sector ON webapp.message_templates USING btree (sector);


--
-- Name: idx_message_templates_type; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_message_templates_type ON webapp.message_templates USING btree (type);


--
-- Name: idx_password_reset_tokens_expires_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_password_reset_tokens_expires_at ON webapp.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_password_reset_tokens_token; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_password_reset_tokens_token ON webapp.password_reset_tokens USING btree (token);


--
-- Name: idx_password_reset_tokens_user_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_password_reset_tokens_user_id ON webapp.password_reset_tokens USING btree (user_id);


--
-- Name: idx_role_permissions_can_access; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_role_permissions_can_access ON webapp.role_permissions USING btree (can_access);


--
-- Name: idx_role_permissions_menu_option_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_role_permissions_menu_option_id ON webapp.role_permissions USING btree (menu_option_id);


--
-- Name: idx_role_permissions_role; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_role_permissions_role ON webapp.role_permissions USING btree (role);


--
-- Name: idx_search_company_sizes_code; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_company_sizes_code ON webapp.search_company_sizes USING btree (code);


--
-- Name: idx_search_company_sizes_is_active; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_company_sizes_is_active ON webapp.search_company_sizes USING btree (is_active);


--
-- Name: idx_search_company_sizes_linkedin_code; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_company_sizes_linkedin_code ON webapp.search_company_sizes USING btree (linkedin_code);


--
-- Name: idx_search_company_sizes_name; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_company_sizes_name ON webapp.search_company_sizes USING btree (name);


--
-- Name: idx_search_company_sizes_order_index; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_company_sizes_order_index ON webapp.search_company_sizes USING btree (order_index);


--
-- Name: idx_search_history_created_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_history_created_at ON webapp.search_history USING btree (created_at);


--
-- Name: idx_search_history_search_query; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_history_search_query ON webapp.search_history USING btree (search_query);


--
-- Name: idx_search_history_started_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_history_started_at ON webapp.search_history USING btree (started_at);


--
-- Name: idx_search_history_status; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_history_status ON webapp.search_history USING btree (status);


--
-- Name: idx_search_industries_code; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_industries_code ON webapp.search_industries USING btree (code);


--
-- Name: idx_search_industries_is_active; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_industries_is_active ON webapp.search_industries USING btree (is_active);


--
-- Name: idx_search_industries_linkedin_code; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_industries_linkedin_code ON webapp.search_industries USING btree (linkedin_code);


--
-- Name: idx_search_industries_name; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_industries_name ON webapp.search_industries USING btree (name);


--
-- Name: idx_search_industries_order_index; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_industries_order_index ON webapp.search_industries USING btree (order_index);


--
-- Name: idx_search_job_titles_code; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_job_titles_code ON webapp.search_job_titles USING btree (code);


--
-- Name: idx_search_job_titles_is_active; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_job_titles_is_active ON webapp.search_job_titles USING btree (is_active);


--
-- Name: idx_search_job_titles_name; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_job_titles_name ON webapp.search_job_titles USING btree (name);


--
-- Name: idx_search_job_titles_order_index; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_job_titles_order_index ON webapp.search_job_titles USING btree (order_index);


--
-- Name: idx_search_locations_code; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_locations_code ON webapp.search_locations USING btree (code);


--
-- Name: idx_search_locations_is_active; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_locations_is_active ON webapp.search_locations USING btree (is_active);


--
-- Name: idx_search_locations_linkedin_code; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_locations_linkedin_code ON webapp.search_locations USING btree (linkedin_code);


--
-- Name: idx_search_locations_name; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_locations_name ON webapp.search_locations USING btree (name);


--
-- Name: idx_search_locations_order_index; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_search_locations_order_index ON webapp.search_locations USING btree (order_index);


--
-- Name: idx_sessions_expires_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_sessions_expires_at ON webapp.sessions USING btree (expires_at);


--
-- Name: idx_sessions_token; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_sessions_token ON webapp.sessions USING btree (token);


--
-- Name: idx_sessions_user_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_sessions_user_id ON webapp.sessions USING btree (user_id);


--
-- Name: idx_user_activity_log_action; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_user_activity_log_action ON webapp.user_activity_log USING btree (action);


--
-- Name: idx_user_activity_log_created_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_user_activity_log_created_at ON webapp.user_activity_log USING btree (created_at);


--
-- Name: idx_user_activity_log_user_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_user_activity_log_user_id ON webapp.user_activity_log USING btree (user_id);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_users_created_at ON webapp.users USING btree (created_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_users_email ON webapp.users USING btree (email);


--
-- Name: idx_users_is_active; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_users_is_active ON webapp.users USING btree (is_active);


--
-- Name: idx_users_role; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_users_role ON webapp.users USING btree (role);


--
-- Name: idx_webhook_config_is_active; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_webhook_config_is_active ON webapp.webhook_config USING btree (is_active);


--
-- Name: idx_webhook_config_last_test_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_webhook_config_last_test_at ON webapp.webhook_config USING btree (last_test_at);


--
-- Name: idx_webhook_config_user_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_webhook_config_user_id ON webapp.webhook_config USING btree (user_id);


--
-- Name: idx_webhook_config_webhook_type; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_webhook_config_webhook_type ON webapp.webhook_config USING btree (webhook_type);


--
-- Name: idx_webhook_logs_created_at; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_webhook_logs_created_at ON webapp.webhook_logs USING btree (created_at);


--
-- Name: idx_webhook_logs_event_type; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_webhook_logs_event_type ON webapp.webhook_logs USING btree (event_type);


--
-- Name: idx_webhook_logs_response_status; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_webhook_logs_response_status ON webapp.webhook_logs USING btree (response_status);


--
-- Name: idx_webhook_logs_webhook_config_id; Type: INDEX; Schema: webapp; Owner: n8n_user
--

CREATE INDEX idx_webhook_logs_webhook_config_id ON webapp.webhook_logs USING btree (webhook_config_id);


--
-- Name: leads after_lead_insert; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER after_lead_insert AFTER INSERT ON webapp.leads FOR EACH ROW EXECUTE FUNCTION webapp.update_lead_statistics();


--
-- Name: leads tr_cambio_process_lead; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER tr_cambio_process_lead AFTER UPDATE ON webapp.leads FOR EACH ROW EXECUTE FUNCTION webapp.fn_registrar_cambio_process_lead();


--
-- Name: lead_notes update_lead_notes_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_lead_notes_updated_at BEFORE UPDATE ON webapp.lead_notes FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: leads update_leads_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON webapp.leads FOR EACH ROW EXECUTE FUNCTION webapp.update_leads_updated_at();


--
-- Name: linkedin_urls update_linkedin_urls_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_linkedin_urls_updated_at BEFORE UPDATE ON webapp.linkedin_urls FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: menu_options update_menu_options_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_menu_options_updated_at BEFORE UPDATE ON webapp.menu_options FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: message_templates update_message_templates_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON webapp.message_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON webapp.profiles FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: role_permissions update_role_permissions_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON webapp.role_permissions FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: search_company_sizes update_search_company_sizes_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_search_company_sizes_updated_at BEFORE UPDATE ON webapp.search_company_sizes FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: search_industries update_search_industries_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_search_industries_updated_at BEFORE UPDATE ON webapp.search_industries FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: search_job_titles update_search_job_titles_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_search_job_titles_updated_at BEFORE UPDATE ON webapp.search_job_titles FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: search_locations update_search_locations_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_search_locations_updated_at BEFORE UPDATE ON webapp.search_locations FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON webapp.users FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: webhook_config update_webhook_config_updated_at; Type: TRIGGER; Schema: webapp; Owner: n8n_user
--

CREATE TRIGGER update_webhook_config_updated_at BEFORE UPDATE ON webapp.webhook_config FOR EACH ROW EXECUTE FUNCTION webapp.update_updated_at_column();


--
-- Name: leads fk_leads_company_lead; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.leads
    ADD CONSTRAINT fk_leads_company_lead FOREIGN KEY (company_lead_id) REFERENCES webapp.company_leads(id) ON DELETE SET NULL;


--
-- Name: leads_process_history fk_leads_process_history_lead_id; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.leads_process_history
    ADD CONSTRAINT fk_leads_process_history_lead_id FOREIGN KEY (lead_id) REFERENCES webapp.leads(id) ON DELETE CASCADE;


--
-- Name: lead_notes lead_notes_lead_id_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.lead_notes
    ADD CONSTRAINT lead_notes_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES webapp.leads(id) ON DELETE CASCADE;


--
-- Name: lead_notes lead_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.lead_notes
    ADD CONSTRAINT lead_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES webapp.users(id) ON DELETE SET NULL;


--
-- Name: leads leads_assigned_to_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.leads
    ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES webapp.users(id) ON DELETE SET NULL;


--
-- Name: leads leads_user_id_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.leads
    ADD CONSTRAINT leads_user_id_fkey FOREIGN KEY (user_id) REFERENCES webapp.users(id) ON DELETE SET NULL;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES webapp.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES webapp.users(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_menu_option_id_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.role_permissions
    ADD CONSTRAINT role_permissions_menu_option_id_fkey FOREIGN KEY (menu_option_id) REFERENCES webapp.menu_options(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES webapp.users(id) ON DELETE CASCADE;


--
-- Name: user_activity_log user_activity_log_user_id_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.user_activity_log
    ADD CONSTRAINT user_activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES webapp.users(id) ON DELETE SET NULL;


--
-- Name: webhook_config webhook_config_user_id_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.webhook_config
    ADD CONSTRAINT webhook_config_user_id_fkey FOREIGN KEY (user_id) REFERENCES webapp.users(id) ON DELETE CASCADE;


--
-- Name: webhook_logs webhook_logs_webhook_config_id_fkey; Type: FK CONSTRAINT; Schema: webapp; Owner: n8n_user
--

ALTER TABLE ONLY webapp.webhook_logs
    ADD CONSTRAINT webhook_logs_webhook_config_id_fkey FOREIGN KEY (webhook_config_id) REFERENCES webapp.webhook_config(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

