mapboxgl.accessToken = 'pk.eyJ1Ijoia2VuZDBnIiwiYSI6ImNta3l3eXh2cDBjYnQzZ3B6d3E1MDJrc2EifQ.FzYTuZeZ1_BCWVc0yjHiBg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-98, 38],
  zoom: 3.6,
  projection: 'albers'
});

map.on('load', () => {
  // Load counts geojson
  map.addSource('covidCounts', {
    type: 'geojson',
    data: 'assets/us-covid-2020-counts.json'
  });

  // Proportional symbol (circle) layer
  map.addLayer({
    id: 'cases-circles',
    type: 'circle',
    source: 'covidCounts',
    paint: {
      // circle size based on cases
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'cases'],
        0, 0.5,
        1000, 2,
        10000, 5,
        50000, 10,
        200000, 18
      ],

      // color based on cases
      'circle-color': [
        'step',
        ['get', 'cases'],
        '#fee5d9',
        10000, '#fcae91',
        50000, '#fb6a4a',
        200000, '#cb181d'
      ],

      'circle-opacity': 0.65,
      'circle-stroke-color': 'white',
      'circle-stroke-width': 1
    }
  });

  // Popup on click
  map.on('click', 'cases-circles', (e) => {
    const p = e.features[0].properties;

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `<strong>${p.county}</strong><br>
         Total cases: <strong>${Number(p.cases).toLocaleString()}</strong>`
      )
      .addTo(map);
  });

  // Cursor pointer
  map.on('mouseenter', 'cases-circles', () => map.getCanvas().style.cursor = 'pointer');
  map.on('mouseleave', 'cases-circles', () => map.getCanvas().style.cursor = '');

  // Legend
  const legend = document.getElementById('legend');
  legend.innerHTML = `
    <strong>Total cases</strong>
    <div style="font-size:11px; margin-top:6px;">Circle size = more cases</div>

    <div style="margin-top:8px;"><strong>Color bins</strong></div>
    <div class="legend-row"><span class="swatch" style="background:#fee5d9"></span>0–9,999</div>
    <div class="legend-row"><span class="swatch" style="background:#fcae91"></span>10k–49,999</div>
    <div class="legend-row"><span class="swatch" style="background:#fb6a4a"></span>50k–199,999</div>
    <div class="legend-row"><span class="swatch" style="background:#cb181d"></span>200k+</div>

    <hr>
    <div style="font-size:10px; text-align:right;">
      Source: NYT (cases), Census (counties)
    </div>
  `;
});
