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

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

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
    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count: u8 = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            // deep copy an iterator
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    // skip the current cell
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height; // no overflow if > height
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                // this seems unnecessarily verbose...
                count += self.cells[idx] as u8;
            }
        }

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
        // * constructor
        // I assume density is inputted even if mode is not 2

        let size = (width * height) as usize;
        let mut cells = FixedBitSet::with_capacity(size);

        utils::set_panic_hook();
        assert!(mode <= 4, "mode must be between 0 and 4");

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
                    cells.set(i, i % 2 == 0 || i % 7 == 0);
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

        // let cells = match mode {
        //     0 => (0..width * height).map(|_| Cell::Dead).collect(),
        //     1 => (0..width * height)
        //         .map(|i| {
        //             if i % 2 == 0 || i % 11 == 0 {
        //                 Cell::Alive
        //             } else {
        //                 Cell::Dead
        //             }
        //         })
        //         .collect(),
        //     2 => (0..width * height)
        //         .map(|_| {
        //             if js_sys::Math::random() < density {
        //                 Cell::Alive
        //             } else {
        //                 Cell::Dead
        //             }
        //         })
        //         .collect(),
        //     //* mode 3 is a glider
        //     3 => {
        //         let mut temp: Vec<Cell> = (0..width * height).map(|_| Cell::Dead).collect();
        //         let glider = [(1, 0), (2, 1), (0, 2), (1, 2), (2, 2)];
        //         // display in middle of screen
        //         let offset = (width / 2 - 1, height / 2 - 1);

        //         for (row, col) in glider.iter().cloned() {
        //             let idx = Universe::get_index(
        //                 &Universe {
        //                     width,
        //                     height,
        //                     cells: temp.clone(),
        //                 },
        //                 row + offset.0,
        //                 col + offset.1,
        //             );
        //             temp[idx] = Cell::Alive;
        //         }
        //         temp
        //     } // this a bit hacky
        //     _ => (0..width * height).map(|_| Cell::Dead).collect(),
        // };

        // // glider

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
