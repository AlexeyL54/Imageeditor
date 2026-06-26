# Image Editor

Редактор изображений на Rust, WASM и React.

## Зависимости

- Rust 1.85+
- wasm-pack 0.13+
- Node.js 20+
- npm 10+

## Сборка

```bash
# Сборка WASM-модуля
wasm-pack build --target web

# Установка зависимостей React
cd web
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## Структура

- `src/lib.rs` — реализация фильтров на Rust
- `web/src/` — React-приложение
- `pkg/` — скомпилированный WASM-модуль

## Фильтры

- grayscale — ч/б
- invert — негатив
- sepia — сепия
- brightness — яркость
