import mongoose from 'mongoose';

const SlideSchema = new mongoose.Schema(
    {
        eyebrow: { type: String, trim: true, default: '' },
        title: { type: String, trim: true, default: '' },
        titleHighlight: { type: String, trim: true, default: '' },
        image: { type: String, trim: true, default: '' },
        description: { type: String, trim: true, default: '' },
        tags: { type: [String], default: [] },
        status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const HeroSliderSchema = new mongoose.Schema(
    {
        key: { type: String, default: 'hero-slider', unique: true, index: true },
        sharedMode: { type: Boolean, default: true },
        shared: {
            description: { type: String, trim: true, default: '' },
            tags: { type: [String], default: [] },
        },
        slides: { type: [SlideSchema], default: [] },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                delete ret.key;
                return ret;
            }
        }
    }
);

// Static helper: find or create default slider
HeroSliderSchema.statics.getOrInitSlider = async function () {
    let doc = await this.findOne({ key: 'hero-slider' });
    if (!doc) {
        doc = await this.create({
            key: 'hero-slider',
            sharedMode: true,
            shared: {
                description: 'Spécialiste des voyages authentiques et sur mesure au Rajasthan, en Inde du Nord, Inde du Sud et au Népal.',
                tags: ['Rajasthan', 'Taj Mahal', 'Népal', 'Sur Mesure']
            },
            slides: []
        });
    }
    return doc;
};

const HeroSlider = mongoose.models.HeroSlider || mongoose.model('HeroSlider', HeroSliderSchema);
export default HeroSlider;
