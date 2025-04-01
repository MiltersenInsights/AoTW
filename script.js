fetch('albums.json')
  .then(response => response.json())
  .then(data => {
      let latestAlbum = data[0]; // Assuming the latest album is first in the JSON

      document.getElementById('album-title').textContent = latestAlbum.Album;
      document.getElementById('posted-by').textContent = latestAlbum["Posted by"];
      document.getElementById('posted-date').textContent = latestAlbum.Date;

      document.getElementById('album-cover').src = latestAlbum.Cover;
      document.getElementById('album-cover').alt = `Cover of ${latestAlbum.Album}`;

      document.getElementById('spotify-link').href = latestAlbum.Spotify;
  })
  .catch(error => console.error('Error loading album:', error));
