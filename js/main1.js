mapboxgl.accessToken = 'pk.eyJ1Ijoia2VuZDBnIiwiYSI6ImNta3l3eXh2cDBjYnQzZ3B6d3E1MDJrc2EifQ.FzYTuZeZ1_BCWVc0yjHiBg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-98, 38],
  zoom: 3.6,
  projection: 'albers'
});

map.on('load', () => {
  // 1) load the rates geojson
  map.addSource('covidRates', {
    type: 'geojson',
    data: 'assets/us-covid-2020-rates2.json'
  });

  // 2) choropleth layer
  map.addLayer({
    id: 'rates-fill',
    type: 'fill',
    source: 'covidRates',
    paint: {
      'fill-color': [
        'step',
        ['get', 'rates'],
        '#f7fbff',   // < 10
        10, '#c6dbef',
        25, '#6baed6',
        50, '#2171b5',
        100, '#08306b'
      ],
      'fill-opacity': 0.85,
      'fill-outline-color': 'rgba(255,255,255,0.25)'
    }
  });

  // 3) popup on click
  map.on('click', 'rates-fill', (e) => {
    const p = e.features[0].properties;

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `<strong>${p.county}</strong><br>
         Case rate (per 1,000): <strong>${Number(p.rates).toFixed(1)}</strong>`
      )
      .addTo(map);
  });

  // 4) cursor change
  map.on('mouseenter', 'rates-fill', () => map.getCanvas().style.cursor = 'pointer');
  map.on('mouseleave', 'rates-fill', () => map.getCanvas().style.cursor = '');

  // 5) legend
  const legend = document.getElementById('legend');
  legend.innerHTML = `
    <strong>Cases per 1,000 (rates)</strong>
    <div class="legend-row"><span class="swatch" style="background:#f7fbff"></span>0–10</div>
    <div class="legend-row"><span class="swatch" style="background:#c6dbef"></span>10–25</div>
    <div class="legend-row"><span class="swatch" style="background:#6baed6"></span>25–50</div>
    <div class="legend-row"><span class="swatch" style="background:#2171b5"></span>50–100</div>
    <div class="legend-row"><span class="swatch" style="background:#08306b"></span>100+</div>
    <hr>
    <div style="font-size:10px; text-align:right;">
      Source: NYT (cases), ACS 2018 (pop), Census (counties)
    </div>
  `;
});
