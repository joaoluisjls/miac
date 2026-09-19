# 🏭 MIAC Pindorama — Sistema de Manutenção Industrial

## 🚀 Deploy com Supabase + Vercel (5 minutos)

### Passo 1: Criar banco no Supabase

1. Acesse: https://supabase.com
2. Clique em **"Start your project"** → crie conta com GitHub
3. Clique em **"New Project"**
4. Preencha:
   - **Organization**: crie uma nova (não usa a do outro site)
   - **Project name**: `miac-pindorama`
   - **Database Password**: escolha uma senha forte
   - **Region**:选择 a mais próxima (East US está ok)
5. Aguarde criar (~2 minutos)
6. Vá em **Settings** → **Database**
7. Copie a **Connection string** → **URI**
8. Substitua `[YOUR-PASSWORD]` pela senha que você criou

A string ficará assim:
```
postgresql://postgres:SUASENHA@db.xxxxxxxxx.supabase.co:5432/postgres
```

> ⚠️ Guarde essa string! Você vai precisar dela.

### Passo 2: Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `miac-pindorama`
3. Crie o repositório

### Passo 3: Enviar código para o GitHub

Abra o terminal na pasta `miac-pindorama` e rode:

```bash
git remote add origin https://github.com/SEU-USER/miac-pindorama.git
git branch -M main
git push -u origin main
```

### Passo 4: Deploy no Vercel

1. Acesse: https://vercel.com → crie conta com GitHub
2. Clique em **"Add New..."** → **Project**
3. Importe o repositório `miac-pindorama`
4. Antes de deploy, clique em **"Environment Variables"** e adicione:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | Cole a connection string do Supabase (com `?pgbouncer=true` no final) |
| `NEXTAUTH_SECRET` | `miac-pindorama-super-secret-2026` |
| `NEXTAUTH_URL` | `https://miac-pindorama.vercel.app` |

5. Clique em **"Deploy"**

> A connection string deve ficar assim:
> ```
> postgresql://postgres.sua-senha@db.seu-projeto.supabase.co:6543/postgres
> ```

### Passo 5: Criar tabelas no Supabase

Após o primeiro deploy:

1. Vá no **Supabase** → seu projeto → **SQL Editor**
2. Cole e execute este SQL:

```sql
-- Criar extensão necessária
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Usar Prisma para criar as tabelas
-- (será executado automaticamente no build)
```

Ou rode localmente com a string do Supabase:

```bash
# No terminal local:
DATABASE_URL="sua-string-do-supabase" npx prisma db push
DATABASE_URL="sua-string-do-supabase" npx tsx prisma/seed.ts
```

### Passo 6: Acessar! 🎉

Acesse: **https://miac-pindorama.vercel.app**

## 📋 Credenciais de Acesso

| Perfil | Email | Senha |
|--------|-------|-------|
| 👑 Admin | admin@miac.com | admin123 |
| 🔧 Técnico | carlos@miac.com | tecnico123 |
| 🏭 Operador | joao@miac.com | operador123 |

## ⚡ Fluxo de Demonstração

1. **Acesse** como Operador (`joao@miac.com / operador123`)
2. **Abra um chamado** → selecione máquina, descreva o problema
3. **Deslogue** e entre como Técnico (`carlos@miac.com / tecnico123`)
4. **Veja o chamado** aparecer na lista
5. **Assume** o chamado → registre diagnóstico → resolva
6. **Acesse** o Painel TV: `/maintenance/panel` (para mostrar em TV)

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar banco local (SQLite)
npx prisma db push

# Rodar seed (dados de exemplo)
npx tsx prisma/seed.ts

# Iniciar servidor
npm run dev
```

Acesse: http://localhost:3001

## 📁 Rotas do Sistema

| Rota | Descrição |
|------|-----------|
| `/` | Tela inicial com seleção de portal |
| `/operator` | Portal do Operador |
| `/operator/new-ticket` | Abrir novo chamado |
| `/operator/my-tickets` | Meus chamados |
| `/maintenance` | Dashboard da manutenção |
| `/maintenance/tickets` | Lista de chamados |
| `/maintenance/machines` | Máquinas |
| `/maintenance/error-codes` | Códigos de erro |
| `/maintenance/components` | Componentes |
| `/maintenance/parts` | Peças / Estoque |
| `/maintenance/preventive` | Manutenção Preventiva |
| `/maintenance/knowledge` | Base de Conhecimento |
| `/maintenance/reports` | Relatórios |
| `/maintenance/panel` | Painel para TV |
| `/maintenance/users` | Gerenciar usuários (admin) |
| `/login` | Login |

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Prisma ORM, NextAuth.js
- **Banco**: PostgreSQL (Supabase)
- **Deploy**: Vercel
