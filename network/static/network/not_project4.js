document.addEventListener('DOMContentLoaded', function () {
    page(1);
});


function page(number, username, id) {
    var loadingScreen = document.getElementById("loading-screen");
    loadingScreen.style.display = "flex";
    fetch('/post', {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            number: number,
            username: username
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.posts[0]['date'] == 'Not forever') {
                loadingScreen.style.display = "none";
            }
            var parent = document.querySelector('#person')
            if (response.result.username != null && response.result.username != 'false') {
                if (response.result.followed != null) {
                    if (response.result.followed == true) {
                        var button = `<img src="/static/network/followed.png" onclick="follow('${response.result.username}')">`
                    }
                    if (response.result.followed == false) {
                        var button = `<img src="/static/network/not_followed.png" onclick="follow('${response.result.username}')">`
                    }
                }
                else {
                    var button = ``
                }
                parent.innerHTML = `<center><h2> ${response.result.username}</h2>` + button +
                    `</center><div class="followers_follow"><h3>${response.result.followers} followers</h3><h3 style="position: absolute; right: 0; ">following ${response.result.reading}</h3></div>`

                parent.style.display = 'block'
            }
            else {
                parent.innerHTML = ``
            }

            document.querySelectorAll('.paginator').forEach(element => {
                let pagination = ``
                let number = response.result.number
                let maximum = response.result.maximum
                let username = response.result.username
                let id = response.result.id
                element.style.display = 'block'
                if (maximum == 1) {
                    element.style.display = 'none'
                }
                else if (number == 1) {
                    pagination = ` <li class="page-item disabled"> <a class="page-link" tabindex="-1" aria-disabled="true">First</a> </li>
                                <li class="page-item disabled"> <a class="page-link" tabindex="-1" aria-disabled="true">Previous</a> </li>
                                <li class="page-item active" aria-current="page"> <a class="page-link">1 <span class="sr-only">(current)</span></a> </li>
                                <li class="page-item"> <a class="page-link" href="#" onclick="page(${number + 1}, '${username}', ${id}); return false;">${number + 1}</a> </li>
                                <li class="page-item"> <a class="page-link" href="#" onclick="page(${number + 1}, '${username}', ${id}); return false;">Next</a> </li>
                                <li class="page-item"> <a class="page-link" href="#" onclick="page(${maximum}, '${username}', ${id}); return false;">Last(${maximum})</a> </li>`
                }
                else if (number > 1) {
                    pagination = `  <li class="page-item"> <a class="page-link" href="#" onclick="page(1, '${username}', ${id}); return false;">First</a> </li>
                                <li class="page-item"> <a class="page-link" href="#" onclick="page(${number - 1}, '${username}', ${id}); return false;">Previous</a> </li>
                                <li class="page-item"> <a class="page-link" href="#" onclick="page(${number - 1}, '${username}', ${id}); return false;">${number - 1}</a> </li>
                                <li class="page-item active" aria-current="page"> <a class="page-link">${number} <span class="sr-only">(current)</span></a> </li>`
                    if (number == maximum) {
                        pagination += ` <li class="page-item disabled"> <a class="page-link" tabindex="-1" aria-disabled="true">Next</a> </li>
                                    <li class="page-item disabled"> <a class="page-link" tabindex="-1" aria-disabled="true">Last(${maximum})</a> </li>`
                    }
                    else {
                        pagination += `<li class="page-item"><a class="page-link" href="#" onclick="page(${number + 1}, '${username}', ${id}); return false;">${number + 1}</a></li>
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="page(${number + 1}, '${username}', ${id}); return false;">Next</a>
                    </li>
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="page(${maximum}, '${username}', ${id}); return false;">Last(${maximum})</a>`
                    }
                }
                element.innerHTML = `<nav aria-label="...">
                                    <ul class="pagination"> ` + pagination + ` </ul>
                                </nav>`
            })

            let user = response.result.user
            var parent = document.querySelector('#all_posts')
            parent.innerHTML = `<div id="new_post" class="page" style="display: none;">
                                <textarea id="new" oninput="auto_grow()" placeholder="Your post!"></textarea>
                                <button type="button" class="btn btn-primary" onclick="post_it();">Send</button>
                            </div>`
            response.posts.forEach(element => {
                let edit_button = `<div style="height: 31px;"></div>`
                if (element.owner == user) {
                    edit_button = `<img src="/static/network/edit.png" class="edit">`
                }
                parent.innerHTML += `<div class="page"> 
                                    <a href="" onclick="page(1, '${element.owner}'); return false" class="owner">${element.owner}</a> <br> <span class="date">${element.date}</span> <br>  
                                    <textarea data-id="${element.id}" oninput="auto_grow()" disabled>${element.content}</textarea>`
                    + edit_button + `<div class="favorite" data-id="${element.id}"></div>
                                </div>`
            })
            auto_grow();
            favorites();
            edit();
        })

}


function auto_grow() {
    document.querySelectorAll('textarea').forEach(element => {
        element.style.height = "31px";
        if (element.scrollHeight != 0) {
            element.style.height = (element.scrollHeight) + "px";
        }
    })
}


function edit() {
    document.querySelectorAll(".page").forEach(post => {
        try {
            post.querySelector(".edit").onclick = () => {
                let textarea = post.querySelector("textarea")
                textarea.disabled = false
                let button = post.querySelector(".edit")
                button.className = "save"
                button.src = "/static/network/save.png"
                save();
            }
        }
        catch (TypeError) { }
    })
}


function save() {
    document.querySelectorAll(".page").forEach(post => {
        try {
            post.querySelector(".save").onclick = () => {
                let textarea = post.querySelector("textarea")
                fetch('/save', {
                    method: 'PUT',
                    body: JSON.stringify({
                        id: textarea.dataset.id,
                        value: textarea.value
                    })
                })
                    .then(response => response.json())
                    .then(response => {
                        if (response.status == 200) {
                            textarea.value = String(textarea.value).replace(/^\s+|\s+$/g, '')
                            textarea.disabled = true
                            let button = post.querySelector(".save")
                            button.className = "edit"
                            button.src = "/static/network/edit.png"
                            auto_grow();
                            edit();
                        }
                        else {
                            alert("You are not allowed to do this!")
                        }
                    })

            }
        }
        catch (TypeError) { }
    })
}



function favorite(number) {
    fetch('/favorite', {
        method: 'PUT',
        body: JSON.stringify({
            id: number
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.status == 200) {
                favorites()
            }
        })
}


function follow(username) {
    fetch('/follow', {
        method: 'PUT',
        body: JSON.stringify({
            name: username
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.status == 200) {
                page(1, username);
            }
        })
}


function favorites() {
    var posts = [];
    subjects = document.querySelectorAll('.favorite')
    subjects.forEach(element => {
        posts.push(element.dataset.id)
    })
    fetch('/favorites', {
        method: 'POST',
        body: JSON.stringify({
            post: posts
        })
    })
        .then(response => response.json())
        .then(response => {
            subjects.forEach(element => {
                element.innerHTML = ""
                if (response[`${element.dataset.id}`]["favorite"] == true) {
                    element.innerHTML += `<h5 class="like" onclick="favorite('${element.dataset.id}');"> ` + response[`${element.dataset.id}`]["amount"] + `</h5>`
                }
                else {
                    element.innerHTML += `<h5 class="unlike" onclick="favorite('${element.dataset.id}');"> ` + response[`${element.dataset.id}`]["amount"] + `</h5>`
                }

            })
        })
        .then(function () {
        var loadingScreen = document.getElementById("loading-screen");
        loadingScreen.style.display = "none";
    })
}


function do_it() {
    let form = document.querySelector('#new_post')
    if (form.style.display === 'none') {
        form.style.display = 'block'
    }
    else {
        form.style.display = 'none'
    }
}


function post_it() {
    fetch('/create', {
        method: 'POST',
        body: JSON.stringify({
            content: document.querySelector('#new').value
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.status == 200) {
                page(1);
            }
            else {
                alert("Error " + response.status)
            }
        })
}