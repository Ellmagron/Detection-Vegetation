let map;
let currentMarker = null;
let circle = null;

function initMap() {
  // Inicializa o mapa com a visão de satélite inclinada
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: { lat: -23.615034, lng: -46.570869 },
    mapTypeId: "satellite", // Define o tipo de mapa como satélite
    tilt: 50, // Ativa a visão inclinada
  });

  // Adiciona um listener de clique no mapa
  map.addListener("click", function (event) {
    addAdvancedMarker(event.latLng);
  });

  // Espera até que o mapa esteja totalmente carregado
  google.maps.event.addListenerOnce(map, "tilesloaded", function () {
    console.log("Map fully loaded");
  });
}

function addAdvancedMarker(location) {
  // Remove o marcador anterior, se existir
  if (currentMarker) {
    currentMarker.setMap(null);
  }

  // Adiciona o novo marcador
  currentMarker = new google.maps.Marker({
    position: location,
    map: map,
    title: "New Marker",
  });

  // Captura a área ao redor do marcador para análise
  captureAreaAroundMarker(location);
}

async function captureAreaAroundMarker(location) {
  if (circle) {
    circle.setMap(null);
  }

  // Define o tamanho da área que você deseja capturar (100 metros ao redor do marcador)
  const radiusInMeters = 100; // 100 metros
  const circleOptions = {
    center: location,
    radius: radiusInMeters,
    fillColor: "blue", // Cor opcional do círculo para visualização
    fillOpacity: 0.2, // Opacidade do preenchimento do círculo
    strokeWeight: 0, // Sem borda visível
  };

  // Adiciona um círculo temporário ao mapa para visualização
  circle = new google.maps.Circle(circleOptions);
  circle.setMap(map);

  // Cria uma URL para a imagem estática do Google Maps com os parâmetros necessários
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat()},${location.lng()}&zoom=19&size=640x640&maptype=satellite&markers=color:red%7C${location.lat()},${location.lng()}&key=AIzaSyCvhf5yEe1EjyOvgucgNgf8EcuPmEJFK7c`;

  // Exibe a URL da imagem estática para debug (opcional)
  console.log("Static Map URL:", staticMapUrl);

  // Baixa a imagem estática
  try {
    const response = await fetch(staticMapUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Cria um link temporário para download e dispara o download
    const link = document.createElement("a");
    link.href = url;
    link.download = "map.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Libera a URL do objeto
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao baixar a imagem estática:", error);
  }

  // Remove o círculo do mapa após alguns segundos (opcional)
  setTimeout(() => {
    circle.setMap(null);
  }, 3000); // Remove após 3 segundos (ajuste conforme necessário)
}

// Load the Google Maps API dynamically and set the initMap function globally
function loadGoogleMapsAPI() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCvhf5yEe1EjyOvgucgNgf8EcuPmEJFK7c&callback=initMap&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Ensure initMap is globally accessible
window.initMap = initMap;

// Load the Google Maps API
loadGoogleMapsAPI();
