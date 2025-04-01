const sheetURL = "https://opensheet.elk.sh/2PACX-1vThbR473UBAX8180UMsGB9nwVuZ0-J3tjKIuN1jLqYOfeZKRXZsJVcSPUI-lpJoLzLLXXe__9utoFoA/Sheet1";

async function fetchAlbums() {
    try {
        const response = await fetch(sheetURL);
        const data = await response.json();

        // Show the latest album
        const currentAlbum = document.getElementById("current-album");
        currentAlbum.innerHTML = `<h2>${data[0].Album} by ${data[0].Artist} (${data[0].Year})</h2>`;

        // Show all albums in a grid
        const albumGrid = document.getElementById("album-grid");
        if (albumGrid) {
            albumGrid.innerHTML = data.map(album => `
                <div class="album">
                    <img src="${album.Cover}" alt="${album.Album}">
                    <p>${album.Album} - ${album.Artist} (${album.Year})</p>
                </div>
            `).join("");
        }
    } catch (error) {
        console.error("Error fetching album data", error);
    }
}

fetchAlbums();
