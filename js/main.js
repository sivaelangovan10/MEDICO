document.addEventListener("DOMContentLoaded", () => {

   /* =====================================================
   MOBILE NAVIGATION
===================================================== */

const menuButton = document.querySelector(".mobile-menu-btn");
const navLinks = document.querySelector(".nav-menu");

if (menuButton && navLinks) {

    menuButton.addEventListener("click", () => {

        menuButton.classList.toggle("active");
        navLinks.classList.toggle("active");
        document.body.classList.toggle("menu-open");

    });

    navLinks.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menuButton.classList.remove("active");
            navLinks.classList.remove("active");
            document.body.classList.remove("menu-open");

        });

    });

}

    /* =====================================================
       NAVBAR SCROLL EFFECT
    ===================================================== */

    const navbar = document.querySelector(".navbar");

    if (navbar) {

        const handleNavbarScroll = () => {

            if (window.scrollY > 40) {

                navbar.classList.add("scrolled");

            } else {

                navbar.classList.remove("scrolled");

            }

        };

        window.addEventListener(
            "scroll",
            handleNavbarScroll,
            { passive: true }
        );

        handleNavbarScroll();

    }


    /* =====================================================
       SCROLL REVEAL ANIMATION
    ===================================================== */

    const revealElements =
        document.querySelectorAll(".reveal");


    if (revealElements.length > 0) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(element => {

            revealObserver.observe(element);

        });

    }


    /* =====================================================
       SMOOTH ANCHOR SCROLL
    ===================================================== */

    const anchorLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    anchorLinks.forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");


            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }


            const target =
                document.querySelector(targetId);


            if (!target) {
                return;
            }


            event.preventDefault();


            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       BUTTON RIPPLE EFFECT
    ===================================================== */

    const buttons =
        document.querySelectorAll(".btn");


    buttons.forEach(button => {

        button.addEventListener("click", event => {

            const ripple =
                document.createElement("span");


            ripple.classList.add(
                "button-ripple"
            );


            const rect =
                button.getBoundingClientRect();


            const x =
                event.clientX - rect.left;


            const y =
                event.clientY - rect.top;


            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;


            button.appendChild(ripple);


            setTimeout(() => {

                ripple.remove();

            }, 700);

        });

    });


    /* =====================================================
       PARALLAX ELEMENTS
       
       HTML example:
       <div data-parallax="0.15"></div>
    ===================================================== */

    const parallaxElements =
        document.querySelectorAll(
            "[data-parallax]"
        );


    if (parallaxElements.length > 0) {

        const updateParallax = () => {

            const scrollPosition =
                window.scrollY;


            parallaxElements.forEach(element => {

                const speed =
                    Number(
                        element.dataset.parallax
                    );


                if (Number.isNaN(speed)) {
                    return;
                }


                element.style.transform =
                    `translate3d(0, ${
                        scrollPosition * speed
                    }px, 0)`;

            });

        };


        window.addEventListener(
            "scroll",
            updateParallax,
            { passive: true }
        );

    }


    /* =====================================================
       HOVER TILT CARDS
       
       HTML example:
       <div class="tilt-card"></div>
    ===================================================== */

    const tiltCards =
        document.querySelectorAll(
            ".tilt-card"
        );


    tiltCards.forEach(card => {

        card.addEventListener(
            "mousemove",
            event => {

                const rect =
                    card.getBoundingClientRect();


                const x =
                    event.clientX - rect.left;


                const y =
                    event.clientY - rect.top;


                const centerX =
                    rect.width / 2;


                const centerY =
                    rect.height / 2;


                const rotateX =
                    ((y - centerY) /
                        centerY) * -4;


                const rotateY =
                    ((x - centerX) /
                        centerX) * 4;


                card.style.transform =
                    `perspective(1000px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)
                     translateY(-5px)`;

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                card.style.transform =
                    "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";

            }
        );

    });


    /* =====================================================
       MAGNETIC BUTTONS
       
       Add class:
       class="magnetic"
    ===================================================== */

    const magneticElements =
        document.querySelectorAll(
            ".magnetic"
        );


    magneticElements.forEach(element => {

        element.addEventListener(
            "mousemove",
            event => {

                const rect =
                    element.getBoundingClientRect();


                const x =
                    event.clientX -
                    (rect.left + rect.width / 2);


                const y =
                    event.clientY -
                    (rect.top + rect.height / 2);


                element.style.transform =
                    `translate(${x * 0.08}px, ${
                        y * 0.08
                    }px)`;

            }
        );


        element.addEventListener(
            "mouseleave",
            () => {

                element.style.transform =
                    "translate(0, 0)";

            }
        );

    });


    /* =====================================================
       PAGE LOAD ANIMATION
    ===================================================== */

    window.addEventListener("load", () => {

        document.body.classList.add(
            "page-loaded"
        );

    });


    /* =====================================================
       PASSWORD SHOW / HIDE
       
       This does not store or submit anything.
       
       HTML:
       <button data-password-toggle="password">
       ===================================================== */

    const passwordButtons =
        document.querySelectorAll(
            "[data-password-toggle]"
        );


    passwordButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const inputId =
                    button.dataset.passwordToggle;


                const input =
                    document.getElementById(
                        inputId
                    );


                if (!input) {
                    return;
                }


                if (input.type === "password") {

                    input.type = "text";

                    button.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    input.type = "password";

                    button.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    });


    /* =====================================================
       CURRENT YEAR
       
       HTML:
       <span data-year></span>
       ===================================================== */

    const yearElements =
        document.querySelectorAll(
            "[data-year]"
        );


    yearElements.forEach(element => {

        element.textContent =
            new Date().getFullYear();

    });


});