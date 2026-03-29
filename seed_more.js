require('dotenv').config({ path: './apps/api/.env' });
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const CATEGORIES = ['comedy', 'music', 'sports', 'workshop', 'festival', 'cinema', 'theatre', 'food', 'art', 'fitness', 'tech', 'business', 'kids', 'nightlife', 'religious', 'travel', 'gaming', 'others'];
const CITIES = ['Pune', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata'];

const templates = {
  comedy: ["Stand-Up Night with %s", "Comedy Riot", "Open Mic Specials", "Laughter Weekend"],
  music: ["Live Concert: %s", "Symphony Strings", "EDM Fest %s", "Jazz Night in the City"],
  sports: ["Cricket League: %s", "Football Derby", "Marathon 10K", "Badminton Championship"],
  workshop: ["Pottery Masterclass", "Tech Coding Bootcamp", "Photography Basics", "Baking Workshop"],
  festival: ["Food Truck Festival", "Music Festival %s", "Cultural Fest", "Winter Carnival"],
  cinema: ["Movie Premiere: %s", "Classic Cinema Screening", "Short Film Fest", "Open Air Movies"],
  theatre: ["Play: The Unknown %s", "Broadway Musical", "Drama: Local Tales", "Improv Night"],
  food: ["Wine Tasting Experience", "Gourmet Dinner %s", "Street Food Walk", "Culinary Masterclass"],
  art: ["Modern Art Exhibition", "Painting Workshop %s", "Sculpture Display", "Art Gallery Opening"],
  fitness: ["Yoga Retreat", "Crossfit Challenge %s", "Zumba Masterclass", "Morning Pilates"],
  tech: ["Tech Startup Mixer", "Web3 Conference %s", "AI Hackathon", "Developer Meetup"],
  business: ["Founders Networking", "Business Marketing Summit", "Investor Pitch Night", "Startup Weekend %s"],
  kids: ["Magic Show", "Kids Carnival", "Puppet Theatre %s", "Storytelling Session"],
  nightlife: ["Techno Party %s", "DJ Night at the Club", "Rooftop Party", "Glow in the Dark Rave"],
  religious: ["Spiritual Retreat", "Satsang %s", "Gospel Evening", "Meditation Circle"],
  travel: ["Heritage Walk %s", "Trekking Expedition", "Camping Night", "City Tour"],
  gaming: ["Esports Tournament %s", "Board Game Mixer", "VR Gaming Experience", "Retro Arcade Night"],
  others: ["Mystery Room Escape", "Speed Dating %s", "Networking Event", "Talent Show"]
};

const venues = {
  stadium: { name: "City Main Stadium", capacity: 5000 },
  office: { name: "Tech Park Auditorium", capacity: 300 },
  theatre: { name: "Royal Opera House", capacity: 800 },
  open_ground: { name: "Exhibition Grounds", capacity: 2000 },
  club: { name: "The High Club", capacity: 400 },
  cafe: { name: "Central Percolate Cafe", capacity: 80 }
};

const venueTypes = Object.keys(venues);

function futureDate(daysFromNow, hour = 19, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const unsplashUrls = [
  'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'
];

async function seedMore() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected to DB.");

  const { rows: organisers } = await client.query('SELECT id FROM organisers');
  if (organisers.length === 0) {
    console.log("No organisers found.");
    process.exit(1);
  }

  const eventsInsert = [];
  const sectionsInsert = [];
  const seatsInsert = [];

  const totalEvents = 40;

  for (let i = 0; i < totalEvents; i++) {
    const orgId = organisers[i % organisers.length].id;
    const cat = CATEGORIES[i % CATEGORIES.length];
    const city = CITIES[i % CITIES.length];
    
    let titleTemplate = templates[cat][i % templates[cat].length];
    if (titleTemplate.includes('%s')) titleTemplate = titleTemplate.replace('%s', `Vol ${i+1}`);
    
    const venueType = venueTypes[i % venueTypes.length];
    const venue = venues[venueType];

    const eventId = uuidv4();
    const daysFromNow = Math.floor(Math.random() * 60) + 1;
    const startsAt = futureDate(daysFromNow, 18, 0);
    const endsAt = futureDate(daysFromNow, 23, 0);
    const poster = unsplashUrls[i % unsplashUrls.length];
    
    eventsInsert.push([
      eventId, orgId, titleTemplate,
      `Join us for an amazing ${cat} event at ${venue.name} in ${city}. Experience something spectacular and memorable.`,
      cat, city, venue.name, `Main Street, ${city}`,
      startsAt, endsAt, poster, 
      'approved', venue.capacity, venue.capacity, Math.random() > 0.7,
      100 + (i*10), 1000 + (i*50), `{${cat}}`
    ]);

    let sectionConfigs;
    if (venueType === 'stadium') {
      sectionConfigs = [ { label: 'VIP Box', count: 50, price: 5000 }, { label: 'Lower Stand', count: 200, price: 1500 }, { label: 'Upper Stand', count: 400, price: 500 } ];
    } else if (venueType === 'office') {
      sectionConfigs = [ { label: 'Premium Desks', count: 50, price: 500 }, { label: 'Standard Rows', count: 100, price: 200 } ];
    } else {
      sectionConfigs = [ { label: 'General Admission', count: Math.min(200, venue.capacity), price: 800 } ];
    }

    for (let c of sectionConfigs) {
      const secId = uuidv4();
      const rows = Math.ceil(Math.sqrt(c.count));
      const cols = Math.ceil(c.count / rows);
      
      sectionsInsert.push([secId, eventId, c.label, c.count, c.count, c.price, rows, cols]);

      let s = 0;
      for (let r = 1; r <= rows; r++) {
        for (let l = 1; l <= cols; l++) {
          if (s >= c.count) break;
          seatsInsert.push([uuidv4(), secId, `${String.fromCharCode(64 + r)}${l}`, 'available', r, l]);
          s++;
        }
      }
    }
  }

  console.log(`Inserting ${eventsInsert.length} events...`);
  for (const e of eventsInsert) {
    await client.query(`
      INSERT INTO events (id, organiser_id, title, description, category, city, venue_name, venue_address, starts_at, ends_at, poster_url, status, total_capacity, available_seats, is_featured, min_price, max_price, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `, e);
  }

  console.log(`Inserting ${sectionsInsert.length} sections...`);
  for (const sec of sectionsInsert) {
    await client.query(`
      INSERT INTO seat_sections (id, event_id, label, total_seats, available_seats, price, row_count, col_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, sec);
  }

  console.log(`Inserting ${seatsInsert.length} seats in batches...`);
  for (let i = 0; i < seatsInsert.length; i += 500) {
    const chunk = seatsInsert.slice(i, i + 500);
    const placeholders = chunk.map((_, idx) => 
      `($${idx*6+1}, $${idx*6+2}, $${idx*6+3}, $${idx*6+4}, $${idx*6+5}, $${idx*6+6})`
    ).join(',');
    const flatParams = chunk.flat();
    await client.query(`
      INSERT INTO seats (id, section_id, label, status, row_number, col_number) 
      VALUES ${placeholders}
    `, flatParams);
  }

  console.log("✅ Seed script added 40 new events and thousands of seats!");
  await client.end();
}

seedMore().catch(err => {
  console.error(err);
  process.exit(1);
});
