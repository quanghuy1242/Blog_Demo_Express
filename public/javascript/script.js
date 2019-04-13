$(document).ready(function () {
  $('[data-toggle="popover"]').popover();
  var md = window.markdownit();
  $('#preview').html(md.render($('#content').val() || ""));
  $('#content').keyup(function () {
    $('#preview').html(md.render($('#content').val()));
  })
})