//! Этот модуль содержит утилиты для работы с изображениями.

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
/// Информация об изображении
pub struct ImageData {
    data: Vec<u8>,
    width: u32,
    height: u32,
}

#[wasm_bindgen]
impl ImageData {
    #[wasm_bindgen(constructor)]
    pub fn new(data: Vec<u8>, width: u32, height: u32) -> Self {
        Self { data, width, height }
    }

    /// Конвертировать изображение в черно белое
    pub fn grayscale(&mut self) {
        for chunk in self.data.chunks_mut(4) {
            let r = chunk[0] as f32;
            let g = chunk[1] as f32;
            let b = chunk[2] as f32;
            let gray = (0.299 * r + 0.587 * g + 0.114 * b) as u8;
            chunk[0] = gray;
            chunk[1] = gray;
            chunk[2] = gray;
        }
    }

    /// Инвертировать цвета (негатив)
    pub fn invert(&mut self) {
        for chunk in self.data.chunks_mut(4) {
            chunk[0] = 255 - chunk[0];
            chunk[1] = 255 - chunk[1];
            chunk[2] = 255 - chunk[2];
        }
    }

    /// Изменить яркость
    pub fn brightness(&mut self, delta: i32) {
        for chunk in self.data.chunks_mut(4) {
            chunk[0] = (chunk[0] as i32 + delta).clamp(0, 255) as u8;
            chunk[1] = (chunk[1] as i32 + delta).clamp(0, 255) as u8;
            chunk[2] = (chunk[2] as i32 + delta).clamp(0, 255) as u8;
        }
    }

    /// Применить эффект "сепия"
    pub fn sepia(&mut self) {
        for chunk in self.data.chunks_mut(4) {
            let r = chunk[0] as f32;
            let g = chunk[1] as f32;
            let b = chunk[2] as f32;
            chunk[0] = (0.393 * r + 0.769 * g + 0.189 * b).clamp(0.0, 255.0) as u8;
            chunk[1] = (0.349 * r + 0.686 * g + 0.168 * b).clamp(0.0, 255.0) as u8;
            chunk[2] = (0.272 * r + 0.534 * g + 0.131 * b).clamp(0.0, 255.0) as u8;
        }
    }

    /// Геттер указателя на вектор пикселей
    pub fn get_data_ptr(&self) -> *const u8 {
        return self.data.as_ptr();
    }

    /// Геттер ширины изображения
    pub fn get_width(&self) -> u32 {
        return self.width;
    }

    /// Геттер высоты изображения
    pub fn get_height(&self) -> u32 {
        return self.height;
    }

    pub fn get_data_len(&self) -> usize {
        return self.data.len();
    }
}
