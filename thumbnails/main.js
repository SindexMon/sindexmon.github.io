const SEARCH_BAR = document.getElementById("search");
const OUTPUT = document.getElementById("output");

const MAX_CONNS = 5;
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
const THUMB_TYPES = [
  "vi",
  "vi_webp"
];
const CDX_TEMPLATE = "https://web.archive.org/web/timemap/?url={url}*&fl=timestamp,original,statuscode,digest&pageSize=1&page=0&output=json";
const AVAIL_TEMPLATE = "https://archive.org/wayback/available?url={url}*";

let openConns = 0;

function createThumbnail(group, url) {
  const section = document.getElementById(group)
  const img = document.createElement("img")
  img["src"] = url
  
  document.getElementById("thumbbox").className = null
  section.className = "section"
  section.append(img)
}

function directImageCheck(group, url) {
  if (openConns >= MAX_CONNS) {
    console.log(`${openConns} open connections! Waiting...`)
    setTimeout(directImageCheck, 100, group, url);
    return;
  }

  openConns += 1;

  const img = new Image();
  img.onload = function() {
    openConns -= 1;
    createThumbnail(group, img.src);
  };
  img.onerror = function() {
    openConns -= 1;
  }
  img.src = url;
}

function parseCDX(content) {
  /*const digests = []*/
  const cdx = JSON.parse(content);

  /*for (const data of cdx) {
    if (data[0] !== "timestamp" && data[2] == "200" && !digests.includes(data[3])) {
      createThumbnail("wayback", `https://web.archive.org/web/${data[0]}/${data[1]}`)
      digests.push(data[3])
    }
  }*/
  if ("closest" in cdx["archived_snapshots"]) {
    const thumb_data = cdx["archived_snapshots"]["closest"];

    if (thumb_data["status"] == "200") {
      createThumbnail("wayback", thumb_data["url"].replace(/^https*:\/\/web.archive.org\/web\/(\d{14})/, "https://web.archive.org/web/$1id_"))
    }
  }
}

async function requestURL(url, method, group) {
  if (openConns >= MAX_CONNS) {
    console.log(`${openConns} open connections! Waiting...`)
    setTimeout(requestURL, 100, url, method, group);
    return;
  }

  openConns += 1;

  try {
    const response = await fetch(url, {method: method});

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    switch (group) {
      case "youtube":
        createThumbnail(group, url);
        break;
      case "wayback":
        parseCDX(await response.text())
        break;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  openConns -= 1;
}

function triggerSearch() {
  let video = "/" + SEARCH_BAR["value"] + "/";
  const matchData = video.match(/\W([A-Za-z0-9_-]{10}[AEIMQUYcgkosw048])\W/);
  if (matchData) {
    video = matchData[1];

    OUTPUT.innerHTML = `Checking YouTube...`;

    requestURL(`https://i.ytimg.com/vi/${video}/frame0.jpg`, "HEAD", "youtube")

    for (let i = 1; i <= 3; i++) {
      requestURL(`https://i.ytimg.com/vi/${video}/sd${i}.jpg`, "HEAD", "youtube")
    }

    let count = 0
    for (const domain of DOMAINS) {
      for (const format of THUMB_TYPES) {
        count += 500
        setTimeout(() => {
          requestURL(AVAIL_TEMPLATE.replace("{url}", `${domain}/${format}/${video}/`), "GET", "wayback")
          OUTPUT.innerHTML = `Checking ${domain} on the Wayback Machine...`;
        }, count)
      }
    }

    let count2 = 0
    for (const domain of OLD_DOMAINS) {
      for (let i = 0; i <= 3; i++) {
        count += 100
        setTimeout(() => {
          directImageCheck("wayback", `https://web.archive.org/web/0id_/http://${domain}/vi/${video}/${i}.jpg`)
          OUTPUT.innerHTML = `Checking ${domain} on the Wayback Machine...`;
        }, count + count2)
      }
    }

    /*OUTPUT.innerHTML = "Search done!";*/
  } else {
    OUTPUT.innerHTML = "Invalid video ID...";
  }
}

SEARCH_BAR.addEventListener("keydown", function(event) {
  if (event.key == "Enter") {
    triggerSearch();
  }
});