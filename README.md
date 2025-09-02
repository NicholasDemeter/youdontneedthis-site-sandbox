# YDNT Electronics Website - Clean Deployment

## 🚀 Quick Start

This is your complete YDNT electronics selling website in just **3 files**:

### Files Included:
- `index.html` - Complete website (HTML + CSS + JavaScript)
- `products.csv` - Your product catalog (98 items)
- `site_config.json` - Configuration (WhatsApp, hero video)

### To Deploy:

#### Option 1: GitHub Pages (Recommended)
1. Upload these 3 files to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Your site will be live at `https://yourusername.github.io/repository-name`

#### Option 2: Any Web Host
1. Upload these 3 files to your web hosting
2. Point your domain to the hosting
3. Done!

#### Option 3: Local Testing
```bash
# In this folder, run:
python3 -m http.server 8080
# Visit: http://localhost:8080
```

## ✅ What Works:

- **98 Products** loaded from CSV
- **92 Working Thumbnails** (94% success rate)
- **Enhanced Media Discovery** - finds all LOT_###_1.jpg through LOT_###_20.jpg
- **Rectangular Carousel** with 5-star + 4-star items
- **Hero Video** (Hero_Media.mp4 from GitHub)
- **Lot Detail Pages** with complete photo/video galleries
- **WhatsApp Integration** with product-specific messages
- **Responsive Design** for all devices
- **Dark Cosmic Theme** with purple/gold accents

## 🎯 Key Features:

### Main Page:
- Professional header with navigation
- Hero banner with stats (100+, $2M+, 5★)
- Featured carousel (rectangular, no stretching)
- Hero video (Surface Studio 2)
- Complete product grid with real thumbnails

### Product Pages:
- Large main image with navigation arrows
- Thumbnail gallery with all discovered images
- Complete specifications from CSV
- WhatsApp contact button
- Professional layout

### Media Discovery:
- Finds standard images: `LOT_###_THUMBNAIL.jpg`, `LOT_###_MAIN.jpg`
- Finds numbered sequences: `LOT_###_1.jpg` through `LOT_###_20.jpg`
- Finds videos in Videos folder: `LOT_###_DEMO.mp4`, etc.
- Handles folder name corrections automatically

## 🔧 Configuration:

Edit `site_config.json` to customize:
- WhatsApp phone number
- WhatsApp message template
- Hero video filename

## 📊 Data Source:

All product data comes from `products.csv`:
- LOT IDs, names, descriptions, prices
- Categories, ratings, specifications
- Folder names for GitHub image paths

## 🌐 Image Source:

Images load from your GitHub repository:
`https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main`

## 🎉 Ready to Deploy!

This is a complete, production-ready website with no dependencies, no build process, and no server requirements. Just upload and go!

