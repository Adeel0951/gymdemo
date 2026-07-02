(function () {
  'use strict';

  var header = document.getElementById('header');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var themeToggle = document.getElementById('themeToggle');
  var backToTop = document.getElementById('backToTop');
  var contactForm = document.getElementById('contactForm');
  var contactNote = document.getElementById('contactNote');
  var inquiryForm = document.getElementById('inquiryForm');
  var inquiryNote = document.getElementById('inquiryNote');
  var bmiForm = document.getElementById('bmiForm');
  var bmiResult = document.getElementById('bmiResult');
  var bmiValue = document.getElementById('bmiValue');
  var bmiCategory = document.getElementById('bmiCategory');
  var track = document.getElementById('testimonialsTrack');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var dotsContainer = document.getElementById('sliderDots');
  var baSlider = document.getElementById('baSlider');
  var baHandle = document.getElementById('baHandle');

  /* Theme toggle */
  var savedTheme = localStorage.getItem('elite-fitness-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('elite-fitness-theme', next);
    });
  }

  /* Sticky header */
  window.addEventListener('scroll', function () {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  /* Back to top */
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Mobile nav */
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* Animated counters */
  var counters = document.querySelectorAll('.counter');
  var countersStarted = false;

  function animateCounters() {
    if (countersStarted) return;
    countersStarted = true;

    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'), 10);
      var duration = 2000;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else counter.textContent = target.toLocaleString();
      }

      requestAnimationFrame(step);
    });
  }

  if (counters.length && 'IntersectionObserver' in window) {
    var statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
      var counterObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          animateCounters();
          counterObserver.disconnect();
        }
      }, { threshold: 0.3 });
      counterObserver.observe(statsBar);
    }
  }

  /* Before & After slider */
  if (baSlider && baHandle) {
    var baContainer = baSlider.querySelector('.ba-container');
    var baAfterWrap = baSlider.querySelector('.ba-after-wrap');
    var isDragging = false;

    function setPosition(x) {
      var rect = baContainer.getBoundingClientRect();
      var pos = Math.max(0, Math.min(x - rect.left, rect.width));
      var percent = (pos / rect.width) * 100;
      baAfterWrap.style.width = percent + '%';
      baHandle.style.left = percent + '%';
    }

    baContainer.addEventListener('mousedown', function (e) {
      isDragging = true;
      setPosition(e.clientX);
    });
    window.addEventListener('mousemove', function (e) {
      if (isDragging) setPosition(e.clientX);
    });
    window.addEventListener('mouseup', function () { isDragging = false; });

    baContainer.addEventListener('touchstart', function (e) {
      isDragging = true;
      setPosition(e.touches[0].clientX);
    }, { passive: true });
    baContainer.addEventListener('touchmove', function (e) {
      if (isDragging) setPosition(e.touches[0].clientX);
    }, { passive: true });
    baContainer.addEventListener('touchend', function () { isDragging = false; });
  }

  /* Testimonials slider */
  var cards = track ? track.querySelectorAll('.testimonial-card') : [];
  var currentSlide = 0;
  var autoplayInterval;

  function goToSlide(index) {
    if (!cards.length) return;
    currentSlide = (index + cards.length) % cards.length;
    track.scrollTo({ left: cards[currentSlide].offsetLeft, behavior: 'smooth' });
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.slider-dot').forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  if (cards.length && dotsContainer) {
    cards.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', function () { goToSlide(i); resetAutoplay(); });
      dotsContainer.appendChild(dot);
    });

    if (prevBtn) prevBtn.addEventListener('click', function () { goToSlide(currentSlide - 1); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goToSlide(currentSlide + 1); resetAutoplay(); });

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      autoplayInterval = setInterval(function () { goToSlide(currentSlide + 1); }, 6000);
    }

    resetAutoplay();
  }

  /* BMI Calculator */
  if (bmiForm) {
    bmiForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var height = parseFloat(document.getElementById('height').value);
      var weight = parseFloat(document.getElementById('weight').value);

      if (!height || !weight || height <= 0 || weight <= 0) return;

      var heightM = height / 100;
      var bmi = weight / (heightM * heightM);
      var category = '';

      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal weight';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';

      bmiValue.textContent = bmi.toFixed(1);
      bmiCategory.textContent = category;
      bmiResult.hidden = false;
    });
  }

  /* Contact form */
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      contactNote.textContent = 'Thank you! We\'ll contact you within 24 hours to schedule your free trial.';
      contactNote.className = 'form-note success';
      contactForm.reset();
      setTimeout(function () { contactNote.textContent = ''; }, 5000);
    });
  }

  /* Membership inquiry form */
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      inquiryNote.textContent = 'Inquiry received! Our team will recommend the best plan for you shortly.';
      inquiryNote.className = 'form-note success';
      inquiryForm.reset();
      setTimeout(function () { inquiryNote.textContent = ''; }, 5000);
    });
  }
})();
