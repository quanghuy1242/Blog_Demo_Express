// load polyfill
cssVars();

// Ripple
document.querySelectorAll('.mdc-button, .mdc-card__primary-action, .mdc-fab, .mdc-ripple-surface, .mdc-list-item').forEach(element => {
  mdc.ripple.MDCRipple.attachTo(element);
})

// Snackbar
if (document.querySelector('.mdc-snackbar')) {
  let snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
  snackbar.timeoutMs = 10000;
  snackbar.open();
  document.querySelectorAll('.mdc-button.mdc-snackbar__action').forEach(btn => {
    btn.addEventListener('click', () => snackbar.close());
  });
}

// alert dialog
if (document.querySelector('.mdc-dialog.non-search')) {
  let dialog = new MDCDialog(document.querySelector('.mdc-dialog.non-search'));
  dialog.scrimClickAction = '';
  dialog.escapeKeyAction = '';
}

function openAlert(event) {
  dialog.open();
  let detailClick = event.target.getAttribute('data-click');
  let formAction = document.querySelector('#dialog-form');
  let postId = event.target.getAttribute('data-post-id');
  let contentTitle = document.querySelector('.mdc-dialog .mdc-dialog__content');
  if (detailClick === 'delete') {
    contentTitle.innerText = "Bạn có chắc chắn xoá bài viết này?";
    formAction.setAttribute('action', `/blog/delete/ + ${postId}`);
  }
  if (detailClick === 'unpin') {
    contentTitle.innerText = "Bạn có chắc chắn unpin viết này?";
    formAction.setAttribute('action', `/blog/unpin/ + ${postId}`);
  }
}

// Textfield
document.querySelectorAll('.mdc-text-field').forEach(text => {
  new MDCTextField(text);
})

// xử lý emoji ở post detail
if (document.querySelector('.markdown-body')) {
	twemoji.parse(document.querySelector('.markdown-body'));
}

// Load markdown
if (window.markdownitEmoji) {
  let md = window.markdownit().use(window.markdownitEmoji);
}

if (document.querySelector('#content')) {
  window.onload = function() {
    // Markdown render
    let contentHTML = document.querySelector('#content');
    let previewHTML = document.querySelector('#preview');
    let isLeftScrollTop = false;
    let isRightScrollTop = false;
  
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
      let percent = this.scrollTop / (this.scrollHeight - this.clientHeight);
      let a = previewHTML.scrollHeight - previewHTML.clientHeight;
      previewHTML.scrollTop = percent * a;
      isLeftScrollTop = true;
    });
  
    previewHTML.addEventListener('scroll', function() {
      if (isLeftScrollTop) {
        return isLeftScrollTop = false;
      }
      let percent = this.scrollTop / (this.scrollHeight - this.clientHeight);
      let a = contentHTML.scrollHeight - contentHTML.clientHeight;
      contentHTML.scrollTop = percent * a;
      isRightScrollTop = true;
    })
  }
}


// Search
let searchDialog = new MDCDialog(document.querySelector('.mdc-dialog.search'));
document.querySelector('#btnSearch').addEventListener('click', () => {
  // Khi nút search được mở thì phải xoá link cũ đi
  document.querySelector('#filter-link').setAttribute('href', '#!');
  searchDialog.open();
})

// Tabbar search
let tabBarSearch = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
let tabscontent = document.querySelectorAll('.tab-content');
tabBarSearch.listen('MDCTabBar:activated', e => {
  tabscontent.forEach(tabcontent => {
    tabcontent.classList.remove('tab-content--active');
  });
  document.querySelector('#mdc-tab-content-' + parseInt(e.detail.index + 1))
    .classList.add('tab-content--active');
});

// khi người dùng nhập filter
let filterHandler = function() {
  let year = filterInput[2].value ? filterInput[2].value + '/' : '';
  if (!year) { 
    document.querySelector('#filter-link').setAttribute('href', '#!');
    return;
  }
  let month = filterInput[1].value ? filterInput[1].value + '/' : '';
  let date = filterInput[0].value ? filterInput[0].value + '/' : '';
  if (!month && date) {
    document.querySelector('#filter-link').setAttribute('href', '#!');
    return;
  }
  let finalLink = window.location.protocol 
                  + '//' + window.location.host 
                  + '/blog/' + year + month + date;
  document.querySelector('#filter-link').setAttribute('href', finalLink);
}

let filterInput = document.querySelectorAll('.cs-filter');
filterInput.forEach(function(element) {
  element.addEventListener('keyup', filterHandler);
  element.addEventListener('change', filterHandler);
})

// Action Detail
if (document.querySelector('#post-detail-action')) {
  let menu = new MDCMenu(document.querySelector('.cs-menu-chuc-nang'));
  let btnMenu = document.querySelector('#post-detail-action');
  btnMenu.addEventListener('click', () => {
    menu.open = !menu.open;
  })
}

let menuObj = {};
if (document.querySelector('.cs-menu-post')) {
  document.querySelectorAll('.cs-menu-post').forEach(menuItem => {
    let id = menuItem.getAttribute('data-id');
    menuObj[id] = new MDCMenu(menuItem);
  })
}

function openMenu(event) {
  let id = event.target.getAttribute('data-click');
  menuObj[id].open = !menuObj[id].open;
}

// list regex 
const mustModal = [
  '/blog/add',
  '/blog/manage.+',
  '/',
  '/signin',
  '/signup',
  '/blog/edit.+'
];

function isNeedModal(arr, currLocation) {
  let isWrong = false;
  arr.forEach(function(item) {
    if ((new RegExp(`^${item}$`)).test(currLocation)) {
      isWrong = true;
    }
  });
  return isWrong;
}

function initDrawer() {
  const isMobile = window.matchMedia("(max-width: 599px)").matches;
  let drawerHTML = document.querySelector('.mdc-drawer');
  let menuList = MDCList.attachTo(document.querySelector('#menu-list')); // Menu list trong drawer
  menuList.wrapFocus = true;

  // Khi mà location hiện tại trùng với href của thẻ a nào đó trong menulist thì
  // menulist active cái đó
  let currLocation = window.location.pathname;
  let isModal = isNeedModal(mustModal, currLocation);
  menuList.listElements.forEach(item => {
    if (item.getAttribute('href') === currLocation) {
      menuList.selectedIndex = menuList.listElements.indexOf(item);
    }
  });

  if (isMobile || isModal) {
    drawerHTML.classList.add('mdc-drawer--modal'); // Add class này để nó thành model trước
    drawerHTML.style.top = '0';
    drawerHTML.style.zIndex = '6';

    let drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer')); // Nguyên cái drawer
    let topAppBar = MDCTopAppBar.attachTo(document.querySelector('#app-bar')); // Cái top nav

    // Khi click vô cái nút chỗ top nav
    topAppBar.listen('MDCTopAppBar:nav', function() {
      drawer.open = !drawer.open;
    });
  } else {
    drawerHTML.classList.remove('mdc-drawer--modal');
  }

  drawerHTML.style.visibility = 'visible'; // xong thì hiện cái này lên
  document.querySelector('.main-content').style.visibility = 'visible';
}
initDrawer();

// New post button
let btnNewButton = document.querySelector('.cs-new-post-drawer');
if (btnNewButton) {
  btnNewButton.addEventListener('mouseover', function() {
    btnNewButton.classList.replace('mdc-elevation--z2', 'mdc-elevation--z4');
  });
  btnNewButton.addEventListener('mouseout', function() {
    btnNewButton.classList.replace('mdc-elevation--z4', 'mdc-elevation--z2')
  });
}