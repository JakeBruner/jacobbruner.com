mod utils;

// extern crate fixedbitset;
extern crate js_sys;

// use fixedbitset::FixedBitSet;
use wasm_bindgen::prelude::*;

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
    cells: Vec<Cell>, // this will implement std::fmt::Display
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

                let next_cell = match (cell, live_neighbors) {
                    // 1: Any live cell with fewer than two live neighbours dies
                    (Cell::Alive, x) if x < 2 => Cell::Dead,
                    // 2: Any live cell with two or three live neighbours lives on
                    (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    // 3: Any live cell with more than three live neighbours dies
                    (Cell::Alive, x) if x > 3 => Cell::Dead,
                    // 4: Any dead cell with exactly three live neighbours becomes a live cell
                    (Cell::Dead, 3) => Cell::Alive,

                    // All other cells remain in the same state.
                    (otherwise, _) => otherwise,
                };

                next[idx] = next_cell;
            }
        }
        // i forgot this last statement causing me an hour of headache :(
        // its 7pm on a sunday and i'm tired
        self.cells = next;
    }

    pub fn new(width: u32, height: u32, mode: u8, density: f64) -> Universe {
        // * constructor
        // I assume density is inputted even if mode is not 2

        utils::set_panic_hook();
        assert!(mode <= 3, "mode must be between 0 and 2");

        // if mode == 2 {
        //     assert!(density.is_some() && density.unwrap() > 0.0 && density.unwrap() < 1.0);
        // };

        let cells = match mode {
            0 => (0..width * height).map(|_| Cell::Dead).collect(),
            1 => (0..width * height)
                .map(|i| {
                    if i % 2 == 0 || i % 11 == 0 {
                        Cell::Alive
                    } else {
                        Cell::Dead
                    }
                })
                .collect(),
            2 => (0..width * height)
                .map(|_| {
                    if js_sys::Math::random() < density {
                        Cell::Alive
                    } else {
                        Cell::Dead
                    }
                })
                .collect(),
            //* mode 3 is a glider
            3 => {
                let mut temp: Vec<Cell> = (0..width * height).map(|_| Cell::Dead).collect();
                let glider = [(1, 0), (2, 1), (0, 2), (1, 2), (2, 2)];
                // display in middle of screen
                let offset = (width / 2 - 1, height / 2 - 1);

                for (row, col) in glider.iter().cloned() {
                    let idx = Universe::get_index(
                        &Universe {
                            width,
                            height,
                            cells: temp.clone(),
                        },
                        row + offset.0,
                        col + offset.1,
                    );
                    temp[idx] = Cell::Alive;
                }
                temp
            } // this a bit hacky
            _ => (0..width * height).map(|_| Cell::Dead).collect(),
        };

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

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr() // a pointer to the vec
    }
}

// to make this as a string, we implement std::fmt::Display
use std::fmt::Display;
impl Display for Universe {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}
