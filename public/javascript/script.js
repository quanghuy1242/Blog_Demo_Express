// load polyfill
cssVars();

// Ripple
document.querySelectorAll('.mdc-button, .mdc-card__primary-action, .mdc-fab').forEach(function(element) {
  mdc.ripple.MDCRipple.attachTo(element);
})

// Snackbar
if (document.querySelector('.mdc-snackbar')) {
  var snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
  snackbar.timeoutMs = 10000;
  snackbar.open();
  document.querySelectorAll('.mdc-button.mdc-snackbar__action').forEach(function(btn) {
    btn.addEventListener('click', function() {
      snackbar.close();
    })
  });
}

// alert dialog
if (document.querySelector('.mdc-dialog.non-search')) {
  var dialog = new MDCDialog(document.querySelector('.mdc-dialog.non-search'));
  dialog.scrimClickAction = '';
  dialog.escapeKeyAction = '';
}

function openAlert(event) {
  dialog.open();
  var detailClick = event.target.getAttribute('data-click');
  var formAction = document.querySelector('#dialog-form');
  var postId = event.target.getAttribute('data-post-id');
  var contentTitle = document.querySelector('.mdc-dialog .mdc-dialog__content');
  if (detailClick === 'delete') {
    contentTitle.innerText = "Bạn có chắc chắn xoá bài viết này?";
    formAction.setAttribute('action', '/blog/delete/' + postId);
  }
  if (detailClick === 'unpin') {
    contentTitle.innerText = "Bạn có chắc chắn unpin viết này?";
    formAction.setAttribute('action', '/blog/unpin/' + postId);
  }
}

// Textfield
document.querySelectorAll('.mdc-text-field').forEach(function(text) {
  new MDCTextField(text);
})

// xử lý emoji ở post detail
if (document.querySelector('.markdown-body')) {
	twemoji.parse(document.querySelector('.markdown-body'));
}

// Load markdown
if (window.markdownitEmoji) {
  var md = window.markdownit().use(window.markdownitEmoji);
}

if (document.querySelector('#content')) {
  window.onload = function() {
    // Markdown render
    var contentHTML = document.querySelector('#content');
    var previewHTML = document.querySelector('#preview');
    var isLeftScrollTop = false;
    var isRightScrollTop = false;
  
    function loadPreview() {
      previewHTML.innerHTML = md.render(contentHTML.value || "") + '<div style="height: 300px"></div>';
      twemoji.parse(document.querySelector('.markdown-body'));
    }
  
    loadPreview();
  
    contentHTML.addEventListener('keyup', function() {
      loadPreview();
    })
  
    contentHTML.addEventListener('scroll', function() {
      if (isRightScrollTop) {
        return isRightScrollTop = false;
      }
      var percent = this.scrollTop / (this.scrollHeight - this.clientHeight);
      var a = previewHTML.scrollHeight - previewHTML.clientHeight;
      previewHTML.scrollTop = percent * a;
      isLeftScrollTop = true;
    });
  
    previewHTML.addEventListener('scroll', function() {
      if (isLeftScrollTop) {
        return isLeftScrollTop = false;
      }
      var percent = this.scrollTop / (this.scrollHeight - this.clientHeight);
      var a = contentHTML.scrollHeight - contentHTML.clientHeight;
      contentHTML.scrollTop = percent * a;
      isRightScrollTop = true;
    })
  }
}


// Search
var searchDialog = new MDCDialog(document.querySelector('.mdc-dialog.search'));
document.querySelector('#btnSearch').addEventListener('click', function() {
  // Khi nút search được mở thì phải xoá link cũ đi
  document.querySelector('#filter-link').setAttribute('href', '#!');
  searchDialog.open();
})

// Tabbar search
var tabBarSearch = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
var tabscontent = document.querySelectorAll('.tab-content');
tabBarSearch.listen('MDCTabBar:activated', function(e) {
  tabscontent.forEach(function(tabcontent) {
    tabcontent.classList.remove('tab-content--active');
  });
  document.querySelector('#mdc-tab-content-' + parseInt(e.detail.index + 1))
    .classList.add('tab-content--active');
});

// khi người dùng nhập filter
var filterInput = document.querySelectorAll('.cs-filter');
filterInput.forEach(function(element) {
  element.addEventListener('keyup', function() {
    // Kiểm tra dữ liệu
    if (/[^0-9]/.test(filterInput[0].value) || /[^0-9]/.test(filterInput[1].value) || /[^0-9]/.test(filterInput[2].value)) {
      document.querySelector('#filter-link').setAttribute('href', '#!');
      return;
    }
    var year = filterInput[2].value ? filterInput[2].value + '/' : '';
    if (!year) { 
      document.querySelector('#filter-link').setAttribute('href', '#!');
      return;
    }
    var month = filterInput[1].value ? filterInput[1].value + '/' : '';
    var date = filterInput[0].value ? filterInput[0].value + '/' : '';
    if (!month && date) {
      document.querySelector('#filter-link').setAttribute('href', '#!');
      return;
    }
    var finalLink = window.location.protocol 
                    + '//' + window.location.host 
                    + '/blog/' + year + month + date;
    document.querySelector('#filter-link').setAttribute('href', finalLink);
  })
})

// Action Detail
if (document.querySelector('#post-detail-action')) {
  var menu = new MDCMenu(document.querySelector('.cs-menu-chuc-nang'));
  var btnMenu = document.querySelector('#post-detail-action');
  btnMenu.addEventListener('click', function() {
    menu.open = !menu.open;
  })
}

// Menu cá nhân
if (document.querySelector('.cs-menu-ca-nhan')) {
	var menuCaNhan = new MDCMenu(document.querySelector('.cs-menu-ca-nhan'));
	document.querySelector('#btnMenuCaNhan').addEventListener('click', function() {
	  menuCaNhan.open = !menuCaNhan.open;
	})
}