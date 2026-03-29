require('dotenv').config({ path: './apps/api/.env' });
const { Client } = require('pg');

function futureDate(daysFromNow, hour = 19, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

async function seed() {
  if (!process.env.DATABASE_URL) throw new Error("No DATABASE_URL found");

  console.log("🌱 Connecting to database...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
  console.log("✅ Connected!\n");

  try {
    // ─── Clean existing data ─────────────────────────────────────
    console.log("🧹 Cleaning existing data...");
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM admin_logs');
    await client.query('DELETE FROM reviews');
    await client.query('DELETE FROM payments');
    await client.query('DELETE FROM bookings');
    await client.query('DELETE FROM seats');
    await client.query('DELETE FROM seat_sections');
    await client.query('DELETE FROM events');
    await client.query('DELETE FROM file_uploads');
    await client.query('DELETE FROM organisers');
    await client.query('DELETE FROM users');
    console.log("   Done.\n");

    // ─── 1. USERS ────────────────────────────────────────────────
    console.log("👤 Creating users...");
    const users = [
      ['a0000000-0000-0000-0000-000000000001', '+919876543210', 'Raj Chauhan',    'raj@bookit.in',    'Pune',      'admin',     500],
      ['a0000000-0000-0000-0000-000000000002', '+919876543211', 'Priya Sharma',   'priya@events.in',  'Pune',      'organiser', 200],
      ['a0000000-0000-0000-0000-000000000003', '+919876543212', 'Amit Deshmukh',  'amit@events.in',   'Mumbai',    'organiser', 150],
      ['a0000000-0000-0000-0000-000000000004', '+919876543213', 'Sneha Kulkarni', 'sneha@gmail.com',  'Pune',      'customer',  80],
      ['a0000000-0000-0000-0000-000000000005', '+919876543214', 'Vikram Patil',   'vikram@gmail.com', 'Pune',      'customer',  120],
      ['a0000000-0000-0000-0000-000000000006', '+919876543215', 'Ananya Joshi',   'ananya@gmail.com', 'Mumbai',    'customer',  45],
      ['a0000000-0000-0000-0000-000000000007', '+919876543216', 'Rohan Mehta',    'rohan@gmail.com',  'Pune',      'customer',  200],
      ['a0000000-0000-0000-0000-000000000008', '+919876543217', 'Kavita Nair',    'kavita@events.in', 'Bangalore', 'organiser', 300],
      ['a0000000-0000-0000-0000-000000000009', '+919876543218', 'Deepak Gupta',   'deepak@gmail.com', 'Pune',      'customer',  60],
      ['a0000000-0000-0000-0000-000000000010', '+919876543219', 'Meera Reddy',    'meera@gmail.com',  'Mumbai',    'customer',  90],
    ];
    for (const u of users) {
      await client.query(
        'INSERT INTO users (id, phone, name, email, city, role, loyalty_coins) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        u
      );
      console.log(`   ✅ ${u[5]}: ${u[2]}`);
    }

    // ─── 2. ORGANISERS ───────────────────────────────────────────
    console.log("\n🏢 Creating organisers...");
    const orgs = [
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        user_id: 'a0000000-0000-0000-0000-000000000002',
        business_name: 'Pune Comedy Club',
        gstin: '27AABCU9603R1ZP', bank_account: '123456789012', bank_ifsc: 'SBIN0001234',
        verified: true, commission_rate: 8.00,
        description: 'Pune\'s #1 comedy venue bringing you the best stand-up acts from across India. From open mics to headliner shows.',
        website: 'https://punecomedyclub.in', phone: '+919876543211', city: 'Pune',
        logo_url: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=200',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        user_id: 'a0000000-0000-0000-0000-000000000003',
        business_name: 'Mumbai Live Events',
        gstin: '27AABCU9603R1ZQ', bank_account: '987654321012', bank_ifsc: 'HDFC0001234',
        verified: true, commission_rate: 7.50,
        description: 'Premium live entertainment across Mumbai. Concerts, theatre, immersive experiences and more.',
        website: 'https://mumbailive.in', phone: '+919876543212', city: 'Mumbai',
        logo_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000003',
        user_id: 'a0000000-0000-0000-0000-000000000008',
        business_name: 'Bangalore Arts Collective',
        gstin: '29AABCU9603R1ZR', bank_account: '456789012345', bank_ifsc: 'ICIC0001234',
        verified: false, commission_rate: 8.00,
        description: 'Curating art exhibitions, workshops and cultural experiences in Bangalore.',
        website: 'https://blrarts.in', phone: '+919876543217', city: 'Bangalore',
        logo_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=200',
      },
    ];
    for (const o of orgs) {
      await client.query(
        `INSERT INTO organisers (id, user_id, business_name, gstin, bank_account, bank_ifsc, verified, commission_rate, description, website, phone, city, logo_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [o.id, o.user_id, o.business_name, o.gstin, o.bank_account, o.bank_ifsc, o.verified, o.commission_rate, o.description, o.website, o.phone, o.city, o.logo_url]
      );
      console.log(`   ✅ ${o.business_name} (verified: ${o.verified})`);
    }

    // ─── 3. EVENTS ───────────────────────────────────────────────
    console.log("\n🎪 Creating events...");
    const events = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        organiser_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Laugh Riot: Stand-Up Comedy Night',
        description: 'Get ready for an evening of non-stop laughter! Join India\'s top comedians — Biswa Kalyan Rath, Abhishek Upmanyu & Comicstaan finalists — for 3 hours of hilarious stand-up comedy. Includes open mic segment where YOU can try your hand at comedy! Food and drinks available at the venue.',
        category: 'comedy', city: 'Pune',
        venue_name: 'Mahalaxmi Lawns', venue_address: 'Near Aga Khan Palace, Nagar Road, Pune 411006',
        starts_at: futureDate(3, 19, 0), ends_at: futureDate(3, 22, 0),
        poster_url: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800',
        status: 'approved', total_capacity: 500, available_seats: 420,
        min_price: 299, max_price: 1499, is_featured: true,
        tags: ['comedy', 'standup', 'live', 'weekend'],
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        organiser_id: 'b0000000-0000-0000-0000-000000000002',
        title: 'Arijit Singh Live in Concert',
        description: 'Experience the magic of Arijit Singh LIVE! The voice behind Tum Hi Ho, Channa Mereya and countless Bollywood hits performs his greatest songs with a 20-piece orchestra. An unforgettable evening of soulful music under the stars. Gates open at 5 PM.',
        category: 'music', city: 'Mumbai',
        venue_name: 'Jio World Garden', venue_address: 'BKC, Bandra Kurla Complex, Mumbai 400098',
        starts_at: futureDate(7, 18, 0), ends_at: futureDate(7, 23, 30),
        poster_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        status: 'approved', total_capacity: 2000, available_seats: 1650,
        min_price: 999, max_price: 7999, is_featured: true,
        tags: ['music', 'bollywood', 'concert', 'arijit'],
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        organiser_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'IPL Screening: CSK vs MI',
        description: 'Watch the biggest IPL rivalry on a MASSIVE 40-foot LED screen! Enjoy the stadium atmosphere with surround sound, food stalls, fan zones, and exciting prizes. Wear your team jersey and get 10% off on food! DJ after the match.',
        category: 'sports', city: 'Pune',
        venue_name: 'Phoenix Marketcity Rooftop', venue_address: 'Viman Nagar, Pune 411014',
        starts_at: futureDate(2, 19, 30), ends_at: futureDate(2, 23, 0),
        poster_url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
        status: 'approved', total_capacity: 800, available_seats: 650,
        min_price: 199, max_price: 599, is_featured: true,
        tags: ['sports', 'ipl', 'cricket', 'screening'],
      },
      {
        id: 'c0000000-0000-0000-0000-000000000004',
        organiser_id: 'b0000000-0000-0000-0000-000000000002',
        title: 'Pottery & Ceramic Workshop',
        description: 'Discover the ancient art of pottery in this hands-on workshop! Learn wheel throwing, coil building, and glazing techniques from master potters. All materials provided — take home your own handcrafted piece. Perfect for beginners and couples!',
        category: 'workshop', city: 'Mumbai',
        venue_name: 'The Clay Studio', venue_address: 'Kala Ghoda, Fort, Mumbai 400001',
        starts_at: futureDate(5, 10, 0), ends_at: futureDate(5, 17, 0),
        poster_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
        status: 'approved', total_capacity: 30, available_seats: 22,
        min_price: 1200, max_price: 1200, is_featured: false,
        tags: ['workshop', 'pottery', 'art', 'creative'],
      },
      {
        id: 'c0000000-0000-0000-0000-000000000005',
        organiser_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Pune Food & Music Festival',
        description: 'A 2-day celebration of Pune\'s vibrant food scene! 50+ food stalls featuring local favorites — vada pav, misal pav, mastani — alongside live indie music performances. DJ night, cooking competitions, and a dessert trail. Fun for the whole family!',
        category: 'festival', city: 'Pune',
        venue_name: 'Amanora Mall Grounds', venue_address: 'Hadapsar, Pune 411028',
        starts_at: futureDate(10, 11, 0), ends_at: futureDate(11, 22, 0),
        poster_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
        status: 'approved', total_capacity: 3000, available_seats: 2800,
        min_price: 149, max_price: 499, is_featured: true,
        tags: ['food', 'music', 'festival', 'pune'],
      },
      {
        id: 'c0000000-0000-0000-0000-000000000006',
        organiser_id: 'b0000000-0000-0000-0000-000000000002',
        title: 'Drishyam 3 — Premiere Night',
        description: 'Be among the FIRST to watch the most anticipated Bollywood thriller of 2026! Exclusive premiere screening with red carpet entry, popcorn combo, and a chance to meet the cast. Limited seats — book now before they sell out!',
        category: 'cinema', city: 'Mumbai',
        venue_name: 'PVR IMAX Juhu', venue_address: 'Juhu, Mumbai 400049',
        starts_at: futureDate(14, 20, 0), ends_at: futureDate(14, 23, 30),
        poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
        status: 'approved', total_capacity: 350, available_seats: 280,
        min_price: 499, max_price: 1999, is_featured: true,
        tags: ['cinema', 'bollywood', 'premiere', 'thriller'],
      },
      {
        id: 'c0000000-0000-0000-0000-000000000007',
        organiser_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Shakespeare in the Park: Hamlet',
        description: 'The iconic Pagdandi Theatre Group presents Shakespeare\'s masterpiece in an intimate outdoor setting. Award-winning director Mohit Takalkar brings a fresh Marathi-English adaptation. Wine and cheese available at the venue. Dress code: smart casual.',
        category: 'theatre', city: 'Pune',
        venue_name: 'Empress Garden', venue_address: 'Racecourse, Pune 411001',
        starts_at: futureDate(6, 18, 30), ends_at: futureDate(6, 21, 30),
        poster_url: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
        status: 'approved', total_capacity: 200, available_seats: 160,
        min_price: 350, max_price: 800, is_featured: false,
        tags: ['theatre', 'shakespeare', 'drama', 'outdoor'],
      },
      {
        id: 'c0000000-0000-0000-0000-000000000008',
        organiser_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Sunrise Yoga & Meditation Retreat',
        description: 'Start your weekend with inner peace! Join certified yoga instructor Priya Mehra for a rejuvenating session at the beautiful Sinhagad Fort base. Includes yoga, guided meditation, organic breakfast, and nature walk. All levels welcome.',
        category: 'fitness', city: 'Pune',
        venue_name: 'Sinhagad Fort Base', venue_address: 'Sinhagad Road, Pune 411025',
        starts_at: futureDate(4, 6, 0), ends_at: futureDate(4, 12, 0),
        poster_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        status: 'approved', total_capacity: 50, available_seats: 38,
        min_price: 599, max_price: 599, is_featured: false,
        tags: ['fitness', 'yoga', 'meditation', 'nature'],
      },
      {
        id: 'c0000000-0000-0000-0000-000000000009',
        organiser_id: 'b0000000-0000-0000-0000-000000000002',
        title: 'TechSpark 2026 — AI & Startups Summit',
        description: 'India\'s premier tech conference returns! Hear from 30+ speakers including founders of Zerodha, Razorpay & CRED. Tracks: AI/ML, Web3, SaaS, FinTech. Includes networking lunch, startup pitch competition with Rs 10L prize pool.',
        category: 'tech', city: 'Mumbai',
        venue_name: 'Nehru Centre', venue_address: 'Worli, Mumbai 400018',
        starts_at: futureDate(12, 9, 0), ends_at: futureDate(12, 18, 0),
        poster_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        status: 'approved', total_capacity: 600, available_seats: 450,
        min_price: 1499, max_price: 4999, is_featured: true,
        tags: ['tech', 'ai', 'startups', 'conference'],
      },
      {
        id: 'c0000000-0000-0000-0000-000000000010',
        organiser_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Kids Summer Carnival',
        description: 'The ultimate fun day for kids aged 4-14! Bouncy castles, magic shows, face painting, treasure hunts, art corner, puppet theatre, and water balloon fights. Parents can relax at the cafe zone while kids have the time of their lives!',
        category: 'kids', city: 'Pune',
        venue_name: 'Symbiosis School Ground', venue_address: 'Viman Nagar, Pune 411014',
        starts_at: futureDate(8, 10, 0), ends_at: futureDate(8, 18, 0),
        poster_url: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800',
        status: 'approved', total_capacity: 400, available_seats: 350,
        min_price: 199, max_price: 399, is_featured: false,
        tags: ['kids', 'summer', 'carnival', 'family'],
      },
      // PENDING APPROVAL events (for admin panel)
      {
        id: 'c0000000-0000-0000-0000-000000000011',
        organiser_id: 'b0000000-0000-0000-0000-000000000003',
        title: 'Bangalore Art Walk',
        description: 'Explore Bangalore\'s vibrant street art scene with a guided walking tour through Malleshwaram and Church Street. Meet local artists, visit hidden galleries, and create your own graffiti art!',
        category: 'art', city: 'Bangalore',
        venue_name: 'Malleshwaram Circle', venue_address: 'Malleshwaram, Bangalore 560003',
        starts_at: futureDate(9, 9, 0), ends_at: futureDate(9, 17, 0),
        poster_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
        status: 'pending_approval', total_capacity: 40, available_seats: 40,
        min_price: 499, max_price: 499, is_featured: false,
        tags: ['art', 'walking', 'tour', 'bangalore'],
      },
      {
        id: 'c0000000-0000-0000-0000-000000000012',
        organiser_id: 'b0000000-0000-0000-0000-000000000003',
        title: 'Electronic Night: DJ Snake India Tour',
        description: 'DJ Snake brings his electrifying set to Bangalore! Get ready for Turn Down for What, Lean On, Let Me Love You and his latest bangers. Full production with pyrotechnics, lasers and CO2 cannons.',
        category: 'nightlife', city: 'Bangalore',
        venue_name: 'Phoenix Arena', venue_address: 'Whitefield, Bangalore 560066',
        starts_at: futureDate(15, 21, 0), ends_at: futureDate(16, 2, 0),
        poster_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        status: 'pending_approval', total_capacity: 5000, available_seats: 5000,
        min_price: 1999, max_price: 9999, is_featured: false,
        tags: ['nightlife', 'edm', 'dj', 'party'],
      },
      // DRAFT event (for organiser panel)
      {
        id: 'c0000000-0000-0000-0000-000000000013',
        organiser_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Marathi Natya Utsav',
        description: 'A celebration of Marathi theatre with 5 acclaimed plays performed over 2 days. Featuring Zee Natya Gaurav award winners and emerging talent.',
        category: 'theatre', city: 'Pune',
        venue_name: 'Tilak Smarak Mandir', venue_address: 'Tilak Road, Pune 411030',
        starts_at: futureDate(20, 18, 0), ends_at: futureDate(21, 22, 0),
        poster_url: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
        status: 'draft', total_capacity: 300, available_seats: 300,
        min_price: 200, max_price: 500, is_featured: false,
        tags: ['theatre', 'marathi', 'drama'],
      },
      // COMPLETED past event (for reviews)
      {
        id: 'c0000000-0000-0000-0000-000000000014',
        organiser_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'New Year Comedy Bash 2026',
        description: 'Ring in 2026 with non-stop laughter! An epic 5-hour comedy marathon featuring 10 of India\'s funniest comedians.',
        category: 'comedy', city: 'Pune',
        venue_name: 'Bal Gandharva Rangmandir', venue_address: 'JM Road, Pune 411004',
        starts_at: '2026-01-01T19:00:00.000Z', ends_at: '2026-01-02T00:00:00.000Z',
        poster_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        status: 'completed', total_capacity: 500, available_seats: 0,
        min_price: 499, max_price: 1999, is_featured: false,
        tags: ['comedy', 'newyear', 'standup'],
      },
    ];

    for (const e of events) {
      await client.query(
        `INSERT INTO events (id, organiser_id, title, description, category, city, venue_name, venue_address, starts_at, ends_at, poster_url, status, total_capacity, available_seats, min_price, max_price, is_featured, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [e.id, e.organiser_id, e.title, e.description, e.category, e.city, e.venue_name, e.venue_address, e.starts_at, e.ends_at, e.poster_url, e.status, e.total_capacity, e.available_seats, e.min_price, e.max_price, e.is_featured, e.tags]
      );
      console.log(`   ✅ [${e.status}] ${e.title}`);
    }

    // ─── 4. SEAT SECTIONS ────────────────────────────────────────
    console.log("\n💺 Creating seat sections...");
    const sections = [
      // Comedy Night (500 total)
      ['d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'VVIP - Front Row',  50,  40,  1499, 5, 10],
      ['d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'VIP',              150, 130,   799, 10, 15],
      ['d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Premium',          150, 130,   499, 10, 15],
      ['d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'General',          150, 120,   299, 10, 15],
      // Arijit Singh Concert (2000 total)
      ['d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Platinum Lounge',  100,  70,  7999, 5, 20],
      ['d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'Gold',             400, 330,  3999, 20, 20],
      ['d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002', 'Silver',           600, 500,  1999, 20, 30],
      ['d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', 'General Standing', 900, 750,   999, 30, 30],
      // IPL Screening (800 total)
      ['d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 'Premium Couch',    100,  80,   599, 5, 20],
      ['d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003', 'Bean Bag Zone',    200, 170,   399, 10, 20],
      ['d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', 'General',          500, 400,   199, 20, 25],
      // Pottery Workshop (30)
      ['d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000004', 'Workshop Table',    30,  22,  1200, 3, 10],
      // Food Festival (3000)
      ['d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000005', 'VIP Food Pass',    500, 450,   499, 1, 1],
      ['d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000005', 'General Entry',   2500, 2350,  149, 1, 1],
      // Drishyam 3 Premiere (350)
      ['d0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000006', 'IMAX Recliner',     50,  35,  1999, 5, 10],
      ['d0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000006', 'IMAX Premium',     100,  80,   999, 10, 10],
      ['d0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000006', 'Standard',         200, 165,   499, 10, 20],
      // Shakespeare Theatre (200)
      ['d0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000007', 'Front Garden',      50,  40,   800, 5, 10],
      ['d0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000007', 'Back Garden',      150, 120,   350, 10, 15],
      // Yoga Retreat (50)
      ['d0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000008', 'Yoga Mat Spot',     50,  38,   599, 5, 10],
      // TechSpark Summit (600)
      ['d0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000009', 'Speaker Dinner VIP',100, 60,  4999, 5, 20],
      ['d0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000009', 'Conference Pass',  500, 390,  1499, 20, 25],
      // Kids Carnival (400)
      ['d0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000010', 'Family Pass (4)',  100,  80,   399, 1, 1],
      ['d0000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000010', 'Kid Entry',        300, 270,   199, 1, 1],
    ];
    for (const s of sections) {
      await client.query(
        'INSERT INTO seat_sections (id, event_id, label, total_seats, available_seats, price, row_count, col_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        s
      );
    }
    console.log(`   ✅ ${sections.length} seat sections created`);

    // ─── 5. SEATS ────────────────────────────────────────────────
    console.log("\n🪑 Generating individual seats...");
    const seatSections = [
      { id: 'd0000000-0000-0000-0000-000000000001', rows: 5, cols: 10 },
      { id: 'd0000000-0000-0000-0000-000000000002', rows: 10, cols: 15 },
      { id: 'd0000000-0000-0000-0000-000000000003', rows: 10, cols: 15 },
      { id: 'd0000000-0000-0000-0000-000000000004', rows: 10, cols: 15 },
      { id: 'd0000000-0000-0000-0000-000000000005', rows: 5, cols: 20 },
      { id: 'd0000000-0000-0000-0000-000000000006', rows: 20, cols: 20 },
      { id: 'd0000000-0000-0000-0000-000000000015', rows: 5, cols: 10 },
      { id: 'd0000000-0000-0000-0000-000000000016', rows: 10, cols: 10 },
      { id: 'd0000000-0000-0000-0000-000000000017', rows: 10, cols: 20 },
      { id: 'd0000000-0000-0000-0000-000000000018', rows: 5, cols: 10 },
      { id: 'd0000000-0000-0000-0000-000000000019', rows: 10, cols: 15 },
    ];

    let totalSeats = 0;
    for (const section of seatSections) {
      const values = [];
      const params = [];
      let paramIdx = 1;
      for (let r = 1; r <= section.rows; r++) {
        for (let c = 1; c <= section.cols; c++) {
          const rowLetter = String.fromCharCode(64 + r);
          const label = `${rowLetter}${c}`;
          const status = (Math.random() < 0.15) ? 'booked' : 'available';
          values.push(`($${paramIdx},$${paramIdx+1},$${paramIdx+2},$${paramIdx+3},$${paramIdx+4})`);
          params.push(section.id, r, c, label, status);
          paramIdx += 5;
          totalSeats++;
        }
      }
      await client.query(
        `INSERT INTO seats (section_id, row_number, col_number, label, status) VALUES ${values.join(',')}`,
        params
      );
    }
    console.log(`   ✅ ${totalSeats} individual seats created`);

    // ─── 6. BOOKINGS ─────────────────────────────────────────────
    console.log("\n🎫 Creating sample bookings...");
    const bookings = [
      ['e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 1499, 75, 1574, 'confirmed', 'QR_BOOKIT_001', 'pay_sim_001', 'order_sim_001'],
      ['e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 7999, 400, 8399, 'confirmed', 'QR_BOOKIT_002', 'pay_sim_002', 'order_sim_002'],
      ['e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 599, 30, 629, 'confirmed', 'QR_BOOKIT_003', 'pay_sim_003', 'order_sim_003'],
      ['e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 799, 40, 839, 'confirmed', 'QR_BOOKIT_004', 'pay_sim_004', 'order_sim_004'],
      ['e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000005', 499, 25, 524, 'pending', null, null, 'order_sim_005'],
      ['e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000014', 999, 50, 1049, 'confirmed', 'QR_BOOKIT_006', 'pay_sim_006', 'order_sim_006'],
      ['e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000014', 1999, 100, 2099, 'confirmed', 'QR_BOOKIT_007', 'pay_sim_007', 'order_sim_007'],
      ['e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000002', 999, 50, 1049, 'cancelled', null, null, 'order_sim_008'],
    ];
    for (const b of bookings) {
      const confirmedAt = b[6] === 'confirmed' ? new Date() : null;
      await client.query(
        `INSERT INTO bookings (id, user_id, event_id, seat_ids, amount, convenience_fee, total_amount, status, qr_token, payment_id, razorpay_order_id, confirmed_at, created_at)
         VALUES ($1, $2, $3, ARRAY[]::UUID[], $4, $5, $6, $7::booking_status, $8, $9, $10, $11, NOW())`,
        [...b, confirmedAt]
      );
    }
    console.log(`   ✅ ${bookings.length} bookings created`);

    // ─── 7. PAYMENTS ─────────────────────────────────────────────
    console.log("\n💳 Creating payment records...");
    const payments = [
      ['f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'pay_sim_001', 'order_sim_001', 1574, 126, 1448, 'captured'],
      ['f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'pay_sim_002', 'order_sim_002', 8399, 672, 7727, 'captured'],
      ['f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'pay_sim_003', 'order_sim_003', 629,   50,  579, 'captured'],
      ['f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'pay_sim_004', 'order_sim_004', 839,   67,  772, 'captured'],
      ['f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', null,          'order_sim_005', 524,    0,    0, 'pending'],
      ['f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 'pay_sim_006', 'order_sim_006', 1049,  84,  965, 'captured'],
      ['f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000007', 'pay_sim_007', 'order_sim_007', 2099, 168, 1931, 'captured'],
    ];
    for (const p of payments) {
      await client.query(
        'INSERT INTO payments (id, booking_id, razorpay_payment_id, razorpay_order_id, amount, fee, organiser_payout, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        p
      );
    }
    console.log(`   ✅ ${payments.length} payment records created`);

    // ─── 8. REVIEWS ──────────────────────────────────────────────
    console.log("\n⭐ Creating reviews...");
    await client.query(
      'INSERT INTO reviews (id, user_id, event_id, booking_id, rating, comment, sentiment_score) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      ['90000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000006', 5, 'Absolutely incredible show! Best comedy night I have ever been to. The lineup was fire!', 0.95]
    );
    await client.query(
      'INSERT INTO reviews (id, user_id, event_id, booking_id, rating, comment, sentiment_score) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      ['90000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000007', 4, 'Great event, loved the energy! Only wish it started on time. Would definitely come again.', 0.80]
    );
    console.log("   ✅ 2 reviews created");

    // ─── 9. NOTIFICATIONS ────────────────────────────────────────
    console.log("\n🔔 Creating notifications...");
    const notifs = [
      ['80000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'booking_confirmed', 'email', JSON.stringify({title: 'Booking Confirmed!', message: 'Your booking for Laugh Riot: Stand-Up Comedy Night is confirmed.', event_title: 'Laugh Riot: Stand-Up Comedy Night'})],
      ['80000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'booking_confirmed', 'whatsapp', JSON.stringify({title: 'Booking Confirmed!', message: 'Your Arijit Singh Live tickets are booked! See you at Jio World Garden.', event_title: 'Arijit Singh Live in Concert'})],
      ['80000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'event_reminder', 'push', JSON.stringify({title: 'Event Tomorrow!', message: 'Laugh Riot is tomorrow! Don\'t forget your QR code.', event_title: 'Laugh Riot: Stand-Up Comedy Night'})],
      ['80000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'organiser_pending', 'email', JSON.stringify({title: 'New Organiser Application', message: 'Bangalore Arts Collective has applied for verification.', organiser_name: 'Bangalore Arts Collective'})],
    ];
    for (const n of notifs) {
      await client.query('INSERT INTO notifications (id, user_id, type, channel, payload) VALUES ($1,$2,$3,$4,$5)', n);
    }
    console.log(`   ✅ ${notifs.length} notifications created`);

    // ─── 10. ADMIN LOGS ──────────────────────────────────────────
    console.log("\n📋 Creating admin logs...");
    const logs = [
      ['70000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'organiser_verified', 'b0000000-0000-0000-0000-000000000001', 'organiser', 'KYC verified — Aadhaar matches business registration', '{"verified_docs":["aadhaar","gstin"]}'],
      ['70000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'organiser_verified', 'b0000000-0000-0000-0000-000000000002', 'organiser', 'KYC verified — All documents in order', '{"verified_docs":["aadhaar","pan","gstin"]}'],
      ['70000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'event_approved', 'c0000000-0000-0000-0000-000000000001', 'event', 'Content reviewed and approved', '{}'],
      ['70000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'event_approved', 'c0000000-0000-0000-0000-000000000002', 'event', 'Content reviewed and approved', '{}'],
    ];
    for (const l of logs) {
      await client.query('INSERT INTO admin_logs (id, admin_id, action, target_id, target_type, reason, meta) VALUES ($1,$2,$3,$4,$5,$6,$7)', l);
    }
    console.log(`   ✅ ${logs.length} admin log entries created`);

    await client.query("NOTIFY pgrst, 'reload schema'");

    console.log("\n" + "=".repeat(50));
    console.log("SEED DATA COMPLETE!");
    console.log("=".repeat(50));
    console.log(`
Summary:
   10 users (1 admin, 3 organisers, 6 customers)
   3 organisers (2 verified, 1 pending)
   14 events (10 approved, 2 pending, 1 draft, 1 completed)
   ${sections.length} seat sections
   ${totalSeats} individual seats with seat maps
   ${bookings.length} bookings
   ${payments.length} payments
   2 reviews
   ${notifs.length} notifications
   ${logs.length} admin logs

Test Accounts:
   Admin:     +919876543210 (Raj Chauhan)
   Organiser: +919876543211 (Priya Sharma)
   Customer:  +919876543213 (Sneha Kulkarni)
`);

  } catch (err) {
    console.error("SEED ERROR:", err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}

seed();
