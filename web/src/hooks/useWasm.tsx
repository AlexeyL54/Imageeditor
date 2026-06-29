import { useState, useEffect, useRef } from 'react';

export function useWasm() {
  const [isReady, setIsReady] = useState(false);
  const wasmRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const memoryRef = useRef<WebAssembly.Memory | null>(null);

  // Загрузка WASM
  useEffect(() => {
    async function load() {
      try {
        // Импортируем модуль
        const module = await import('../../../pkg/imageeditor');

        // Сохраняем ссылку на модуль
        wasmRef.current = module;

        const wasmInstance = await module.default();

        // Сохраняем память из экземпляра
        memoryRef.current = wasmInstance.memory;

        setIsReady(true);
      } catch (err) {
        console.error('Ошибка загрузки WASM:', err);
      }
    }
    load();
  }, []);

  // Загрузка картинки
  const loadImage = (imageData: ImageData) => {
    if (!wasmRef.current) {
      console.error('WASM не загружен');
      return;
    }

    const { ImageData } = wasmRef.current;
    imageRef.current = new ImageData(
      new Uint8Array(imageData.data.buffer),
      imageData.width,
      imageData.height
    );
    return imageRef.current;
  };

  // Применить фильтр
  const applyFilter = (name: string, param?: number) => {
    if (!imageRef.current) {
      console.warn('Нет изображения в WASM');
      return;
    }

    try {
      switch (name) {
        case 'grayscale':
          imageRef.current.grayscale();
          console.log('  → grayscale выполнен');
          break;
        case 'invert':
          imageRef.current.invert();
          console.log('  → invert выполнен');
          break;
        case 'sepia':
          imageRef.current.sepia();
          console.log('  → sepia выполнен');
          break;
        case 'brightness':
          imageRef.current.brightness(param || 30);
          console.log('  → brightness выполнен');
          break;
        default:
          console.warn(`Неизвестный фильтр: ${name}`);
      }
    } catch (err) {
      console.error('Ошибка при применении фильтра:', err);
    }
  };

  // Получить данные для отображения
  const getData = () => {
    if (!imageRef.current || !wasmRef.current) {
      console.warn('WASM или изображение не готовы');
      return null;
    }

    // Проверяем, что память у нас есть
    if (!memoryRef.current) {
      console.error('Нет доступа к памяти WASM');
      return null;
    }

    try {
      const ptr = imageRef.current.get_data_ptr();
      const len = imageRef.current.get_data_len();

      if (len === 0) {
        console.warn('Длина данных = 0!');
        return null;
      }

      // Используем сохранённую память
      const buffer = new Uint8Array(memoryRef.current.buffer, ptr, len);
      const result = new Uint8ClampedArray(buffer);

      return result;
    } catch (err) {
      console.error('Ошибка чтения данных:', err);
      return null;
    }
  };

  return { isReady, loadImage, applyFilter, getData };
}
