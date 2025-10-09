const COLLECTION = document.getElementById("collection")
const SECTIONS = {
  "wall": ["8112A66C", "8112A66E"],
  "floor": ["81129EA4", "81129EA6"]
  //"ceiling": ["BAADF00D", "BAADF00D"]
}
const TEXTURE_DATA = {
  "black.png": "11008800",
  "toad.png": "06005920",
  "1E52081102_all.png": "09001000",
  "0303136F02_all.png": "09000000",
  "730DA5F202_all.png": "09002000",
  "9BE30B6E02_all.png": "09003000",
  "022F69E302_all.png": "09003800",
  "7A6AB5A702_all.png": "09004000",
  "M64Texture_670_14231427.png": "09004800",
  "A6463A8D02_all.png": "09005000",
  "M64Texture_672_14235523.png": "09005800",
  "M64Texture_673_14237571.png": "09006000",
  "M64Texture_674_14241667.png": "09007000",
  "4EEEFE7D02_all.png": "09008000",
  "M64Texture_676_14247811.png": "09008800",
  "9FCDDCE102_all.png": "09009000",
  "9FCDDCE103_all.png": "09009800",
  "0D48755602_all.png": "0900A000",
  "370FC06B02_all.png": "0900B000",
  "59D072F002_all.png": "0900B800"
}
const NUM_TEXTURES = TEXTURE_DATA.length

let selectedTex = null

function onTextureClick(name, elem) {
  if (selectedTex == name) {
    elem.classList.remove("selected")
    selectedTex = null
  } else {
    if (selectedTex) {
      document.getElementsByClassName("selected")[0].classList.remove("selected")
    }
    elem.classList.add("selected")
    selectedTex = name
  }
}

function onOptionClick(name, elem) {
  const codeElem = document.getElementsByName(name)[0]
  const imageElem = elem.getElementsByTagName("img")[0]
  const imageSrc = `images/textures/${selectedTex}`
  console.log(imageElem["src"], imageSrc)

  if (selectedTex && imageElem["src"].indexOf(imageSrc) == -1) {
    const hex = TEXTURE_DATA[selectedTex]
    codeElem.innerHTML = `${SECTIONS[name][0]} ${hex.substring(0, 4)}<br/>${SECTIONS[name][1]} ${hex.substring(4)}<br/>`
    imageElem["src"] = imageSrc
    imageElem.className = "loaded"
  } else {
    codeElem.innerHTML = ""
    imageElem["src"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR4AQEFAPr/AAAAAAAABQABZHiVOAAAAABJRU5ErkJggg=="
    imageElem.className = "unloaded"
  }
}

for (const name in TEXTURE_DATA) {
  const hex = TEXTURE_DATA[name]
  const element = document.createElement("div")
  element.className = "texture button"
  element.innerHTML = `<span>0x${hex}</span><img src="images/textures/${name}"/>`
  element.onclick = function() {
    onTextureClick(name, element)
  }

  COLLECTION.appendChild(element)
}

for (const name in SECTIONS) {
  const element = document.getElementById(name)
  element.onclick = function() {
    onOptionClick(name, element)
  }

}
