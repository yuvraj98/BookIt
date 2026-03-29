// movie_seed.js
// Seeds movies, theatres, screens, screen_seats, and shows in Supabase
// Run: node movie_seed.js

require('dotenv').config({ path: './apps/api/.env' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// ─── DATA ───────────────────────────────────────────────────

const MOVIES = [
  {
    title: 'Kalki 2898-AD',
    description: 'A futuristic sci-fi epic blending mythology and dystopian worlds. Kalki is destined to bring salvation in the darkest times.',
    genre: ['Action', 'Sci-Fi', 'Mythology'],
    language: 'Hindi',
    duration_minutes: 181,
    release_date: '2024-06-27',
    director: 'Nag Ashwin',
    cast_members: ['Prabhas', 'Deepika Padukone', 'Amitabh Bachchan', 'Kamal Haasan'],
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
    imdb_rating: 7.2,
    cbfc_rating: 'UA',
    status: 'now_showing',
    is_featured: true,
    tags: ['blockbuster', 'must-watch']
  },
  {
    title: 'Fighter',
    description: 'India\'s first aerial action franchise. A high-octane thriller about India\'s Air Force elite.',
    genre: ['Action', 'Thriller'],
    language: 'Hindi',
    duration_minutes: 167,
    release_date: '2024-01-25',
    director: 'Siddharth Anand',
    cast_members: ['Hrithik Roshan', 'Deepika Padukone', 'Anil Kapoor'],
    poster_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80',
    imdb_rating: 6.5,
    cbfc_rating: 'UA',
    status: 'now_showing',
    is_featured: true,
    tags: ['action', 'patriotic']
  },
  {
    title: 'Merry Christmas',
    description: 'A mysterious stranger changes the life of a widow and her daughter on Christmas Eve in this thriller.',
    genre: ['Thriller', 'Mystery'],
    language: 'Hindi',
    duration_minutes: 140,
    release_date: '2024-01-12',
    director: 'Sriram Raghavan',
    cast_members: ['Katrina Kaif', 'Vijay Sethupathi'],
    poster_url: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400&q=80',
    imdb_rating: 7.4,
    cbfc_rating: 'A',
    status: 'now_showing',
    is_featured: false,
    tags: ['thriller', 'christmas']
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with the Fremen as he begins a journey that will lead him to his truer destiny.',
    genre: ['Sci-Fi', 'Adventure'],
    language: 'English',
    duration_minutes: 166,
    release_date: '2024-03-01',
    director: 'Denis Villeneuve',
    cast_members: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    poster_url: 'https://images.unsplash.com/photo-1675748237839-28a7b40d2ca5?w=400&q=80',
    imdb_rating: 8.6,
    cbfc_rating: 'UA',
    status: 'now_showing',
    is_featured: true,
    tags: ['hollywood', 'epic', 'sequel']
  },
  {
    title: 'Laapataa Ladies',
    description: 'Two brides are accidentally swapped during a train journey, in this heartwarming Aamir Khan production.',
    genre: ['Drama', 'Comedy'],
    language: 'Hindi',
    duration_minutes: 121,
    release_date: '2024-03-01',
    director: 'Kiran Rao',
    cast_members: ['Nitanshi Goel', 'Pratibha Ranta', 'Sparsh Shrivastava'],
    poster_url: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=400&q=80',
    imdb_rating: 7.8,
    cbfc_rating: 'U',
    status: 'now_showing',
    is_featured: false,
    tags: ['feel-good', 'family']
  },
  {
    title: 'Stree 2',
    description: 'The fearless Stree returns to haunt the men of Chanderi. Another hilarious supernatural horror comedy.',
    genre: ['Horror', 'Comedy'],
    language: 'Hindi',
    duration_minutes: 149,
    release_date: '2024-08-15',
    director: 'Amar Kaushik',
    cast_members: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi'],
    poster_url: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&q=80',
    imdb_rating: 7.9,
    cbfc_rating: 'UA',
    status: 'now_showing',
    is_featured: true,
    tags: ['sequel', 'horror-comedy', 'blockbuster']
  },
  {
    title: 'Deadpool & Wolverine',
    description: 'Marvel\'s iconic foul-mouthed anti-hero meets the gruff Wolverine in the universe-saving crossover.',
    genre: ['Action', 'Comedy', 'Superhero'],
    language: 'English',
    duration_minutes: 128,
    release_date: '2024-07-26',
    director: 'Shawn Levy',
    cast_members: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin'],
    poster_url: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?w=400&q=80',
    imdb_rating: 7.8,
    cbfc_rating: 'A',
    status: 'now_showing',
    is_featured: true,
    tags: ['marvel', 'hollywood', 'comedy']
  },
  {
    title: 'Pushpa 2: The Rule',
    description: 'Pushpa Raj returns with fierce red-sandalwood empire as antagonist forces try to bring him down.',
    genre: ['Action', 'Thriller', 'Drama'],
    language: 'Hindi',
    duration_minutes: 210,
    release_date: '2024-12-05',
    director: 'Sukumar',
    cast_members: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
    imdb_rating: 7.6,
    cbfc_rating: 'UA',
    status: 'now_showing',
    is_featured: true,
    tags: ['blockbuster', 'must-watch', 'sequel']
  },
  {
    title: 'The Batman — Part II',
    description: 'Bruce Wayne faces a new nemesis in Gotham as the Joker returns alongside a mysterious crime syndicate.',
    genre: ['Action', 'Crime', 'Thriller'],
    language: 'English',
    duration_minutes: 170,
    release_date: '2026-05-22',
    director: 'Matt Reeves',
    cast_members: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano'],
    poster_url: 'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?w=400&q=80',
    imdb_rating: null,
    cbfc_rating: 'UA',
    status: 'coming_soon',
    is_featured: true,
    tags: ['dc', 'upcoming', 'batman']
  },
  {
    title: 'Singham Again',
    description: 'The Rohit Shetty cop universe expands as Singham leads a multi-hero operation to rescue his loved ones.',
    genre: ['Action', 'Drama'],
    language: 'Hindi',
    duration_minutes: 155,
    release_date: '2026-04-14',
    director: 'Rohit Shetty',
    cast_members: ['Ajay Devgn', 'Deepika Padukone', 'Ranveer Singh', 'Tiger Shroff'],
    poster_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&q=80',
    imdb_rating: null,
    cbfc_rating: 'UA',
    status: 'coming_soon',
    is_featured: false,
    tags: ['upcoming', 'sequel', 'rohit-shetty']
  }
]

const THEATRES = [
  {
    name: 'PVR IMAX Pune',
    address: 'Senapati Bapat Road, Pune Central Mall, Near Nal Stop',
    city: 'Pune',
    lat: 18.5282,
    lng: 73.8450,
    amenities: ['IMAX', 'Dolby Atmos', 'Food Court', 'Parking', 'Wheelchair Access'],
    parking: true,
  },
  {
    name: 'INOX Bund Garden',
    address: 'Bund Garden Road, Next to Hotel Westin, Pune',
    city: 'Pune',
    lat: 18.5362,
    lng: 73.8778,
    amenities: ['4DX', '3D', 'Bar Lounge', 'Parking'],
    parking: true,
  },
  {
    name: 'Cinepolis Kondhwa',
    address: 'Kondhwa Road, Kondhwa, Pune',
    city: 'Pune',
    lat: 18.4668,
    lng: 73.8975,
    amenities: ['3D', 'Food Court', 'Parking', 'Lounge'],
    parking: true,
  },
  {
    name: 'Carnival Cinemas Hadapsar',
    address: 'Magarpatta City, Hadapsar, Pune',
    city: 'Pune',
    lat: 18.5089,
    lng: 73.9274,
    amenities: ['2D', 'Snack Bar', 'Parking'],
    parking: true,
  },
  {
    name: 'E-Square Multi Plex',
    address: 'University Road, Shivajinagar, Pune',
    city: 'Pune',
    lat: 18.5500,
    lng: 73.8350,
    amenities: ['3D', 'IMAX', 'Food Court', 'Game Zone', 'Parking'],
    parking: true,
  },
]

// Screens per theatre
const SCREENS_CONFIG = {
  'PVR IMAX Pune': [
    { screen_number: 1, screen_type: 'IMAX', rows: 15, cols: 20 },
    { screen_number: 2, screen_type: '3D', rows: 12, cols: 18 },
    { screen_number: 3, screen_type: '2D', rows: 10, cols: 16 },
    { screen_number: 4, screen_type: 'DOLBY_ATMOS', rows: 10, cols: 14 },
  ],
  'INOX Bund Garden': [
    { screen_number: 1, screen_type: '4DX', rows: 10, cols: 14 },
    { screen_number: 2, screen_type: '3D', rows: 12, cols: 16 },
    { screen_number: 3, screen_type: '2D', rows: 10, cols: 15 },
  ],
  'Cinepolis Kondhwa': [
    { screen_number: 1, screen_type: '3D', rows: 12, cols: 16 },
    { screen_number: 2, screen_type: '2D', rows: 10, cols: 15 },
    { screen_number: 3, screen_type: '2D', rows: 8, cols: 12 },
  ],
  'Carnival Cinemas Hadapsar': [
    { screen_number: 1, screen_type: '2D', rows: 10, cols: 16 },
    { screen_number: 2, screen_type: '3D', rows: 10, cols: 14 },
  ],
  'E-Square Multi Plex': [
    { screen_number: 1, screen_type: 'IMAX', rows: 15, cols: 20 },
    { screen_number: 2, screen_type: '3D', rows: 12, cols: 18 },
    { screen_number: 3, screen_type: '2D', rows: 10, cols: 16 },
    { screen_number: 4, screen_type: '2D', rows: 8, cols: 14 },
  ],
}

// Seat category mapping (top rows = premium, bottom = economy)
function getSeatCategory(rowIndex, totalRows) {
  const ratio = rowIndex / totalRows
  if (ratio < 0.15) return 'RECLINER'
  if (ratio < 0.45) return 'GOLD'
  if (ratio < 0.80) return 'SILVER'
  return 'ECONOMY'
}

// Price maps per screen type
function getPrices(screenType) {
  const base = {
    '2D':         { price_recliner: 450, price_gold: 280, price_silver: 200, price_economy: 150 },
    '3D':         { price_recliner: 550, price_gold: 350, price_silver: 260, price_economy: 200 },
    'IMAX':       { price_recliner: 800, price_gold: 550, price_silver: 420, price_economy: 320 },
    '4DX':        { price_recliner: 900, price_gold: 650, price_silver: 500, price_economy: 400 },
    'DOLBY_ATMOS':{ price_recliner: 650, price_gold: 420, price_silver: 320, price_economy: 250 },
  }
  return base[screenType] || base['2D']
}

// Show times
const SHOW_TIMES = ['10:00', '13:30', '16:30', '20:00', '23:00']

async function seed() {
  console.log('🎬 Starting Movie Booking Seed...\n')

  // ─── Insert Movies ──────────────────────────────────────────
  console.log('📽️  Inserting movies...')
  const { data: movies, error: movieErr } = await supabase
    .from('movies')
    .insert(MOVIES)
    .select()
  if (movieErr) { console.error('Movie error:', movieErr); process.exit(1) }
  console.log(`✅  ${movies.length} movies inserted`)

  // ─── Insert Theatres ────────────────────────────────────────
  console.log('\n🏛️  Inserting theatres...')
  const { data: theatres, error: theatreErr } = await supabase
    .from('theatres')
    .insert(THEATRES)
    .select()
  if (theatreErr) { console.error('Theatre error:', theatreErr); process.exit(1) }
  console.log(`✅  ${theatres.length} theatres inserted`)

  // ─── Insert Screens & Screen Seats ─────────────────────────
  let totalScreens = 0
  let totalSeats = 0
  const allScreens = []

  for (const theatre of theatres) {
    const screensConfig = SCREENS_CONFIG[theatre.name] || []
    
    for (const sc of screensConfig) {
      const { data: screen, error: screenErr } = await supabase
        .from('screens')
        .insert({
          theatre_id: theatre.id,
          screen_number: sc.screen_number,
          screen_type: sc.screen_type,
          total_rows: sc.rows,
          total_cols: sc.cols,
        })
        .select()
        .single()
      
      if (screenErr) { console.error('Screen error:', screenErr); continue }
      allScreens.push({ ...screen, theatreName: theatre.name, screenType: sc.screen_type, rows: sc.rows, cols: sc.cols })
      totalScreens++

      // ─── Seat template for this screen ───
      const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, sc.rows).split('')
      const seatsBatch = []
      
      for (let ri = 0; ri < rowLabels.length; ri++) {
        const rowLabel = rowLabels[ri]
        const category = getSeatCategory(ri, sc.rows)
        for (let col = 1; col <= sc.cols; col++) {
          // skip middle 2 seats for aisle (col 6 & 7 in wide screens)
          const isAisle = (sc.cols >= 14 && (col === Math.floor(sc.cols * 0.4) || col === Math.floor(sc.cols * 0.6)))
          if (isAisle) continue
          seatsBatch.push({
            screen_id: screen.id,
            row_label: rowLabel,
            col_number: col,
            label: `${rowLabel}${col}`,
            category,
            is_available: true,
          })
        }
      }
      
      const { error: seatsErr } = await supabase.from('screen_seats').insert(seatsBatch)
      if (seatsErr) { console.error('Screen seats error:', seatsErr) }
      else totalSeats += seatsBatch.length
    }
  }
  console.log(`\n🎭 ${totalScreens} screens & ${totalSeats} seat templates created`)

  // ─── Create Shows for the next 7 days ──────────────────────
  const nowShowingMovies = movies.filter(m => m.status === 'now_showing')
  let showsCreated = 0
  
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date()
    date.setDate(date.getDate() + dayOffset)
    const showDateStr = date.toISOString().split('T')[0]

    for (const screen of allScreens) {
      // Assign a movie per screen per day
      const movie = nowShowingMovies[showsCreated % nowShowingMovies.length]
      const prices = getPrices(screen.screenType)

      // 3 show times per screen
      const times = SHOW_TIMES.slice(0, 3)
      
      for (const showTime of times) {
        const { data: show, error: showErr } = await supabase
          .from('shows')
          .insert({
            movie_id: movie.id,
            screen_id: screen.id,
            show_date: showDateStr,
            show_time: showTime,
            language: movie.language,
            ...prices,
            is_active: true,
          })
          .select()
          .single()
        
        if (showErr) { continue }

        // ─── Generate show_seats from screen_seats ──
        const { data: screenSeatsData } = await supabase
          .from('screen_seats')
          .select('*')
          .eq('screen_id', screen.id)
        
        if (!screenSeatsData || screenSeatsData.length === 0) continue
        
        const priceMap = {
          RECLINER: prices.price_recliner,
          GOLD: prices.price_gold,
          SILVER: prices.price_silver,
          ECONOMY: prices.price_economy,
        }
        
        const showSeatsBatch = screenSeatsData.map(ss => ({
          show_id: show.id,
          screen_seat_id: ss.id,
          label: ss.label,
          row_label: ss.row_label,
          col_number: ss.col_number,
          category: ss.category,
          price: priceMap[ss.category],
          status: 'available',
        }))
        
        const { error: showSeatsErr } = await supabase.from('show_seats').insert(showSeatsBatch)
        if (!showSeatsErr) showsCreated++
      }
    }
  }
  
  console.log(`\n🎬 ${showsCreated} shows created for the next 7 days`)
  console.log('\n✅ Movie Booking Seed Complete!')
  console.log(`📊 Summary:
  - Movies:    ${movies.length}
  - Theatres:  ${theatres.length}
  - Screens:   ${totalScreens}
  - Seat templates: ${totalSeats}
  - Shows:     ${showsCreated}`)
}

seed().catch(console.error)
