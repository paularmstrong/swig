(function () {

  Rainbow.extend('swig', [
    {
      name: 'comment',
      pattern: /\{\#[^#]*?\#\}/g
    },
    {
      name: 'variable',
      pattern: /(\{\{\s*?[a-zA-Z0-9.]+)|(\}\})/g
    },
    {
      name: 'string',
      pattern: /('|")(.*?)(\1)/g
    },
    {
      name: 'filter',
      pattern: /(\|[^\}\(]+)/g
    },
    {
      name: 'tag',
      pattern: /(\{\%\s*?[a-zA-Z0-9.]+)|(\%\})/g
    },
    {
      // name: 'tag.arg',
      matches: {
        0: 'tag',
        1: 'tag.arg'
      },
      pattern: /\{\%\s*?\S+\s([^%]+)/g
    }
  ], true);

  var $sidebar = $('.sidenav'),
    top = ($sidebar.length) ? $sidebar.offset().top : 0,
    $links = $sidebar.find('a');

  $(window).on('scroll', function (e) {
    var scrollY = this.scrollY;
    if (scrollY > top) {
      $sidebar.addClass('fixed');
    } else if (scrollY < top) {
      $sidebar.removeClass('fixed');
    }

    $sidebar.find('.current').removeClass('current');
    $links.each(function () {
      var $this = $(this),
        $section = $($this.attr('href'));
      if ($section.offset().top <= scrollY) {
        $sidebar.find('.current').removeClass('current');
        $this.addClass('current');
      } else {
        $this.removeClass('current');
      }
    });
    $sidebar.find('.current').parents('li').addClass('current');
  });

}());
