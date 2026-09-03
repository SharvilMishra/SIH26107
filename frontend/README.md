# ManakAI

The Stitch-exported ManakAI / BIS-Mitra UI kit for the SIH26107 regulatory assistant. The screens are package-free static HTML and retain the attached export's visual and interaction response.

## Run locally

Open `index.html` directly for the complete application entry point, or open `screens/home.html` with the VS Code Live Server extension. No build step or dependency install is required.

## Structure

- `index.html`: structured application entry point that presents the unchanged Stitch Home screen
- `screens/`: the 14 attached Stitch screens plus supporting local screens
- `css/` and `js/`: legacy shared styles and interaction helpers retained for the supporting screens
- `assets/`: reserved folders for exported images, icons, and logos
- `design.md`: ManakAI Authority design system copied from the attached export
- `stitch_comprehensive_ui_ux_web_kit/`: original reference export and blueprint

## Attached screen mapping

`home_manakai` -> `home.html`, `ask_manakai_chat` -> `ask-ai.html`, `verify_product_manakai` -> `verify.html`, `standards_search_manakai` -> `standards-search.html`, `report_a_complaint_manakai` -> `complaint.html`, `research_dashboard_manakai` -> `research-dashboard.html`, `account_settings_manakai` -> `settings.html`, `certification_roadmap_manakai` -> `certification-roadmap.html`, `evidence_viewer_manakai` -> `evidence-viewer.html`, `find_a_testing_laboratory_manakai` -> `laboratory-finder.html`, `msme_compliance_dashboard_manakai` -> `msme-dashboard.html`, `my_grievances_tracking_dashboard` -> `grievances.html`, `standard_details_is_1293_2019` -> `standards-detail.html`, and `verification_history_manakai` -> `verification-history.html`.

The attached export uses Tailwind CDN, Google Fonts, Material Symbols, and its original static markup. Replace its service actions with FastAPI calls when the backend is connected; do not alter the presentation layer while wiring those APIs.
