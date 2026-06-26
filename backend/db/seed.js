// Populates categories + menu_items with sample data.
// Run with: npm run seed
// Safe to re-run — it skips seeding if categories already exist.
import pool from './pool.js';

const categories = ['Starters', 'Mains', 'Desserts', 'Beverages'];

const menuItems = [
  { category: 'Starters', name: 'Dock Side Tacos', description: 'Three crispy fish tacos, slaw, chipotle crema.', price: 6.5, emoji: '🌮' },
  { category: 'Starters', name: 'Loading Bay Loaded Fries', description: 'Hand-cut fries, cheese sauce, jalapeños, scallion.', price: 5.0, emoji: '🍟' },
  { category: 'Starters', name: 'Convoy Chicken Wings', description: '6 smoky wings, choice of dry rub or glaze.', price: 7.0, emoji: '🍗' },
  { category: 'Mains', name: 'Route 1 Burger', description: 'Double smashed patty, American cheese, pickles, fleet sauce.', price: 9.5, emoji: '🍔' },
  { category: 'Mains', name: 'Cargo Curry Bowl', description: 'Slow-simmered chickpea curry, basmati rice, naan.', price: 8.0, emoji: '🍛' },
  { category: 'Mains', name: 'Highway Pepperoni Pizza', description: '12" stone-baked, mozzarella, pepperoni, oregano oil.', price: 11.0, emoji: '🍕' },
  { category: 'Mains', name: 'Depot Ramen', description: 'Tonkotsu broth, soft egg, scallion, nori, chashu.', price: 10.5, emoji: '🍜' },
  { category: 'Desserts', name: 'Last Mile Lava Cake', description: 'Warm chocolate cake, molten center, vanilla scoop.', price: 5.5, emoji: '🍫' },
  { category: 'Desserts', name: 'Pit Stop Donuts', description: 'Box of 3 glazed cinnamon-sugar mini donuts.', price: 4.0, emoji: '🍩' },
  { category: 'Beverages', name: "Driver's Cold Brew", description: 'Slow-steeped 18-hour cold brew over ice.', price: 3.5, emoji: '🥤' },
  { category: 'Beverages', name: 'Fleet Fresh Lemonade', description: 'Hand-squeezed lemonade, mint sprig.', price: 3.0, emoji: '🍋' },
];

const restaurants = [
  { name: 'The Green Bowl', cuisine: 'Healthy Salad / Bowls', rating: 4.6, delivery_time: 25, is_veg: 1, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Spicy Route', cuisine: 'North Indian / Curry', rating: 4.3, delivery_time: 35, is_veg: 0, image_url: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?auto=format&fit=crop&w=600&q=80' },
  { name: 'Burger Dock', cuisine: 'American / Burgers', rating: 4.5, delivery_time: 20, is_veg: 0, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Veggie Delight', cuisine: 'Pure Veg / South Indian', rating: 4.4, delivery_time: 30, is_veg: 1, image_url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80' },
];

async function seed() {
  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query('SELECT COUNT(*) AS count FROM categories');
    if (existing[0].count > 0) {
      console.log('Categories already exist — skipping categories and menu items seed. Delete rows manually if you want to reseed.');
    } else {
      const categoryIds = {};
      for (let i = 0; i < categories.length; i += 1) {
        const [result] = await conn.query(
          'INSERT INTO categories (name, sort_order) VALUES (?, ?)',
          [categories[i], i]
        );
        categoryIds[categories[i]] = result.insertId;
      }

      for (const item of menuItems) {
        await conn.query(
          `INSERT INTO menu_items (category_id, name, description, price, emoji)
           VALUES (?, ?, ?, ?, ?)`,
          [categoryIds[item.category], item.name, item.description, item.price, item.emoji]
        );
      }

      console.log(`Seeded ${categories.length} categories and ${menuItems.length} menu items.`);
    }

    const [existingRestaurants] = await conn.query('SELECT COUNT(*) AS count FROM restaurants');
    if (existingRestaurants[0].count > 0) {
      console.log('Restaurants already exist — skipping restaurants seed.');
    } else {
      for (const rest of restaurants) {
        await conn.query(
          `INSERT INTO restaurants (name, cuisine, rating, delivery_time_min, delivery_time_max, is_veg, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [rest.name, rest.cuisine, rest.rating, rest.delivery_time, rest.delivery_time + 10, rest.is_veg, rest.image_url]
        );
      }
      console.log(`Seeded ${restaurants.length} restaurants.`);
    }
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
