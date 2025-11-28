# gmaps_scraper

## Google Maps Scraper Chrome Extension

A Chrome extension that automatically scrapes business data from Google Maps and organizes it into downloadable JSON files. Perfect for personal use, lead generation, or research on local businesses.  

---

## 📦 Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/grconnor/gmaps_scraper.git
```

### Step 2: Load the Extension in Chrome

- Open Chrome and go to `chrome://extensions/`.
- Enable **Developer Mode** (top right).
- Click **Load unpacked** and select the `gmaps-scraper` folder from your cloned repository.
- The extension is now installed.

### Step 3: Test It Out

- Go to [Google Maps](https://www.google.com/maps).
- You should see a purple floating panel on the right.
- Search for something, eg: `restaurants near me`.
- Click **START** to begin scraping.
- Watch the magic happen. When you are done, click **STOP** and download any data you want. 

---

## 🎯 How to Use

### Basic Usage

1. Search for businesses on Google Maps.  
2. Click **START** on the panel.  
3. The scraper will automatically:
   - Click each business
   - Scrape its details
   - Return to the list
   - Move to the next business
   - Scroll to load more results

### Controls

- **START** – Begin scraping  
- **PAUSE** – Pause scraping (click again to resume)  
- **STOP** – Stop scraping completely  
- **Ctrl+Shift+S** (Cmd+Shift+S on Mac) – Emergency stop  

### Download Data

- **Download "Has Website"** – Businesses with websites  
- **Download "No Website"** – Businesses without websites  
- **Download All Data** – Everything in one JSON file  

---

## 📊 What Gets Scraped

For each business, the scraper collects:

- ✅ Business name  
- ✅ Phone number  
- ✅ Email (if found)  
- ✅ Address  
- ✅ Website (real website only)  
- ✅ Social media links (stored separately)  
- ✅ Timestamp of scraping  

### Smart Website Detection

The following domains are filtered as **No Website**:  

- Facebook, Instagram, Twitter/X
- Uber Eats, Dineplan
- LinkedIn, YouTube, TikTok
- WhatsApp, Telegram, Snapchat
- TripAdvisor, Yelp, Zomato
- Google links

Only custom/real business websites count as **Has Website**.  

---

## 🔧 Features

- ✅ Prevents duplicates - Won't scrape the same business twice
- ✅ Auto-scrolling - Loads more results as needed
- ✅ Pause/Resume - Take breaks without losing progress
- ✅ Live stats - See counts update in real-time
- ✅ Draggable panel - TO BE FIXED
- ✅ Minimize panel - Click "_" to minimize the panel
- ✅ Error handling - Continues even if one business fails
- ✅ Smart waiting for page elements - Waits for page elements to load

---

## JSON Output Format

**Has Website Example:**

```json
[
  {
    "name": "Tapas Restaurant",
    "phone": "071 680 0340",
    "email": null,
    "address": "145 Main Rd, Walmer, Gqeberha, 6065",
    "website": "https://tapas.co.za",
    "socialLinks": ["https://facebook.com/tapas", "https://dineplan.com/tapas"],
    "scrapedAt": "2025-11-28T10:30:45.123Z"
  }
]
```

**No Website Example:**

```json
[
  {
    "name": "Local Cafe",
    "phone": "041 367 3875",
    "email": null,
    "address": "34 Main St, Gqeberha",
    "website": null,
    "socialLinks": ["https://facebook.com/localcafe"],
    "scrapedAt": "2025-11-28T10:31:12.456Z"
  }
]
```

---

## Troubleshooting

### Panel doesn't appear

- Make sure you are on google.com/maps (not google.co.uk/maps or another, initially)
- Refresh the page
- Check if the extension is enabled in `chrome://extensions/``

### Scraper stops unexpectedly

- Check the browser console (F12) for errors
- Google Maps might have changed their layout - let me know and I'll update it

### Can't find business I already saw

- The scraper tracks processed URLs to avoid duplicates
- If you want to re-scrape, refresh the page and start over

### Keyboard shortcut doesn't work

- Make sure you are focused on the Google Maps page
- Try clicking on the map first, then use Ctrl+Shift+S

---

## Important Notes

- This scraper is for **personal use** to help local businesses
- Be respectful - don't scrape excessively fast (built-in delays help with this)
- Google Maps terms of service - use responsively
- The scraper works with the publicly visible data on Google Maps

### Let me know if you hit any issues or if anything needs tweaking
