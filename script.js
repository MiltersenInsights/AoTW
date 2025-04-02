fetch("https://opensheet.elk.sh/1-w0wJOoCeoN9KCt2J_wIaDQ5tB_FPJV0q9RHF7xzRvw/json")
  .then(response => response.json())
  .then(data => {
      if (data.length === 0) {
          console.error("No albums found");
          return;
      }

      let latestAlbum = data[data.length - 1]; // Get the last posted album

      // Extract album details
      const albumTitle = latestAlbum.Album || "Unknown Album";
      const postedBy = latestAlbum["Posted by"] || "Unknown";
      const datePosted = latestAlbum.Date || "Unknown Date";
      const coverImage = latestAlbum["Cover Image"] || "https://via.placeholder.com/400";
      const spotifyLink = latestAlbum["Spotify Link"] || "#";
      const posterComment = latestAlbum["Poster Comment"] || "";

      // Update the page content
      document.getElementById("album-title").textContent = albumTitle;
      document.getElementById("posted-by").textContent = `Posted by: ${postedBy}`;
      document.getElementById("posted-date").textContent = `Date: ${datePosted}`;
      document.getElementById("album-cover").src = coverImage;
      document.getElementById("album-cover").alt = `Cover of ${albumTitle}`;
      document.getElementById("spotify-link").href = spotifyLink;

      // Handle the optional poster comment
      const commentElement = document.getElementById("poster-comment");
      if (posterComment) {
          commentElement.textContent = `"${posterComment}"`;
          commentElement.style.display = "block"; // Show it if there is a comment
      } else {
          commentElement.style.display = "none"; // Hide if no comment
      }
  })
  .catch(error => console.error("Error loading album:", error));
