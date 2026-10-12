# TASKFLOW — Plan Smarter. Get Things Done.

TASKFLOW — это современный полнофункциональный SaaS для управления проектами и задачами, построенный по принципам **premium light minimalism**.

---

## 🎨 Дизайн и стилистика

- **Основной фон**: `#F8F9FC`
- **Карточки и поверхности**: `#FFFFFF`
- **Основной текст**: `#202334`
- **Вторичный текст**: `#777D91`
- **Акцентный фиолетовый**: `#6C63FF`
- **Светло-фиолетовый**: `#EFEDFF`
- **Успех**: `#10B981`
- **Ошибки / Дедлайны**: `#EF4444`

---

## 🚀 Технологический стек

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4
- **State & Server Cache**: TanStack Query (React Query)
- **Forms & Validation**: React Hook Form + Zod
- **Drag & Drop Kanban**: `@hello-pangea/dnd`
- **Icons**: Lucide React
- **Backend / Database**: Supabase PostgreSQL + Supabase Auth + Row Level Security (RLS)
- **Testing**: Vitest + React Testing Library + jsdom

---

## 📁 Архитектура проекта

```text
src/
├── components/          # Reusable UI (Button, Input, Select, Dialog, Toast, Badge, Sidebar, Header, etc.)
├── features/
│   ├── auth/            # AuthContext, ProtectedRoute, Supabase Auth
│   ├── dashboard/       # StatCard, Dashboard metrics
│   ├── projects/        # useProjects, ProjectCard, membership management
│   └── tasks/           # useTasks, TaskCard, TaskForm, TaskFilters, KanbanColumn
├── pages/               # Route views (Login, Register, Dashboard, Tasks, Board, Projects, Analytics, Settings)
├── lib/                 # Supabase client configuration
├── types/               # TypeScript models (Project, Task, Profile, Priority, Status)
└── test/                # Test setup and mocks
supabase/
└── migrations/          # 001_initial_schema.sql (RLS, triggers, foreign keys, indexes)
```

---

## ⚙️ Установка и запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Создайте файл `.env` на основе `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Примечание:** Если вы хотите быстро протестировать интерфейс локально без настройки проекта в Supabase, приложение автоматически активирует **Sandbox Demo Mode**. Вы также можете нажать кнопку *"Launch Instant Demo Sandbox"* на странице логина для мгновенного входа с готовыми демонстрационными проектами и задачами!

### 3. Запуск dev-сервера
```bash
npm run dev
```

### 4. Тесты и production сборка
```bash
npm run test     # Запуск Vitest (unit & validation)
npm run build    # Проверка TypeScript типов и сборка бандла
```

---

## 🔐 Настройка Supabase базы данных и RLS

В папке `supabase/migrations/001_initial_schema.sql` подготовлен полный SQL-скрипт. Для применения:

1. Откройте **Supabase Dashboard** -> **SQL Editor**.
2. Вставьте содержимое файла `supabase/migrations/001_initial_schema.sql` и нажмите **Run**.
3. Скрипт создаст:
   - Таблицы `profiles`, `projects`, `project_members`, `tasks`.
   - Триггер `on_auth_user_created` (автоматическое создание профиля при регистрации через Supabase Auth).
   - Триггер `handle_task_completion` (автоматическая установка `completed_at` при переводе задачи в статус `done`).
   - Триггеры обновления `updated_at`.
   - **Row Level Security (RLS)** политики:
     - Профили: чтение доступно авторизованным пользователям, редактирование — только владельцу своего профиля.
     - Проекты: создание, просмотр, редактирование и удаление строго ограничены владельцем и приглашенными участниками (`project_members`).
     - Задачи: создание, перемещение и удаление разрешены только создателям задач либо участникам соответствующих проектов.
