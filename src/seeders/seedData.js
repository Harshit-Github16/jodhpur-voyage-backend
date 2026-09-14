export const seedCategories = [
  {
    name: 'North India',
    slug: 'north-india',
    tagline: 'Royal Forts, Desert Dunes & Himalayan Valleys',
    description: 'Explore Rajasthan palaces, Delhi heritage, and Golden Triangle circuits.',
    coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200',
    order: 1,
    status: 'Active'
  },
  {
    name: 'Desert Circuits',
    slug: 'desert-circuits',
    tagline: 'Golden Dunes, Camel Treks & Starlit Nights',
    description: 'Venture into the heart of the Great Thar Desert across Jodhpur, Osian, and Jaisalmer.',
    coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200',
    order: 2,
    status: 'Active'
  },
  {
    name: 'Heritage & Royalty',
    slug: 'heritage-and-royalty',
    tagline: 'Living Palaces, Royal Havelis & Marwar Architecture',
    description: 'Immerse yourself in centuries of Rajput valor, regal gastronomy, and private palace tours.',
    coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200',
    order: 3,
    status: 'Active'
  },
  {
    name: 'Culture & Food',
    slug: 'culture-and-food',
    tagline: 'Culinary Trails, Folk Music & Ancient Stepwells',
    description: 'Taste authentic Mirchi Vadas, Dal Baati Churma, and witness Sufi folk rhythms.',
    coverImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200',
    order: 4,
    status: 'Active'
  }
];

export const seedCities = [
  {
    name: 'Jodhpur',
    slug: 'jodhpur',
    state: 'Rajasthan',
    tagline: 'The Legendary Sun City & Blue Heritage Capital',
    heroTitle: 'Discover Royal Jodhpur: Forts, Palaces & Desert Safaris',
    metaTitle: 'Jodhpur Tour Packages & Blue City Sightseeing | Jodhpur Voyage',
    metaDescription: 'Explore the majestic Mehrangarh Fort, blue city walking trails, Umaid Bhawan palace and Osian dunes.',
    keywords: 'jodhpur tours, blue city walk, mehrangarh fort tour, jodhpur travel guide',
    bannerImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800',
      'https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?w=800'
    ],
    highlights: ['Mehrangarh Fort Private Tour', 'Toorji Ka Jhalra Stepwell', 'Osian Desert Camping', 'Umaid Bhawan Palace'],
    faqs: [
      { question: 'What is the best time to visit Jodhpur?', answer: 'The ideal time is October through March when the desert weather is pleasantly cool.' },
      { question: 'Why are the houses in Jodhpur painted blue?', answer: 'Historically, indigo blue was used by Brahmins and helped keep houses naturally cool in summer heat while repelling insects.' }
    ],
    packagesCount: 4,
    featured: true,
    status: 'Published'
  },
  {
    name: 'Udaipur',
    slug: 'udaipur',
    state: 'Rajasthan',
    tagline: 'The City of Lakes & Royal Venetian Palaces',
    heroTitle: 'Romantic Udaipur: Lake Pichola, City Palace & Jag Mandir',
    metaTitle: 'Udaipur Tour Packages | Lake Pichola Sightseeing',
    metaDescription: 'Experience royal Lake Pichola boat cruises and grand palaces in Udaipur.',
    keywords: 'udaipur tours, lake pichola, city palace udaipur, rajasthan luxury',
    bannerImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
    ],
    highlights: ['City Palace Complex', 'Lake Pichola Sunset Boat Cruise', 'Saheliyon Ki Bari Gardens', 'Monsoon Palace Sunset'],
    faqs: [
      { question: 'Is Udaipur good for honeymooners?', answer: 'Udaipur is renowned as one of the most romantic destinations in Asia with luxury lakefront heritage stays.' }
    ],
    packagesCount: 2,
    featured: true,
    status: 'Published'
  },
  {
    name: 'Jaisalmer',
    slug: 'jaisalmer',
    state: 'Rajasthan',
    tagline: 'The Golden City of Living Forts & Sand Dunes',
    heroTitle: 'Mystical Jaisalmer: Sam Sand Dunes & Sonar Qila',
    metaTitle: 'Jaisalmer Desert Safari & Fort Tours | Jodhpur Voyage',
    metaDescription: 'Experience camel safaris, starlit luxury desert camps, and the living fort of Jaisalmer.',
    keywords: 'jaisalmer safari, golden fort tour, sam sand dunes, rajasthan desert',
    bannerImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?w=800'
    ],
    highlights: ['Living Jaisalmer Fort (Sonar Qila)', 'Sam Sand Dunes Sunset Safari', 'Patwon Ki Haveli', 'Desert Stargazing & Folk Night'],
    faqs: [
      { question: 'How far is Jaisalmer from Jodhpur?', answer: 'It is approximately 280 km (around 4.5 hours drive via luxury AC private vehicle).' }
    ],
    packagesCount: 2,
    featured: true,
    status: 'Published'
  },
  {
    name: 'Jaipur',
    slug: 'jaipur',
    state: 'Rajasthan',
    tagline: 'The Pink City of Astronomical Marvels & Fortresses',
    heroTitle: 'Jaipur Grandeur: Amber Fort, Hawa Mahal & City Palace',
    metaTitle: 'Jaipur Heritage Tours & Royal Palaces | Jodhpur Voyage',
    metaDescription: 'Discover royal Jaipur with expert storytellers, Amber Fort elephant rides and artisanal bazaar walks.',
    keywords: 'jaipur tours, amber fort, hawa mahal, pink city walk',
    bannerImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
    ],
    highlights: ['Amber Fort & Sheesh Mahal', 'Hawa Mahal & Johari Bazaar Walk', 'Jantar Mantar Observatory', 'Nahargarh Fort Sunset'],
    faqs: [
      { question: 'Can we customize a combined Jaipur-Jodhpur-Udaipur tour?', answer: 'Yes! Our custom tour concierge specializes in bespoke Royal Rajasthan circuits.' }
    ],
    packagesCount: 2,
    featured: false,
    status: 'Published'
  }
];

export const seedTours = [
  {
    title: 'Royal Jodhpur & Thar Desert Safari',
    slug: 'royal-jodhpur-thar-desert-safari',
    category: 'Royal Heritage',
    price: 14999,
    originalPrice: 19999,
    duration: '3 Days / 2 Nights',
    groupSize: 'Max 10 People',
    location: 'Jodhpur & Osian Desert',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800',
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'
    ],
    overview: 'Immerse in the timeless opulence of Marwar with private guided access to Mehrangarh Fort, sunset desert camel treks in Osian dunes, and a starlit dinner with Kalbelia folk dancers.',
    highlights: [
      'Exclusive private guided tour of Mehrangarh Fort with curator insights',
      'Overnight luxury Swiss tent stay in Osian dunes with bonfire & folk music',
      'Sunset camel ride and private dinner on high sand dunes',
      'Toorji Ka Jhalra stepwell walking trail & royal lassi tasting'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Blue City & Heritage Trail',
        desc: 'Check-in at heritage Haveli followed by a guided sunset walk through the indigo blue alleys of Navchokiya and Toorji Ka Jhalra stepwell.',
        meals: 'Dinner Included',
        stay: 'Pal Haveli Jodhpur'
      },
      {
        day: 2,
        title: 'Mehrangarh Majesty & Osian Desert Camp',
        desc: 'Explore the grand ramparts of Mehrangarh Fort and Jaswant Thada. After lunch, drive to Osian desert for camel safari and luxury Swiss tent stay.',
        meals: 'Breakfast & Desert Dinner',
        stay: 'Reggie’s Camel Camp Osian'
      },
      {
        day: 3,
        title: 'Umaid Bhawan & Royal Farewell',
        desc: 'Morning desert sunrise, return to Jodhpur to visit the grand Umaid Bhawan Palace museum and Clock Tower spices bazaar before departure.',
        meals: 'Breakfast Included',
        stay: 'Departure'
      }
    ],
    inclusions: [
      'AC Luxury SUV Private Transport throughout the tour',
      'All Heritage Monument Entry & Guide Fees',
      '2 Nights accommodation in 4-Star Heritage Haveli & Luxury Desert Camp',
      'Daily Gourmet Breakfast & 2 Royal Dinners',
      'Desert Camel Safari with folk performances'
    ],
    exclusions: [
      'Airfare or Train Tickets to/from Jodhpur',
      'Personal Tips, Alcoholic Beverages, and Camera charges'
    ],
    faqs: [
      { question: 'Are vegetarian meals provided?', answer: 'Yes, fresh authentic Rajasthani vegetarian delicacies are served throughout.' },
      { question: 'Is this tour suitable for families with seniors?', answer: 'Absolutely. We provide sanitized luxury vehicles and flexible pacing.' }
    ],
    rating: 4.9,
    reviewsCount: 38,
    badge: 'Bestseller',
    featured: true,
    status: 'Active',
    totalBookings: 142
  },
  {
    title: 'Blue City Walking Tour & Culinary Trail',
    slug: 'blue-city-walking-tour-culinary-trail',
    category: 'Culture & Food',
    price: 2499,
    originalPrice: 3499,
    duration: '4 Hours (Morning / Evening)',
    groupSize: 'Max 8 People',
    location: 'Old City, Jodhpur',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
    ],
    overview: 'Navigate hidden Brahmin lanes painted vibrant indigo, capture dramatic fortress backdrops, and taste Jodhpur legendary culinary gems like Shahi Samosa, Makhaniya Lassi, and Ghevar.',
    highlights: [
      'Secret photo vantage points with panoramic fort views',
      '6 curated authentic street food tastings at iconic multi-generational shops',
      'Interact with local Marwari artisans and turban tie demonstration',
      'Guided by a born-and-raised Blue City storyteller'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Blue Alleyways & Gastronomy Walk',
        desc: 'Meet at Clock Tower, walk through spice market, explore Navchokiya blue alleys, stepwell, and finish with royal dessert tasting.',
        meals: 'All Food & Drink Tastings Included',
        stay: 'Day Experience'
      }
    ],
    inclusions: [
      'Expert Local Storyteller Guide',
      'All 6 Street Food & Beverage Tastings',
      'Mineral Water & Wet Wipes',
      'Exclusive Blue City Photo Spots'
    ],
    exclusions: ['Hotel pick-up/drop (available on request)'],
    faqs: [
      { question: 'How much walking is involved?', answer: 'Approximately 2.5 km of slow, leisurely paced walking with frequent tasting stops.' }
    ],
    rating: 5.0,
    reviewsCount: 64,
    badge: 'Popular',
    featured: true,
    status: 'Active',
    totalBookings: 88
  },
  {
    title: 'Jaisalmer Starlit Dunes & Fort Discovery',
    slug: 'jaisalmer-starlit-dunes-fort-discovery',
    category: 'Desert Safari',
    price: 18499,
    originalPrice: 22999,
    duration: '3 Days / 2 Nights',
    groupSize: 'Max 12 People',
    location: 'Jaisalmer & Sam Sand Dunes',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800',
    gallery: ['https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?w=800'],
    overview: 'Travel to the golden citadel of Sonar Qila, explore ornate carved stone Havelis, and experience thrilling 4x4 dune bashing followed by overnight desert glamping.',
    highlights: [
      'Guided exploration of the world’s only fully living fort',
      '4x4 Jeep Dune Bashing in deep Thar Desert',
      'Private sunset champagne setup in golden sand dunes',
      'Astronomical desert stargazing session'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Golden Fort & Patwon Ki Haveli',
        desc: 'Explore Sonar Qila, Jain temples, and intricate stone carvings of Patwon Ki Haveli.',
        meals: 'Dinner',
        stay: 'Suryagarh or Heritage Haveli'
      },
      {
        day: 2,
        title: 'Sam Dunes Jeep Safari & Luxury Glamping',
        desc: 'Afternoon dune bashing in Sam dunes, sunset camel ride, traditional Rajasthani buffet and folk performance.',
        meals: 'Breakfast & Desert Gala Dinner',
        stay: 'Luxury Swiss Desert Glamp'
      },
      {
        day: 3,
        title: 'Kuldhara Ghost Village & Departure',
        desc: 'Morning visit to the haunted ruins of Kuldhara village before transfer to airport/railway.',
        meals: 'Breakfast',
        stay: 'Departure'
      }
    ],
    inclusions: ['4-Star & Luxury Camp stays', 'Private AC Vehicle', 'All Meals specified', 'Jeep & Camel Safari'],
    exclusions: ['Personal expenses'],
    faqs: [{ question: 'Is dune bashing safe?', answer: 'Conducted by certified professional desert drivers in rally-spec 4x4 vehicles.' }],
    rating: 4.8,
    reviewsCount: 29,
    badge: 'Trending',
    featured: true,
    status: 'Active',
    totalBookings: 67
  },
  {
    title: 'Romantic Udaipur Lake Palace & Heritage Cruise',
    slug: 'romantic-udaipur-lake-palace-heritage-cruise',
    category: 'Heritage & Royalty',
    price: 21999,
    originalPrice: 26999,
    duration: '3 Days / 2 Nights',
    groupSize: 'Private (Couples / Family)',
    location: 'Udaipur, Lake Pichola',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    gallery: ['https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800'],
    overview: 'Revel in regal romance across the Venetian waterways of Lake Pichola, private sunset boat cruises to Jag Mandir, and royal dinners overlooking illuminated palaces.',
    highlights: [
      'Private sunset boat cruise on Lake Pichola with champagne',
      'Curated City Palace Museum & Crystal Gallery tour',
      'Romantic candlelit dinner at Ambrai overlooking the City Palace',
      'Saheliyon Ki Bari and Monsoon Palace sunset drive'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Welcome to the City of Lakes',
        desc: 'Check-in to luxury lakefront resort. Evening private boat cruise to Jag Mandir island palace.',
        meals: 'Welcome Dinner',
        stay: 'Fateh Garh / Trident Udaipur'
      },
      {
        day: 2,
        title: 'City Palace & Royal Heritage Walk',
        desc: 'Guided tour of the grand City Palace and evening Bagore Ki Haveli Dharohar cultural dance show.',
        meals: 'Breakfast & Lakefront Dinner',
        stay: 'Fateh Garh'
      },
      {
        day: 3,
        title: 'Monsoon Palace & Farewell',
        desc: 'Morning visit to Sajjangarh Monsoon Palace with panoramic Aravalli mountain views followed by airport drop.',
        meals: 'Breakfast',
        stay: 'Departure'
      }
    ],
    inclusions: ['Luxury Lake View Hotel Stay', 'Private Sedan/SUV transfers', 'Private Boat Charter', 'All monument entry tickets'],
    exclusions: ['Airfare'],
    faqs: [{ question: 'Can you arrange customized flower/cake setups for anniversaries?', answer: 'Yes! We customize bespoke honeymoon and anniversary celebrations.' }],
    rating: 5.0,
    reviewsCount: 42,
    badge: 'Luxury',
    featured: true,
    status: 'Active',
    totalBookings: 94
  }
];

export const seedBlogs = [
  {
    title: 'Top 10 Hidden Photography Spots in Jodhpur’s Blue City',
    slug: 'top-10-hidden-photography-spots-jodhpur-blue-city',
    excerpt: 'Venture beyond the tourist hotspots into the narrow, indigo-drenched alleys for unbelievable fortress views and street portraits.',
    content: `<h2>The Magic of Indigo Blue</h2><p>Jodhpur is world-renowned as the Blue City, but finding the most vivid spots requires wandering through the ancient alleys of <strong>Navchokiya</strong> and <strong>Brahmpuri</strong>.</p><h3>1. Pachetia Hill Sunset Point</h3><p>Climb the secret stepped pathway behind the old havelis to arrive at Pachetia Hill for 360-degree views of Mehrangarh Fort glowing golden at dusk.</p><h3>2. Toorji Ka Jhalra Stepwell</h3><p>An intricate 18th-century stepwell adorned with carved dancing lions, aquatic birds, and pristine blue waters.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200',
    category: 'Travel Guide',
    tags: ['Photography', 'Heritage', 'Jodhpur', 'Blue City'],
    author: {
      name: 'Harshit Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'Lead Explorer & Curator'
    },
    readTime: '5 min read',
    views: 1420,
    featured: true,
    status: 'Published'
  },
  {
    title: 'A Foodie’s Royal Guide to Jodhpur: Mirchi Vada to Makhaniya Lassi',
    slug: 'foodies-royal-guide-to-jodhpur-mirchi-vada-makhaniya-lassi',
    excerpt: 'Discover why Jodhpur is regarded as Rajasthan’s culinary capital with our insider food trail through historic clock tower bazaars.',
    content: `<h2>Flavors of Marwar</h2><p>From the fiery punch of a freshly fried <em>Mirchi Vada</em> to the rich cardamom cream of a <em>Makhaniya Lassi</em>, Jodhpur treats gastronomy as an art form passed through generations.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200',
    category: 'Food & Culture',
    tags: ['Food', 'Street Food', 'Rajasthan', 'Culinary'],
    author: {
      name: 'Vikram Singh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Heritage Guide'
    },
    readTime: '4 min read',
    views: 890,
    featured: true,
    status: 'Published'
  }
];

export const seedTeam = [
  {
    name: 'Harshit Sharma',
    role: 'Founder & Chief Explorer',
    bio: 'Born in Jodhpur, Harshit has spent over a decade curating intimate, authentic experiential journeys across Rajasthan for global travelers.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    experienceYears: 12,
    order: 1,
    socials: {
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com'
    },
    status: 'Active'
  },
  {
    name: 'Vikram Singh Rathore',
    role: 'Lead Jodhpur Guide & Historian',
    bio: 'Historian specializing in Marwar architecture, Rajput royal lineages, and ancient folklore with over 800+ five-star tour reviews.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    experienceYears: 9,
    order: 2,
    socials: {
      instagram: 'https://instagram.com'
    },
    status: 'Active'
  },
  {
    name: 'Pooja Gehlot',
    role: 'Guest Experience & Concierge Lead',
    bio: 'Dedicated to designing seamless luxury itineraries, private palace dinners, and bespoke family travel moments.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    experienceYears: 7,
    order: 3,
    status: 'Active'
  }
];

export const seedReviews = [
  {
    authorName: 'Sunita & Rajesh Nair',
    authorLocation: 'Bangalore, India',
    rating: 5,
    title: 'Unforgettable Blue City Hospitality!',
    comment: 'The private sunset walk and dinner in Osian dunes under the starlit sky was pure magic. Guide Vikram made history come alive!',
    status: 'Approved',
    featured: true
  },
  {
    authorName: 'David & Charlotte Miller',
    authorLocation: 'London, UK',
    rating: 5,
    title: 'The Best Way to Experience Rajasthan',
    comment: 'Flawless arrangements from airport pickup to our heritage hotel. The blue alleyways and food walk were the highlight of our 2-week trip.',
    status: 'Approved',
    featured: true
  },
  {
    authorName: 'Ananya Deshmukh',
    authorLocation: 'Mumbai, India',
    rating: 5,
    title: 'Mehrangarh Fort Like Never Before',
    comment: 'Having a private guide who knows every secret nook of the fortress made all the difference. Worth every penny!',
    status: 'Approved',
    featured: true
  }
];

export const seedSettings = {
  siteName: 'Jodhpur Voyage',
  siteTagline: 'Curated Heritage & Experiential Tours',
  supportEmail: 'contact@jodhpurvoyage.com',
  supportPhone: '+91 98290 12345',
  address: 'Clock Tower Square, Old City, Jodhpur, Rajasthan 342001',
  socialLinks: {
    instagram: 'https://instagram.com/jodhpurvoyage',
    facebook: 'https://facebook.com/jodhpurvoyage',
    youtube: 'https://youtube.com/@jodhpurvoyage'
  },
  currency: 'INR',
  currencySymbol: '₹',
  bookingConfirmationEmail: true,
  maintenanceMode: false
};
