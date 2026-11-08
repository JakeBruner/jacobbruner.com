use game_of_life::Universe;
#[cfg(target_arch = "wasm32")]
use wasm_bindgen_test::wasm_bindgen_test;

fn universe(width: u32, height: u32, cells: &[(u32, u32)]) -> Universe {
    let mut result = Universe::new(width, height, 0, 0.0);
    result.set_cells(cells);
    result
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
#[cfg_attr(not(target_arch = "wasm32"), test)]
fn spaceship_advances_one_generation() {
    let mut actual = universe(6, 6, &[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)]);
    let expected = universe(6, 6, &[(2, 1), (2, 3), (3, 2), (3, 3), (4, 2)]);
    actual.tick();
    assert_eq!(actual.get_cells(), expected.get_cells());
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
#[cfg_attr(not(target_arch = "wasm32"), test)]
fn glider_translates_after_four_generations() {
    let mut actual = universe(8, 8, &[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)]);
    let expected = universe(8, 8, &[(2, 3), (3, 4), (4, 2), (4, 3), (4, 4)]);
    for _ in 0..4 {
        actual.tick();
    }
    assert_eq!(actual.get_cells(), expected.get_cells());
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
#[cfg_attr(not(target_arch = "wasm32"), test)]
fn block_stays_alive_and_isolated_cell_dies() {
    let mut actual = universe(8, 8, &[(1, 1), (1, 2), (2, 1), (2, 2), (5, 5)]);
    let expected = universe(8, 8, &[(1, 1), (1, 2), (2, 1), (2, 2)]);
    for _ in 0..4 {
        actual.tick();
    }
    assert_eq!(actual.get_cells(), expected.get_cells());
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
#[cfg_attr(not(target_arch = "wasm32"), test)]
fn blinker_wraps_across_the_world_boundary() {
    let mut actual = universe(5, 5, &[(4, 0), (0, 0), (1, 0)]);
    actual.tick();
    assert_eq!(
        actual.get_cells(),
        universe(5, 5, &[(0, 4), (0, 0), (0, 1)]).get_cells()
    );
    actual.tick();
    assert_eq!(
        actual.get_cells(),
        universe(5, 5, &[(4, 0), (0, 0), (1, 0)]).get_cells()
    );
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
#[cfg_attr(not(target_arch = "wasm32"), test)]
fn text_render_preserves_rows_and_each_individual_cell() {
    let actual = universe(5, 2, &[(0, 1), (1, 4)]);
    assert_eq!(actual.render(), "◻◼◻◻◻\n◻◻◻◻◼\n");
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
#[cfg_attr(not(target_arch = "wasm32"), test)]
fn seeds_and_added_gliders_wrap_on_small_boards() {
    for mode in [0, 2, 3, 4] {
        let mut actual = Universe::new(2, 2, mode, 0.5);
        actual.add_glider(u32::MAX, u32::MAX);
        actual.tick();
        assert_eq!(actual.get_cells().len(), 4);
    }
    let mut actual = Universe::new(5, 5, 0, 0.0);
    actual.add_glider(4, 4);
    let expected = universe(5, 5, &[(0, 4), (1, 0), (4, 1), (0, 1), (1, 1)]);
    assert_eq!(actual.get_cells(), expected.get_cells());
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
#[cfg_attr(not(target_arch = "wasm32"), test)]
fn toggling_the_final_partial_byte_cell_changes_only_that_cell() {
    let mut actual = Universe::new(5, 5, 0, 0.0);
    actual.toggle_cell(4, 4);
    assert_eq!(actual.get_cells().ones().collect::<Vec<_>>(), vec![24]);
    actual.toggle_cell(4, 4);
    assert_eq!(actual.get_cells().count_ones(..), 0);
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen_test]
fn random_density_boundaries_are_deterministic() {
    let empty = Universe::new(7, 5, 1, 0.0);
    let full = Universe::new(7, 5, 1, 1.0);
    assert_eq!(empty.get_cells().count_ones(..), 0);
    assert_eq!(full.get_cells().count_ones(..), 35);
}

#[cfg(not(target_arch = "wasm32"))]
#[test]
fn rejects_invalid_dimensions_mode_density_and_coordinates() {
    for (width, height, mode, density) in [
        (0, 5, 0, 0.0),
        (5, 0, 0, 0.0),
        (u32::MAX, 2, 0, 0.0),
        (5, 5, 5, 0.0),
        (5, 5, 0, -0.1),
        (5, 5, 0, 1.1),
        (5, 5, 0, f64::NAN),
        (5, 5, 0, f64::INFINITY),
    ] {
        assert!(std::panic::catch_unwind(|| Universe::new(width, height, mode, density)).is_err());
    }
    for (row, col) in [(5, 0), (0, 5)] {
        assert!(
            std::panic::catch_unwind(|| {
                let mut actual = Universe::new(5, 5, 0, 0.0);
                actual.toggle_cell(row, col);
            })
            .is_err()
        );
    }
}
