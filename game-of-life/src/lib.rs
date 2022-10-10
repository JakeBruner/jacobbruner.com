mod utils;

// extern crate fixedbitset;
extern crate js_sys;

use fixedbitset::FixedBitSet;
// use fixedbitset::FixedBitSet;
use wasm_bindgen::prelude::*;

// how to raise error
// https://rustwasm.github.io/docs/wasm-bindgen/reference/throwing-and-catching-exceptions.html

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[allow(unused)]
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// extern crate web_sys;
// macro_rules! console_log {
//     ($($t:tt)*) => (web_sys::console::log_1(&format_args!($($t)*).to_string().into()))
// }

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

// impl Cell {
//     fn toggle(&mut self) {
//         *self = match *self {
//             Cell::Dead => Cell::Alive,
//             Cell::Alive => Cell::Dead,
//         };
//     }
// }

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: FixedBitSet, // this will implement std::fmt::Display
}

impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    } // formula for the index after 'array'ifying the matrix

    //* primary GOL functionality
    // fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
    //     let mut count: u8 = 0;
    //     for delta_row in [self.height - 1, 0, 1].iter().cloned() {
    //         // deep copy an iterator
    //         for delta_col in [self.width - 1, 0, 1].iter().cloned() {
    //             if delta_row == 0 && delta_col == 0 {
    //                 // skip the current cell
    //                 continue;
    //             }

    //             let neighbor_row = (row + delta_row) % self.height; // no overflow if > height
    //             let neighbor_col = (column + delta_col) % self.width;
    //             let idx = self.get_index(neighbor_row, neighbor_col);
    //             // this seems unnecessarily verbose...
    //             count += self.cells[idx] as u8;
    //         }
    //     }

    //     count
    // }
    //* a more performant implementation since % is expensive
    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;

        let north = if row == 0 { self.height - 1 } else { row - 1 };

        let south = if row == self.height - 1 { 0 } else { row + 1 };

        let west = if column == 0 {
            self.width - 1
        } else {
            column - 1
        };

        let east = if column == self.width - 1 {
            0
        } else {
            column + 1
        };

        let nw = self.get_index(north, west);
        count += self.cells[nw] as u8;

        let n = self.get_index(north, column);
        count += self.cells[n] as u8;

        let ne = self.get_index(north, east);
        count += self.cells[ne] as u8;

        let w = self.get_index(row, west);
        count += self.cells[w] as u8;

        let e = self.get_index(row, east);
        count += self.cells[e] as u8;

        let sw = self.get_index(south, west);
        count += self.cells[sw] as u8;

        let s = self.get_index(south, column);
        count += self.cells[s] as u8;

        let se = self.get_index(south, east);
        count += self.cells[se] as u8;

        count
    }
}

// public JS
#[wasm_bindgen]
impl Universe {
    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbor_count(row, col);
                next.set(
                    idx,
                    match (cell, live_neighbors) {
                        (true, x) if x < 2 => false,
                        (true, 2) | (true, 3) => true,
                        (true, x) if x > 3 => false,
                        (false, 3) => true,
                        (otherwise, _) => otherwise,
                    },
                );
            }
        }
        // i forgot this last statement causing me an hour of headache :(
        // its 7pm on a sunday and i'm tired
        self.cells = next;
    }

    pub fn new(width: u32, height: u32, mode: u8, density: f64) -> Universe {
        utils::set_panic_hook();
        // * constructor
        // I assume density is inputted even if mode is not 2

        let size = (width * height) as usize;
        let mut cells = FixedBitSet::with_capacity(size);

        assert!(mode <= 4, "mode must be between 0 and 4");
        assert!(density <= 1.0, "density must be between 0 and 1");

        // if mode == 2 {
        //     assert!(density.is_some() && density.unwrap() > 0.0 && density.unwrap() < 1.0);
        // };

        //* macro to update the entire array
        // for (row, col) in glider.iter().cloned() {
        //     let idx = Universe::get_index(&Universe { width, height, cells: cells.clone() }, row, col);
        //     cells.set(idx, true);
        // }
        // macro_rules! set_cells {
        //     ($cells:expr, $pattern:expr) => {
        //         for (row, col) in $pattern.iter().cloned() {
        //             let idx = Universe::get_index(
        //                 &Universe {
        //                     width,
        //                     height,
        //                     cells: $cells.clone(),
        //                 }, // in the middle of the scene
        //                 row + height / 2,
        //                 col + width / 2,
        //             );
        //             $cells.set(idx, true);
        //         }
        //     };
        // }

        match mode {
            0 => {
                // empty
                for i in 0..size {
                    cells.set(i, false);
                }
            }
            1 => {
                // random
                for i in 0..size {
                    cells.set(i, js_sys::Math::random() < density);
                }
            }
            2 => {
                // math generated
                // if congruent to 0 mod 2 or mod 7, then alive
                for i in 0..size {
                    cells.set(i, i % 3 == 0 || i % 11 == 0);
                }
            }
            3 => {
                // glider
                let glider = [(1, 0), (2, 1), (0, 2), (1, 2), (2, 2)];

                for (row, col) in glider.iter().cloned() {
                    let idx = Universe::get_index(
                        &Universe {
                            width,
                            height,
                            cells: cells.clone(),
                        }, // in the middle of the scene
                        row + height / 2,
                        col + width / 2,
                    );
                    cells.set(idx, true);
                }
            }
            4 => {
                // glider gun
                let gun = [
                    (1, 25),
                    (2, 23),
                    (2, 25),
                    (3, 13),
                    (3, 14),
                    (3, 21),
                    (3, 22),
                    (3, 35),
                    (3, 36),
                    (4, 12),
                    (4, 16),
                    (4, 21),
                    (4, 22),
                    (4, 35),
                    (4, 36),
                    (5, 1),
                    (5, 2),
                    (5, 11),
                    (5, 17),
                    (5, 21),
                    (5, 22),
                    (6, 1),
                    (6, 2),
                    (6, 11),
                    (6, 15),
                    (6, 17),
                    (6, 18),
                    (6, 23),
                    (6, 25),
                    (7, 11),
                    (7, 17),
                    (7, 25),
                    (8, 12),
                    (8, 16),
                    (9, 13),
                    (9, 14),
                ];

                for (row, col) in gun.iter().cloned() {
                    let idx = Universe::get_index(
                        &Universe {
                            width,
                            height,
                            cells: cells.clone(),
                        }, // in the middle of the scene
                        row,
                        col,
                    );
                    cells.set(idx, true);
                }
            }
            _ => {
                // empty
                for i in 0..size {
                    cells.set(i, false);
                }
            }
        }

        Universe {
            width,
            height,
            cells,
        }
    }

    pub fn render(&self) -> String {
        self.to_string() // our Display trait below
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const u32 {
        self.cells.as_slice().as_ptr() // a pointer to the vec
    }

    // pub fn set_width(&mut self, width: u32) {
    //     self.width = width;
    //     self.cells = FixedBitSet::with_capacity((width * self.height) as usize);
    // }

    // pub fn set_height(&mut self, height: u32) {
    //     self.height = height;
    //     self.cells = FixedBitSet::with_capacity((self.width * height) as usize);
    // }

    pub fn toggle_cell(&mut self, row: u32, col: u32) {
        // assert!(row < self.height && col < self.width);
        let idx = self.get_index(row, col);
        self.cells.toggle(idx);
    }

    pub fn add_glider(&mut self, inrow: u32, incol: u32) {
        let glider = [(1, 0), (2, 1), (0, 2), (1, 2), (2, 2)];

        for (row, col) in glider.iter().cloned() {
            let idx = self.get_index(row + inrow, col + incol);
            self.cells.set(idx, true);
        }
    }

    // pub fn add_gun(&mut self, inrow: u32, incol: u32) {
    //     let gun = [
    //         (1, 25),
    //         (2, 23),
    //         (2, 25),
    //         (3, 13),
    //         (3, 14),
    //         (3, 21),
    //         (3, 22),
    //         (3, 35),
    //         (3, 36),
    //         (4, 12),
    //         (4, 16),
    //         (4, 21),
    //         (4, 22),
    //         (4, 35),
    //         (4, 36),
    //         (5, 1),
    //         (5, 2),
    //         (5, 11),
    //         (5, 17),
    //         (5, 21),
    //         (5, 22),
    //         (6, 1),
    //         (6, 2),
    //         (6, 11),
    //         (6, 15),
    //         (6, 17),
    //         (6, 18),
    //         (6, 23),
    //         (6, 25),
    //         (7, 11),
    //         (7, 17),
    //         (7, 25),
    //         (8, 12),
    //         (8, 16),
    //         (9, 13),
    //         (9, 14),
    //     ];

    //     for (row, col) in gun.iter().cloned() {
    //         let idx = self.get_index(row + inrow, col + incol);
    //         self.cells.set(idx, true);
    //     }
    // }
}

// private methods
impl Universe {
    pub fn get_cells(&self) -> &FixedBitSet {
        &self.cells
    }

    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = Universe::get_index(self, row, col);
            self.cells.set(idx, true);
        }
    }
}

// to make this as a string, we implement std::fmt::Display
use std::fmt::Display;
impl Display for Universe {
    // fixed bit size
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == 0 { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
