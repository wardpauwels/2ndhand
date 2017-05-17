function gotoHomepage(){
    window.location.href = "home";
}

function gotoAccount(){
    window.location.href = "account";
}

function openNav() {
    document.getElementById("mySidenav").style.width = "42%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function getCategories(){
    $.ajax({
        url: "/getCategories",
        success: function(result){
            fillCategories(result);
        }
    });
}

function fillCategories(data) {
    results = data.vcategories;
    for(i=0; i<results.length; i++){
        $('#categoriesList').append('<div class="categoriebtn"><a href="#" class="categoriebtnlink">'+results[i].Name+'</a></div>');
    }
}

$(document).ready(function() {
    $("#logoImg").on("click", gotoHomepage);
    $("#menuImg").on("click", openNav);
    $("#closebtn").on("click", closeNav);
    $("#accountImg").on("click", gotoAccount);

    if(window.location.pathname === '/categories') {
        getCategories();
    }
});