chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && tab.active) {
        if (/^https:\/\/.*filelist.io.*/.test(tab.url)) {
            chrome.scripting.executeScript({target: {tabId: tabId, allFrames: true}, files: ['./js/foreground.js'] })
        }
    }
})

async function upload_to_qbit(id, filepath, sendResponse) {
    details = await chrome.storage.local.get(
        ['qbitURL', 'qbitUser', 'qbitPassword', 'qbitDeleteFiles']
    )

    fetch(`${details['qbitURL']}/api/v2/auth/login`, {
        method: "POST",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
        body: `username=${details['qbitUser']}&password=${details['qbitPassword']}`
    }).then(async (res) => {
        response_text = await res.text()
        if (response_text != "Ok.") {
            sendResponse({"message": res.status, "code": 1})
            return
        }
        
        file_uri = new URL("file://" + filepath).pathname

        fetch("file://" + filepath, {method: "GET"})
        .then(async (res) => {    
            file_blob = await (await res.body.getReader().read()).value
            filename = file_uri.split("/").pop()
            f = new File([file_blob], filename, { type: 'application/x-bittorrent' })

            const formData = new FormData();
            formData.set('torrents', f)

            fetch(`${details['qbitURL']}/api/v2/torrents/add`, {
                method: 'POST',
                body: formData
            }).then(async (res) => {
                response_text = await res.text()
                if (response_text != "Ok.") {
                    sendResponse({"message": res.status, "code": 1})
                    return
                }
                
                if (details["qbitDeleteFiles"])
                    chrome.downloads.removeFile(id)

                sendResponse({"response": "ok", "code": 0})
            }).catch((error) => {sendResponse({"message": error, "code": 1})});
        }).catch((error) => {sendResponse({"message": error, "code": 1})});
    }).catch((error) => {sendResponse({"message": error, "code": 1})});
}

function download_file(request, sendResponse) {
    function onChanged({id, state}) {
        if (state && state.current !== 'in_progress') {
            chrome.downloads.onChanged.removeListener(onChanged);
            chrome.downloads.search({"id": id}, (results) => {
                upload_to_qbit(id, results[0].filename, sendResponse)
            })
        }
    }

    chrome.downloads.download({
            url: request.link,
        },
        (_) => {chrome.downloads.onChanged.addListener(onChanged);}
    )
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "download") {
            download_file(request, sendResponse)
        }
        return true
});