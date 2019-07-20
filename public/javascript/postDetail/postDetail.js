var tagsChipSet = new MDCChipSet(document.querySelector('.mdc-chip-set'));

var dialogListPostHTML = document.querySelector('#dialog-list-post');
var dialogListPost = new MDCDialog(dialogListPostHTML);
dialogListPost.scrimClickAction = '';
dialogListPost.escapeKeyAction = '';

document.querySelector('#btn-list-post').addEventListener('click', function() {
  dialogListPost.open();
});