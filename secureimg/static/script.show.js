/*
    (c) cyte industries
    http://github.com/cyteindustries/secureimg

    be warned that until it is reviewed by a 
    sassy gent that shall remain nameless, it will 
    look trashy, but this does not remove from 
    its functionality.

    license available in repository above
*/


$(document).ready(function () {
    var pathname = window.location.pathname;
    var private_key = pathname.substr(pathname.indexOf("&") + 1)
    var encrypted = $("[encrypted]").attr("encrypted");
    var decrypted = CryptoJS.AES.decrypt(encrypted, private_key);

    // check if b64 isn't naughty
    var base64Matcher = new RegExp("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})([=]{1,2})?$");
    if(base64Matcher.test(decrypted.toString(CryptoJS.enc.Utf8))){
        var image = new Image();
        image.src = 'data:image/png;base64,' + decrypted.toString(CryptoJS.enc.Utf8);
        image.id = 'img';
        $('#main').append(image);
    } else {
        $('#main').append("<p class='status'>the submitted image is not available. check if your private key is correct.<br>sad panda :(</p>");
    }

    if($('#img').length){
        // $('#main').append("<p class='status'>the submitted image is not available. check if your private key is correct.<br>sad panda :(</p>");
    } else {
        $('#main').append("<p class='status'>the submitted image is not available. check if your private key is correct.<br>sad panda :(</p>");
    }
});