// load polyfill
cssVars();

// Ripple
document.querySelectorAll('.mdc-button, .mdc-card__primary-action, .mdc-fab, .mdc-ripple-surface').forEach(function(element) {
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
var filterHandler = function() {
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
}

var filterInput = document.querySelectorAll('.cs-filter');
filterInput.forEach(function(element) {
  element.addEventListener('keyup', filterHandler);
  element.addEventListener('change', filterHandler);
})

// Action Detail
if (document.querySelector('#post-detail-action')) {
  var menu = new MDCMenu(document.querySelector('.cs-menu-chuc-nang'));
  var btnMenu = document.querySelector('#post-detail-action');
  btnMenu.addEventListener('click', function() {
    menu.open = !menu.open;
  })
}

var menuObj = {};
if (document.querySelector('.cs-menu-post')) {
  document.querySelectorAll('.cs-menu-post').forEach(function(menuItem) {
    var id = menuItem.getAttribute('data-id');
    menuObj[id] = new MDCMenu(menuItem);
  })
}

function openMenu(event) {
  var id = event.target.getAttribute('data-click');
  menuObj[id].open = !menuObj[id].open;
}

// Drawwer
var menuList = MDCList.attachTo(document.querySelector('#menu-list')); // Menu list trong drawer
menuList.wrapFocus = true;
var drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer')); // Nguyên cái drawer
var topAppBar = MDCTopAppBar.attachTo(document.querySelector('#app-bar')); // Cái top nav

// Khi click vô cái nút chỗ top nav
topAppBar.listen('MDCTopAppBar:nav', function() {
  drawer.open = !drawer.open;
});

// Khi mà location hiện tại trùng với href của thẻ a nào đó trong menulist thì
// menulist active cái đó
var currLocation = window.location.pathname;
menuList.listElements.forEach(function(item) {
  if (item.getAttribute('href') === currLocation) {
    menuList.selectedIndex = menuList.listElements.indexOf(item);
  }
});

// Khi drawer mở thì set overflow của body thành hidden
// khỏi nhảy lung tung
drawer.listen('MDCDrawer:opened', function() {
  document.body.style.overflow = "hidden";
});
drawer.listen('MDCDrawer:closed', function() {
  document.body.style.overflow = "initial";
});