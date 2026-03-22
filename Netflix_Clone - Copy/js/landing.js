/* =====================================================
   LANDING PAGE — JS
   FAQ accordion · Email forms
   ===================================================== */
;(() => {
  'use strict';

  /* ── FAQ Data ── */
  // const FAQ_DATA = [
  //   {
  //     q: "What is Netflix?",
  //     a: "Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries and more – on thousands of internet-connected devices."
  //   },
  //   {
  //     q: "How much does Netflix cost?",
  //     a: "Watch Netflix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from ₹149 to ₹649 a month. No extra costs, no contracts."
  //   },
  //   {
  //     q: "Where can I watch?",
  //     a: "Watch anywhere, anytime. Sign in with your Netflix account to watch instantly on the web at netflix.com from your personal computer or on any internet-connected device."
  //   },
  //   {
  //     q: "How do I cancel?",
  //     a: "Netflix is flexible. There are no annoying contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime."
  //   },
  //   {
  //     q: "What can I watch on Netflix?",
  //     a: "Netflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Netflix originals, and more. Watch as much as you want, anytime you want."
  //   },
  //   {
  //     q: "Is Netflix good for kids?",
  //     a: "The Netflix Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and films in their own space. Kids profiles come with PIN-protected parental controls that let you restrict the maturity rating of content kids can watch and block specific titles you don't want kids to see."
  //   }
  // ];

  /* ── Render FAQ ── */
  // const accordion = $('#accordion');
  // if (accordion) {
  //   accordion.innerHTML = FAQ_DATA.map(faq => `
  //     <div class="accordion__item">
  //       <button class="accordion__question" type="button">
  //         ${faq.q}
  //         <span class="accordion__icon">+</span>
  //       </button>
  //       <div class="accordion__answer"><p>${faq.a}</p></div>
  //     </div>
  //   `).join('');

  //   accordion.addEventListener('click', e => {
  //     const btn = e.target.closest('.accordion__question');
  //     if (!btn) return;
  //     const item = btn.parentElement;
  //     const isOpen = item.classList.contains('open');

  //     // close all
  //     $$('.accordion__item.open', accordion).forEach(el => {
  //       el.classList.remove('open');
  //       $('.accordion__icon', el).textContent = '+';
  //     });

  //     if (!isOpen) {
  //       item.classList.add('open');
  //       $('.accordion__icon', item).textContent = '+'; // the CSS rotates it 45° to ×
  //     }
  //   });
  // }
  const questions = document.querySelectorAll('.accordion-question');

questions.forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;

        // Toggle the active class
        answer.classList.toggle('active');

        // Optional: Change + to x when open
        const span = question.querySelector('span');
        if (answer.classList.contains('active')) {
            span.innerText = '×';
        } else {
            span.innerText = '+';
        }
    });
});


  /* ── Email forms ── */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setupEmailForm(formId, errorId) {
    const form = $('#' + formId);
    const error = $('#' + errorId);
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = $('input[type="email"]', form);
      const val = input.value.trim();
      error.textContent = '';

      if (!val) { error.textContent = 'Email is required.'; input.focus(); return; }
      if (!emailRegex.test(val)) { error.textContent = 'Please enter a valid email.'; input.focus(); return; }

      // store email so signup page can pre-fill it
      sessionStorage.setItem('netflix_prefill_email', val);
      window.location.href = 'signup.html';
    });
  }

  setupEmailForm('hero-form', 'hero-error');
  setupEmailForm('faq-form',  'faq-error');

  /* ── Scroll reveal ── */
  initRevealObserver();

})();

// sliders

const slider = document.getElementById('trending-sliders');
const leftBtn = document.querySelector('.left-handle');

leftBtn.style.visibility = 'hidden';

// Function to handle showing/hiding the left button
slider.addEventListener('scroll', () => {
    if (slider.scrollLeft > 50) {
        leftBtn.style.display = 'flex';
    } else {
        leftBtn.style.display = 'none';
    }
});
function scrollLeftBtn() {
    // This scrolls the row to the left by 600 pixels
    slider.scrollBy({ left: -730, behavior: 'smooth' });
};

function scrollRightBtn() {
    // This scrolls the row to the right by 600 pixels
    slider.scrollBy({ left: 730, behavior: 'smooth' });
};
