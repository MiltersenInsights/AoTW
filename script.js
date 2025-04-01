const sheetURL = "https://opensheet.elk.sh/2PACX-1vThbR473UBAX8180UMsGB9nwVuZ0-J3tjKIuN1jLqYOfeZKRXZsJVcSPUI-lpJoLzLLXXe__9utoFoA/json";

async function fetchAlbums() {
    try {
        const response = await fetch(sheetURL);
        const data = await response.json();

        if (data.length === 0) {
            console.error("No data found in the sheet");
            return;
        }

        // Get the latest album (assuming the most recent is at the bottom)
        const latestAlbum = data[data.length - 1];

        const currentAlbum = document.getElementById("current-album");
        if (currentAlbum) {
            currentAlbum.innerHTML = `<h2>${latestAlbum["Album name"]}</h2>
                                      <p>Posted by: ${latestAlbum["Person who posted it"]} on ${latestAlbum["Date Posted"]}</p>`;
        }

    } catch (error) {
        console.error("Error fetching album data", error);
    }
}

// Call function
fetchAlbums();
