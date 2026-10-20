# ChronoScout - UGREEN NAS (UGOS) Docker Deployment Guide

ChronoScout is a self-contained web application designed to run 24/7 on your **UGREEN NAS** (UGOS) or any Docker-enabled home server. It continuously monitors European and Swiss eBay portals (`ebay.ch`, `ebay.de`, `ebay.fr`, `ebay.it`) for overlooked vintage Swiss and Glashütte wristwatches, auctions ending soon with 0 or few bids, and undervalued Buy It Now listings.

---

## Method 1: Using UGREEN UGOS Docker App (Recommended)

### Step 1: Prepare Directory on your UGREEN NAS
1. Open **File Manager** in UGOS.
2. In your Docker share (e.g. `/volume1/docker`), create a folder named `chronoscout`.
3. Inside `chronoscout`, create a subfolder named `data`.

### Step 2: Create Compose Project
1. Open the **Docker** app from your UGOS desktop.
2. Click **Project / Compose** on the left navigation bar.
3. Click **Create Project**.
4. Set the **Project Name** to: `chronoscout`.
5. Under **Project Path**, select the `/volume1/docker/chronoscout` folder.
6. Paste the following configuration into the Compose editor:

```yaml
version: '3.8'

services:
  chronoscout:
    image: chronoscout:latest
    build: .
    container_name: ugreen-chronoscout
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/stats"]
      interval: 30s
      timeout: 5s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

7. Click **Done** or **Deploy**. UGOS will build and start the container automatically.

---

## Method 2: Command Line (SSH into UGREEN NAS)

If you prefer SSH access to your Ugreen NAS:

```bash
# 1. SSH into your NAS
ssh your_username@192.168.1.xxx

# 2. Clone or place the project files in your docker directory
cd /volume1/docker/
mkdir -p chronoscout/data
cd chronoscout

# 3. Build and launch container
docker compose up -d --build
```

Or using a direct one-line command:

```bash
docker run -d \
  --name ugreen-chronoscout \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /volume1/docker/chronoscout/data:/app/data \
  chronoscout:latest
```

---

## Accessing ChronoScout

Once started, open your web browser on any phone, tablet, or PC connected to your local network and visit:

```
http://<YOUR-UGREEN-NAS-IP>:3000
```
(For example: `http://192.168.1.120:3000`)

---

## Features & Capabilities

- **Zero-Bids Radar**: Highlights auctions ending within 2 hours that have 0 or few bids.
- **European & Swiss Origin Filter**: Direct provenance filtering for Switzerland (CH), Germany (DE/Glashütte), France (FR/Besançon), Italy (IT), and Austria (AT).
- **Misspelled Listing Finder**: Exposes listings with typos like *"Omga"*, *"Glashutte"*, *"Tisso"*, or *"Valjoux 7733"* that normal buyers miss.
- **Currency Converter**: Instant conversion between USD ($), EUR (€), CHF (₣), and GBP (£).
- **Lightweight Footprint**: Uses ~45MB of RAM and <0.2% CPU on Intel Celeron / N100 / Core Ugreen NAS processors.
