const SEARCH_BAR = document.getElementById("search");
const OUTPUT = document.getElementById("output");

const DOMAINS = [
  "i.ytimg.com",
  "i1.ytimg.com",
  "i2.ytimg.com",
  "i3.ytimg.com",
  "i4.ytimg.com",
]
const THUMB_TYPES = [
  "vi"
]
const CDX_TEMPLATE = "https://web.archive.org/web/timemap/?url={url}*&fl=timestamp,original,statuscode,digest&pageSize=1&page=0&output=json";
const AVAIL_TEMPLATE = "https://archive.org/wayback/available?url={url}*"

function createThumbnail(group, url) {
  const section = document.getElementById(group)
  const img = document.createElement("img")
  img["src"] = url
  
  document.getElementById("thumbbox").className = null
  section.className = "section"
  section.append(img)
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
}

function triggerSearch() {
  let video = "/" + SEARCH_BAR["value"] + "/";
  const matchData = video.match(/\W([A-Za-z0-9_-]{10}[AEIMQUYcgkosw048])\W/);
  if (matchData) {
    video = matchData[1];

    requestURL(`https://i.ytimg.com/vi/${video}/frame0.jpg`, "HEAD", "youtube")

    for (let i = 1; i <= 3; i++) {
      requestURL(`https://i.ytimg.com/vi/${video}/sd${i}.jpg`, "HEAD", "youtube")
    }

    let count = 1
    for (const domain of DOMAINS) {
      for (const format of THUMB_TYPES) {
        setTimeout(() => {
          requestURL(AVAIL_TEMPLATE.replace("{url}", `${domain}/${format}/${video}/`), "GET", "wayback")
        }, count * 2)

        count += 1
      }
    }
  } else {
    OUTPUT.innerHTML = "Invalid video ID...";
  }
}

SEARCH_BAR.addEventListener("keydown", function(event) {
  if (event.key == "Enter") {
    triggerSearch();
  }
});