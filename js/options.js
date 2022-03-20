document.addEventListener('DOMContentLoaded', restore_options);

function restore_options() {
    document.getElementById('save').addEventListener('click', saveDetails);
    document.getElementById('test').addEventListener('click', testConnection);

    chrome.storage.local.get(['qbitURL', 'qbitUser', 'qbitPassword', 'qbitDeleteFiles'], (res) => {
        Object.entries(res).forEach(([k,v]) => {
            document.querySelector("#" + k).value = v
            document.querySelector("#" + k).checked = v
        })
    })
}

function getFormData() {
    qbitURL = document.querySelector("#qbitURL").value
    qbitUser = document.querySelector("#qbitUser").value
    qbitPassword = document.querySelector("#qbitPassword").value
    qbitDeleteFiles = document.querySelector("#qbitDeleteFiles").checked

    return {qbitURL, qbitUser, qbitPassword, qbitDeleteFiles}
}

function responseMessageHTML(msg, failed) {
    colorClass = failed ? "danger" : "success"
    icon = failed ? "times" : "check"

    return `\
    <div class="text-${colorClass} border-3 border border-${colorClass} rounded"> \
        <div class="row"> \
            <p class="my-4 mx-4"> \
            <span class="fa-stack fa-1x" style="flex-shrink: 0;"> \
                <i class="fas fa-circle fa-stack-2x"></i> \
                <i class="fas fa-${icon} fa-stack-1x fa-inverse"></i> \
            </span> \
            ${msg} \
            </p> \
        </div> \
    </div>`
}

function saveDetails() {
    let {qbitURL, qbitUser, qbitPassword, qbitDeleteFiles} = getFormData()

    chrome.storage.local.set(
        {qbitURL, qbitUser, qbitPassword, qbitDeleteFiles},
        (res) => {
            document.querySelector("#message-log").innerHTML = responseMessageHTML(
                "Successfully saved the connection details.", false
            )
        }
    )
    return false
}

function testConnection() {
    let {qbitURL, qbitUser, qbitPassword, _} = getFormData()

    fetch(qbitURL + "/api/v2/auth/login", {
        method: "POST",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
        body: "username=" + qbitUser + "&password=" + qbitPassword
    })
    .then(async (res) => {
        response = await res.text()
        if (response == "Ok.") {
            document.querySelector("#message-log").innerHTML = responseMessageHTML(
                "Successfully connected to the qBittorrent instance.", false
            )
        } else {
            document.querySelector("#message-log").innerHTML = responseMessageHTML(
                "Invalid credentials.", true
            )
        }
    })
    .catch((error) => {
        document.querySelector("#message-log").innerHTML = responseMessageHTML(
            error, true
        )
    });
}



