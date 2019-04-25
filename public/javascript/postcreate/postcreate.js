var categorySelect = new MDCSelect(document.querySelector('.mdc-select.cs-category-selecte'));
var txtUrlImg = document.querySelector('input[name="imgUrl"]');
var imgPreview = document.querySelector('.cs-image-preview');
document.querySelector('form').addEventListener('submit', function(e) {
  if (categorySelect.value === "") {
    alert('Vui lòng chọn danh mục');
    e.preventDefault();
  }
})

txtUrlImg.addEventListener('keyup', function(e) {
  imgPreview.style.backgroundImage = "url(" + e.target.value + ")";
})