const sheetURL = "https://opensheet.elk.sh/1-w0wJOoCeoN9KCt2J_wIaDQ5tB_FPJV0q9RHF7xzRvw/json";

async function fetchAlbums() {
    try {
        const response = await fetch(sheetURL);
        const data = await response.json();

        if (data.length === 0) {
            console.error("No data found in the sheet");
            return;
        }

        // Get the latest album (last row)
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

// Run function when page loads
fetchAlbums();
