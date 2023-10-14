document.addEventListener('DOMContentLoaded', function() {
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
        if (response.result.username != null && response.result.username != 'false'){
            parent.innerHTML = `<h3> ${response.result.username}, followers ${response.result.followers}, following ${response.result.reading} </h3>`
            parent.style.display = 'block'
        }
        else{
            parent.innerHTML = ``
        }


        if (response.result.username != null && response.result.username != 'false') {
            parent.innerHTML = `<center><h2> ${response.result.username}</h2>
                </center><div class="followers_follow"><h3>${response.result.followers} followers</h3><h3 style="position: absolute; right: 0; ">following ${response.result.reading}</h3></div>`
            parent.style.display = 'block'
        }

        document.querySelectorAll('.paginator').forEach(element => {
            let pagination = ``
            let number = response.result.number
            let maximum = response.result.maximum
            let username = response.result.username
            let id = response.result.id
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

        var parent = document.querySelector('#all_posts')
        parent.innerHTML = ``
        response.posts.forEach(element => { 
            parent.innerHTML += `<div class="page"> 
                                    <a href="" onclick="page(1, '${element.owner}'); return false" class="owner">${element.owner}</a> <br> <span class="date">${element.date}</span>  
                                    <textarea data-id="${element.id}" disabled>${element.content}</textarea><div class="favorite" data-id="${element.id}"></div>
                                </div>`
            })
            auto_grow();
            favorites();
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


function favorites(){
    var posts = [];
    subjects = document.querySelectorAll('.favorite')
    subjects.forEach(element =>{
        posts.push(element.dataset.id)})
    fetch('/favorites',{
        method: 'POST',
        body: JSON.stringify({
            post: posts
        }) 
    })
    .then(response => response.json())
    .then(response =>{
        subjects.forEach(element =>{
            element.innerHTML = `<h5 class="unlike"> ` + response[`${element.dataset.id}`]["amount"] + `</h5>`
        })
    })
    .then(function () {
        var loadingScreen = document.getElementById("loading-screen");
        loadingScreen.style.display = "none";
    })
}