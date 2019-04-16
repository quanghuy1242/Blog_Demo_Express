$(document).ready(function () {
  $('[data-toggle="popover"]').popover();
  var md = window.markdownit();
  $('#preview').html(md.render($('#content').val() || ""));
  $('#content').keyup(function () {
    $('#preview').html(md.render($('#content').val()));
  })

  
  let isLeftScrollTop = false;
  let isRightScrollTop = false;
  let contentHTML = document.querySelector('#content');
  let previewHTML = document.querySelector('#preview');
  $('#content').scroll(function(e) {
    if (isRightScrollTop) {
      return isRightScrollTop = false;
    }
    let percent = this.scrollTop / (this.scrollHeight - this.clientHeight);
    let a = previewHTML.scrollHeight - previewHTML.clientHeight;
    $('#preview').scrollTop(percent * a);
    isLeftScrollTop = true;
  });

  $('#preview').scroll(function(e) {
    if (isLeftScrollTop) {
      return isLeftScrollTop = false;
    }
    let percent = this.scrollTop / (this.scrollHeight - this.clientHeight);
    let a = contentHTML.scrollHeight - contentHTML.clientHeight;
    $('#content').scrollTop(percent * a);
    isRightScrollTop = true;
  });
})