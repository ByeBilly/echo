export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Google Maps API key not configured",
        message: "Add GOOGLE_MAPS_API_KEY to your Vercel environment variables",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  const scriptContent = `
    (function() {
      if (window.googleMapsReady || window.googleMapsInitializing) return;
      
      window.googleMapsInitializing = true;
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geocoding&v=weekly';
      script.async = true;
      script.defer = true;
      
      script.onload = function() {
        window.googleMapsReady = true;
        window.googleMapsInitializing = false;
        window.dispatchEvent(new CustomEvent('googleMapsInitialized'));
        console.log('[v0] Google Maps loaded successfully');
      };
      
      script.onerror = function(error) {
        window.googleMapsError = 'Failed to load Google Maps - check your API key and domain restrictions';
        window.googleMapsInitializing = false;
        window.dispatchEvent(new CustomEvent('googleMapsInitError'));
        console.error('[v0] Google Maps failed to load:', error);
      };
      
      document.head.appendChild(script);
    })();
  `

  return new Response(scriptContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
