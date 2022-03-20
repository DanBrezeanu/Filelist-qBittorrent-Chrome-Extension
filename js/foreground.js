const download = (img, parent) => {
    download_link = (new URL(parent.children[4].querySelector("a").getAttribute("href"), location)).href
    
    chrome.runtime.sendMessage({action: "download", link: download_link}, function(response) {
        if (response.code == 0) {
            img.src = chrome.runtime.getURL("images/check.png")
        } else {
            img.src = chrome.runtime.getURL("images/cross.png")
        }
    });
    return true
}

const nasElement = (parent) => {
    var tag = document.createElement("div");
    tag.className = "torrenttable"
    tag.setAttribute("align", "center")

    var span = document.createElement("span");
    span.setAttribute("style", "width:30px;height:47px;vertical-align:middle;display:table-cell;")

    var a = document.createElement("a");
    a.href = "javascript:void(0);"

    var img = document.createElement("img");    
    img.src = chrome.runtime.getURL("images/qbit_icon.png")
    img.onclick = () => {download(img, parent)}

    a.appendChild(img)
    span.appendChild(a)
    tag.appendChild(span);

    return tag
}

root = document.querySelector("div.visitedlinks")
try {
    root.insertBefore(root.children[2].cloneNode(true), root.children[2]) 
    root.removeChild(root.children[11]) 
    torrentrows = document.getElementsByClassName('torrentrow')

    for (var i = 0; i < torrentrows.length; i++) {
        torrentrows[i].insertBefore(nasElement(torrentrows[i]), torrentrows[i].children[2]);
        torrentrows[i].removeChild(torrentrows[i].children[11])
    }
} catch {}




