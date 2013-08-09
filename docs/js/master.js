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

  document.addEventListener('DOMContentLoaded', function () {
    var $sidebar = document.querySelector('.sidenav'),
      top = ($sidebar) ? $sidebar.getBoundingClientRect().top : 0,
      $links = ($sidebar) ? $sidebar.querySelectorAll('a') : null;

    if (!$sidebar) {
      return;
    }

    window.addEventListener('scroll', function (e) {
      var scrollY = this.scrollY,
        $current = $sidebar.querySelector('.current'),
        i = $links.length - 1,
        $link,
        href,
        $section,
        t;

      if (scrollY > top) {
        $sidebar.classList.add('fixed');
      } else if (scrollY < top) {
        $sidebar.classList.remove('fixed');
      }

      for (i; i >= 0; i -= 1) {
        $link = $links[i];
        href = $link.getAttribute('href');
        if (!(/^#/).test(href)) {
          continue;
        }
        $section = document.querySelector(href);
        if (!$section) {
          continue;
        }

        t = $section.getBoundingClientRect().top;
        if (t <= 0) {
          if ($link.classList.contains('current')) {
            break;
          }
          $link.classList.add('current');
          window.history.pushState({}, $link.innerText, href);
          break;
        }
      }

      if ($current && $current !== $link) {
        $current.classList.remove('current');
      }

    }, false);
  });

}());
