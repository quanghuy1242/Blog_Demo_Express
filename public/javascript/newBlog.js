$(document).ready(function () {
    $('#inputTitleLamMau').val($('#inputTitleForm').val());
    $('#spanNewBlog').html($('#inputTitleLamMau').val());
    if ($('#inputTitleLamMau').val().length === 0) {
        $('#spanNewBlog').html("NEW POST");
    }

    $('#inputTitleLamMau').keyup(function () {
        let title = $('#inputTitleLamMau').val();
        $('#inputTitleForm').val(title);
        $('#spanNewBlog').html(title);
        if (title.length === 0) {
            $('#spanNewBlog').html("NEW POST");
        }
    })
    $("#btnLamMau").click(function () {
        let title = $('#inputTitleForm').val();
        if (title.length !== 0) {
            $("#btnForm").click();
        } else {
            $("#loi").html(
                `
                <div class="alert alert-danger alert-dismissible fade show" role="alert"><span>Không để trống trường nào</span>
  <button class="close" type="button" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>
</div>
                `
            );
        }
    })
})