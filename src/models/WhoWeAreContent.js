import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    link: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const ItemSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    text: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const WhoWeAreContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'who-we-are',
      unique: true,
      index: true
    },

    // Tab 1 — Company Overview
    overview: {
      eyebrow: { type: String, trim: true, default: '' },
      title: { type: String, trim: true, default: '' },
      body: { type: String, default: '' }, // sanitized HTML
      image: { type: String, trim: true, default: '' }
    },

    // Tab 2 — Landing hub (5-card strip)
    landing: {
      heading: { type: String, trim: true, default: '' },
      cards: { type: [CardSchema], default: [] }
    },

    // Tab 3 — "Who Are We" page
    whoAreWe: {
      hero: {
        eyebrow: { type: String, trim: true, default: '' },
        title: { type: String, trim: true, default: '' },
        subtitle: { type: String, trim: true, default: '' },
        backgroundImage: { type: String, trim: true, default: '' }
      },
      identity: {
        eyebrow: { type: String, trim: true, default: '' },
        title: { type: String, trim: true, default: '' },
        body: { type: String, default: '' }, // sanitized HTML
        image: { type: String, trim: true, default: '' }
      },
      founder: {
        eyebrow: { type: String, trim: true, default: '' },
        title: { type: String, trim: true, default: '' },
        name: { type: String, trim: true, default: '' },
        role: { type: String, trim: true, default: '' },
        photo: { type: String, trim: true, default: '' },
        quote: { type: String, default: '' },
        body: { type: String, default: '' } // sanitized HTML
      },
      pillars: {
        eyebrow: { type: String, trim: true, default: '' },
        title: { type: String, trim: true, default: '' },
        subtitle: { type: String, trim: true, default: '' },
        items: { type: [ItemSchema], default: [] }
      }
    },

    // Tab 4 — "Our Team" page header
    teamPage: {
      hero: {
        eyebrow: { type: String, trim: true, default: '' },
        title: { type: String, trim: true, default: '' },
        subtitle: { type: String, trim: true, default: '' },
        backgroundImage: { type: String, trim: true, default: '' }
      },
      intro: {
        eyebrow: { type: String, trim: true, default: '' },
        title: { type: String, trim: true, default: '' },
        body: { type: String, default: '' }, // sanitized HTML
        highlights: { type: [ItemSchema], default: [] }
      }
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.key;
        return ret;
      }
    }
  }
);

// Static helper to retrieve or initialize default content
WhoWeAreContentSchema.statics.getOrInitContent = async function () {
  let doc = await this.findOne({ key: 'who-we-are' });
  if (!doc) {
    doc = await this.create({
      key: 'who-we-are',
      overview: {
        eyebrow: 'ABOUT JODHPUR VOYAGE',
        title: 'Who We Are & What We Do',
        body: '<p><strong>Jodhpur Voyage</strong> is a local, French-speaking travel agency based in Rajasthan, India, creating authentic and bespoke journeys across India and Nepal.</p>',
        image: ''
      },
      landing: {
        heading: 'CREATOR OF THE MOST BEAUTIFUL JOURNEYS FOR 20+ YEARS',
        cards: [
          { id: 'card-who', title: 'Who are we', image: '', link: '/who-we-are' },
          { id: 'card-value', title: 'Our added value', image: '', link: '/who-we-are#added-value' },
          { id: 'card-commitment', title: 'Our responsible commitment', image: '', link: '/who-we-are#commitment' },
          { id: 'card-team', title: 'Our Team', image: '', link: '/who-we-are/team' },
          { id: 'card-reviews', title: 'Reviews & Testimonials', image: '', link: '/commentaires' }
        ]
      },
      whoAreWe: {
        hero: {
          eyebrow: 'OUR HISTORY & OUR COMMITMENTS',
          title: 'Who are we ?',
          subtitle: 'A local, French-speaking travel agency in India and Nepal.',
          backgroundImage: ''
        },
        identity: {
          eyebrow: 'OUR IDENTITY',
          title: 'A Passionate, French-Speaking Local Agency',
          body: '<p><strong>Jodhpur Voyage</strong> is a local travel agency based in Rajasthan offering personalized tours with experienced French-speaking guides.</p>',
          image: ''
        },
        founder: {
          eyebrow: 'A WORD FROM THE FOUNDER',
          title: 'Our Philosophy',
          name: 'Mr Singh',
          role: 'Founder & Main Contact Person',
          photo: '',
          quote: 'Passionate about my country and its culture, I created Jodhpur Voyage to share the authentic essence of India.',
          body: '<p>The project was born from a desire to open ourselves to the world and offer travelers an unforgettable, safe, and truly authentic cultural immersion.</p>'
        },
        pillars: {
          eyebrow: 'WHY CHOOSE US',
          title: 'The Pillars of Our Commitment',
          subtitle: 'Exceptional service for a worry-free journey.',
          items: [
            { id: 'pillar-1', title: 'Direct & Without Intermediaries', text: 'We offer direct, negotiated prices without middleman markups.' },
            { id: 'pillar-2', title: 'Charming Accommodations & Havelis', text: 'We hand-pick authentic heritage havelis and boutique stays.' },
            { id: 'pillar-3', title: 'Experienced French-Speaking Guides', text: 'Local guides certified by the Ministry of Tourism.' },
            { id: 'pillar-4', title: '24/7 On-Ground Support', text: 'Dedicated assistance throughout your stay in India.' }
          ]
        }
      },
      teamPage: {
        hero: {
          eyebrow: 'LOCAL FRENCH-SPEAKING EXPERTS',
          title: 'The Jodhpur Travel Team:',
          subtitle: 'A passionate team living and working in India to organize your journey.',
          backgroundImage: ''
        },
        intro: {
          eyebrow: 'JODHPUR TRAVEL LIVING LIFE LTD',
          title: 'The Jodhpur Travel Team – Our local team',
          body: '<p>We are proud to have more than 6 travel experts and seasoned guides dedicated to crafting tailor-made itineraries for our travelers.</p>',
          highlights: [
            { id: 'hl-1', title: '+6 Experts on site', text: 'Living & working in India' },
            { id: 'hl-2', title: 'Certified Guides', text: 'Approved by the Ministry of Tourism' },
            { id: 'hl-3', title: 'Customized Service', text: 'Advice & "Personal Touch"' }
          ]
        }
      }
    });
  }
  return doc;
};

const WhoWeAreContent = mongoose.models.WhoWeAreContent || mongoose.model('WhoWeAreContent', WhoWeAreContentSchema);
export default WhoWeAreContent;
