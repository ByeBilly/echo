# Google Maps Setup Guide for SkySurfer

## Overview
SkySurfer uses Google Maps API to display real satellite imagery and map data as the flight simulation background. This guide walks you through getting your API key and configuring it for `*.magicmusicstudio.com`.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Name it: `SkySurfer` (or similar)
5. Click "CREATE"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Enable Google Maps API

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for **"Maps JavaScript API"**
3. Click on it and press **ENABLE**
4. Search for **"Geocoding API"**
5. Click on it and press **ENABLE**

## Step 3: Create an API Key

1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > API Key**
3. A dialog will appear with your new API key
4. Click the copy button to copy it
5. **Save this key somewhere safe** - you'll need it in the next step

## Step 4: Set Domain Restrictions (Important for Security)

1. In the **Credentials** page, find your API key and click the edit pencil icon
2. Scroll down to **API restrictions**
3. Select **"Maps JavaScript API"** and **"Geocoding API"**
4. Scroll down to **Application restrictions**
5. Select **"HTTP referrers (web sites)"**
6. In the box that appears, add these domain patterns:
   \`\`\`
   *.magicmusicstudio.com/*
   magicmusicstudio.com/*
   \`\`\`
7. Click **SAVE**

## Step 5: Add API Key to Vercel

1. Go to your Vercel project dashboard: https://vercel.com/william-turners-projects-70bfb52a/v0-recreate-ui-from-screenshot
2. Click **Settings > Environment Variables**
3. Click **Add New** (or use the Vars section in v0's sidebar)
4. **Variable Name:** `GOOGLE_MAPS_API_KEY`
5. **Value:** Paste your API key from Step 3
6. **Environments:** Select all (Production, Preview, Development)
7. Click **Save**
8. **Redeploy** your site or refresh the preview

## Step 6: Test the Integration

1. Go to your SkySurfer page at `studio.magicmusicstudio.com/skysurfer`
2. You should see:
   - Real satellite map imagery loading below the flight canvas
   - Search functionality working to find locations
   - "My Location" GPS button operational
   - Satellite/Map view toggle working

## Troubleshooting

### "Maps Configuration Required" Error
- **Cause:** API key not set or route handler not responding
- **Fix:** 
  1. Verify `GOOGLE_MAPS_API_KEY` is in Vercel environment variables
  2. Redeploy the project
  3. Check browser console (F12) for errors

### Maps Not Showing Satellite View
- **Cause:** Correct API key but Geocoding API not enabled
- **Fix:** Go back to Step 2 and enable the Geocoding API

### "Error Loading Maps" with Domain Info
- **Cause:** API key is set but domain restrictions don't match
- **Fix:** 
  1. Go to Google Cloud Console > Credentials
  2. Edit your API key
  3. Add/verify domain restrictions include: `*.magicmusicstudio.com/*`

### Still Having Issues?
1. Check the browser console (F12 > Console tab) for error messages
2. Verify the API key is correct in Vercel environment variables
3. Make sure you've enabled both Maps JavaScript API AND Geocoding API
4. Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## API Costs
- **Maps JavaScript API:** First $7 USD/month free, then per-request pricing
- **Geocoding API:** $0.005 per request, first 200 requests free per day
- **Tip:** Set up billing alerts in Google Cloud Console to monitor usage

## Next Steps
Once maps are working:
1. Test flying over different locations using the search feature
2. Use "My Location" to fly over your current area
3. Toggle between satellite and roadmap views
4. Try the pre-loaded locations (New York, Tokyo, London, etc.)

For questions or issues, check the SkySurfer documentation.
