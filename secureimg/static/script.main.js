/*
    (c) cyte industries
    http://github.com/cyteindustries/secureimg

    be warned that until it is reviewed by a 
    sassy gent that shall remain nameless, it will 
    look trashy, but this does not remove from 
    its functionality.

    license available in repository above
*/

// used for getting private keys
var randomString = function(len, bits){
    bits = bits || 36;
    var outStr = "", newStr;
    while (outStr.length < len)
    {
        newStr = Math.random().toString(bits).slice(2);
        outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)));
    }
    return outStr;
};

$(document).ready(function () {
    $('#holder').on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $('#holder').css({"border": "10px dashed #000"});
    })
    
    $('#holder').on('dragenter', function (e) {
        e.preventDefault();
        e.stopPropagation();
    })

    $('#holder').on('drop', function (e) {
        e.preventDefault();
        $('#holder').css({"border": "10px dashed #ccc"});
        $('#holder, #footer, #logo-container').hide();
        $('#loading').show().delay(1000);

        var files = e.originalEvent.dataTransfer.files;
        var file = files[0];

        if(files.length > 1){
            $('.alert-box.error').html('<span>error: </span>only one file please thanks.').slideDown('fast').delay(7000).slideUp('fast');
            $('#holder, #footer, #logo-container').show();
            $('#loading').hide();
            return false;
        }

        if(file.size >= 1024*1024){
            $('.alert-box.error').html('<span>error: </span>your file is >1mb and is too big. files over 1mb are known to crash browsers.').slideDown('fast').delay(7000).slideUp('fast');
            $('#holder, #footer, #logo-container').show();
            $('#loading').hide();
            return false
        }

        if($.inArray(file.type, ["image/jpg", "image/png", "image/jpeg"]) == -1){
            $('#holder, #footer, #logo-container').show();
            $('#loading').hide();
            $('.alert-box.error').html('<span>error: </span>not a valid image extension (jpg/png/jpeg).').slideDown('fast').delay(7000).slideUp('fast');
            return false;
        }

        var reader = new FileReader();
        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            encrypt_img(btoa(binaryString));
        };
        reader.readAsBinaryString(file);
    });
});

function encrypt_img(b64_str){
    var private_key = randomString(32);
    var encrypted = CryptoJS.AES.encrypt(b64_str, private_key);

    data = {"str": encrypted.toString()}

    $.ajax({
        url : "/api/upload_image",
        type: "POST",
        data: JSON.stringify(data, null, '\t'),
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        success: function(data, textStatus, jqXHR){
            $('#holder, #footer, #logo-container').show();
            $('#loading').hide();

            if(data.success != "true"){
                if(data.reason){
                    $('.alert-box.error').html('<span>error: </span>' + data.reason).slideDown('fast').delay(7000).slideUp('fast');
                    return false;
                }
                $('.alert-box.error').html('<span>error: </span>url was not created :(').slideDown('fast').delay(7000).slideUp('fast');
                return false;
            } else {
                $('#done').children().show();
                $('.alert-box.success').html('<span>success: </span>your url was created, go down to see the it').slideDown('fast').delay(7000).slideUp('fast');
                
                var count = Number($('.count').html());
                var update = count += 1;
                $('.count').html(update);
            }

            $('.url-container>.img_url').val(window.location.protocol + "//" +
                                             window.location.host +
                                             window.location.pathname + data.img_url + 
                                             "&" + private_key);

            $(".url-container>.img_url").on("click", function () {
                $(this).select();
            });
        }
    });
}