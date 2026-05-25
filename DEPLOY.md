# 🚀 Guia de Deploy — EklēsiaApp

Siga esta ordem exata. Todo o processo leva cerca de 20 minutos.

---

## 1. Banco de dados — Supabase ✅ (já concluído)

Você já tem:
- Project URL → `https://xxxx.supabase.co`
- Anon Key
- Service Role Key

---

## 2. Backend — Railway

### 2.1 Criar serviço

1. Acesse [railway.app](https://railway.app) e faça login com GitHub
2. Clique em **New Project → Deploy from GitHub repo**
3. Selecione o repositório e a pasta `backend/`
4. Railway detecta automaticamente o Node.js

### 2.2 Configurar variáveis de ambiente

No painel do serviço → **Variables**, adicione:

```
SUPABASE_URL               = https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY  = eyJ...sua_service_role_key
JWT_SECRET                 = gere-com-o-comando-abaixo
PORT                       = 3001
NODE_ENV                   = production
ALLOWED_ORIGINS            = https://seu-app.vercel.app
```

**Gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2.3 Configurar domínio

- Vá em **Settings → Networking → Generate Domain**
- Anote a URL: `https://eklesiaapp-api.up.railway.app`

### 2.4 Verificar

Acesse `https://sua-api.up.railway.app/health` — deve retornar:
```json
{ "status": "ok", "ts": "..." }
```

---

## 3. Frontend — Vercel

### 3.1 Importar projeto

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório GitHub, selecione a pasta `frontend/`
3. Framework: **Next.js** (detectado automaticamente)

### 3.2 Variáveis de ambiente

Em **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL       = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...sua_anon_key
NEXT_PUBLIC_API_URL            = https://eklesiaapp-api.up.railway.app
```

### 3.3 Deploy

Clique em **Deploy**. Em ~2 minutos o frontend estará em:
`https://eklesiaapp.vercel.app`

### 3.4 Atualizar ALLOWED_ORIGINS no Railway

Volte ao Railway e atualize:
```
ALLOWED_ORIGINS = https://eklesiaapp.vercel.app
```

---

## 4. App Mobile — Expo EAS

### 4.1 Instalar e configurar EAS

```bash
cd mobile
npm install
cp .env.example .env
# Edite .env com suas URLs reais

npm install -g eas-cli
eas login
eas build:configure
```

### 4.2 Preencher .env do mobile

```
EXPO_PUBLIC_API_URL            = https://eklesiaapp-api.up.railway.app
EXPO_PUBLIC_SUPABASE_URL       = https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY  = eyJ...sua_anon_key
```

### 4.3 Testar localmente

```bash
npm start
# Escaneie o QR com o app Expo Go no celular
```

### 4.4 Build para distribuição

**APK Android (para testes internos):**
```bash
eas build --platform android --profile preview
```

**Build de produção (Play Store + App Store):**
```bash
eas build --platform all --profile production
```

### 4.5 Enviar para as lojas

```bash
# Google Play
eas submit --platform android

# App Store
eas submit --platform ios
```

---

## 5. Criar primeiro usuário admin

Após o deploy, crie o usuário admin diretamente no Supabase:

### 5.1 Criar auth user

No Supabase → **Authentication → Users → Add user**:
- Email: `admin@suaigreja.com`
- Password: (escolha uma senha segura)
- Marque **Auto Confirm User**

### 5.2 Criar registro na tabela churches

No **SQL Editor**:
```sql
INSERT INTO churches (name, cnpj, address, phone)
VALUES ('Nome da Sua Igreja', '00.000.000/0001-00', 'Endereço completo', '(11) 99999-0000')
RETURNING id;
```
Copie o `id` gerado.

### 5.3 Vincular usuário à igreja

```sql
INSERT INTO users (id, church_id, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@suaigreja.com'),
  'cole-aqui-o-id-da-igreja',
  'Administrador',
  'super_admin'
);
```

### 5.4 Acessar o sistema

Acesse `https://eklesiaapp.vercel.app` e faça login com as credenciais criadas.

---

## 6. Checklist final

- [ ] Schema SQL executado no Supabase
- [ ] Backend rodando no Railway (`/health` retorna 200)
- [ ] Frontend acessível na Vercel
- [ ] CORS configurado com a URL da Vercel
- [ ] Usuário admin criado e vinculado à igreja
- [ ] Login funcionando no web
- [ ] Login funcionando no app mobile (Expo Go)
- [ ] Build mobile gerado pelo EAS

---

## Domínio personalizado (opcional)

**Vercel:** Settings → Domains → Add → `app.suaigreja.com.br`

**Railway:** Settings → Networking → Custom Domain → `api.suaigreja.com.br`

Configure os registros DNS no seu provedor:
```
CNAME  app  cname.vercel-dns.com
CNAME  api  seu-servico.up.railway.app
```
