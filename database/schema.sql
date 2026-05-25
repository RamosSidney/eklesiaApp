-- ============================================================
-- EklēsiaApp — Schema PostgreSQL para Supabase
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- 1. IGREJAS
-- ============================================================
CREATE TABLE churches (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  cnpj        TEXT UNIQUE,
  address     TEXT,
  phone       TEXT,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. USUÁRIOS (ligados ao auth.users do Supabase)
-- ============================================================
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id   UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('super_admin','admin','pastor','leader','secretary','viewer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. MEMBROS
-- ============================================================
CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id       UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,

  -- Dados pessoais
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  birth_date      DATE,
  cpf             TEXT,
  marital_status  TEXT CHECK (marital_status IN (
                    'single','married','divorced','widowed','separated'
                  )),
  gender          TEXT CHECK (gender IN ('male','female','other')),
  address         TEXT,
  photo_url       TEXT,

  -- Dados eclesiásticos
  status          TEXT NOT NULL DEFAULT 'visitor'
                  CHECK (status IN ('visitor','in_discipleship','active','inactive','transferred','deceased')),
  baptism_date    DATE,
  origin_church   TEXT,
  conversion_date DATE,
  notes           TEXT,

  -- Auditoria
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de busca
CREATE INDEX idx_members_church     ON members(church_id);
CREATE INDEX idx_members_status     ON members(status);
CREATE INDEX idx_members_birth_date ON members(birth_date);
CREATE INDEX idx_members_search     ON members USING GIN (
  to_tsvector('portuguese', unaccent(full_name) || ' ' || COALESCE(email,'') || ' ' || COALESCE(phone,''))
);

-- ============================================================
-- 4. MINISTÉRIOS
-- ============================================================
CREATE TABLE ministries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id   UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  leader_id   UUID REFERENCES members(id) ON DELETE SET NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ministries_church ON ministries(church_id);

-- ============================================================
-- 5. MEMBROS ↔ MINISTÉRIOS (N:N)
-- ============================================================
CREATE TABLE member_ministries (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  ministry_id  UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('member','leader','coordinator')),
  joined_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  left_at      DATE,
  UNIQUE (member_id, ministry_id)
);

CREATE INDEX idx_member_ministries_member   ON member_ministries(member_id);
CREATE INDEX idx_member_ministries_ministry ON member_ministries(ministry_id);

-- ============================================================
-- 6. EVENTOS
-- ============================================================
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id   UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'service'
              CHECK (type IN ('service','baptism','retreat','cell','wedding','other')),
  description TEXT,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ,
  location    TEXT,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_church    ON events(church_id);
CREATE INDEX idx_events_starts_at ON events(starts_at);

-- ============================================================
-- 7. FREQUÊNCIA EM EVENTOS
-- ============================================================
CREATE TABLE event_attendances (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  present      BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_by  UUID REFERENCES users(id),
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, member_id)
);

CREATE INDEX idx_attendance_event  ON event_attendances(event_id);
CREATE INDEX idx_attendance_member ON event_attendances(member_id);

-- ============================================================
-- 8. LOG DE AUDITORIA
-- ============================================================
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  table_name  TEXT NOT NULL,
  record_id   UUID,
  changes     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user  ON audit_log(user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name, record_id);

-- ============================================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_churches_updated_at
  BEFORE UPDATE ON churches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ministries_updated_at
  BEFORE UPDATE ON ministries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — isolamento por igreja
-- ============================================================
ALTER TABLE churches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: retorna church_id do usuário autenticado
CREATE OR REPLACE FUNCTION my_church_id()
RETURNS UUID AS $$
  SELECT church_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Função auxiliar: retorna role do usuário autenticado
CREATE OR REPLACE FUNCTION my_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas para members
CREATE POLICY "Leitura: mesma igreja"
  ON members FOR SELECT
  USING (church_id = my_church_id());

CREATE POLICY "Escrita: admin/pastor/secretary"
  ON members FOR INSERT
  WITH CHECK (
    church_id = my_church_id()
    AND my_role() IN ('super_admin','admin','pastor','secretary')
  );

CREATE POLICY "Edição: admin/pastor/secretary"
  ON members FOR UPDATE
  USING (church_id = my_church_id())
  WITH CHECK (my_role() IN ('super_admin','admin','pastor','secretary'));

CREATE POLICY "Exclusão: admin"
  ON members FOR DELETE
  USING (
    church_id = my_church_id()
    AND my_role() IN ('super_admin','admin')
  );

-- Políticas para ministries (padrão: mesmo church_id)
CREATE POLICY "Leitura: mesma igreja"
  ON ministries FOR SELECT
  USING (church_id = my_church_id());

CREATE POLICY "Escrita/edição: líder ou acima"
  ON ministries FOR ALL
  USING (church_id = my_church_id())
  WITH CHECK (my_role() IN ('super_admin','admin','pastor','leader'));

-- Políticas para events
CREATE POLICY "Leitura: mesma igreja"
  ON events FOR SELECT
  USING (church_id = my_church_id());

CREATE POLICY "Escrita: pastor ou acima"
  ON events FOR ALL
  USING (church_id = my_church_id())
  WITH CHECK (my_role() IN ('super_admin','admin','pastor','secretary'));

-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

-- Aniversariantes do mês atual
CREATE OR REPLACE VIEW v_birthday_this_month AS
SELECT
  m.id,
  m.full_name,
  m.phone,
  m.email,
  m.birth_date,
  EXTRACT(DAY FROM m.birth_date)::INT AS birth_day,
  c.name AS church_name
FROM members m
JOIN churches c ON c.id = m.church_id
WHERE
  m.status IN ('active','in_discipleship')
  AND EXTRACT(MONTH FROM m.birth_date) = EXTRACT(MONTH FROM CURRENT_DATE);

-- Resumo de membros por status
CREATE OR REPLACE VIEW v_members_summary AS
SELECT
  church_id,
  COUNT(*)                                          AS total,
  COUNT(*) FILTER (WHERE status = 'active')         AS active,
  COUNT(*) FILTER (WHERE status = 'visitor')        AS visitors,
  COUNT(*) FILTER (WHERE status = 'inactive')       AS inactive,
  COUNT(*) FILTER (WHERE status = 'in_discipleship')AS in_discipleship,
  COUNT(*) FILTER (
    WHERE birth_date >= CURRENT_DATE - INTERVAL '30 days'
      AND created_at >= NOW() - INTERVAL '30 days'
  )                                                 AS new_this_month
FROM members
GROUP BY church_id;

