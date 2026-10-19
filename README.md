# Golden Healing Solutions LLC — Website

Technology • Business • Career Solutions.

Static website for Golden Healing Solutions LLC, an information technology management
and business operations firm (IT support, website development, operations support,
logistics administration, training). Served from `public/` via Netlify at
https://goldenhealingsolutions.com.

## Pages

- `index.html` — home (hero, six service cards, why-us, CTA)
- `it-management.html` — IT support plans ($149/$299/$599) + cybersecurity plans
- `websites.html` — web development projects (from $150) + maintenance plans ($49/$99/$199)
- `business-operations.html` — admin support, data systems, workflow automation + plans
- `logistics-support.html` — logistics administrative support + plans
- `training-academy.html` — courses and business training (from $19/course)
- `plans.html` — combined monthly plans ($299/$599/$999) + how plans work
- `quote.html` — quote request form (Netlify Forms, name="quote")
- `contact.html` — contact form (Netlify Forms, name="contact")
- `about.html`, `faqs.html`, `privacy.html`, `terms.html`, `404.html`

## Forms (Netlify Forms)

Both forms use `data-netlify="true"` with a honeypot and a hidden `form-name` input.
Submissions land in the Netlify dashboard (Site settings → Forms). To get them by
email, enable **Form notifications → Email notification** in Netlify site settings.

## Logo

The header/footer logo is `public/assets/images/ghs-logo.png`. Because the GitHub
push tool rejects binary files, the logo is stored as base64 text in
`public/assets/images/ghs-logo.png.b64` and decoded to the real PNG by the
`netlify.toml` build command on every deploy. Do not delete the `.b64` file.

## Deploy

Pushes to `main` auto-deploy via Netlify (`netlify.toml`: publish = `public`).
