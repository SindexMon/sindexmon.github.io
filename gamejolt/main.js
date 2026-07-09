const searchBar = document.getElementById("search");
const searchUser = document.getElementById("searchUser");
const pageCount = document.getElementById("page");

const perPageSelector = document.getElementById("numResults");
const sortSelector = document.getElementById("searchMode");
const buildCheckbox = document.getElementById("onlyBuilds");

const gameTemplate = document.getElementById("game");
const container = document.getElementById("games");

let resultsPerPage = 10;
let searchMode = 0;
let includeBuilds = false;

let gameData;
let numGames;
let searchResults = [];
let resultsIndex = 0;
let canSeeDeleted = false;

async function grabJSON(path) {
  const response = await fetch(path);
  const decompressionStream = new DecompressionStream('gzip');
  const decompressedStream = response.body.pipeThrough(decompressionStream);
  
  return await new Response(decompressedStream).json();
}

async function loadResults(start, changeMode = false) {
  if (start < searchResults.length || searchResults.length == 0) {
    resultsIndex = start;
    pageCount["value"] = start / resultsPerPage + 1;
    container.replaceChildren();
    document.querySelector("#photoDump").replaceChildren();

    if (searchResults.length == 0) return;
  } else {
    return;
  }

  if (changeMode) {
    switch (searchMode) {
      case 0:
        searchResults = searchResults.sort((a, b) => {
          if (a < b) return -1;
        });
        break;
      case 1:
        searchResults = searchResults.sort((a, b) => {
          if (a > b) return -1;
        });
        break;
      case 2:
        searchResults = searchResults.sort((a, b) => {
          if (gameData[a][3] > gameData[b][3]) return -1;
        });
    }
  }

  const canGoBackward = start != 0;
  document.getElementById("start").className = canGoBackward ? "enabled" : "";
  document.getElementById("prev").className = canGoBackward ? "enabled" : "";

  const canGoForward = start + resultsPerPage < searchResults.length;
  document.getElementById("next").className = canGoForward ? "enabled" : "";
  document.getElementById("end").className = canGoForward ? "enabled" : "";

  const maxResults = Math.min(searchResults.length, start + resultsPerPage);
  for (let i = start; i < maxResults; i++) {
    console.log(i);
    game = gameData[searchResults[i]];

    const game_id = game[0];
    const newGame = gameTemplate.content.cloneNode(true);
    newGame.querySelector("h3").textContent = game[2];
    newGame.querySelector(".views").textContent = `${game[3].toLocaleString()} view${game[3] == 1 ? "" : "s"}`;
    newGame.querySelector(".builds").textContent = `${game[6] == 0 ? "No builds" : (game[6] == 1 ? "1 build" : game[6] + " builds")} before June 25, 2015`;
    newGame.querySelector(".author").href = `https://gamejolt.com/profile/a/${game[1]}`;

    const thumbnail = newGame.querySelector(".thumbnail");
    thumbnail.src = `https://m.gjcdn.net/game-thumbnail/1000000000000000/${game_id}.png`;
    thumbnail.onerror = () => {
      thumbnail.remove();
    };

    if (game[7] == 0) {
      newGame.querySelector(".soundtrack").parentElement.remove()
    } else {
      newGame.querySelector(".soundtrack").href = `https://i.gjcdn.net/public-data/games/${Math.floor(game_id / 62500)}/${game_id % 250}/${game_id}/soundtracks/default/soundtrack.zip`;
    }

    const gameLink = newGame.querySelector(".gamePage");
    const gallery = newGame.querySelector(".gallery");

    let fixedTitle = game[2].toLowerCase().replaceAll(/[^a-z0-9]/g, "-");
    fixedTitle = fixedTitle.replaceAll(/-+/g, "-").replaceAll(/^-+|-+$/g, "");
    gameLink.href = `https://gamejolt.com/games/${fixedTitle}/${game_id}`
    
    if (canSeeDeleted) {
	    newGame.querySelector(".gameTick").src = "https://gamejolt.com/tick/game-view/" + game_id;
	    newGame.querySelector(".gameTick").onerror = function() {
	    	gameLink.style.color = "red";
	    	gameLink.textContent = "Deleted";
	    	return true;
	    };
    }
    
    const screenshots = game[8] ? game[8].split(" ") : null;
    const photosBtn = newGame.querySelector(".photos");
    photosBtn.addEventListener("click", function(event) {
      if (!event.target.classList.contains("active")) {
        event.target.classList.add("active");

        const newPhoto = document.createElement("img");
        newPhoto.src = `https://m.gjcdn.net/game-header/1000000000000000/${game_id}.png`;
        newPhoto.onerror = () => { newPhoto.remove(); };
        newPhoto.onload = () => { gallery.append(newPhoto); };
        newPhoto.className = "additional";
        
        if (screenshots) {
          for (let scr of screenshots) {
            let scrData = scr.split(".");
            const newScr = document.createElement("img");
            newScr.src = `https://i.gjcdn.net/public-data/games/${Math.floor(game_id / 62500)}/${game_id % 250}/${game_id}/screenshots/${game_id}_${scrData[0]}${Number(scrData[0]) < 16578 ? "" : "_orig"}.${scrData[1]}`;
            newScr.className = "additional";
            gallery.append(newScr);
          }
        }
      }
    });

    const newPhoto = document.createElement("img");
    newPhoto.src = `https://m.gjcdn.net/game-header/1000000000000000/${game_id}.png`;
    
    if (!game[7]) {
      newPhoto.onerror = () => { photosBtn.parentElement.remove(); };
    }

    document.querySelector("#photoDump").append(newPhoto);
    container.append(newGame);
  }
}

async function search(term) {
  searchResults = [];

  let yourTerm = searchBar["value"].toLowerCase().replaceAll(/[^a-z0-9 "]/g, "");
  let phrases = yourTerm.match(/("[^"]*")/g);

  if (phrases) {
    phrases.forEach(item => {
      yourTerm = yourTerm.replace(item, item.replaceAll(/[" ]/g, ""));
    });
  }

  yourTerm = yourTerm.replaceAll('"', "").split(" ");

  const userID = searchUser["value"] != "" ? Number(searchUser["value"]) : null;

  for (let i = 0; i < numGames; i++) {
    if (yourTerm.every(item => (gameData[i][9]).includes(item)) && (!userID || gameData[i][1] == userID) && (!includeBuilds || gameData[i][6] && gameData[i][6] > 0)) {
      searchResults.push(i)
    }
  }

  const numResults = searchResults.length;
  document.getElementById("resultCount").textContent = `${numResults.toLocaleString()} ${numResults == 1 ? "result" : "results"}`;
  loadResults(0, true);

  document.getElementById("pagination").style.display = "";
  document.getElementById("resultCount").style.display = "";
  document.getElementById("numResults").style.display = "";
  document.getElementById("searchMode").style.display = "";
  document.getElementById("buildSelect").style.display = "";
  
  if (!canSeeDeleted) {
    document.getElementById("notice").style.display = "";
  }
}

async function sendSearch(event) {
  if (event.key == "Enter") {
    search();
  }
}

async function init() {
  const testElem = document.createElement("img");
  testElem.src = "https://gamejolt.com/tick/game-view/2";
  testElem.style.width = "1px";
	testElem.onload = function() { canSeeDeleted = true; testElem.remove(); };
  document.body.append(testElem);

  gameData = await grabJSON("./data.json");
  numGames = gameData.length;

  for (let i = 0; i < numGames; i++) {
    gameData[i].push(gameData[i][2].toLowerCase().replace(/[^a-z0-9]/g, ""));
  }

  document.getElementById("loading").remove();
  alert("Loading complete!")
  
  searchBar.addEventListener("keydown", sendSearch);
  searchUser.addEventListener("keydown", sendSearch);

  pageCount.addEventListener("focus", () => { pageCount.value = ""; });
  searchBar.addEventListener("focus", () => { searchBar.style.zIndex = 1; searchUser.style.zIndex = 0; });
  searchUser.addEventListener("focus", () => { searchBar.style.zIndex = 0; searchUser.style.zIndex = 1; });

  pageCount.addEventListener("keydown", function(event) {
    if (event.key == "Enter") {
      loadResults((pageCount["value"] - 1) * resultsPerPage);
    }
  });

  document.getElementById("start").onclick = () => { loadResults(0); }
  document.getElementById("prev").onclick = () => { loadResults(Math.max(0, resultsIndex - resultsPerPage)); }
  document.getElementById("next").onclick = () => { loadResults(resultsIndex + resultsPerPage); }
  document.getElementById("end").onclick = () => { loadResults(Math.floor((searchResults.length - 1) / resultsPerPage) * resultsPerPage); }

  perPageSelector.addEventListener("change", (event) => {
    let oldCount = resultsPerPage;
    let oldPage = pageCount["value"] - 1;
    resultsPerPage = Number(perPageSelector["value"]);

    loadResults(Math.floor(oldCount * oldPage / resultsPerPage) * resultsPerPage);
  });

  sortSelector.addEventListener("change", (event) => {
    searchMode = Number(sortSelector["value"]);
    loadResults(0, true);
  });

  buildCheckbox.addEventListener("change", (event) => {
    includeBuilds = event.target.checked;
    search();
  });
}

init();