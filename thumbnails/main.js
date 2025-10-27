const SEARCH_BAR = document.getElementById("search");
const OUTPUT = document.getElementById("output");

const MAX_CONNS = 5;
const QUALITIES = ["sd", "mq", "hq", "maxres"];
const DOMAINS = [
  "img.youtube.com",
  "i.ytimg.com",
  "i1.ytimg.com",
  "i2.ytimg.com",
  "i3.ytimg.com",
  "i4.ytimg.com",
  "i9.ytimg.com",
  "s.ytimg.com",
  "s1.ytimg.com",
  "s2.ytimg.com",
  "s3.ytimg.com",
  "s4.ytimg.com",
  "0.gvt0.com",
  "1.gvt0.com",
  "2.gvt0.com",
  "3.gvt0.com"
];
const OLD_DOMAINS = [
  "sjc-static1.sjc.youtube.com",
  "sjc-static2.sjc.youtube.com",
  "sjc-static3.sjc.youtube.com",
  "sjc-static4.sjc.youtube.com",
  "sjc-static5.sjc.youtube.com",
  "sjc-static6.sjc.youtube.com",
  "sjc-static7.sjc.youtube.com",
  "sjc-static8.sjc.youtube.com",
  "sjc-static9.sjc.youtube.com",
  "sjc-static10.sjc.youtube.com",
  "sjc-static11.sjc.youtube.com",
  "sjc-static12.sjc.youtube.com",
  "sjc-static13.sjc.youtube.com",
  "sjc-static14.sjc.youtube.com",
  "sjc-static15.sjc.youtube.com",
  "sjc-static16.sjc.youtube.com",
  "sjc-static17.sjc.youtube.com",
  "sjc-static18.sjc.youtube.com",
  "sjc-static19.sjc.youtube.com",
  "sjc-static21.sjc.youtube.com",
  "sjc-static22.sjc.youtube.com",
  "sjc-static23.sjc.youtube.com",
  "sjc-static27.sjc.youtube.com",
  "sjc-static28.sjc.youtube.com",
  "sjc-static29.sjc.youtube.com",
  "sjc-static30.sjc.youtube.com",
  "sjc-static31.sjc.youtube.com",
  "sjc-static34.sjc.youtube.com",
  "sjc-static35.sjc.youtube.com",
  "sjl-static1.sjl.youtube.com",
  "sjl-static2.sjl.youtube.com",
  "sjl-static3.sjl.youtube.com",
  "sjl-static4.sjl.youtube.com",
  "sjl-static5.sjl.youtube.com",
  "sjl-static6.sjl.youtube.com",
  "sjl-static7.sjl.youtube.com",
  "sjl-static8.sjl.youtube.com",
  "sjl-static9.sjl.youtube.com",
  "sjl-static10.sjl.youtube.com",
  "sjl-static11.sjl.youtube.com",
  "sjl-static12.sjl.youtube.com",
  "sjl-static13.sjl.youtube.com",
  "sjl-static14.sjl.youtube.com",
  "sjl-static15.sjl.youtube.com",
  "sjl-static16.sjl.youtube.com"
];
const STATIC_DOMAINS = [
  "static.youtube.com",
  "static08.youtube.com"
];
const THUMB_TYPES = [
  "vi",
  "vi_webp"
];
const AVAIL_TEMPLATE = "https://archive.org/wayback/available?url=";

let openConns = 0;
let lastSearch = null;

function verifyConn(func, args) {
  if (openConns >= MAX_CONNS) {
    //console.log(`${openConns} open connections! Waiting...`);
    setTimeout(func, 100, ...args);
  } else {
    openConns += 1;
    return true;
  }
}

function createThumbnail(url, group, cdxURL) {
  if (cdxURL) {
    // Means there's a new connection
    if (!verifyConn(createThumbnail, arguments)) {
      return;
    }
  }

  const section = document.getElementById(group);
  const container = document.createElement("div");
  const img = document.createElement("img");
  img.className = "thumbnail";

  img.onload = function() {
    openConns -= 1;
    document.getElementById("thumbbox").className = "";
    section.className = "section"
    section.append(container)
  };

  img.onerror = function() {
    openConns -= 1;
  };

  img["src"] = url;
  container.append(img);

  if (cdxURL) {
    const label = document.createElement("a");
    label.href = "https://web.archive.org/web/*/" + cdxURL.substring(47);
    label.target = "_blank";
    label.title = "See more from this domain";
    label.innerHTML = "?";
    label.className = "cdxNotice";
    container.append(label);
  }

  document.getElementById("preloader").append(container)
}

function parseCDX(url, content) {
  const cdx = JSON.parse(content);

  if ("closest" in cdx["archived_snapshots"]) {
    const thumb_data = cdx["archived_snapshots"]["closest"];

    if (thumb_data["status"] == "200") {
      createThumbnail(thumb_data["url"].replace(/^https*:\/\/web.archive.org\/web\/(\d{14})/, "https://web.archive.org/web/$1id_"), "wayback", url)
    }
  }
}

async function requestURL(url, group, method) {
  if (!verifyConn(requestURL, arguments)) {
    return;
  }

  if (method) {
    try {
      const response = await fetch(url, {method: method});
      openConns -= 1;

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      switch (group) {
        case "wayback":
          parseCDX(url, await response.text());
          break
        case "youtube":
          createThumbnail(url, group);
        default:
          return await response.text()
      }
    } catch (error) {
      if (error != "Error: 404") {
        console.error("Request error:", error)
      } else if (error == "429") {
        console.error("Rate limited!")
        OUTPUT.innerHTML = "Too many requests! Close any Wayback Machine tabs and try again later.";
      }

      openConns -= 1;
    }
  } else {
    createThumbnail(url, group);
  }
}

let totalDelay = 0;

function delayedFetch(url, group, delay, method) {
  setTimeout(() => {
    requestURL(url, group, method);
  }, totalDelay);

  totalDelay += delay;
}

function prefireMessage(msg) {
  setTimeout(() => {
    OUTPUT.innerHTML = msg;
  }, totalDelay);
}

function checkIfFinished() {
  if (openConns > 0) {
    setTimeout(checkIfFinished, 100);
    return;
  }

  OUTPUT.innerHTML = "Finished!";
}

function triggerSearch(searchValue, prefix) {
  totalDelay = Math.max(0, totalDelay - (Date.now() - lastSearch))
  lastSearch = Date.now();

  let video = "/" + searchValue + "/";
  const matchData = video.match(/\W([A-Za-z0-9_-]{10}[AEIMQUYcgkosw048])\W/);

  if (matchData) {
    video = matchData[1];

    OUTPUT.innerHTML = `Checking YouTube...`;

    requestURL(`https://i.ytimg.com/vi/${video}/frame0.jpg`, "youtube", "HEAD");

    for (const q of QUALITIES) {
      for (let i = 1; i <= 3; i++) {
        requestURL(`https://i.ytimg.com/vi/${video}/${q}${i}.jpg`, "youtube", "HEAD");
      }
    }
    
    for (const domain of DOMAINS) {
      prefireMessage(`Checking ${domain} on the Wayback Machine...`);
      for (const format of THUMB_TYPES) {
        delayedFetch(AVAIL_TEMPLATE + prefix + `${domain}/${format}/${video}/*`, "wayback", 200, "GET");
      }
    }

    prefireMessage("Checking i9.ytimg.com on the Wayback Machine...");
    delayedFetch(AVAIL_TEMPLATE + prefix + `i9.ytimg.com/vi_blogger/${video}/*`, "wayback", 200, "GET");

    for (const domain of OLD_DOMAINS) {
      prefireMessage(`Checking ${domain} on the Wayback Machine...`);
      for (let i = 0; i <= 3; i++) {
        delayedFetch(`https://web.archive.org/web/0id_/http://${domain}/vi/${video}/${i}.jpg`, "wayback", 100);
      }
    }

    for (const domain of STATIC_DOMAINS) {
      prefireMessage(`Checking ${domain} on the Wayback Machine...`);
      delayedFetch(`https://web.archive.org/web/0id_/http://${domain}/get_still.php?video_id=${video}`, "wayback", 100);
      for (let i = 1; i <= 3; i++) {
        delayedFetch(`https://web.archive.org/web/0id_/http://${domain}/get_still.php?video_id=${video}&still_id=${i}`, "wayback", 100);
      }
    }

    setTimeout(checkIfFinished, totalDelay);
  } else {
    OUTPUT.innerHTML = "Invalid video ID...";
  }
}

// Ensure a verified archive is present - otherwise, user is rate-limited (no results).
// Strangely, changing URLs fixes this. Since a URL's protocol is stripped on the backend, changing it fixes the problem.
// Any protocol is allowed, as long as it begins with a letter.
async function confirmSearch(searchValue) {
  const verifyTemplate = "https://archive.org/wayback/available?url=a{}://i1.ytimg.com/vi/TPAWpHG3RWY/*"
  
  for (let i = 0; i < 10; i++) {
    const cdxContent = await requestURL(verifyTemplate.replace("{}", i), "none", "GET");
    if (cdxContent.includes("closest")) {
      triggerSearch(searchValue, `a${i}://`);
      return;
    }
  }

  OUTPUT.innerHTML = "API is blocked; try again later!";
}

SEARCH_BAR.addEventListener("keydown", function(event) {
  if (event.key == "Enter") {
    confirmSearch(SEARCH_BAR["value"]);
  }
});