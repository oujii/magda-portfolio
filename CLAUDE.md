# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a static portfolio website for artist Magda Korotynska built with:
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Framework**: Bootstrap 4.1.3 for responsive grid system
- **Layout**: Masonry grid for portfolio gallery
- **Languages**: Bilingual site (English/Swedish) with `se/` subdirectory for Swedish content
- **Build Tool**: Pinegrow (visual web editor) - see `pinegrow.json` for configuration
- **Structure**: Content-driven site with organized folders for different project types

## File Structure

- `index.html` - Main homepage with portfolio grid
- `se/` - Swedish language version (mirrors main structure)
- `content/` - Media assets organized by category (books, magazines, art, graphic-design, etc.)
- `assets/` - Static assets (images, JS libraries, favicon)
- `style.css` - Main stylesheet with custom styles
- `script.js` - JavaScript for hamburger menu, masonry layout, and smooth scrolling
- `menu.css` - Additional menu-specific styles

## Key Features

### Portfolio Grid System
- Uses Masonry.js for responsive portfolio layout
- Bootstrap grid classes for responsive breakpoints
- Hover cards with project titles
- Grid items link to individual project pages

### Navigation
- Hamburger menu with slide-out navigation
- Fixed header on scroll
- Smooth scrolling between sections
- Language toggle (English/Swedish)

### Content Organization
Projects are categorized into:
- Books (`books-*.html`)
- Maps (`maps.html`)
- Magazines (`magazines-*.html`)
- Graphic Design & Advertising (`ads-*.html`)
- Art (`art.html`)
- Shop items (`shop-*.html`)

### Development
This appears to be a static site with no build process. Files can be edited directly and served via any web server. The user mentioned having `npm run dev` running, suggesting a local development server is available.