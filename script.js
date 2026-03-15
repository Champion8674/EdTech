// Global variables
let courseData = null;
let currentLessonIndex = 0;
let allLessons = [];

// DOM elements
const sidebarContent = document.getElementById('sidebar-content');
const lessonContainer = document.getElementById('lesson-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mainLayout = document.querySelector('.main-layout');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navbarMenu = document.getElementById('navbar-menu');

// Initialize the application
async function init() {
    try {
        // Load course data
        const response = await fetch('courseData.json');
        courseData = await response.json();

        // Flatten all lessons for navigation
        allLessons = [];
        courseData.modules.forEach(module => {
            module.lessons.forEach(lesson => {
                allLessons.push({
                    ...lesson,
                    moduleTitle: module.title
                });
            });
        });

        // Build sidebar
        buildSidebar();

        // Load first lesson
        loadLesson(0);

        // Handle initial responsive state
        handleResize();

    } catch (error) {
        console.error('Error loading course data:', error);
        lessonContainer.innerHTML = '<div class="lesson-loading"><p>Error loading course content. Please try again.</p></div>';
    }
}

// Build the sidebar with accordion sections
function buildSidebar() {
    sidebarContent.innerHTML = '';

    courseData.modules.forEach((module, moduleIndex) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'accordion-section';

        const headerBtn = document.createElement('button');
        headerBtn.className = 'accordion-header';
        headerBtn.innerHTML = `
            <span>${module.title}</span>
            <span class="accordion-icon">+</span>
        `;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'accordion-content';

        // Add lessons to the content
        module.lessons.forEach((lesson, lessonIndex) => {
            const globalIndex = getGlobalLessonIndex(moduleIndex, lessonIndex);
            const lessonLink = document.createElement('a');
            lessonLink.href = '#';
            lessonLink.className = 'lesson-item';
            lessonLink.textContent = lesson.title;
            lessonLink.dataset.lessonIndex = globalIndex;

            lessonLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadLesson(globalIndex);
            });

            contentDiv.appendChild(lessonLink);
        });

        headerBtn.addEventListener('click', () => {
            toggleAccordion(contentDiv, headerBtn);
        });

        sectionDiv.appendChild(headerBtn);
        sectionDiv.appendChild(contentDiv);
        sidebarContent.appendChild(sectionDiv);
    });
}

// Toggle accordion section
function toggleAccordion(content, header) {
    const isOpen = content.classList.contains('open');
    const icon = header.querySelector('.accordion-icon');

    if (isOpen) {
        content.classList.remove('open');
        icon.textContent = '+';
    } else {
        content.classList.add('open');
        icon.textContent = '-';
    }
}

// Get global lesson index from module and lesson indices
function getGlobalLessonIndex(moduleIndex, lessonIndex) {
    let globalIndex = 0;
    for (let i = 0; i < moduleIndex; i++) {
        globalIndex += courseData.modules[i].lessons.length;
    }
    return globalIndex + lessonIndex;
}

// Load lesson content
function loadLesson(index) {
    if (index < 0 || index >= allLessons.length) return;

    currentLessonIndex = index;
    const lesson = allLessons[index];

    // Update active lesson in sidebar
    updateActiveLesson(index);

    // Render lesson content
    lessonContainer.innerHTML = `
        <div class="lesson-content-wrapper">
            <h1 class="lesson-title">${lesson.title}</h1>
            <div class="lesson-content">${lesson.content}</div>
        </div>
    `;

    // Update navigation buttons
    updateNavigationButtons();
}

// Update active lesson highlight in sidebar
function updateActiveLesson(activeIndex) {
    // Remove active class from all lessons
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to current lesson
    const activeItem = document.querySelector(`.lesson-item[data-lesson-index="${activeIndex}"]`);
    if (activeItem) {
        activeItem.classList.add('active');

        // Ensure the active lesson's section is expanded
        const section = activeItem.closest('.accordion-section');
        const content = section.querySelector('.accordion-content');
        const header = section.querySelector('.accordion-header');

        if (!content.classList.contains('open')) {
            toggleAccordion(content, header);
        }

        // Scroll active lesson into view
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Update navigation buttons state
function updateNavigationButtons() {
    prevBtn.disabled = currentLessonIndex === 0;
    nextBtn.disabled = currentLessonIndex === allLessons.length - 1;
}

// Navigate to previous lesson
function goToPreviousLesson() {
    if (currentLessonIndex > 0) {
        loadLesson(currentLessonIndex - 1);
    }
}

// Navigate to next lesson
function goToNextLesson() {
    if (currentLessonIndex < allLessons.length - 1) {
        loadLesson(currentLessonIndex + 1);
    }
}

// Toggle sidebar visibility
function toggleSidebar() {
    const isCollapsed = sidebar.classList.contains('collapsed');
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        if (isCollapsed) {
            openSidebar();
        } else {
            closeSidebar();
        }
    } else {
        if (isCollapsed) {
            openSidebar();
        } else {
            closeSidebar();
        }
    }
}

// Open sidebar
function openSidebar() {
    sidebar.classList.remove('collapsed');
    mainLayout.classList.remove('sidebar-collapsed');
    sidebarToggle.classList.add('active');

    if (window.innerWidth <= 768) {
        sidebarOverlay.classList.add('active');
    }
}

// Close sidebar
function closeSidebar() {
    sidebar.classList.add('collapsed');
    mainLayout.classList.add('sidebar-collapsed');
    sidebarToggle.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}

// Handle window resize
function handleResize() {
    if (window.innerWidth > 768) {
        // On desktop, ensure sidebar is visible by default
        openSidebar();
        sidebarOverlay.classList.remove('active');
        closeMobileMenu();
    } else {
        // On mobile, start with sidebar closed
        closeSidebar();
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const isActive = navbarMenu.classList.contains('active');
    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

// Open mobile menu
function openMobileMenu() {
    navbarMenu.classList.add('active');
    mobileMenuToggle.classList.add('active');
}

// Close mobile menu
function closeMobileMenu() {
    navbarMenu.classList.remove('active');
    mobileMenuToggle.classList.remove('active');
}

// Event listeners
prevBtn.addEventListener('click', goToPreviousLesson);
nextBtn.addEventListener('click', goToNextLesson);

// Sidebar toggle functionality
sidebarToggle.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Mobile menu toggle functionality
mobileMenuToggle.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking on a menu item
navbarMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        closeMobileMenu();
    }
});

// Close sidebar when clicking on a lesson (mobile)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && e.target.classList.contains('lesson-item')) {
        closeSidebar();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
        goToPreviousLesson();
    } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
        goToNextLesson();
    }
});

// Handle window resize
window.addEventListener('resize', handleResize);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
