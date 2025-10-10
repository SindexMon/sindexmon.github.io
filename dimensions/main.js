const COLLECTION = document.getElementById("collection")
const SECTIONS = {
  "wall": ["8112A66C", "8112A66E"],
  "floor": ["81129EA4", "81129EA6"],
  "ceiling": ["8112A574", "8112A576"]
}
const TEXTURE_DATA = ['01004500', '02014AB8', '020152B8', '02015AB8', '020162B8', '02016AB8', '03000080', '03000A08', '03001208', '03001A08', '03002208', '03002A08', '03003208', '03003A08', '030043A8', '03004BA8', '03005780', '03005F80', '03006780', '03006F80', '03007E40', '03008640', '03009168', '03009D10', '0300A510', '0300AD10', '0300B510', '0300BD10', '0300C510', '0300CD10', '0300D510', '0300DD10', '0300E510', '0300ED10', '0300F510', '0300FD10', '03010510', '03010D10', '03011510', '03011D10', '03012510', '03012D10', '03013510', '03017320', '03017B20', '03018320', '03018B20', '03019320', '03019B20', '0301A320', '0301AB20', '0301B5E0', '0301C300', '0301CBE0', '0301CF50', '0301DF50', '0301E750', '0301EF50', '0301F750', '0301FF50', '03020750', '03020F50', '03021750', '03021F50', '030233E0', '03023BE0', '030243E0', '03024BE0', '030253E0', '03025BE0', '030263E0', '03026BE0', '030273E0', '03027BE0', '030283E0', '03028BE0', '03029628', '03029E28', '0302A6F0', '0302AEF0', '0302BAD0', '0302BDF8', '0302C6A0', '0302C9C8', '0302D1C8', '0302DE28', '0302E628', '0302EE28', '0302F628', '0302FF60', '03030760', '03031048', '03031848', '03032218', '03032A18', '04000090', '04001090', '04001890', '04002090', '04002890', '04003090', '04003890', '04004090', '04004890', '04005090', '04005890', '04006090', '04006890', '04007090', '04007890', '04008090', '04008890', '04009090', '04009890', '0400A090', '0400A890', '0400B090', '0400B890', '0401CD60', '0401D560', '04021800', '04022148', '04022948', '04023148', '04023948', '04024148', '04024948', '04027490', '04027C90', '04028490', '04028C90', '04029490', '04029C90', '0402A5CB', '0402ADCB', '0402B5C8', '0402BDC8', '0402C5C8', '0402CDC8', '0402D5C8', '0402DDC8', '0402E5C8', '0402EDC8', '0402F5C8', '0402FDC8', '040305C8', '04030DC8', '040315C8', '04031DC8', '04032780', '04032A88', '04033288', '04033A88', '04034288', '04034A88', '06000000', '06000800', '06001800', '06002800', '06003000', '06003800', '06005920', '06006120', '0600FC70', '06015760', '06016760', '07000000', '07000800', '07001000', '07001800', '07002000', '07002800', '07003000', '07003800', '07004000', '07004800', '07005000', '07005800', '07006000', '07006800', '07007000', '07007800', '07008000', '07008800', '07009000', '07009800', '0700A000', '0700A800', '0700B800', '0700C800', '0700D800', '0700E800', '0700F800', '07011800', '07012800', '07013800', '07014800', '07015800', '07016800', '07017000', '07017800', '07018800', '07019800', '0701A800', '0701B800', '0701C800', '0701D800', '0701E800', '0701F800', '07020800', '09000000', '09001000', '09002000', '09002800', '09003000', '09003800', '09004000', '09004800', '09005000', '09005800', '09006000', '09006800', '09007000', '09007800', '09008000', '09008800', '09009000', '09009800', '0900A000', '0900A800', '0900B000', '0900B800']
const NUM_TEXTURES = TEXTURE_DATA.length

let selectedTex = null

function onTextureClick(hex, elem) {
  if (selectedTex == hex) {
    elem.classList.remove("selected")
    selectedTex = null
  } else {
    if (selectedTex) {
      document.getElementsByClassName("selected")[0].classList.remove("selected")
    }
    elem.classList.add("selected")
    selectedTex = hex
  }
}

function onOptionClick(name, elem) {
  const codeElem = document.getElementsByName(name)[0]
  const imageElem = elem.getElementsByTagName("img")[0]
  const imageSrc = `images/textures/${selectedTex}.png`
  console.log(imageElem["src"], imageSrc)

  if (selectedTex && imageElem["src"].indexOf(imageSrc) == -1) {
    codeElem.innerHTML = `${SECTIONS[name][0]} ${selectedTex.substring(0, 4)}<br/>${SECTIONS[name][1]} ${selectedTex.substring(4)}<br/>`
    imageElem["src"] = imageSrc
    imageElem.className = "loaded"
  } else {
    codeElem.innerHTML = ""
    imageElem["src"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR4AQEFAPr/AAAAAAAABQABZHiVOAAAAABJRU5ErkJggg=="
    imageElem.className = "unloaded"
  }
}

for (const index in TEXTURE_DATA) {
  const hex = TEXTURE_DATA[index]
  const element = document.createElement("div")
  element.className = "texture button"
  element.innerHTML = `<span>0x${hex}</span><img src="images/textures/${hex}.png"/>`
  element.onclick = function() {
    onTextureClick(hex, element)
  }

  COLLECTION.appendChild(element)
}

for (const name in SECTIONS) {
  const element = document.getElementById(name)
  element.onclick = function() {
    onOptionClick(name, element)
  }
}