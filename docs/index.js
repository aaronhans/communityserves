var requestsDiv = document.getElementsByClassName('requests')[0];
var locationCardTemplate = document.getElementsByClassName('location-card-template')[0];
var requestCTA = document.getElementsByClassName('request-cta')[0];
var requestDialog =  document.getElementById('request-type');

for (var i = 0 ; i < 5 ; i++){
    requestsDiv.appendChild(locationCardTemplate.content.cloneNode(true));
}

requestCTA.addEventListener("click", function(ev){
    showModal(requestDialog);
});

document.querySelectorAll('.dialog').forEach(function(item) {
    item.querySelector('.close').addEventListener('click', function(event) {
        hideModal(item);
    });
});

function showModal(element) {
    element.classList.add('open');
}

function hideModal(element) {
    element.classList.remove('open');
}