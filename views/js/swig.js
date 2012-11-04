(function () {
  var $header = $('.header'),
    scrolledClass = 'scrolled',
    win = window;

  $(win).on('scroll', function (e) {
    console.log(document.scrollY)
    $header.toggleClass(scrolledClass, (win.scrollY > 0));
  });
}());
