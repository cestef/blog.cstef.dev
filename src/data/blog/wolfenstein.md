---
title: Rewriting Wolfenstein 3D in Rust
tags: [rust, game-dev, wolfenstein]
description: A review of my poorly rewritten Wolfenstein 3D clone in Rust.
date: 2024-08-30
growth: seed
---

I recently came accross [this video](https://www.youtube.com/watch?v=wsADJa-23Sg) explaining how Wolfenstein 3D killed the Amiga console (why am I watching this I wasn't even born!), this reminded me how simple game graphics were back in the days. And here I am, trying to rewrite Wolfenstein 3D in Rust.

## The Plan

Wolfenstein 3D is a... well, 3D game. It's a first-person shooter that uses raycasting to render the world. The game was released in 1992 and was a huge success, setting the standard for first-person shooters for years to come. The funny thing is that even though the game is 3D, it's actually rendered using 2D calculations. This is where raycasting comes in.

We needed the following components to get started:

- A representation of the game world
- A way to render the world using raycasting
- Movement controls for the player

## The Implementation

I used the amazing [`pixels`](https://crates.io/crates/pixels) crate to handle the window and rendering. The crate provides a simple API for creating a window and drawing pixels to it. It's perfect for simple games like this one.

We start by defining various structs to define the world map and the player. The world map is a 2D array of integers, where each integer represents a different type of tile (wall, floor, etc.).

```rust
// Game state
struct World {
    speed: f32,
    rotation_speed: f32,
    x: f32, // Player position
    y: f32,
    theta: f32, // Player rotation
    fov: f32,
    textures: Vec<Vec<Vec<u8>>>, // Textures for walls, 3D vec ?!
}

// Define all the base components of our game handler
struct Game {
    pub pixels: Pixels, // pixel framework
    pub world: Arc<Mutex<World>>,
    pub controls: Controls, // Helper struct to set bool flags
    pub input: WinitInputHelper,
    pub paused: bool,
    pub framework: Framework, // egui stuff
}
```

We then have a chonky 2D array of unsigned integers for our map:

```rust
pub const MAP: [[u8; MAP_WIDTH]; MAP_HEIGHT] = [
    [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ],
    [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    ],
    [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    ],
    [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    ],
    [
        1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 1,
    ],
    // ...
];
```

We can now start... raycasting!

## Raycasting

Each frame, we need to shoot `n` rays within the player's FOV (field of view) and check what type of wall each of these hit. In our game loop's `draw(){:rs}` function, we start out by clearing the current frame to avoid keeping old pixels that have not been overwritten by the current rays.

```rust
fn draw(&self, frame: &mut [u8]) {
    clear_frame(frame, BLACK); // Basically just paint the whole frame black
    self.draw_rays(frame); // This is where it gets interesting
}
```

Our `draw_rays(){:rs}` function starts by computing the number of rays we will need to shoot to get enough information for each pixel on the screen. 

But wait, here's the twist! We only need to shoot horizontal rays, as we can infer the vertical rays from the horizontal ones. This is because the world map is a grid, and we can calculate the vertical intersection points based on the horizontal ones, huge optimization!

```rust
let theta_step = self.fov / WIDTH as f32;

for i in 0..WIDTH {
    // Current ray angle
    let current_angle = self.theta + 
        (i as f32 - WIDTH as f32 / 2.0) * theta_step.to_radians();
    if let Some((column, hit, side)) = self.ray_hits(current_angle) {
        // Our ray hit something !
    }
}
```

In our case, the `ray_hits(){:rs}` function is an implementation of the Digital Differential Analyzer (DDA) algorithm, which is very simple yet powerful for raycasting.

```rust
fn ray_hits(&self, start: Point2, angle: f32) -> Option<(Vec<Vec<u8>>, Point2, u32)> {
    // Coordinates of the ray
    let mut x = start.x;
    let mut y = start.y;
    // See, primary school math is useful!
    let (dx, dy) = angle.sin_cos();
    // Length of the ray from one x/y side to the next one
    let delta_dist_x = (1.0 / dx).abs();
    let delta_dist_y = (1.0 / dy).abs();

    let mut side = 0;
    // Used to determine whether we will hit on the x axis or on the y one first
    let (mut step_x, mut side_dist_x) = if dx < 0.0 {
        // We are moving backwards on the x axis
        // Compute the distance of x to the next integer value
        (-1, (x - (x as i32 as f32)) * delta_dist_x)
        // Double cast is just a fancy way of removing the decimal part
    } else {
        (1, ((x as i32 as f32) + 1.0 - x) * delta_dist_x)
    };
    // Same thing for y
    let (mut step_y, mut side_dist_y) = if dy < 0.0 {
        (-1, (y - (y as i32 as f32)) * delta_dist_y)
    } else {
        (1, ((y as i32 as f32) + 1.0 - y) * delta_dist_y)
    };

    let mut hit = None;
    while hit.is_none() {
        if side_dist_x < side_dist_y {
            // We will hit on the x axis first
            side_dist_x += delta_dist_x;
            // Move the ray on the x axis
            x += step_x as f32;
            side = 0;
        } else {
            // Same for y
            side_dist_y += delta_dist_y;
            y += step_y as f32;
            side = 1;
        }

        // Get the current map coordinates
        let map_x = (x / (WIDTH as f32 / MAP_WIDTH as f32)).floor() as usize;
        let map_y = (y / (HEIGHT as f32 / MAP_HEIGHT as f32)).floor() as usize;

        if map_x >= MAP_WIDTH || map_y >= MAP_HEIGHT {
            // We are out of bounds
            return None;
        }
        if MAP[map_y][map_x] != 0 {
            // We hit something
            let texture = self.textures[MAP[map_y][map_x] as usize - 1].clone();
            // Lookup the texture for the current wall texture ID
            hit = Some((texture, Point2::new(x, y), side));
        }
    }
    hit
}
```

```pikchr
# Define grid dimensions
grid_size = 3
cell_size = 1in

# Draw horizontal lines
line from (0, 0) to (3*cell_size, 0)
line from (0, cell_size) to (3*cell_size, cell_size)
line from (0, 2*cell_size) to (3*cell_size, 2*cell_size)
line from (0, 3*cell_size) to (3*cell_size, 3*cell_size)

# Draw vertical lines
line from (0, 0) to (0, 3*cell_size)
line from (cell_size, 0) to (cell_size, 3*cell_size)
line from (2*cell_size, 0) to (2*cell_size, 3*cell_size)
line from (3*cell_size, 0) to (3*cell_size, 3*cell_size)

# DDA Algorithm Representation
# Start point (0.3, 0.7), End point (2.7, 2.3)
circle at (0.3*cell_size, 2.3*cell_size) radius 0.1*cell_size fill red
circle at (1.1*cell_size, 1.7*cell_size) radius 0.1*cell_size fill red
circle at (1.9*cell_size, 1.1*cell_size) radius 0.1*cell_size fill red
circle at (2.7*cell_size, 0.7*cell_size) radius 0.1*cell_size fill red

# Ideal line
line from (0.3*cell_size, 2.3*cell_size) to (2.7*cell_size, 0.7*cell_size) color blue

# Start and end points
dot at (0.3*cell_size, 2.3*cell_size) color green
dot at (2.7*cell_size, 0.7*cell_size) color green

```