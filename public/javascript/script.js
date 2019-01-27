$(document).ready(function () {
    var md = window.markdownit();
    $('#preview').html(md.render($('#content').val()));
    $('#content').keyup(function () {
        $('#preview').html(md.render($('#content').val()));
    })
})